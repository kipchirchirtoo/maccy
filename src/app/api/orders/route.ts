import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = `MC-${Math.floor(10000 + Math.random() * 90000)}`;

    return NextResponse.json({
      success: true,
      message: 'Order created successfully at MACCY COLLECTIONS',
      order: {
        id: `ord-${Date.now()}`,
        orderNumber,
        ...body,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
  }
}
