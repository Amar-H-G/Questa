<h1 align="center" style="color:#0070f3;">Questa 🎓</h1>
<p align="center">
  <img src="public/next.svg" width="80" alt="Next.js Logo" />
  <img src="public/vercel.svg" width="80" alt="Vercel Logo" />
</p>

<p align="center" style="color:#22c55e;font-size:1.2em;">
  A modern, full-stack quiz platform built with <b style="color:#0070f3;">Next.js</b>, <b style="color:#f59e42;">TypeScript</b>, and <b style="color:#3ecf8e;">Supabase</b>.
</p>

---

## 🚀 Live Demo

🌐 **Live URL:** https://questa-lyyb.onrender.com

---

## ✨ Features

- 📝 **Quiz Creation:** Create, edit, and manage quizzes with multiple questions and answers.
- 📊 **Dashboard:** View all your quizzes and their statistics in a beautiful dashboard.
- 🔒 **Authentication:** Secure sign up and sign in with Supabase Auth.
- 📥 **Quiz Responses:** Collect and review responses for each quiz.
- 👀 **Public Quiz Sharing:** Share quizzes via public links.
- 🎨 **Modern UI:** Responsive and accessible design with custom components.
- ⚡ **API Routes:** RESTful endpoints for user and quiz management.

---

## 🗂️ Project Structure

```
public/
  file.svg, globe.svg, next.svg, vercel.svg, window.svg
src/
  actions/quiz.ts
  app/
    api/users/route.ts
    auth/signin/page.tsx
    auth/signup/page.tsx
    dashboard/page.tsx
    dashboard/[id]/responses/page.tsx
    dashboard/quizzes/create/page.tsx
    dashboard/quizzes/edit/[id]/page.tsx
    quiz/publicId/page.jsx
    favicon.ico, globals.css, layout.tsx, page.tsx
  components/
    auth/AuthForm.tsx
    layout/Navbar.tsx
    quiz/QuestionEditor.tsx, QuizForm.tsx, QuizView.tsx
    ui/button.tsx, input.tsx, label.tsx, select.tsx
  lib/
    db.ts, utils.ts
    supabase/client.ts, server.ts
  models/
    Answer.ts, Question.ts, Quiz.ts, Response.ts, User.ts
.eslint.config.mjs, next-env.d.ts, next.config.ts, package.json, postcss.config.mjs, README.md, tsconfig.json
```

---

## 🛠️ Dependencies

- <span style="color:#0070f3">Next.js</span> (App Router)
- <span style="color:#f59e42">TypeScript</span>
- <span style="color:#3ecf8e">Supabase</span> (Database & Auth)
- <span style="color:#38bdf8">Tailwind CSS</span>
- <span style="color:#f472b6">Framer Motion</span> (optional, for animations)
- <span style="color:#64748b">ESLint</span>, <span style="color:#64748b">Prettier</span> (code quality)
- <span style="color:#64748b">PostCSS</span>

See `package.json` for the full list.

---

## 🗺️ Main Routes

| Route                          | Description               |
| ------------------------------ | ------------------------- |
| `/`                            | Home page                 |
| `/auth/signin`                 | Sign in                   |
| `/auth/signup`                 | Sign up                   |
| `/dashboard`                   | User dashboard            |
| `/dashboard/quizzes/create`    | Create a new quiz         |
| `/dashboard/quizzes/edit/[id]` | Edit an existing quiz     |
| `/dashboard/[id]/responses`    | View responses for a quiz |
| `/quiz/publicId`               | Public quiz view          |
| `/api/users`                   | User API endpoint         |

---

## 🧑‍💻 Getting Started

### 1. Clone the repository

```powershell
git clone https://github.com/Amar-H-G/questa.git
cd questa
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the development server

```powershell
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🛡️ License

MIT


## User Join Flow 
Signup

User enters name, email, password → clicks Sign Up.

System sends a verification email.

Email Confirmation

User checks email → clicks verification link.

Then go to website again and click signin

Signin

User enters email & password on login page.

If verified → logged in.

If not → show “Please verify email” message.

---

<p align="center" style="color:#0070f3;font-size:1.1em;">
  Made with ❤️ using Next.js, TypeScript, and Supabase.
</p>
