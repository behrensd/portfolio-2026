#!/usr/bin/env node
/**
 * Replace blob frames - Delete old frames and upload new binary cube frames
 * Run with: node scripts/replace-blob-frames.mjs
 */

import 'dotenv/config';
import { put, del, list } from '@vercel/blob';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Load from .env.local if not already set
import { config } from 'dotenv';
config({ path: '.env.local' });

const NEW_FRAMES_DIR = './public/pics/cloner-cube-binary-copy';
const OUTPUT_FILE = './app/data/frame-urls.json';
const BLOB_PREFIX = 'binary-cube-frames'; // New path for binary cube frames

async function deleteOldFrames() {
  console.log('🗑️  Deleting old mobile background frames from Vercel Blob...\n');
  
  try {
    // List all blobs with the old "frames/" prefix
    let cursor;
    let deletedCount = 0;
    let hasMore = true;
    
    while (hasMore) {
      const listResult = await list({
        prefix: 'frames/',
        cursor,
        limit: 100,
      });
      
      if (listResult.blobs.length === 0) {
        hasMore = false;
        break;
      }
      
      // Delete each blob
      for (const blob of listResult.blobs) {
        try {
          await del(blob.url);
          deletedCount++;
          process.stdout.write(`\r🗑️  Deleted ${deletedCount} old frames...`);
        } catch (error) {
          console.error(`\n❌ Failed to delete ${blob.pathname}: ${error.message}`);
        }
      }
      
      cursor = listResult.cursor;
      hasMore = listResult.hasMore;
    }
    
    console.log(`\n✅ Deleted ${deletedCount} old frames from blob storage\n`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error listing/deleting blobs:', error.message);
    return 0;
  }
}

async function uploadNewFrames() {
  console.log('🚀 Uploading new binary cube frames to Vercel Blob...\n');

  // Get all PNG files sorted by name
  const files = await readdir(NEW_FRAMES_DIR);
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
    const filePath = join(NEW_FRAMES_DIR, file);
    
    try {
      // Read file content
      const fileContent = await readFile(filePath);
      
      // Upload to blob with organized path
      const blob = await put(`${BLOB_PREFIX}/${file}`, fileContent, {
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
    await writeFile(OUTPUT_FILE, JSON.stringify({
      totalFrames: uploadedUrls.length,
      uploadedAt: new Date().toISOString(),
      source: 'cloner-cube-binary-copy',
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

  return { uploadedUrls, errors };
}

async function main() {
  console.log('=' .repeat(60));
  console.log('🔄 Binary Cube Frames - Blob Storage Migration');
  console.log('=' .repeat(60) + '\n');

  // Step 1: Delete old frames
  const deletedCount = await deleteOldFrames();
  
  // Step 2: Upload new frames
  const { uploadedUrls, errors } = await uploadNewFrames();

  // Final summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('=' .repeat(60));
  console.log(`   🗑️  Old frames deleted: ${deletedCount}`);
  console.log(`   ✅ New frames uploaded: ${uploadedUrls.length}`);
  console.log(`   ❌ Upload errors: ${errors.length}`);
  
  if (uploadedUrls.length > 0 && errors.length === 0) {
    console.log('\n🎉 Migration complete! Frame URLs updated in frame-urls.json');
    console.log('\n📋 Optional cleanup:');
    console.log('   rm -rf public/pics/cloner-cube-binary-copy');
  }
}

main().catch(console.error);

