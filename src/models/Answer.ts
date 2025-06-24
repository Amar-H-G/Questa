import mongoose, { Schema, Types, Document, model, models } from "mongoose";
import { IResponse } from "./Response";
import { IQuestion } from "./Question";

export interface IAnswer extends Document {
  response: Types.ObjectId | IResponse | string;
  question: Types.ObjectId | IQuestion | string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    response: {
      type: Schema.Types.ObjectId,
      ref: "Response",
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
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

// Safe export
const Answer = models.Answer || model<IAnswer>("Answer", AnswerSchema);
export default Answer;
