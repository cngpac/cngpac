---
sidebar_position: 2
title: change
---

# cngpac change

Add a new changenote to describe a code change. Changenotes are the foundation of Cngpac's versioning system — each one records what changed and its semantic impact.

## Usage

```bash
cngpac change [bump] [title]
```

**Alias:** `cng`

## Arguments

| Argument | Required | Description                                                   |
| -------- | -------- | ------------------------------------------------------------- |
| `bump`   | No       | Bump type: `patch`, `minor`, or `major`. Prompted if omitted. |
| `title`  | No       | Title of the change. Prompted if omitted.                     |

## Interactive Mode

When called without arguments, the command prompts you:

```
$ cngpac change
◇ Adding a new changenote!
│
◆ Bump type?
│ ○ patch  (Bug fixes)
│ ● minor  (New features)
│ ○ major  (Breaking changes)
│
◆ Title of the change?
│ feat: add dark mode support
│
✔ Changenote added! .changenotes/brave-coral-fox.md
│ Add a body if needed.
│ Stage your changes.
◇ Run `cngpac commit` when ready to commit.
```

## Non-Interactive Mode

Pass both arguments to skip all prompts:

```bash
cngpac change minor "feat: add dark mode support"
```

## Output

Creates a markdown file in `.changenotes/` with a random human-readable ID:

```
.changenotes/brave-coral-fox.md
```

The file content looks like:

```markdown
---
bump: minor
---

# feat: add dark mode support

<!-- Add a longer description here if needed -->
```

## Next Steps

After creating a changenote:

1. Optionally edit the file to add a body with more details
2. Stage your code changes and the changenote
3. Run [`cngpac commit`](./commit.md) to commit