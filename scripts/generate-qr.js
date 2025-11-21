/**
 * QR Code Generator
 * 
 * Generates QR codes that link to /scan/:markerId endpoints.
 * These QR codes can be printed and scanned by users to access AR experiences.
 * 
 * Usage:
 *   node generate-qr.js --markerId=marker-news-001 --baseUrl=https://your-domain.com
 *   npm run generate-qr -- --markerId=marker-ad-001
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');

// Parse command line arguments
program
  .requiredOption('-m, --markerId <id>', 'Marker ID')
  .option('-b, --baseUrl <url>', 'Base URL for the web app', 'http://localhost:3000')
  .option('-o, --output <dir>', 'Output directory', './output/qr-codes')
  .option('-s, --size <pixels>', 'QR code size in pixels', '1024')
  .option('--margin <modules>', 'QR code margin (quiet zone)', '4')
  .option('--errorCorrection <level>', 'Error correction level (L, M, Q, H)', 'H')
  .parse(process.argv);

const options = program.opts();

async function generateQRCode() {
  console.log(chalk.blue('\n🔲 PortalAR QR Code Generator\n'));

  const { markerId, baseUrl, output, size, margin, errorCorrection } = options;

  // Construct scan URL
  const scanUrl = `${baseUrl}/scan/${markerId}`;
  console.log(chalk.gray(`Marker ID: ${markerId}`));
  console.log(chalk.gray(`Scan URL:  ${scanUrl}\n`));

  // Create output directory
  const outputDir = path.resolve(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate QR code
  const filename = `qr-${markerId}.png`;
  const filepath = path.join(outputDir, filename);

  try {
    await QRCode.toFile(filepath, scanUrl, {
      width: parseInt(size),
      margin: parseInt(margin),
      errorCorrectionLevel: errorCorrection,
      color: {
        dark: '#000000',  // QR modules color
        light: '#FFFFFF'  // Background color
      },
      type: 'png',
    });

    console.log(chalk.green('✅ QR code generated successfully!\n'));
    console.log(chalk.white(`📁 File: ${filepath}`));
    console.log(chalk.white(`📐 Size: ${size}×${size} pixels\n`));

    // Print instructions
    printInstructions(scanUrl, filepath);

    // Generate print-ready version with metadata
    await generatePrintVersion(markerId, scanUrl, filepath, outputDir);

  } catch (error) {
    console.error(chalk.red('❌ Error generating QR code:'), error);
    process.exit(1);
  }
}

/**
 * Generate print-ready version with title and instructions
 */
async function generatePrintVersion(markerId, scanUrl, qrPath, outputDir) {
  const PDFDocument = require('pdfkit');
  const pdfPath = path.join(outputDir, `qr-${markerId}-print.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('PortalAR Experience', { align: 'center' });

    doc.moveDown(0.5);

    // Instructions
    doc.fontSize(12)
       .font('Helvetica')
       .text('Scan this QR code with your phone camera to view AR content', { align: 'center' });

    doc.moveDown(2);

    // QR Code (centered)
    const qrSize = 400;
    const pageWidth = doc.page.width;
    const xPosition = (pageWidth - qrSize) / 2;

    doc.image(qrPath, xPosition, doc.y, {
      width: qrSize,
      height: qrSize,
    });

    doc.moveDown(15);

    // Marker ID and URL
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Marker ID: ${markerId}`, { align: 'center' });

    doc.moveDown(0.5);

    doc.fontSize(8)
       .fillColor('gray')
       .text(scanUrl, { align: 'center' });

    // Footer
    doc.moveDown(2);
    doc.fontSize(9)
       .text('Powered by PortalAR', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      console.log(chalk.green('✅ Print-ready PDF generated!\n'));
      console.log(chalk.white(`📄 PDF:  ${pdfPath}\n`));
      resolve();
    });

    stream.on('error', reject);
  });
}

/**
 * Print usage instructions
 */
function printInstructions(scanUrl, filepath) {
  console.log(chalk.yellow('📋 Printing Instructions:\n'));
  console.log(chalk.white('  1. Print QR code at minimum 4×4 inches (10×10 cm)'));
  console.log(chalk.white('  2. Use matte white cardstock paper'));
  console.log(chalk.white('  3. Print at 300 DPI or higher'));
  console.log(chalk.white('  4. Avoid glossy paper (causes glare)'));
  console.log(chalk.white('  5. Laminate with matte lamination for durability\n'));

  console.log(chalk.yellow('🧪 Testing:\n'));
  console.log(chalk.white('  1. Open your phone camera app'));
  console.log(chalk.white(`  2. Point at the QR code`));
  console.log(chalk.white('  3. Tap the notification to open'));
  console.log(chalk.white(`  4. URL should be: ${scanUrl}\n`));

  console.log(chalk.yellow('🎯 AR Marker Setup:\n'));
  console.log(chalk.white('  Next step: Generate AR marker pattern'));
  console.log(chalk.gray(`  Run: npm run generate-marker -- --markerId=${program.opts().markerId}\n`));
}

// Run generator
generateQRCode();
