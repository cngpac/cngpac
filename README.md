<p align="center">
  <img src="logo.svg" width="120" alt="cngpac logo" />
</p>

<h1 align="center">cngpac</h1>

<p align="center">
  <strong>A highly configurable package release manager</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/cngpac"><img src="https://img.shields.io/npm/v/cngpac?color=f43f5e&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/cngpac"><img src="https://img.shields.io/npm/dw/cngpac?color=10b981&label=downloads" alt="weekly downloads" /></a>
  <a href="https://github.com/cngpac/cngpac/blob/main/LICENSE"><img src="https://img.shields.io/github/license/cngpac/cngpac?color=06b6d4" alt="license" /></a>
  <a href="https://cngpac.dev"><img src="https://img.shields.io/badge/docs-cngpac.dev-2563eb" alt="docs" /></a>
</p>

<p align="center">
  Automate changelogs, semantic versioning, npm publishing, and GitHub releases — all driven by a single config file and a pluggable pipeline.
</p>

---

## Why cngpac?

Releasing packages involves many error-prone steps: deciding the next version, writing a changelog, bumping `package.json`, tagging, publishing, creating a GitHub release… Each step is a chance for mistakes.

Tools like [Changesets](https://github.com/changesets/changesets) popularized changenote-based workflows but offer limited configurability. Cngpac builds on the same philosophy with **deep configuration** from the ground up — every stage of the pipeline is pluggable and composable.

### What it does

1. **Calculate** the correct semantic version bump from changenotes
2. **Generate** a rich changelog with commit links, PR references, and contributor attribution
3. **Update** `package.json` with the new version
4. **Commit, tag, and push** the release
5. **Publish** to npm (with provenance support)
6. **Create** a GitHub Release

## Quick Start

### Install

```bash
npm install -D cngpac
```

### Initialize

```bash
npx cngpac init
```

This scaffolds two files:

| File                            | Purpose                        |
| ------------------------------- | ------------------------------ |
| `cngpac.config.ts`              | Release pipeline configuration |
| `.github/workflows/version.yml` | CI workflow for releases       |

## Documentation

Full documentation is available at **[cngpac.dev](https://cngpac.dev)**:

- [Introduction](https://cngpac.dev/docs/latest/intro) — Overview and design philosophy
- [Core Concepts](https://cngpac.dev/docs/latest/concepts) — Changenotes, pipeline, and plugins
- [Quick Start](https://cngpac.dev/docs/latest/quick-start) — Get running in under a minute
- [Configuration](https://cngpac.dev/docs/latest/configuration) — Full config reference
- [CLI Reference](https://cngpac.dev/docs/latest/cli) — Every command documented

## License

This project is licensed under the [Apache-2.0](./LICENSE) license.