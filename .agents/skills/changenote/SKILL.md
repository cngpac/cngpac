---
name: changenote
description: "Add or edit a changenote with cngpac for staged or unstaged changes. Use when: creating a changenote, recording a change, documenting a code change for release, editing or updating an existing changenote."
argument-hint: "[Optionally provide <bump type>(patch/minor/major) and <title>. Pass --branch to create a branch]"
---

# Add or Edit a Changenote

Create or update a changenote that documents staged or unstaged code changes for the next release.

## When to Use

- After making code changes that need to be tracked for the changelog
- When the code changes are not staged yet
- When you want to record a patch, minor, or major change
- When refining an existing changenote before committing
- Before committing with `cngpac commit`

## Companion Skills

Check the skills available in the current context before starting:

- **`commit-message`** — if present, load and follow it to choose the changenote title and commit name. If absent, use the fallback in step 3.
- **`changenote-customizations`** — if present, load and follow it for project-specific commands, body rules, and branch overrides. It takes precedence over the defaults in this skill.

If a companion skill is unavailable, use the defaults in this skill.

## Procedure

### 1. Review changes

Inspect the full worktree diff — staged and unstaged changes together:

```sh
git diff HEAD | cat
```

Use `git diff --staged | cat` instead when the changenote should intentionally cover only staged work.

Use `git status --short` to catch untracked files, then read the relevant ones. A changenote can be created while the source changes remain unstaged.

If there are no tracked or untracked changes, ask the user which change the changenote should describe.

### 2. Determine bump type

| Bump    | When                                      |
| ------- | ----------------------------------------- |
| `patch` | Bug fixes, typo corrections, minor tweaks |
| `minor` | New features, non-breaking additions      |
| `major` | Breaking changes                          |

The bump applies to the described change, whether it is staged or unstaged.

### 3. Determine the title

Use the `commit-message` skill when it is available.

If it is not available, follow the [Conventional Commits](https://www.conventionalcommits.org/) style:

```
<type>[optional scope]: <description>
```

- **`<type>`** — the category of the change. Use the types already in the repository's commit history; if none are established, use `feat`, `fix`, `change`, `docs`, `chore`.
- **`[optional scope]`** — one or more nouns describing the affected area, e.g. `feat(cli):`
- **`<description>`** — a short, imperative-tense summary (lowercase, no trailing period)
- Add `!` when the change is breaking
- Keep the title under ~70 characters when possible

### 4. Find an existing changenote (editing)

Before creating a new file, check whether the work already has a changenote:

```sh
git status --short -- .changenotes
```

If an existing note covers the change, update it in place:

1. Read the file.
2. Update the `bump` frontmatter and `# <title>` heading if the scope or title changed.
3. Update the body to match the current diff — do not duplicate existing paragraphs.

Only create a new changenote when no existing note covers the change. If several notes exist and none clearly matches, ask the user which one to edit.

### 5. Create or update the changenote

If `changenote-customizations` defines a create command, use it. Otherwise detect the project's package manager and run the locally installed CLI:

- **pnpm** — `pnpm-lock.yaml` exists or `packageManager` begins with `pnpm@`:
  ```sh
  pnpm exec cngpac change <bump> "<title>"
  ```
- **npm** — `package-lock.json`/`npm-shrinkwrap.json` exists or `packageManager` begins with `npm@`:
  ```sh
  npm exec -- cngpac change <bump> "<title>"
  ```
- **bun** — `bun.lockb`/`bun.lock` exists or `packageManager` begins with `bun@`:
  ```sh
  bun x cngpac change <bump> "<title>"
  ```
- **Fallback** — no matching indicator:
  ```sh
  npx cngpac change <bump> "<title>"
  ```

Check `package.json`'s `packageManager` field first, then fall back to the lockfile. If multiple lockfiles match and `packageManager` is absent, ask the user which package manager to use.

Prefer the local CLI. If it is not installed, fall back to `npx cngpac change <bump> "<title>"`.

Replace `<bump>` with `patch`, `minor`, or `major`, and `<title>` with the change title.

A new file is created at `.changenotes/<generated-name>.md` with this structure:

```markdown
---
bump: <bump>
---

# <title>
```

When editing, skip creation and update the existing file directly.

### 6. Add or update the description body

Create a body summarizing what the changes do — derived from the diff in step 1.

- Keep it concise but informative: what changed, why, and any notable details.
- Break it into paragraphs instead of one long block.
- Add small code snippets to illustrate new behavior or API changes when applicable.

Append or replace the body below the title heading of the changenote file.

### 7. Stage

Stage the changenote after editing it every time:

```sh
git add .changenotes/<changenote-filename>
```

Source changes may remain unstaged until you are ready to commit.

### 8. Create a branch

> **Run this step only** if `$ARGUMENTS` contains `--branch`. Otherwise leave the current branch unchanged.

If `changenote-customizations` defines branch rules, follow those instead.

1. **Classify the branch type** using the `<type>` from the changenote title (e.g. `feat(cli): add preview command` → `feat`).
2. **Determine the work description** from the changenote title, or from `$ARGUMENTS` when it provides a concise description. Keep it kebab-case, ASCII-only, and ideally 3 to 6 words.
3. **Generate the branch name** `<type>/<short-description>`.
4. **Choose the base** without prompting:
   1. Run `git branch --show-current` — if the output is a non-default branch name, branch from it. If it is empty (detached HEAD), branch from the current commit.
   2. Run `git remote` — use `origin` if present, otherwise the first listed remote. If no remotes exist, skip remote checks.
   3. The default branch is `main`. Fall back to `master` if `main` does not exist on the remote.
5. **Avoid collisions** by appending `-2`, `-3`, and so on until the name is unused locally and remotely.
6. **Create the branch:**
   ```bash
   git checkout -b <branch-name>
   ```
   Report the final branch name, but do not stop for confirmation.

## Completion Criteria

- [ ] Changenote file exists in `.changenotes/` with the correct bump type and title, or the existing changenote was updated
- [ ] Body describes the changes accurately
- [ ] Changenote is staged
- [ ] Branch created only when `--branch` was passed