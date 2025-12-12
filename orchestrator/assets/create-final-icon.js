// Create final icon: gray gradient background, rounded corners, with emerald icon composited
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function createIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background (gray with slight gradient like ChatGPT)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4B5563'); // Gray-600
  gradient.addColorStop(0.5, '#374151'); // Gray-700
  gradient.addColorStop(1, '#1F2937'); // Gray-800

  // Fill with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add rounded corners (like ChatGPT - rounded square)
  const cornerRadius = 200; // Generous rounding
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

  // Load and composite the emerald icon
  try {
    const emeraldIconPath = '/Users/anthonyfiggins/.cursor/projects/Users-anthonyfiggins-Library-CloudStorage-GoogleDrive-amfiggins-gmail-com-Other-computers-Silabs-Documents-GitHub/assets/Icon_Emerald-30aafdd3-763b-47d3-b204-ce6bac9ed536.png';
    const emeraldIcon = await loadImage(emeraldIconPath);
    
    // Calculate padding (generous whitespace like ChatGPT)
    const padding = 200; // Lots of padding
    const iconWidth = size - (padding * 2);
    const iconHeight = size - (padding * 2);
    
    // Center the emerald icon
    const iconX = padding;
    const iconY = padding;
    
    // Draw the emerald icon (it should be transparent)
    ctx.drawImage(emeraldIcon, iconX, iconY, iconWidth, iconHeight);
    
    console.log('✅ Composited emerald icon on gray gradient background');
  } catch (error) {
    console.error('Error loading emerald icon:', error.message);
    // Fallback: draw a simple emerald square
    const padding = 200;
    ctx.fillStyle = '#34D399';
    ctx.fillRect(padding, padding, size - (padding * 2), size - (padding * 2));
    console.log('⚠️  Used fallback emerald square');
  }

  // Save the final icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('icon_final.png', buffer);
  console.log('✅ Created final icon: icon_final.png');
  console.log('   - Gray gradient background');
  console.log('   - Rounded corners (200px radius)');
  console.log('   - Emerald icon composited with padding');
}

createIcon().catch(console.error);
