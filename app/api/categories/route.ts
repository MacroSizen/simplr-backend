import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { CategoriesService } from "@/lib/services/categories.service";
import { createCategorySchema } from "@/lib/validations/expenses";
import { ZodError } from "zod";

// GET /api/categories
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        console.log(user);

        const { data, error } = await CategoriesService.getAll(user.id);

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

// POST /api/categories
export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);

        const body = await req.json();
        const validated = createCategorySchema.parse(body);

        const { data, error } = await CategoriesService.create(user.id, validated);

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
