import fs from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanupTempDir,
  createClackMocks,
  createMockConfig,
  createTempDir,
  mockProcessCwd,
  mockProcessExit,
} from "../helpers/setup";

// Mock @clack/prompts
const clack = createClackMocks();
vi.mock("@clack/prompts", () => clack);

// Mock loadConfig from utils (called as loadConfig from "cngpac")
const mockConfig = createMockConfig();
vi.mock("../../src/utils", () => ({
  loadConfig: vi.fn().mockResolvedValue(mockConfig),
}));

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTempDir();
  mockProcessCwd(tmpDir);
  mockProcessExit();

  // Reset clack mocks
  clack.select.mockReset();
  clack.text.mockReset();
  clack.isCancel.mockReset().mockReturnValue(false);
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

async function getChangeCommand() {
  const mod = await import("../../src/cli/commands/change");
  return mod.changeCommand;
}

describe("change command", () => {
  it("creates changenote with CLI args (bump + title)", async () => {
    const changeCommand = await getChangeCommand();
    await changeCommand("patch", "fix: resolve crash on startup");

    const changenotesDir = join(tmpDir, ".changenotes");
    expect(fs.existsSync(changenotesDir)).toBe(true);

    const files = fs.readdirSync(changenotesDir);
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/\.md$/);

    const content = fs.readFileSync(join(changenotesDir, files[0]), "utf-8");
    expect(content).toContain("bump: patch");
    expect(content).toContain("# fix: resolve crash on startup");
  });

  it("creates changenote with major bump", async () => {
    const changeCommand = await getChangeCommand();
    await changeCommand("major", "breaking: removed deprecated API");

    const changenotesDir = join(tmpDir, ".changenotes");
    const files = fs.readdirSync(changenotesDir);
    const content = fs.readFileSync(join(changenotesDir, files[0]), "utf-8");
    expect(content).toContain("bump: major");
    expect(content).toContain("# breaking: removed deprecated API");
  });

  it("prompts for bump when arg is missing", async () => {
    clack.select.mockResolvedValueOnce("minor");

    const changeCommand = await getChangeCommand();
    await changeCommand(undefined, "feat: new feature");

    expect(clack.select).toHaveBeenCalledTimes(1);

    const changenotesDir = join(tmpDir, ".changenotes");
    const files = fs.readdirSync(changenotesDir);
    const content = fs.readFileSync(join(changenotesDir, files[0]), "utf-8");
    expect(content).toContain("bump: minor");
  });

  it("prompts for title when arg is missing", async () => {
    clack.text.mockResolvedValueOnce("feat: prompted title");

    const changeCommand = await getChangeCommand();
    await changeCommand("patch", undefined);

    expect(clack.text).toHaveBeenCalledTimes(1);

    const changenotesDir = join(tmpDir, ".changenotes");
    const files = fs.readdirSync(changenotesDir);
    const content = fs.readFileSync(join(changenotesDir, files[0]), "utf-8");
    expect(content).toContain("# feat: prompted title");
  });

  it("prompts for both bump and title when no args given", async () => {
    clack.select.mockResolvedValueOnce("major");
    clack.text.mockResolvedValueOnce("breaking: everything changed");

    const changeCommand = await getChangeCommand();
    await changeCommand(undefined, undefined);

    expect(clack.select).toHaveBeenCalledTimes(1);
    expect(clack.text).toHaveBeenCalledTimes(1);

    const changenotesDir = join(tmpDir, ".changenotes");
    const files = fs.readdirSync(changenotesDir);
    const content = fs.readFileSync(join(changenotesDir, files[0]), "utf-8");
    expect(content).toContain("bump: major");
    expect(content).toContain("# breaking: everything changed");
  });

  it("uses default name generator (adj-color-noun pattern)", async () => {
    const changeCommand = await getChangeCommand();
    await changeCommand("patch", "test title");

    const changenotesDir = join(tmpDir, ".changenotes");
    const files = fs.readdirSync(changenotesDir);
    const baseName = files[0].replace(".md", "");
    // Default pattern: adj-color-noun (3 words, 2 hyphens)
    expect(baseName.split("-").length).toBe(3);
  });

  it("handles cancelled bump selection", async () => {
    clack.select.mockResolvedValueOnce(Symbol("cancel"));
    clack.isCancel.mockImplementation(
      (val: unknown) => typeof val === "symbol",
    );

    const changeCommand = await getChangeCommand();
    await expect(changeCommand(undefined, "test")).rejects.toThrow(
      "process.exit",
    );
    expect(clack.cancel).toHaveBeenCalled();
  });

  it("handles cancelled title input", async () => {
    clack.text.mockResolvedValueOnce(Symbol("cancel"));
    clack.isCancel.mockImplementation(
      (val: unknown) => typeof val === "symbol",
    );

    const changeCommand = await getChangeCommand();
    await expect(changeCommand("patch", undefined)).rejects.toThrow(
      "process.exit",
    );
    expect(clack.cancel).toHaveBeenCalled();
  });

  it("prompts for bump when invalid bump arg is given", async () => {
    clack.select.mockResolvedValueOnce("patch");

    const changeCommand = await getChangeCommand();
    await changeCommand("invalid", "test title");

    // Should have fallen through to prompt
    expect(clack.select).toHaveBeenCalledTimes(1);
  });
});
