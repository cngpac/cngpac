---
sidebar_position: 1
title: init
---

# cngpac init

Initialize Cngpac for your project. This command scaffolds the configuration file and a CI workflow.

## Usage

```bash
npx cngpac init
```

## What It Does

1. **Detects your GitHub repository** from `package.json`'s `repository` field. If not found, prompts you for the owner and name.
2. **Creates `cngpac.config.ts`** — a pre-configured release pipeline with:
   - Changelog generator (using GitHub API)
   - npm publisher (with provenance)
   - GitHub releaser
3. **Creates `.github/workflows/version.yml`** — a GitHub Actions workflow that triggers on changes to `.changenotes/prepare.json` on the `main` branch.

## Generated Files

| File                            | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `cngpac.config.ts`              | Release pipeline configuration     |
| `.github/workflows/version.yml` | CI workflow for automated releases |

## Package Manager Detection

The command auto-detects your package manager from `npm_config_user_agent` and configures the CI workflow accordingly:

| Package Manager | Install Command                  | Runtime Action          |
| --------------- | -------------------------------- | ----------------------- |
| npm             | `npm ci`                         | `actions/setup-node@v6` |
| pnpm            | `pnpm install --frozen-lockfile` | `actions/setup-node@v6` |
| yarn            | `yarn install --frozen-lockfile` | `actions/setup-node@v6` |
| bun             | `bun install --frozen-lockfile`  | `oven-sh/setup-bun@v2`  |

## Behavior

- If `cngpac.config.ts` already exists, the command **skips** it with a warning instead of overwriting.
- Same for the CI workflow — existing files are never overwritten.

## Example

```
$ npx cngpac init
◇ Initializing Cngpac
│ Detected repository: cngpac/cngpac
✔ Created cngpac.config.ts
✔ Created .github/workflows/version.yml
◇ Cngpac initialized!
```