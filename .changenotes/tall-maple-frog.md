---
bump: minor
---

# impr(changelog): sort changenotes by commit date

Changenotes within a bump section of the generated changelog are now sorted in chronological order based on their commit date, rather than arbitrary file-system order.

The git log format was extended to capture the author date (`%aI`) alongside the existing hash and subject. This ISO 8601 datetime is stored on `ChangenoteCommit.datetime` and used as the sort key inside `createChangelogGenerator`.

This ensures the changelog accurately reflects the order in which changes were introduced when multiple changenotes share the same bump level.