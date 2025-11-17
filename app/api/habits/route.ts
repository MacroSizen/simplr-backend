import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { HabitsService } from "@/lib/services/habits.service";
import { createHabitSchema } from "@/lib/validations/habits";
import { ZodError } from "zod";

// GET /api/habits
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const { data, error } = await HabitsService.getAll(user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

// POST /api/habits
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const body = await req.json();
    const validated = createHabitSchema.parse(body);

    const { data, error } = await HabitsService.create(user.id, validated);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

