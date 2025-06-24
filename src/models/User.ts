import mongoose, { Schema, Document } from "mongoose";

// Interface for User document
export interface IUser extends Document {
  email: string;
  name: string;
  supabaseUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    name: {
      type: String,
      required: true,
    },
    supabaseUserId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// ✅ Optional: add a compound index here if needed
// UserSchema.index({ email: 1 }); // Not needed unless you remove `unique: true`

// ✅ Format _id to id and remove Mongo-specific fields
UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

// ✅ Export model safely (prevent re-compilation errors in dev)
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
