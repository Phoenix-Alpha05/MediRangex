import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "dr.narendra0005@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { visitorEmail, accessedAt } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "RESEND_API_KEY not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedTime = new Date(accessedAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    const expiresAt = new Date(new Date(accessedAt).getTime() + 15 * 60 * 1000).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      timeStyle: "short",
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 32px 24px;">
        <div style="background: #0c1220; border-radius: 12px; padding: 28px 32px; border: 1px solid #1e3a5f;">
          <div style="margin-bottom: 20px;">
            <span style="font-size: 10px; font-weight: 700; color: #475569; letter-spacing: 0.16em; text-transform: uppercase;">Rangex Corp · MediRangeX Platform</span>
          </div>
          <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 800; color: #f0f9ff; letter-spacing: -0.02em;">New Visitor Access</h2>
          <p style="margin: 0 0 24px; font-size: 13px; color: #64748b; line-height: 1.6;">A new user has entered the MediRangeX demo platform and has been granted a 15-minute session.</p>

          <div style="background: rgba(14,165,233,0.07); border: 1px solid rgba(56,189,248,0.15); border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.12em; padding: 5px 0; width: 120px;">Visitor Email</td>
                <td style="font-size: 13px; color: #7dd3fc; font-weight: 600; padding: 5px 0;">${visitorEmail}</td>
              </tr>
              <tr>
                <td style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.12em; padding: 5px 0;">Access Time</td>
                <td style="font-size: 13px; color: #cbd5e1; padding: 5px 0;">${formattedTime} IST</td>
              </tr>
              <tr>
                <td style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.12em; padding: 5px 0;">Session Expires</td>
                <td style="font-size: 13px; color: #cbd5e1; padding: 5px 0;">${expiresAt} IST (15 mins)</td>
              </tr>
            </table>
          </div>

          <p style="margin: 0; font-size: 11px; color: #334155; line-height: 1.6;">This is an automated notification. The session will expire automatically after 15 minutes.</p>
        </div>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MediRangeX Platform <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `New Visitor Access — ${visitorEmail}`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      return new Response(
        JSON.stringify({ success: false, error: errBody }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
