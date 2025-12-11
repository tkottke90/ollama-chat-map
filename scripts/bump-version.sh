#!/bin/bash

# AI Mind Map Version Bump Script
# Usage: ./scripts/bump-version.sh 0.2.0

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Version number required"
  echo "Usage: ./scripts/bump-version.sh 0.2.0"
  exit 1
fi

NEW_VERSION=$1

# Validate version format (basic check)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Error: Invalid version format"
  echo "Expected format: X.Y.Z (e.g., 0.2.0)"
  exit 1
fi

echo "🔄 Bumping version to $NEW_VERSION..."

# Update package.json
echo "📝 Updating package.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak

# Update Cargo.toml
echo "📝 Updating src-tauri/Cargo.toml..."
sed -i.bak "s/^version = \".*\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
rm src-tauri/Cargo.toml.bak

# Update tauri.conf.json
echo "📝 Updating src-tauri/tauri.conf.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
rm src-tauri/tauri.conf.json.bak

echo ""
echo "✅ Version bumped to $NEW_VERSION in all files!"
echo ""
echo "📋 Next steps:"
echo "  1. Update CHANGELOG.md with changes for v$NEW_VERSION"
echo "  2. Review the changes: git diff"
echo "  3. Commit: git add -A && git commit -m 'chore: bump version to $NEW_VERSION'"
echo "  4. Tag: git tag v$NEW_VERSION"
echo "  5. Push: git push origin main && git push origin v$NEW_VERSION"
echo ""
echo "🚀 Or run this to commit and tag:"
echo "   git add -A && git commit -m 'chore: bump version to $NEW_VERSION' && git tag v$NEW_VERSION"

