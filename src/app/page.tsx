import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Animated Logo/Brand */}
          <div className="w-20 h-20 bg-indigo-600 rounded-xl shadow-lg mx-auto mb-8 flex items-center justify-center animate-bounce">
            <span className="text-white text-2xl font-bold">Q</span>
          </div>

          {/* Hero Section */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Create & Share <span className="text-indigo-600">Quizzes</span> in
            Seconds
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Questa makes it easy to create engaging quizzes and get instant
            responses from your audience.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="auth/signup"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="auth/signin"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 shadow-sm transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: "✨",
                title: "Easy Creation",
                desc: "Build quizzes with our intuitive editor",
              },
              {
                icon: "🔗",
                title: "Instant Sharing",
                desc: "Share with just one click",
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                desc: "Track responses as they come in",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Demo Preview */}
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-1">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="pt-10 pb-6 px-6">
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg">Sample Quiz</h4>
                <p className="text-gray-500 mb-4">
                  What's your favorite programming language?
                </p>
              </div>
              <div className="space-y-3 max-w-xs mx-auto">
                {["JavaScript", "Python", "TypeScript", "Other"].map(
                  (option, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                    >
                      {option}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
