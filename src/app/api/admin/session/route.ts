import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';

export async function GET() {
  const store = await cookies();
  const ok = verifySessionToken(store.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ authenticated: ok }, { headers: { 'Cache-Control': 'no-store' } });
}
