import { access } from "node:fs/promises";
import { extname } from "node:path";
import type { CngpacConfig } from "./types";

const CONFIG_EXTENSIONS = [".ts", ".mts", ".js", ".mjs"];

/** Load the Cngpac config */
export async function loadConfig(path: string): Promise<CngpacConfig> {
  const ext = extname(path);
  const base = ext ? path.slice(0, -ext.length) : path;

  let resolvedPath: string | undefined;
  for (const candidate of CONFIG_EXTENSIONS) {
    const full = `${base}${candidate}`;
    try {
      await access(full);
      resolvedPath = full;
      break;
    } catch {}
  }

  if (!resolvedPath) {
    throw new Error(
      `Config file not found: tried ${CONFIG_EXTENSIONS.map((e) => `${base}${e}`).join(", ")}`,
    );
  }

  const module = await import(resolvedPath);
  const config = module.default as CngpacConfig | undefined;
  if (!config || typeof config !== "object") {
    throw new Error();
  }
  return config;
}

/**
 * Escape a package name to a safe file system name.
 *
 * "@myapp/core" → "myapp-core"
 *
 * "my-app" → "my-app"
 */
export function escapePackageName(name: string): string {
  return name.replace(/^@/, "").replace(/\//g, "-");
}

/** Detect indentation from JSON content */
export function detectIndentation(content: string): string | number {
  // Look for indented lines in the JSON
  const match = content.match(/\n([ \t]+)["'{]/);
  if (!match) {
    return 2; // default to 2 spaces
  }

  const indent = match[1];

  // Check if it's tabs
  if (indent.includes("\t")) {
    return "\t";
  }

  // Otherwise it's spaces, return the count
  return indent.length;
}
