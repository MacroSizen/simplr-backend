import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { NotificationsService } from "@/lib/services/notifications.service";
import { updateNotificationSettingsSchema } from "@/lib/validations/notifications";
import { ZodError } from "zod";

/**
 * GET /api/notifications/settings
 * Get notification settings for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const { data, error } = await NotificationsService.getSettings(user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to get notification settings" },
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

/**
 * PUT /api/notifications/settings
 * Update notification settings for the authenticated user
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    const body = await req.json();

    const validated = updateNotificationSettingsSchema.parse(body);

    const { data, error } = await NotificationsService.updateSettings(
      user.id,
      validated
    );

    if (error) {
      return NextResponse.json(
        { error: "Failed to update notification settings" },
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

