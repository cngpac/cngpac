---
bump: minor
---

# feat: add version plugin for custom commit message and tag name

Adds a new `VersionPlugin` type and optional `version` config field to `CngpacConfig`, allowing customization of the release commit message and git tag name.

Both `commitMessage` and `tagName` accept a function that receives the `VersionBump` object:

```javascript
export default defineConfig({
  version: {
    commitMessage: (vb) => `chore: release v${vb.newVersion}`,
    tagName: (vb) => `v${vb.newVersion}`,
  },
});
```

When not configured, the existing defaults are preserved (`Release <name>@<version>` for commits and `<name>@<version>` for tags).