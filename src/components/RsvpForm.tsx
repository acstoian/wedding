"use client";

import { useState } from "react";

type GuestCount = "" | "0" | "1" | "2" | "3" | "4";
type MenuType = "Normal" | "Vegetarian";

const LABELS = ["", "Însoțitor 1", "Însoțitor 2", "Însoțitor 3"];

export default function RsvpForm() {
  const [guestCount, setGuestCount] = useState<GuestCount>("");
  const [name1, setName1] = useState("");
  const [menu1, setMenu1] = useState<MenuType>("Normal");
  const [extras, setExtras] = useState<Array<{ name: string; menu: MenuType }>>([
    { name: "", menu: "Normal" },
    { name: "", menu: "Normal" },
    { name: "", menu: "Normal" },
  ]);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergies, setAllergies] = useState("");
  const [hasKids, setHasKids] = useState(false);
  const [kidsCount, setKidsCount] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const count = guestCount === "" || guestCount === "0" ? 0 : parseInt(guestCount);
  const attending = count > 0;
  const extraCount = Math.max(0, count - 1);

  function updateExtra(i: number, field: "name" | "menu", value: string) {
    setExtras((prev) => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const activeExtras = extras.slice(0, extraCount);
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name1 || "Anonim",
          attending: attending ? "yes" : "no",
          plusOne: extraCount > 0,
          plusOneName: extraCount > 0 ? activeExtras.map((g) => g.name).join(", ") : null,
          menuPreference: attending ? menu1 : null,
          plusOneMenu: extraCount > 0 ? activeExtras.map((g) => g.menu).join(", ") : null,
          allergies: hasAllergies && allergies ? allergies : null,
          kidsCount: hasKids ? kidsCount : null,
          message: message || null,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section id="rsvp" className="py-10 md:py-14 text-center">
        <div className="max-w-lg mx-auto px-6">
          <p className="font-script text-4xl text-gold mb-3">Mulțumim!</p>
          <p className="font-body text-burgundy/60 text-sm">
            Răspunsul tău a fost înregistrat. Abia așteptăm să ne vedem!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="py-10 md:py-14 text-burgundy">
      <div className="max-w-lg mx-auto px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.25em] font-body mb-2">Confirmă Prezența</p>
        <h2 className="font-heading text-2xl md:text-3xl mb-1">Ești cu noi?</h2>
        <p className="text-burgundy/40 text-xs font-body mb-8">
          Te rugăm să confirmi până la <strong>1 August 2026</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Guest count */}
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-burgundy/50 font-body mb-2">
              Număr de invitați *
            </label>
            <select
              required
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value as GuestCount)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-sm"
            >
              <option value="" disabled>Selectează...</option>
              <option value="1">1 invitat</option>
              <option value="2">2 invitați</option>
              <option value="3">3 invitați</option>
              <option value="4">4 invitați</option>
              <option value="0">Nu voi participa</option>
            </select>
          </div>

          {/* Primary guest */}
          {attending && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-burgundy/50 font-body mb-2">
                  Numele tău *
                </label>
                <input
                  required
                  type="text"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="Prenume Nume"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-burgundy/50 font-body mb-2">
                  Meniu *
                </label>
                <div className="flex gap-2">
                  {(["Normal", "Vegetarian"] as MenuType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMenu1(m)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-body transition-all ${
                        menu1 === m
                          ? "border-gold bg-gold text-white"
                          : "border-gold/30 text-burgundy/60 hover:border-gold/60"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Additional guests */}
          {extras.slice(0, extraCount).map((guest, i) => (
            <div key={i} className="space-y-3 border-t border-gold/20 pt-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-burgundy/50 font-body mb-2">
                  {LABELS[i]} *
                </label>
                <input
                  required
                  type="text"
                  value={guest.name}
                  onChange={(e) => updateExtra(i, "name", e.target.value)}
                  placeholder="Prenume Nume"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-burgundy/50 font-body mb-2">
                  Meniu {LABELS[i].toLowerCase()} *
                </label>
                <div className="flex gap-2">
                  {(["Normal", "Vegetarian"] as MenuType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateExtra(i, "menu", m)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-body transition-all ${
                        guest.menu === m
                          ? "border-gold bg-gold text-white"
                          : "border-gold/30 text-burgundy/60 hover:border-gold/60"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Allergies + Kids */}
          {attending && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasAllergies}
                    onChange={(e) => setHasAllergies(e.target.checked)}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <span className="text-xs uppercase tracking-[0.2em] text-burgundy/60 font-body">
                    Alergii alimentare
                  </span>
                </label>
                {hasAllergies && (
                  <textarea
                    rows={2}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Descrie alergiile tale..."
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-sm resize-none"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasKids}
                    onChange={(e) => setHasKids(e.target.checked)}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <span className="text-xs uppercase tracking-[0.2em] text-burgundy/60 font-body">
                    Vin cu copii
                  </span>
                </label>
                {hasKids && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-burgundy/50 font-body">Număr copii:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setKidsCount(Math.max(1, kidsCount - 1))}
                        className="w-8 h-8 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-colors flex items-center justify-center font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-heading text-lg text-burgundy">{kidsCount}</span>
                      <button
                        type="button"
                        onClick={() => setKidsCount(kidsCount + 1)}
                        className="w-8 h-8 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-colors flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message */}
          {guestCount !== "" && (
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-burgundy/50 font-body mb-2">
                Mesaj (opțional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Un gând pentru noi..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-sm resize-none"
              />
            </div>
          )}

          {guestCount !== "" && (
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-forest-green text-cream text-xs uppercase tracking-widest font-body rounded-full hover:bg-forest-green-light transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Se trimite..." : "Confirmă"}
            </button>
          )}

          {status === "error" && (
            <p className="text-center text-sm text-red-500 font-body">
              A apărut o eroare. Te rugăm să încerci din nou.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
