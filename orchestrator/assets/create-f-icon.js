// Create F icon using Node.js Canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

const size = 1024;
const padding = 220; // Lots of whitespace like ChatGPT
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// White background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, size, size);

// Draw F in emerald green
ctx.fillStyle = '#34D399'; // Emerald green
ctx.font = 'bold 500px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('F', size / 2, size / 2);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon_f_white_bg.png', buffer);
console.log('✅ Created F icon with white background!');
