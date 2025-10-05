import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password, totpCode = '' } = await req.json();  // Default empty

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (user.twoFactorSecret) {
    if (!totpCode.trim() || totpCode.length !== 6) {
      return NextResponse.json({ error: '2FA code is required and must be 6 digits' }, { status: 400 });
    }
    if (!(await user.verifyTwoFactorToken(totpCode))) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
    }
  } else if (totpCode.trim()) {
    // Warn if code provided but no 2FA
    console.warn(`User ${email} provided 2FA code but none enabled`);
  }

  const token = createToken(user._id.toString());
  const response = NextResponse.json({ message: 'Logged in' });
  response.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  return response;
}