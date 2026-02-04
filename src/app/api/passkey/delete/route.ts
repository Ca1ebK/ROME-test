import { NextRequest, NextResponse } from "next/server";
import { deletePasskey } from "@/lib/passkey";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId, credentialId } = body;

    if (!workerId || !credentialId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await deletePasskey(workerId, credentialId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting passkey:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete passkey" },
      { status: 500 }
    );
  }
}
