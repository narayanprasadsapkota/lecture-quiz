import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const allQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        subjectId: quizzes.subjectId,
      })
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt));

    // Get question counts for each quiz
    const quizzesWithCounts = await Promise.all(
      allQuizzes.map(async (quiz) => {
        const result = await db
          .select({ count: count() })
          .from(questions)
          .where(eq(questions.quizId, quiz.id));

        return {
          ...quiz,
          questionCount: result[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(quizzesWithCounts);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, subjectId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title,
        description: description || "",
        subjectId: subjectId ? parseInt(subjectId) : null,
        userId: 1, // Using the demo user we created
      })
      .returning();

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
