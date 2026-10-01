import { execSync } from "node:child_process";
import { delimiter, join } from "node:path";
import type { CngpacConfig, VersionBump } from "./types";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

/**
 * Detect the current package manager from npm_config_user_agent,
 * falling back to "npm".
 */
export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? "";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
}

/**
 * Execute the build stage after package version has been updated.
 *
 * Supports:
 * - A custom plugin function `(props) => Promise<void> | void`
 * - `{ script: "build" }` to run an npm script with the detected package manager
 * - `{ command: "npm run build" }` to run a raw shell command
 *
 * Augments `PATH` with `node_modules/.bin` so locally installed binaries resolve directly.
 */
export async function runBuild(
  config: CngpacConfig,
  versionBump: VersionBump,
  rootDir: string,
): Promise<void> {
  if (!config.build) return;

  if (typeof config.build === "function") {
    await config.build({ versionBump, config, rootDir });
    return;
  }

  const pm = detectPackageManager();
  let commandToRun: string;

  if (typeof config.build === "object") {
    if ("script" in config.build && typeof config.build.script === "string") {
      commandToRun = `${pm} run ${config.build.script}`;
    } else if (
      "command" in config.build &&
      typeof config.build.command === "string"
    ) {
      commandToRun = config.build.command;
    } else {
      return;
    }
  } else {
    return;
  }

  const binDir = join(rootDir, "node_modules", ".bin");
  try {
    execSync(commandToRun, {
      cwd: rootDir,
      stdio: "inherit",
      env: {
        ...process.env,
        PATH: `${binDir}${delimiter}${process.env.PATH}`,
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to build package ${versionBump.packageName}@${versionBump.newVersion}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
