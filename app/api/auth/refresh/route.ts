import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { refreshTokenSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = refreshTokenSchema.parse(body);

    const { data, error } = await AuthService.refreshToken(
      validated.refresh_token
    );

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Token refresh failed" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: data.user,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

