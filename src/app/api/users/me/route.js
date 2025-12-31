import calculateCompletion from "@/app/_helper/calculateProfileCompletion";
import { auth } from "@/auth";
import { dbConnect } from "@/dbConfig/dbConfig";
import User from "@/model/user-model";
import { saveImageAndDeleteOld } from "@/utils/saveBase64Image";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await auth();
  const userId = session?.user?.id;
  try {
    await dbConnect();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid or missing user ID" },
        { status: 400 }
      );
    }

    const doc = await User.findById(userId)
      .select({ __v: 0, password: 0 })
      .lean();

    // console.log(enrollments);

    return NextResponse.json({ result: doc }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    await dbConnect();

    const reqbody = await req.json();
    const { name, email, phone, occupation, university, studentId, userImg } = reqbody;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid or missing user ID" },
        { status: 400 }
      );
    }

    const foundProfile = await User.findById(userId)
      .select({ __v: 0, password: 0 })
      .lean();

    const userUrl = await saveImageAndDeleteOld(userImg, foundProfile?.userImg);

    const completionPercent = calculateCompletion(reqbody);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          email,
          phone,
          occupation,
          university,
          studentId,
          userImg: userUrl,
          profileComplete: completionPercent,
        },
      },
      { new: true, runValidators: true }
    ).lean(); // lean() makes it a plain JS object

    return NextResponse.json(
      {
        result: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
