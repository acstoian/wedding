import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: { guests: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(tables);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, capacity } = body;

    if (!name) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    const table = await prisma.table.create({
      data: {
        name: String(name).trim(),
        capacity: capacity ? Number(capacity) : 8,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Table ID is required" }, { status: 400 });
    }

    const table = await prisma.table.update({
      where: { id: Number(id) },
      data,
      include: { guests: true },
    });

    return NextResponse.json(table);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Table ID is required" }, { status: 400 });
    }

    // Unassign guests from this table first
    await prisma.guest.updateMany({
      where: { tableId: Number(id) },
      data: { tableId: null },
    });

    await prisma.table.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
