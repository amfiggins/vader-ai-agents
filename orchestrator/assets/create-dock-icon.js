const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function createDockIcon() {
  const size = 1024;
  const cornerRadius = 200;
  const padding = 220; // generous padding so the F is not oversized
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Dark gray gradient background to match the app's dark theme
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#2f343b');
  gradient.addColorStop(0.5, '#24282f');
  gradient.addColorStop(1, '#1b1f26');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Rounded square clip
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

  // Redraw gradient inside clip
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Load provided F icon (SVG) and composite with padding
  const iconPath = path.join(__dirname, 'FIcon.svg');
  const icon = await loadImage(iconPath);

  const iconSize = size - padding * 2;
  const iconX = padding;
  const iconY = padding;

  ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);

  // Save PNG output
  const outputPath = path.join(__dirname, 'icon_dock.png');
  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));

  console.log('✅ Created dock icon PNG at', outputPath);
  console.log('   - 1024x1024');
  console.log('   - Dark gray gradient with rounded corners (200px)');
  console.log('   - Green F centered with padding');
}

createDockIcon().catch((error) => {
  console.error('Failed to create dock icon:', error);
  process.exit(1);
});



