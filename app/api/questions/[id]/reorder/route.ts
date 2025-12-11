import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { direction } = body; // 'up' or 'down'

    if (!direction || !["up", "down"].includes(direction)) {
      return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
    }

    // Get the current question
    const [currentQuestion] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)));

    if (!currentQuestion || !currentQuestion.quizId) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Get all questions for this quiz, sorted by order
    const allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, currentQuestion.quizId))
      .orderBy(asc(questions.order));

    // Find current index
    const currentIndex = allQuestions.findIndex((q) => q.id === parseInt(id));

    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Question not found in quiz" },
        { status: 404 }
      );
    }

    // Determine swap index
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (swapIndex < 0 || swapIndex >= allQuestions.length) {
      return NextResponse.json(
        { error: "Cannot move question in that direction" },
        { status: 400 }
      );
    }

    // Swap the order values
    const currentOrder = allQuestions[currentIndex].order;
    const swapOrder = allQuestions[swapIndex].order;

    await db
      .update(questions)
      .set({ order: swapOrder })
      .where(eq(questions.id, allQuestions[currentIndex].id));

    await db
      .update(questions)
      .set({ order: currentOrder })
      .where(eq(questions.id, allQuestions[swapIndex].id));

    return NextResponse.json({
      message: "Question order updated successfully",
    });
  } catch (error) {
    console.error("Error reordering question:", error);
    return NextResponse.json(
      { error: "Failed to reorder question" },
      { status: 500 }
    );
  }
}
