# tilo

<p align="center">
  <a href="https://github.com/onury/tilo/actions/workflows/ci.yml"><img src="https://github.com/onury/tilo/actions/workflows/ci.yml/badge.svg" alt="build" /></a>
  <a href="#security--quality"><img src="https://img.shields.io/badge/coverage-100%25-2BB150?logo=vitest&logoColor=%23FDC72B&style=flat" alt="coverage" /></a>
  <a href="https://stryker-mutator.io/"><img src="https://img.shields.io/badge/mutation-98%25-2BB150?style=flat" alt="mutation score" /></a>
  <a href="https://www.npmjs.com/package/tilo"><img src="https://img.shields.io/npm/v/tilo.svg?style=flat&label=&color=%23C6234B&logo=npm" alt="version" /></a>
  <a href="https://gist.github.com/onury/d3f3d765d7db2e8b2d050d14315f2ac7"><img src="https://img.shields.io/badge/ESM-F7DF1E?style=flat" alt="ESM" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TS-3260C7?style=flat" alt="TS" /></a>
  <a href="https://github.com/onury/tilo/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/tilo.svg?style=flat&color=blue" alt="license" /></a>
  <a href="https://onury.io/tilo"><img src="https://img.shields.io/badge/docs-read-c27cf4?style=flat" alt="documentation" /></a>
</p>

> This module is **ESM** 🔆. Please [**read this**](https://gist.github.com/onury/d3f3d765d7db2e8b2d050d14315f2ac7).

**Tiny logger** with styles and levels for Node.js / TypeScript — colorful, leveled output with per-level streams, a custom formatter, safe stringify, tables, traces, and a `log` event.

## Installation

```sh
npm i tilo
```

## Quick Start

```ts
import { Tilo } from 'tilo';

const tilo = new Tilo({ level: 'debug' });
tilo.info('Output colorful logs with date/time and level info.');
```

> [!TIP]
> Read the concise [**API reference**](https://onury.io/tilo).

## Guide

### Formatted output

Provide a custom function that returns a formatted string:

```ts
tilo.format = (info, chalk) => {
  const text = `${info.time} ${info.level.toUpperCase()}\t${info.text}`;
  return info.level === Tilo.Level.ERROR ? chalk.red(text) : chalk.white(text);
};
tilo.info('Custom formatted log…'); // —» 15:30:43 INFO   Custom formatted log…
```

### Safely stringified logs

Log safely-stringified objects (circular references handled). `s()` stringifies one or more values; `sp()` is the pretty/indented variant.

```ts
tilo.info(tilo.s({ key: 'stringify' }));
tilo.warn(tilo.sp({ key: 'stringify pretty' }));
```

### Configuration

Pass an `options` object to the constructor:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether log output is enabled. |
| `level` | `string` | `"debug"` | Logging level — use the `Tilo.Level` enum. |
| `format` | `LogFormatFn` | `Tilo.defaultFormat` | Formatting/styling function. Set to `null` to disable formatting. |
| `styles` | `boolean` | `true` | Whether styles and colors are enabled. |
| `streams` | `ILogLevelStreams \| NodeJS.WriteStream` | `process.stdout` | Per-level write streams; a single stream becomes the default for every level. |
| `cleanStack` | `boolean \| string[]` | `false` | Remove file-path-less stack lines (`true`), or filter stacks by case-sensitive keywords (`string[]`). |

### Log levels & methods

| Level | Priority | Methods | Details |
| --- | --- | --- | --- |
| `ERROR` | `0` | `error()` | Error logs. Always printed. |
| `WARN` | `1` | `warn()` | Warning logs. |
| `INFO` | `2` | `info()` · `ok()` · `plain()` · `table()` | Informational logs. `ok()` is an alias; `plain()` outputs clean unformatted text; `table()` prints a visual table from the given data. |
| `VERBOSE` | `3` | `verbose()` | Verbose logs. |
| `DEBUG` | `4` | `debug()` · `dir()` · `trace()` | Debug logs. `dir()` inspects an object; `trace()` appends a stack trace to the current position. |
| `SILLY` | `5` | `silly()` | Silly logs. |

There's also `log(level, …args)` (defaults to `INFO`), plus `newline()` and `emoji(name)`:

```ts
tilo.log('debug', 'message…');
```

### Log event

`Tilo` is an `EventEmitter` — run custom logic on the `log` event:

```ts
tilo.on('log', (logInfo) => {
  if (logInfo.level === 'error' && /\bfatal/i.test(logInfo.text)) {
    // e.g. send email to admin
  }
});
```

## Security & Quality

100% test coverage (lines/functions/statements/branches) verified by **mutation testing** (Stryker), enforced in CI across Node 20, 22, and 24.

## Documentation

API reference and guides: **[onury.io/tilo](https://onury.io/tilo)**.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Related Projects

- [**meow-styler**](https://github.com/onury/meow-styler) — Colors & formatting for the `meow` CLI app helper.
- [**perfy**](https://github.com/onury/perfy) — Lightweight Node.js utility for measuring code execution in high-resolution real time.

## License

© 2026, Onur Yıldırım. [**MIT**](./LICENSE) License.
