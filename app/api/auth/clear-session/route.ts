import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookie = `sb_access_token=deleted; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
    return NextResponse.json(
      { ok: true },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (err: any) {
    console.error("clear-session error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
