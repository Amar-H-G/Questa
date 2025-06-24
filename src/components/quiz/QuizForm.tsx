"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { QuestionEditor } from "./QuestionEditor";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface Question {
  id?: string;
  text: string;
  type: "SINGLE_CHOICE" | "SHORT_TEXT";
  options: string[];
  order?: number;
}

interface QuizFormProps {
  id?: string;
  quizId?: string;
  userId?: string;
  title: string;
  description: string;
  questions: Question[];
  onTitleChange?: (val: string) => void;
  onDescriptionChange?: (val: string) => void;
  onQuestionsChange?: (val: Question[]) => void;
  onSubmit?: (data: {
    title: string;
    description: string;
    questions: Question[];
  }) => Promise<{ error?: string } | void>;
}

export function QuizForm({
  id,
  quizId,
  userId,
  title,
  description,
  questions,
  onTitleChange,
  onDescriptionChange,
  onQuestionsChange,
  onSubmit,
}: QuizFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      text: "",
      type: "SINGLE_CHOICE",
      options: ["", ""],
    };
    onQuestionsChange?.([...questions, newQuestion]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        title,
        description,
        questions,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Quiz saved successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to save quiz");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-6">
      {/* Rest of the form remains the same */}
      <div>
        <Label htmlFor="quiz-title">Quiz Title</Label>
        <Input
          id="quiz-title"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Enter quiz title"
          required
        />
      </div>

      <div>
        <Label htmlFor="quiz-description">Description (Optional)</Label>
        <Input
          id="quiz-description"
          value={description}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          placeholder="Enter quiz description"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Questions</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
          >
            Add Question
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id || index}
              question={question}
              onChange={(updatedQuestion) => {
                const newQuestions = [...questions];
                newQuestions[index] = updatedQuestion;
                onQuestionsChange?.(newQuestions);
              }}
              onRemove={() => {
                if (questions.length <= 1) return;
                const newQuestions = [...questions];
                newQuestions.splice(index, 1);
                onQuestionsChange?.(newQuestions);
              }}
              canRemove={questions.length > 1}
            />
          ))}
        </div>
      </div>
    </form>
  );
}

// "use client";

// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { QuestionEditor } from "./QuestionEditor";
// import { Button } from "../ui/button";
// import { useState } from "react";

// interface Question {
//   id?: string;
//   text: string;
//   type: "SINGLE_CHOICE" | "SHORT_TEXT";
//   options: string[];
//   order?: number;
// }

// interface QuizFormProps {
//   id?: string;
//   quizId?: string;
//   userId?: string;
//   title: string;
//   description: string;
//   questions: Question[];
//   onTitleChange?: (val: string) => void;
//   onDescriptionChange?: (val: string) => void;
//   onQuestionsChange?: (val: Question[]) => void;
// }

// export function QuizForm({
//   id,
//   quizId,
//   userId,
//   title,
//   description,
//   questions,
//   onTitleChange,
//   onDescriptionChange,
//   onQuestionsChange,
// }: QuizFormProps) {
//   const addQuestion = () => {
//     const newQuestion: Question = {
//       text: "",
//       type: "SINGLE_CHOICE",
//       options: ["", ""],
//     };
//     onQuestionsChange?.([...questions, newQuestion]);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <Label htmlFor="quiz-title">Quiz Title</Label>
//         <Input
//           id="quiz-title"
//           name="title"
//           value={title}
//           onChange={(e) => onTitleChange?.(e.target.value)}
//           placeholder="Enter quiz title"
//           required
//         />
//       </div>

//       <div>
//         <Label htmlFor="quiz-description">Description (Optional)</Label>
//         <Input
//           id="quiz-description"
//           name="description"
//           value={description}
//           onChange={(e) => onDescriptionChange?.(e.target.value)}
//           placeholder="Enter quiz description"
//         />
//       </div>

//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-medium">Questions</h2>
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={addQuestion}
//           >
//             Add Question
//           </Button>
//         </div>

//         <div className="space-y-4">
//           {questions.map((question, index) => (
//             <QuestionEditor
//               key={question.id || index}
//               question={question}
//               onChange={(updatedQuestion) => {
//                 const newQuestions = [...questions];
//                 newQuestions[index] = updatedQuestion;
//                 onQuestionsChange?.(newQuestions);
//               }}
//               onRemove={() => {
//                 if (questions.length <= 1) return;
//                 const newQuestions = [...questions];
//                 newQuestions.splice(index, 1);
//                 onQuestionsChange?.(newQuestions);
//               }}
//               canRemove={questions.length > 1}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
