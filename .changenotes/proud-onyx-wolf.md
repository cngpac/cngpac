---
bump: minor
---

# feat(releasers/github): add customizable release name format

`createGitHubReleaser` now accepts an optional `nameFormat` string that controls how the GitHub release name is rendered. The format supports three template variables: `{packageName}`, `{version}`, and `{tagName}`.

When `nameFormat` is omitted, the existing default `"{packageName}@{version}"` is used, so this change is fully backward-compatible.

```ts
createGitHubReleaser({
  token: process.env.GITHUB_TOKEN!,
  nameFormat: "Release {packageName} v{version}",
});
```