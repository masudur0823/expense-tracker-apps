import { dbConnect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Expense from "@/model/expense-model";

export const GET = async (req, { params }) => {
  const { id } = await params;
  try {
    await dbConnect();
    const documents = await Expense.findById(id).lean();

    const modifiedDocuments = {
      ...documents,
      id: documents._id,
      _id: undefined,
    };

    return NextResponse.json({
      message: "Data find Successfully",
      success: true,
      result: modifiedDocuments,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

export const DELETE = async (req, { params }) => {
  const { id } = await params;
  try {
    await dbConnect();

    // 1) Find the document first (so we know what image to delete)
    const existingDoc = await Expense.findById(id);
    if (!existingDoc) {
      return NextResponse.json(
        { message: "Document Not Found" },
        { status: 404 }
      );
    }

    // 2) Delete the document from the database
    await Expense.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Document deleted Successfully",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

export async function PUT(req, { params }) {
  const { id } = await params;

  try {
    await dbConnect();
    const reqBody = await req.json();
    // const { thumbnail, mobileimg } = reqBody;

    const updated = await Expense.findByIdAndUpdate(
      id,
      { $set: { ...reqBody } },
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json(
      { message: "updated successfully", result: updated },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 400 }
    );
  }
}
