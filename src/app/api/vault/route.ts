import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';
import { getUserIdFromCookie } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  const userId = getUserIdFromCookie();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await VaultItem.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const userId = getUserIdFromCookie();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { encryptedData } = await req.json();
  if (!encryptedData) return NextResponse.json({ error: 'Encrypted data required' }, { status: 400 });

  const item = new VaultItem({ userId, encryptedData });
  await item.save();
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const userId = getUserIdFromCookie();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, encryptedData } = await req.json();
  if (!id || !encryptedData) return NextResponse.json({ error: 'ID and encrypted data required' }, { status: 400 });

  const updated = await VaultItem.findOneAndUpdate({ _id: id, userId }, { encryptedData }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  return NextResponse.json({ message: 'Updated' });
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const userId = getUserIdFromCookie();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const deleted = await VaultItem.findOneAndDelete({ _id: id, userId });
  if (!deleted) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}