import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, code, workerName } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendVerificationEmail(email, code, workerName || "Team Member");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
