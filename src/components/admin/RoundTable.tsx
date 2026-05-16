"use client";

import { forwardRef, useState } from "react";

export type SeatGuest = { id: number; name: string; seatNumber: number | null };

export type RoundTableProps = {
  name: string;
  capacity: number;
  guests: SeatGuest[];
  onDropGuest: (guestId: number, seatNumber: number) => void;
  onRemoveGuest?: (guestId: number) => void;
  onDragGuestFromSeat?: (guestId: number) => void;
  onDragEnd?: () => void;
  /** Hover/active state when a guest is being dragged anywhere on the page. */
  isDragActive?: boolean;
  /** Id of the guest currently being dragged, if any (used to fade source seat). */
  draggingGuestId?: number | null;
};

// Layout constants. Single source of truth so the JPG export captures
// exactly what's on screen.
const CANVAS = 580;
const CENTER = CANVAS / 2;
const TABLE_RADIUS = 72;
const SEAT_RING_RADIUS = 160;
const SEAT_DIAMETER = 52;
const LABEL_RING_RADIUS = 235;
const LABEL_WIDTH = 110;

const RoundTable = forwardRef<HTMLDivElement, RoundTableProps>(function RoundTable(
  {
    name,
    capacity,
    guests,
    onDropGuest,
    onRemoveGuest,
    onDragGuestFromSeat,
    onDragEnd,
    isDragActive,
    draggingGuestId,
  },
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

      {/* Seats + outside labels */}
      {seats.map((seatNum) => {
        // Start the first seat at the top (-π/2), then go clockwise.
        const angle = ((seatNum - 1) / cap) * 2 * Math.PI - Math.PI / 2;
        const seatX = CENTER + SEAT_RING_RADIUS * Math.cos(angle);
        const seatY = CENTER + SEAT_RING_RADIUS * Math.sin(angle);
        const labelX = CENTER + LABEL_RING_RADIUS * Math.cos(angle);
        const labelY = CENTER + LABEL_RING_RADIUS * Math.sin(angle);
        const guest = guestBySeat.get(seatNum);
        const filled = !!guest;
        const isSource = filled && draggingGuestId === guest!.id;
        const isHover = hoverSeat === seatNum && !isSource;

        return (
          <div key={seatNum}>
            {/* Seat circle */}
            <div
              draggable={filled}
              onDragStart={(e) => {
                if (filled && guest) {
                  e.dataTransfer.setData("text/plain", String(guest.id));
                  e.dataTransfer.effectAllowed = "move";
                  onDragGuestFromSeat?.(guest.id);
                }
              }}
              onDragEnd={() => {
                setHoverSeat(null);
                onDragEnd?.();
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
              className={`absolute rounded-full flex items-center justify-center text-center select-none ${
                isHover
                  ? "bg-gold-light text-white border-2 border-burgundy ring-4 ring-burgundy/30 scale-110 shadow-lg z-10"
                  : filled
                  ? `bg-gold text-white border-2 border-gold-light cursor-grab active:cursor-grabbing shadow ${
                      isSource ? "opacity-40" : ""
                    }`
                  : isDragActive
                  ? "bg-cream border-2 border-dashed border-gold/70 text-burgundy/40"
                  : "bg-cream border-2 border-gold/30 text-burgundy/40"
              }`}
              style={{
                width: SEAT_DIAMETER,
                height: SEAT_DIAMETER,
                left: seatX - SEAT_DIAMETER / 2,
                top: seatY - SEAT_DIAMETER / 2,
                transition:
                  "background-color 120ms, border-color 120ms, transform 120ms, box-shadow 120ms, opacity 120ms",
              }}
              title={guest ? `${guest.name} — trage pentru a muta` : `Loc ${seatNum} (gol)`}
            >
              <span className="font-heading text-base leading-none pointer-events-none">
                {seatNum}
              </span>
              {filled && onRemoveGuest && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGuest(guest!.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  draggable={false}
                  aria-label={`Elimină pe ${guest!.name} de la masă`}
                  title="Elimină de la masă"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-burgundy border border-burgundy/40 flex items-center justify-center text-[11px] font-bold shadow hover:bg-burgundy hover:text-white transition-colors cursor-pointer leading-none"
                  style={{ pointerEvents: "auto" }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Name label outside the seat */}
            {filled && (
              <div
                className={`absolute text-center pointer-events-none transition-opacity ${
                  isSource ? "opacity-40" : "opacity-100"
                }`}
                style={{
                  width: LABEL_WIDTH,
                  left: labelX - LABEL_WIDTH / 2,
                  top: labelY,
                  transform: "translateY(-50%)",
                }}
              >
                <p className="text-[11px] font-body font-semibold text-burgundy leading-tight break-words">
                  {guest!.name}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default RoundTable;
export const ROUND_TABLE_CANVAS_PX = CANVAS;
