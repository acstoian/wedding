import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import SeatingChart, { type SeatingTable } from "@/components/SeatingChart";

export const metadata: Metadata = {
  title: "Așezarea la mese — Cristina & Andrei",
  description: "Găsește-ți masa și locul la nunta Cristinei și a lui Andrei.",
  // Shareable by link, but kept out of search engines — it lists guests by name.
  robots: { index: false, follow: false },
};

// Seating changes right up to the event, so never serve a cached chart.
export const dynamic = "force-dynamic";

export default async function SeatingPage() {
  const rows = await prisma.table.findMany({
    include: {
      guests: {
        where: { attending: "yes" },
        select: { id: true, name: true, seatNumber: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Seated guests first in seat order, then anyone placed at the table but not
  // yet given a specific chair.
  const tables: SeatingTable[] = rows.map((table) => ({
    id: table.id,
    name: table.name,
    capacity: table.capacity,
    guests: [...table.guests].sort((a, b) => {
      if (a.seatNumber == null && b.seatNumber == null) return a.name.localeCompare(b.name, "ro");
      if (a.seatNumber == null) return 1;
      if (b.seatNumber == null) return -1;
      return a.seatNumber - b.seatNumber;
    }),
  }));

  return (
    <main className="relative bg-white overflow-x-hidden min-h-screen">
      <Image
        src="/images/corner-left.jpg"
        alt=""
        width={380}
        height={507}
        className="absolute top-0 left-0 w-24 sm:w-36 md:w-48 pointer-events-none select-none"
        priority
      />
      <Image
        src="/images/corner-left.jpg"
        alt=""
        width={380}
        height={507}
        className="absolute top-0 right-0 w-24 sm:w-36 md:w-48 pointer-events-none select-none"
        style={{ transform: "scaleX(-1)" }}
        priority
      />

      <div className="relative z-10 px-6 pt-16 sm:pt-20 pb-16 text-center">
        <p className="font-body italic text-burgundy/40 text-xs sm:text-sm mb-3 tracking-wide">
          Cristina &amp; Andrei · 26 Septembrie 2026
        </p>
        <h1 className="font-script text-5xl sm:text-6xl md:text-7xl text-burgundy leading-tight">
          Așezarea la mese
        </h1>

        <div className="thin-divider" />

        <p className="font-body text-burgundy/50 text-sm max-w-md mx-auto mb-8">
          Caută-ți numele pentru a afla la ce masă stai.
        </p>

        <div className="max-w-5xl mx-auto">
          <SeatingChart tables={tables} />
        </div>

        <footer className="mt-16 pt-8 border-t border-gold/20 text-center">
          <Link
            href="/"
            className="font-body text-xs uppercase tracking-[0.25em] text-burgundy/40 hover:text-gold transition-colors"
          >
            ← Înapoi la invitație
          </Link>
          <p className="font-script text-3xl text-gold mt-6">Cristina &amp; Andrei</p>
        </footer>
      </div>
    </main>
  );
}
