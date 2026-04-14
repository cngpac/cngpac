---
sidebar_position: 3
title: Quick Start
---

# Quick Start

Set up Cngpac and ship your first release in under a minute.

## Prerequisites

- Node.js >= 24
- A published npm package with a `package.json`
- A GitHub repository

## 1. Initialize

Run the init command from your project root:

```bash npm2yarn
npx cngpac init
```

This creates two files:

| File                            | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `cngpac.config.ts`              | Release pipeline configuration          |
| `.github/workflows/version.yml` | CI workflow triggered by `prepare.json` |

The command auto-detects your GitHub repository from `package.json` and adapts the CI workflow to your package manager (npm, pnpm, yarn, or bun).

## 2. Add a Changenote

Make a code change, then describe it:

```bash
cngpac change
```

You'll be prompted for:

1. **Bump type** — `patch`, `minor`, or `major`
2. **Title** — a short description of the change

This creates a markdown file in `.changenotes/` like:

```
.changenotes/brave-coral-fox.md
```

You can also skip the prompts by passing arguments directly:

```bash
cngpac change minor "feat: add dark mode"
```

:::tip
Edit the generated changenote to add a body if you want more detail in the changelog.
:::

## 3. Commit

Stage your code changes and the changenote, then:

```bash
cngpac commit --push
```

This commits using the changenote title as the commit message and pushes to origin.

## 4. Prepare the Release

Once your PR is merged to `main`, prepare the release:

```bash
cngpac prepare release --push
```

This:

1. Reads all changenotes and calculates the next version
2. Logs the planned version bump (e.g., `1.0.0 → 1.1.0`)
3. Writes `.changenotes/prepare.json`
4. Commits and pushes to trigger CI

## 5. CI Takes Over

The generated GitHub Actions workflow detects `prepare.json` on `main` and runs:

```bash
cngpac version --commit --tag --push --publish --release
```

Your package is now:

- ✅ Version-bumped in `package.json`
- ✅ Changelog generated and saved
- ✅ Tagged and pushed
- ✅ Published to npm
- ✅ Released on GitHub

## What's Next?

- [**CLI Reference**](./cli/index.md) — Learn all available commands and options
- [**Configuration**](./configuration.md) — Customize plugins, formatters, and changelog format