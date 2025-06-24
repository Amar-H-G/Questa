// app/public-quizzes/page.tsx

import { getAllPublicQuizzes } from "../../actions/quiz";
import { FileText } from "lucide-react";
import PublicQuizList from "./PublicQuizList"; // ✅ import client component

export default async function PublicQuizzesPage() {
  const publicQuizzes = await getAllPublicQuizzes();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-14 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        All Public Quizzes
      </h1>

      {publicQuizzes.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No public quizzes found</h3>
          <p className="text-gray-500">Try checking back later!</p>
        </div>
      ) : (
        <PublicQuizList
          quizzes={publicQuizzes.map((q) => ({
            ...q,
            createdAt:
              q.createdAt instanceof Date
                ? q.createdAt.toISOString()
                : q.createdAt,
          }))}
        />
      )}
    </div>
  );
}
