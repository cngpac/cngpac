---
sidebar_position: 6
title: reprepare
---

# cngpac reprepare

Increment the attempt counter in `prepare.json` and optionally commit and push. This is used to retry a failed CI release without changing the target version.

## Usage

```bash
npx cngpac reprepare [options]
```

**Alias:** `reprep`

## Options

| Option     | Description                                          |
| ---------- | ---------------------------------------------------- |
| `--commit` | Commit the updated prepare config                    |
| `--push`   | Push to origin after committing (implies `--commit`) |

## How It Works

1. Reads the existing `.changenotes/prepare.json`
2. Increments the `attempt` counter (e.g., `1` → `2`)
3. Writes the updated file
4. Optionally commits with message: `chore: prepare 1.3.0 (attempt 2)`
5. Optionally pushes to origin

## Why?

If a CI release fails (e.g., npm is down, a test flakes), you don't want to recalculate the version or re-create `prepare.json`. Instead, `reprepare` bumps the attempt counter, which triggers the CI workflow again since `prepare.json` changed on `main`.

## Prerequisites

A `prepare.json` file must already exist. If not, the command exits with:

```
✖ No prepare.json found. Run `cngpac prepare` first.
```

## Example

```bash
# CI failed — retry the release
npx cngpac reprepare --push
```

```
◇ Preparing new reprepare
✔ Updated prepare config (attempt: 2): .changenotes/prepare.json
✔ Committed: chore: prepare 1.3.0 (attempt 2)
✔ Pushed to origin
◇ Done. Prepared for attempt 2.
```