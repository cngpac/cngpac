---
sidebar_position: 5
title: version
---

# cngpac version

The core release command. Reads the prepare config, consumes all changenotes, bumps the package version, generates a changelog, and optionally commits, tags, pushes, publishes, and creates a GitHub release.

This command is typically run by CI, not manually.

## Usage

```bash
cngpac version [options]
```

**Alias:** `vrsn`

## Options

Each option implies the ones above it in the chain:

| Option      | Description                                 | Implies             |
| ----------- | ------------------------------------------- | ------------------- |
| `--commit`  | Create a git commit with a release message  | —                   |
| `--tag`     | Create a git tag                            | `--commit`          |
| `--push`    | Push commit and tag to origin               | `--commit`, `--tag` |
| `--publish` | Run publisher plugins (e.g., npm publish)   | `--push`            |
| `--release` | Run releaser plugins (e.g., GitHub Release) | `--push`            |

## How It Works

The command runs through these steps sequentially:

### 1. Read Prepare Config

Reads `.changenotes/prepare.json` (created by [`prepare`](./prepare.md)). Exits early if not found.

### 2. Enrich Changenotes

For each changenote in `.changenotes/`:

- Looks up the git commit that introduced the file
- Extracts all authors from the file's git history

### 3. Bump Version

Updates the `version` field in `package.json` to the version specified in `prepare.json`.

### 4. Generate Changelog

Calls the **changelog generator** plugin with the version bump and enriched changenotes. The built-in generator produces markdown with:

- Commit links
- PR references (extracted from commit messages like `(#123)`)
- Contributor attribution (GitHub username or git author fallback)
- Sections grouped by bump type

### 5. Save Changelog

If a **changelog saver** plugin is configured, calls it with the generated markdown.

### 6. Clean Up

- Deletes all consumed changenote files
- Deletes `prepare.json`

### 7. Format

Runs **formatter** plugins on all created, modified, or deleted file paths.

### 8. Git Operations (with `--commit`, `--tag`, `--push`)

```
commit: "Release my-package@1.3.0"
tag:    "my-package@1.3.0"
push:   commit + tags to origin
```

The commit message and tag name can be customized via the [`version`](../configuration.md#version) config option.

### 9. Publish (with `--publish`)

Runs each **publisher** plugin. The built-in npm publisher runs `npm pack` followed by `npm publish`.

### 10. Release (with `--release`)

Runs each **releaser** plugin. The built-in GitHub releaser creates a GitHub Release with the changelog as the body. Pre-releases are automatically detected from the semver string.

## Typical CI Usage

```bash
cngpac version --commit --tag --push --publish --release
```

This is the command used in the generated `.github/workflows/version.yml`.

## Prerequisites

- A `prepare.json` file must exist (created by [`prepare`](./prepare.md))
- At least one changenote in `.changenotes/`