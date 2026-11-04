import { describe, it, expect } from 'vitest';
import { signSession, verifySession, StaffSession } from '@/lib/auth/session';

describe('Cryptographic Session Security', () => {
  const secret = 'super-secret-test-key-32-chars-long!!';
  const payload: StaffSession = {
    email: 'admin@lotus.eg',
    role: 'staff',
    loggedAt: 1700000000000,
  };

  it('signs and verifies a valid session token', async () => {
    const token = await signSession(payload, secret);
    expect(token).toContain('.');
    const verified = await verifySession(token, secret);
    expect(verified).toEqual(payload);
  });

  it('rejects a tampered payload or signature', async () => {
    const token = await signSession(payload, secret);
    const [, sig] = token.split('.');
    const tamperedBody = Buffer.from(
      JSON.stringify({ email: 'hacker@evil.com', role: 'staff', loggedAt: 1700000000000 })
    ).toString('base64url');
    const tamperedToken = `${tamperedBody}.${sig}`;
    const result = await verifySession(tamperedToken, secret);
    expect(result).toBeNull();
  });

  it('rejects legacy raw plaintext JSON without signature', async () => {
    const rawJson = JSON.stringify(payload);
    const result = await verifySession(rawJson, secret);
    expect(result).toBeNull();
  });

  it('rejects empty, malformed, or missing tokens', async () => {
    expect(await verifySession('', secret)).toBeNull();
    expect(await verifySession('invalid-token', secret)).toBeNull();
    expect(await verifySession('part1.part2.part3', secret)).toBeNull();
  });
});
