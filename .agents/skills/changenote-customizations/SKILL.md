---
name: changenote-customizations
description: "Cngpac-specific changenote workflow customizations. Use when: creating or editing a changenote in the cngpac repository."
---

# Cngpac Changenote Customizations

> Apply these overrides only in the cngpac repository.

Project-specific overrides for the `changenote` skill.

The generic `changenote` skill covers editing, staging, and branch creation; this skill only overrides the create command.

## Command

Build the package before creating a changenote so the CLI reflects the current source:

```sh
pnpm run build
```

Then create the changenote with the local build:

```sh
node dist/bin.mjs change <bump> "<title>"
```