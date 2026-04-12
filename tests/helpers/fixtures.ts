import fs from "node:fs";
import { join } from "node:path";

export interface PackageJsonOptions {
  name?: string;
  version?: string;
  repository?: { type: string; url: string } | string;
}

/** Write a package.json to the given directory */
export function writePackageJson(
  dir: string,
  options: PackageJsonOptions = {},
): string {
  const { name = "test-package", version = "1.0.0", repository } = options;

  const pkg: Record<string, unknown> = { name, version };
  if (repository) pkg.repository = repository;

  const filePath = join(dir, "package.json");
  fs.writeFileSync(filePath, JSON.stringify(pkg, null, "\t"), "utf-8");
  return filePath;
}

export interface ChangenoteOptions {
  bump?: "patch" | "minor" | "major";
  title?: string;
  body?: string;
  id?: string;
}

/** Write a changenote markdown file to .changenotes/ */
export function writeChangenoteFile(
  dir: string,
  options: ChangenoteOptions = {},
): string {
  const {
    bump = "patch",
    title = "Test change",
    body = "",
    id = "test-note",
  } = options;

  const changenotesDir = join(dir, ".changenotes");
  fs.mkdirSync(changenotesDir, { recursive: true });

  const content = ["---", `bump: ${bump}`, "---", `# ${title}`, "", body].join(
    "\n",
  );

  const filePath = join(changenotesDir, `${id}.md`);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

export interface PrepareJsonOptions {
  newVersion?: string;
  attempt?: number;
}

/** Write a prepare.json to .changenotes/ */
export function writePrepareJson(
  dir: string,
  options: PrepareJsonOptions = {},
): string {
  const { newVersion = "1.1.0", attempt = 1 } = options;

  const changenotesDir = join(dir, ".changenotes");
  fs.mkdirSync(changenotesDir, { recursive: true });

  const config = { newVersion, attempt };
  const filePath = join(changenotesDir, "prepare.json");
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
  return filePath;
}

/** Write a minimal cngpac.config.ts (just exports an empty object) */
export function writeConfigFile(dir: string): string {
  const filePath = join(dir, "cngpac.config.ts");
  fs.writeFileSync(
    filePath,
    'export default { package: "package.json", repository: { owner: "test", name: "repo" }, changelog: { generator: async () => "# Changelog" } };\n',
    "utf-8",
  );
  return filePath;
}
