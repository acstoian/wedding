"use client";

import { forwardRef, useState } from "react";

export type SeatGuest = { id: number; name: string; seatNumber: number | null };

export type RoundTableProps = {
  name: string;
  capacity: number;
  guests: SeatGuest[];
  onDropGuest: (guestId: number, seatNumber: number) => void;
  onDragGuestFromSeat?: (guestId: number) => void;
  /** Hover/active state when a guest is being dragged anywhere on the page. */
  isDragActive?: boolean;
};

// Layout constants for the SVG/HTML hybrid. Single source of truth so the
// JPG export captures exactly what's on screen.
const CANVAS = 460;
const CENTER = CANVAS / 2;
const TABLE_RADIUS = 75;
const SEAT_RING_RADIUS = 165;
const SEAT_DIAMETER = 72;

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

const RoundTable = forwardRef<HTMLDivElement, RoundTableProps>(function RoundTable(
  { name, capacity, guests, onDropGuest, onDragGuestFromSeat, isDragActive },
  ref
) {
  const [hoverSeat, setHoverSeat] = useState<number | null>(null);
  const cap = Math.min(Math.max(1, capacity), 10);
  const seats = Array.from({ length: cap }, (_, i) => i + 1);
  const guestBySeat = new Map<number, SeatGuest>();
  for (const g of guests) {
    if (g.seatNumber && g.seatNumber >= 1 && g.seatNumber <= cap) {
      guestBySeat.set(g.seatNumber, g);
    }
  }

  return (
    <div
      ref={ref}
      className="relative mx-auto bg-white"
      style={{ width: CANVAS, height: CANVAS }}
    >
      {/* Table circle (center) */}
      <div
        className="absolute rounded-full bg-burgundy text-cream flex flex-col items-center justify-center text-center px-3 shadow-md"
        style={{
          width: TABLE_RADIUS * 2,
          height: TABLE_RADIUS * 2,
          left: CENTER - TABLE_RADIUS,
          top: CENTER - TABLE_RADIUS,
        }}
      >
        <p className="font-heading text-lg leading-tight">{name}</p>
        <p className="text-[10px] uppercase tracking-widest text-cream/60 mt-1">
          {guestBySeat.size}/{cap}
        </p>
      </div>

      {/* Seats */}
      {seats.map((seatNum) => {
        // Start the first seat at the top (-π/2), then go clockwise.
        const angle = ((seatNum - 1) / cap) * 2 * Math.PI - Math.PI / 2;
        const x = CENTER + SEAT_RING_RADIUS * Math.cos(angle);
        const y = CENTER + SEAT_RING_RADIUS * Math.sin(angle);
        const guest = guestBySeat.get(seatNum);
        const filled = !!guest;

        const isHover = hoverSeat === seatNum;
        return (
          <div
            key={seatNum}
            draggable={filled}
            onDragStart={(e) => {
              if (filled && guest) {
                e.dataTransfer.setData("text/plain", String(guest.id));
                e.dataTransfer.effectAllowed = "move";
                onDragGuestFromSeat?.(guest.id);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setHoverSeat(seatNum);
            }}
            onDragLeave={(e) => {
              // Only clear when leaving the seat itself, not its children.
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setHoverSeat((cur) => (cur === seatNum ? null : cur));
            }}
            onDrop={(e) => {
              e.preventDefault();
              setHoverSeat(null);
              const idStr = e.dataTransfer.getData("text/plain");
              if (!idStr) return;
              const gid = Number(idStr);
              if (Number.isFinite(gid)) onDropGuest(gid, seatNum);
            }}
            className={`absolute rounded-full flex flex-col items-center justify-center text-center select-none ${
              isHover
                ? "bg-gold-light text-white border-2 border-burgundy ring-4 ring-burgundy/30 scale-110 shadow-lg z-10"
                : filled
                ? "bg-gold text-white border-2 border-gold-light cursor-grab active:cursor-grabbing shadow"
                : isDragActive
                ? "bg-cream border-2 border-dashed border-gold/70 text-burgundy/40"
                : "bg-cream border-2 border-gold/30 text-burgundy/40"
            }`}
            style={{
              width: SEAT_DIAMETER,
              height: SEAT_DIAMETER,
              left: x - SEAT_DIAMETER / 2,
              top: y - SEAT_DIAMETER / 2,
              transition: "background-color 120ms, border-color 120ms, transform 120ms, box-shadow 120ms",
            }}
            title={guest ? guest.name : `Loc ${seatNum} (gol)`}
          >
            {filled ? (
              <>
                <span className="text-[9px] uppercase tracking-wider opacity-80 leading-none pointer-events-none">
                  Loc {seatNum}
                </span>
                <span className="text-[11px] font-body font-semibold leading-tight px-1 mt-0.5 break-words pointer-events-none">
                  {shortName(guest!.name)}
                </span>
              </>
            ) : (
              <span className="font-heading text-2xl leading-none pointer-events-none">
                {seatNum}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default RoundTable;
export const ROUND_TABLE_CANVAS_PX = CANVAS;
