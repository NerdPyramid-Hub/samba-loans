import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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
