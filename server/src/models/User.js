import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    age: this.age,
    email: this.email,
    username: this.username
  };
};

export const User = mongoose.model("User", userSchema);
