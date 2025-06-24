import mongoose, { Schema, Types, Document, model, models } from "mongoose";

// Enum for question type
export enum QuestionType {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  SHORT_TEXT = "SHORT_TEXT",
}

// Interface for a question document
export interface IQuestion extends Document {
  quiz?: Types.ObjectId | string;
  text: string;
  type: QuestionType;
  options: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const QuestionSchema = new Schema<IQuestion>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(QuestionType),
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

// Safe export for dev
const Question =
  models.Question || model<IQuestion>("Question", QuestionSchema);

export default Question;
