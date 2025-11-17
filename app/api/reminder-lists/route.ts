import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { RemindersService } from "@/lib/services/reminders.service";
import { createReminderListSchema } from "@/lib/validations/reminders";
import { ZodError } from "zod";

// GET /api/reminder-lists
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const { data, error } = await RemindersService.getLists(user.id);

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

// POST /api/reminder-lists
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const body = await req.json();
    const validated = createReminderListSchema.parse(body);

    const { data, error } = await RemindersService.createList(user.id, validated);

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

