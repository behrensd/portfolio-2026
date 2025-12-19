#!/usr/bin/env node
/**
 * Upload GDP mockups to Vercel Blob storage
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { config } from 'dotenv';

config({ path: '.env.local' });

const files = [
  {
    localPath: './public/gdp-mockups/gdp-desktop-mockup.mp4',
    blobPath: 'videos/gdp-desktop-mockup.mp4',
    contentType: 'video/mp4'
  },
  {
    localPath: './public/gdp-mockups/gdp-mobile-mockup.mp4',
    blobPath: 'videos/gdp-mobile-mockup.mp4',
    contentType: 'video/mp4'
  },
  {
    localPath: './public/gdp-mockups/Screenshot 2025-12-04 at 02.28.53.png',
    blobPath: 'images/gdp-screenshot.png',
    contentType: 'image/png'
  }
];

async function uploadFiles() {
  console.log('🚀 Uploading GDP mockups to Vercel Blob...\n');

  const urls = [];

  for (const file of files) {
    try {
      console.log(`📤 Uploading ${file.localPath}...`);
      const fileContent = await readFile(file.localPath);
      
      const blob = await put(file.blobPath, fileContent, {
        access: 'public',
        contentType: file.contentType,
        addRandomSuffix: false,
      });

      console.log(`✅ ${file.blobPath}: ${blob.url}\n`);
      urls.push({ name: file.blobPath, url: blob.url });
    } catch (error) {
      console.error(`❌ Failed to upload ${file.localPath}:`, error.message);
    }
  }

  console.log('\n📋 All URLs:');
  urls.forEach(u => console.log(`  ${u.name}: ${u.url}`));
}

uploadFiles();







