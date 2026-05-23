---
bump: patch
---

# fix(git): handle double quotes in commit subjects

`getFileAddCommit` previously built the `git log` output as an inline JSON string using `--format={"hash": "%H", "subject": "%s", ...}`. This caused `JSON.parse` to throw whenever a commit subject contained double quotes (e.g. `fix: resolve "foo" issue`).

The format string is now replaced with a custom separator (`||CNGPAC_SEP||`) and the output is split by that separator instead of parsed as JSON, making it robust against any characters in commit subjects.