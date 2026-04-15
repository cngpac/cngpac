---
sidebar_position: 5
title: CLI Reference
---

# CLI Reference

Cngpac provides seven commands that cover the full release lifecycle. This page gives an overview — see the individual command pages for full details.

## Commands at a Glance

| Command                       | Alias    | Description                                            |
| ----------------------------- | -------- | ------------------------------------------------------ |
| [`init`](./init.md)           | —        | Scaffold config and CI workflow                        |
| [`change`](./change.md)       | `cng`    | Add a new changenote                                   |
| [`commit`](./commit.md)       | —        | Commit a staged changenote using its title             |
| [`prepare`](./prepare.md)     | `prep`   | Calculate version and write prepare config             |
| [`version`](./version.md)     | `vrsn`   | Bump version, generate changelog, publish, and release |
| [`reprepare`](./reprepare.md) | `reprep` | Reattempt a failed release                             |
| [`preview`](./preview.md)     | —        | Generate changelog preview and open in browser         |

## Typical Workflow

```bash
# One-time setup
npx cngpac init

# During development (per change)
cngpac change
cngpac commit --push

# When ready to release
cngpac prepare release --push

# CI runs automatically:
# cngpac version --commit --tag --push --publish --release
```

## Global Options

```
--version    Show the CLI version
--help       Show help for any command
```