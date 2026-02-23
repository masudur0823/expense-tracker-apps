import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    incomeName: {
      type: String,
      default: "No Income",
      // required: true,
    },
    amount: {
      type: Number,
      default: 0,
      // required: true,
    },
    date: {
      type: Date,
      // required: true,
    },
    category: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Income =
  mongoose.models?.Income ?? mongoose.model("Income", incomeSchema);

export default Income;
