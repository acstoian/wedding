import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD is not set — refusing all admin logins");
      return NextResponse.json({ error: "Admin login is not configured" }, { status: 503 });
    }

    const { password } = await req.json();

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
