const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const svgPath = '/Users/anthonyfiggins/Downloads/FIcon.icon/Assets/Figgins Constuling Icon - Ocean Green.svg';
const outputDir = path.join(__dirname);
const tempPng = path.join(outputDir, 'icon_temp_1024.png');
const iconsetDir = path.join(outputDir, 'icon_dock.iconset');
const outputIcns = path.join(outputDir, 'icon_dock.icns');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error('SVG file not found:', svgPath);
  process.exit(1);
}

console.log('Converting SVG to PNG at 1024x1024...');

// Use sips to convert SVG to PNG (sips can handle SVG on macOS)
try {
  execSync(`sips -s format png -z 1024 1024 "${svgPath}" --out "${tempPng}"`, { stdio: 'inherit' });
  console.log('✅ Created 1024x1024 PNG');
} catch (error) {
  console.error('Failed to convert SVG to PNG with sips:', error.message);
  console.log('Trying alternative: using qlmanage to convert...');
  try {
    // Alternative: use qlmanage to convert SVG
    execSync(`qlmanage -t -s 1024 -o "${outputDir}" "${svgPath}"`, { stdio: 'inherit' });
    const qlOutput = path.join(outputDir, 'Figgins Constuling Icon - Ocean Green.svg.png');
    if (fs.existsSync(qlOutput)) {
      fs.renameSync(qlOutput, tempPng);
      console.log('✅ Created 1024x1024 PNG using qlmanage');
    } else {
      throw new Error('qlmanage conversion failed');
    }
  } catch (err) {
    console.error('Both conversion methods failed. Please install ImageMagick or use another tool.');
    process.exit(1);
  }
}

// Create iconset directory
if (fs.existsSync(iconsetDir)) {
  execSync(`rm -rf "${iconsetDir}"`);
}
fs.mkdirSync(iconsetDir, { recursive: true });

console.log('Creating iconset with all required sizes...');

// Create all required icon sizes
const sizes = [16, 32, 64, 128, 256, 512, 1024];
for (const size of sizes) {
  const filename1x = `icon_${size}x${size}.png`;
  const filename2x = `icon_${size}x${size}@2x.png`;
  
  execSync(`sips -z ${size} ${size} "${tempPng}" --out "${path.join(iconsetDir, filename1x)}"`, { stdio: 'ignore' });
  execSync(`sips -z ${size * 2} ${size * 2} "${tempPng}" --out "${path.join(iconsetDir, filename2x)}"`, { stdio: 'ignore' });
}

console.log('✅ Created iconset with all sizes');

// Convert iconset to ICNS
console.log('Converting iconset to ICNS...');
try {
  execSync(`iconutil -c icns "${iconsetDir}" -o "${outputIcns}"`, { stdio: 'inherit' });
  console.log('✅ Created icon_dock.icns');
} catch (error) {
  console.error('Failed to convert iconset to ICNS:', error.message);
  process.exit(1);
}

// Cleanup
fs.unlinkSync(tempPng);
execSync(`rm -rf "${iconsetDir}"`);

console.log('✅ Icon conversion complete!');
console.log(`   Output: ${outputIcns}`);
