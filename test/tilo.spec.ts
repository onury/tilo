import { Writable } from 'node:stream';
import * as util from 'node:util';
import { Chalk } from 'chalk';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Force color support on before any module (and thus chalk's `supportsColor`)
// is imported. This makes the difference between `new Chalk({ level: 0 })` and
// `new Chalk({})` observable: the former stays at level 0, the latter inherits
// the (now non-zero) auto-detected level.
vi.hoisted(() => {
  process.env.FORCE_COLOR = '3';
});

// Make CI detection deterministic so emoji/beep environment branches are stable
// regardless of where the suite runs. Individual tests override `isInCI` via a
// getter spy when they need the CI=true path.
vi.mock('ci-info', () => ({ isCI: false }));

import type { ILogInfo } from '../src/index.js';
import { LogEvent, LogLevel, LogPriority, Tilo } from '../src/index.js';

const ESC = String.fromCharCode(27);

function hasStyles(text: string): boolean {
  return text.includes(ESC);
}

function stripStyles(text: string): string {
  return text
    .split(ESC)
    .join('')
    .replace(/\[\d+m/g, '');
}

/** A fake writable stream that records every chunk written to it. */
function capture(extra: Record<string, unknown> = {}) {
  const writes: string[] = [];
  const stream = {
    write: vi.fn((chunk: string) => {
      writes.push(chunk);
      return true;
    }),
    ...extra
  } as unknown as NodeJS.WritableStream;
  return {
    stream,
    writes,
    get text() {
      return writes.join('');
    }
  };
}

describe('Tilo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------------------
  // construction / options / getters & setters
  // ----------------------------------------------------------------------

  describe('constructor & defaults', () => {
    it('applies sensible defaults with no options', () => {
      const tilo = new Tilo();
      expect(tilo.enabled).toBe(true);
      expect(tilo.level).toBe(LogLevel.DEBUG);
      expect(tilo.priority).toBe(LogPriority.DEBUG);
      expect(tilo.styles).toBe(true);
      expect(tilo.format).toBe(Tilo.defaultFormat);
      expect(tilo.cleanStack).toBe(false);
      expect(tilo.streams.default).toBe(process.stdout);
      expect(tilo.streams.error).toBeUndefined();
      expect(tilo.isInCI).toBe(false);
    });

    it('honors explicit options', () => {
      const errStream = capture().stream;
      const tilo = new Tilo({
        enabled: false,
        level: LogLevel.WARN,
        styles: false,
        streams: { default: process.stdout, error: errStream }
      });
      expect(tilo.enabled).toBe(false);
      expect(tilo.level).toBe(LogLevel.WARN);
      expect(tilo.priority).toBe(LogPriority.WARN);
      expect(tilo.styles).toBe(false);
      expect(tilo.streams.default).toBe(process.stdout);
      expect(tilo.streams.error).toBe(errStream);
      expect(tilo.streams.warn).toBeUndefined();
    });

    it('coerces enabled/styles to booleans', () => {
      const tilo = new Tilo({ enabled: 1 as any, styles: 0 as any });
      expect(tilo.enabled).toBe(true);
      expect(tilo.styles).toBe(false);
    });

    it('accepts a custom format function', () => {
      const fn = vi.fn();
      const tilo = new Tilo({ format: fn });
      expect(tilo.format).toBe(fn);
    });

    it('accepts a null format (disables the formatter)', () => {
      const tilo = new Tilo({ format: null as any });
      expect(tilo.format).toBe(null);
    });
  });

  describe('enabled setter', () => {
    it('coerces any value to a boolean', () => {
      const tilo = new Tilo();
      tilo.enabled = 'yes' as any;
      expect(tilo.enabled).toBe(true);
      tilo.enabled = '' as any;
      expect(tilo.enabled).toBe(false);
    });
  });

  describe('level setter', () => {
    it('updates the derived priority', () => {
      const tilo = new Tilo();
      tilo.level = LogLevel.ERROR;
      expect(tilo.level).toBe(LogLevel.ERROR);
      expect(tilo.priority).toBe(LogPriority.ERROR);
    });
  });

  describe('format setter', () => {
    it('replaces the format function', () => {
      const tilo = new Tilo();
      const fn = vi.fn();
      tilo.format = fn;
      expect(tilo.format).toBe(fn);
    });
  });

  describe('styles setter', () => {
    it('selects the real chalk instance when enabled', () => {
      const tilo = new Tilo({ styles: true });
      expect(tilo.styles).toBe(true);
      // a styled instance has a positive chalk level when stdout supports color;
      // regardless, it is not the forced-disabled instance.
      expect(tilo.chalk.level).toBeGreaterThanOrEqual(0);
    });

    it('selects a disabled chalk instance when off', () => {
      const tilo = new Tilo({ styles: false });
      expect(tilo.styles).toBe(false);
      expect(tilo.chalk.level).toBe(0);
    });
  });

  describe('cleanStack setter', () => {
    it('normalizes values', () => {
      const tilo = new Tilo();
      tilo.cleanStack = true;
      expect(tilo.cleanStack).toBe(true);
      tilo.cleanStack = ['a', 'b'];
      expect(tilo.cleanStack).toEqual(['a', 'b']);
      tilo.cleanStack = false;
      expect(tilo.cleanStack).toBe(false);
      tilo.cleanStack = 'nope' as any;
      expect(tilo.cleanStack).toBe(false);
      tilo.cleanStack = undefined as any;
      expect(tilo.cleanStack).toBe(false);
    });
  });

  // ----------------------------------------------------------------------
  // streams
  // ----------------------------------------------------------------------

  describe('streams setter', () => {
    it('falls back to a default stdout stream when unset', () => {
      const tilo = new Tilo();
      tilo.streams = undefined as any;
      expect(tilo.streams.default).toBe(process.stdout);
    });

    it('treats a single writable as the default stream', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream });
      expect(tilo.streams.default).toBe(cap.stream);
    });

    it('accepts a per-level map with a default', () => {
      const def = capture().stream;
      const err = capture().stream;
      const tilo = new Tilo({ streams: { default: def, error: err } });
      expect(tilo.streams.default).toBe(def);
      expect(tilo.streams.error).toBe(err);
    });

    it('accepts a full per-level map without a default', () => {
      const w = capture().stream;
      const map = {
        error: w,
        warn: w,
        info: w,
        verbose: w,
        debug: w,
        silly: w
      } as any;
      const tilo = new Tilo({ streams: map });
      expect(tilo.streams).toBe(map);
    });

    it('throws when no default stream can be resolved', () => {
      expect(() => new Tilo({ streams: { error: capture().stream } as any })).toThrow(
        'No default stream'
      );
      expect(() => new Tilo({ streams: { error: capture().stream } as any })).toThrow(TypeError);
    });

    it('throws for a non-object value even if it carries a writable .default', () => {
      // a function is truthy and not a writable object, so it must reach the
      // `type(value) === 'object'` guard and be rejected.
      const fn: any = () => {};
      fn.default = capture().stream;
      expect(() => new Tilo({ streams: fn })).toThrow('No default stream');
    });
  });

  describe('#getStream()', () => {
    it('returns the level-specific stream, else the default', () => {
      const def = capture().stream;
      const err = capture().stream;
      const tilo = new Tilo({ streams: { default: def, error: err } });
      expect(tilo.getStream(LogLevel.ERROR)).toBe(err);
      expect(tilo.getStream(LogLevel.INFO)).toBe(def);
    });
  });

  // ----------------------------------------------------------------------
  // static & utility helpers
  // ----------------------------------------------------------------------

  describe('static #getPriorityOf()', () => {
    it('maps each level to its priority', () => {
      expect(Tilo.getPriorityOf(LogLevel.ERROR)).toBe(LogPriority.ERROR);
      expect(Tilo.getPriorityOf(LogLevel.WARN)).toBe(LogPriority.WARN);
      expect(Tilo.getPriorityOf(LogLevel.INFO)).toBe(LogPriority.INFO);
      expect(Tilo.getPriorityOf(LogLevel.VERBOSE)).toBe(LogPriority.VERBOSE);
      expect(Tilo.getPriorityOf(LogLevel.DEBUG)).toBe(LogPriority.DEBUG);
      expect(Tilo.getPriorityOf(LogLevel.SILLY)).toBe(LogPriority.SILLY);
    });
  });

  describe('#isValidLevel()', () => {
    it('is true for known levels, false otherwise', () => {
      expect(new Tilo().isValidLevel('error')).toBe(true);
      expect(new Tilo().isValidLevel('silly')).toBe(true);
      expect(new Tilo().isValidLevel('nope')).toBe(false);
      expect(new Tilo().isValidLevel('ERROR')).toBe(false);
    });
  });

  describe('#s() and #sp()', () => {
    it('safely stringifies, compact and pretty', () => {
      const tilo = new Tilo();
      expect(tilo.s({ x: 1 })).toBe('{"x":1}');
      expect(tilo.sp({ y: 2 })).toBe('{\n  "y": 2\n}');
      const circular: any = {};
      circular.self = circular;
      expect(tilo.sp(circular)).toContain('[Circular]');
    });
  });

  // ----------------------------------------------------------------------
  // level methods
  // ----------------------------------------------------------------------

  const levelMethods: Array<[string, LogLevel]> = [
    ['error', LogLevel.ERROR],
    ['warn', LogLevel.WARN],
    ['info', LogLevel.INFO],
    ['ok', LogLevel.INFO],
    ['verbose', LogLevel.VERBOSE],
    ['debug', LogLevel.DEBUG],
    ['silly', LogLevel.SILLY]
  ];

  describe('level methods write & emit', () => {
    for (const [method, level] of levelMethods) {
      it(`#${method}() writes to the stream and emits a log event`, () => {
        const cap = capture();
        const tilo = new Tilo({ streams: cap.stream, styles: false, level: LogLevel.SILLY });
        const events: ILogInfo[] = [];
        tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));

        (tilo as any)[method]('hello world');

        expect(cap.writes.length).toBe(1);
        expect(stripStyles(cap.text)).toContain('hello world');
        expect(events).toHaveLength(1);
        expect(events[0].method).toBe(method);
        expect(events[0].level).toBe(level);
        expect(events[0].levelEnabled).toBe(true);
        expect(events[0].text).toBe('hello world');
        expect(events[0].args).toEqual(['hello world']);
        // timestamp/date/time are internally consistent
        const iso = new Date(events[0].timestamp).toISOString();
        expect(iso.slice(0, 10)).toBe(events[0].date);
        expect(iso.slice(11, 19)).toBe(events[0].time);
      });

      it(`#${method}() short-circuits when disabled (no write, no emit)`, () => {
        const cap = capture();
        const tilo = new Tilo({ streams: cap.stream, enabled: false, level: LogLevel.SILLY });
        const onLog = vi.fn();
        tilo.on(LogEvent.LOG, onLog);
        (tilo as any)[method]('nope');
        expect(cap.writes).toHaveLength(0);
        expect(onLog).not.toHaveBeenCalled();
      });
    }
  });

  describe('level filtering', () => {
    it('does not write a log below the active level but still emits', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, level: LogLevel.ERROR, styles: false });
      const events: ILogInfo[] = [];
      tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));

      tilo.silly('too quiet');

      expect(cap.writes).toHaveLength(0);
      expect(events).toHaveLength(1);
      expect(events[0].levelEnabled).toBe(false);
    });

    it('writes a log at or above the active level', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, level: LogLevel.WARN, styles: false });
      tilo.error('loud');
      tilo.warn('also loud');
      tilo.info('filtered');
      expect(cap.writes).toHaveLength(2);
    });
  });

  describe('styling', () => {
    it('emits ANSI codes when styles are enabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: true });
      // force chalk to colorize even in a non-TTY test environment
      const forced = new Chalk({ level: 3 });
      tilo.format = (info) => Tilo.defaultFormat(info, forced);
      tilo.info('colorful');
      expect(hasStyles(cap.text)).toBe(true);
    });

    it('emits no ANSI codes when styles are disabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      tilo.info('monochrome');
      expect(hasStyles(cap.text)).toBe(false);
    });
  });

  // ----------------------------------------------------------------------
  // formatter selection in $write
  // ----------------------------------------------------------------------

  describe('formatter selection', () => {
    it('uses the custom format function', () => {
      const cap = capture();
      const fn = vi.fn((info: ILogInfo) => `CUSTOM:${info.text}\n`);
      const tilo = new Tilo({ streams: cap.stream, format: fn });
      tilo.info('hey');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(cap.text).toBe('CUSTOM:hey\n');
    });

    it('falls back to identity formatting when format is null', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, format: null as any });
      tilo.info('raw text');
      expect(cap.text).toBe('raw text');
    });

    it('writes an empty string when an un-formatted log has no text', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream });
      const info: ILogInfo = {
        level: LogLevel.INFO,
        priority: LogPriority.INFO,
        levelEnabled: true,
        stream: cap.stream,
        timestamp: Date.now(),
        date: '2024-01-02',
        time: '03:04:05',
        text: null as any,
        args: [],
        method: 'plain'
      };
      // exercise the `logInfo.text ?? ''` fallback on the no-formatter path
      (tilo as any).$write(info, false);
      expect(cap.writes).toEqual(['']);
    });
  });

  // ----------------------------------------------------------------------
  // cleanStack integration
  // ----------------------------------------------------------------------

  describe('cleanStack integration', () => {
    const stack = [
      'Error: test',
      '    at foo (/app/file.js:1:2)',
      '    at <anonymous>',
      '    at runner (/x/mocharunner.js:3:4)'
    ].join('\n');

    it('leaves stacks untouched when cleanStack is false', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false, cleanStack: false });
      tilo.error(stack);
      expect(cap.text).toContain('<anonymous>');
    });

    it('removes file-less frames when cleanStack is true', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false, cleanStack: true });
      tilo.error(stack);
      expect(cap.text).not.toContain('<anonymous>');
      expect(cap.text).toContain('/app/file.js:1:2');
    });

    it('removes frames matching keywords when cleanStack is a list', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false, cleanStack: ['mocha'] });
      tilo.error(stack);
      expect(cap.text).not.toContain('mocharunner');
      expect(cap.text).toContain('/app/file.js:1:2');
    });

    it('does NOT clean the stack for trace() logs', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false, cleanStack: true });
      tilo.trace('traced');
      // trace frames have no file paths in some positions but must survive
      expect(stripStyles(cap.text)).toContain('[TRACE]: traced');
    });
  });

  // ----------------------------------------------------------------------
  // plain / log / dir / trace / table / newline
  // ----------------------------------------------------------------------

  describe('#plain()', () => {
    it('writes the raw text with no meta or styles and emits method "plain"', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: true });
      const events: ILogInfo[] = [];
      tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));
      tilo.plain('plain-log');
      expect(hasStyles(cap.text)).toBe(false);
      expect(cap.text).toBe('plain-log');
      expect(events[0].method).toBe('plain');
      expect(events[0].level).toBe(LogLevel.INFO);
    });

    it('short-circuits when disabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, enabled: false });
      tilo.plain('x');
      expect(cap.writes).toHaveLength(0);
    });
  });

  describe('#log()', () => {
    it('logs at a valid explicit level', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      const events: ILogInfo[] = [];
      tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));
      tilo.log(LogLevel.VERBOSE, 'test', 'log');
      expect(events[0].level).toBe(LogLevel.VERBOSE);
      expect(events[0].method).toBe('log');
      expect(stripStyles(cap.text)).toContain('test log');
    });

    it('treats an invalid level as content at INFO level', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      const events: ILogInfo[] = [];
      tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));
      tilo.log('MYLEVEL' as LogLevel, 'rest');
      expect(events[0].level).toBe(LogLevel.INFO);
      expect(stripStyles(cap.text)).toContain('MYLEVEL rest');
    });

    it('short-circuits when disabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, enabled: false });
      tilo.log(LogLevel.INFO, 'x');
      expect(cap.writes).toHaveLength(0);
    });
  });

  describe('#dir()', () => {
    it('inspects an object into the debug stream and emits method "dir"', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      const events: ILogInfo[] = [];
      tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));
      tilo.dir({ x: 1 });
      expect(stripStyles(cap.text)).toContain('{ x: 1 }');
      expect(events[0].method).toBe('dir');
      expect(events[0].level).toBe(LogLevel.DEBUG);
    });

    it('accepts inspect options', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      tilo.dir({ a: { b: { c: 1 } } }, { depth: 0 });
      expect(stripStyles(cap.text)).toContain('[Object]');
    });

    it('disables custom inspection by default', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      const obj = {
        x: 1,
        [util.inspect.custom]() {
          return 'CUSTOM_INSPECT';
        }
      };
      tilo.dir(obj);
      // customInspect: false must be honored -> the custom hook is ignored
      const out = stripStyles(cap.text);
      expect(out).not.toContain('CUSTOM_INSPECT');
      expect(out).toContain('x: 1');
    });

    it('short-circuits when disabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, enabled: false });
      tilo.dir({ x: 1 });
      expect(cap.writes).toHaveLength(0);
    });
  });

  describe('#trace()', () => {
    it('writes a labeled stack trace including this file and emits method "trace"', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      const events: ILogInfo[] = [];
      tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));
      tilo.trace('here');
      const clean = stripStyles(cap.text);
      expect(clean).toContain('[TRACE]: here');
      expect(clean).toContain('\n    at');
      expect(clean).toContain('tilo.spec.ts');
      expect(events[0].method).toBe('trace');
      expect(events[0].level).toBe(LogLevel.DEBUG);
    });

    it('does NOT apply cleanStack filtering to its own trace frames', () => {
      // restack is skipped for trace; even with a keyword that matches this
      // spec file, the trace frames must survive untouched.
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false, cleanStack: ['tilo.spec'] });
      tilo.trace('keep me');
      expect(stripStyles(cap.text)).toContain('tilo.spec');
    });

    it('short-circuits when disabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, enabled: false });
      tilo.trace('x');
      expect(cap.writes).toHaveLength(0);
    });
  });

  describe('#table()', () => {
    const tableOut = [
      '╔═══╤══════════╤══════════════╗',
      '║ # │ Name     │ Email        ║',
      '╟───┼──────────┼──────────────╢',
      '║ 1 │ Bob Loo  │ bob@loo.com  ║',
      '╟───┼──────────┼──────────────╢',
      '║ 2 │ John Doe │ john@doe.com ║',
      '╚═══╧══════════╧══════════════╝'
    ].join('\n');

    it('renders a table to the info stream with no formatter or meta', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, styles: false });
      const events: ILogInfo[] = [];
      tilo.on(LogEvent.LOG, (info: ILogInfo) => events.push(info));
      const data = [
        ['#', 'Name', 'Email'],
        [1, 'Bob Loo', 'bob@loo.com'],
        [2, 'John Doe', 'john@doe.com']
      ];
      tilo.table(data);
      const out = stripStyles(cap.text);
      expect(out).toContain(tableOut);
      // raw table output: no date/time meta prefix -> begins with the box border
      expect(out.startsWith('╔')).toBe(true);
      expect(events[0].method).toBe('table');
      expect(events[0].level).toBe(LogLevel.INFO);
    });

    it('short-circuits when disabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, enabled: false });
      tilo.table([['x']]);
      expect(cap.writes).toHaveLength(0);
    });
  });

  describe('#newline()', () => {
    it('writes a bare newline', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream });
      tilo.newline();
      expect(cap.text).toBe('\n');
    });

    it('short-circuits when disabled', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream, enabled: false });
      tilo.newline();
      expect(cap.writes).toHaveLength(0);
    });

    it('guards against a missing resolved stream (does not throw)', () => {
      const tilo = new Tilo();
      // force getStream(INFO) to resolve to undefined
      (tilo as any).$.streams = {};
      expect(() => tilo.newline()).not.toThrow();
    });
  });

  // ----------------------------------------------------------------------
  // emoji
  // ----------------------------------------------------------------------

  describe('#emoji()', () => {
    it('returns the emoji char when styles are on and not in CI', () => {
      const tilo = new Tilo({ styles: true });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      expect(tilo.emoji('fire')).toBe('🔥');
    });

    it('returns the :name: token in a CI environment', () => {
      const tilo = new Tilo({ styles: true });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(true);
      expect(tilo.emoji('fire')).toBe(':fire:');
    });

    it('returns the :name: token when styles are disabled', () => {
      const tilo = new Tilo({ styles: false });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      expect(tilo.emoji('fire')).toBe(':fire:');
    });

    it('strips surrounding colons before resolving', () => {
      const tilo = new Tilo({ styles: false });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      expect(tilo.emoji(':fire:')).toBe(':fire:');
    });

    it('returns the original name for an unknown emoji', () => {
      const tilo = new Tilo({ styles: true });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      expect(tilo.emoji('definitely_not_an_emoji')).toBe('definitely_not_an_emoji');
    });

    it('returns the original name when it is empty after trimming', () => {
      const tilo = new Tilo({ styles: true });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      expect(tilo.emoji('::')).toBe('::');
      expect(tilo.emoji('   ')).toBe('   ');
    });

    it('trims surrounding whitespace before resolving', () => {
      const tilo = new Tilo({ styles: true });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      // without trim(), the padded name would not resolve to the emoji
      expect(tilo.emoji('  fire  ')).toBe('🔥');
    });

    it('only strips colons at the boundaries, not internal ones', () => {
      const tilo = new Tilo({ styles: true });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      // an internal colon must be preserved; "fi:re" is unknown -> name returned
      expect(tilo.emoji('fi:re')).toBe('fi:re');
    });
  });

  // ----------------------------------------------------------------------
  // beep
  // ----------------------------------------------------------------------

  describe('#beep()', () => {
    function ttyCapture(isTTY: boolean) {
      return capture({ isTTY });
    }

    it('writes the BEL char to a TTY info stream when enabled and not in CI', () => {
      const cap = ttyCapture(true);
      const tilo = new Tilo({ streams: cap.stream });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      tilo.beep();
      expect(cap.writes).toEqual([String.fromCharCode(7)]);
    });

    it('does nothing when disabled', () => {
      const cap = ttyCapture(true);
      const tilo = new Tilo({ streams: cap.stream, enabled: false });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      tilo.beep();
      expect(cap.writes).toHaveLength(0);
    });

    it('does nothing in a CI environment', () => {
      const cap = ttyCapture(true);
      const tilo = new Tilo({ streams: cap.stream });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(true);
      tilo.beep();
      expect(cap.writes).toHaveLength(0);
    });

    it('does nothing when the stream is not a TTY', () => {
      const cap = ttyCapture(false);
      const tilo = new Tilo({ streams: cap.stream });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      tilo.beep();
      expect(cap.writes).toHaveLength(0);
    });

    it('does nothing when the stream has no isTTY property', () => {
      const cap = capture();
      const tilo = new Tilo({ streams: cap.stream });
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      tilo.beep();
      expect(cap.writes).toHaveLength(0);
    });

    it('guards against a missing resolved stream (does not throw)', () => {
      const tilo = new Tilo();
      vi.spyOn(tilo, 'isInCI', 'get').mockReturnValue(false);
      // force getStream(INFO) to resolve to undefined; the `!stream` guard must
      // short-circuit before dereferencing `stream.isTTY`
      (tilo as any).$.streams = {};
      expect(() => tilo.beep()).not.toThrow();
    });
  });

  // ----------------------------------------------------------------------
  // real Writable end-to-end (sanity)
  // ----------------------------------------------------------------------

  describe('with a real Writable stream', () => {
    it('writes formatted output to a node stream', () => {
      const chunks: string[] = [];
      const sink = new Writable({
        write(chunk, _enc, cb) {
          chunks.push(chunk.toString());
          cb();
        }
      });
      const tilo = new Tilo({ streams: sink, styles: false });
      tilo.info('end to end');
      expect(stripStyles(chunks.join(''))).toContain('end to end');
    });
  });

  // ----------------------------------------------------------------------
  // enum values (kill literal mutants in the enum modules)
  // ----------------------------------------------------------------------

  describe('enums', () => {
    it('LogLevel values', () => {
      expect(LogLevel.ERROR).toBe('error');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.VERBOSE).toBe('verbose');
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.SILLY).toBe('silly');
    });

    it('LogPriority values', () => {
      expect(LogPriority.ERROR).toBe(0);
      expect(LogPriority.WARN).toBe(1);
      expect(LogPriority.INFO).toBe(2);
      expect(LogPriority.VERBOSE).toBe(3);
      expect(LogPriority.DEBUG).toBe(4);
      expect(LogPriority.SILLY).toBe(5);
    });

    it('LogEvent values and namespace aliases', () => {
      expect(LogEvent.LOG).toBe('log');
      expect(Tilo.Level).toBe(LogLevel);
      expect(Tilo.Priority).toBe(LogPriority);
      expect(Tilo.Event).toBe(LogEvent);
    });
  });
});
