// Edge Function protégée : supprime uniquement le compte authentifié avec la clé serveur côté Supabase.
import { createClient } from '@supabase/supabase-js';
import { hasRecentAuthentication } from './security.ts';

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = Deno.env.get('DREPA_ALLOWED_WEB_ORIGIN');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (origin && allowedOrigin && origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

// Cette fonction construit toutes les réponses JSON avec les en-têtes attendus.
function response(body: Record<string, string>, status: number, request: Request) {
  return new Response(JSON.stringify(body), {
    headers: { ...getCorsHeaders(request), 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    status,
  });
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  // La méthode est contrôlée avant toute opération sensible.
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin');
    const allowedOrigin = Deno.env.get('DREPA_ALLOWED_WEB_ORIGIN');
    if (origin && origin !== allowedOrigin) return new Response('Forbidden', { status: 403 });
    return new Response('ok', { headers: getCorsHeaders(request) });
  }

  if (request.method !== 'POST') {
    return response({ error: 'Method not allowed' }, 405, request);
  }

  // Le bearer token et la configuration serveur sont récupérés puis vérifiés.
  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!authorization?.startsWith('Bearer ')) {
    return response({ error: 'Unauthorized' }, 401, request);
  }

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return response({ error: 'Server configuration unavailable' }, 500, request);
  }

  // Le token est validé auprès de Supabase pour identifier l’utilisateur courant.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();

  if (userError || !userData.user) {
    console.warn(JSON.stringify({ event: 'delete_account_unauthorized', requestId, status: 401 }));
    return response({ error: 'Unauthorized' }, 401, request);
  }

  if (!hasRecentAuthentication(authorization, userData.user.id)) {
    console.warn(JSON.stringify({ event: 'delete_account_recent_auth_required', requestId, status: 401 }));
    return response({ error: 'Recent authentication required' }, 401, request);
  }

  const lastSignInAt = userData.user.last_sign_in_at ? Date.parse(userData.user.last_sign_in_at) : Number.NaN;
  if (!Number.isFinite(lastSignInAt) || Date.now() - lastSignInAt > 5 * 60 * 1000) {
    return response({ error: 'Recent password authentication required' }, 401, request);
  }

  // Le client administrateur reste côté serveur et supprime uniquement cet utilisateur validé.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id);

  if (deleteError) {
    console.error(JSON.stringify({ event: 'delete_account_failed', requestId, status: 500, durationMs: Date.now() - startedAt }));
    return response({ error: 'Account deletion failed' }, 500, request);
  }

  // La réponse confirme la suppression sans exposer de donnée sensible.
  console.info(JSON.stringify({ event: 'delete_account_succeeded', requestId, status: 200, durationMs: Date.now() - startedAt }));
  return response({ status: 'deleted' }, 200, request);
});
