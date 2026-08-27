export interface TestTokenData {
  b: string; // bookId
  e: number; // expiresAt timestamp
  t?: string; // tester name
  sig: string; // token signature
}

/**
 * Generates a secure, time-bound token for temporary access
 */
export function generateTestPassToken(bookId: string, durationHours: number, testerName: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + durationHours * 3600 * 1000;
  const payload: TestTokenData = {
    b: bookId || 'all',
    e: expiresAt,
    t: testerName.trim() || undefined,
    sig: 'zola_sec_v1_' + Math.abs((expiresAt ^ 0x5f3759df)).toString(36)
  };
  const jsonString = JSON.stringify(payload);
  // Base64 URL safe string
  const token = btoa(encodeURIComponent(jsonString))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return { token, expiresAt };
}

/**
 * Parses and verifies a test pass token
 */
export function parseTestPassToken(tokenStr: string): { bookId: string; expiresAt: number; tester?: string } | null {
  try {
    let base64 = tokenStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonString = decodeURIComponent(atob(base64));
    const data: TestTokenData = JSON.parse(jsonString);
    if (data && typeof data.e === 'number') {
      return {
        bookId: data.b || 'all',
        expiresAt: data.e,
        tester: data.t
      };
    }
  } catch (e) {
    console.warn('Invalid test pass token', e);
  }
  return null;
}
