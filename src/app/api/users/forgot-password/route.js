// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/dbConfig/dbConfig";
import User from "@/model/user-model";
import { sendEmail } from "@/utils/mailer";

export async function POST(req) {
  await dbConnect();
  const { email } = await req.json();

  const user = await User.findOne({ email });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  user.forgotPasswordToken = token;
  user.forgotPasswordTokenExpiry = Date.now() + 3600000; // 1 hour

  await user.save();

  const query = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>
      body { font-family: 'Arial', sans-serif; background-color: #f4f6f8; margin:0; padding:0; color:#333; }
      .container { max-width:600px; margin:30px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);}
      .header { background-color:#1a73e8; color:#fff; text-align:center; padding:20px; }
      .header img { max-height:60px; width:150px; margin-bottom:10px; }
      .header h1 { margin:0; font-size:24px; }
      .content { padding:30px; }
      .content p { line-height:1.6; margin-bottom:20px; }
      .btn { display:inline-block; padding:12px 24px; background-color:#1a73e8; color:#fff !important; text-decoration:none; border-radius:6px; font-weight:bold; }
      .footer { background:#f4f6f8; text-align:center; padding:20px; font-size:12px; color:#999; }
      a { color:#1a73e8; text-decoration:none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://learnlab.aimengbd.com/logo/learn%20lab-white-orange.png" alt="LearnLab Logo" />
        <h1>Forgot Password?</h1>
      </div>
      <div class="content">
        <p>Hi ${user?.name},</p>
        <p>We received a request to reset your password for your LearnLab account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <p style="text-align:center;">
          <a href="${
            process.env.DOMAIN
          }/reset-password/${token}" class="btn">Reset Password</a>
        </p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Stay learning!<br/>The LearnLab Team</p>
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

  // Send token via email (pseudo-code)
  await sendEmail(email, `Reset Link From Learn Lab`, query);

  return NextResponse.json({ message: "Reset link sent" });
}
