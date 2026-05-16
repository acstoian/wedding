"use client";

import { useState } from "react";

type AspectRatio = "1:1" | "3:4" | "4:3" | "16:9" | "9:16";

const WEDDING_STYLE =
  "simple and elegant, warm ivory cream background, soft natural lighting, " +
  "fine art photography style, no text, no people, no watermarks, ultra high resolution, " +
  "wedding aesthetic, timeless and romantic";

const RATIOS: AspectRatio[] = ["1:1", "3:4", "4:3", "16:9", "9:16"];

type GenResult = {
  base64: string;
  mimeType: "image/jpeg" | "image/png";
  savedTo: string | null;
  saveError: string | null;
};

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [filename, setFilename] = useState("");
  const [appendStyle, setAppendStyle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenResult | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  async function generate(save: boolean) {
    setError(null);
    setSavedNote(null);
    setLoading(true);

    const password = sessionStorage.getItem("admin_password");
    if (!password) {
      setError("Sesiunea de admin a expirat. Reconectează-te.");
      setLoading(false);
      return;
    }

    const finalPrompt = appendStyle ? `${prompt.trim()} ${WEDDING_STYLE}` : prompt.trim();

    try {
      const res = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio,
          filename: save ? filename : undefined,
          save,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "A apărut o eroare");
        return;
      }

      setResult(data as GenResult);
      if (save) {
        if (data.savedTo) setSavedNote(`Salvat în ${data.savedTo}`);
        else if (data.saveError) setSavedNote(`Generat dar nu s-a putut salva: ${data.saveError}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare de rețea");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!result) return;
    const ext = result.mimeType === "image/png" ? "png" : "jpg";
    const a = document.createElement("a");
    a.href = `data:${result.mimeType};base64,${result.base64}`;
    a.download = filename || `generated.${ext}`;
    a.click();
  }

  const previewSrc = result ? `data:${result.mimeType};base64,${result.base64}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-burgundy">Generator de imagini</h1>
        <p className="text-sm text-gray-500 mt-1">
          Imagen 4 prin Gemini API. Fiecare imagine consumă credite Google AI Studio (~$0.04).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-body text-gray-700 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Ex: A bridal bouquet of white peonies and eucalyptus on ivory linen..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-body text-gray-700 mb-1">Aspect ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy text-sm"
              >
                {RATIOS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-body text-gray-700 mb-1">
                Nume fișier <span className="text-gray-400">(pentru salvare)</span>
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="hero.jpg"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={appendStyle}
              onChange={(e) => setAppendStyle(e.target.checked)}
              className="rounded"
            />
            Adaugă stilul nunții (ivory, fine-art, romantic)
          </label>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => generate(false)}
              disabled={loading || !prompt.trim()}
              className="px-4 py-2 rounded-lg bg-burgundy text-white text-sm font-body hover:bg-burgundy-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Se generează..." : "Generează (preview)"}
            </button>
            <button
              onClick={() => generate(true)}
              disabled={loading || !prompt.trim() || !filename.trim()}
              className="px-4 py-2 rounded-lg bg-gold text-burgundy text-sm font-body hover:bg-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Se generează..." : "Generează & salvează în public/images"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}
          {savedNote && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
              {savedNote}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow p-6">
          {previewSrc ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Generated preview"
                className="w-full h-auto rounded-lg border border-gray-200"
              />
              <button
                onClick={download}
                className="w-full px-4 py-2 rounded-lg border border-burgundy text-burgundy text-sm font-body hover:bg-burgundy hover:text-white transition-colors"
              >
                Descarcă
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Preview-ul va apărea aici după generare.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
