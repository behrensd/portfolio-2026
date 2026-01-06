#!/usr/bin/env node
/**
 * Upload video to Vercel Blob storage
 * Usage: node scripts/upload-video.mjs <local-path> <blob-name>
 * Example: node scripts/upload-video.mjs public/findus-mockup.mp4 findus-mockup.mp4
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { basename } from 'path';

const filePath = process.argv[2];
const blobName = process.argv[3] || basename(filePath);

if (!filePath) {
  console.error('Usage: node scripts/upload-video.mjs <local-path> <blob-name>');
  process.exit(1);
}

async function uploadVideo() {
  console.log(`🚀 Uploading ${filePath} to Vercel Blob as videos/${blobName}...\n`);

  try {
    const fileContent = await readFile(filePath);

    const blob = await put(`videos/${blobName}`, fileContent, {
      access: 'public',
      contentType: 'video/mp4',
      allowOverwrite: true,
    });

    console.log('✅ Upload successful!');
    console.log(`📎 URL: ${blob.url}`);

    return blob.url;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadVideo();













