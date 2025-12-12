# Applying an Icon to the Orchestrator App

I've created a script to easily apply one of your logo icons to the app. Here's how to do it:

## Quick Steps

1. **Download an icon from your Google Drive:**
   - Go to: https://drive.google.com/drive/folders/1PNqlyosSqQlQ_lIiAoMvsbynj3V_bhG0
   - Download one of these icon files:
     - `Icon_Torch-Red.png` ⭐ (Recommended - bold and visible)
     - `Icon_Emerald.png`
     - `Icon_Dodger-Blue.png`
     - `Icon_Java.png`
     - `Icon_Outrageous-Orange.png`
     - `Icon_Tan-Hide.png`

2. **Run the icon script:**
   ```bash
   cd "/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"
   ./set-app-icon.sh ~/Downloads/Icon_Torch-Red.png
   ```
   (Replace with the path where you downloaded the icon)

## Alternative: Manual Method

If you prefer to do it manually:

1. **Download an icon** from Google Drive (any of the Icon_*.png files)

2. **Open Finder** and navigate to:
   ```
   ~/Applications/Vader AI Orchestrator.app
   ```

3. **Right-click** the app → **Get Info**

4. **Click the icon** in the top-left corner of the Info window (it will get a blue highlight)

5. **Drag your downloaded icon file** onto the icon area, OR
   - Copy the icon file (Cmd+C)
   - Click the app icon in Info window
   - Paste (Cmd+V)

6. **Close the Info window**

The icon should now appear in your Dock and Finder!

## Recommended Icon

I recommend **Icon_Torch-Red.png** because:
- Red is bold and stands out in the dock
- High contrast makes it easy to spot
- Professional appearance

But feel free to choose any color that matches your preference!
