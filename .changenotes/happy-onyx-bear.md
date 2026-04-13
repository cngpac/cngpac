---
bump: minor
---

# impr: add colored branch output to commit command

The `commit` command now uses `chalk` to colorize branch names in the CLI output.

This improves visibility for both local and remote branch names during commit and push steps.

The change updates `src/cli/commands/commit.ts` to render the current branch in cyan and the remote branch in yellow when printing progress messages.