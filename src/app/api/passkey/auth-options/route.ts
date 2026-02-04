import { NextRequest, NextResponse } from "next/server";
import { createAuthenticationOptions } from "@/lib/passkey";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId } = body;

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: "Missing workerId" },
        { status: 400 }
      );
    }

    const result = await createAuthenticationOptions(workerId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true, options: result.options });
  } catch (error) {
    console.error("Error generating authentication options:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate options" },
      { status: 500 }
    );
  }
}
