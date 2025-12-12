#!/bin/bash

# Create a padded icon similar to ChatGPT style
ICON_SRC="/Users/anthonyfiggins/.cursor/projects/Users-anthonyfiggins-Library-CloudStorage-GoogleDrive-amfiggins-gmail-com-Other-computers-Silabs/Documents/GitHub/assets/Icon_Emerald-30aafdd3-763b-47d3-b204-ce6bac9ed536.png"
PADDED_ICON="/tmp/orchestrator-icon-padded.png"

# Target size for the icon (square)
TARGET_SIZE=1024
# Padding percentage (15% on each side = 30% total, so icon is 70% of canvas)
PADDING_PERCENT=0.15
ICON_SIZE=$(echo "$TARGET_SIZE * (1 - $PADDING_PERCENT * 2)" | bc | cut -d. -f1)
PADDING=$(( (TARGET_SIZE - ICON_SIZE) / 2 ))

echo "Creating padded icon..."
echo "Target size: ${TARGET_SIZE}x${TARGET_SIZE}"
echo "Icon size: ${ICON_SIZE}x${ICON_SIZE}"
echo "Padding: ${PADDING}px on each side"

# Resize original icon to icon size
sips -z $ICON_SIZE $ICON_SIZE "$ICON_SRC" --out /tmp/icon_resized.png > /dev/null 2>&1

# Create a transparent canvas at target size
# Use sips to create a transparent PNG
sips -z $TARGET_SIZE $TARGET_SIZE --setProperty format png "$ICON_SRC" --out /tmp/canvas.png > /dev/null 2>&1

# For compositing, we'll use a different approach - create the padded version directly
# Since sips doesn't have great compositing, we'll use ImageMagick if available, or a workaround

if command -v convert &> /dev/null; then
    # Use ImageMagick if available
    convert -size ${TARGET_SIZE}x${TARGET_SIZE} xc:transparent \
            \( /tmp/icon_resized.png -gravity center \) \
            -composite "$PADDED_ICON"
    echo "Created padded icon using ImageMagick"
elif command -v python3 &> /dev/null; then
    # Use Python with built-in libraries
    python3 << PYEOF
from PIL import Image
import sys

try:
    # Load the resized icon
    icon = Image.open('/tmp/icon_resized.png')
    
    # Create transparent canvas
    canvas = Image.new('RGBA', ($TARGET_SIZE, $TARGET_SIZE), (0, 0, 0, 0))
    
    # Calculate position to center
    x = ($TARGET_SIZE - $ICON_SIZE) // 2
    y = ($TARGET_SIZE - $ICON_SIZE) // 2
    
    # Paste icon onto canvas
    if icon.mode == 'RGBA':
        canvas.paste(icon, (x, y), icon)
    else:
        canvas.paste(icon, (x, y))
    
    # Save
    canvas.save('$PADDED_ICON', 'PNG')
    print(f"Created padded icon: $PADDED_ICON")
except ImportError:
    print("PIL not available, using sips workaround")
    sys.exit(1)
PYEOF
    if [ $? -ne 0 ]; then
        # Fallback: just use the resized icon (no padding, but at least it works)
        cp /tmp/icon_resized.png "$PADDED_ICON"
        echo "Fallback: using resized icon without padding"
    fi
else
    # Final fallback: use sips to create a square version
    sips -z $TARGET_SIZE $TARGET_SIZE "$ICON_SRC" --out "$PADDED_ICON" > /dev/null 2>&1
    echo "Fallback: using square version of original icon"
fi

echo "Padded icon created at: $PADDED_ICON"
