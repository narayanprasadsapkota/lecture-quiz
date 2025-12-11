"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  BookOpen,
  Edit,
  Loader2,
  LogOut,
  FileJson,
  FolderPlus,
  X,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearAuth } from "@/lib/auth";

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

export default function Home() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [submittingSubject, setSubmittingSubject] = useState(false);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    Promise.all([fetchQuizzes(), fetchSubjects()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsAuth(false);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      } else {
        toast.error("Failed to load quizzes");
      }
    } catch (error) {
      toast.error("An error occurred loading quizzes");
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Failed to load subjects");
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setSubmittingSubject(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubjectName,
          description: newSubjectDescription,
        }),
      });

      if (res.ok) {
        toast.success("Subject created successfully");
        setNewSubjectName("");
        setNewSubjectDescription("");
        setIsSubjectDialogOpen(false);
        fetchSubjects();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create subject");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmittingSubject(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              Lecture Quizzes
            </h1>
            <p className="text-slate-400 mt-2">
              Select a lecture to start the quiz or create a new one.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center md:justify-end">
            {isAuth ? (
              <>
                <Dialog
                  open={isSubjectDialogOpen}
                  onOpenChange={setIsSubjectDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-cyan-600 text-cyan-400 hover:bg-cyan-950"
                    >
                      <FolderPlus className="mr-2 h-5 w-5" />
                      New Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Subject</DialogTitle>
                      <DialogDescription>
                        organize your quizzes by creating a new subject
                        category.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubject}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Subject Name</Label>
                          <Input
                            id="name"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="e.g., Mathematics, Physics"
                            required
                            className="bg-slate-900 border-slate-700"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">
                            Description (Optional)
                          </Label>
                          <Input
                            id="description"
                            value={newSubjectDescription}
                            onChange={(e) =>
                              setNewSubjectDescription(e.target.value)
                            }
                            placeholder="Brief description of the subject"
                            className="bg-slate-900 border-slate-700"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="bg-cyan-600 hover:bg-cyan-700"
                          disabled={submittingSubject}
                        >
                          {submittingSubject ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Subject
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Link href="/create">
                  <Button
                    size="lg"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Quiz
                  </Button>
                </Link>
                <Link href="/create-bulk">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    <FileJson className="mr-2 h-5 w-5" />
                    Bulk Create
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-950"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          </div>
        ) : subjects.length === 0 &&
          quizzes.filter((q) => !q.subjectId).length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800">
            <h3 className="text-xl text-slate-300 font-semibold">
              No categories found
            </h3>
            <p className="text-slate-500 mt-2">
              Create your first subject category to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const count = quizzes.filter(
                (q) => q.subjectId === subject.id
              ).length;

              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.id}`}
                  className="block group h-full"
                >
                  <Card className="h-full bg-slate-900 border-slate-800 text-slate-200 group-hover:border-cyan-500/50 transition-all group-hover:shadow-lg group-hover:shadow-cyan-900/20 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl text-cyan-400">
                        {subject.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 line-clamp-2 min-h-[2.5rem]">
                        {subject.description || "No description provided."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-sm text-slate-500 font-medium bg-slate-950 inline-block px-3 py-1 rounded-full border border-slate-800">
                        {count} Quizzes
                      </div>
                    </CardContent>
                    <CardFooter>
                      <span className="text-sm text-cyan-500 font-medium flex items-center group-hover:underline">
                        View Quizzes <BookOpen className="ml-2 h-4 w-4" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}

            {/* Uncategorized Card */}
            {quizzes.filter((q) => !q.subjectId).length > 0 && (
              <Link
                href="/subjects/uncategorized"
                className="block group h-full"
              >
                <Card className="h-full bg-slate-900 border-slate-800 text-slate-200 group-hover:border-cyan-500/50 transition-all group-hover:shadow-lg group-hover:shadow-cyan-900/20 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-400">
                      Uncategorized
                    </CardTitle>
                    <CardDescription className="text-slate-400 line-clamp-2 min-h-[2.5rem]">
                      Quizzes without a specific category.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-sm text-slate-500 font-medium bg-slate-950 inline-block px-3 py-1 rounded-full border border-slate-800">
                      {quizzes.filter((q) => !q.subjectId).length} Quizzes
                    </div>
                  </CardContent>
                  <CardFooter>
                    <span className="text-sm text-cyan-500 font-medium flex items-center group-hover:underline">
                      View Quizzes <BookOpen className="ml-2 h-4 w-4" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
