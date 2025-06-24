"use client";

import { useState } from "react";
import { submitQuizResponse } from "../../actions/quiz";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  order: number;
}

interface Quiz {
  id: string;
  title?: string;
  questions: Question[];
}

export default function QuizView({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await submitQuizResponse({
        quizId: quiz.id,
        answers: Object.entries(answers).map(([questionId, text]) => ({
          questionId,
          text,
        })),
      });
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-green-50 rounded-lg text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800 mb-2">
          Quiz Submitted!
        </h3>
        <p className="text-green-600">
          Thank you for completing "{quiz.title || "this quiz"}".
        </p>
        <p className="text-green-500 mt-4">Redirecting to dashboard...</p>
      </motion.div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress indicator */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${
              ((currentQuestionIndex + 1) / quiz.questions.length) * 100
            }%`,
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold">{currentQuestion.text}</h3>

          {currentQuestion.type === "SINGLE_CHOICE" ? (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <label
                  key={`${currentQuestion.id}-${index}`} // ✅ Unique key
                  className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    answers[currentQuestion.id] === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() =>
                      handleAnswerChange(currentQuestion.id, option)
                    }
                    className="mr-3"
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              required
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || !answers[currentQuestion.id]}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
