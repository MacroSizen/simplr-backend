import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    await verifyAuth(req);

    // Get token from header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.substring(7) || "";

    // Logout
    const { error } = await AuthService.logout(token);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

