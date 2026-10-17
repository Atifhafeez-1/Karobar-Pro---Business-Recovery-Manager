import fs from 'node:fs';
import zlib from 'node:zlib';

// Function to generate a valid PNG image buffer
function createPng(width, height, r, g, b, innerR, innerG, innerB) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: 2 (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Scanlines: width * 3 bytes + 1 filter byte per line
  const rawData = Buffer.alloc(height * (1 + width * 3));
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const lineStart = y * (1 + width * 3);
    rawData[lineStart] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const px = lineStart + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Rounded card or center icon area
      if (dist < radius) {
        rawData[px] = innerR;
        rawData[px + 1] = innerG;
        rawData[px + 2] = innerB;
      } else {
        rawData[px] = r;
        rawData[px + 1] = g;
        rawData[px + 2] = b;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

const table = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[i] = c;
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

// Deep Navy (#0f172a = 15, 23, 42) & Emerald Green (#10b981 = 16, 185, 129)
fs.writeFileSync('./public/pwa-192x192.png', createPng(192, 192, 15, 23, 42, 16, 185, 129));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, 512, 15, 23, 42, 16, 185, 129));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, 512, 15, 23, 42, 16, 185, 129));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, 180, 15, 23, 42, 16, 185, 129));
console.log('PWA PNG assets successfully generated.');
