import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session) {
    return NextResponse.json({ user: { role: session.role, name: session.name } });
  }
  return NextResponse.json({ user: null });
}
