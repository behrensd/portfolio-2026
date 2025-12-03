#!/usr/bin/env node
/**
 * Upload all frame images to Vercel Blob storage
 * Run with: node scripts/upload-frames.mjs
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Load from .env.local if not already set
import { config } from 'dotenv';
config({ path: '.env.local' });

const FRAMES_DIR = './public/videos/frames';
const OUTPUT_FILE = './app/data/frame-urls.json';

async function uploadFrames() {
  console.log('🚀 Starting frame upload to Vercel Blob...\n');

  // Get all PNG files sorted by name
  const files = await readdir(FRAMES_DIR);
  const pngFiles = files
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

  console.log(`📁 Found ${pngFiles.length} PNG frames to upload\n`);

  const uploadedUrls = [];
  const errors = [];

  for (let i = 0; i < pngFiles.length; i++) {
    const file = pngFiles[i];
    const filePath = join(FRAMES_DIR, file);
    
    try {
      // Read file content
      const fileContent = await readFile(filePath);
      
      // Upload to blob with organized path
      const blob = await put(`frames/${file}`, fileContent, {
        access: 'public',
        contentType: 'image/png',
      });

      uploadedUrls.push({
        name: file,
        url: blob.url,
      });

      // Progress indicator
      const progress = Math.round(((i + 1) / pngFiles.length) * 100);
      process.stdout.write(`\r✅ Uploaded ${i + 1}/${pngFiles.length} (${progress}%) - ${file}`);
      
    } catch (error) {
      errors.push({ file, error: error.message });
      console.error(`\n❌ Failed to upload ${file}: ${error.message}`);
    }
  }

  console.log('\n');

  // Save URL mapping to JSON file
  if (uploadedUrls.length > 0) {
    // Ensure data directory exists
    await writeFile(OUTPUT_FILE, JSON.stringify({
      totalFrames: uploadedUrls.length,
      uploadedAt: new Date().toISOString(),
      frames: uploadedUrls,
    }, null, 2));
    
    console.log(`📝 Saved URL mapping to ${OUTPUT_FILE}`);
  }

  // Summary
  console.log('\n📊 Upload Summary:');
  console.log(`   ✅ Successful: ${uploadedUrls.length}`);
  console.log(`   ❌ Failed: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Failed uploads:');
    errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
  }

  if (uploadedUrls.length === pngFiles.length) {
    console.log('\n🎉 All frames uploaded successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update MobileFrameSequence.tsx to use blob URLs');
    console.log('   2. Delete local frames: rm -rf public/videos/frames');
  }

  return { uploadedUrls, errors };
}

uploadFrames().catch(console.error);

