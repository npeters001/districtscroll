const fs = require('fs');
const zlib = require('zlib');

const filePath = require('path').join(__dirname, '..', 'public', 'script.js');
const data = fs.readFileSync(filePath);
const gzipped = zlib.gzipSync(data);
const size = gzipped.length;
const limit = 12288; // 12 kB
if (size > limit) {
  console.error(`Bundle too big: ${size} bytes (limit ${limit})`);
  process.exit(1);
} else {
  console.log(`Bundle size ok: ${size} bytes (limit ${limit})`);
}
