import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { registerSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const { data, error } = await AuthService.register(
      validated.email,
      validated.password
    );

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Registration failed" },
        { status: 400 }
      );
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return NextResponse.json(
        {
          message: "Registration successful. Please check your email to confirm your account.",
          user: data.user,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: data.user,
      },
      { status: 201 }
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

