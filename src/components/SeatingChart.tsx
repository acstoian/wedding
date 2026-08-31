"use client";

import { useMemo, useState } from "react";

export interface SeatedGuest {
  id: number;
  name: string;
  seatNumber: number | null;
}

export interface SeatingTable {
  id: number;
  name: string;
  capacity: number;
  guests: SeatedGuest[];
}

// Romanian names carry diacritics that guests rarely type on a phone keyboard,
// so "siclovan" has to find "Șiclovan".
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export default function SeatingChart({ tables }: { tables: SeatingTable[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const matches = useMemo(() => {
    if (normalizedQuery.length < 2) return [];
    return tables.flatMap((table) =>
      table.guests
        .filter((guest) => normalize(guest.name).includes(normalizedQuery))
        .map((guest) => ({ guest, table }))
    );
  }, [normalizedQuery, tables]);

  const matchedIds = new Set(matches.map((m) => m.guest.id));
  const seatedCount = tables.reduce((sum, t) => sum + t.guests.length, 0);

  if (seatedCount === 0) {
    return (
      <p className="font-body text-burgundy/50 text-sm max-w-md mx-auto">
        Așezarea la mese încă se pregătește. Revino puțin mai târziu — o vom
        publica aici de îndată ce este gata.
      </p>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="max-w-sm mx-auto mb-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută-ți numele..."
          aria-label="Caută-ți numele"
          className="w-full px-5 py-3 rounded-full bg-white border border-gold/30 text-burgundy text-center placeholder:text-burgundy/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors font-body text-base"
        />
      </div>

      {/* Search result */}
      <div className="h-14 mb-2 flex items-center justify-center px-4">
        {normalizedQuery.length >= 2 && (
          matches.length > 0 ? (
            <div className="font-body text-sm text-forest-green">
              {matches.map(({ guest, table }) => (
                <p key={guest.id}>
                  <span className="font-heading text-base">{guest.name}</span>
                  {" — "}
                  {table.name}
                  {guest.seatNumber != null && `, locul ${guest.seatNumber}`}
                </p>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-burgundy/40 italic">
              Nu am găsit acest nume. Încearcă doar prenumele.
            </p>
          )
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
        {tables.map((table) => {
          const free = Math.max(0, table.capacity - table.guests.length);
          return (
            <div
              key={table.id}
              className="bg-white rounded-2xl border border-gold/20 shadow-sm p-5 flex flex-col"
            >
              <p className="text-gold text-[10px] uppercase tracking-[0.25em] font-body mb-1">
                Masa
              </p>
              <h2 className="font-heading text-lg md:text-xl text-burgundy mb-4">
                {table.name}
              </h2>

              <ul className="space-y-1.5 flex-1">
                {table.guests.map((guest) => {
                  const isMatch = matchedIds.has(guest.id);
                  return (
                    <li
                      key={guest.id}
                      className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ${
                        isMatch ? "bg-gold/15 ring-1 ring-gold/60" : ""
                      }`}
                    >
                      <span
                        className="shrink-0 w-6 h-6 rounded-full border border-gold/40 text-gold text-[11px] font-body grid place-items-center"
                        aria-hidden
                      >
                        {guest.seatNumber ?? "·"}
                      </span>
                      <span
                        className={`font-body text-sm ${
                          isMatch ? "text-burgundy font-semibold" : "text-burgundy/80"
                        }`}
                      >
                        {guest.name}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {free > 0 && (
                <p className="mt-3 pt-3 border-t border-gold/15 font-body text-[11px] text-burgundy/35">
                  {free} {free === 1 ? "loc liber" : "locuri libere"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
