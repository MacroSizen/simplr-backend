import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { HabitsService } from "@/lib/services/habits.service";
import { toggleHabitLogSchema, habitLogsQuerySchema } from "@/lib/validations/habits";
import { ZodError } from "zod"

// GET /api/habit-logs?habit_id=xxx&startDate=xxx&endDate=xxx
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const { searchParams } = new URL(req.url);
    const query = habitLogsQuerySchema.parse({
      habit_id: searchParams.get("habit_id"),
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    const { data, error } = await HabitsService.getLogs(user.id, query);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as ZodError).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

// POST /api/habit-logs (toggle log)
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const body = await req.json();
    const validated = toggleHabitLogSchema.parse(body);

    const { data, error } = await HabitsService.toggleLog(user.id, validated);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
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

