// Validation pure des claims récents avant toute opération administrateur.
export function hasRecentAuthentication(authorization: string, expectedUserId: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  try {
    const token = authorization.slice('Bearer '.length);
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return false;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const payload = JSON.parse(atob(normalized)) as { sub?: string; iat?: number; amr?: { method?: string }[] };
    const passwordAuthenticated = payload.amr?.some((entry) => entry.method === 'password') ?? false;
    return payload.sub === expectedUserId
      && passwordAuthenticated
      && typeof payload.iat === 'number'
      && nowSeconds - payload.iat <= 300;
  } catch {
    return false;
  }
}
