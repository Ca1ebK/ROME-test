import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/lib/passkey";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId, response } = body as {
      workerId: string;
      response: AuthenticationResponseJSON;
    };

    if (!workerId || !response) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await verifyAuthentication(workerId, response);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying authentication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify authentication" },
      { status: 500 }
    );
  }
}
