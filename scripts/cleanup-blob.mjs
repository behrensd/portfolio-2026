#!/usr/bin/env node
/**
 * Clean up unused files from Vercel Blob storage
 */

import 'dotenv/config';
import { del, list } from '@vercel/blob';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function cleanupBlob() {
  console.log('🧹 Cleaning up Vercel Blob storage...\n');

  try {
    // List all blobs
    const { blobs } = await list();
    
    console.log(`Found ${blobs.length} files in blob storage:\n`);
    
    // Find frame images to delete
    const framesToDelete = blobs.filter(blob => 
      blob.pathname.startsWith('binary-cube-frames/')
    );
    
    // Find other files (keep these)
    const filesToKeep = blobs.filter(blob => 
      !blob.pathname.startsWith('binary-cube-frames/')
    );
    
    console.log('📦 Files to KEEP:');
    filesToKeep.forEach(blob => {
      console.log(`  ✓ ${blob.pathname} (${(blob.size / 1024).toFixed(1)}KB)`);
    });
    
    console.log(`\n🗑️  Files to DELETE (${framesToDelete.length} frame images):`);
    console.log(`  - binary-cube-frames/ folder (${framesToDelete.length} files)`);
    
    if (framesToDelete.length === 0) {
      console.log('\n✨ No frame images to delete!');
      return;
    }
    
    // Delete frame images in batches
    console.log('\n🗑️  Deleting frame images...');
    
    const batchSize = 20;
    let deleted = 0;
    
    for (let i = 0; i < framesToDelete.length; i += batchSize) {
      const batch = framesToDelete.slice(i, i + batchSize);
      const urls = batch.map(blob => blob.url);
      
      await del(urls);
      deleted += batch.length;
      
      process.stdout.write(`\r  Deleted ${deleted}/${framesToDelete.length} files...`);
    }
    
    console.log(`\n\n✅ Successfully deleted ${deleted} frame images!`);
    
    // Show remaining files
    const { blobs: remaining } = await list();
    console.log(`\n📦 Remaining files in blob storage: ${remaining.length}`);
    remaining.forEach(blob => {
      console.log(`  - ${blob.pathname} (${(blob.size / 1024).toFixed(1)}KB)`);
    });
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

cleanupBlob();













