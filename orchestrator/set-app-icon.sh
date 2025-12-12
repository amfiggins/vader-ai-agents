#!/bin/bash

# Script to set a custom icon for the Vader AI Orchestrator app
# Usage: ./set-app-icon.sh /path/to/icon.png

APP_NAME="Vader AI Orchestrator"
APP_PATH="$HOME/Applications/${APP_NAME}.app"

if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/icon.png"
    echo ""
    echo "Available icons from your Google Drive:"
    echo "  - Icon_Dodger-Blue.png"
    echo "  - Icon_Emerald.png"
    echo "  - Icon_Java.png"
    echo "  - Icon_Outrageous-Orange.png"
    echo "  - Icon_Tan-Hide.png"
    echo "  - Icon_Torch-Red.png (recommended - bold and visible)"
    echo ""
    echo "Example:"
    echo "  1. Download Icon_Torch-Red.png from Google Drive"
    echo "  2. Run: $0 ~/Downloads/Icon_Torch-Red.png"
    exit 1
fi

ICON_PATH="$1"

if [ ! -f "$ICON_PATH" ]; then
    echo "Error: Icon file not found: $ICON_PATH"
    exit 1
fi

if [ ! -d "$APP_PATH" ]; then
    echo "Error: App not found at: $APP_PATH"
    echo "Please run create-app.sh first"
    exit 1
fi

echo "Setting icon for ${APP_NAME}..."
echo "Using icon: $ICON_PATH"

# Convert PNG to ICNS format (macOS preferred)
ICON_TEMP="/tmp/orchestrator_icon.iconset"
rm -rf "$ICON_TEMP"
mkdir -p "$ICON_TEMP"

# Create iconset with required sizes
echo "Converting icon to macOS format..."

# Use sips to create different sizes (macOS built-in tool)
sips -z 16 16 "$ICON_PATH" --out "${ICON_TEMP}/icon_16x16.png" > /dev/null 2>&1
sips -z 32 32 "$ICON_PATH" --out "${ICON_TEMP}/icon_16x16@2x.png" > /dev/null 2>&1
sips -z 32 32 "$ICON_PATH" --out "${ICON_TEMP}/icon_32x32.png" > /dev/null 2>&1
sips -z 64 64 "$ICON_PATH" --out "${ICON_TEMP}/icon_32x32@2x.png" > /dev/null 2>&1
sips -z 128 128 "$ICON_PATH" --out "${ICON_TEMP}/icon_128x128.png" > /dev/null 2>&1
sips -z 256 256 "$ICON_PATH" --out "${ICON_TEMP}/icon_128x128@2x.png" > /dev/null 2>&1
sips -z 256 256 "$ICON_PATH" --out "${ICON_TEMP}/icon_256x256.png" > /dev/null 2>&1
sips -z 512 512 "$ICON_PATH" --out "${ICON_TEMP}/icon_256x256@2x.png" > /dev/null 2>&1
sips -z 512 512 "$ICON_PATH" --out "${ICON_TEMP}/icon_512x512.png" > /dev/null 2>&1
sips -z 1024 1024 "$ICON_PATH" --out "${ICON_TEMP}/icon_512x512@2x.png" > /dev/null 2>&1

# Convert iconset to icns
ICON_ICNS="/tmp/orchestrator_icon.icns"
iconutil -c icns "$ICON_TEMP" -o "$ICON_ICNS" 2>/dev/null

if [ -f "$ICON_ICNS" ]; then
    # Apply ICNS file
    cp "$ICON_ICNS" "${APP_PATH}/Contents/Resources/icon.icns"
    # Update Info.plist to reference the icon
    /usr/libexec/PlistBuddy -c "Set :CFBundleIconFile icon.icns" "${APP_PATH}/Contents/Info.plist" 2>/dev/null || \
    /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string icon.icns" "${APP_PATH}/Contents/Info.plist" 2>/dev/null
    echo "Icon set successfully using ICNS format!"
else
    # Fallback: Use PNG directly (simpler but less optimal)
    echo "Using PNG format (ICNS conversion failed, but this will still work)..."
    cp "$ICON_PATH" "${APP_PATH}/Contents/Resources/icon.png"
fi

# Clear icon cache (forces macOS to reload the icon)
touch "$APP_PATH"
killall Finder 2>/dev/null || true
killall Dock 2>/dev/null || true

echo ""
echo "✅ Icon applied successfully!"
echo ""
echo "If the icon doesn't update immediately:"
echo "  1. Right-click the app in Finder → Get Info"
echo "  2. Click the icon in the top-left"
echo "  3. Press Cmd+V to paste, or drag the icon file onto it"
echo ""
echo "Or restart your Mac to clear all icon caches"
