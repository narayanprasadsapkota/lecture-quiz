import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allSubjects = await db
      .select()
      .from(subjects)
      .orderBy(desc(subjects.createdAt));
    return NextResponse.json(allSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    const [newSubject] = await db
      .insert(subjects)
      .values({
        name,
        description,
      })
      .returning();

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    // Check for unique constraint violation
    if ((error as any).code === "23505") {
      return NextResponse.json(
        { error: "Subject with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
