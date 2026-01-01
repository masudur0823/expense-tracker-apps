import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    expenseName: {
      type: String,
      // required: true,
    },
    amount: {
      type: Number,
      // required: true,
    },
    date: {
      type: String,
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
