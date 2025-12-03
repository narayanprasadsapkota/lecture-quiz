import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";

interface BulkQuizInput {
  title: string;
  description?: string;
  questions: {
    text: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export async function POST(request: Request) {
  try {
    const body: BulkQuizInput = await request.json();
    const { title, description, questions: questionsData } = body;

    // Validation
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (
      !questionsData ||
      !Array.isArray(questionsData) ||
      questionsData.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      );
    }

    // Validate each question
    for (let i = 0; i < questionsData.length; i++) {
      const question = questionsData[i];
      if (
        !question.text ||
        !question.options ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.correctAnswer ||
        !question.explanation
      ) {
        return NextResponse.json(
          {
            error: `Invalid question data at index ${i}. Each question must have text, 4 options, correctAnswer, and explanation.`,
          },
          { status: 400 }
        );
      }

      // Validate that correctAnswer is one of the options
      if (!question.options.includes(question.correctAnswer)) {
        return NextResponse.json(
          {
            error: `Question at index ${i}: correctAnswer "${question.correctAnswer}" is not in the options array.`,
          },
          { status: 400 }
        );
      }
    }

    // Create the quiz
    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title,
        description: description || "",
        userId: 1, // Using the demo user
      })
      .returning();

    // Create all questions
    const questionsToInsert = questionsData.map((q) => ({
      quizId: newQuiz.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));

    const insertedQuestions = await db
      .insert(questions)
      .values(questionsToInsert)
      .returning();

    return NextResponse.json(
      {
        quiz: newQuiz,
        questions: insertedQuestions,
        message: `Quiz created successfully with ${insertedQuestions.length} questions`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bulk quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz. Please check your JSON format." },
      { status: 500 }
    );
  }
}
