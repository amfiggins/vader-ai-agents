// Create proper icon like ChatGPT - gray background, rounded corners, gradient, with emerald icon
const fs = require('fs');
const { createCanvas } = require('canvas');

const size = 1024;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Create gradient background (gray with slight gradient)
const gradient = ctx.createLinearGradient(0, 0, size, size);
gradient.addColorStop(0, '#4B5563'); // Gray-600
gradient.addColorStop(1, '#374151'); // Gray-700

// Fill with gradient
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, size, size);

// Add rounded corners (we'll do this by creating a rounded rectangle path)
const cornerRadius = 180; // Rounded corners like ChatGPT
ctx.beginPath();
ctx.moveTo(cornerRadius, 0);
ctx.lineTo(size - cornerRadius, 0);
ctx.quadraticCurveTo(size, 0, size, cornerRadius);
ctx.lineTo(size, size - cornerRadius);
ctx.quadraticCurveTo(size, size, size - cornerRadius, size);
ctx.lineTo(cornerRadius, size);
ctx.quadraticCurveTo(0, size, 0, size - cornerRadius);
ctx.lineTo(0, cornerRadius);
ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
ctx.closePath();
ctx.clip();

// Redraw gradient in clipped area
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, size, size);

// Now we need to load and composite the emerald icon
// For now, we'll create a placeholder - the actual icon will be composited
// The emerald icon should be centered with padding

// Calculate padding (like ChatGPT - lots of whitespace)
const padding = 180; // Generous padding
const iconSize = size - (padding * 2);

// Center position
const iconX = padding;
const iconY = padding;

// Draw a placeholder for the emerald icon (we'll composite the actual PNG)
// For now, create a simple emerald square as placeholder
ctx.fillStyle = '#34D399'; // Emerald green
ctx.fillRect(iconX, iconY, iconSize, iconSize);

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon_gray_bg.png', buffer);
console.log('✅ Created gray gradient icon base!');
console.log('Note: Need to composite the actual emerald icon PNG on top');
