"use client";

import { useState } from "react";

type GuestCount = "" | "0" | "1" | "2" | "3" | "4";
type MenuType = "Normal" | "Vegetarian";

const LABELS = ["", "Însoțitor 1", "Însoțitor 2", "Însoțitor 3"];

// Wedding event details. 26 Sep 2026 is in EEST (UTC+3) — DST ends on the last Sunday of Oct.
// Start: 26 Sep 16:00 local = 13:00 UTC. End: 27 Sep 03:00 local = 27 Sep 00:00 UTC.
const EVENT = {
  title: "Nunta Cristina & Andrei",
  startUtc: "20260926T130000Z",
  endUtc: "20260927T000000Z",
  startLocal: "2026-09-26T16:00:00",
  endLocal: "2026-09-27T03:00:00",
  location: "Biserica-unicat a Ordinului Carmelitanilor Desculți, DJ101B 54, 077166 Ciofliceni",
  description:
    "Cununia religioasă · 16:00 · Biserica-unicat a Ordinului Carmelitanilor Desculți, DJ101B 54, 077166 Ciofliceni\n" +
    "Recepția · 19:00 · Zooma Paradisul Verde, Aleea Paradisul Verde 6, 077066 Ostratu",
};

function googleCalendarUrl() {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates: `${EVENT.startUtc}/${EVENT.endUtc}`,
    details: EVENT.description,
    location: EVENT.location,
  });
  return `https://www.google.com/calendar/render?${p.toString()}`;
}

function outlookCalendarUrl() {
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: EVENT.title,
    startdt: EVENT.startLocal,
    enddt: EVENT.endLocal,
    body: EVENT.description,
    location: EVENT.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}

function downloadIcs() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cristina Andrei//Wedding//RO",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:cristina-andrei-2026-09-26@wedding",
    `DTSTAMP:${EVENT.startUtc}`,
    `DTSTART:${EVENT.startUtc}`,
    `DTEND:${EVENT.endUtc}`,
    `SUMMARY:${EVENT.title}`,
    `LOCATION:${EVENT.location}`,
    `DESCRIPTION:${EVENT.description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nunta-cristina-andrei.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export default function RsvpForm() {
  const [guestCount, setGuestCount] = useState<GuestCount>("");
  const [name1, setName1] = useState("");
  const [menu1, setMenu1] = useState<MenuType>("Normal");
  const [hasAllergies1, setHasAllergies1] = useState(false);
  const [allergies1, setAllergies1] = useState("");
  const blankExtra = { name: "", menu: "Normal" as MenuType, hasAllergies: false, allergies: "" };
  const [extras, setExtras] = useState<Array<typeof blankExtra>>([
    { ...blankExtra },
    { ...blankExtra },
    { ...blankExtra },
  ]);
  const [hasKids, setHasKids] = useState(false);
  const [kidsCount, setKidsCount] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const count = guestCount === "" || guestCount === "0" ? 0 : parseInt(guestCount);
  const attending = count > 0;
  const extraCount = Math.max(0, count - 1);

  function updateExtra<K extends keyof typeof blankExtra>(
    i: number,
    field: K,
    value: (typeof blankExtra)[K]
  ) {
    setExtras((prev) => prev.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)));
  }

  function buildAllergiesString(): string | null {
    const parts: string[] = [];
    if (hasAllergies1 && allergies1.trim()) {
      parts.push(`${name1.trim() || "Invitat 1"}: ${allergies1.trim()}`);
    }
    extras.slice(0, extraCount).forEach((g, i) => {
      if (g.hasAllergies && g.allergies.trim()) {
        parts.push(`${g.name.trim() || LABELS[i] || `Însoțitor ${i + 1}`}: ${g.allergies.trim()}`);
      }
    });
    return parts.length ? parts.join(" | ") : null;
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
          allergies: buildAllergiesString(),
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
      <div className="fixed inset-0 z-50 bg-cream flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg text-center text-burgundy">
          <p className="text-gold text-xs uppercase tracking-[0.25em] font-body mb-3">
            Confirmare primită
          </p>
          <p className="font-script text-5xl sm:text-6xl text-gold mb-4">Mulțumim!</p>
          <p className="font-body text-burgundy/70 text-sm sm:text-base px-2">
            Răspunsul tău a fost înregistrat. Abia așteptăm să ne vedem!
          </p>

          {attending && (
            <div className="mt-10 pt-8 border-t border-gold/20">
              <p className="text-gold text-xs uppercase tracking-[0.25em] font-body mb-5">
                Adaugă în calendar
              </p>
              <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                <a
                  href={googleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-5 py-3.5 rounded-full border border-gold/40 text-burgundy text-xs uppercase tracking-widest font-body hover:bg-gold hover:text-white transition-colors min-h-[44px]"
                >
                  Google Calendar
                </a>
                <a
                  href={outlookCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-5 py-3.5 rounded-full border border-gold/40 text-burgundy text-xs uppercase tracking-widest font-body hover:bg-gold hover:text-white transition-colors min-h-[44px]"
                >
                  Outlook
                </a>
                <button
                  type="button"
                  onClick={downloadIcs}
                  className="block w-full px-5 py-3.5 rounded-full border border-gold/40 text-burgundy text-xs uppercase tracking-widest font-body hover:bg-gold hover:text-white transition-colors min-h-[44px]"
                >
                  Apple / .ics
                </button>
              </div>
            </div>
          )}

          <p className="mt-10 font-script text-2xl text-gold/70">Cristina &amp; Andrei</p>
        </div>
      </div>
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
              className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-base"
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
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-base"
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
              <div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasAllergies1}
                    onChange={(e) => setHasAllergies1(e.target.checked)}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <span className="text-xs uppercase tracking-[0.2em] text-burgundy/60 font-body">
                    Alergii alimentare
                  </span>
                </label>
                {hasAllergies1 && (
                  <textarea
                    rows={2}
                    value={allergies1}
                    onChange={(e) => setAllergies1(e.target.value)}
                    placeholder="Descrie alergiile..."
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-base resize-none"
                  />
                )}
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
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-base"
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
              <div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={guest.hasAllergies}
                    onChange={(e) => updateExtra(i, "hasAllergies", e.target.checked)}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <span className="text-xs uppercase tracking-[0.2em] text-burgundy/60 font-body">
                    Alergii alimentare
                  </span>
                </label>
                {guest.hasAllergies && (
                  <textarea
                    rows={2}
                    value={guest.allergies}
                    onChange={(e) => updateExtra(i, "allergies", e.target.value)}
                    placeholder="Descrie alergiile..."
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-base resize-none"
                  />
                )}
              </div>
            </div>
          ))}

          {/* Kids */}
          {attending && (
            <div className="space-y-4 pt-1">
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
                className="w-full px-4 py-3 rounded-xl bg-white border border-gold/30 text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-base resize-none"
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
