# Release Guide

This document describes how to create a new release of AI Mind Map.

## Prerequisites

- Write access to the repository
- All changes committed and pushed to `main` branch
- Tests passing (if applicable)

## Release Process

### 1. Update Version Numbers

Update the version in **three** places:

**package.json:**
```json
{
  "version": "0.1.0"  // Update this
}
```

**src-tauri/Cargo.toml:**
```toml
[package]
version = "0.1.0"  # Update this
```

**src-tauri/tauri.conf.json:**
```json
{
  "version": "0.1.0"  // Update this
}
```

### 2. Update CHANGELOG.md

Move items from `[Unreleased]` to a new version section:

```markdown
## [0.2.0] - 2025-01-15

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix Z
```

### 3. Commit Version Changes

```bash
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json CHANGELOG.md
git commit -m "chore: bump version to 0.2.0"
git push origin main
```

### 4. Create and Push Git Tag

```bash
# Create the tag
git tag v0.2.0

# Push the tag to GitHub
git push origin v0.2.0
```

**This will automatically trigger the GitHub Actions workflow!**

### 5. Monitor the Build

1. Go to: https://github.com/YOUR_USERNAME/ai-mind-map/actions
2. Watch the "Release" workflow run
3. Wait for both builds to complete (Apple Silicon + Intel)

### 6. Publish the Release

1. Go to: https://github.com/YOUR_USERNAME/ai-mind-map/releases
2. Find the draft release created by the workflow
3. Review the release notes and assets
4. Click **"Publish release"**

## Manual Trigger (Alternative)

If you don't want to use tags, you can manually trigger a release:

1. Go to: https://github.com/YOUR_USERNAME/ai-mind-map/actions
2. Click on "Release" workflow
3. Click "Run workflow" button
4. Select the branch (usually `main`)
5. Click "Run workflow"

**Note:** Manual triggers will still use the version from your config files.

## What Gets Built

The workflow builds **two DMG files**:

- `AI-Mind-Map_0.2.0_aarch64.dmg` - For Apple Silicon Macs (M1/M2/M3)
- `AI-Mind-Map_0.2.0_x64.dmg` - For Intel Macs

## Troubleshooting

### Build Fails

- Check the Actions logs for errors
- Ensure all dependencies are correctly specified
- Verify Rust and Node versions are compatible

### Version Mismatch

All three version numbers must match:
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

### Tag Already Exists

If you need to re-release:
```bash
# Delete local tag
git tag -d v0.2.0

# Delete remote tag
git push origin :refs/tags/v0.2.0

# Recreate and push
git tag v0.2.0
git push origin v0.2.0
```

## Release Checklist

- [ ] Version updated in all three files
- [ ] CHANGELOG.md updated
- [ ] Changes committed and pushed
- [ ] Git tag created and pushed
- [ ] GitHub Actions workflow completed successfully
- [ ] Draft release reviewed
- [ ] Release published
- [ ] Download and test DMG files
- [ ] Announce release (if applicable)

## Future Enhancements

When you're ready to add code signing:

1. Get an Apple Developer account ($99/year)
2. Create a Developer ID Application certificate
3. Add secrets to GitHub repository
4. Update workflow to include signing steps

See the [Tauri documentation](https://v2.tauri.app/distribute/sign/macos/) for details.

