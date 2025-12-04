#!/usr/bin/env node
import 'dotenv/config';
import { list } from '@vercel/blob';
import { config } from 'dotenv';

config({ path: '.env.local' });

const result = await list();
const gdpBlobs = result.blobs.filter(b => b.pathname.includes('gdp'));

console.log('GDP Mockup URLs:');
gdpBlobs.forEach(blob => {
  console.log(`  ${blob.pathname}: ${blob.url}`);
});
