// Edge Function protégée : supprime uniquement le compte authentifié avec la clé serveur côté Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2.112.3';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

// Cette fonction construit toutes les réponses JSON avec les en-têtes attendus.
function response(body: Record<string, string>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    status,
  });
}

function hasRecentAuthentication(authorization: string, expectedUserId: string) {
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
      && Math.floor(Date.now() / 1000) - payload.iat <= 300;
  } catch {
    return false;
  }
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  // La méthode est contrôlée avant toute opération sensible.
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return response({ error: 'Method not allowed' }, 405);
  }

  // Le bearer token et la configuration serveur sont récupérés puis vérifiés.
  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!authorization?.startsWith('Bearer ')) {
    return response({ error: 'Unauthorized' }, 401);
  }

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return response({ error: 'Server configuration unavailable' }, 500);
  }

  // Le token est validé auprès de Supabase pour identifier l’utilisateur courant.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();

  if (userError || !userData.user) {
    console.warn(JSON.stringify({ event: 'delete_account_unauthorized', requestId, status: 401 }));
    return response({ error: 'Unauthorized' }, 401);
  }

  if (!hasRecentAuthentication(authorization, userData.user.id)) {
    console.warn(JSON.stringify({ event: 'delete_account_recent_auth_required', requestId, status: 401 }));
    return response({ error: 'Recent authentication required' }, 401);
  }

  const lastSignInAt = userData.user.last_sign_in_at ? Date.parse(userData.user.last_sign_in_at) : Number.NaN;
  if (!Number.isFinite(lastSignInAt) || Date.now() - lastSignInAt > 5 * 60 * 1000) {
    return response({ error: 'Recent password authentication required' }, 401);
  }

  // Le client administrateur reste côté serveur et supprime uniquement cet utilisateur validé.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id);

  if (deleteError) {
    console.error(JSON.stringify({ event: 'delete_account_failed', requestId, status: 500, durationMs: Date.now() - startedAt }));
    return response({ error: 'Account deletion failed' }, 500);
  }

  // La réponse confirme la suppression sans exposer de donnée sensible.
  console.info(JSON.stringify({ event: 'delete_account_succeeded', requestId, status: 200, durationMs: Date.now() - startedAt }));
  return response({ status: 'deleted' }, 200);
});
