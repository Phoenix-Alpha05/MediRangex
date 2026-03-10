import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const ADMIN_USERNAME = 'Narendra';
const ADMIN_PASSWORD = '1255657';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: visitorRaw, error: visitorError } = await supabase
      .from('visitor_log')
      .select('email, user_agent, accessed_at')
      .order('accessed_at', { ascending: false });

    if (visitorError) throw visitorError;

    const visitorMap: Record<string, { email: string; access_count: number; first_visit: string; last_visit: string; user_agent: string }> = {};
    for (const row of (visitorRaw ?? [])) {
      if (!visitorMap[row.email]) {
        visitorMap[row.email] = {
          email: row.email,
          access_count: 0,
          first_visit: row.accessed_at,
          last_visit: row.accessed_at,
          user_agent: row.user_agent,
        };
      }
      visitorMap[row.email].access_count += 1;
      if (row.accessed_at < visitorMap[row.email].first_visit) {
        visitorMap[row.email].first_visit = row.accessed_at;
      }
      if (row.accessed_at > visitorMap[row.email].last_visit) {
        visitorMap[row.email].last_visit = row.accessed_at;
        visitorMap[row.email].user_agent = row.user_agent;
      }
    }
    const visitors = Object.values(visitorMap).sort(
      (a, b) => new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
    );

    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('email, rating, comment, submitted_at')
      .order('submitted_at', { ascending: false });

    if (feedbackError) throw feedbackError;

    return new Response(
      JSON.stringify({ visitors, feedback: feedback ?? [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
