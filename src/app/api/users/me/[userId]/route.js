import { auth } from "@/auth";
import { dbConnect } from "@/dbConfig/dbConfig";
import User from "@/model/user-model";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { userId } = await params;
  const session = await auth();

  if (session.user.role !== "Admin") {
    return NextResponse.json(
      { message: "You don't have any permission" },
      { status: 200 }
    );
  }

  try {
    await dbConnect();

    const user = await User.findById(userId);

    return NextResponse.json(
      { message: "find successfully", result: user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 400 }
    );
  }
}

export async function PATCH(req, { params }) {
  const { userId } = await params;
  const session = await auth();

  if (session.user.role !== "Admin") {
    return NextResponse.json(
      { message: "You don't have any permission" },
      { status: 200 }
    );
  }

  try {
    await dbConnect();
    const reqBody = await req.json();

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: reqBody },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "updated successfully", result: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 400 }
    );
  }
}
