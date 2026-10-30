import 'server-only';
import { createHmac, scryptSync, timingSafeEqual } from 'crypto';

// Server-side admin authentication. Secrets come from environment variables
// (ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET) and are never sent to the browser.
// The password itself is never stored: only a salted scrypt hash ("salt:hash", hex).

export const ADMIN_COOKIE = 'maccy_admin_session';
export const SESSION_SECONDS = 60 * 60 * 8; // 8 hours

export const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes after 3 wrong tries

const b64url = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_EMAIL && !!process.env.ADMIN_PASSWORD_HASH && !!secret();
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

function passwordMatches(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH || '';
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Checks both the email/username and the password every time, so the response time
// does not reveal which of the two was wrong.
export function credentialsMatch(identifier: string, password: string): boolean {
  const id = identifier.trim().toLowerCase();
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const idOk = safeEqual(id, email) || (username !== '' && safeEqual(id, username));
  const pwOk = passwordMatches(password);
  return idOk && pwOk;
}

export function createSessionToken(): string {
  const key = secret();
  if (!key) throw new Error('ADMIN_SESSION_SECRET is not set');
  const payload = b64url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }));
  const sig = createHmac('sha256', key).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = createHmac('sha256', key).update(payload).digest('base64url');
  if (!safeEqual(sig, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

// Failed-attempt counter for the (single) admin account: 3 wrong tries locks sign-in for 30 minutes,
// no matter which device or network the tries come from.
let failures = 0;
let lockedUntil = 0;

export function lockSecondsLeft(): number {
  if (lockedUntil > Date.now()) return Math.ceil((lockedUntil - Date.now()) / 1000);
  if (lockedUntil !== 0) {
    lockedUntil = 0;
    failures = 0;
  }
  return 0;
}

export function recordFailure(): { attemptsLeft: number; lockedSeconds: number } {
  failures += 1;
  if (failures >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_MS;
    return { attemptsLeft: 0, lockedSeconds: Math.ceil(LOCKOUT_MS / 1000) };
  }
  return { attemptsLeft: MAX_ATTEMPTS - failures, lockedSeconds: 0 };
}

export function clearFailures() {
  failures = 0;
  lockedUntil = 0;
}
