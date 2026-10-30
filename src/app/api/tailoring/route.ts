import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requestNumber = `MCT-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      message: 'Custom bespoke tailoring request registered with MACCY COLLECTIONS atelier',
      tailoringRequest: {
        id: `tailor-${Date.now()}`,
        requestNumber,
        ...body,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Invalid tailoring data' }, { status: 400 });
  }
}
