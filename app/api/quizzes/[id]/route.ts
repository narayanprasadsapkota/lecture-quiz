import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, parseInt(id)));

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, parseInt(id)))
      .orderBy(asc(questions.order));

    return NextResponse.json({
      ...quiz,
      questions: quizQuestions,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { text, options, correctAnswer, explanation } = body;

    if (
      !text ||
      !options ||
      options.length !== 4 ||
      !correctAnswer ||
      !explanation
    ) {
      return NextResponse.json(
        { error: "Invalid question data" },
        { status: 400 }
      );
    }

    // Get the current max order for this quiz
    const existingQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, parseInt(id)));

    const maxOrder =
      existingQuestions.length > 0
        ? Math.max(...existingQuestions.map((q) => q.order || 0))
        : -1;

    const [newQuestion] = await db
      .insert(questions)
      .values({
        quizId: parseInt(id),
        text,
        options,
        correctAnswer,
        explanation,
        order: maxOrder + 1,
      })
      .returning();

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error adding question:", error);
    return NextResponse.json(
      { error: "Failed to add question" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { title, description, subjectId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [updatedQuiz] = await db
      .update(quizzes)
      .set({ title, description, subjectId })
      .where(eq(quizzes.id, parseInt(id)))
      .returning();

    if (!updatedQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await db.delete(quizzes).where(eq(quizzes.id, parseInt(id)));
    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
