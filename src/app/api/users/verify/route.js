// app/api/verify/route.ts
import { dbConnect } from '@/dbConfig/dbConfig';
import User from '@/model/user-model';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

  const user = await User.findOne({ verifyToken: token, verifyTokenExpiry: { $gt: new Date() } });

  if (!user) return NextResponse.json({ error: 'Token expired or invalid' }, { status: 400 });

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;

  await user.save();

  return NextResponse.redirect(`${process.env.DOMAIN}/login?verified=true`);
}
