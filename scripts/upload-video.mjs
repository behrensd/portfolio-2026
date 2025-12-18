#!/usr/bin/env node
/**
 * Upload video to Vercel Blob storage
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { config } from 'dotenv';

config({ path: '.env.local' });

const filePath = './public/videos/bp-shop-mockup-compressed.mp4';

async function uploadVideo() {
  console.log('🚀 Uploading video to Vercel Blob...\n');

  try {
    const fileContent = await readFile(filePath);

    const blob = await put('videos/bp-shop-mockup.mp4', fileContent, {
      access: 'public',
      contentType: 'video/mp4',
    });

    console.log('✅ Upload successful!');
    console.log(`📎 URL: ${blob.url}`);

    return blob.url;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadVideo();





