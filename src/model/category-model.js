import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      match: /^#([0-9A-Fa-f]{6})$/,
    },
    icon: {
      type: String, // store icon name instead of JSX
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Category =
  mongoose.models?.Category ?? mongoose.model("Category", categorySchema);

export default Category;
