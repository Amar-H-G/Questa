"use server";

import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getQuizzesByUser, getAllPublicQuizzes } from "@/actions/quiz";
import { ensureMongoUser } from "@/lib/syncUser";
import Link from "next/link";
import {
  PlusCircle,
  BarChart2,
  Edit3,
  FileText,
  Clock,
  Users,
  Search,
  ArrowRight,
} from "lucide-react";

// ✅ NEW IMPORT:
import HorizontalScroll from "@/components/HorizontalScroll";

export default async function DashboardPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  await ensureMongoUser({ id: user.id, email: user.email });

  let myQuizzes: any[] = [];
  let publicQuizzes: any[] = [];
  let isLoading = false;
  let error: any = null;

  try {
    isLoading = true;
    [myQuizzes, publicQuizzes] = await Promise.all([
      getQuizzesByUser(user.id),
      getAllPublicQuizzes(),
    ]);
  } catch (err) {
    console.error("Data fetch error:", err);
    error = err;
  } finally {
    isLoading = false;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Quiz Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Explore public quizzes and manage your own
              </p>
            </div>
            <Link
              href="/dashboard/quizzes/create"
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Create New Quiz</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg">
            <div className="flex items-center">
              <p className="text-sm text-red-700">
                Failed to load quiz data. Please try again later.
              </p>
            </div>
          </div>
        )}

        {/* Public Quizzes */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                <Users className="w-5 h-5" />
              </span>
              Explore Public Quizzes
            </h2>
            {publicQuizzes.length > 0 && (
              <Link
                href="/public-quizzes"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
              >
                View all <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex space-x-6 pb-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse h-64"
                ></div>
              ))}
            </div>
          ) : publicQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No public quizzes available
              </h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
                Be the first to create a public quiz and share it with others
              </p>
            </div>
          ) : (
            <HorizontalScroll>
              {publicQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">
                        Public
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {quiz.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {quiz.responseCount} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      By {quiz.user?.name || "Unknown"}
                    </span>
                    <Link
                      href={`/quiz/${quiz.publicId}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      Take Quiz <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </HorizontalScroll>
          )}
        </section>

        {/* My Quizzes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              My Quizzes
            </h2>
            {myQuizzes.length > 0 && (
              <Link
                href="/my-quizzes"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
              >
                View all <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex space-x-6 pb-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse h-64"
                ></div>
              ))}
            </div>
          ) : myQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                You haven't created any quizzes yet
              </h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
                Create your first quiz to start collecting responses
              </p>
              <Link
                href="/dashboard/quizzes/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <HorizontalScroll>
              {myQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {quiz.title || "Untitled Quiz"}
                      </h3>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          quiz.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {quiz.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {quiz.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {quiz.responseCount || 0} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex space-x-3">
                      <Link
                        href={`/dashboard/quizzes/edit/${quiz._id}`}
                        className="text-indigo-600 hover:text-indigo-500 flex items-center text-sm"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 mr-1" /> Edit
                      </Link>
                      <Link
                        href={`/dashboard/${quiz._id}/responses`}
                        className="text-gray-600 hover:text-gray-500 flex items-center text-sm"
                        title="View Responses"
                      >
                        <BarChart2 className="w-4 h-4 mr-1" /> Results
                      </Link>
                    </div>
                    <Link
                      href={`/quiz/${quiz.publicId}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      View <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </HorizontalScroll>
          )}
        </section>
      </div>
    </div>
  );
}
