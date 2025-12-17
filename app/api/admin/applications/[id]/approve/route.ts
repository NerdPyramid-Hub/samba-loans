import { type NextRequest, NextResponse } from "next/server"
import getAdminContext from "@/lib/server-auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const adminCtx = await getAdminContext(request as any)
  if ((adminCtx as any)?.status) return adminCtx as NextResponse

  const { supabaseAdmin } = adminCtx as any

  try {
    const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .update({
        status: "approved",
        approved_date: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error approving application:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
