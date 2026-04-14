import { join, relative } from "node:path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import { createGitOps, readPrepareConfig, writePrepareConfig } from "cngpac";

export interface ReprepareCommandOptions {
  commit?: boolean;
  push?: boolean;
}

export async function reprepareCommand(
  options: ReprepareCommandOptions = {},
): Promise<void> {
  const rootDir = process.cwd();
  const changenoteDir = join(rootDir, ".changenotes");

  p.intro("Re-preparing for version bump");

  const existing = await readPrepareConfig(changenoteDir);
  if (!existing) {
    p.log.error("No prepare.json found. Run `cngpac prepare` first.");
    process.exit(1);
  }

  const currentAttempt = existing.attempt ?? 1;
  const nextAttempt = currentAttempt + 1;
  const prepareconfig = { ...existing, attempt: nextAttempt };

  const filePath = await writePrepareConfig(changenoteDir, prepareconfig);
  p.log.success(
    `Updated ${relative(rootDir, filePath)} with attempt: ${nextAttempt}`,
  );

  if (options.commit || options.push) {
    const gitOps = createGitOps(rootDir);
    const branch = await gitOps.currentBranch();
    const branchLocal = chalk.cyan(branch);

    await gitOps.add([".changenotes/prepare.json"]);
    const message = `chore: prepare ${existing.newVersion} (attempt ${nextAttempt})`;
    await gitOps.commit(message);
    p.log.success(`Committed → ${message} → ${branchLocal}`);

    if (options.push) {
      p.log.success(`Pushing to origin`);
      await gitOps.push();
      p.log.success("Pushed to origin");
    }
  }

  p.outro(`Done. Prepared for attempt ${nextAttempt}.`);
}
