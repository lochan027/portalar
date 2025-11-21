/**
 * AR Marker Generator
 * 
 * Generates AR.js-compatible marker patterns for image tracking.
 * Two methods:
 * 1. Companion Marker: Separate high-contrast pattern alongside QR
 * 2. Enhanced QR: Embed AR-friendly patterns into QR error correction
 * 
 * Usage:
 *   node generate-marker.js --markerId=marker-news-001 --method=companion
 *   npm run generate-marker -- --markerId=marker-ad-001 --method=enhanced-qr
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const sharp = require('sharp');

// Parse command line arguments
program
  .requiredOption('-m, --markerId <id>', 'Marker ID')
  .option('--method <type>', 'Generation method: companion or enhanced-qr', 'companion')
  .option('-o, --output <dir>', 'Output directory', './output/markers')
  .option('-s, --size <pixels>', 'Marker size in pixels', '2048')
  .option('--high-contrast', 'Use higher contrast for better tracking')
  .parse(process.argv);

const options = program.opts();

async function generateMarker() {
  console.log(chalk.blue('\n🎯 PortalAR Marker Generator\n'));

  const { markerId, method, output, size, highContrast } = options;

  console.log(chalk.gray(`Marker ID: ${markerId}`));
  console.log(chalk.gray(`Method:    ${method}\n`));

  // Create output directory
  const outputDir = path.resolve(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (method === 'companion') {
    await generateCompanionMarker(markerId, outputDir, parseInt(size), highContrast);
  } else if (method === 'enhanced-qr') {
    await generateEnhancedQR(markerId, outputDir, parseInt(size));
  } else {
    console.error(chalk.red(`❌ Invalid method: ${method}`));
    console.log(chalk.yellow('Valid methods: companion, enhanced-qr'));
    process.exit(1);
  }
}

/**
 * Generate companion marker (recommended)
 * Creates a separate AR-optimized pattern image
 */
async function generateCompanionMarker(markerId, outputDir, size, highContrast) {
  console.log(chalk.yellow('📐 Generating companion AR marker...\n'));

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Black border (required for AR.js marker detection)
  const borderWidth = size * 0.1;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, borderWidth); // Top
  ctx.fillRect(0, size - borderWidth, size, borderWidth); // Bottom
  ctx.fillRect(0, 0, borderWidth, size); // Left
  ctx.fillRect(size - borderWidth, 0, borderWidth, size); // Right

  // Generate unique pattern for this marker
  // Use marker ID as seed for consistent pattern
  const seed = hashCode(markerId);
  const random = seededRandom(seed);

  const gridSize = 6; // 6×6 grid inside border
  const cellSize = (size - 2 * borderWidth) / gridSize;
  const minContrast = highContrast ? 0.8 : 0.6;

  ctx.fillStyle = '#000000';

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Random cell fill with minimum contrast threshold
      if (random() > minContrast) {
        const cellX = borderWidth + x * cellSize;
        const cellY = borderWidth + y * cellSize;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      }
    }
  }

  // Add marker ID text (small, bottom center)
  ctx.fillStyle = '#000000';
  ctx.font = `${size * 0.03}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(markerId, size / 2, size - borderWidth / 3);

  // Save marker image
  const markerPath = path.join(outputDir, `ar-marker-${markerId}.png`);
  const buffer = canvas.toBuffer('image/png');
  await sharp(buffer)
    .png({ quality: 100 })
    .toFile(markerPath);

  console.log(chalk.green('✅ Companion marker generated!\n'));
  console.log(chalk.white(`📁 Image: ${markerPath}\n`));

  // Generate AR.js pattern file (.patt)
  await generatePattFile(markerId, markerPath, outputDir);

  // Generate combined print layout
  await generateCombinedPrint(markerId, outputDir);

  printMarkerInstructions('companion', markerId);
}

/**
 * Generate enhanced QR marker
 * Embeds AR patterns into QR error correction areas
 */
async function generateEnhancedQR(markerId, outputDir, size) {
  console.log(chalk.yellow('📐 Generating enhanced QR marker...\n'));

  // Check if QR exists
  const qrPath = path.resolve('./output/qr-codes', `qr-${markerId}.png`);
  
  if (!fs.existsSync(qrPath)) {
    console.error(chalk.red(`❌ QR code not found: ${qrPath}`));
    console.log(chalk.yellow('Generate QR first: npm run generate-qr -- --markerId=' + markerId));
    process.exit(1);
  }

  // Load QR image
  const qrImage = await loadImage(qrPath);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw QR code
  ctx.drawImage(qrImage, 0, 0, size, size);

  // Enhance contrast for better AR tracking
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const enhanced = avg < 128 ? 0 : 255;
    data[i] = data[i + 1] = data[i + 2] = enhanced;
  }

  ctx.putImageData(imageData, 0, 0);

  // Add corner markers for AR.js (small squares in corners)
  const cornerSize = size * 0.05;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, cornerSize, cornerSize); // Top-left
  ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize); // Top-right
  ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize); // Bottom-left

  // Save enhanced marker
  const markerPath = path.join(outputDir, `enhanced-qr-${markerId}.png`);
  const buffer = canvas.toBuffer('image/png');
  await sharp(buffer)
    .png({ quality: 100 })
    .toFile(markerPath);

  console.log(chalk.green('✅ Enhanced QR marker generated!\n'));
  console.log(chalk.white(`📁 Image: ${markerPath}\n`));

  // Generate pattern file
  await generatePattFile(markerId, markerPath, outputDir);

  printMarkerInstructions('enhanced-qr', markerId);
}

/**
 * Generate AR.js .patt pattern file
 * This file is used by AR.js for marker recognition
 */
async function generatePattFile(markerId, imagePath, outputDir) {
  // For now, create a placeholder .patt file
  // In production, use AR.js marker training tool: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
  
  const pattPath = path.join(outputDir, `${markerId}.patt`);
  
  const placeholder = `# AR.js Pattern File
# Generated for marker: ${markerId}
# Train this marker at: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
# Upload image: ${imagePath}
#
# This is a placeholder. For production use, generate actual pattern data using AR.js training tool.
`;

  fs.writeFileSync(pattPath, placeholder);
  
  console.log(chalk.green('📄 Pattern file created (placeholder)\n'));
  console.log(chalk.yellow('⚠️  For production: Train marker at AR.js marker training tool'));
  console.log(chalk.gray('   https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html\n'));
}

/**
 * Generate combined print layout (QR + AR marker side by side)
 */
async function generateCombinedPrint(markerId, outputDir) {
  const PDFDocument = require('pdfkit');
  const pdfPath = path.join(outputDir, `combined-${markerId}.pdf`);

  const qrPath = path.resolve('./output/qr-codes', `qr-${markerId}.png`);
  const markerPath = path.join(outputDir, `ar-marker-${markerId}.png`);

  if (!fs.existsSync(qrPath)) {
    console.log(chalk.yellow('⚠️  QR code not found, skipping combined PDF'));
    return;
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('PortalAR Marker Set', { align: 'center' });

    doc.moveDown();

    // Layout: QR on left, AR marker on right
    const imageSize = 300;
    const spacing = 50;
    const totalWidth = imageSize * 2 + spacing;
    const startX = (doc.page.width - totalWidth) / 2;
    let y = doc.y + 20;

    // QR Code
    doc.image(qrPath, startX, y, { width: imageSize, height: imageSize });
    doc.fontSize(12)
       .text('1. Scan QR Code', startX, y + imageSize + 10, { width: imageSize, align: 'center' });

    // AR Marker
    doc.image(markerPath, startX + imageSize + spacing, y, { width: imageSize, height: imageSize });
    doc.fontSize(12)
       .text('2. Point at AR Marker', startX + imageSize + spacing, y + imageSize + 10, { width: imageSize, align: 'center' });

    // Instructions
    doc.moveDown(8);
    doc.fontSize(10)
       .font('Helvetica')
       .text('Instructions: Scan QR code with phone camera to open app, then point camera at AR marker to see content.', { align: 'center' });

    doc.moveDown();
    doc.fontSize(8)
       .fillColor('gray')
       .text(`Marker ID: ${markerId}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      console.log(chalk.green('✅ Combined print PDF generated!\n'));
      console.log(chalk.white(`📄 PDF: ${pdfPath}\n`));
      resolve();
    });

    stream.on('error', reject);
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let value = seed;
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function printMarkerInstructions(method, markerId) {
  console.log(chalk.yellow('📋 Usage Instructions:\n'));

  if (method === 'companion') {
    console.log(chalk.white('  Setup:'));
    console.log(chalk.white('    1. Print the combined PDF (QR + AR marker side by side)'));
    console.log(chalk.white('    2. Use matte paper, minimum 8×10 inches'));
    console.log(chalk.white('    3. Each marker should be at least 4×4 inches\n'));

    console.log(chalk.white('  User Flow:'));
    console.log(chalk.white('    1. User scans QR code → opens web app'));
    console.log(chalk.white('    2. User points phone at AR marker → AR content appears\n'));
  } else {
    console.log(chalk.white('  Setup:'));
    console.log(chalk.white('    1. Print the enhanced QR marker'));
    console.log(chalk.white('    2. Minimum 5×5 inches for reliable tracking'));
    console.log(chalk.white('    3. Single image serves both purposes\n'));

    console.log(chalk.white('  User Flow:'));
    console.log(chalk.white('    1. User scans QR → opens app'));
    console.log(chalk.white('    2. Same QR code is tracked for AR overlay\n'));
  }

  console.log(chalk.yellow('⚠️  Important:\n'));
  console.log(chalk.white('  • Copy .patt file to: frontend/public/markers/'));
  console.log(chalk.white(`  • Train marker at: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/`));
  console.log(chalk.white('  • Test marker detection before printing large quantities\n'));

  console.log(chalk.yellow('📂 Next Steps:\n'));
  console.log(chalk.gray(`  1. Copy ${markerId}.patt to frontend/public/markers/`));
  console.log(chalk.gray(`  2. Test marker: npm run test-marker -- --file=output/markers/ar-marker-${markerId}.png`));
  console.log(chalk.gray(`  3. Print and test in real environment\n`));
}

// Run generator
generateMarker();
