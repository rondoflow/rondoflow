---
description: Cut a release — bump all workspace versions in sync, generate/update CHANGELOG.md from Conventional Commits, commit and tag (push gated on confirmation)
argument-hint: "[major|minor|patch|X.Y.Z|dry-run]  (empty = infer from commits)"
allowed-tools: Bash, Read, Edit, Write
---

Cut a new RondoFlow release. RondoFlow is a **single-version monorepo**: the root and all
`packages/*` share one version (`private: true`, cross-linked via `"*"`, so a bump never rewrites
dependency specs — they all move together). Nothing is published to npm; a "release" = synced
version bump + CHANGELOG entry + commit + annotated tag, optionally a GitHub release.

**Requested bump:** `$ARGUMENTS` — one of `major` / `minor` / `patch` / an explicit `X.Y.Z` /
`dry-run` (compute + preview, change nothing) / empty (infer from commits, see step 3).

Do the local steps automatically. **Stop before anything outward-facing** (push, GitHub release)
and ask — those are hard to undo; the commit and tag are local and reversible
(`git reset --soft HEAD~1`, `git tag -d`).

### 1. Preconditions (abort with a clear message if any fail)
```bash
git rev-parse --abbrev-ref HEAD          # expect: master
git status --porcelain                   # expect: empty (clean tree)
```
- Not on `master`, or tree not clean → **abort** and tell the user to commit/stash/switch first.
  (A clean tree keeps the release commit limited to version + changelog.) `dry-run` may proceed
  on a dirty tree since it changes nothing.

### 2. Establish the commit range
```bash
PREV=$(git describe --tags --abbrev=0 2>/dev/null)
RANGE=$([ -n "$PREV" ] && echo "$PREV..HEAD" || echo "HEAD")   # no tags yet → whole history
CUR=$(node -p "require('./package.json').version")
git log $RANGE --no-merges --pretty=format:'%h%x09%s'
```

### 3. Decide the next version
- Explicit `X.Y.Z` or `major|minor|patch` in `$ARGUMENTS` → use it verbatim.
- Empty → **infer** from the commits in range:
  - any `BREAKING CHANGE` footer or `type!:` → `major` (note: pre-1.0, a breaking change is
    conventionally a **minor** bump — call this out and prefer `minor` while `CUR` is `0.x`,
    unless the user passed `major`);
  - else any `feat:` / `feat(scope):` → `minor`;
  - else → `patch`.
- State the chosen bump and the resulting version before applying it.

### 4. Bump every workspace in sync (skip on `dry-run`)
```bash
npm version <type-or-X.Y.Z> --workspaces --include-workspace-root --no-git-tag-version --allow-same-version
NEW=$(node -p "require('./package.json').version")
```
This rewrites the `version` field in the root and every `packages/*/package.json` and updates
`package-lock.json`, **without** creating a git commit or tag (we control those). Confirm all five
versions match `$NEW`:
```bash
node -e "const f=['.','packages/ui','packages/server','packages/shared','packages/docs'];for(const d of f)console.log(d,require('./'+d+'/package.json').version)"
```

### 5. Generate the CHANGELOG.md entry
Format: **[Keep a Changelog](https://keepachangelog.com)** + **SemVer**. Date in UTC:
`DATE=$(date -u +%Y-%m-%d)`.

- If `CHANGELOG.md` doesn't exist, create it with the standard header:
  ```
  # Changelog

  All notable changes to RondoFlow are documented here. The format is based on
  [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
  [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
  ```
- Insert a new section **directly under the header**, newest first:
  ```
  ## [NEW] - DATE
  ```
- Group the range's commits by Conventional-Commit type → Keep-a-Changelog headings, in this
  order, omitting empty groups:
  | Commit type | Section |
  |---|---|
  | `feat` | **Added** |
  | `fix` | **Fixed** |
  | `perf`, `refactor` | **Changed** |
  | `docs` | **Documentation** |
  | `security` / any sec fix | **Security** |
  - Lead any breaking changes with a `> ⚠ **BREAKING:** …` line for that version.
  - Each entry: a short, human-readable rewrite of the subject (not the raw commit), the scope in
    parentheses if present, and the short hash in backticks — e.g.
    `- Add Perplexity provider support (server) \`a1b2c3d\``.
  - **Exclude noise:** merge commits, `chore`, `ci`, `build`, `test`, `style`, `revert` of
    same-release commits, and the previous `chore(release)` commits. If a non-conventional commit
    is clearly user-facing, classify it sensibly; if it's trivial ("u", "wip"), drop it.
- Add/refresh the compare link at the bottom of the file:
  ```
  [NEW]: https://github.com/rondoflow/rondoflow/compare/PREV...vNEW
  ```
  First release (no `PREV`) → `https://github.com/rondoflow/rondoflow/releases/tag/vNEW`.

On `dry-run`: print the computed version and the changelog entry you *would* write, then stop.

### 6. Commit + tag (skip on `dry-run`)
```bash
git add -A
git commit -m "chore(release): v$NEW"
git tag -a "v$NEW" -m "v$NEW"
```

### 7. Stop and confirm the outward-facing steps
Print a summary: old → new version, the changelog entry, and the exact follow-up commands.
**Do not run these without an explicit go-ahead:**
```bash
git push origin master --follow-tags
gh release create "v$NEW" --title "v$NEW" --notes-file <(…the new CHANGELOG section…)
```
If the user approves, run them; otherwise leave the local commit + tag in place and tell them how
to undo (`git tag -d v$NEW && git reset --soft HEAD~1`).
