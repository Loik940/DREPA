// Edge Function protégée : supprime uniquement le compte authentifié avec la clé serveur côté Supabase.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.8';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

// Cette fonction construit toutes les réponses JSON avec les en-têtes attendus.
function response(body: Record<string, string>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

Deno.serve(async (request) => {
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
    return response({ error: 'Unauthorized' }, 401);
  }

  // Le client administrateur reste côté serveur et supprime uniquement cet utilisateur validé.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id);

  if (deleteError) {
    return response({ error: 'Account deletion failed' }, 500);
  }

  // La réponse confirme la suppression sans exposer de donnée sensible.
  return response({ status: 'deleted' }, 200);
});
