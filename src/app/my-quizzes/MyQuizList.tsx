"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Edit3,
  BarChart2,
  Clock,
  Users,
  ArrowRight,
  Search,
} from "lucide-react";

type Quiz = {
  _id: string;
  title: string;
  description?: string;
  isPublished: boolean;
  responseCount?: number;
  createdAt: string;
  publicId: string;
};

export default function MyQuizList({ quizzes }: { quizzes: Quiz[] }) {
  const [query, setQuery] = useState("");

  const filtered = quizzes.filter((quiz) => {
    const q = query.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(q) ||
      (quiz.description?.toLowerCase() || "").includes(q)
    );
  });

  return (
    <>
      {/* Search Input */}
      <div className="relative max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search quizzes..."
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
              key={quiz._id}
              className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold line-clamp-2">
                    {quiz.title || "Untitled Quiz"}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      quiz.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {quiz.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {quiz.description || "No description"}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {quiz.responseCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex justify-between items-center border-t">
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/quizzes/edit/${quiz._id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/${quiz._id}/responses`}
                    className="text-sm text-gray-600 hover:text-gray-500 flex items-center"
                  >
                    <BarChart2 className="w-4 h-4 mr-1" />
                    Results
                  </Link>
                </div>
                <Link
                  href={`/quiz/${quiz.publicId}`}
                  className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  View <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
