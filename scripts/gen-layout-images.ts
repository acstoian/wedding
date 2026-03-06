import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
const OUT = path.join(process.cwd(), "public", "images");

const IMAGES = [
  {
    filename: "corner-left.jpg",
    aspectRatio: "3:4" as const,
    prompt: `Wedding invitation left-side corner botanical decoration, watercolor fine art illustration. The composition cascades from the TOP-LEFT corner downward along the left edge of the frame. Key elements: multiple large white Hydrangea macrophylla flower heads (spherical pom-pom clusters of individual four-petaled florets) in creamy white with the faintest touch of pale green at the centers; large broad deep forest green hydrangea leaves (Hydrangea macrophylla, prominent white midrib and lateral veins), painted with transparent wet-on-wet watercolor washes showing soft bleed edges; interspersed delicate gold-outlined leaf silhouettes drawn with fine gold ink lines (some leaves rendered ONLY as thin gold outlines, no fill); trailing sage-green eucalyptus sprigs with small round leaves; a few sprigs of white gypsophila baby's breath adding airy texture; small scattered gold ink spatter dots near the botanical cluster. COMPOSITION: all botanical elements are concentrated in the TOP-LEFT quadrant and along the LEFT EDGE, extending inward about 30-35% of the frame width and downward about 80% of the frame height. Everything FADES TO PURE WHITE toward the RIGHT and BOTTOM edges — no botanical elements in the bottom-right area. The painting style is loose, flowing fine-art watercolor with visible brushwork, transparent washes, and soft organic edges. Color palette: deep forest green (#2D4A22), warm gold (#C5961B), creamy white, sage green, with transparent watercolor washes. Pure white background. No text, no borders, no watermarks, no frame. Ultra-detailed luxury wedding invitation illustration.`,
  },
  {
    filename: "corner-top-right.jpg",
    aspectRatio: "4:3" as const,
    prompt: `Abstract luxury wedding stationery decoration for the top-right corner. Gold and champagne agate-inspired watercolor abstract art. Multiple flowing ribbon-like brushstrokes of warm gold watercolor paint curving and swirling across the composition in the style of an agate geode cross-section. The lines are layered: some thin and delicate like fine ink, others broader sweeping washes. They flow diagonally and horizontally with organic curves — NOT geometric, but fluid like marble veining. Concentrated in the TOP-RIGHT corner, gradually becoming sparser and more transparent toward the CENTER and LEFT, fading to completely transparent/white at the left and bottom edges. Color palette strictly: warm gold (#C5961B), antique gold, champagne (#F7E7CE), pale bronze, with very subtle ivory tints. The brushstrokes have varying opacity — some nearly transparent, some richly pigmented. A few tiny gold ink spatter dots near the densest area. Pure white background visible between strokes. NO flowers, NO leaves, NO text, NO watermarks. Just the abstract gold flowing lines and transparent washes. High-end luxury wedding invitation aesthetic, fine art watercolor.`,
  },
  {
    filename: "corner-bottom-right.jpg",
    aspectRatio: "3:4" as const,
    prompt: `Wedding invitation BOTTOM-RIGHT corner botanical decoration, watercolor fine art illustration. Mirror composition to the top-left: botanical elements cascade from the BOTTOM-RIGHT corner upward and toward the left edge. Key elements: two or three large white Hydrangea macrophylla flower heads (spherical pom-pom clusters) in creamy white; deep forest green hydrangea leaves with prominent veining; a few gold-outlined leaf silhouettes in thin gold ink; trailing sage eucalyptus sprigs; scattered gold ink spatter dots near the cluster. COMPOSITION: all botanical elements concentrated in the BOTTOM-RIGHT quadrant, extending inward about 25% of frame width from right edge and upward about 40% from bottom. Everything FADES TO PURE WHITE toward the TOP and LEFT edges. Loose flowing fine-art watercolor style, transparent washes, visible brushwork. Color palette: deep forest green (#2D4A22), warm gold (#C5961B), creamy white. Pure white background. No text, no borders, no watermarks. Elegant luxury wedding invitation.`,
  },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const img of IMAGES) {
    console.log(`\nGenerating: ${img.filename}...`);
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: img.prompt,
        config: { numberOfImages: 1, outputMimeType: "image/jpeg", aspectRatio: img.aspectRatio },
      });
      const bytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!bytes) throw new Error("No image data");
      const buf = Buffer.from(bytes, "base64");
      fs.writeFileSync(path.join(OUT, img.filename), buf);
      console.log(`  Saved → public/images/${img.filename} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (err: any) {
      console.error(`  FAILED: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}

main().catch(console.error);
