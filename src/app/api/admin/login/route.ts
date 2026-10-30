import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  adminConfigured,
  clearFailures,
  createSessionToken,
  credentialsMatch,
  lockSecondsLeft,
  recordFailure,
} from '@/lib/adminAuth';

const lockedMessage = (seconds: number) =>
  `Too many wrong attempts. Sign-in is locked for ${Math.ceil(seconds / 60)} more minute(s).`;

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, message: 'Admin is not configured on the server.' }, { status: 503 });
  }

  const locked = lockSecondsLeft();
  if (locked > 0) {
    return NextResponse.json(
      { ok: false, locked: true, attemptsLeft: 0, message: lockedMessage(locked) },
      { status: 429, headers: { 'Retry-After': String(locked) } }
    );
  }

  let identifier = '';
  let password = '';
  try {
    const body = await request.json();
    identifier = typeof body?.identifier === 'string' ? body.identifier.slice(0, 254) : '';
    password = typeof body?.password === 'string' ? body.password.slice(0, 128) : '';
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  if (!credentialsMatch(identifier, password)) {
    const { attemptsLeft, lockedSeconds } = recordFailure();
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    if (lockedSeconds > 0) {
      return NextResponse.json(
        { ok: false, locked: true, attemptsLeft: 0, message: lockedMessage(lockedSeconds) },
        { status: 429, headers: { 'Retry-After': String(lockedSeconds) } }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        attemptsLeft,
        message: `Incorrect email/username or password. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`,
      },
      { status: 401 }
    );
  }

  clearFailures();
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return NextResponse.json({ ok: true });
}
