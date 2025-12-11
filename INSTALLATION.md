# Installation Guide

## macOS Installation

### Download

1. Go to the [Releases page](https://github.com/tkottke90/ai-mind-map/releases)
2. Download the appropriate DMG file for your Mac:
   - **Apple Silicon (M1/M2/M3)**: Download the file ending in `_aarch64.dmg`
   - **Intel Macs**: Download the file ending in `_x64.dmg`

### Install

1. **Open the DMG file** you downloaded
2. **Drag "AI Mind Map"** to your Applications folder
3. **Eject the DMG** from Finder

### First Launch (Important!)

Since this app is currently **unsigned**, macOS will block it from opening normally. Follow these steps:

#### Method 1: Right-Click to Open (Recommended)

1. Open **Finder** and go to your **Applications** folder
2. **Right-click** (or Control-click) on "AI Mind Map"
3. Select **"Open"** from the menu
4. Click **"Open"** in the security dialog that appears
5. The app will now open and remember this choice

#### Method 2: System Settings

If the right-click method doesn't work:

1. Try to open the app normally (it will be blocked)
2. Open **System Settings** → **Privacy & Security**
3. Scroll down to the **Security** section
4. You'll see a message about "AI Mind Map" being blocked
5. Click **"Open Anyway"**
6. Confirm by clicking **"Open"**

### Troubleshooting

#### "AI Mind Map is damaged and can't be opened"

This is a common macOS security message for unsigned apps. Try:

```bash
# Remove the quarantine attribute
xattr -cr /Applications/AI\ Mind\ Map.app
```

Then try opening the app again.

#### App won't open at all

1. Make sure you downloaded the correct version for your Mac
2. Check that you have macOS 15.0 or later
3. Try the quarantine removal command above

#### Still having issues?

[Open an issue](https://github.com/tkottke90/ai-mind-map/issues) with:
- Your macOS version
- Your Mac model (Intel or Apple Silicon)
- The exact error message you're seeing

## Prerequisites

### Ollama (Required)

AI Mind Map requires Ollama to be installed and running for AI chat features.

1. **Install Ollama**: Visit [ollama.ai](https://ollama.ai) and download
2. **Pull a model**: Open Terminal and run:
   ```bash
   ollama pull llama2
   ```
   Or any other model you prefer (e.g., `mistral`, `codellama`)
3. **Verify Ollama is running**: The Ollama icon should appear in your menu bar

## Uninstallation

To remove AI Mind Map:

1. **Quit the app** if it's running
2. **Delete from Applications**:
   ```bash
   rm -rf /Applications/AI\ Mind\ Map.app
   ```
3. **Remove user data** (optional):
   ```bash
   rm -rf ~/.ai-mind-map
   ```

## Updates

Currently, updates must be installed manually:

1. Download the new version from Releases
2. Replace the old app in Applications with the new one
3. Your mind maps and settings are preserved

*Automatic updates may be added in a future release.*

## Privacy & Security

- **No telemetry**: This app doesn't collect or send any data
- **Local-only**: All AI processing happens on your machine via Ollama
- **Your data**: Mind maps are stored locally in `~/.ai-mind-map/`

## Getting Help

- **Documentation**: See the [README](README.md)
- **Issues**: [GitHub Issues](https://github.com/tkottke90/ai-mind-map/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tkottke90/ai-mind-map/discussions)

