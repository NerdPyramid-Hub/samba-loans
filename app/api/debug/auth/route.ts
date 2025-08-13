import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return NextResponse.json({
      supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
      supabaseUrl: supabaseUrl
        ? supabaseUrl.substring(0, 20) + "..."
        : "Not set",
      anonKeySet: !!supabaseAnonKey,
      redirectUrls: [
        `${
          process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"
        }/auth/callback`,
        "http://localhost:3000/auth/callback",
        "http://localhost:3001/auth/callback",
        "http://localhost:3002/auth/callback",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
