// app/public-quizzes/PublicQuizList.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Users, ArrowRight, Search } from "lucide-react";

type Quiz = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  responseCount?: number;
  publicId: string;
  user?: {
    name?: string;
  };
};

export default function PublicQuizList({ quizzes }: { quizzes: Quiz[] }) {
  const [query, setQuery] = useState("");

  const filtered = quizzes.filter((quiz) => {
    const q = query.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(q) ||
      (quiz.description?.toLowerCase() ?? "").includes(q)
    );
  });

  return (
    <>
      <div className="relative max-w-md mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search public quizzes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No quizzes match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition hover:-translate-y-1"
            >
              <div className="flex justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {quiz.title}
                </h3>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                  Public
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {quiz.description || "No description"}
              </p>
              <div className="text-sm text-gray-500 flex justify-between">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {quiz.responseCount}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />{" "}
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-4 border-t mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  By {quiz.user?.name || "Unknown"}
                </span>
                <Link
                  href={`/quiz/${quiz.publicId}`}
                  className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  Take Quiz <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
