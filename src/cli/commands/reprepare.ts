import { join, relative } from "node:path";
import * as p from "@clack/prompts";
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
    `Updated prepare config (attempt: ${nextAttempt}): ${relative(rootDir, filePath)}`,
  );

  if (options.commit || options.push) {
    const gitOps = createGitOps(rootDir);
    await gitOps.add([".changenotes/prepare.json"]);
    const message = `chore: prepare ${existing.newVersion} (attempt ${nextAttempt})`;
    await gitOps.commit(message);
    p.log.success(`Committed: ${message}`);

    if (options.push) {
      await gitOps.push();
      p.log.success("Pushed to origin");
    }
  }

  p.outro(`Done. Prepared for attempt ${nextAttempt}.`);
}
