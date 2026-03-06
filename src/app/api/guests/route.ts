import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = status && ["yes", "no", "pending"].includes(status)
      ? { attending: status }
      : {};

    const guests = await prisma.guest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { table: true },
    });

    return NextResponse.json(guests);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Guest ID is required" }, { status: 400 });
    }

    const guest = await prisma.guest.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(guest);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Guest ID is required" }, { status: 400 });
    }

    await prisma.guest.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
