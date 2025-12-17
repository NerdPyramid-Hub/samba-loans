import { NextResponse } from "next/server";
//import fetch from "node-fetch";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Read refresh token from cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => {
          const [k, ...v] = c.split("=");
          return [k, decodeURIComponent(v.join("="))];
        })
    );

    const refresh_token = (cookies as any)["sb_refresh_token"];
    if (!refresh_token) {
      return NextResponse.json(
        { error: "Missing refresh token" },
        { status: 401 }
      );
    }

    // Exchange refresh token for new session via Supabase Auth REST API
    const tokenUrl = `${supabaseUrl.replace(/\/+$/, "")}/auth/v1/token`;
    const body = new URLSearchParams();
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", refresh_token);

    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: body.toString(),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Refresh token exchange failed:", resp.status, text);
      return NextResponse.json(
        { error: "Failed to refresh session" },
        { status: 401 }
      );
    }

    const data = await resp.json();
    const newAccess = data.access_token;
    const newRefresh = data.refresh_token;
    const accessExpiresIn = data.expires_in || 3600;

    if (!newAccess || !newRefresh) {
      return NextResponse.json(
        { error: "Invalid token response" },
        { status: 500 }
      );
    }

    // Set new cookies
    const accessMaxAge = accessExpiresIn;
    const refreshMaxAge = 60 * 60 * 24 * 30; // 30 days
    const accessCookie = `sb_access_token=${newAccess}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${accessMaxAge}`;
    const refreshCookie = `sb_refresh_token=${newRefresh}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${refreshMaxAge}`;

    return NextResponse.json(
      { ok: true },
      { headers: { "Set-Cookie": `${accessCookie}; ${refreshCookie}` } }
    );
  } catch (err: any) {
    console.error("refresh-session error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
