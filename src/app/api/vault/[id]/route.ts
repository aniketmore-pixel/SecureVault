import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import VaultItem from '../../../../models/ValueItem';

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

// PUT (Update) an item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  await dbConnect();
  const body = await req.json();
  const updatedItem = await VaultItem.findOneAndUpdate(
    { _id: params.id, userId },
    body,
    { new: true }
  );

  if (!updatedItem) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }
  return NextResponse.json(updatedItem, { status: 200 });
}

// DELETE an item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const deletedItem = await VaultItem.findOneAndDelete({ _id: params.id, userId });

  if (!deletedItem) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Item deleted' }, { status: 200 });
}