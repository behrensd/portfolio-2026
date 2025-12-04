#!/usr/bin/env node
/**
 * Upload GDP about page screenshot to Vercel Blob storage
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function uploadAboutImage() {
  console.log('🚀 Uploading GDP about page image to Vercel Blob...\n');

  try {
    console.log(`📤 Uploading gdp-about-page.jpg...`);
    const fileContent = await readFile('./public/gdp-mockups/gdp-about-page.jpg');

    const blob = await put('images/gdp-about-page.jpg', fileContent, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log(`✅ images/gdp-about-page.jpg: ${blob.url}\n`);
    return blob.url;
  } catch (error) {
    console.error(`❌ Failed to upload:`, error.message);
  }
}

uploadAboutImage();
