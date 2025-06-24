// src/app/dashboard/create/page.tsx
"use client";

import { useState } from "react";
import { createQuiz } from "@/actions/quiz";
import { QuizForm } from "@/components/quiz/QuizForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type QuestionType = "SINGLE_CHOICE" | "SHORT_TEXT";

interface Question {
  text: string;
  type: QuestionType;
  options: string[];
}

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: "",
      type: "SINGLE_CHOICE",
      options: ["", ""],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {

    // Get current user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to create a quiz");
      console.error("[Validation] User not authenticated");
      return;
    }

    const userId = user.id;

    if (!title.trim()) {
      toast.error("Quiz title is required");
      console.warn("[Validation] Missing title");
      return;
    }

    if (questions.length === 0) {
      toast.error("At least one question is required");
      console.warn("[Validation] No questions added");
      return;
    }

    for (const [i, q] of questions.entries()) {
      if (!q.text.trim()) {
        toast.error("All questions must have text");
        console.warn(`[Validation] Question ${i + 1} missing text`);
        return;
      }

      if (q.type === "SINGLE_CHOICE") {
        const filteredOptions = q.options.filter((opt) => opt.trim() !== "");
        if (filteredOptions.length < 2) {
          toast.error("Multiple choice questions need at least two options");
          console.warn(
            `[Validation] Question ${i + 1} has insufficient options`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);

    const payload = {
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
      userId,
    };


    try {
      const result = await createQuiz(payload);


      if ("error" in result) {
        toast.error(result.error);
        console.error("[Submit] Error returned from createQuiz:", result.error);
      } else {
        toast.success("Quiz created successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("[Submit] Quiz creation error:", error);
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Create New Quiz
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
