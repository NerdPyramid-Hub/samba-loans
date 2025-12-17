import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Validates Authorization header bearer token and checks admin role.
// Returns NextResponse on failure (caller should return it) or an object
// containing { supabaseAdmin, user } on success.
export async function getAdminContext(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  let token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // If no Authorization header, try cookies (sb_access_token)
  if (!token) {
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
    token = (cookies as any)["sb_access_token"] || null;
  }

  if (!token) {
    return NextResponse.json(
      { error: "Missing authorization token" },
      { status: 401 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Attempt to get user from provided access token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(
      token
    );
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = userData.user;

    // Verify role in the users table
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return { supabaseAdmin, user };
  } catch (err: any) {
    console.error("Admin auth error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export default getAdminContext;
