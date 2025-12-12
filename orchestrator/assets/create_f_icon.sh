#!/bin/bash

# Create F icon with white background (ChatGPT style)
SIZE=1024
PADDING=220  # Lots of whitespace like ChatGPT
CANVAS=$SIZE

# Create white background using ImageMagick or sips
if command -v convert &> /dev/null; then
    # Use ImageMagick
    convert -size ${CANVAS}x${CANVAS} xc:white \
            -font "/System/Library/Fonts/Supplemental/Arial Bold.ttf" \
            -pointsize 500 \
            -fill "#34D399" \
            -gravity center \
            -annotate +0+0 "F" \
            icon_f_white_bg.png
    echo "Created F icon with ImageMagick"
elif command -v sips &> /dev/null; then
    # Create white square first
    sips -z $CANVAS $CANVAS --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericDocumentIcon.icns --out /tmp/white_bg.png 2>/dev/null || \
    sips -z $CANVAS $CANVAS --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericFolderIcon.icns --out /tmp/white_bg.png 2>/dev/null
    
    # For now, create a simple white square - we'll add the F using a different method
    # Actually, let's use a text overlay approach
    echo "Using sips method - creating base image"
fi

# Alternative: Create using text rendering
# We'll create an SVG first, then convert
cat > /tmp/f_icon.svg << 'SVGEOF'
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="white"/>
  <text x="512" y="512" font-family="Arial, sans-serif" font-size="500" font-weight="bold" fill="#34D399" text-anchor="middle" dominant-baseline="central">F</text>
</svg>
SVGEOF

# Convert SVG to PNG if we have the tools
if command -v rsvg-convert &> /dev/null; then
    rsvg-convert -w $CANVAS -h $CANVAS /tmp/f_icon.svg > icon_f_white_bg.png
    echo "Created F icon from SVG"
elif command -v qlmanage &> /dev/null; then
    # Use QuickLook to convert
    qlmanage -t -s 1024 -o . /tmp/f_icon.svg 2>/dev/null && mv /tmp/f_icon.svg.png icon_f_white_bg.png 2>/dev/null || echo "QuickLook conversion failed"
else
    echo "Need ImageMagick, rsvg-convert, or PIL to create icon"
    exit 1
fi
