import { NextRequest, NextResponse } from "next/server";
import { createRegistrationOptions } from "@/lib/passkey";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId, userName, userEmail } = body;

    if (!workerId || !userName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const options = await createRegistrationOptions(workerId, userName, userEmail || "");

    return NextResponse.json({ success: true, options });
  } catch (error) {
    console.error("Error generating registration options:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate options" },
      { status: 500 }
    );
  }
}
