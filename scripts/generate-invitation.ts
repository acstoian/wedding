import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

const PROMPT = `Create a print-ready wedding invitation card in portrait orientation, sized exactly 10.5cm wide by 15cm tall (1240x1772 pixels at 300dpi). Use the attached website screenshot as the design reference for style, colors, typography hierarchy, and botanical decorations.

**Background & Overall Feel:**
Warm ivory/white background (color: #FEFBF3). Clean, elegant, minimal — like a luxury printed stationery card. No gradients, no textures. The card should feel like a high-end physical invitation.

**Corner Botanical Decorations (critical — match the screenshot exactly):**
- Top-left corner: a lush cascade of white hydrangea flowers with deep forest green leaves (#2D4A22), eucalyptus sprigs, and gold-veined botanical leaves. The arrangement flows inward from the top-left corner diagonally, occupying roughly 25% of the card width.
- Top-right corner: the exact mirror image of the top-left arrangement, flipped horizontally, perfectly symmetrical.
- Bottom-right corner: a smaller, more delicate cluster of the same botanicals (white hydrangeas, eucalyptus, forest green leaves), occupying roughly 15% of the card.

**Typography & Color Palette:**
- Couple names: large elegant serif script font, deep burgundy color (#5C1A1A)
- Section labels (PĂRINȚII MIRESEI, NAȘII, etc.): very small uppercase letter-spaced text, gold color (#C9A84C)
- Body text (names, addresses): elegant serif, deep burgundy, medium weight
- Date number "26": large, forest green (#2D4A22), serif font, light weight
- Decorative divider lines: thin horizontal gold lines (#C9A84C)

**Card Content — top to bottom in this exact order:**

1. "Cu inimile pline de bucurie, vă invităm la nunta noastră" — small italic text, burgundy at 30% opacity, centered

2. Cristina — very large elegant serif, burgundy, centered
   & — small gold ampersand
   Andrei — very large elegant serif, burgundy, centered

3. Date row: thin gold line — SÂMBĂTĂ — thin gold line — 26 (large forest green) — thin gold line — SEPTEMBRIE — thin gold line

4. Thin gold divider line

5. ALĂTURI NE VOR FI — tiny gold uppercase letter-spaced label, centered

6. Two-column parents section:
   Left column: PĂRINȚII MIRESEI (tiny gold label) / Ilie Șiclovan / Elisabeta Șiclovan (elegant burgundy serif)
   Right column: PĂRINȚII MIRELUI (tiny gold label) / Nicolae Stoian / Iuliana Stoian (elegant burgundy serif)

7. Thin gold divider line

8. NAȘII (tiny gold label, centered) / Matei Liberis & Ioana Liberis (elegant serif, centered)

9. Thin gold divider line

10. Two-column venue section:
    Left column: CUNUNIA RELIGIOASĂ (tiny gold uppercase label) / Parohia Romano Católică „Sf. Anton" (burgundy serif, medium size) / Str. Magnoliei nr. 113, București (small muted text) / 26 Septembrie 2026 · ora 16:00 (small faded text)
    Right column: RECEPȚIA (tiny gold uppercase label) / Zooma Paradisul Verde (burgundy serif, medium size) / Aleea Paradisul Verde 6, 077066 Ostratu (small muted text) / 26 Septembrie 2026 · ora 19:00 (small faded text)

11. QR Code section — leave a clean empty white square (approximately 200x200px) with a thin light gray border, perfectly centered horizontally, with the label "Confirmă prezența" in small gold uppercase above it, and "wedding-liart-three.vercel.app" in tiny faded burgundy text below it. The QR code will be added programmatically — leave the square area completely empty white inside.

**Do NOT include:** countdown timer, RSVP dropdown form, "Ești cu noi?" heading, "Vezi pe hartă" buttons, interactive UI elements, or any digital-only elements. This is a static print invitation only.`;

async function generateInvitation() {
  console.log("Reading reference screenshot...");
  const screenshotPath = path.join(process.cwd(), "website-reference-print.png");
  const imageData = fs.readFileSync(screenshotPath);
  const base64Image = imageData.toString("base64");

  console.log("Sending to Gemini 2.0 Flash with image generation...");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
          { text: PROMPT },
        ],
      },
    ],
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  let saved = false;

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const outputPath = path.join(process.cwd(), "public", "images", "invitation-draft.png");
      const buf = Buffer.from(part.inlineData.data!, "base64");
      fs.writeFileSync(outputPath, buf);
      console.log(`Saved invitation to: ${outputPath}`);
      console.log(`Image size: ${buf.length} bytes`);
      saved = true;
    } else if (part.text) {
      console.log("Gemini text response:", part.text);
    }
  }

  if (!saved) {
    console.error("No image was returned. Full response:");
    console.error(JSON.stringify(response, null, 2));
  }
}

generateInvitation().catch(console.error);
