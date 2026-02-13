// ─── VanJet · Resend Email Service (English Only) ─────────────
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!serverEnv.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(serverEnv.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = "VanJet <noreply@vanjet.co.uk>";

// ── Email Templates (HTML, single-column, mobile-friendly) ──

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:24px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px 24px;">
        <tr><td>
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:24px;font-weight:800;color:#0070f3;">Van</span><span style="font-size:24px;font-weight:800;color:#1a202c;">Jet</span>
          </div>
          ${content}
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">
            &copy; ${new Date().getFullYear()} VanJet Ltd. All rights reserved.<br>
            You received this email because you have an account with VanJet.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Send a job confirmation email to the customer.
 */
export async function sendJobConfirmation({
  to,
  customerName,
  jobId,
  pickup,
  delivery,
  moveDate,
  estimatedPrice,
}: {
  to: string;
  customerName: string;
  jobId: string;
  pickup: string;
  delivery: string;
  moveDate: string;
  estimatedPrice: string;
}) {
  const resend = getResend();
  if (!resend) { console.log("[VanJet] Resend not configured, skipping email."); return; }
  const html = baseTemplate(`
    <h2 style="color:#1a202c;font-size:20px;margin:0 0 8px;">Your job has been created!</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Hi ${customerName},<br><br>
      We've received your removal request. Here are the details:
    </p>
    <table style="width:100%;font-size:14px;color:#333;margin:16px 0;" cellpadding="6">
      <tr><td style="font-weight:600;width:120px;">Job ID</td><td>${jobId}</td></tr>
      <tr><td style="font-weight:600;">Pickup</td><td>${pickup}</td></tr>
      <tr><td style="font-weight:600;">Delivery</td><td>${delivery}</td></tr>
      <tr><td style="font-weight:600;">Move Date</td><td>${moveDate}</td></tr>
      <tr><td style="font-weight:600;">Estimated Price</td><td>&pound;${estimatedPrice}</td></tr>
    </table>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Drivers will start sending you quotes shortly. We'll notify you as soon as a quote arrives.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_URL || "https://vanjet.co.uk"}/jobs/${jobId}"
         style="display:inline-block;padding:14px 32px;background:#0070f3;color:#fff;font-weight:700;
                border-radius:8px;text-decoration:none;font-size:16px;">
        View Your Job
      </a>
    </div>
  `);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `VanJet — Job Created (${jobId.slice(0, 8)})`,
    html,
  });
}

/**
 * Send a new quote notification email.
 */
export async function sendQuoteNotification({
  to,
  customerName,
  driverName,
  price,
  jobId,
}: {
  to: string;
  customerName: string;
  driverName: string;
  price: string;
  jobId: string;
}) {
  const resend = getResend();
  if (!resend) { console.log("[VanJet] Resend not configured, skipping email."); return; }
  const html = baseTemplate(`
    <h2 style="color:#1a202c;font-size:20px;margin:0 0 8px;">You have a new quote!</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Hi ${customerName},<br><br>
      <strong>${driverName}</strong> has quoted <strong>&pound;${price}</strong> for your job.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_URL || "https://vanjet.co.uk"}/jobs/${jobId}"
         style="display:inline-block;padding:14px 32px;background:#0070f3;color:#fff;font-weight:700;
                border-radius:8px;text-decoration:none;font-size:16px;">
        Review Quote
      </a>
    </div>
  `);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `VanJet — New Quote from ${driverName}`,
    html,
  });
}

/**
 * Send a booking confirmation to both customer and driver.
 */
export async function sendBookingConfirmation({
  to,
  name,
  bookingId,
  moveDate,
  price,
}: {
  to: string;
  name: string;
  bookingId: string;
  moveDate: string;
  price: string;
}) {
  const resend = getResend();
  if (!resend) { console.log("[VanJet] Resend not configured, skipping email."); return; }
  const html = baseTemplate(`
    <h2 style="color:#1a202c;font-size:20px;margin:0 0 8px;">Booking Confirmed!</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Hi ${name},<br><br>
      Your booking <strong>#${bookingId.slice(0, 8)}</strong> has been confirmed for <strong>${moveDate}</strong>
      at <strong>&pound;${price}</strong>.
    </p>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      We'll send you updates as your move date approaches. If you have any questions, reply to this email.
    </p>
  `);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `VanJet — Booking Confirmed (#${bookingId.slice(0, 8)})`,
    html,
  });
}
