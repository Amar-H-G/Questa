import mongoose, { Schema, Types, Document, model, models } from "mongoose";
import { IQuiz } from "./Quiz";
import { IAnswer } from "./Answer";

export interface IResponse extends Document {
  quiz: Types.ObjectId | IQuiz | string;
  answers: (Types.ObjectId | IAnswer | string)[];
  createdAt: Date;
  updatedAt: Date;
}

const ResponseSchema = new Schema<IResponse>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;

        // Ensure answers are serialized as string IDs
        if (Array.isArray(ret.answers)) {
          ret.answers = ret.answers.map((a) =>
            typeof a === "object" && a !== null && a._id
              ? a._id.toString()
              : a.toString()
          );
        }
      },
    },
  }
);

// Safe export
const Response =
  models.Response || model<IResponse>("Response", ResponseSchema);

export default Response;
