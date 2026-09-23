# Tilo - Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org).


## 3.1.0 (2026-09-24)

### Added
- **Level strings are typed.** Every place that takes a level (the `level` option and setter, `log()`, `getStream()`, `Tilo.getPriorityOf()`) now accepts the string form too, so `new Tilo({ level: 'debug' })` and `tilo.log('warn', …)` compile in TypeScript. The `level` getter still returns `LogLevel`.
- **`format: null` is typed.** Setting `format` to `null` (option or setter) writes the plain text; this always worked at runtime and now type-checks. The getter still returns `LogFormatFn`.

### Changed
- **Disabled levels cost nothing.** A call below the active level returns before any argument formatting, stack cleaning or `dir()`/`table()`/`trace()` rendering, unless a `log` listener is attached. With a listener the event is emitted exactly as before. Argument getters or `inspect` hooks are no longer run for such dropped logs.
- **chalk 6.** The bundled chalk moves to v6 (it needs Node 22, which tilo already requires). A numeric `FORCE_COLOR` now sets that exact color level.

### Fixed
- **Stack frames without a file path** kept their closing paren only in unstyled output. With styles on, `at foo (native)` printed as `at foo (native`.

### Docs
- The `log` event is documented as it behaves: it fires for levels below the active one, but not while `enabled` is `false`.

### Tooling
- **CI** tests Node 22, 24 and 26 (Node 20 reached end-of-life), upgrades npm to v11 before installing to get around an npm 10.9 resolver crash (npm/cli#9787), and enforces the 100% coverage thresholds.
- **Mutation score is 100%** (was 98%). The break threshold is now 100, and the code that only equivalent mutants could touch is gone.
- A compile-time spec pins the public input types.

## 3.0.0 (2026-06-29)

A modernization release. The logging **API is unchanged** — the breaking changes are packaging and runtime.

### Changed
- **ESM-only.** Tilo now ships as a pure ES module (`"type": "module"`, NodeNext, an `exports` map). CommonJS `require('tilo')` is no longer supported — use `import { Tilo } from 'tilo'`.
- **Node ≥ 22.** The supported range moved up to the current LTS floor (was `>=8`).
- **Dependencies updated** to current majors — `chalk@5` (itself ESM-only), `node-emoji@2`, `table@6`, `ci-info@4`, `fast-safe-stringify@2`.
- **Toolchain modernized** — Biome (lint/format), Vitest + Stryker (test/coverage/mutation), `tsc` build, and GitHub Actions CI replace tslint / jest / docma / Travis.
- **`ok()` badge.** `ok()` now renders a distinct green `OK` badge instead of the blue `INFO` one (it remains an INFO-level alias).

### Removed
- The CommonJS build. (See the migration note above — the only consumer-facing change is `require` → `import`.)
