import { Chalk } from 'chalk';
import { describe, expect, it } from 'vitest';
import type { ILogInfo } from '../src/index.js';
import { LogLevel, LogPriority, Tilo } from '../src/index.js';

// A styled chalk instance (forces colors regardless of TTY) and a disabled one.
const styled = new Chalk({ level: 3 });
const plain = new Chalk({ level: 0 });

const ESC = String.fromCharCode(27); // ANSI escape introducer

const DATE = '2024-01-02';
const TIME = '03:04:05';

function makeInfo(over: Partial<ILogInfo> = {}): ILogInfo {
  return {
    level: LogLevel.INFO,
    priority: LogPriority.INFO,
    levelEnabled: true,
    stream: process.stdout,
    timestamp: 0,
    date: DATE,
    time: TIME,
    text: 'hello',
    args: ['hello'],
    method: 'info',
    ...over
  };
}

function stripAnsi(s: string): string {
  return s
    .split(ESC)
    .join('')
    .replace(/\[\d+m/g, '');
}

function hasAnsi(s: string): boolean {
  return s.includes(ESC);
}

describe('Tilo.defaultFormat (DEFAULT_FORMAT_FN)', () => {
  it('is exposed and equals the default format function', () => {
    expect(typeof Tilo.defaultFormat).toBe('function');
    const tilo = new Tilo();
    expect(tilo.format).toBe(Tilo.defaultFormat);
  });

  describe('non-stack output (styled)', () => {
    it('formats an INFO log: gray date, white time, bold blue level, blue message', () => {
      const out = Tilo.defaultFormat(makeInfo({ level: LogLevel.INFO, method: 'info' }), styled);
      const expected =
        styled.gray(DATE) +
        ' ' +
        styled.white(TIME) +
        '  ' +
        styled.bold(styled.blue('INFO ')) +
        '  ' +
        styled.blue('hello') +
        '\n';
      expect(out).toBe(expected);
    });

    it('formats an ERROR log in bold red', () => {
      const out = Tilo.defaultFormat(
        makeInfo({ level: LogLevel.ERROR, method: 'error', text: 'oops', args: ['oops'] }),
        styled
      );
      const expected =
        styled.gray(DATE) +
        ' ' +
        styled.white(TIME) +
        '  ' +
        styled.bold(styled.red('ERROR')) +
        '  ' +
        styled.red('oops') +
        '\n';
      expect(out).toBe(expected);
    });

    it('formats a WARN log in bold yellow', () => {
      const out = Tilo.defaultFormat(
        makeInfo({ level: LogLevel.WARN, method: 'warn', text: 'careful', args: ['careful'] }),
        styled
      );
      expect(out).toContain(styled.bold(styled.yellow('WARN ')));
      expect(out).toContain(styled.yellow('careful'));
    });

    it('formats a DEBUG log in bold magenta', () => {
      const out = Tilo.defaultFormat(
        makeInfo({ level: LogLevel.DEBUG, method: 'debug', text: 'dbg', args: ['dbg'] }),
        styled
      );
      expect(out).toContain(styled.bold(styled.magenta('DEBUG')));
      expect(out).toContain(styled.magenta('dbg'));
    });

    it('does NOT bold a VERBOSE log and uses cyan', () => {
      const out = Tilo.defaultFormat(
        makeInfo({ level: LogLevel.VERBOSE, method: 'verbose', text: 'vvv', args: ['vvv'] }),
        styled
      );
      const expected =
        styled.gray(DATE) +
        ' ' +
        styled.white(TIME) +
        '  ' +
        styled.cyan('VERBO') +
        '  ' +
        styled.cyan('vvv') +
        '\n';
      expect(out).toBe(expected);
      // level label must not be wrapped in bold
      expect(out).not.toContain(styled.bold(styled.cyan('VERBO')));
    });

    it('does NOT bold a SILLY log and uses gray', () => {
      const out = Tilo.defaultFormat(
        makeInfo({ level: LogLevel.SILLY, method: 'silly', text: 'sss', args: ['sss'] }),
        styled
      );
      const expected =
        styled.gray(DATE) +
        ' ' +
        styled.white(TIME) +
        '  ' +
        styled.gray('SILLY') +
        '  ' +
        styled.gray('sss') +
        '\n';
      expect(out).toBe(expected);
    });

    it('colors the message green for the "ok" method while keeping the INFO level label', () => {
      const out = Tilo.defaultFormat(
        makeInfo({ level: LogLevel.INFO, method: 'ok', text: 'done', args: ['done'] }),
        styled
      );
      const expected =
        styled.gray(DATE) +
        ' ' +
        styled.white(TIME) +
        '  ' +
        styled.bold(styled.blue('INFO ')) +
        '  ' +
        styled.green('done') +
        '\n';
      expect(out).toBe(expected);
    });
  });

  describe('non-stack output (disabled chalk)', () => {
    it('emits no ANSI codes', () => {
      const out = Tilo.defaultFormat(makeInfo({ text: 'plainmsg', args: ['plainmsg'] }), plain);
      expect(out).toBe(`${DATE} ${TIME}  INFO   plainmsg\n`);
      expect(hasAnsi(out)).toBe(false);
    });

    it('does NOT special-case a stack string when colors are disabled', () => {
      const text = 'Error: boom\n    at foo (/a/b.js:1:2)';
      const out = Tilo.defaultFormat(makeInfo({ text, args: [text] }), plain);
      // identical to plain meta + text + newline (no per-line reformatting)
      expect(out).toBe(`${DATE} ${TIME}  INFO   ${text}\n`);
    });
  });

  describe('stack output (styled)', () => {
    it('colorizes file/line/column (multi-digit) for frames with a file path', () => {
      // multi-digit line/column numbers ensure the `\d+` quantifiers matter
      const text = 'Error: boom\n    at foo (/a/b.js:12:34)\n    at /c/d.js:56:78';
      const out = Tilo.defaultFormat(
        makeInfo({ level: LogLevel.ERROR, method: 'error', text, args: [text] }),
        styled
      );

      const meta =
        styled.gray(DATE) +
        ' ' +
        styled.white(TIME) +
        '  ' +
        styled.bold(styled.red('ERROR')) +
        '  ';
      const message = styled.red('Error: boom');
      const frame1 =
        '\n' +
        styled.gray('    at foo (/a/') +
        styled.yellow('b.js') +
        ':' +
        styled.white('12') +
        ':' +
        styled.white('34') +
        styled.gray(')');
      const frame2 =
        '\n' +
        styled.gray('    at /c/') +
        styled.yellow('d.js') +
        ':' +
        styled.white('56') +
        ':' +
        styled.white('78') +
        styled.gray('');
      expect(out).toBe(meta + message + frame1 + frame2 + '\n');
    });

    it('leaves file-less frames uncolored (no line info)', () => {
      const text = 'X\n    at <anonymous>';
      const out = Tilo.defaultFormat(makeInfo({ text, args: [text] }), styled);
      const meta =
        styled.gray(DATE) +
        ' ' +
        styled.white(TIME) +
        '  ' +
        styled.bold(styled.blue('INFO ')) +
        '  ';
      const expected = meta + styled.blue('X') + '\n' + styled.gray('    at <anonymous>') + '\n';
      expect(out).toBe(expected);
    });

    it('stripped styled stack output equals the plain rendering of the same log', () => {
      const text = 'Error: boom\n    at foo (/a/b.js:1:2)\n    at /c/d.js:3:4';
      const info = makeInfo({ level: LogLevel.ERROR, method: 'error', text, args: [text] });
      expect(stripAnsi(Tilo.defaultFormat(info, styled))).toBe(Tilo.defaultFormat(info, plain));
    });
  });
});
