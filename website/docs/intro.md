---
sidebar_position: 1
slug: /intro
title: Introduction
---

# Introduction

**Cngpac** is a highly configurable package release manager for npm. It handles the entire release lifecycle — from documenting individual changes to publishing a package and creating a GitHub release — all driven by a single config file.

## The Problem

Releasing packages involves many error-prone manual steps: deciding the next version, writing a changelog, bumping `package.json`, tagging, pushing, publishing,creating GitHub release and whole bunch other stuffs. Each step is a chance for mistakes, and coordinating them across CI is tedious to set up.

## Existing Solutions

Tools like [Changesets](https://github.com/changesets/changesets) popularized the idea of documenting changes as discrete files. However, they offer limited configurability — the changelog format, versioning strategy, and release pipeline are largely fixed. If your workflow doesn't fit the defaults, you're left patching around the tool rather than configuring it.

## The Solution

Cngpac builds on the same changenote-based philosophy but is designed for **deep configuration** from the ground up. Every stage of the release pipeline — changelog formatting, version calculation, publishing, and releasing — is pluggable and composable. Cngpac consumes changenotes to automatically:

1. Calculate the correct semantic version bump
2. Generate a rich changelog with commit links, PR references, and contributor attribution
3. Update `package.json`
4. Commit, tag, and push
5. Publish to NPM
6. Create GitHub release

The entire pipeline is composable through **plugins** — swap or extend any part to fit your workflow.

## How It Works

Cngpac splits the release process into two phases:

### Development Phase (you do this)

```bash
npx cngpac change       # Add a changenote describing your change
npx cngpac commit       # Commit the changenote with its title as the message
npx cngpac prepare release --push  # Prepare version → commit → push → trigger CI
```

### CI Phase (automated)

```bash
npx cngpac version --commit --tag --push --publish --release
```

This single command reads the prepared version, consumes all changenotes, bumps the package, generates the changelog, and runs all publisher and releaser plugins.

## Next Steps

- [**Core Concepts**](./concepts.md) — Learn about changenotes, the versioning pipeline, and the plugin architecture
- [**Quick Start**](./quick-start.md) — Set up Cngpac in under a minute
- [**CLI Reference**](./cli/index.md) — Full documentation of every command
- [**Configuration**](./configuration.md) — Configure plugins, formatters, and more