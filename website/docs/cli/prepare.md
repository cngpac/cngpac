---
sidebar_position: 4
title: prepare
---

# cngpac prepare

Calculate the next version based on changenotes and write a `prepare.json` file that signals CI to perform the release.

## Usage

```bash
cngpac prepare <type> [tag] [options]
```

**Alias:** `prep`

## Arguments

| Argument | Required | Description                                                   |
| -------- | -------- | ------------------------------------------------------------- |
| `type`   | Yes      | Release type (see table below)                                |
| `tag`    | No       | Pre-release tag (e.g., `alpha`, `beta`). Defaults to `alpha`. |

### Release Types

| Type         | Description                   | Example                           |
| ------------ | ----------------------------- | --------------------------------- |
| `release`    | Stable release                | `1.2.3` → `1.3.0`                 |
| `prerelease` | Increment pre-release counter | `1.3.0-alpha.1` → `1.3.0-alpha.2` |
| `prepatch`   | Pre-release patch             | `1.2.3` → `1.2.4-alpha.1`         |
| `preminor`   | Pre-release minor             | `1.2.3` → `1.3.0-alpha.1`         |
| `premajor`   | Pre-release major             | `1.2.3` → `2.0.0-alpha.1`         |

## Options

| Option     | Description                                          |
| ---------- | ---------------------------------------------------- |
| `--commit` | Commit the prepare config after writing it           |
| `--push`   | Push to origin after committing (implies `--commit`) |

## How It Works

1. Loads `cngpac.config.ts` to find the package path
2. Reads all changenotes from `.changenotes/`
3. Calculates the semantic version bump based on the highest `bump` field across all changenotes
4. Applies the release type (stable or pre-release with tag)
5. Prompts for confirmation: `Prepare my-package: 1.2.3 → 1.3.0 ?`
6. Writes `.changenotes/prepare.json` with the target version
7. Runs formatter plugins on the created file
8. Optionally commits and pushes

## The `prepare.json` File

```json
{
  "newVersion": "1.3.0",
  "attempt": 1
}
```

| Field        | Description                                                               |
| ------------ | ------------------------------------------------------------------------- |
| `newVersion` | The target version for the release                                        |
| `attempt`    | Attempt counter (incremented by [`reprepare`](./reprepare.md) on retries) |

## Examples

### Stable release

```bash
cngpac prepare release --push
```

### Beta pre-release

```bash
cngpac prepare prerelease beta --push
```

### Release prep without pushing

```bash
cngpac prepare release
```

## CI Trigger

The generated CI workflow (`.github/workflows/version.yml`) watches for changes to `.changenotes/prepare.json` on the `main` branch. Pushing this file triggers the automated versioning pipeline.