import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { RemindersService } from "@/lib/services/reminders.service";
import { createReminderSchema } from "@/lib/validations/reminders";
import { ZodError } from "zod";

// GET /api/reminders?list_id=xxx
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const { searchParams } = new URL(req.url);
    const listId = searchParams.get("list_id");

    const { data, error } = await RemindersService.getReminders(user.id, listId || undefined);

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

// POST /api/reminders
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const body = await req.json();
    const validated = createReminderSchema.parse(body);

    const { data, error } = await RemindersService.createReminder(
      user.id,
      validated
    );

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

