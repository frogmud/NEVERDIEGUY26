#!/usr/bin/env node
/**
 * Batch ASCII Video Converter
 * Converts videos/GIFs to ASCII art WebM videos using ffmpeg + canvas
 *
 * Usage: node scripts/batch-ascii-video.js <input-dir> <output-dir>
 *
 * Settings (matching VideoAsciiTool defaults):
 * - Grid: 120x68
 * - Chars: minimal (' .:#')
 * - Threshold: 0.0
 * - Color: #e0e0e0
 * - FPS: 10
 */

const { createCanvas } = require('canvas');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ASCII settings (matching new defaults)
const CONFIG = {
  cols: 120,
  rows: 68,
  charSet: ' .:#',
  threshold: 0.0,
  color: '#e0e0e0',
  fps: 10,
  charWidth: 10,
  charHeight: 14,
};

function luminanceToChar(luminance, charSet) {
  if (luminance < CONFIG.threshold) return ' ';
  const clamped = Math.max(0, Math.min(1, luminance));
  const index = Math.floor(clamped * (charSet.length - 1));
  return charSet[index];
}

async function processVideo(inputPath, outputPath) {
  const tempDir = path.join(path.dirname(outputPath), '.temp-frames');
  const asciiDir = path.join(path.dirname(outputPath), '.temp-ascii');

  // Create temp directories
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(asciiDir, { recursive: true });

  try {
    console.log(`  Extracting frames...`);
    // Extract frames at target FPS
    execSync(`ffmpeg -y -i "${inputPath}" -vf "fps=${CONFIG.fps},scale=${CONFIG.cols}:${CONFIG.rows}" "${tempDir}/frame_%04d.png" 2>/dev/null`, {
      stdio: 'pipe'
    });

    // Get frame files
    const frames = fs.readdirSync(tempDir)
      .filter(f => f.endsWith('.png'))
      .sort();

    if (frames.length === 0) {
      throw new Error('No frames extracted');
    }

    console.log(`  Converting ${frames.length} frames to ASCII...`);

    // Create output canvas
    const outWidth = CONFIG.cols * CONFIG.charWidth;
    const outHeight = CONFIG.rows * CONFIG.charHeight;
    const outCanvas = createCanvas(outWidth, outHeight);
    const outCtx = outCanvas.getContext('2d');

    // Process each frame
    for (let i = 0; i < frames.length; i++) {
      const framePath = path.join(tempDir, frames[i]);
      const { createCanvas: cc, loadImage } = require('canvas');

      // Load and sample the frame
      const img = await loadImage(framePath);
      const sampleCanvas = cc(CONFIG.cols, CONFIG.rows);
      const sampleCtx = sampleCanvas.getContext('2d');
      sampleCtx.drawImage(img, 0, 0, CONFIG.cols, CONFIG.rows);
      const imageData = sampleCtx.getImageData(0, 0, CONFIG.cols, CONFIG.rows);
      const pixels = imageData.data;

      // Clear output canvas
      outCtx.fillStyle = '#000000';
      outCtx.fillRect(0, 0, outWidth, outHeight);

      // Draw ASCII
      outCtx.font = `${CONFIG.charHeight}px monospace`;
      outCtx.fillStyle = CONFIG.color;

      for (let y = 0; y < CONFIG.rows; y++) {
        let row = '';
        for (let x = 0; x < CONFIG.cols; x++) {
          const idx = (y * CONFIG.cols + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const a = pixels[idx + 3];

          let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          luminance *= a / 255;

          row += luminanceToChar(luminance, CONFIG.charSet);
        }
        outCtx.fillText(row, 0, (y + 1) * CONFIG.charHeight - 2);
      }

      // Save ASCII frame
      const outFramePath = path.join(asciiDir, `ascii_${String(i + 1).padStart(4, '0')}.png`);
      const buffer = outCanvas.toBuffer('image/png');
      fs.writeFileSync(outFramePath, buffer);

      if ((i + 1) % 10 === 0 || i === frames.length - 1) {
        process.stdout.write(`\r  Processed ${i + 1}/${frames.length} frames`);
      }
    }
    console.log('');

    console.log(`  Encoding WebM...`);
    // Encode to WebM
    execSync(`ffmpeg -y -framerate ${CONFIG.fps} -i "${asciiDir}/ascii_%04d.png" -c:v libvpx-vp9 -b:v 2M -pix_fmt yuva420p "${outputPath}" 2>/dev/null`, {
      stdio: 'pipe'
    });

    console.log(`  Done: ${path.basename(outputPath)}`);

  } finally {
    // Cleanup temp directories
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(asciiDir, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node batch-ascii-video.js <input-dir> <output-dir>');
    console.log('');
    console.log('Settings:');
    console.log(`  Grid: ${CONFIG.cols}x${CONFIG.rows}`);
    console.log(`  Chars: "${CONFIG.charSet}" (minimal)`);
    console.log(`  Threshold: ${CONFIG.threshold}`);
    console.log(`  Color: ${CONFIG.color}`);
    console.log(`  FPS: ${CONFIG.fps}`);
    process.exit(1);
  }

  const inputDir = args[0];
  const outputDir = args[1];

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Find video/gif files
  const files = fs.readdirSync(inputDir)
    .filter(f => /\.(mp4|gif|webm|mov)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log('No video files found in input directory');
    process.exit(0);
  }

  console.log(`Found ${files.length} video files`);
  console.log(`Output: ${outputDir}`);
  console.log('');

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputName = file.replace(/\.[^.]+$/, '-ascii.webm');
    const outputPath = path.join(outputDir, outputName);

    console.log(`Processing: ${file}`);
    try {
      await processVideo(inputPath, outputPath);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
    console.log('');
  }

  console.log('All done!');
}

main().catch(console.error);
