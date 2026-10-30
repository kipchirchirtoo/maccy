import { NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '@/data/products';

export async function GET() {
  return NextResponse.json({
    success: true,
    count: INITIAL_PRODUCTS.length,
    products: INITIAL_PRODUCTS
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Product successfully created in MACCY COLLECTIONS catalog',
      product: {
        id: `prod-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid product payload' }, { status: 400 });
  }
}
