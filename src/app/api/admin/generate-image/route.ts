import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const VALID_RATIOS = ["1:1", "3:4", "4:3", "16:9", "9:16"] as const;
type AspectRatio = (typeof VALID_RATIOS)[number];

type Body = {
  prompt?: string;
  aspectRatio?: string;
  filename?: string;
  save?: boolean;
};

function sanitizeFilename(name: string): string | null {
  // Strip path separators and only allow [a-z0-9._-], force jpg/png extension.
  const cleaned = name.trim().replace(/[^a-zA-Z0-9._-]/g, "");
  if (!cleaned || cleaned.startsWith(".") || cleaned.includes("..")) return null;
  if (!/\.(jpe?g|png)$/i.test(cleaned)) return null;
  return cleaned;
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD || "wedding2026";
  if (req.headers.get("x-admin-password") !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_AI_API_KEY on the server" },
      { status: 500 }
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

  const ratio = (body.aspectRatio ?? "1:1") as string;
  if (!VALID_RATIOS.includes(ratio as AspectRatio)) {
    return NextResponse.json(
      { error: `aspectRatio must be one of ${VALID_RATIOS.join(", ")}` },
      { status: 400 }
    );
  }

  let safeName: string | null = null;
  if (body.save) {
    if (!body.filename) {
      return NextResponse.json({ error: "filename required when save=true" }, { status: 400 });
    }
    safeName = sanitizeFilename(body.filename);
    if (!safeName) {
      return NextResponse.json(
        { error: "filename must be like name.jpg or name.png (no paths)" },
        { status: 400 }
      );
    }
  }

  const mimeType: "image/jpeg" | "image/png" =
    safeName?.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: mimeType,
        aspectRatio: ratio as AspectRatio,
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      return NextResponse.json({ error: "No image returned by model" }, { status: 502 });
    }

    let savedTo: string | null = null;
    let saveError: string | null = null;
    if (body.save && safeName) {
      try {
        const outDir = path.join(process.cwd(), "public", "images");
        fs.mkdirSync(outDir, { recursive: true });
        const outPath = path.join(outDir, safeName);
        fs.writeFileSync(outPath, Buffer.from(imageBytes, "base64"));
        savedTo = `/images/${safeName}`;
      } catch (e) {
        saveError = e instanceof Error ? e.message : "Unknown write error";
      }
    }

    return NextResponse.json({
      base64: imageBytes,
      mimeType,
      savedTo,
      saveError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
