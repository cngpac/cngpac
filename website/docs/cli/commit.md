---
sidebar_position: 3
title: commit
---

# cngpac commit

Commit a staged changenote using its title as the git commit message.

## Usage

```bash
npx cngpac commit [options]
```

## Options

| Option   | Description                       |
| -------- | --------------------------------- |
| `--push` | Push to `origin` after committing |

## How It Works

1. Scans the git index for staged files matching `.changenotes/*.md`
2. Verifies there are no **unstaged** changenote files (exits with an error if found)
3. Parses the changenote to extract its title
4. Creates a git commit with the title as the commit message
5. Optionally pushes to origin with upstream tracking

## Validation Rules

| Condition                   | Behavior                                         |
| --------------------------- | ------------------------------------------------ |
| No staged changenotes       | Error: "No staged changenote files found"        |
| Unstaged changenotes exist  | Error: "Stage or discard them before committing" |
| Multiple staged changenotes | Warning: uses the first one                      |

## Examples

### Commit only

```bash
npx cngpac commit
```

```
◇ Commiting → .changenotes/brave-coral-fox.md
◇ Committed → feat: add dark mode support → feature/dark-mode
```

### Commit and push

```bash
npx cngpac commit --push
```

```
◇ Commiting → .changenotes/brave-coral-fox.md
◇ Committed → feat: add dark mode support → feature/dark-mode
◇ Pushing → feature/dark-mode → origin/feature/dark-mode
◇ Pushed → feature/dark-mode → origin/feature/dark-mode
```