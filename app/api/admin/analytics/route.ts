import { NextResponse } from "next/server";
import getAdminContext from "@/lib/server-auth";

export async function GET(request: Request) {
  const adminCtx = await getAdminContext(request as any);
  if ((adminCtx as any)?.status) return adminCtx as NextResponse;

  const { supabaseAdmin } = adminCtx as any;

  try {
    const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .select("loan_amount, repayment_status, created_at")
      .eq("status", "approved");

    if (error) throw error;

    // Process data to get monthly totals
    const monthlyData = data?.reduce((acc: any, loan: any) => {
      const month = new Date(loan.created_at).toLocaleDateString("en-US", {
        month: "short",
      });
      if (!acc[month]) {
        acc[month] = { month, paidLoans: 0, unpaidLoans: 0 };
      }

      if (loan.repayment_status === "paid") {
        acc[month].paidLoans += loan.loan_amount;
      } else {
        acc[month].unpaidLoans += loan.loan_amount;
      }

      return acc;
    }, {});

    return NextResponse.json({ data: Object.values(monthlyData || {}) });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
