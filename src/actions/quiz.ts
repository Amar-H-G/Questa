"use server";

import mongoose, { Types } from "mongoose";
import { createServer } from "@/lib/supabase/server";
import { connectToDB } from "@/lib/db";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";
import { generatePublicId } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Response from "@/models/Response";
import User from "@/models/User";
import Answer from "@/models/Answer";

// Type definitions
interface PublicQuiz {
  id: string;
  publicId: string;
  title: string;
  description?: string;
  createdAt: Date | string;
  user: {
    name: string;
    id?: string;
  };
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options: string[];
    order: number;
  }>;
  responseCount: number;
  isPublished: boolean;
}

interface QuizResponse {
  success?: boolean;
  responseId?: string;
  error?: string;
  details?: any;
  publicId?: string;
  quiz?: any;
}

// Validation schema
const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  questions: z
    .array(
      z.object({
        text: z.string().min(3, "Question text must be at least 3 characters"),
        type: z.enum(["SINGLE_CHOICE", "SHORT_TEXT"]),
        options: z
          .array(z.string().min(1, "Option cannot be empty"))
          .optional(),
      })
    )
    .min(1, "At least one question is required"),
});

// Helper function to sanitize quiz data
function sanitizeQuiz(quiz: any) {
  const plainQuiz = quiz?.toObject ? quiz.toObject() : quiz;
  const dateFields = ["createdAt", "updatedAt"];

  dateFields.forEach((field) => {
    if (plainQuiz[field] instanceof Date) {
      plainQuiz[field] = plainQuiz[field].toISOString();
    }
  });

  const cleanQuiz = JSON.parse(
    JSON.stringify(plainQuiz, (key, value) => {
      if (value?.type === "Buffer" || value instanceof Uint8Array) {
        return undefined;
      }
      return value;
    })
  );

  cleanQuiz.questions = cleanQuiz.questions || [];

  cleanQuiz.questions = cleanQuiz.questions.map((q: any) => {
    const question = { ...q };
    dateFields.forEach((field) => {
      if (question[field] instanceof Date) {
        question[field] = question[field].toISOString();
      }
    });
    if (question._id) question._id = question._id.toString();
    if (question.quiz) question.quiz = question.quiz.toString();
    return question;
  });

  return {
    ...cleanQuiz,
    id: cleanQuiz._id?.toString(),
    _id: cleanQuiz._id?.toString(),
    user: cleanQuiz.user?.toString(),
    createdAt: cleanQuiz.createdAt,
    updatedAt: cleanQuiz.updatedAt,
  };
}

// Quiz CRUD Operations
export async function createQuiz(formData: unknown): Promise<QuizResponse> {
  const validation = quizSchema.safeParse(formData);
  if (!validation.success) {
    return {
      error: "Validation failed",
      details: validation.error.flatten().fieldErrors,
    };
  }

  const { title, description, questions, userId } = validation.data;

  try {
    await connectToDB();
    const {
      data: { session },
    } = await (await createServer()).auth.getSession();

    if (!session || session.user.id !== userId) {
      return { error: "Unauthorized" };
    }

    const userDoc = await User.findOne({ supabaseUserId: userId });
    if (!userDoc) {
      return { error: "User not found" };
    }

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      const [quiz] = await Quiz.create(
        [
          {
            title,
            description,
            publicId: generatePublicId(),
            userId,
            user: userDoc._id,
            questions: [],
            isPublished: true,
            responseCount: 0,
          },
        ],
        { session: mongoSession }
      );

      const createdQuestions = await Question.insertMany(
        questions.map((question, index) => ({
          text: question.text,
          type: question.type,
          options:
            question.type === "SINGLE_CHOICE" ? question.options ?? [] : [],
          order: index,
          quiz: quiz._id,
        })),
        { session: mongoSession }
      );

      quiz.questions = createdQuestions.map((q) => q._id);
      await quiz.save({ session: mongoSession });

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      revalidatePath("/dashboard");
      return {
        success: true,
        publicId: (quiz as any).publicId,
        quiz: sanitizeQuiz(quiz.toObject()),
      };
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Quiz creation error:", error);
    return { error: "Failed to create quiz" };
  }
}

export async function getQuizById(id: string): Promise<any> {
  try {
    await connectToDB();
    const quiz = await Quiz.findById(id)
      .populate({
        path: "questions",
        options: { sort: { order: 1 } },
      })
      .populate("user", "_id email")
      .lean();

    return quiz ? sanitizeQuiz(quiz) : null;
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return null;
  }
}

export async function updateQuiz(
  id: string,
  formData: unknown
): Promise<QuizResponse> {
  const validation = quizSchema.safeParse(formData);
  if (!validation.success) {
    return { error: "Invalid quiz data" };
  }

  const { title, description, questions, userId } = validation.data;

  try {
    await connectToDB();
    const quiz = await Quiz.findById(id).populate("user");
    if (!quiz) return { error: "Quiz not found" };

    const isOwner =
      (quiz.user && (quiz.user as any)._id?.toString() === userId) ||
      quiz.userId === userId;
    if (!isOwner) return { error: "Unauthorized" };

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      quiz.title = title;
      quiz.description = description;

      await Question.deleteMany({ quiz: quiz._id }, { session: mongoSession });

      const updatedQuestions = await Question.insertMany(
        questions.map((q, i) => ({
          text: q.text,
          type: q.type,
          options: q.type === "SINGLE_CHOICE" ? q.options ?? [] : [],
          order: i,
          quiz: quiz._id,
        })),
        { session: mongoSession }
      );

      quiz.questions = updatedQuestions.map((q) => q._id);
      await quiz.save({ session: mongoSession });

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/${id}`);

      return { success: true, quiz: sanitizeQuiz(quiz.toObject()) };
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Quiz update error:", error);
    return { error: "Failed to update quiz" };
  }
}

export async function getQuizByPublicId(
  publicId: string
): Promise<PublicQuiz | null> {
  try {
    await connectToDB();
    const quiz = await Quiz.findOne({ publicId, isPublished: true })
      .populate({
        path: "questions",
        options: { sort: { order: 1 } },
      })
      .populate("user", "name")
      .lean();

    if (!quiz) return null;

    return {
      id:
        !Array.isArray(quiz) && quiz._id
          ? (quiz._id as Types.ObjectId | string).toString()
          : "",
      publicId: (quiz as any).publicId,
      title: (quiz as any).title,
      description: (quiz as any).description,
      createdAt: (quiz as any).createdAt,
      user: { name: (quiz as any).user?.name || "Unknown" },
      questions: ((quiz as any).questions || []).map((q: any) => ({
        id: q._id.toString(),
        text: q.text,
        type: q.type,
        options: q.options || [],
        order: q.order,
      })),
      responseCount: (quiz as any).responseCount || 0,
      isPublished: (quiz as any).isPublished || false,
    };
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return null;
  }
}

export async function getAllPublicQuizzes(): Promise<PublicQuiz[]> {
  try {
    await connectToDB();
    const quizzes = await Quiz.find({ isPublished: true })
      .populate("user", "name supabaseUserId")
      .populate("questions", "text type options order")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return quizzes.map((quiz) => ({
      id: (quiz._id as Types.ObjectId | string).toString(),
      publicId: quiz.publicId,
      title: quiz.title,
      description: quiz.description || "",
      createdAt: quiz.createdAt,
      user: {
        name: quiz.user?.name || "Unknown",
        id: quiz.user?.supabaseUserId || "",
      },
      questions: (quiz.questions || []).map((q: any) => ({
        id: q._id.toString(),
        text: q.text,
        type: q.type,
        options: q.options || [],
        order: q.order || 0,
      })),
      responseCount: quiz.responseCount || 0,
      isPublished: quiz.isPublished || false,
    }));
  } catch (error) {
    console.error("Failed to fetch public quizzes:", error);
    return [];
  }
}

interface QuizResponse {
  success?: boolean;
  responseId?: string;
  error?: string;
}

export async function submitQuizResponse(data: {
  quizId: string;
  answers: Array<{
    questionId: string;
    text: string;
  }>;
}): Promise<QuizResponse> {
  try {
    if (!data.quizId || !data.answers?.length) {
      console.warn("[submitQuizResponse] Invalid response data:", data);
      throw new Error("Invalid response data");
    }

    await connectToDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step 1: Create the Response
      const [response] = await Response.create(
        [
          {
            quiz: data.quizId,
            answers: [],
          },
        ],
        { session }
      );

      // ✅ FIX: Add ordered: true when creating multiple documents with a session
      const createdAnswers = await Answer.create(
        data.answers.map((answer) => ({
          question: answer.questionId,
          text: answer.text,
          response: response._id,
        })),
        {
          session,
          ordered: true, // <-- REQUIRED when using session + array
        }
      );

      // Step 3: Link answers to the response
      response.answers = createdAnswers.map((a) => a._id);
      await response.save({ session });

      // Step 4: Increment quiz response count
      const updated = await Quiz.findByIdAndUpdate(
        data.quizId,
        { $inc: { responseCount: 1 } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Optional revalidation (can be customized)
      revalidatePath(`/quiz/[publicId]`, "page");

      return { success: true, responseId: response._id.toString() };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("[submitQuizResponse] Transaction error:", error);
      throw error;
    }
  } catch (error) {
    console.error(
      "[submitQuizResponse] Failed to submit quiz response:",
      error
    );
    return {
      error: error instanceof Error ? error.message : "Submission failed",
    };
  }
}

export async function getQuizzesByUser(userId: string): Promise<any[]> {
  try {
    await connectToDB();
    const user = await User.findOne({ supabaseUserId: userId }).lean();
    if (!user) return [];

    const quizzes = await Quiz.find({
      $or: [{ user: (user as any)._id }, { userId: userId }],
    })
      .populate({
        path: "questions",
        options: { sort: { order: 1 } },
      })
      .sort({ createdAt: -1 })
      .lean();

    return quizzes.map(sanitizeQuiz);
  } catch (error) {
    console.error("Failed to fetch user quizzes:", error);
    return [];
  }
}

export async function getQuizWithResponses(
  quizId: string,
  supabaseUserId: string
) {
  await connectToDB();

  const mongoUser = await User.findOne({ supabaseUserId }); // Changed from authId to match your schema
  if (!mongoUser) return null;

  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(quizId);
  } catch {
    return null; // invalid ID format
  }

  const quiz = await Quiz.findOne({
    _id: objectId,
    user: mongoUser._id,
  })
    .populate({
      path: "responses",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "answers",
        populate: { path: "question", model: "Question" },
      },
    })
    .lean();

  if (!quiz) return null;

  // Ensure responses is always an array
  const quizWithResponsesObj = quiz as typeof quiz & { responses: any[] };
  if (!quizWithResponsesObj.responses) {
    quizWithResponsesObj.responses = [];
  } else if (!Array.isArray(quizWithResponsesObj.responses)) {
    quizWithResponsesObj.responses = [quizWithResponsesObj.responses];
  }

  const quizWithResponses = {
    ...quizWithResponsesObj,
    responses: quizWithResponsesObj.responses.map((response: any) => ({
      ...response,
      answers:
        response.answers?.map((a: any) => ({
          question: a.question,
          answer: a.text,
        })) || [],
    })),
  };

  return quizWithResponses;
}
