import fs from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CngpacConfig } from "../../src/types";
import {
  writeChangenoteFile,
  writePackageJson,
  writePrepareJson,
} from "../helpers/fixtures";
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
let mockConfig: CngpacConfig;
vi.mock("../../src/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/utils")>();
  return {
    ...actual,
    loadConfig: vi.fn(async () => mockConfig),
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
  mockConfig = createMockConfig();

  // Reset mocks
  for (const fn of Object.values(mockGitOps)) {
    (fn as ReturnType<typeof vi.fn>).mockClear();
  }
  mockFormatFiles.mockReset();
  (mockConfig.changelog.generator as ReturnType<typeof vi.fn>)
    .mockReset()
    .mockResolvedValue("# test-package@2.0.0\n\n- Test change");
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

async function getVersionCommand() {
  const mod = await import("../../src/cli/commands/version");
  return mod.versionCommand;
}

describe("version command", () => {
  it("exits early when no prepare.json found", async () => {
    writePackageJson(tmpDir);

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    expect(clack.log.warning).toHaveBeenCalledWith(
      expect.stringContaining("No prepare config"),
    );
  });

  it("updates package.json version", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.1.0" });
    writeChangenoteFile(tmpDir, { bump: "minor", title: "feat: new" });

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    const pkg = JSON.parse(
      fs.readFileSync(join(tmpDir, "package.json"), "utf-8"),
    );
    expect(pkg.version).toBe("1.1.0");
  });

  it("calls changelog generator", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    expect(mockConfig.changelog.generator).toHaveBeenCalledWith(
      expect.objectContaining({ newVersion: "1.0.1" }),
      expect.arrayContaining([expect.objectContaining({ title: "fix: bug" })]),
      expect.anything(),
    );
  });

  it("calls changelog saver when configured", async () => {
    const mockSaver = vi.fn().mockResolvedValue("/saved/CHANGELOG.md");
    mockConfig.changelog.saver = mockSaver;

    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    expect(mockSaver).toHaveBeenCalledWith(
      expect.objectContaining({
        changelog: expect.any(String),
        versionBump: expect.objectContaining({ newVersion: "1.0.1" }),
      }),
    );
  });

  it("deletes consumed changenote files", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    const notePath = writeChangenoteFile(tmpDir, {
      bump: "patch",
      title: "fix: bug",
    });

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    expect(fs.existsSync(notePath)).toBe(false);
  });

  it("deletes prepare.json after consumption", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    const preparePath = writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    expect(fs.existsSync(preparePath)).toBe(false);
  });

  it("runs formatter plugins on dirty files", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it("runs pre-stage plugins and includes returned paths", async () => {
    const extraPath = join(tmpDir, "extra-file.md");
    const mockPreStage = vi.fn().mockResolvedValue(extraPath);
    mockConfig.preStage = [mockPreStage];

    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({ commit: true });

    expect(mockPreStage).toHaveBeenCalledWith(
      expect.objectContaining({
        versionBump: expect.objectContaining({ newVersion: "1.0.1" }),
        config: expect.anything(),
        configDir: tmpDir,
      }),
    );
    // Extra path should be part of dirty files staged for commit
    expect(mockGitOps.add).toHaveBeenCalledWith(
      expect.arrayContaining([extraPath]),
    );
  });

  it("commits when --commit is set", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({ commit: true });

    expect(mockGitOps.ensureGitIdentity).toHaveBeenCalled();
    expect(mockGitOps.add).toHaveBeenCalled();
    expect(mockGitOps.commit).toHaveBeenCalledWith(
      expect.stringContaining("Release test-package@1.0.1"),
    );
  });

  it("creates tag when --tag is set", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({ tag: true });

    expect(mockGitOps.tag).toHaveBeenCalledWith("test-package@1.0.1");
  });

  it("pushes when --push is set", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({ push: true });

    expect(mockGitOps.push).toHaveBeenCalled();
    expect(mockGitOps.pushTags).toHaveBeenCalled();
  });

  it("runs publisher plugins when --publish is set", async () => {
    const mockPublisher = vi.fn();
    mockConfig.publishers = [mockPublisher];

    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({ publish: true });

    expect(mockPublisher).toHaveBeenCalledWith(
      expect.objectContaining({
        pkgJsonPath: expect.stringContaining("package.json"),
        versionBump: expect.objectContaining({ newVersion: "1.0.1" }),
      }),
    );
  });

  it("runs releaser plugins when --release is set", async () => {
    const mockReleaser = vi.fn();
    mockConfig.releasers = [mockReleaser];

    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({ release: true });

    expect(mockReleaser).toHaveBeenCalledWith(
      expect.objectContaining({
        versionBump: expect.objectContaining({ newVersion: "1.0.1" }),
        tagName: "test-package@1.0.1",
        changelog: expect.any(String),
      }),
    );
  });

  it("does not commit/tag/push without flags", async () => {
    writePackageJson(tmpDir, { version: "1.0.0" });
    writePrepareJson(tmpDir, { newVersion: "1.0.1" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: bug" });

    const versionCommand = await getVersionCommand();
    await versionCommand({});

    expect(mockGitOps.commit).not.toHaveBeenCalled();
    expect(mockGitOps.tag).not.toHaveBeenCalled();
    expect(mockGitOps.push).not.toHaveBeenCalled();
  });
});
