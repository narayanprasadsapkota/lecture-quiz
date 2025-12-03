"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkCreateQuiz() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const exampleJson = {
    title: "Quiz Title (Required)",
    description: "Quiz description (Optional)",
    questions: [
      {
        text: "Question text (Required)",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: "Option 1 (Must match one of the options)",
        explanation: "Explanation for the answer (Required)",
      },
      {
        text: "Question text 2 (Required)",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: "Option 1 (Must match one of the options)",
        explanation: "Explanation for the answer (Required)",
      },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Parse JSON to validate it
      const parsedData = JSON.parse(jsonInput);

      // Submit to API
      const response = await fetch("/api/quizzes/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create quiz");
        setLoading(false);
        return;
      }

      setSuccess(result.message);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format. Please check your JSON syntax.");
      } else {
        setError("An error occurred while creating the quiz.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setJsonInput(JSON.stringify(exampleJson, null, 2));
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bulk Create Quiz
            </h1>
            <p className="text-gray-600">
              Paste your quiz JSON below to create a complete quiz with all
              questions at once.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="jsonInput"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quiz JSON
                </label>
                <button
                  type="button"
                  onClick={loadExample}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Load Example
                </button>
              </div>
              <textarea
                id="jsonInput"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your quiz JSON here..."
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Success!</p>
                <p className="text-sm">{success}</p>
                <p className="text-sm mt-1">Redirecting to admin page...</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? "Creating Quiz..." : "Create Quiz"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Expected JSON Format
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(exampleJson, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
