import { dbConnect } from "@/dbConfig/dbConfig";
import Income from "@/model/income-model";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  await dbConnect();
  try {
    const documents = await Income.find({})
      .select({ __v: 0 })
      .sort({ date: -1 })
      .lean();

    const modifiedDocuments = documents.map((doc) => {
      return {
        ...doc,
        id: doc._id,
        _id: undefined,
      };
    });

    return NextResponse.json({
      message: "Data find Successfully",
      success: true,
      result: modifiedDocuments,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

export const POST = async (req, res) => {
  try {
    await dbConnect();
    const reqBody = await req.json();

    // Check if the incoming body is an array
    const isArray = Array.isArray(reqBody.incomes);
    
    let data;
    if (isArray) {
      // Use insertMany for multiple documents
      data = await Income.insertMany(reqBody.incomes);
    } else {
      // Fallback for a single document
      const info = new Income(reqBody);
      data = await info.save();
    }

    return NextResponse.json(
      { 
        message: isArray ? "Multiple records saved" : "Data successfully saved", 
        data: data 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};