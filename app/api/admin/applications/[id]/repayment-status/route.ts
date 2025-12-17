import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import getAdminContext from "@/lib/server-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { repaymentStatus } = await request.json();
    const applicationId = params.id;

    if (
      !repaymentStatus ||
      !["paid", "unpaid", "overdue"].includes(repaymentStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid repayment status" },
        { status: 400 }
      );
    }

    const adminCtx = await getAdminContext(request as any);
    if ((adminCtx as any)?.status) return adminCtx as NextResponse;

    const { supabaseAdmin } = adminCtx as any;

    const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .update({
        repayment_status: repaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("status", "approved") // Only allow updating approved loans
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Loan application not found or not approved" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error updating repayment status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
