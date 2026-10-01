import { execSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectPackageManager, runBuild } from "../src/build";
import type { CngpacConfig, VersionBump } from "../src/types";
import {
  cleanupTempDir,
  createMockConfig,
  createTempDir,
  mockProcessCwd,
} from "./helpers/setup";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

let tmpDir: string;
let mockConfig: CngpacConfig;
const mockBump: VersionBump = {
  packageName: "test-package",
  currentVersion: "1.0.0",
  newVersion: "1.1.0",
  bump: "minor",
};

beforeEach(() => {
  tmpDir = createTempDir();
  mockProcessCwd(tmpDir);
  mockConfig = createMockConfig();
  vi.mocked(execSync).mockReset();
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

describe("runBuild", () => {
  it("does nothing when config.build is undefined", async () => {
    mockConfig.build = undefined;
    await runBuild(mockConfig, mockBump, tmpDir);
    expect(execSync).not.toHaveBeenCalled();
  });

  it("calls custom function when config.build is a function", async () => {
    const customBuild = vi.fn().mockResolvedValue(undefined);
    mockConfig.build = customBuild;

    await runBuild(mockConfig, mockBump, tmpDir);

    expect(customBuild).toHaveBeenCalledWith({
      versionBump: mockBump,
      config: mockConfig,
      rootDir: tmpDir,
    });
    expect(execSync).not.toHaveBeenCalled();
  });

  it("executes command when config.build is { command }", async () => {
    mockConfig.build = { command: "custom-build --flag" };

    await runBuild(mockConfig, mockBump, tmpDir);

    expect(execSync).toHaveBeenCalledWith(
      "custom-build --flag",
      expect.objectContaining({
        cwd: tmpDir,
        stdio: "inherit",
        env: expect.objectContaining({
          PATH: expect.stringContaining("node_modules"),
        }),
      }),
    );
  });

  it("executes npm script when config.build is { script }", async () => {
    const originalAgent = process.env.npm_config_user_agent;
    process.env.npm_config_user_agent = "pnpm/9.0.0 node/v24.0.0";
    try {
      mockConfig.build = { script: "compile" };

      await runBuild(mockConfig, mockBump, tmpDir);

      expect(execSync).toHaveBeenCalledWith(
        "pnpm run compile",
        expect.objectContaining({ cwd: tmpDir, stdio: "inherit" }),
      );
    } finally {
      process.env.npm_config_user_agent = originalAgent;
    }
  });

  it("throws descriptive error when execSync fails", async () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error("Command failed with exit code 1");
    });

    mockConfig.build = { command: "failing-build" };

    await expect(runBuild(mockConfig, mockBump, tmpDir)).rejects.toThrow(
      "Failed to build package test-package@1.1.0: Command failed with exit code 1",
    );
  });
});

describe("detectPackageManager", () => {
  const originalAgent = process.env.npm_config_user_agent;

  afterEach(() => {
    process.env.npm_config_user_agent = originalAgent;
  });

  it("detects pnpm", () => {
    process.env.npm_config_user_agent = "pnpm/9.0.0 node/v24.0.0";
    expect(detectPackageManager()).toBe("pnpm");
  });

  it("detects yarn", () => {
    process.env.npm_config_user_agent = "yarn/1.22.0 node/v24.0.0";
    expect(detectPackageManager()).toBe("yarn");
  });

  it("detects bun", () => {
    process.env.npm_config_user_agent = "bun/1.0.0";
    expect(detectPackageManager()).toBe("bun");
  });

  it("falls back to npm", () => {
    process.env.npm_config_user_agent = "";
    expect(detectPackageManager()).toBe("npm");
  });
});
