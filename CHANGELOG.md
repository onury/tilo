# Tilo - Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org).


## 3.0.0 (2026-06-29)

A modernization release. The logging **API is unchanged** — the breaking changes are packaging and runtime.

### Changed
- **ESM-only.** Tilo now ships as a pure ES module (`"type": "module"`, NodeNext, an `exports` map). CommonJS `require('tilo')` is no longer supported — use `import { Tilo } from 'tilo'`.
- **Node ≥ 22.** The supported range moved up to the current LTS floor (was `>=8`).
- **Dependencies updated** to current majors — `chalk@5` (itself ESM-only), `node-emoji@2`, `table@6`, `ci-info@4`, `fast-safe-stringify@2`.
- **Toolchain modernized** — Biome (lint/format), Vitest + Stryker (test/coverage/mutation), `tsc` build, and GitHub Actions CI replace tslint / jest / docma / Travis.

### Removed
- The CommonJS build. (See the migration note above — the only consumer-facing change is `require` → `import`.)
