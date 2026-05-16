/**
 * On-demand single-image generator — Imagen 4 via Gemini API.
 *
 * Usage:
 *   npm run gen:image -- --name hero.jpg --prompt "..." --ratio 16:9
 *
 * Flags:
 *   --name    Output filename written under public/images/ (required)
 *   --prompt  Image prompt text (required)
 *   --ratio   1:1 | 3:4 | 4:3 | 16:9 | 9:16  (default: 1:1)
 *   --style   If present, append the shared wedding style suffix to the prompt
 *   --out     Override output directory (default: public/images)
 *   --model   Override Imagen model id (default: imagen-4.0-generate-001)
 *
 * Requires GOOGLE_AI_API_KEY in .env.local (get one at https://aistudio.google.com/apikey).
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const WEDDING_STYLE =
  "simple and elegant, warm ivory cream background, soft natural lighting, " +
  "fine art photography style, no text, no people, no watermarks, ultra high resolution, " +
  "wedding aesthetic, timeless and romantic";

type AspectRatio = "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
const VALID_RATIOS: AspectRatio[] = ["1:1", "3:4", "4:3", "16:9", "9:16"];

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

function parseArgs(argv: string[]): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function mimeFromName(name: string): "image/jpeg" | "image/png" {
  return name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
}

async function main(): Promise<void> {
  loadEnvLocal();

  const args = parseArgs(process.argv.slice(2));
  const name = args.name;
  const prompt = args.prompt;
  const ratio = (args.ratio ?? "1:1") as string;
  const useStyle = args.style === true;
  const outDir = (args.out as string) ?? path.join(process.cwd(), "public", "images");
  const model = (args.model as string) ?? "imagen-4.0-generate-001";

  if (typeof name !== "string" || typeof prompt !== "string") {
    console.error("Usage: npm run gen:image -- --name <file> --prompt \"<text>\" [--ratio 16:9] [--style]");
    process.exit(2);
  }
  if (!VALID_RATIOS.includes(ratio as AspectRatio)) {
    console.error(`Invalid --ratio "${ratio}". Use one of: ${VALID_RATIOS.join(", ")}`);
    process.exit(2);
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_AI_API_KEY. Add it to .env.local — https://aistudio.google.com/apikey");
    process.exit(1);
  }

  const finalPrompt = useStyle ? `${prompt} ${WEDDING_STYLE}` : prompt;
  const mimeType = mimeFromName(name);

  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, name);

  console.log(`Generating ${name} (${ratio}, ${mimeType}) via ${model}...`);

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateImages({
    model,
    prompt: finalPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: mimeType,
      aspectRatio: ratio as AspectRatio,
    },
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) {
    console.error("No image data returned.");
    process.exit(1);
  }

  const buffer = Buffer.from(imageBytes, "base64");
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved → ${path.relative(process.cwd(), outPath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
