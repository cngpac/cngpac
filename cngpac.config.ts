import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createChangelogGenerator,
  createChangelogSaver,
  createFormatter,
  createGitHubReleaser,
  createNpmPublisher,
  type DirtyFileAbsPath,
  defineConfig,
} from "cngpac";
import { glob } from "glob";

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
      filepath: "website/changelogs/v{version}.md",
    }),
  },
  preStage: [
    async ({ configDir, versionBump }) => {
      const src = join(configDir, "website/docs");
      const dest = join(configDir, "website/versioned_docs/version-stable");

      await rm(dest, { recursive: true, force: true });
      await cp(src, dest, { recursive: true, force: true });

      const docsVersionsPath = join(configDir, "website/versionsInfo.json");
      const versionsInfo = JSON.parse(
        await readFile(docsVersionsPath, "utf-8"),
      );
      versionsInfo.stable.label = `Stable - ${versionBump.newVersion}`;
      await writeFile(docsVersionsPath, JSON.stringify(versionsInfo, null, 2));

      const files = await glob("**/*", {
        cwd: dest,
        nodir: true,
        absolute: true,
      });
      return [...files, docsVersionsPath] as unknown as DirtyFileAbsPath[];
    },
  ],
  formatters: [
    createFormatter({ extensions: ["json"], command: "biome format --write" }),
    createFormatter({ extensions: ["md"], command: "oxfmt" }),
  ],
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
