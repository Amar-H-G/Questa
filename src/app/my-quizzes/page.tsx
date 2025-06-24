// app/my-quizzes/page.tsx

"use server";

import { getQuizzesByUser } from "../../actions/quiz";
import { createServer } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, FileText } from "lucide-react";
import MyQuizList from "./MyQuizList"; // ✅ new client component

export default async function MyQuizzesPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const myQuizzes = await getQuizzesByUser(user.id);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
        <Link
          href="/dashboard/quizzes/create"
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Quiz
        </Link>
      </div>

      {myQuizzes.length === 0 ? (
        <div className="bg-white border rounded-xl p-14 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-800">No quizzes yet</h2>
          <p className="text-gray-500 mt-2">Create one to get started!</p>
        </div>
      ) : (
        <MyQuizList quizzes={myQuizzes} />
      )}
    </div>
  );
}
