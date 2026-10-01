---
bump: patch
---

# fix(version): build package after version bump in release pipeline

Previously, the `version` command updated the version in `package.json` but did not execute a build step before generating changelogs, staging files, and publishing. This could result in published artifacts containing outdated version strings or stale build output.

The release pipeline now introduces a build execution stage immediately following the version update. Users can configure the build stage via the `build` option in `cngpac.config.ts`, supporting an npm script, a shell command, or a custom plugin function:

```ts
export default defineConfig({
  build: { script: "build" },
});
```

Additionally, `cngpac version` now supports a `--no-build` flag to skip the build step when compiling is handled externally.