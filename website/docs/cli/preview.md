---
sidebar_position: 7
title: preview
---

# cngpac preview

Generate a changelog preview from your current changenotes and open it in your default browser. This lets you see what the changelog will look like before actually releasing.

## Usage

```bash
cngpac preview
```

## How It Works

1. Reads all changenotes from `.changenotes/`
2. Enriches each changenote with git metadata (commit hash, authors)
3. Reads `package.json` for the package name
4. Calls the **changelog generator** plugin to produce markdown
5. Converts the markdown to HTML using remark and rehype
6. Wraps it in a styled HTML page with a dark theme
7. Writes the HTML to a temporary file
8. Opens it in your default browser

## What It Shows

The preview renders the same changelog content that the [`version`](./version.md) command would generate, including:

- Commit links
- PR references
- Contributor attribution
- Sections grouped by bump type (Major / Minor / Patch)

The version number is shown as `x.x.x` since no `prepare.json` exists yet — this is purely a content preview.

## Prerequisites

- At least one changenote in `.changenotes/`
- A `cngpac.config.ts` with a changelog generator configured

## Example

```bash
cngpac preview
```

```
◇ Generating changelog preview...
│ Found 3 changenote(s)
✔ Changelog markdown generated
✔ Saved preview to /tmp/cngpac-changelog-preview.html
◇ Opened changelog preview in browser!
```

> [!TIP]
> Use `preview` to proofread your changenotes before running `prepare`. It's a great way to catch typos or missing descriptions.