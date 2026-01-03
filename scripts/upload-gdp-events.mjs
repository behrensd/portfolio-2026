#!/usr/bin/env node
/**
 * Upload GDP events page image to Vercel Blob storage
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function uploadEventsImage() {
  console.log('🚀 Uploading GDP events page image to Vercel Blob...\n');

  try {
    console.log(`📤 Uploading gdp-events.jpg...`);
    const fileContent = await readFile('./public/gdp-mockups/gdp-events.jpg');

    const blob = await put('images/gdp-events.jpg', fileContent, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log(`✅ images/gdp-events.jpg: ${blob.url}\n`);
    return blob.url;
  } catch (error) {
    console.error(`❌ Failed to upload:`, error.message);
  }
}

uploadEventsImage();







