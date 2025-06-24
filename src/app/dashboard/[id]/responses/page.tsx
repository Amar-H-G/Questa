import { notFound, redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";
import { getQuizWithResponses } from "@/actions/quiz";

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

type QuizWithResponses = {
  title: string;
  responses: any[];
  [key: string]: any;
};

export default async function QuizResponsesPage({ params }: PageProps) {
  if (params instanceof Promise) {
    // console.warn("⚠️ Route params was a Promise. Awaiting...");
    params = await params;
  }

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  let quiz: QuizWithResponses | null = null;

  try {
    quiz = (await getQuizWithResponses(
      params.id,
      user.id
    )) as unknown as QuizWithResponses;
  } catch (error) {
    notFound();
  }

  if (!quiz || typeof quiz !== "object") {
    notFound();
  }

  if (!Array.isArray(quiz.responses)) {
    console.warn("⚠️ quiz.responses is not an array. Setting to empty.");
    quiz.responses = [];
  }

  if (typeof quiz.title !== "string") {
    console.warn("⚠️ quiz.title is not a string. Setting default.");
    quiz.title = "Untitled Quiz";
  }

  return (
    <div className="max-w-5xl mx-auto py-14 px-4 sm:px-6 lg:px-8 ">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Responses for: <span className="text-indigo-600">{quiz.title}</span>
      </h1>

      {quiz.responses.length === 0 ? (
        <div className="text-gray-500 text-center">No responses yet.</div>
      ) : (
        <div className="space-y-6">
          {quiz.responses.map((response: any, respIndex: number) => {
            const responseKey =
              response._id?.toString?.() ||
              response.id ||
              `response-${respIndex}`;

            return (
              <div
                key={responseKey}
                className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
              >
                <div className="text-sm text-gray-500 mb-4">
                  Submitted on: {new Date(response.createdAt).toLocaleString()}
                </div>

                <div className="space-y-4">
                  {response.answers.map((answer: any, index: number) => {
                    const answerKey =
                      answer._id?.toString?.() ||
                      answer.id ||
                      `${responseKey}-answer-${index}`;

                    return (
                      <div
                        key={answerKey}
                        className="border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <h3 className="font-medium text-gray-700">
                          {answer.question?.text || `Question ${index + 1}`}
                        </h3>
                        <p className="text-gray-800">
                          {answer.text || answer.answer}
                        </p>
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
}
