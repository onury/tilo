import { describe, expect, it } from 'vitest';
import { helper } from '../src/helper.js';

/**
 *  Unit tests for the internal `helper` utilities.
 */
describe('helper', () => {
  describe('#type()', () => {
    it('returns the lower-cased internal [[Class]] name', () => {
      expect(helper.type({})).toBe('object');
      expect(helper.type([])).toBe('array');
      expect(helper.type(null)).toBe('null');
      expect(helper.type(undefined)).toBe('undefined');
      expect(helper.type('x')).toBe('string');
      expect(helper.type(5)).toBe('number');
      expect(helper.type(true)).toBe('boolean');
      expect(helper.type(() => {})).toBe('function');
      expect(helper.type(new Date())).toBe('date');
    });
  });

  describe('#isset()', () => {
    it('is false only for null / undefined', () => {
      expect(helper.isset(null)).toBe(false);
      expect(helper.isset(undefined)).toBe(false);
    });

    it('is true for any other value (including falsy)', () => {
      expect(helper.isset(0)).toBe(true);
      expect(helper.isset('')).toBe(true);
      expect(helper.isset(false)).toBe(true);
      expect(helper.isset({})).toBe(true);
    });
  });

  describe('#isWritableObject()', () => {
    it('is true for an object with a write() function', () => {
      expect(helper.isWritableObject({ write() {} })).toBe(true);
    });

    it('is false for a plain object, non-object, or wrong write type', () => {
      expect(helper.isWritableObject({})).toBe(false);
      expect(helper.isWritableObject({ write: 1 })).toBe(false);
      expect(helper.isWritableObject('write')).toBe(false);
      expect(helper.isWritableObject(5)).toBe(false);
      expect(helper.isWritableObject(undefined)).toBe(false);
    });
  });

  describe('#allLevelsWritable()', () => {
    const fullMap = () => {
      const w = { write() {} };
      return {
        error: w,
        warn: w,
        info: w,
        verbose: w,
        debug: w,
        silly: w
      } as any;
    };

    it('is true only when every level maps to a writable object', () => {
      expect(helper.allLevelsWritable(fullMap())).toBe(true);
    });

    it('is false when a single level is missing or not writable', () => {
      const missing = fullMap();
      missing.silly = undefined;
      expect(helper.allLevelsWritable(missing)).toBe(false);

      const bad = fullMap();
      bad.error = {};
      expect(helper.allLevelsWritable(bad)).toBe(false);
    });
  });

  describe('#identityFormat()', () => {
    it('returns the text as-is', () => {
      expect(helper.identityFormat({ text: 'hello' } as any)).toBe('hello');
    });

    it('returns empty string when text is null / undefined', () => {
      expect(helper.identityFormat({ text: null } as any)).toBe('');
      expect(helper.identityFormat({} as any)).toBe('');
    });
  });

  describe('#safeStringify()', () => {
    it('stringifies compactly by default', () => {
      expect(helper.safeStringify({ x: 1 })).toBe('{"x":1}');
    });

    it('pretty-prints with 2-space indentation', () => {
      expect(helper.safeStringify({ x: 1 }, true)).toBe('{\n  "x": 1\n}');
    });

    it('handles circular references without throwing', () => {
      const circular: any = {};
      circular.self = circular;
      const out = helper.safeStringify(circular);
      expect(out).toContain('[Circular]');
    });
  });

  describe('#str()', () => {
    it('stringifies each arg and joins with newlines', () => {
      expect(helper.str([{ x: 1 }, { y: 2 }])).toBe('{"x":1}\n{"y":2}');
    });

    it('pretty-prints each arg when requested', () => {
      expect(helper.str([{ x: 1 }], true)).toBe('{\n  "x": 1\n}');
    });
  });

  describe('#restack()', () => {
    // multi-digit line/column numbers so the `\d+` quantifiers in the file-path
    // detection regex are exercised.
    const stack = [
      'Error: boom',
      '    at foo (/a/b.js:12:34)',
      '    at <anonymous>',
      '    at jestRunner (/x/jest.js:56:78)'
    ].join('\n');

    it('returns non-string input unchanged', () => {
      const obj = { not: 'a string' };
      expect(helper.restack(obj as any, true)).toBe(obj);
      expect(helper.restack(42 as any, true)).toBe(42);
    });

    it('returns the string unchanged when it has no stack lines', () => {
      const s = 'just a plain message';
      expect(helper.restack(s, true)).toBe(s);
    });

    it('drops stack lines that have no file path (cleanStack=true)', () => {
      const out = helper.restack(stack, true);
      // kept frames must be rejoined with newlines (exact reconstruction)
      expect(out).toBe(
        'Error: boom\n    at foo (/a/b.js:12:34)\n    at jestRunner (/x/jest.js:56:78)'
      );
      // the file-less <anonymous> frame is removed
      expect(out).not.toContain('<anonymous>');
    });

    it('keeps multi-digit file frames (regex must match >1 digit positions)', () => {
      // with cleanStack=true the only removal rule is "no file path"; this frame
      // has a 2-digit line and column and must be recognized as a file frame.
      expect(helper.restack('Error\n    at q (/p/r.js:12:34)', true)).toBe(
        'Error\n    at q (/p/r.js:12:34)'
      );
    });

    it('drops frames matching ANY (not all) ignored keywords (cleanStack=string[])', () => {
      // two keywords; the jest frame matches only one of them, so `.some`
      // (not `.every`) must drive the removal.
      const out = helper.restack(stack, ['jest', 'absent-keyword']);
      expect(out).toContain('at foo (/a/b.js:12:34)');
      expect(out).not.toContain('<anonymous>');
      expect(out).not.toContain('jest');
    });

    it('only filters keywords that actually appear after position 0', () => {
      // keyword equals the whole leading frame text → indexOf === 0; the
      // `indexOf(keyword) >= 0` test (not `> 0`) must still treat it as a match.
      const s = 'Error\n    at boom (/a/b.js:12:34)';
      expect(helper.restack(s, ['    at boom'])).toBe('Error');
    });

    it('treats keyword filtering as a no-op when given an empty list (cleanStack=true)', () => {
      // cleanStack=true means filterList is [] — a frame literally containing
      // the Stryker sentinel must NOT be filtered out by keyword logic.
      const s = 'Error\n    at Stryker was here (/a/b.js:12:34)';
      expect(helper.restack(s, true)).toContain('Stryker was here');
    });

    it('strips ONLY the trailing newlines from the message portion', () => {
      // internal newlines in the message must be preserved (anchored `$`).
      const withNewlines = 'Line1\nLine2\n\n    at foo (/a/b.js:12:34)';
      const out = helper.restack(withNewlines, true);
      expect(out).toBe('Line1\nLine2\n    at foo (/a/b.js:12:34)');
    });

    it('handles a stack that begins with a frame (no leading message)', () => {
      const noMessage = '    at foo (/a/b.js:12:34)\n    at <anonymous>';
      // split(...)[0] is empty, so the message portion falls back to ''
      expect(helper.restack(noMessage, true)).toBe('\n    at foo (/a/b.js:12:34)');
    });

    it('returns only the message when every stack line is filtered out', () => {
      const onlyAnon = 'Error: boom\n    at <anonymous>\n    at <anonymous>';
      expect(helper.restack(onlyAnon, true)).toBe('Error: boom');
    });
  });
});
