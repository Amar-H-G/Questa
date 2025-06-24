"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "../../../../../lib/supabase/client";
import { getQuizById, updateQuiz } from "../../../../../actions/quiz";
import { QuizForm } from "../../../../../components/quiz/QuizForm";
import { Button } from "../../../../../components/ui/button";

type QuestionType = "SINGLE_CHOICE" | "SHORT_TEXT";

interface Question {
  text: string;
  type: QuestionType;
  options: string[];
  id?: string;
}

export default function EditQuizPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const quizId = params.id as string;

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(authError?.message || "User not authenticated");
        }

        const quiz = await getQuizById(quizId);

        if (!quiz) {
          throw new Error("Quiz not found");
        }

        // Improved ownership check
        const isOwner =
          (quiz.user && (quiz.user as any)._id?.toString() === user.id) ||
          quiz.userId === user.id;

        if (!isOwner) {
          throw new Error("Unauthorized access to quiz");
        }

        setTitle(quiz.title);
        setDescription(quiz.description || "");
        setQuestions(
          quiz.questions.map(
            (q: { text: any; type: any; options: any; _id: any }) => ({
              text: q.text,
              type: q.type,
              options: q.options || [],
              id: q._id,
            })
          )
        );
      } catch (error) {
        console.error("Quiz fetch error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load quiz"
        );
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, router, supabase.auth]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in to update a quiz");
      }

      if (!title.trim()) throw new Error("Quiz title is required");
      if (questions.length === 0)
        throw new Error("At least one question is required");

      questions.forEach((q, i) => {
        if (!q.text.trim()) throw new Error(`Question ${i + 1} must have text`);
        if (
          q.type === "SINGLE_CHOICE" &&
          q.options.filter((opt) => opt.trim() !== "").length < 2
        ) {
          throw new Error(`Question ${i + 1} needs at least two valid options`);
        }
      });

      const result = await updateQuiz(quizId, {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q) => ({
          text: q.text.trim(),
          type: q.type,
          options:
            q.type === "SINGLE_CHOICE"
              ? q.options.map((opt) => opt.trim()).filter((opt) => opt !== "")
              : [],
        })),
        userId: user.id,
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast.success("Quiz updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update quiz"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    title.trim() &&
    questions.length > 0 &&
    questions.every((q) => {
      const hasText = q.text.trim();
      const hasOptions =
        q.type !== "SINGLE_CHOICE" ||
        q.options.filter((opt) => opt.trim() !== "").length >= 2;
      return hasText && hasOptions;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">
          Edit Quiz
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <QuizForm
            title={title}
            description={description}
            questions={questions}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onQuestionsChange={setQuestions}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className={!isFormValid ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isSubmitting ? "Updating..." : "Update Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
