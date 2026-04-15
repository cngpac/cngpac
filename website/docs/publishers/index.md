---
sidebar_position: 6
title: Publishers
---

# Publishers

Publisher plugins run after git push during the [`version`](../cli/version.md) command. Use them to publish your package to a registry or any other distribution channel.

## Built-in Publishers

| Plugin                           | Description                 |
| -------------------------------- | --------------------------- |
| [`createNpmPublisher`](./npm.md) | Publish to the npm registry |

## Custom Publishers

You can write your own publisher by implementing the `PublisherPlugin` type:

```ts
import type { PublisherPlugin } from "cngpac";

const myPublisher: PublisherPlugin = async ({ pkgJsonPath, versionBump }) => {
  // ...publish logic...
};
```

A publisher receives:

| Property      | Type             | Description                     |
| ------------- | ---------------- | ------------------------------- |
| `pkgJsonPath` | `PkgFileAbsPath` | Absolute path to `package.json` |
| `versionBump` | `VersionBump`    | Version bump information        |

Register it in your config:

```ts
export default defineConfig({
  // ...
  publishers: [myPublisher],
});
```