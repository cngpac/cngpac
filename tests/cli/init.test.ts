import fs from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writePackageJson } from "../helpers/fixtures";
import {
  cleanupTempDir,
  createClackMocks,
  createTempDir,
  mockProcessCwd,
  mockProcessExit,
} from "../helpers/setup";

// Mock @clack/prompts
const clack = createClackMocks();
vi.mock("@clack/prompts", () => clack);

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTempDir();
  mockProcessCwd(tmpDir);
  mockProcessExit();
});

afterEach(() => {
  cleanupTempDir(tmpDir);
  vi.restoreAllMocks();
});

// Use dynamic import to get the module after mocks are set up
async function getInitCommand() {
  const mod = await import("../../src/cli/commands/init");
  return mod.initCommand;
}

describe("init command", () => {
  it("creates config file and workflow from templates", async () => {
    // Set up env to detect npm
    vi.stubEnv("npm_config_user_agent", "npm/10.0.0");

    writePackageJson(tmpDir, {
      repository: {
        type: "git",
        url: "git+https://github.com/test-owner/test-repo.git",
      },
    });

    const initCommand = await getInitCommand();
    await initCommand();

    // Config file created
    const configPath = join(tmpDir, "cngpac.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
    const configContent = fs.readFileSync(configPath, "utf-8");
    expect(configContent).toContain("test-owner");
    expect(configContent).toContain("test-repo");
    expect(configContent).toContain("package.json");

    // Workflow created
    const workflowPath = join(tmpDir, ".github", "workflows", "version.yml");
    expect(fs.existsSync(workflowPath)).toBe(true);
    const workflowContent = fs.readFileSync(workflowPath, "utf-8");
    expect(workflowContent).toContain("npm ci");
    expect(workflowContent).toContain("actions/setup-node@v6");
  });

  it("detects repo from package.json repository field", async () => {
    writePackageJson(tmpDir, {
      repository: {
        type: "git",
        url: "git+https://github.com/my-org/my-lib.git",
      },
    });

    const initCommand = await getInitCommand();
    await initCommand();

    // Should have logged the detected repo
    expect(clack.log.info).toHaveBeenCalledWith(
      expect.stringContaining("my-org/my-lib"),
    );
    // Should NOT have prompted for owner/name
    expect(clack.text).not.toHaveBeenCalled();
  });

  it("prompts for owner and name when package.json has no repo", async () => {
    writePackageJson(tmpDir);
    clack.text
      .mockResolvedValueOnce("prompted-owner")
      .mockResolvedValueOnce("prompted-repo");

    const initCommand = await getInitCommand();
    await initCommand();

    expect(clack.text).toHaveBeenCalledTimes(2);
    const configContent = fs.readFileSync(
      join(tmpDir, "cngpac.config.ts"),
      "utf-8",
    );
    expect(configContent).toContain("prompted-owner");
    expect(configContent).toContain("prompted-repo");
  });

  it("skips existing files with a warning", async () => {
    writePackageJson(tmpDir, {
      repository: {
        type: "git",
        url: "git+https://github.com/test-owner/test-repo.git",
      },
    });

    // Pre-create the config file
    const configPath = join(tmpDir, "cngpac.config.ts");
    fs.writeFileSync(configPath, "existing content", "utf-8");

    const initCommand = await getInitCommand();
    await initCommand();

    // File should NOT be overwritten
    expect(fs.readFileSync(configPath, "utf-8")).toBe("existing content");
    // Should have warned
    expect(clack.log.warning).toHaveBeenCalledWith(
      expect.stringContaining("already exists"),
    );
  });

  it("detects pnpm from npm_config_user_agent", async () => {
    vi.stubEnv("npm_config_user_agent", "pnpm/9.0.0");
    // pm is computed at module load time, so we must reset modules
    // to force re-evaluation with the new env value
    vi.resetModules();

    writePackageJson(tmpDir, {
      repository: {
        type: "git",
        url: "git+https://github.com/test-owner/test-repo.git",
      },
    });

    const { initCommand } = await import("../../src/cli/commands/init");
    await initCommand();

    const workflowContent = fs.readFileSync(
      join(tmpDir, ".github", "workflows", "version.yml"),
      "utf-8",
    );
    expect(workflowContent).toContain("pnpm install --frozen-lockfile");
  });

  it("handles user cancellation at owner prompt", async () => {
    writePackageJson(tmpDir); // no repo field

    clack.text.mockResolvedValueOnce(Symbol("cancel"));
    clack.isCancel.mockImplementation(
      (val: unknown) => typeof val === "symbol",
    );

    const initCommand = await getInitCommand();
    await expect(initCommand()).rejects.toThrow("process.exit");
    expect(clack.cancel).toHaveBeenCalled();
  });
});
