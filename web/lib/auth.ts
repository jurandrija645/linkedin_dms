export const COOKIE = 'mlo_session';

/** sha256(APP_PASSWORD) u hexu. Radi i u edge runtimeu (middleware) i u nodeu. */
export async function sessionToken(password: string): Promise<string> {
  const bytes = new TextEncoder().encode('mlo:' + password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Usporedba u konstantnom vremenu. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
