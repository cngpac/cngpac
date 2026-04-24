/** A package in the monorepo */
export type Package = {
  /** Package name */
  name: string;
  /** Package version */
  version: string;
};

/** Branded string type representing a package file path */
export type PkgFileAbsPath = string & { readonly __brand: "PkgFileAbsPath" };

/** Branded string type representing a dirty file path */
export type DirtyFileAbsPath = string & {
  readonly __brand: "DirtyFileAbsPath";
};

/** Semantic version bump type */
export type BumpType = "major" | "minor" | "patch";

/** Parsed changenote from a markdown file */
export type Changenote = {
  /** Unique ID derived from the filename (without extension) */
  id: string;
  /** YAML frontmatter metadata */
  meta: ChangenoteMetadata;
  /** Heading from the changenote markdown */
  title: string;
  /** Markdown body content after the title heading */
  body: string;
  /** Relative file path to the changenote markdown file */
  filePath: string;
};

export type ChangenoteMetadata = {
  /** Semantic versioning bump information */
  bump: BumpType;
};

/** Commit metadata extracted from git history */
export interface ChangenoteCommit {
  /** Commit hash that introduced the changenote file */
  hash: string;
  /** Commit subject for the changenote file */
  subject: string;
  /** ISO 8601 datetime string of the commit */
  datetime: string;
}

/** A Contributor who added/edited the changenote file */
export interface CommitAuthor {
  name: string;
  email: string;
}

/** A resolved version bump for a single package */
export interface VersionBump {
  packageName: string;
  /** Current version from package.json */
  currentVersion: string;
  /** New version after applying the bump */
  newVersion: string;
  /** The highest bump type applied */
  bump: BumpType;
}

/** Prepare configuration written by the `prepare` command */
export type PrepareConfig = { newVersion: string; attempt: number };

/**
 * A changelog generator plugin function.
 * Receives a VersionBump and returns formatted changelog content.
 */
export type ChangelogGenerator = (
  bump: VersionBump,
  changenotes: (Changenote & {
    commit: ChangenoteCommit;
    authors: CommitAuthor[];
  })[],
  config: CngpacConfig,
) => Promise<string>;

/**
 * A changelog saver plugin function.
 * Called before git commit during the version command.
 * Receives the generated changelog markdown and version bump info,
 * and is responsible for persisting the changelog in the codebase.
 */
export type ChangelogSaver = (props: {
  changelog: string;
  versionBump: VersionBump;
  configDir: string;
}) =>
  | Promise<DirtyFileAbsPath | DirtyFileAbsPath[] | undefined>
  | DirtyFileAbsPath
  | DirtyFileAbsPath[]
  | undefined;

/**
 * A releaser plugin function.
 * Called after the "Publisher" plugins during the version command.
 * Responsible for publishing a release (e.g. creating a GitHub release).
 */
export type ReleaserPlugin = (props: {
  versionBump: VersionBump;
  tagName: string;
  changelog: string;
  config: CngpacConfig;
}) => Promise<void> | void;

/**
 * A publisher plugin function.
 * Called after the git push during the version command.
 * Responsible for publishing the package to a registry (e.g. npm publish).
 */
export type PublisherPlugin = (props: {
  pkgJsonPath: string;
  versionBump: VersionBump;
  config: CngpacConfig;
}) => Promise<void> | void;

/**
 * A pre-stage plugin function.
 * Called during the version command, before staging dirty files.
 * Can perform side effects (e.g. copy docs to a versioned directory)
 * and return additional file paths that need to be staged.
 */
export type PreStagePlugin = (props: {
  versionBump: VersionBump;
  config: CngpacConfig;
  configDir: string;
}) =>
  | Promise<DirtyFileAbsPath | DirtyFileAbsPath[] | undefined>
  | DirtyFileAbsPath
  | DirtyFileAbsPath[]
  | undefined;

/**
 * A changenote name generator function.
 * Returns a unique string used as the changenote filename.
 */
export type NoteNameGenerator = () => string;

/**
 * Version plugin for customizing commit messages and tag names
 * during the version command.
 */
export type VersionPlugin = {
  /** Custom function to generate the commit message */
  commitMessage?: (versionBump: VersionBump) => string;
  /** Custom function to generate the tag name */
  tagName?: (versionBump: VersionBump) => string;
};

/**
 * A formatter plugin.
 * Declares which file extensions it handles and a function that formats them in place.
 * Called after CLI commands create or modify files.
 */
export type FormatterPlugin = {
  /** File extensions this formatter handles (without leading dot, e.g. ["json", "md"]) */
  extensions: string[];
  /** Format the given files in place */
  format: (filePaths: string[], rootDir: string) => Promise<void> | void;
};

/** Configuration for Cngpac */
export interface CngpacConfig {
  /** Relative path to the package file */
  package: string;
  repository: {
    owner: string;
    name: string;
  };
  changenote?: {
    /** Optional custom generator for changenote filenames */
    nameGenerator?: NoteNameGenerator;
  };
  changelog: {
    /**
     * A plugin that generates the changelog from changenotes.
     */
    generator: ChangelogGenerator;
    /**`
     * A plugin that saves the generated changelog in the codebase.
     */
    saver?: ChangelogSaver;
  };
  /** Pre-stage plugins called before staging dirty files during the version command */
  preStage?: PreStagePlugin[];
  /** Formatter plugins called on files created/changed by CLI commands */
  formatters?: FormatterPlugin[];
  /** Optional version plugin for customizing release commit messages and tag names */
  version?: VersionPlugin;
  /** List of publisher plugins called after git push during the version command */
  publishers?: PublisherPlugin[];
  /** List of releaser plugins called after publishers during the version command */
  releasers?: ReleaserPlugin[];
}
