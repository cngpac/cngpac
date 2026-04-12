import "localstorage-polyfill";
import type { CngpacConfig } from "./types";

/** Type-safe helper for defining a Cngpac configuration object. */
export function defineConfig(config: CngpacConfig): CngpacConfig {
  return config;
}

export { createChangelogGenerator } from "./changelog";
export {
  consumePrepareConfig,
  parseChangenoteContent,
  parseChangenotefile,
  parseFrontmatter,
  readChangenotes,
  readPrepareConfig,
  updateFrontmatter,
  writeChangenote,
  writePrepareConfig,
} from "./changenote";
export { defaultGenerateNoteName } from "./cli/commands/change";
export type { FormatterOptions } from "./formatter";
export { createFormatter, formatFiles } from "./formatter";
export { createGitOps } from "./git";
export { readPkg, updatePkgVersion } from "./pkg";
export { calculateVersionBump } from "./prepare";
export type { NpmPublisherOptions } from "./publishers/npm";
export { createNpmPublisher } from "./publishers/npm";
export type { GitHubReleaserOptions } from "./releasers/github";
export { createGitHubReleaser } from "./releasers/github";
export type { ChangelogSaverOptions } from "./saver";
export { createChangelogSaver } from "./saver";
export type {
  BumpType,
  ChangelogGenerator,
  ChangelogSaver,
  Changenote,
  ChangenoteCommit,
  ChangenoteMetadata,
  CngpacConfig,
  CommitAuthor,
  DirtyFileAbsPath,
  FormatterPlugin,
  NoteNameGenerator,
  Package,
  PkgFileAbsPath,
  PrepareConfig,
  PreStagePlugin,
  PublisherPlugin,
  ReleaserPlugin,
  VersionBump,
} from "./types";
export { loadConfig } from "./utils";
export { applyVersionBump, consumeChangenotes } from "./version";
