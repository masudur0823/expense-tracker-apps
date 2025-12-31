import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a username"],
    },
    userImg: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please provide a email"],
      unique: true,
    },

    occupation: {
      type: String,
    },
    university: {
      type: String,
    },
    graduateFrom: { type: String },
    passingYear: { type: String },
    studentId: { type: String },

    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Student", "Moderator"],
      default: "Student",
    },
    profileComplete: {
      type: Number,
      default: 0,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    isCommentingAbandon: { type: Boolean, default: false },
    isQuestioningAbandon: { type: Boolean, default: false },
    isForumAbandon: { type: Boolean, default: false },
    forumAbandonTime: { type: Date, default: new Date() },
  },
  { timestamps: true }
);

const User = mongoose.models?.User ?? mongoose.model("User", userSchema);

export default User;
