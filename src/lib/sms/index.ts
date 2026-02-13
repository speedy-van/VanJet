// ─── VanJet · VoodooSMS Service (English Only) ───────────────
import { serverEnv } from "@/lib/env";

const VOODOO_API_URL = "https://www.voodoosms.com/vapi/server/sendSMS";
const SENDER_NAME = "VanJet";

/**
 * Normalise a UK phone number to E.164 format (+44…).
 */
function normalisePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "+44" + cleaned.slice(1);
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+44" + cleaned;
  }
  return cleaned;
}

/**
 * Send an SMS via VoodooSMS.
 */
async function sendSMS(to: string, message: string): Promise<void> {
  if (!serverEnv.VOODOO_SMS_API_KEY) {
    console.log("[VanJet] VoodooSMS not configured, skipping SMS.");
    return;
  }
  const phone = normalisePhone(to);

  const params = new URLSearchParams({
    uid: serverEnv.VOODOO_SMS_API_KEY,
    dest: phone,
    orig: SENDER_NAME,
    msg: message,
    format: "json",
  });

  const res = await fetch(`${VOODOO_API_URL}?${params.toString()}`);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`VoodooSMS API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (data.result !== 200 && data.result !== "200") {
    throw new Error(
      `VoodooSMS send failed: ${data.resultText || JSON.stringify(data)}`
    );
  }
}

// ── SMS Templates ──────────────────────────────────────────────

export async function sendJobCreatedSMS(phone: string, jobId: string) {
  return sendSMS(
    phone,
    `VanJet: Your job #${jobId.slice(0, 8)} has been created. Drivers will start quoting soon. Track it at ${process.env.NEXT_PUBLIC_URL || "https://van-jet.com"}/jobs/${jobId}`
  );
}

export async function sendNewQuoteSMS(
  phone: string,
  driverName: string,
  price: string
) {
  return sendSMS(
    phone,
    `VanJet: ${driverName} has quoted £${price} for your move. Log in to review and accept.`
  );
}

export async function sendBookingConfirmedSMS(
  phone: string,
  bookingId: string,
  moveDate: string
) {
  return sendSMS(
    phone,
    `VanJet: Booking #${bookingId.slice(0, 8)} confirmed for ${moveDate}. We'll remind you before the day. Questions? Reply to this text.`
  );
}

export async function sendDriverNewJobSMS(
  phone: string,
  pickup: string,
  delivery: string
) {
  return sendSMS(
    phone,
    `VanJet: New job alert! ${pickup} → ${delivery}. Log in to send your quote.`
  );
}

export async function sendOtpSMS(phone: string, otp: string) {
  return sendSMS(
    phone,
    `VanJet: Your verification code is ${otp}. It expires in 10 minutes. Do not share this code.`
  );
}
