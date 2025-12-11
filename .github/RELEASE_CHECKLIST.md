# Quick Release Checklist

## Pre-Release

- [ ] All features tested locally
- [ ] No known critical bugs
- [ ] Dependencies up to date (if needed)

## Version Bump

Update version in **all three files** to match (e.g., `0.2.0`):

- [ ] `package.json` → `"version": "0.2.0"`
- [ ] `src-tauri/Cargo.toml` → `version = "0.2.0"`
- [ ] `src-tauri/tauri.conf.json` → `"version": "0.2.0"`

## Changelog

- [ ] Update `CHANGELOG.md`
- [ ] Move items from `[Unreleased]` to new version section
- [ ] Add release date

## Commit & Tag

```bash
# Commit version changes
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json CHANGELOG.md
git commit -m "chore: bump version to 0.2.0"
git push origin main

# Create and push tag
git tag v0.2.0
git push origin v0.2.0
```

## Monitor Build

- [ ] Go to [Actions](../../actions)
- [ ] Watch "Release" workflow
- [ ] Verify both builds complete (Apple Silicon + Intel)

## Publish

- [ ] Go to [Releases](../../releases)
- [ ] Find the draft release
- [ ] Review release notes
- [ ] Verify both DMG files are attached
- [ ] Click "Publish release"

## Post-Release

- [ ] Download and test both DMG files
- [ ] Update README if needed
- [ ] Announce release (optional)

---

## Quick Commands

### Test build locally
```bash
npm run tauri build -- --target aarch64-apple-darwin
```

### Check versions match
```bash
grep '"version"' package.json
grep '^version' src-tauri/Cargo.toml
grep '"version"' src-tauri/tauri.conf.json
```

### Delete and recreate tag (if needed)
```bash
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0
git tag v0.2.0
git push origin v0.2.0
```

