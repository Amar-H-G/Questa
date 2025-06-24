// File: src/app/quiz/[publicId]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getQuizByPublicId } from "@/actions/quiz";
import QuizView from "@/components/quiz/QuizView";

interface ParamsShape {
  publicId: string;
}

type MaybePromiseParams = ParamsShape | Promise<ParamsShape>;

// 1) generateMetadata
export async function generateMetadata({
  params,
}: {
  params: MaybePromiseParams;
}): Promise<Metadata> {
  // If params is a Promise, await it
  if (params instanceof Promise) {
    params = await params;
  }

  const publicId = params.publicId;
  const quiz = await getQuizByPublicId(publicId);

  return {
    title: quiz?.title || "Quiz Not Found",
    description: quiz?.description || "Take this interactive quiz",
  };
}

// 2) Page component
export default async function Page({
  params,
}: {
  params: { publicId: string };
}) {
  // Await again in case Next passes a Promise
  if (params instanceof Promise) {
    params = await params;
  }
  const publicId = params.publicId;

  const quiz = await getQuizByPublicId(publicId);
  if (!quiz) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-gray-600 text-center mb-4">{quiz.description}</p>
          )}
          <div className="flex justify-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              {quiz.questions.length} Questions
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
              {quiz.responseCount} Responses
            </span>
          </div>
        </div>

        {/* Quiz Body */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <QuizView quiz={quiz} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Created with Questa
        </div>
      </div>
    </div>
  );
}
