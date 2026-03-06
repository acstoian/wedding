import sharp from "sharp";
import QRCode from "qrcode";
import * as path from "path";

const URL = "https://wedding-liart-three.vercel.app/";
const INPUT = path.join(process.cwd(), "public", "images", "invitation-draft.png");
const OUTPUT = path.join(process.cwd(), "public", "images", "invitation-final.png");

async function findWhiteSquare(img: sharp.Sharp, width: number, height: number) {
  // Get raw RGBA pixels
  const { data } = await img.clone().raw().toBuffer({ resolveWithObject: true });

  // Scan from bottom-center upward to find the white placeholder square
  // Look for a solid white rectangular region in the lower half
  const centerX = Math.floor(width / 2);
  let bestY = -1;
  let bestSize = 0;

  // Scan center column from 55% down to 90% of image height
  for (let y = Math.floor(height * 0.55); y < Math.floor(height * 0.90); y++) {
    const idx = (y * width + centerX) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const isWhite = r > 240 && g > 240 && b > 240;

    if (isWhite) {
      // Check if there's a meaningful white block (check 10px further down too)
      const idxDown = ((y + 10) * width + centerX) * 4;
      const rD = data[idxDown], gD = data[idxDown + 1], bD = data[idxDown + 2];
      const isWhiteDown = rD > 240 && gD > 240 && bD > 240;

      if (isWhiteDown && bestY === -1) {
        // Found start of white block — now measure its extent
        let blockH = 0;
        for (let dy = 0; dy < 200; dy++) {
          const iRow = ((y + dy) * width + centerX) * 4;
          if (data[iRow] > 235 && data[iRow + 1] > 235 && data[iRow + 2] > 235) {
            blockH++;
          } else break;
        }
        if (blockH > 40) {
          bestY = y;
          bestSize = blockH;
          break;
        }
      }
    }
  }

  if (bestY === -1) {
    // Fallback: position at ~73% down, centered
    console.log("Could not detect white square, using fallback position");
    const size = Math.floor(width * 0.14);
    return { x: Math.floor(centerX - size / 2), y: Math.floor(height * 0.73), size };
  }

  console.log(`Detected white square at y=${bestY}, height=${bestSize}`);
  const size = Math.min(bestSize, Math.floor(width * 0.16));
  return { x: Math.floor(centerX - size / 2), y: bestY + 4, size: size - 8 };
}

async function run() {
  const meta = await sharp(INPUT).metadata();
  const { width = 1024, height = 1024 } = meta;

  console.log(`Image dimensions: ${width}x${height}`);

  const img = sharp(INPUT);
  const { x, y, size } = await findWhiteSquare(img, width, height);
  console.log(`Placing QR code at x=${x}, y=${y}, size=${size}x${size}`);

  // Generate QR code as PNG buffer at exact size needed
  const qrBuffer = await QRCode.toBuffer(URL, {
    type: "png",
    width: size,
    margin: 1,
    color: { dark: "#3a0a0a", light: "#FEFBF3" },
    errorCorrectionLevel: "M",
  });

  // Overlay QR code onto invitation
  await sharp(INPUT)
    .composite([{ input: qrBuffer, left: x, top: y }])
    .png({ quality: 100 })
    .toFile(OUTPUT);

  console.log(`Saved final invitation to: ${OUTPUT}`);
}

run().catch(console.error);
