---
bump: major
---

# change!: nest noteNameGenerator under changenote config

The top-level `noteNameGenerator` option in `CngpacConfig` has been removed and replaced with a nested `changenote.nameGenerator` field. This groups changenote-related config together under a single namespace, making it easier to add future options.

**Before:**

```javascript
export default defineConfig({
  noteNameGenerator: () => `note-${Date.now()}`,
});
```

**After:**

```javascript
export default defineConfig({
  changenote: {
    nameGenerator: () => `note-${Date.now()}`,
  },
});
```

Update your `cngpac.config.ts` accordingly if you use a custom name generator.