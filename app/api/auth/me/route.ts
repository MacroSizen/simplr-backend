import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

