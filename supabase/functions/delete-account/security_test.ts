import { assertEquals } from '@std/assert';
import { hasRecentAuthentication } from './security.ts';

function bearer(payload: object) {
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `Bearer header.${encoded}.signature`;
}

Deno.test('accepts only recent password authentication for the same user', () => {
  const now = 1_800_000_000;
  assertEquals(hasRecentAuthentication(bearer({ sub: 'user-a', iat: now - 60, amr: [{ method: 'password' }] }), 'user-a', now), true);
  assertEquals(hasRecentAuthentication(bearer({ sub: 'user-b', iat: now - 60, amr: [{ method: 'password' }] }), 'user-a', now), false);
  assertEquals(hasRecentAuthentication(bearer({ sub: 'user-a', iat: now - 301, amr: [{ method: 'password' }] }), 'user-a', now), false);
  assertEquals(hasRecentAuthentication(bearer({ sub: 'user-a', iat: now - 60, amr: [{ method: 'refresh_token' }] }), 'user-a', now), false);
});
