import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Person = {
  name?: string;
  menuPreference?: string | null;
  allergies?: string | null;
};

type RsvpBody = {
  // New shape
  primary?: Person;
  extras?: Person[];
  // Common
  attending?: string;
  email?: string | null;
  message?: string | null;
  kidsCount?: number | null;
  // Legacy shape (kept so older payloads don't 500)
  name?: string;
  plusOne?: boolean;
  plusOneName?: string | null;
  menuPreference?: string | null;
  plusOneMenu?: string | null;
  allergies?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body: RsvpBody = await req.json();
    const attending = body.attending;

    if (!attending || !["yes", "no"].includes(attending)) {
      return NextResponse.json({ error: "Attending must be 'yes' or 'no'" }, { status: 400 });
    }

    // Normalize: figure out primary + extras whether the client sent the new
    // shape or fell back to the legacy flat one.
    let primary: Person;
    let extras: Person[];

    if (body.primary) {
      primary = body.primary;
      extras = body.extras ?? [];
    } else {
      // Legacy fallback: name/menuPreference/allergies for primary, plusOneName
      // (comma-joined) + plusOneMenu for extras. Allergies were already grouped
      // by name in a "Name: details | ..." format from the old form.
      primary = {
        name: body.name,
        menuPreference: body.menuPreference ?? null,
        allergies: null, // legacy global allergies isn't safe to attribute
      };
      const legacyNames = (body.plusOneName ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const legacyMenus = (body.plusOneMenu ?? "").split(",").map((s) => s.trim());
      extras = legacyNames.map((name, i) => ({
        name,
        menuPreference: legacyMenus[i] || null,
        allergies: null,
      }));
    }

    if (!primary.name || !String(primary.name).trim()) {
      return NextResponse.json({ error: "Primary guest name is required" }, { status: 400 });
    }

    // Create primary first so we can wire children to its id.
    const createdPrimary = await prisma.guest.create({
      data: {
        name: String(primary.name).trim(),
        email: body.email ? String(body.email).trim() : null,
        attending,
        menuPreference: primary.menuPreference ? String(primary.menuPreference).trim() : null,
        allergies: primary.allergies ? String(primary.allergies).trim() : null,
        kidsCount: body.kidsCount != null ? Number(body.kidsCount) : null,
        message: body.message ? String(body.message).trim() : null,
        plusOne: extras.length > 0,
      },
    });

    // Create each extra as its own row in the same group.
    for (const person of extras) {
      if (!person.name || !String(person.name).trim()) continue;
      await prisma.guest.create({
        data: {
          name: String(person.name).trim(),
          attending,
          menuPreference: person.menuPreference ? String(person.menuPreference).trim() : null,
          allergies: person.allergies ? String(person.allergies).trim() : null,
          parentGuestId: createdPrimary.id,
        },
      });
    }

    return NextResponse.json(createdPrimary, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/rsvp failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      include: { table: true },
    });
    return NextResponse.json(guests);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
