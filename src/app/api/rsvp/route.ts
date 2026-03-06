import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, attending, plusOne, plusOneName, menuPreference, plusOneMenu, allergies, kidsCount, message } = body;

    if (!name || !attending) {
      return NextResponse.json({ error: "Name and attending status are required" }, { status: 400 });
    }

    if (!["yes", "no"].includes(attending)) {
      return NextResponse.json({ error: "Attending must be 'yes' or 'no'" }, { status: 400 });
    }

    const guest = await prisma.guest.create({
      data: {
        name: String(name).trim(),
        email: email ? String(email).trim() : null,
        attending,
        plusOne: Boolean(plusOne),
        plusOneName: plusOneName ? String(plusOneName).trim() : null,
        menuPreference: menuPreference ? String(menuPreference).trim() : null,
        plusOneMenu: plusOneMenu ? String(plusOneMenu).trim() : null,
        allergies: allergies ? String(allergies).trim() : null,
        kidsCount: kidsCount != null ? Number(kidsCount) : null,
        message: message ? String(message).trim() : null,
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      include: { table: true },
    });
    return NextResponse.json(guests);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
