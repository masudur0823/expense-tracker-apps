import { dbConnect } from "@/dbConfig/dbConfig";
import User from "@/model/user-model";
import { NextResponse } from "next/server";



export const GET = async (req, res) => {
  await dbConnect();
  try {
    const documents = await User.find({}).select({ __v: 0 }).sort({ createdAt: -1 }).lean();
    const modifiedDocuments = documents.map((doc) => {
      return {
        ...doc,
        id: doc._id,
        _id: undefined,
      };
    });

    return NextResponse.json({
      message: "Contact find Successfully",
      success: true,
      result: modifiedDocuments,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
