// Cloudflare Pages Function — handles POST /api/contact
// Sends contact-form submissions to your inbox via Resend (https://resend.com).
//
// Setup (one time, in the Cloudflare Pages dashboard → Settings → Environment variables):
//   RESEND_API_KEY = re_xxxxxxxx        (from resend.com → API Keys)
//   CONTACT_TO     = info@psggroup.net  (where submissions are delivered)
//   CONTACT_FROM   = website@psggroup.net  (a verified sender on your domain in Resend)
//
// Until those are set, the form will return an error and users fall back to the
// mailto: link shown on the page.

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const name = (data.name || "").toString().trim();
    const email = (data.email || "").toString().trim();
    const company = (data.company || "").toString().trim();
    const message = (data.message || "").toString().trim();

    // Honeypot + basic validation
    if (data._gotcha) return json({ ok: true });
    if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ ok: false, error: "Invalid submission." }, 400);
    }

    if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
      return json({ ok: false, error: "Email service not configured." }, 500);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `PSG Website <${env.CONTACT_FROM}>`,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `New website enquiry from ${name}`,
        text:
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Company: ${company || "—"}\n\n` +
          `Message:\n${message}\n`,
      }),
    });

    if (!res.ok) {
      return json({ ok: false, error: "Failed to send." }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "Server error." }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
