import mongoose, { Schema, Types, Document, model, models } from "mongoose";
import { IUser } from "./User";
import { IQuestion } from "./Question";

export interface IQuiz extends Document {
  title: string;
  description?: string;
  publicId: string;
  userId: string; // Supabase UUID
  user: Types.ObjectId | IUser; // MongoDB ObjectId ref to User
  questions: Types.ObjectId[]; // Ref to Question docs
  isPublished: boolean;
  responseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    publicId: { type: String, required: true, index: true },
    userId: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    responseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

// ✅ Text index for search functionality
QuizSchema.index({ title: "text", description: "text" });

// ✅ Indexes for efficient querying
QuizSchema.index({ userId: 1 });
QuizSchema.index({ user: 1 });
// QuizSchema.index({ publicId: 1 });
QuizSchema.index({ isPublished: 1 });

// ✅ Virtual populate for response count
QuizSchema.virtual("responses", {
  ref: "Response",
  localField: "_id",
  foreignField: "quiz",
});

// ✅ Safe model export for hot reload
const Quiz = models.Quiz || model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
