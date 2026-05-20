const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const buf = Buffer.alloc(8 + data.length + 4);
  buf.writeUInt32BE(data.length, 0);
  buf.write(type, 4, 'ascii');
  data.copy(buf, 8);
  buf.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return buf;
}

function pngImage(width, height, rgbaColor) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const row = Buffer.alloc(width * 4 + 1);
  row[0] = 0;
  for (let i = 0; i < width; i++) {
    row[1 + i * 4] = rgbaColor[0];
    row[1 + i * 4 + 1] = rgbaColor[1];
    row[1 + i * 4 + 2] = rgbaColor[2];
    row[1 + i * 4 + 3] = rgbaColor[3];
  }

  const image = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    row.copy(image, y * (width * 4 + 1));
  }

  const idat = zlib.deflateSync(image);
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
const color = [2, 6, 23, 255];
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), pngImage(192, 192, color));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), pngImage(512, 512, color));
console.log('Created icon-192.png and icon-512.png');
