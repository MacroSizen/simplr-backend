import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { NotificationsService } from "@/lib/services/notifications.service";
import {
  registerDeviceSchema,
  unregisterDeviceSchema,
} from "@/lib/validations/notifications";
import { ZodError } from "zod";

/**
 * GET /api/notifications/devices
 * Get all registered devices for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const { data, error } = await NotificationsService.getDeviceTokens(user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to get devices" },
        { status: 500 }
      );
    }

    return NextResponse.json({ devices: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * POST /api/notifications/devices
 * Register a device for push notifications
 */
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    const body = await req.json();

    const validated = registerDeviceSchema.parse(body);

    const { data, error } = await NotificationsService.registerDevice(
      user.id,
      validated
    );

    if (error) {
      return NextResponse.json(
        { error: "Failed to register device" },
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

/**
 * DELETE /api/notifications/devices
 * Unregister a device from push notifications
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    const body = await req.json();

    const validated = unregisterDeviceSchema.parse(body);

    const { error } = await NotificationsService.unregisterDevice(
      user.id,
      validated.push_token
    );

    if (error) {
      return NextResponse.json(
        { error: "Failed to unregister device" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Device unregistered" }, { status: 200 });
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

