import fs from "node:fs";
import { join, resolve } from "node:path";
import { type Mock, type MockInstance, vi } from "vitest";
import type { CngpacConfig } from "../../src/types";

/** Root directory for all test temp directories */
const TMP_ROOT = resolve(import.meta.dirname, "..", ".tmp");

/** Create an isolated temp directory for a test */
export function createTempDir(): string {
  const id = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const dir = join(TMP_ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Recursively remove a temp directory */
export function cleanupTempDir(dir: string): void {
  if (dir.startsWith(TMP_ROOT) && fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Spy on process.cwd() to return the given directory */
export function mockProcessCwd(dir: string): MockInstance {
  return vi.spyOn(process, "cwd").mockReturnValue(dir);
}

/** Spy on process.exit() to throw instead of exiting */
export function mockProcessExit(): MockInstance {
  return vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as () => never);
}

/** Create a mock git operations object matching the createGitOps() return type */
export function createMockGitOps(): Record<string, Mock> {
  return {
    currentBranch: vi.fn().mockResolvedValue("main"),
    getFileAuthors: vi
      .fn()
      .mockResolvedValue([{ name: "Test User", email: "test@example.com" }]),
    getFileAddCommit: vi.fn().mockResolvedValue({
      hash: "abc1234567890",
      subject: "test commit",
    }),
    getStagedFiles: vi.fn().mockResolvedValue([]),
    getUnstagedFiles: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    tag: vi.fn().mockResolvedValue(undefined),
    push: vi.fn().mockResolvedValue(undefined),
    pushSetUpstream: vi.fn().mockResolvedValue(undefined),
    pushTags: vi.fn().mockResolvedValue(undefined),
    ensureGitIdentity: vi.fn().mockResolvedValue(undefined),
  };
}

/** Create a minimal valid CngpacConfig for testing */
export function createMockConfig(
  overrides: Partial<CngpacConfig> = {},
): CngpacConfig {
  return {
    package: "package.json",
    repository: { owner: "test-owner", name: "test-repo" },
    changelog: {
      generator: vi.fn().mockResolvedValue("# Changelog\n\n- Test change"),
      ...overrides.changelog,
    },
    ...overrides,
  };
}

/** No-op stubs for all @clack/prompts UI functions */
export function createClackMocks(): {
  intro: Mock;
  outro: Mock;
  cancel: Mock;
  log: Record<string, Mock>;
  select: Mock;
  text: Mock;
  confirm: Mock;
  isCancel: Mock;
} {
  return {
    intro: vi.fn(),
    outro: vi.fn(),
    cancel: vi.fn(),
    log: {
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      step: vi.fn(),
      message: vi.fn(),
    },
    select: vi.fn(),
    text: vi.fn(),
    confirm: vi.fn(),
    isCancel: vi.fn().mockReturnValue(false),
  };
}
