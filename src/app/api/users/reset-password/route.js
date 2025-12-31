// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import User from "@/model/user-model";
import bcryptjs from "bcryptjs";
import { dbConnect } from "@/dbConfig/dbConfig";

export async function POST(req) {
  await dbConnect();
  const { token, password } = await req.json();

  try {
    const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  user.password = hashedPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to save subscription." },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
