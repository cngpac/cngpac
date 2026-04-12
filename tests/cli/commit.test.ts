import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeChangenoteFile } from "../helpers/fixtures";
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
  mockGitOps.currentBranch.mockResolvedValue("main");
  mockGitOps.getStagedFiles.mockResolvedValue([]);
  mockGitOps.getUnstagedFiles.mockResolvedValue([]);
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

async function getCommitCommand() {
  const mod = await import("../../src/cli/commands/commit");
  return mod.commitCommand;
}

describe("commit command", () => {
  it("commits staged changenote using its title", async () => {
    writeChangenoteFile(tmpDir, {
      id: "brave-azure-fox",
      bump: "patch",
      title: "fix: resolve crash",
    });

    mockGitOps.getStagedFiles.mockResolvedValue([
      ".changenotes/brave-azure-fox.md",
    ]);

    const commitCommand = await getCommitCommand();
    await commitCommand({});

    expect(mockGitOps.commit).toHaveBeenCalledWith("fix: resolve crash");
  });

  it("exits with error when unstaged changenotes exist", async () => {
    writeChangenoteFile(tmpDir, { id: "unstaged-note" });
    mockGitOps.getUnstagedFiles.mockResolvedValue([
      ".changenotes/unstaged-note.md",
    ]);

    const commitCommand = await getCommitCommand();
    await expect(commitCommand({})).rejects.toThrow("process.exit");

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining("Unstaged changenote"),
    );
    expect(mockGitOps.commit).not.toHaveBeenCalled();
  });

  it("exits with error when no staged changenotes", async () => {
    const commitCommand = await getCommitCommand();
    await expect(commitCommand({})).rejects.toThrow("process.exit");

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining("No staged changenote"),
    );
    expect(mockGitOps.commit).not.toHaveBeenCalled();
  });

  it("warns when multiple staged changenotes exist", async () => {
    writeChangenoteFile(tmpDir, {
      id: "note-one",
      title: "first change",
    });
    writeChangenoteFile(tmpDir, {
      id: "note-two",
      title: "second change",
    });

    mockGitOps.getStagedFiles.mockResolvedValue([
      ".changenotes/note-one.md",
      ".changenotes/note-two.md",
    ]);

    const commitCommand = await getCommitCommand();
    await commitCommand({});

    expect(clack.log.warn).toHaveBeenCalledWith(
      expect.stringContaining("Multiple staged changenotes"),
    );
    // Should use the first one
    expect(mockGitOps.commit).toHaveBeenCalledWith("first change");
  });

  it("pushes when --push flag is set", async () => {
    writeChangenoteFile(tmpDir, {
      id: "push-note",
      title: "feat: push test",
    });
    mockGitOps.getStagedFiles.mockResolvedValue([".changenotes/push-note.md"]);

    const commitCommand = await getCommitCommand();
    await commitCommand({ push: true });

    expect(mockGitOps.commit).toHaveBeenCalled();
    expect(mockGitOps.pushSetUpstream).toHaveBeenCalledWith("main");
  });

  it("does not push without --push flag", async () => {
    writeChangenoteFile(tmpDir, {
      id: "no-push-note",
      title: "feat: no push",
    });
    mockGitOps.getStagedFiles.mockResolvedValue([
      ".changenotes/no-push-note.md",
    ]);

    const commitCommand = await getCommitCommand();
    await commitCommand({});

    expect(mockGitOps.commit).toHaveBeenCalled();
    expect(mockGitOps.pushSetUpstream).not.toHaveBeenCalled();
  });
});
