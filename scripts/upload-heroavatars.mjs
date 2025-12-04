#!/usr/bin/env node
/**
 * Upload hero avatar images to Vercel Blob storage
 * Uploads onload.png and onclick.png (onlock.png will be deleted)
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function uploadHeroAvatars() {
  console.log('🚀 Uploading hero avatars to Vercel Blob...\n');

  try {
    // Upload onload.png
    console.log('📤 Uploading onload.png...');
    const onloadContent = await readFile('./public/pics/heroavatars/onload.png');
    const onloadBlob = await put('heroavatars/onload.png', onloadContent, {
      access: 'public',
      contentType: 'image/png',
    });
    console.log('✅ onload.png uploaded:', onloadBlob.url);
    console.log('   Size:', (onloadContent.length / 1024 / 1024).toFixed(2), 'MB\n');

    // Upload onclick.png
    console.log('📤 Uploading onclick.png...');
    const onclickContent = await readFile('./public/pics/heroavatars/onclick.png');
    const onclickBlob = await put('heroavatars/onclick.png', onclickContent, {
      access: 'public',
      contentType: 'image/png',
    });
    console.log('✅ onclick.png uploaded:', onclickBlob.url);
    console.log('   Size:', (onclickContent.length / 1024 / 1024).toFixed(2), 'MB\n');

    console.log('\n📝 Update these URLs in your code:');
    console.log('─'.repeat(80));
    console.log(`onload:  ${onloadBlob.url}`);
    console.log(`onclick: ${onclickBlob.url}`);
    console.log('─'.repeat(80));
    console.log('\n✨ Upload complete! Ready to update code.');

    return { onload: onloadBlob.url, onclick: onclickBlob.url };
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. .env.local exists with BLOB_READ_WRITE_TOKEN');
    console.error('   2. Images exist at ./public/pics/heroavatars/');
    console.error('   3. @vercel/blob package is installed');
    process.exit(1);
  }
}

uploadHeroAvatars();
