// Validation pure des callbacks Auth PKCE reçus par le schéma privé DRÉPA.
// Aucun jeton de session dans un fragment ou une URL d’une autre origine n’est accepté.
export type AuthCallbackPayload = {
  code: string | null;
  errorDescription: string | null;
  validTarget: boolean;
};

export function parseAuthCallbackUrl(value: string): AuthCallbackPayload {
  try {
    const url = new URL(value);
    const validTarget = url.protocol === 'drepa:' && url.hostname === 'auth' && url.pathname === '/callback' && !url.hash;
    return {
      code: url.searchParams.get('code'),
      errorDescription: url.searchParams.get('error_description'),
      validTarget,
    };
  } catch {
    return { code: null, errorDescription: null, validTarget: false };
  }
}
