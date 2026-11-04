export const STAFF_COOKIE_NAME = 'lotus_staff_session';

export interface StaffSession {
  email: string;
  role: 'staff';
  loggedAt: number;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'lotus-secure-session-key-dev-only-32';
  return secret;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(uint8: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < uint8.length; i++) {
    bin += String.fromCharCode(uint8[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const bin = atob(base64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

/**
 * Signs a StaffSession payload using HMAC-SHA256, returning `${payloadBase64Url}.${signatureBase64Url}`
 */
export async function signSession(
  payload: StaffSession,
  secret: string = getSessionSecret()
): Promise<string> {
  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = enc.encode(payloadJson);
  const payloadB64 = toBase64Url(payloadBytes);

  const key = await getHmacKey(secret);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(sigBuffer));

  return `${payloadB64}.${sigB64}`;
}

/**
 * Verifies the HMAC-SHA256 signature of a session token and returns the parsed session or null.
 */
export async function verifySession(
  token: string,
  secret: string = getSessionSecret()
): Promise<StaffSession | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const sigBytes = fromBase64Url(sigB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(payloadB64)
    );

    if (!isValid) return null;

    const dec = new TextDecoder();
    const payloadBytes = fromBase64Url(payloadB64);
    const jsonStr = dec.decode(payloadBytes);
    const session = JSON.parse(jsonStr) as StaffSession;

    if (!session || typeof session.email !== 'string' || session.role !== 'staff') {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Retrieves and cryptographically validates the staff session from request cookies.
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookie = cookieStore.get(STAFF_COOKIE_NAME);
    if (!cookie?.value) return null;

    return await verifySession(cookie.value);
  } catch {
    return null;
  }
}

/**
 * Ensures an active, verified staff session exists, or throws an Unauthorized error.
 */
export async function requireStaffSession(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    throw new Error('Unauthorized: Staff session required');
  }
  return session;
}
