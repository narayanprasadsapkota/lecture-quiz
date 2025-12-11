"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, BookOpen, Edit } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  subjectId: number | null;
}

interface Subject {
  id: number;
  name: string;
  description: string | null;
}

export default function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const isUncategorized = id === "uncategorized";

  useEffect(() => {
    setIsAuth(isAuthenticated());
    Promise.all([fetchSubject(), fetchQuizzes()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  const fetchSubject = async () => {
    if (isUncategorized) {
      setSubject({
        id: 0,
        name: "Uncategorized",
        description: "Quizzes that haven't been assigned a subject category.",
      });
      return;
    }

    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const data: Subject[] = await res.json();
        const found = data.find((s) => s.id.toString() === id);
        if (found) setSubject(found);
      }
    } catch (error) {
      console.error("Failed to load subject");
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data: QuizSummary[] = await res.json();
        const filtered = data.filter((q) => {
          if (isUncategorized) {
            return q.subjectId === null;
          }
          return q.subjectId?.toString() === id;
        });
        setQuizzes(filtered);
      }
    } catch (error) {
      console.error("Failed to load quizzes");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/"
                className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              {loading ? (
                <div className="h-10 w-48 bg-slate-900 rounded animate-pulse" />
              ) : (
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                  {subject ? subject.name : "Subject Not Found"}
                </h1>
              )}
            </div>
            {!loading && subject?.description && (
              <p className="text-slate-400 max-w-2xl ml-9">
                {subject.description}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800">
            <h3 className="text-xl text-slate-300 font-semibold">
              No quizzes found
            </h3>
            <p className="text-slate-500 mt-2">
              There are no quizzes in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-900/20 flex flex-col"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-cyan-400 line-clamp-1">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {quiz.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-slate-500 font-medium bg-slate-950 inline-block px-3 py-1 rounded-full border border-slate-800">
                    {quiz.questionCount} Questions
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-3">
                  <Link href={`/quiz/${quiz.id}`} className="w-full">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                      <BookOpen className="mr-2 h-4 w-4" /> Start
                    </Button>
                  </Link>
                  {isAuth && (
                    <Link href={`/admin/${quiz.id}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-slate-700 text-slate-800 hover:bg-slate-200"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
