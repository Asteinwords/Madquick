import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password, twoFactorSecret } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (twoFactorSecret && twoFactorSecret.length < 16) {  // Basic validation
    return NextResponse.json({ error: 'Invalid 2FA secret format' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'User exists' }, { status: 400 });
  }

  const user = new User({ email, password });
  if (twoFactorSecret) user.setTwoFactorSecret(twoFactorSecret);
  await user.save();

  const token = createToken(user._id.toString());
  const response = NextResponse.json({ message: 'Registered' });
  response.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  return response;
}