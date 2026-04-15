---
sidebar_position: 7
title: Releasers
---

# Releasers

Releaser plugins run after publishers during the [`version`](../cli/version.md) command. Use them to create a release entry on a platform such as GitHub.

## Built-in Releasers

| Plugin                                | Description             |
| ------------------------------------- | ----------------------- |
| [`createGitHubReleaser`](./github.md) | Create a GitHub Release |

## Custom Releasers

You can write your own releaser by implementing the `ReleaserPlugin` type:

```ts
import type { ReleaserPlugin } from "cngpac";

const myReleaser: ReleaserPlugin = async ({ versionBump, changelog, tagName, config }) => {
  // ...release logic...
};
```

A releaser receives:

| Property      | Type           | Description                      |
| ------------- | -------------- | -------------------------------- |
| `versionBump` | `VersionBump`  | Version bump information         |
| `changelog`   | `string`       | The generated changelog markdown |
| `tagName`     | `string`       | The git tag name                 |
| `config`      | `CngpacConfig` | The full Cngpac config           |

Register it in your config:

```ts
export default defineConfig({
  // ...
  releasers: [myReleaser],
});
```