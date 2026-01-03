#!/usr/bin/env node
/**
 * Upload a single image to Vercel Blob storage
 */

import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { config } from 'dotenv';

config({ path: '.env.local' });

const imagePath = './public/pics/dom-behrens.webp';

async function uploadImage() {
  console.log('🚀 Uploading image to Vercel Blob...\n');

  try {
    const fileContent = await readFile(imagePath);
    
    const blob = await put('images/dom-behrens.webp', fileContent, {
      access: 'public',
      contentType: 'image/webp',
    });

    console.log('✅ Upload successful!');
    console.log(`📎 URL: ${blob.url}`);
    console.log('\n📝 Update Hero.tsx with this URL');
    
    return blob.url;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadImage();













