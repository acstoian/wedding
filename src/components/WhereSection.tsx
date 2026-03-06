"use client";

import { useState } from "react";

interface EventCard {
  type: string;
  venue: string;
  address: string;
  time: string;
  mapQuery: string;
}

const EVENTS: EventCard[] = [
  {
    type: "Cununia religioasă",
    venue: 'Parohia Romano Catolică „Sf. Anton"',
    address: "Str. Magnoliei nr. 113, București",
    time: "ora 16:00",
    mapQuery: "Parohia Romano Catolica Sf Anton Str Magnoliei 113 Bucuresti",
  },
  {
    type: "Recepția",
    venue: "Zooma Paradisul Verde",
    address: "Aleea Paradisul Verde 6, 077066 Ostratu",
    time: "ora 19:00",
    mapQuery: "Zooma Paradisul Verde Aleea Paradisul Verde 6 Ostratu",
  },
];

export default function WhereSection() {
  const [mapQuery, setMapQuery] = useState<string | null>(null);

  return (
    <section id="where" className="py-10 md:py-12 text-burgundy text-center">
      <div className="max-w-3xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {EVENTS.map((event) => (
            <div key={event.type} className="text-center flex flex-col items-center h-full">
              <p className="text-gold text-xs uppercase tracking-[0.25em] font-body mb-3">
                {event.type}
              </p>
              <h3 className="font-heading text-xl md:text-2xl mb-1">{event.venue}</h3>
              <p className="text-burgundy/50 font-body text-sm mb-1">{event.address}</p>
              <p className="text-burgundy/40 font-body text-xs mb-4">
                26 Septembrie 2026 · {event.time}
              </p>
              <button
                onClick={() => setMapQuery(event.mapQuery)}
                className="mt-auto inline-block px-5 py-1.5 border border-gold/60 text-gold text-xs uppercase tracking-widest font-body rounded-full hover:bg-gold hover:text-white transition-colors"
              >
                Vezi pe hartă
              </button>
            </div>
          ))}
        </div>

        <div className="thin-divider mt-10" />
      </div>

      {/* Map modal */}
      {mapQuery && (
        <div className="modal-overlay" onClick={() => setMapQuery(null)}>
          <div
            className="bg-white rounded-2xl overflow-hidden w-11/12 max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
              <h3 className="font-heading text-lg text-burgundy">Locație</h3>
              <button
                onClick={() => setMapQuery(null)}
                className="text-burgundy/50 hover:text-burgundy transition-colors"
                aria-label="Închide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <iframe
              className="w-full h-80 md:h-96"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
          </div>
        </div>
      )}
    </section>
  );
}
