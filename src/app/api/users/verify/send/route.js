// app/api/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/utils/mailer";
import { dbConnect } from "@/dbConfig/dbConfig";
import { auth } from "@/auth";
import User from "@/model/user-model";

export async function POST(req) {
  await dbConnect();
  const session = await auth();

  const email = session?.user?.email;

  try {
    const token = crypto.randomBytes(32).toString("hex");

    const user = await User.findOne({
      email: email,
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 400 });

    user.verifyToken = token;
    user.verifyTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    await user.save();

    const query = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #2D1999;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header img {
      max-height: 60px;
      width:150px;
      margin-bottom: 10px;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
    }
    .content {
      padding: 30px;
    }
    .content p {
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2D1999;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .footer {
      background-color: #f4f6f8;
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #999999;
    }
    a {
      color: #2D1999;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img class="logo" src="https://learnlab.aimengbd.com/logo/learn%20lab-white-orange.png" alt="LearnLab Logo" />
      <h1>LearnLab Courses</h1>
    </div>
    <div class="content">
      <p>Hi ${user?.name.trim()},</p>
      <p>Thank you for registering at <strong>LearnLab</strong>! 🎓</p>
      <p>We offer a variety of courses, including free and paid courses. To get started, please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${
          process.env.DOMAIN
        }/api/users/verify?token=${token}" class="btn">Verify Your Email</a>
      </p>
      <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="${process.env.DOMAIN}/api/users/verify?token=${token}">${
      process.env.DOMAIN
    }/api/users/verify?token=${token}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>Happy Learning!<br/>The LearnLab Team</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} LearnLab. All rights reserved.<br/>
      <a href="${process.env.DOMAIN}/terms_and_condition">Terms</a> | <a href="${
      process.env.DOMAIN
    }/privacy_policy">Privacy Policy</a>
    </div>
  </div>
</body>
</html>
`;

    await sendEmail(email, `Verify your email`, query);

    return NextResponse.json({
      message: "Verify Message send to your mail",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
