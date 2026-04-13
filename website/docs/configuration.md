---
sidebar_position: 5
title: Configuration
---

# Configuration

Cngpac is configured via a `cngpac.config.ts` file at the root of your project. The config uses `defineConfig` for type safety and autocomplete.

## Minimal Config

```ts
import {
  createChangelogGenerator,
  createGitHubReleaser,
  createNpmPublisher,
  defineConfig,
} from "cngpac";

export default defineConfig({
  package: "package.json",
  repository: {
    owner: "your-org",
    name: "your-repo",
  },
  changelog: {
    generator: createChangelogGenerator({
      githubToken: process.env.GITHUB_TOKEN!,
    }),
  },
  publishers: [createNpmPublisher({ provenance: true })],
  releasers: [createGitHubReleaser({ token: process.env.GITHUB_TOKEN! })],
});
```

## Full Config Reference

### `package`

Path to the `package.json` file relative to the config file.

```ts
package: "package.json";
```

### `repository`

GitHub repository coordinates used by changelog generation and releasers.

```ts
repository: {
  owner: "cngpac",
  name: "cngpac",
}
```

### `changelog`

#### `changelog.generator`

A plugin that generates changelog markdown from changenotes. Use `createChangelogGenerator` for the built-in generator:

```ts
changelog: {
  generator: createChangelogGenerator({
    // Required: GitHub token for commit metadata lookup
    githubToken: process.env.GITHUB_TOKEN!,

    // Optional: custom header format (default: "# {packageName}@{version}")
    headerFormat: "## Release {packageName} v{version}",

    // Optional: custom section labels by bump type
    bumpLabels: {
      major: "Breaking Changes",
      minor: "Features",
      patch: "Bugfixes",
    },

    // Optional: custom repository URL template
    repositoryUrl: "https://github.com/{owner}/{name}",
  }),
}
```

#### `changelog.saver`

A plugin that persists the generated changelog to disk. Use `createChangelogSaver`:

```ts
changelog: {
  // ...generator,
  saver: createChangelogSaver({
    // Static path
    filepath: "./CHANGELOG.md",

    // Or with template variables
    filepath: "changelogs/v{version}.md",

    // Or with a function
    filepath: (bump) => `changelogs/${bump.packageName}-${bump.newVersion}.md`,
  }),
}
```

Template variables:

- `{packageName}` — The package name (scoped names are escaped, e.g. `my-org-my-pkg`)
- `{version}` — The new version string

### `publishers`

An array of publisher plugins that run after git push during the `version` command.

#### `createNpmPublisher`

```ts
publishers: [
  createNpmPublisher({
    // Enable GitHub Actions Provenance / SLSA attestation (default: true)
    provenance: true,

    // Custom npm registry URL (default: https://registry.npmjs.org)
    registry: "https://registry.npmjs.org",

    // Custom publish arguments (e.g. for scoped packages)
    args: ["--access", "public"],

    // Extra environment variables for npm publish
    env: { MY_TOKEN: "..." },
  }),
];
```

### `releasers`

An array of releaser plugins that run after publishers.

#### `createGitHubReleaser`

```ts
releasers: [
  createGitHubReleaser({
    // Required: GitHub token for creating releases
    token: process.env.GITHUB_TOKEN!,
  }),
];
```

The releaser automatically detects pre-releases based on the semver version string and marks the GitHub Release accordingly.

### `formatters`

An array of formatter plugins that run on files created or modified by CLI commands (e.g., `package.json` after version bump, changelogs after generation).

#### `createFormatter`

```ts
formatters: [
  // Format Markdown files with oxfmt
  createFormatter({
    extensions: ["md", "mdx", "json"],
    command: "oxfmt",
  }),
];
```

The formatter automatically augments `PATH` with `node_modules/.bin` so locally installed tools resolve correctly.

### `preStage`

An array of pre-stage plugins that run during the `version` command, before staging dirty files. They can perform side effects and return additional file paths that need to be staged.

```ts
preStage: [
  async ({ versionBump, config, configDir }) => {
    // ... perform side effects (e.g. copy files, generate assets) ...

    // Return any created/modified file paths so they get staged
    return files as unknown as DirtyFileAbsPath[];
  },
];
```

Each plugin receives:

- `versionBump` — The resolved version bump information
- `config` — The full Cngpac config
- `configDir` — Absolute path to the directory containing the config file

Return a single `DirtyFileAbsPath`, an array, or `undefined`.

### `noteNameGenerator`

An optional function that generates unique filenames for changenotes created by the `change` command. By default, Cngpac generates random adjective-noun pairs (e.g. `brave-fox`).

```ts
import { defaultGenerateNoteName } from "cngpac";

noteNameGenerator: () => `note-${Date.now()}`;
```

The function must return a unique string (without file extension) used as the changenote filename.

### `version`

An optional object for customizing the commit message and tag name created during the `version` command.

```ts
version: {
  // Custom commit message (default: "Release {name}@{version}")
  commitMessage: (bump) => `chore(release): ${bump.packageName}@${bump.newVersion}`,

  // Custom tag name (default: "{name}@{version}")
  tagName: (bump) => `v${bump.newVersion}`,
}
```

Both functions receive a `VersionBump` object with properties like `packageName`, `newVersion`, `previousVersion`, and `bumpType`.

## Complete Example

Here's a full production config from the Cngpac project itself:

```ts
import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "glob";
import {
  createChangelogGenerator,
  createChangelogSaver,
  createFormatter,
  createGitHubReleaser,
  createNpmPublisher,
  type DirtyFileAbsPath,
  defineConfig,
} from "cngpac";

export default defineConfig({
  package: "package.json",
  repository: {
    owner: "cngpac",
    name: "cngpac",
  },
  changelog: {
    generator: createChangelogGenerator({
      githubToken: process.env.GITHUB_TOKEN!,
    }),
    saver: createChangelogSaver({
      filepath: "changelogs/v{version}.md",
    }),
  },
  formatters: [createFormatter({ extensions: ["json", "md"], command: "oxfmt" })],
  publishers: [
    createNpmPublisher({
      provenance: true,
    }),
  ],
  releasers: [
    createGitHubReleaser({
      token: process.env.GITHUB_TOKEN!,
    }),
  ],
});
```

## Custom Plugins

All plugin types are exported as TypeScript types that you can implement yourself:

```ts
import type {
  ChangelogGenerator,
  ChangelogSaver,
  PublisherPlugin,
  ReleaserPlugin,
  FormatterPlugin,
  PreStagePlugin,
  NoteNameGenerator,
  VersionPlugin,
} from "cngpac";
```

See [Core Concepts → Plugin Architecture](./concepts.md#plugin-architecture) for details on each plugin type.