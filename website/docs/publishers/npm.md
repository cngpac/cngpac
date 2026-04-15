---
sidebar_position: 1
title: npm
---

# createNpmPublisher

The built-in npm publisher runs `npm publish` after a successful git push during the [`version`](../cli/version.md) command. It supports GitHub Actions Provenance (SLSA attestation), custom registries, and automatic pre-release tagging.

## Import

```ts
import { createNpmPublisher } from "cngpac";
// or from the dedicated entry point
import { createNpmPublisher } from "cngpac/publishers/npm";
```

## Usage

```ts
export default defineConfig({
  publishers: [
    createNpmPublisher({
      provenance: true,
    }),
  ],
});
```

## Options

### `provenance`

- Type: `boolean`
- Default: `true`

Passes `--provenance` to `npm publish`, enabling [GitHub Actions Provenance](https://docs.npmjs.com/generating-provenance-statements) (SLSA attestation) for signed releases. Only works in a GitHub Actions environment with the appropriate `id-token` permission.

```yaml
permissions:
  contents: write
  id-token: write
```

### `registry`

- Type: `string`
- Default: `https://registry.npmjs.org`

Custom npm registry URL. Useful for publishing to private registries or GitHub Packages.

```ts
createNpmPublisher({
  registry: "https://npm.pkg.github.com",
});
```

### `args`

- Type: `string[]`
- Default: `[]`

Extra arguments appended to the `npm publish` command. Useful for scoped packages that require `--access public`.

```ts
createNpmPublisher({
  args: ["--access", "public"],
});
```

### `env`

- Type: `Record<string, string>`
- Default: `{}`

Extra environment variables passed to the `npm publish` process. Useful for injecting auth tokens.

```ts
createNpmPublisher({
  env: { NODE_AUTH_TOKEN: process.env.NPM_TOKEN! },
});
```

## Pre-release Tagging

When the new version contains a pre-release identifier (e.g. `1.3.0-beta.1`), the publisher automatically adds `--tag <identifier>` to `npm publish`. This prevents the pre-release from being promoted to the `latest` dist-tag on npm.

## Full Example

```ts
createNpmPublisher({
  provenance: true,
  registry: "https://registry.npmjs.org",
  args: ["--access", "public"],
  env: { NODE_AUTH_TOKEN: process.env.NPM_TOKEN! },
});
```