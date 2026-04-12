import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CngpacConfig } from "../../src/types";
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
let mockConfig: CngpacConfig;
vi.mock("../../src/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/utils")>();
  return {
    ...actual,
    loadConfig: vi.fn(async () => mockConfig),
  };
});

// Mock open (browser)
const mockOpen = vi.fn();
vi.mock("open", () => ({ default: mockOpen }));

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
  mockOpen.mockReset();
  (mockConfig.changelog.generator as ReturnType<typeof vi.fn>)
    .mockReset()
    .mockResolvedValue("# Preview Changelog\n\n- Test change");
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

async function getPreviewCommand() {
  const mod = await import("../../src/cli/commands/preview");
  return mod.previewCommand;
}

describe("preview command", () => {
  it("exits early when no changenotes exist", async () => {
    writePackageJson(tmpDir);

    const previewCommand = await getPreviewCommand();
    await previewCommand();

    expect(clack.log.warning).toHaveBeenCalledWith(
      expect.stringContaining("No changenotes"),
    );
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it("calls changelog generator with fake version bump", async () => {
    writePackageJson(tmpDir, { version: "2.0.0" });
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: test" });

    const previewCommand = await getPreviewCommand();
    await previewCommand();

    expect(mockConfig.changelog.generator).toHaveBeenCalledWith(
      expect.objectContaining({
        newVersion: "x.x.x",
        packageName: "test-package",
      }),
      expect.arrayContaining([expect.objectContaining({ title: "fix: test" })]),
      expect.anything(),
    );
  });

  it("opens browser with temp file", async () => {
    writePackageJson(tmpDir);
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: test" });

    const previewCommand = await getPreviewCommand();
    await previewCommand();

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("cngpac-changelog-preview.html"),
    );
  });

  it("enriches changenotes with git metadata", async () => {
    writePackageJson(tmpDir);
    writeChangenoteFile(tmpDir, {
      bump: "patch",
      title: "fix: test",
      id: "note-1",
    });
    writeChangenoteFile(tmpDir, {
      bump: "minor",
      title: "feat: feature",
      id: "note-2",
    });

    const previewCommand = await getPreviewCommand();
    await previewCommand();

    // getFileAddCommit + getFileAuthors should be called per changenote
    expect(mockGitOps.getFileAddCommit).toHaveBeenCalledTimes(2);
    expect(mockGitOps.getFileAuthors).toHaveBeenCalledTimes(2);
  });

  it("generates valid HTML", async () => {
    writePackageJson(tmpDir);
    writeChangenoteFile(tmpDir, { bump: "patch", title: "fix: test" });

    const previewCommand = await getPreviewCommand();
    await previewCommand();

    expect(clack.log.success).toHaveBeenCalledWith(
      expect.stringContaining("Saved preview"),
    );
  });
});
