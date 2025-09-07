import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Missing reference" },
        { status: 400 }
      );
    }

    // Step 1: Verify transaction
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const transaction = verifyRes.data.data;
    if (transaction.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Transaction failed" },
        { status: 400 }
      );
    }

    const authCode = transaction.authorization.authorization_code;
    const customerEmail = transaction.customer.email;

    // Step 2: Refund the R1.00
    await axios.post(
      "https://api.paystack.co/refund",
      { transaction: transaction.id },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    // Step 3: Save token to DB (pseudo-code)
    // await db.saveUserCard({ userId, email: customerEmail, authCode });

    return NextResponse.json({ success: true, authCode, email: customerEmail });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
