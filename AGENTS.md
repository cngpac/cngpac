# Agent Instructions for This Codebase

## Table of Contents

1. Overview
2. Usage
3. Core Concepts
4. Project Structure
5. Development Workflow
6. Testing Guide
7. Documentation
8. Best Practices
9. Guides

---

## 1. Overview

This is **cngpac**. A highly configurable package release manager. It automates tracking changes, changelog generation, versioning, npm publishing, and GitHub releases through a plugin-based pipeline.

- **Language**: TypeScript
- **Runtime**: Node.js >= 24.14.0
- **Package manager**: pnpm
- **License**: Apache-2.0
- **Repository**: `github.com/cngpac/cngpac`
- **Website**: Docusaurus (https://cngpac.dev)

The project ships both a **library** (public API with plugin creators and utilities) and a **CLI** (`cngpac` binary) built separately.

---

## 2. Usage

How this project is supposed to be used in practice.

### Installation

```sh
# Run directly via npx
npx cngpac <command>

# Or install as a dev dependency
npm install -D cngpac
```

### Setup

Initialize a project with the config file and CI workflow:

```sh
npx cngpac init
```

This creates `cngpac.config.ts` and `.github/workflows/version.yml`.

### Configuration

Create or edit `cngpac.config.ts` at the project root:

```ts
import {
  createChangelogGenerator,
  createChangelogSaver,
  createFormatter,
  createGitHubReleaser,
  createNpmPublisher,
  defineConfig,
} from "cngpac";

export default defineConfig({
  package: "package.json",
  repository: { owner: "repo-owner", name: "repo-name" },
  changelog: {
    generator: createChangelogGenerator({
      githubToken: process.env.GITHUB_TOKEN!,
    }),
  },
  formatters: [createFormatter({ extensions: ["json", "md"], command: "oxfmt" })],
  publishers: [createNpmPublisher({ provenance: true })],
  releasers: [createGitHubReleaser({ token: process.env.GITHUB_TOKEN! })],
});
```

### CLI Commands

| Command                 | Alias    | Description                                            |
| ----------------------- | -------- | ------------------------------------------------------ |
| `init`                  | —        | Scaffold config and CI workflow                        |
| `change [bump] [title]` | `cng`    | Add a new changenote                                   |
| `commit [--push]`       | —        | Commit a staged changenote using its title             |
| `preview`               | —        | Generate changelog preview and open in browser         |
| `prepare <type> [tag]`  | `prep`   | Calculate version bump and write `prepare.json`        |
| `reprepare [--commit]`  | `reprep` | Increment attempt counter for a failed release retry   |
| `version [flags]`       | `vrsn`   | Bump version, generate changelog, publish, and release |

### Typical Workflow

```sh
# 1. Make a code change, then describe it
npx cngpac change minor "feat: add dark mode"

# 2. Stage your files and commit with the changenote title
npx cngpac commit --push

# 3. When ready to release, prepare the version bump
npx cngpac prepare release --push

# 4. CI automatically runs on main:
#    npx cngpac version --commit --tag --push --publish --release
```

### Library API

The package also exports its internals for programmatic use:

```ts
// Main entry — config helper, parsers, plugin creators
import { defineConfig, createChangelogGenerator } from "cngpac";

// Standalone publisher/releaser imports
import { createNpmPublisher } from "cngpac/publishers/npm";
import { createGitHubReleaser } from "cngpac/releasers/github";
```

---

## 3. Core Concepts

### Release Pipeline

The workflow is a four-phase sequential pipeline:

1. **Development**: `change` → creates a changenote in `.changenotes/`
2. **Commit**: `commit` → commits the staged changenote using its title as the message
3. **Prepare**: `prepare` → calculates the version bump from all changenotes and writes `.changenotes/prepare.json`
4. **Version (CI)**: `version` → applies the bump, generates changelog, publishes, and releases

### Changenotes

Individual markdown files in `.changenotes/` with YAML frontmatter:

```markdown
---
bump: minor
---

# My change title

Optional body with details.
```

- Frontmatter must contain a `bump` field: `"major"`, `"minor"`, or `"patch"`
- File names are randomly generated (e.g., `brave-azure-fox.md`) or customizable via `changenote.nameGenerator`
- Consumed (deleted) during the `version` command

### Plugin Architecture

Every stage of the pipeline is extensible via `CngpacConfig`:

| Plugin Type          | Signature                                                  | Purpose                         |
| -------------------- | ---------------------------------------------------------- | ------------------------------- |
| `ChangelogGenerator` | `(bump, changenotes[], config) => Promise<string>`         | Generate changelog markdown     |
| `ChangelogSaver`     | `(props) => Promise<DirtyFileAbsPath \| ... \| undefined>` | Save changelog in the codebase  |
| `PublisherPlugin`    | `(props) => Promise<void> \| void`                         | Publish package (e.g., npm)     |
| `ReleaserPlugin`     | `(props) => Promise<void> \| void`                         | Create release (e.g., GitHub)   |
| `PreStagePlugin`     | `(props) => Promise<DirtyFileAbsPath \| ... \| undefined>` | Run before git staging          |
| `FormatterPlugin`    | `{ extensions, format(filePaths, rootDir) }`               | Format dirty files before stage |
| `NoteNameGenerator`  | `() => string`                                             | Custom changenote file naming   |

### Branded Types

The codebase uses branded types for path safety:

- `PkgFileAbsPath` — absolute path to a `package.json`
- `DirtyFileAbsPath` — absolute path to a file modified during the pipeline

### Configuration

The config file is `cngpac.config.ts` (ESM, default export). The main interface:

```ts
interface CngpacConfig {
  package: string; // path to package.json
  repository: { owner; name }; // GitHub owner/repo
  changelog: { generator; saver? }; // changelog plugins
  preStage?: PreStagePlugin[];
  formatters?: FormatterPlugin[];
  publishers?: PublisherPlugin[];
  releasers?: ReleaserPlugin[];
  changenote?: { nameGenerator?: NoteNameGenerator }; // changenote plugins
}
```

---

## 4. Project Structure

```
├── src/                        # Library source
│   ├── index.ts                # Public API re-exports
│   ├── types.ts                # All type definitions
│   ├── const.ts                # Constants (CONFIG_FILE_NAME, etc.)
│   ├── changelog.ts            # Changelog generator plugin
│   ├── changenote.ts           # Changenote parsing, serialization, I/O
│   ├── formatter.ts            # Formatter plugin creator
│   ├── git.ts                  # Git operations (simple-git wrapper)
│   ├── pkg.ts                  # package.json read/write
│   ├── prepare.ts              # Version bump calculation (semver)
│   ├── saver.ts                # Changelog saver plugin
│   ├── utils.ts                # Config loader, escaping, indentation
│   ├── version.ts              # Version application, changenote consumption
│   ├── cli/                    # CLI source (separate build)
│   │   ├── index.ts            # Commander program setup
│   │   ├── templates           # Embedded CLI template data
│   │   ├── tsconfig.json       # CLI-specific TS config
│   │   ├── tsdown.config.ts    # CLI build config → dist/bin.mjs
│   │   └── commands/           # One file per CLI command
│   │       ├── change.ts       # `change` (alias: cng)
│   │       ├── commit.ts       # `commit`
│   │       ├── init.ts         # `init`
│   │       ├── prepare.ts      # `prepare` (alias: prep)
│   │       ├── preview.ts      # `preview`
│   │       ├── reprepare.ts    # `reprepare` (alias: reprep)
│   │       └── version.ts      # `version` (alias: vrsn)
│   ├── publishers/
│   │   └── npm.ts              # npm publish plugin
│   └── releasers/
│       └── github.ts           # GitHub release plugin
├── tests/
│   ├── cli/                    # One test file per CLI command
│   │   ├── change.test.ts
│   │   ├── commit.test.ts
│   │   ├── init.test.ts
│   │   ├── prepare.test.ts
│   │   ├── preview.test.ts
│   │   ├── reprepare.test.ts
│   │   └── version.test.ts
│   └── helpers/
│       ├── fixtures.ts         # File creation helpers for tests
│       └── setup.ts            # Temp dirs, mocks, test utilities
├── templates/                  # Templates for `init` command
│   ├── cngpac.config.ts        # Config file template
│   └── version.yml             # GitHub Actions workflow template
├── website/                    # Docusaurus documentation site
│   ├── docs/                   # "next" version docs
│   ├── versioned_docs/         # "latest" version docs
│   ├── changelogs/             # Generated changelogs
│   └── src/                    # React components, CSS
├── tsconfig.json               # Root TS config (src + tests)
├── tsdown.config.ts            # Library build config
├── vitest.config.ts            # Test runner config
├── cngpac.config.ts            # This project's own release config
```

### Package Exports

```json
{
  ".": "./dist/src/index.mjs",
  "./publishers/npm": "./dist/src/publishers/npm.mjs",
  "./releasers/github": "./dist/src/releasers/github.mjs",
  "./package.json": "./package.json"
}
```

The CLI binary is at `./dist/bin.mjs`, registered as `cngpac`.

---

## 5. Development Workflow

### Adding a feature or fix

1. Create or modify source files under `src/`
2. Add or update tests under `tests/cli/`
3. Run `pnpm test` to validate
4. Run `pnpm typecheck` to check types across all projects
5. Run `pnpm lint` and `pnpm format` before committing

### Build system

- **Library** is built with `tsdown` (ESM, unbundled, with `.d.mts` declarations)
  - Entry points: `src/index.ts`, `src/publishers/npm.ts`, `src/releasers/github.ts`
  - Output: `dist/src/`
- **CLI** is built separately with `tsdown` into a single `dist/bin.mjs`
  - `cngpac` is marked as `neverBundle` (resolved at runtime)
  - Injects `VERSION` env from `package.json`
- Path alias `cngpac` → `./src` is configured in both `tsconfig.json` and `vitest.config.ts`

### Release process (self-hosting)

This project uses itself for releases. The config is at `cngpac.config.ts`:

- Generates changelogs
- Saves changelogs to `website/changelogs/`
- Copies `website/docs/` → `website/versioned_docs/version-latest/` as a pre-stage step
- Formats output with Biome and oxfmt
- Publishes to npm
- Creates GitHub releases

---

## 6. Testing Guide

### Framework

- **Vitest** (v4.1+) with config at `vitest.config.ts`
- Tests live in `tests/cli/` — one file per CLI command
- Test helpers in `tests/helpers/`

### Running tests

```sh
pnpm test                    # all tests, single run
pnpm test:watch              # watch mode
npx vitest run tests/cli/change.test.ts  # single file
```

### Test helpers

**`tests/helpers/setup.ts`** provides:

| Helper                | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `createTempDir()`     | Creates isolated dir under `tests/.tmp/`     |
| `cleanupTempDir(dir)` | Recursively deletes temp dir                 |
| `mockProcessCwd(dir)` | Spies on `process.cwd()` to return `dir`     |
| `mockProcessExit()`   | Converts `process.exit(code)` into a throw   |
| `createMockGitOps()`  | Returns a full mock of git operations object |
| `createMockConfig()`  | Returns a minimal valid `CngpacConfig`       |
| `createClackMocks()`  | No-op stubs for `@clack/prompts` functions   |

**`tests/helpers/fixtures.ts`** provides:

| Fixture                 | Creates                              |
| ----------------------- | ------------------------------------ |
| `writePackageJson()`    | `package.json` in the test dir       |
| `writeChangenoteFile()` | `.changenotes/*.md` with frontmatter |
| `writePrepareJson()`    | `.changenotes/prepare.json`          |
| `writeConfigFile()`     | `cngpac.config.ts` template          |

### Test patterns

All CLI command tests follow this structure:

```ts
// 1. Mock external modules BEFORE imports
const clack = createClackMocks();
vi.mock("@clack/prompts", () => clack);
vi.mock("../../src/git", () => ({ createGitOps: vi.fn() }));

// 2. Setup and teardown with temp directories
let tmpDir: string;
beforeEach(() => {
  tmpDir = createTempDir();
  mockProcessCwd(tmpDir);
  mockProcessExit();
});
afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

// 3. Dynamic import after mocks are installed
async function getCommand() {
  const mod = await import("../../src/cli/commands/change");
  return mod.changeCommand;
}

// 4. Arrange with fixtures, act, assert
it("creates changenote with args", async () => {
  writePackageJson(tmpDir);
  writeConfigFile(tmpDir);
  const cmd = await getCommand();
  await cmd("patch", "fix: something");
  // assert file exists, content correct, etc.
});
```

**Key conventions**:

- Use dynamic imports (`await import(...)`) to ensure mocks are registered before the module loads
- Create isolated temp directories per test — never share state between tests
- Mock all external I/O (git, prompts, filesystem when needed)
- Call `vi.restoreAllMocks()` in `afterEach`
- Test both happy paths and error conditions (validation failures, missing files, cancellation)

---

## 7. Documentation

### Website

The docs site is built with **Docusaurus** and lives in `website/`.

- **Dev server**: `pnpm run web`
- **Docs source**: `website/docs/`

**Important:** Do not touch `website/versioned_docs/` — unless you're explicitly told to do so.

### Key documentation pages

| Page                            | Content                               |
| ------------------------------- | ------------------------------------- |
| `website/docs/intro.md`         | Project overview, comparison, design  |
| `website/docs/quick-start.md`   | 5-step getting started guide          |
| `website/docs/configuration.md` | Config file reference, plugin options |
| `website/docs/concepts.md`      | Architecture, changenotes, pipeline   |
| `website/docs/cli/index.md`     | CLI overview and global options       |
| `website/docs/cli/{command}.md` | Per-command reference (7 pages)       |

### When to update docs

- Adding/Changing a CLI command → add `website/docs/cli/{command}.md`
- Adding/Changing config options → update `website/docs/configuration.md`
- Adding/Changing changenote format → update `website/docs/concepts.md`
- Or any behavior change that affects users → update the relevant docs page with clear instructions and examples

---

## 8. Best Practices

### Code style

- **JSDoc**: Required for all public APIs
- **Indentation**: Spaces, 2 per level
- **Quotes**: Double quotes
- **Semicolons**: Always
- **Imports**: Named imports, `import type` for type-only imports, organized automatically
- **Node builtins**: Prefix with `node:`

### Naming conventions

| Kind         | Style              | Example                            |
| ------------ | ------------------ | ---------------------------------- |
| Functions    | `camelCase`        | `createGitOps`, `applyVersionBump` |
| Types        | `PascalCase`       | `Changenote`, `VersionBump`        |
| Interfaces   | `PascalCase`       | `ChangenoteMarkdown`               |
| Constants    | `UPPER_SNAKE_CASE` | `CONFIG_FILE_NAME`                 |
| Files        | `kebab-case`       | `changenote.ts`, `git.ts`          |
| Config files | Dotted/specific    | `cngpac.config.ts`                 |

### TypeScript patterns

- **Strict mode** is always on — no `any` unless truly necessary
- **Branded types** for path distinction (`PkgFileAbsPath`, `DirtyFileAbsPath`)
- **`const` by default**, `let` only when mutation is required
- **Explicit return types** on exported functions
- **Optional chaining** (`?.`) and **nullish coalescing** (`??`) for null handling
- **Type guards** (e.g., `value is BumpType`) for runtime validation
- **`import type`** for type-only imports — never import types as values

### Architecture patterns

- **Factory functions** for plugins: `createChangelogGenerator()`, `createNpmPublisher()`, etc.
- **Named exports** from all modules; re-exported through `src/index.ts`
- **No default exports** in library source (only in config files)
- **Async/await** throughout — no callbacks, no raw `.then()` chains
- **Separation of concerns**: each `src/*.ts` file owns one domain (git, changenotes, formatting, etc.)

### Error handling

- Throw descriptive errors for validation failures at boundaries
- Use `try/catch` with `instanceof Error` narrowing
- Check `err.code === "ENOENT"` for missing file handling
- Let unexpected errors propagate — don't swallow them

### What NOT to do

- Don't add error handling for impossible scenarios
- Don't create abstractions for one-time operations
- Don't use `var`, `require()`, or CommonJS patterns
- Don't use default exports in library source files

---

## 9. Guides

### Before You Start

- **Explore the codebase** if this instruction file is not enough. Read the relevant source files to understand the full picture before making changes.
- **Search for similar implementations** when adding something new. If you're adding a CLI command, look at an existing one. If you're adding a plugin, look at an existing publisher or releaser. Mirror the patterns you find.
- **Read existing tests** before writing new ones. The test patterns are consistent across all command files — follow the same mock-first, dynamic-import, temp-directory structure.

### When Adding New Code

- **Follow the one-file-per-domain rule.** Each `src/*.ts` file owns a single concern. Don't mix git logic into changenote parsing, or config loading into version bumping.
- **Export through `src/index.ts`.** If your addition is part of the public API, re-export it from the main entry point. Check what's already exported there for the pattern.
- **Keep the path alias in sync.** The alias `cngpac` → `./src` is configured in `tsconfig.json`, `src/cli/tsconfig.json`, and `vitest.config.ts`. If you add new entry points or restructure `src/`, update all three.
- **Add tests alongside features.** Every CLI command has a corresponding test file. Every new behavior should have at least happy-path and error-condition coverage.
- **Update docs when behavior changes.** CLI commands live in `website/docs/cli/`, config options in `website/docs/configuration.md`, and conceptual changes in `website/docs/concepts.md`. The sidebar is in `website/sidebars.ts`.

### When Modifying Existing Code

- **Run `pnpm test` after every change.** Tests are fast and catch regressions early.
- **Run `pnpm typecheck` before committing.** There are three separate tsconfigs (src, cli, website) — `pnpm typecheck` checks all of them.
- **Run `pnpm lint`** to keep code consistent with the project's Biome configuration.

### When Unsure

- **Check the website docs** (`website/docs/`) — they often contain more detailed explanations than this file, especially for configuration options and CLI usage.
- **Check the test files** (`tests/cli/`) — they serve as executable documentation for how each command is expected to behave, including edge cases.
- **Check `package.json`** for the available scripts, exports map, and dependency list.
- **Ask rather than guess** when a guess affects the public API, config schema, or release process.

---

**Important :** Update this(AGENTS.md) file when you change anything mentioned here.