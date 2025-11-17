import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { ExpensesService } from "@/lib/services/expenses.service";
import { createExpenseSchema, expensesQuerySchema } from "@/lib/validations/expenses";
import { ZodError } from "zod";

// GET /api/expenses
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const query = expensesQuerySchema.parse({
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
      category: searchParams.get("category"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    const { data, error } = await ExpensesService.getAll(user.id, query);

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

// POST /api/expenses
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    const body = await req.json();
    const validated = createExpenseSchema.parse(body);

    const { data, error } = await ExpensesService.create(user.id, validated);

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

