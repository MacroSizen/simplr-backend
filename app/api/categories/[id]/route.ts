import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { CategoriesService } from "@/lib/services/categories.service";
import { updateCategorySchema } from "@/lib/validations/expenses";
import { ZodError } from "zod";

// PUT /api/categories/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        const { id } = await params;

        const body = await req.json();
        const validated = updateCategorySchema.parse(body);

        const { data, error } = await CategoriesService.update(user.id, id, validated);

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

// DELETE /api/categories/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        const { id } = await params;

        const { error } = await CategoriesService.delete(user.id, id);

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unauthorized" },
            { status: 401 }
        );
    }
}
