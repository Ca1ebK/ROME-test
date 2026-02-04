import { NextRequest, NextResponse } from "next/server";
import { getUserPasskeys } from "@/lib/passkey";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: "Missing workerId" },
        { status: 400 }
      );
    }

    const passkeys = await getUserPasskeys(workerId);

    // Return only safe fields (not the public key)
    const safePasskeys = passkeys.map((p) => ({
      id: p.id,
      credential_id: p.credential_id,
      device_name: p.device_name,
      last_used_at: p.last_used_at,
      created_at: p.created_at,
    }));

    return NextResponse.json({ success: true, passkeys: safePasskeys });
  } catch (error) {
    console.error("Error listing passkeys:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list passkeys" },
      { status: 500 }
    );
  }
}
