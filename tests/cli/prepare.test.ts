import fs from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeChangenoteFile, writePackageJson } from "../helpers/fixtures";
import {
  cleanupTempDir,
  createClackMocks,
  createMockConfig,
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

// Mock loadConfig (preserve real exports like detectIndentation)
const mockConfig = createMockConfig();
vi.mock("../../src/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/utils")>();
  return {
    ...actual,
    loadConfig: vi.fn().mockResolvedValue(mockConfig),
  };
});

// Mock formatFiles
const mockFormatFiles = vi.fn();
vi.mock("../../src/formatter", () => ({
  createFormatter: vi.fn(),
  formatFiles: (...args: unknown[]) => mockFormatFiles(...args),
}));

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTempDir();
  mockProcessCwd(tmpDir);
  mockProcessExit();

  // Reset mocks
  for (const fn of Object.values(mockGitOps)) {
    (fn as ReturnType<typeof vi.fn>).mockClear();
  }
  clack.confirm.mockReset().mockResolvedValue(true);
  clack.isCancel.mockReset().mockReturnValue(false);
  mockFormatFiles.mockReset();

  // Set up package.json
  writePackageJson(tmpDir);
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

async function getPrepareCommand() {
  const mod = await import("../../src/cli/commands/prepare");
  return mod.prepareCommand;
}

describe("prepare command", () => {
  it("writes prepare.json for a release type", async () => {
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix something" });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, {});

    const preparePath = join(tmpDir, ".changenotes", "prepare.json");
    expect(fs.existsSync(preparePath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(preparePath, "utf-8"));
    expect(config.attempt).toBe(1);
    expect(config.newVersion).toBeDefined();
  });

  it("calculates correct version for patch bumps", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writeChangenoteFile(tmpDir, { bump: "patch" });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, {});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    expect(config.newVersion).toBe("1.0.1");
  });

  it("calculates correct version for minor bumps", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writeChangenoteFile(tmpDir, { bump: "minor" });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, {});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    expect(config.newVersion).toBe("1.1.0");
  });

  it("calculates correct version for major bumps", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writeChangenoteFile(tmpDir, { bump: "major" });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, {});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    expect(config.newVersion).toBe("2.0.0");
  });

  it("handles prerelease type with tag", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writeChangenoteFile(tmpDir, { bump: "patch" });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("prerelease", "beta", {});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    expect(config.newVersion).toContain("beta");
  });

  it("exits early when no changenotes exist", async () => {
    // No changenotes written
    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, {});

    // Should have warned and exited gracefully (no process.exit, just return)
    expect(clack.log.warning).toHaveBeenCalledWith(
      expect.stringContaining("No changenotes"),
    );
    expect(fs.existsSync(join(tmpDir, ".changenotes", "prepare.json"))).toBe(
      false,
    );
  });

  it("rejects invalid type argument", async () => {
    writeChangenoteFile(tmpDir, { bump: "patch" });

    const prepareCommand = await getPrepareCommand();
    await expect(prepareCommand("invalid-type", undefined, {})).rejects.toThrow(
      "process.exit",
    );

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid type "invalid-type"'),
    );
  });

  it("commits when --commit flag is set", async () => {
    writeChangenoteFile(tmpDir, { bump: "patch" });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, { commit: true });

    expect(mockGitOps.add).toHaveBeenCalledWith([".changenotes/prepare.json"]);
    expect(mockGitOps.commit).toHaveBeenCalledWith(
      expect.stringContaining("prepare"),
    );
  });

  it("pushes when --push flag is set", async () => {
    writeChangenoteFile(tmpDir, { bump: "patch" });

    const prepareCommand = await getPrepareCommand();
    // prepare calls process.exit(0) after a successful push
    await expect(
      prepareCommand("release", undefined, { push: true }),
    ).rejects.toThrow("process.exit(0)");

    expect(mockGitOps.push).toHaveBeenCalled();
  });

  it("runs formatter plugins on created file", async () => {
    writeChangenoteFile(tmpDir, { bump: "patch" });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, {});

    expect(mockFormatFiles).toHaveBeenCalled();
    const calledPaths = mockFormatFiles.mock.calls[0][0];
    expect(calledPaths).toEqual(
      expect.arrayContaining([expect.stringContaining("prepare.json")]),
    );
  });

  it("uses highest bump when multiple changenotes exist", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writeChangenoteFile(tmpDir, {
      bump: "patch",
      title: "fix something",
      id: "note-1",
    });
    writeChangenoteFile(tmpDir, {
      bump: "minor",
      title: "add feature",
      id: "note-2",
    });

    const prepareCommand = await getPrepareCommand();
    await prepareCommand("release", undefined, {});

    const config = JSON.parse(
      fs.readFileSync(join(tmpDir, ".changenotes", "prepare.json"), "utf-8"),
    );
    // minor > patch, so should be 1.1.0
    expect(config.newVersion).toBe("1.1.0");
  });
});
