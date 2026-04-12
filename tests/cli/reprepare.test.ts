import fs from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writePrepareJson } from "../helpers/fixtures";
import {
  cleanupTempDir,
  createClackMocks,
  createMockGitOps,
  createTempDir,
  mockProcessCwd,
  mockProcessExit,
} from "../helpers/setup";

// Mock @clack/prompts
const clack = createClackMocks();
vi.mock("@clack/prompts", () => clack);

// Mock git ops
const mockGitOps = createMockGitOps();
vi.mock("../../src/git", () => ({
  createGitOps: vi.fn(() => mockGitOps),
}));

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTempDir();
  mockProcessCwd(tmpDir);
  mockProcessExit();

  // Reset git mocks
  for (const fn of Object.values(mockGitOps)) {
    (fn as ReturnType<typeof vi.fn>).mockClear();
  }
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

async function getReprepareCommand() {
  const mod = await import("../../src/cli/commands/reprepare");
  return mod.reprepareCommand;
}

describe("reprepare command", () => {
  it("increments the attempt counter", async () => {
    writePrepareJson(tmpDir, { newVersion: "2.0.0", attempt: 1 });

    const reprepareCommand = await getReprepareCommand();
    await reprepareCommand({});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    expect(config.attempt).toBe(2);
  });

  it("preserves the newVersion field", async () => {
    writePrepareJson(tmpDir, { newVersion: "3.1.4", attempt: 1 });

    const reprepareCommand = await getReprepareCommand();
    await reprepareCommand({});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    expect(config.newVersion).toBe("3.1.4");
    expect(config.attempt).toBe(2);
  });

  it("exits with error when no prepare.json exists", async () => {
    const reprepareCommand = await getReprepareCommand();
    await expect(reprepareCommand({})).rejects.toThrow("process.exit");

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining("No prepare.json"),
    );
  });

  it("commits when --commit flag is set", async () => {
    writePrepareJson(tmpDir, { newVersion: "1.0.1", attempt: 1 });

    const reprepareCommand = await getReprepareCommand();
    await reprepareCommand({ commit: true });

    expect(mockGitOps.add).toHaveBeenCalledWith([".changenotes/prepare.json"]);
    expect(mockGitOps.commit).toHaveBeenCalledWith(
      expect.stringContaining("prepare 1.0.1 (attempt 2)"),
    );
  });

  it("pushes when --push flag is set", async () => {
    writePrepareJson(tmpDir, { newVersion: "1.0.1", attempt: 1 });

    const reprepareCommand = await getReprepareCommand();
    await reprepareCommand({ push: true });

    expect(mockGitOps.commit).toHaveBeenCalled();
    expect(mockGitOps.push).toHaveBeenCalled();
  });

  it("increments from attempt 5 to 6", async () => {
    writePrepareJson(tmpDir, { newVersion: "1.0.0", attempt: 5 });

    const reprepareCommand = await getReprepareCommand();
    await reprepareCommand({});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    expect(config.attempt).toBe(6);
  });
});
