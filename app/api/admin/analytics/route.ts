import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .select("loan_amount, repayment_status, created_at")
      .eq("status", "approved")

    if (error) throw error

    // Process data to get monthly totals
    const monthlyData = data?.reduce((acc: any, loan) => {
      const month = new Date(loan.created_at).toLocaleDateString("en-US", { month: "short" })
      if (!acc[month]) {
        acc[month] = { month, paidLoans: 0, unpaidLoans: 0 }
      }

      if (loan.repayment_status === "paid") {
        acc[month].paidLoans += loan.loan_amount
      } else {
        acc[month].unpaidLoans += loan.loan_amount
      }

      return acc
    }, {})

    return NextResponse.json({ data: Object.values(monthlyData || {}) })
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
