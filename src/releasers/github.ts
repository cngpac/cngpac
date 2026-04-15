import { Octokit } from "@octokit/rest";
import * as semver from "semver";
import type { ReleaserPlugin } from "../types";

export interface GitHubReleaserOptions {
  /** GitHub token for authentication */
  token: string;
  /**
   * Custom release name format.
   * Supports template variables:
   * - {packageName}: The package name
   * - {version}: The new version
   * - {tagName}: The git tag name
   *
   * @default "{packageName}@{version}"
   *
   * @example
   * ```ts
   * nameFormat: "Release {packageName} v{version}"
   * ```
   */
  nameFormat?: string;
}

export function createGitHubReleaser(
  options: GitHubReleaserOptions,
): ReleaserPlugin {
  const octokit = new Octokit({ auth: options.token });
  const { nameFormat = "{packageName}@{version}" } = options;

  return async ({ versionBump, tagName, changelog, config }): Promise<void> => {
    const name = nameFormat
      .replace("{packageName}", versionBump.packageName)
      .replace("{version}", versionBump.newVersion)
      .replace("{tagName}", tagName);

    await octokit.repos.createRelease({
      owner: config.repository.owner,
      repo: config.repository.name,
      tag_name: tagName,
      name: name,
      body: changelog,
      draft: false,
      prerelease:
        semver.parse(versionBump.newVersion)?.prerelease?.length !== 0,
    });
  };
}
