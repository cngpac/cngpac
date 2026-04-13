---
sidebar_position: 2
title: Core Concepts
---

# Core Concepts

This page explains the key ideas behind Cngpac: **changenotes**, the **versioning pipeline**, and the **plugin architecture**.

## Changenotes

A changenote is a small markdown file stored in the `.changenotes/` directory at the root of your project. Each changenote describes a single change and specifies its semantic impact.

### Format

```markdown
---
bump: minor
---

# feat: add dark mode support

Added a new dark mode toggle to the settings page. Users can now
switch between light and dark themes.
```

A changenote has three parts:

| Part            | Description                                                                    |
| --------------- | ------------------------------------------------------------------------------ |
| **Frontmatter** | YAML block with a `bump` field — one of `patch`, `minor`, or `major`           |
| **Title**       | The heading line (`# ...`) — used as the git commit message by `cngpac commit` |
| **Body**        | Optional description included in the generated changelog                       |

### Naming

Changenotes are automatically given human-readable random IDs like `noble-sage-jay.md` or `brave-coral-fox.md`. This avoids merge conflicts when multiple contributors add changenotes to the same branch.

### Bump Types

| Bump    | When to use                         | Example                      |
| ------- | ----------------------------------- | ---------------------------- |
| `patch` | Bug fixes, docs, refactors          | Fix a typo in error messages |
| `minor` | New features (backwards compatible) | Add a new CLI command        |
| `major` | Breaking changes                    | Rename a config option       |

The highest bump across all changenotes determines the version increment. If you have five `patch` notes and one `minor` note, the release will be a **minor** bump.

## The Versioning Pipeline

Cngpac's release flow has four phases:

### 1. Setup

Run `cngpac init` once to scaffold:

- A `cngpac.config.ts` config file
- A `.github/workflows/version.yml` CI workflow

### 2. Development

For each change that deserves a changelog entry:

1. **`cngpac change`** — Interactively create a changenote file
2. **`cngpac commit`** — Stage and commit the changenote using its title as the commit message
3. Push and merge your PR as usual

### 3. Release Prep

When ready to release:

1. **`cngpac prepare release`** — Reads all changenotes, calculates the next semantic version, and writes a `prepare.json` file
2. Push `prepare.json` to the `main` branch — this triggers the CI workflow

For pre-releases, use `prepare prerelease`, `prepatch`, `preminor`, or `premajor` with an optional tag:

```bash
cngpac prepare prerelease beta        # e.g., 1.3.0-beta.1
```

### 4. CI / Automated

The CI workflow runs:

```bash
cngpac version --commit --tag --push --publish --release
```

This command:

1. Reads `prepare.json` for the target version
2. Bumps `package.json`
3. Generates a changelog via the **changelog generator** plugin
4. Saves it via the **changelog saver** plugin (if configured)
5. Deletes all consumed changenote files and `prepare.json`
6. Runs **formatters** on changed files
7. Commits, tags, and pushes
8. Runs **publisher** plugins (e.g., npm publish)
9. Runs **releaser** plugins (e.g., GitHub Release)

## Plugin Architecture

Cngpac is built around plugin system. Each plugin is a simple function you configure in `cngpac.config.ts`:

### Changelog Generator

Generates changelog markdown from changenotes. The built-in generator (`createChangelogGenerator`) fetches GitHub commit metadata and produces a rich changelog with commit links, PR references, and contributor mentions.

### Changelog Saver

Persists the generated changelog to disk. The built-in saver (`createChangelogSaver`) supports template variables in the filepath:

```ts
createChangelogSaver({ filepath: "changelogs/v{version}.md" });
```

### Publisher

Runs after git push. The built-in npm publisher (`createNpmPublisher`) publishes to the npm registry with optional provenance attestation.

### Releaser

Runs after publishers. The built-in GitHub releaser (`createGitHubReleaser`) creates a GitHub Release with the changelog as the body.

### Formatter

Formats files created or modified by CLI commands. The built-in formatter (`createFormatter`) delegates to any external tool:

```ts
createFormatter({ extensions: ["json", "md"], command: "oxfmt" });
```

### Version

Customizes the commit message and tag name produced by the `version` command. By default, Cngpac uses `Release {name}@{version}` for commits and `{name}@{version}` for tags. Override either or both via the `version` config option:

```ts
version: {
  commitMessage: (bump) => `chore(release): ${bump.packageName}@${bump.newVersion}`,
  tagName: (bump) => `v${bump.newVersion}`,
}
```

---

**Next:** [Quick Start →](./quick-start.md)