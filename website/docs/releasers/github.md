---
sidebar_position: 1
title: GitHub
---

# createGitHubReleaser

The built-in GitHub releaser creates a [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) after publishers run during the [`version`](../cli/version.md) command. It uses the generated changelog as the release body and automatically marks pre-releases.

## Import

```ts
import { createGitHubReleaser } from "cngpac";
// or from the dedicated entry point
import { createGitHubReleaser } from "cngpac/releasers/github";
```

## Usage

```ts
export default defineConfig({
  releasers: [
    createGitHubReleaser({
      token: process.env.GITHUB_TOKEN!,
    }),
  ],
});
```

## Options

### `token`

- Type: `string`
- Required: yes

A GitHub personal access token or the built-in Actions `GITHUB_TOKEN` with `contents: write` permission.

In GitHub Actions, use the built-in token:

```yaml
permissions:
  contents: write

steps:
  - run: npx cngpac version --commit --tag --push --publish --release
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### `nameFormat`

- Type: `string`
- Required: no
- Default: `"{packageName}@{version}"`

A template string for the release name. Supports the following variables:

| Variable        | Description                          |
| --------------- | ------------------------------------ |
| `{packageName}` | The package name from `package.json` |
| `{version}`     | The new version being released       |
| `{tagName}`     | The git tag name                     |

```ts
createGitHubReleaser({
  token: process.env.GITHUB_TOKEN!,
  nameFormat: "Release {packageName} v{version}",
});
```

## Release Body

The body of the GitHub Release is the full changelog string produced by your [`changelog.generator`](../configuration.md#changeloggenerator) plugin.

## Pre-release Detection

If the new version contains a pre-release identifier (e.g. `1.3.0-beta.1`), the releaser automatically sets `prerelease: true` on the GitHub Release.