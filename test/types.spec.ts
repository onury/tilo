import { Writable } from 'node:stream';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ILogOptions } from '../src/index.js';
import { LogLevel, LogPriority, Tilo } from '../src/index.js';

// These checks run at compile time (`npm run typecheck`, part of `npm test`);
// the runtime assertions only prove the literals behave like the enum.

const sink = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  }
});

describe('types', () => {
  describe('level inputs accept the enum and its string literals', () => {
    it('option, setter, log(), getStream() and getPriorityOf()', () => {
      // README: Quick Start
      const tilo = new Tilo({ level: 'debug', streams: sink });
      expect(tilo.level).toBe(LogLevel.DEBUG);

      tilo.level = 'warn';
      expect(tilo.priority).toBe(LogPriority.WARN);
      tilo.level = LogLevel.SILLY;
      expect(tilo.priority).toBe(LogPriority.SILLY);

      // README: Log levels & methods
      tilo.log('debug', 'message…');
      tilo.log(LogLevel.INFO, 'message…');

      expect(tilo.getStream('error')).toBe(sink);
      expect(Tilo.getPriorityOf('verbose')).toBe(LogPriority.VERBOSE);

      // the getter still returns the enum type
      expectTypeOf<Tilo['level']>().toEqualTypeOf<LogLevel>();
      expectTypeOf<ILogOptions['level']>().toEqualTypeOf<LogLevel | `${LogLevel}` | undefined>();
    });

    it('rejects strings that are not a level', () => {
      const bad = (): void => {
        // @ts-expect-error — not a log level
        new Tilo({ level: 'loud' });
      };
      expect(typeof bad).toBe('function');
      // @ts-expect-error — not a log level
      expect(() => Tilo.getPriorityOf('loud')).not.toThrow();
    });
  });
});
