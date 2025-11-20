import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import VaultItem from '../../../models/ValueItem';

// Helper to get user ID from token
function getUserId(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// GET all items for a user
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const items = await VaultItem.find({ userId });
  return NextResponse.json(items, { status: 200 });
}

// POST a new item
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const newItem = new VaultItem({ ...body, userId });
  await newItem.save();
  return NextResponse.json(newItem, { status: 201 });
}