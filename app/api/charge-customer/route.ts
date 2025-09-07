import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { amount, email, authCode } = await req.json();

    if (!amount || !email || !authCode) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/charge_authorization",
      {
        amount: Math.round(Number(amount) * 100), // ZAR to kobo/cents
        email,
        authorization_code: authCode,
        currency: "ZAR",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ success: true, data: paystackRes.data });
  } catch (err: any) {
    let errorMsg =
      err?.response?.data?.message || err.message || "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 400 }
    );
  }
}
