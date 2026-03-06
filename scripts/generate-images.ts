/**
 * Wedding Image Generator — Imagen 3 via Google Gemini API
 *
 * Setup:
 *   1. Get a free API key at https://aistudio.google.com/apikey
 *   2. Add GOOGLE_AI_API_KEY=your_key to .env.local
 *   3. npm install @google/genai
 *   4. npm run generate:images
 *
 * Images are saved to public/images/
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("Missing GOOGLE_AI_API_KEY. Add it to .env.local and re-run.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const OUTPUT_DIR = path.join(process.cwd(), "public", "images");

const STYLE =
  "simple and elegant, warm ivory cream background, soft natural lighting, " +
  "fine art photography style, no text, no people, no watermarks, ultra high resolution, " +
  "wedding aesthetic, timeless and romantic";

const IMAGES: {
  filename: string;
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  mimeType: "image/jpeg" | "image/png";
}[] = [
  {
    filename: "hero-bg.jpg",
    prompt:
      "Dreamy atmospheric background of soft glowing gold bokeh light orbs on warm ivory cream. " +
      "Multiple overlapping circles of soft golden light, blurred and luminous, like candlelight " +
      "seen through silk. No flowers, no objects — purely light and warmth. " + STYLE,
    aspectRatio: "9:16",
    mimeType: "image/jpeg",
  },
  {
    filename: "floral-wreath.jpg",
    prompt:
      "A circular floral wreath made of white hydrangea clusters, deep forest green leaves, " +
      "and gold-veined accent leaves. Centered on a clean ivory background. The wreath has an " +
      "open center. Watercolor illustration style, delicate and elegant. " + STYLE,
    aspectRatio: "1:1",
    mimeType: "image/jpeg",
  },
  {
    filename: "floral-corner.jpg",
    prompt:
      "A botanical corner decoration spray: white hydrangea blossoms, deep forest green leaves, " +
      "gold-accent leaves, and small white flower buds. Arranged as a bottom-left corner piece " +
      "on an ivory background. Loose watercolor style, airy and elegant. " + STYLE,
    aspectRatio: "1:1",
    mimeType: "image/jpeg",
  },
  {
    filename: "floral-top.jpg",
    prompt:
      "A horizontal floral garland border: white hydrangeas, green eucalyptus leaves, " +
      "gold-veined leaves, and small white blossoms. Wide horizontal arrangement on ivory. " +
      "Watercolor illustration, delicate and airy. " + STYLE,
    aspectRatio: "16:9",
    mimeType: "image/jpeg",
  },
  {
    filename: "gallery-bouquet.jpg",
    prompt:
      "A stunning bridal bouquet of white hydrangeas, white peonies, garden roses, " +
      "ranunculus, trailing eucalyptus and greenery. Held against a soft ivory background. " +
      "Natural light, soft shadows. " + STYLE,
    aspectRatio: "3:4",
    mimeType: "image/jpeg",
  },
  {
    filename: "gallery-table.jpg",
    prompt:
      "An elegantly set wedding reception dining table. White linen tablecloth, tall gold " +
      "pillar candles in gold candlesticks, a lush centerpiece of white hydrangeas and green " +
      "foliage, fine china place settings, crystal glassware. Soft warm candlelight. " + STYLE,
    aspectRatio: "16:9",
    mimeType: "image/jpeg",
  },
  {
    filename: "gallery-venue.jpg",
    prompt:
      "A grand elegant wedding reception hall. High ceilings, crystal chandeliers glowing warm " +
      "gold, round tables with white floral centerpieces, soft candlelight. Romantic and opulent. " + STYLE,
    aspectRatio: "16:9",
    mimeType: "image/jpeg",
  },
  {
    filename: "gallery-cake.jpg",
    prompt:
      "A three-tier wedding cake in ivory white. Smooth fondant finish with delicate hand-painted " +
      "gold leaf details. Topped and decorated with fresh white hydrangeas and small green leaves. " +
      "Displayed on a marble cake stand with soft candlelight. " + STYLE,
    aspectRatio: "3:4",
    mimeType: "image/jpeg",
  },
  {
    filename: "gallery-rings.jpg",
    prompt:
      "Two elegant gold wedding rings resting together on a bed of fresh white rose petals " +
      "and small green leaves. Macro close-up, very soft blurred background, warm light. " + STYLE,
    aspectRatio: "1:1",
    mimeType: "image/jpeg",
  },
  {
    filename: "section-texture.jpg",
    prompt:
      "An extremely subtle elegant background texture. Warm ivory paper surface with very faint " +
      "gold botanical line illustrations — delicate leaves, tiny flowers, thin vines. " +
      "Very low contrast, almost imperceptible pattern. Suitable as a text background. " + STYLE,
    aspectRatio: "16:9",
    mimeType: "image/jpeg",
  },
];

async function generateImage(image: (typeof IMAGES)[0]): Promise<void> {
  console.log(`\n Generating: ${image.filename}`);

  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt: image.prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: image.mimeType,
      aspectRatio: image.aspectRatio,
    },
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) {
    throw new Error(`No image data returned for ${image.filename}`);
  }

  const buffer = Buffer.from(imageBytes, "base64");
  const outputPath = path.join(OUTPUT_DIR, image.filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`   Saved → public/images/${image.filename} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Wedding Image Generator — Imagen 3");
  console.log("====================================");
  console.log(`Generating ${IMAGES.length} images...\n`);

  const failed: string[] = [];

  for (const image of IMAGES) {
    try {
      await generateImage(image);
      // Brief pause between requests to respect rate limits
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`   FAILED ${image.filename}:`, (err as Error).message);
      failed.push(image.filename);
    }
  }

  console.log("\n====================================");
  console.log(`Done. ${IMAGES.length - failed.length}/${IMAGES.length} images generated.`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.join(", ")}`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
