import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "Missing access_token or refresh_token" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Validate token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(
      access_token
    );
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Set HttpOnly cookies for access and refresh tokens
    const accessMaxAge = 60 * 60; // 1 hour
    const refreshMaxAge = 60 * 60 * 24 * 30; // 30 days

    const accessCookie = `sb_access_token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${accessMaxAge}`;
    const refreshCookie = `sb_refresh_token=${refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${refreshMaxAge}`;

    return NextResponse.json(
      { ok: true },
      { headers: { "Set-Cookie": `${accessCookie}; ${refreshCookie}` } }
    );
  } catch (err: any) {
    console.error("store-session error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
