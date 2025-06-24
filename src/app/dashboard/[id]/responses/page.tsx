import { notFound, redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";
import { getQuizWithResponses } from "@/actions/quiz";
import type { Metadata } from "next";
import { promises } from "dns";

interface Answer {
  _id?: string;
  id?: string;
  question?: { text: string };
  text?: string;
  answer?: string;
}

interface QuizResponse {
  _id?: string;
  id?: string;
  createdAt?: string | Date;
  answers: Answer[];
}

export const metadata: Metadata = {
  title: "Quiz Responses",
};

// type PageProps = {
//   params: { id: string };
// };

export default async function QuizResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/signin");
  }

  try {
    const result = await getQuizWithResponses(id, user.id);

    if (!result || typeof result !== "object" || Array.isArray(result)) {
      throw new Error("Invalid quiz data");
    }

    const { responses, title, ...rest } = result as {
      responses?: unknown;
      title?: unknown;
      [key: string]: unknown;
    };

    const quiz = {
      title: typeof title === "string" ? title : "Untitled Quiz",
      responses: Array.isArray(responses) ? responses : [],
      ...rest,
    };

    return (
      <div className="max-w-5xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Responses for: <span className="text-indigo-600">{quiz.title}</span>
        </h1>

        {quiz.responses.length === 0 ? (
          <div className="text-gray-500 text-center">No responses yet.</div>
        ) : (
          <div className="space-y-6">
            {quiz.responses.map((response: unknown, respIndex: number) => {
              const r = response as QuizResponse;
              const responseKey =
                r._id?.toString?.() || r.id || `response-${respIndex}`;
              const createdAt = r.createdAt
                ? new Date(r.createdAt).toLocaleString()
                : "Unknown date";

              return (
                <div
                  key={responseKey}
                  className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                >
                  <div className="text-sm text-gray-500 mb-4">
                    Submitted on: {createdAt}
                  </div>

                  <div className="space-y-4">
                    {r.answers?.map((answer: Answer, index: number) => {
                      const answerKey =
                        answer._id?.toString?.() ||
                        answer.id ||
                        `${responseKey}-answer-${index}`;
                      const questionText =
                        answer.question?.text || `Question ${index + 1}`;
                      const answerText =
                        answer.text || answer.answer || "No answer provided";

                      return (
                        <div
                          key={answerKey}
                          className="border-b border-gray-200 pb-4 last:border-b-0"
                        >
                          <h3 className="font-medium text-gray-700">
                            {questionText}
                          </h3>
                          <p className="text-gray-800">{answerText}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading quiz:", error);
    notFound();
  }
}
