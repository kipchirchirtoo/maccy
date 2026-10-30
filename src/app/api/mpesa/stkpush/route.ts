import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, amount, orderNumber } = await request.json();

    if (!phone || !amount) {
      return NextResponse.json({
        success: false,
        message: 'Phone number and amount are required.'
      }, { status: 400 });
    }

    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = '254' + cleanPhone;
    }

    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 90000 + 10000)}`;

    return NextResponse.json({
      success: true,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: `MR_${Date.now()}`,
      CheckoutRequestID: checkoutRequestId,
      CustomerMessage: `Success. Lipa na M-Pesa prompt sent to ${cleanPhone}. Enter your PIN to complete payment of KSh ${amount} for order #${orderNumber || 'MC-NEW'}.`,
      status: 'pending_pin'
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error processing STK push' }, { status: 500 });
  }
}
