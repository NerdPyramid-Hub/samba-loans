import { NextResponse } from "next/server"
import getAdminContext from "@/lib/server-auth"

export async function GET(request: Request) {
  // Validate admin context
  const adminCtx = await getAdminContext(request as any)
  if ((adminCtx as any)?.status) return adminCtx as NextResponse

  const { supabaseAdmin } = adminCtx as any

  try {
    const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
