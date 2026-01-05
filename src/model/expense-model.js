import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    expenseName: {
      type: String,
      default: "No Expense",
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

const Expense =
  mongoose.models?.Expense ?? mongoose.model("Expense", expenseSchema);

export default Expense;
