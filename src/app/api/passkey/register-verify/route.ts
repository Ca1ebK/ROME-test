import { NextRequest, NextResponse } from "next/server";
import { verifyAndStoreRegistration } from "@/lib/passkey";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId, response, deviceName } = body as {
      workerId: string;
      response: RegistrationResponseJSON;
      deviceName?: string;
    };

    if (!workerId || !response) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await verifyAndStoreRegistration(workerId, response, deviceName);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying registration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify registration" },
      { status: 500 }
    );
  }
}
