/**
 * Server-side Automated Notification Engine (100% Free)
 * Dispatches automated emails and CallMeBot WhatsApp messages from the backend
 * without requiring the admin or customer to click any link or open WhatsApp manually.
 */

import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "nasr528@gmail.com";
const ADMIN_PHONE = process.env.ADMIN_NOTIFICATION_PHONE || "96170078138";
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || "2391023";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skylightvillagelb.com";
const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/v3TU1HqX9YGE1hSSA";

/**
 * Configure Nodemailer SMTP Transporter
 */
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || "nasr528@gmail.com";
  const rawPass = process.env.SMTP_PASS || "dund fnmx jxnj jdir";
  const pass = rawPass.replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Send automated email from backend
 */
async function sendServerEmail(to: string, subject: string, htmlContent: string) {
  try {
    const transporter = getSmtpTransporter();
    if (!transporter) {
      console.log(`[AUTOMATED SERVER EMAIL LOG] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    await transporter.sendMail({
      from: `"Skylight Village Jaj" <${process.env.SMTP_USER || "nasr528@gmail.com"}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`[AUTOMATED SERVER EMAIL SENT] Successfully sent to: ${to}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error("[AUTOMATED SERVER EMAIL ERROR]:", error);
    return { success: false, error };
  }
}

/**
 * Send automated WhatsApp via CallMeBot API, UltraMsg API, or Custom Webhook
 */
async function sendAutomatedWhatsApp(phone: string, text: string) {
  try {
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "961" + cleanPhone.substring(1);
    if (!cleanPhone.startsWith("961") && cleanPhone.length === 8) cleanPhone = "961" + cleanPhone;

    // 1. UltraMsg / WhatsApp API Gateway (if configured in .env)
    const ultramsgInstance = process.env.ULTRAMSG_INSTANCE_ID;
    const ultramsgToken = process.env.ULTRAMSG_TOKEN;
    if (ultramsgInstance && ultramsgToken) {
      const url = `https://api.ultramsg.com/${ultramsgInstance}/messages/chat`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: ultramsgToken,
          to: `+${cleanPhone}`,
          body: text,
        }),
      });
      console.log(`[AUTOMATED ULTRAMSG WHATSAPP SENT] Sent to: +${cleanPhone}`);
      return { success: true };
    }

    // 2. CallMeBot Free WhatsApp API (Sends to Admin registered phone)
    const apiKey = CALLMEBOT_API_KEY;
    if (apiKey && cleanPhone === ADMIN_PHONE) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;
      await fetch(url, { method: "GET" });
      console.log(`[AUTOMATED CALLMEBOT WHATSAPP SENT] Sent to: ${cleanPhone}`);
      return { success: true };
    }

    console.log(`[AUTOMATED WHATSAPP LOG] Target: +${cleanPhone} | Message:\n${text}`);
    return { success: true, simulated: true };
  } catch (error) {
    console.error("[AUTOMATED WHATSAPP ERROR]:", error);
    return { success: false, error };
  }
}

// =========================================================================
// PUBLIC NOTIFICATION HANDLERS CALLED FROM SERVER ACTIONS
// =========================================================================

/**
 * 1. AUTOMATED ADMIN NOTIFICATION (Triggered when a NEW reservation is created)
 * Includes full reservation details AND 1-click Approve / Decline links!
 */
export async function sendAdminNewBookingNotification(data: {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  groupName?: string | null;
  accommodationName: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  totalPrice: number;
  addonsList?: string[];
}) {
  const confirmUrl = `${SITE_URL}/api/booking/action?id=${data.bookingId}&action=confirm`;
  const declineUrl = `${SITE_URL}/api/booking/action?id=${data.bookingId}&action=decline`;
  const dashboardUrl = `${SITE_URL}/dashboard/admin`;

  const addonsFormatted =
    data.addonsList && data.addonsList.length > 0
      ? `\n📦 *Addons*: ${data.addonsList.join(", ")}`
      : "";

  const textMessage = `🔔 *NEW STAY RESERVATION RECEIVED!*

👤 *Guest*: ${data.customerName}
📞 *Phone*: ${data.customerPhone}
${data.customerEmail ? `✉️ *Email*: ${data.customerEmail}\n` : ""}${data.groupName ? `👥 *Group*: ${data.groupName}\n` : ""}🏕️ *Option*: ${data.accommodationName}
📅 *Dates*: ${data.startDate} to ${data.endDate}
👥 *Guests*: ${data.peopleCount}
💰 *Total*: $${data.totalPrice}${addonsFormatted}

⚡ *Quick Admin Actions*:
Approve: ${confirmUrl}
Decline: ${declineUrl}`;

  const htmlEmail = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #1c271c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background: #fafbfa;">
      <div style="background: #071308; padding: 20px; border-radius: 12px; text-align: center; color: white; margin-bottom: 20px;">
        <span style="color: #f59e0b; font-size: 11px; font-weight: bold; text-transform: uppercase; tracking: 2px;">NEW RESERVATION ALERT</span>
        <h2 style="margin: 5px 0 0 0; font-size: 22px; color: white;">${data.accommodationName}</h2>
      </div>

      <p style="font-size: 14px; color: #334155; line-height: 1.5;">
        A new stay reservation has been logged on <strong>Skylight Village Jaj</strong>. Review all details and click below to approve or decline instantly:
      </p>

      <!-- Full Details Grid -->
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Customer Name</td><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #071308;">${data.customerName}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Phone Number</td><td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></td></tr>
        ${data.customerEmail ? `<tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Customer Email</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${data.customerEmail}</td></tr>` : ""}
        ${data.groupName ? `<tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Group Name</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${data.groupName}</td></tr>` : ""}
        <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Lodging Option</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${data.accommodationName}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Dates</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${data.startDate} to ${data.endDate}</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Guest Count</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${data.peopleCount} guests</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; color: #047857;">Total Price</td><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #047857; font-size: 16px;">$${data.totalPrice}</td></tr>
      </table>

      ${
        data.addonsList && data.addonsList.length > 0
          ? `<div style="background: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #92400e;">
              <strong>Customer Selected Addons:</strong><br/>
              ${data.addonsList.map((a) => `• ${a}`).join("<br/>")}
             </div>`
          : ""
      }

      <!-- 1-Click Action Buttons -->
      <div style="margin: 25px 0; text-align: center; display: flex; gap: 10px; justify-content: center;">
        <a href="${confirmUrl}" style="display: inline-block; padding: 14px 24px; background: #047857; color: white; font-weight: bold; text-decoration: none; border-radius: 10px; font-size: 13px; text-transform: uppercase;">
          ✓ Approve &amp; Confirm Stay
        </a>
        &nbsp;&nbsp;
        <a href="${declineUrl}" style="display: inline-block; padding: 14px 24px; background: #dc2626; color: white; font-weight: bold; text-decoration: none; border-radius: 10px; font-size: 13px; text-transform: uppercase;">
          ✕ Decline / Cancel
        </a>
      </div>

      <div style="text-align: center; font-size: 11px; color: #64748b; margin-top: 20px; border-t: 1px solid #e2e8f0; padding-top: 15px;">
        <a href="${dashboardUrl}" style="color: #071308; font-weight: bold;">Open Control Room Dashboard ↗</a>
      </div>
    </div>
  `;

  // Dispatch background email & automated CallMeBot WhatsApp
  await Promise.all([
    sendServerEmail(ADMIN_EMAIL, `🔔 New Booking Alert: ${data.customerName} ($${data.totalPrice})`, htmlEmail),
    sendAutomatedWhatsApp(ADMIN_PHONE, textMessage),
  ]);
}

/**
 * 2. AUTOMATED CUSTOMER CONFIRMATION (Triggered when Admin changes status to CONFIRMED)
 */
export async function sendCustomerConfirmationNotification(data: {
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  accommodationName: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  totalPrice: number;
  status: string;
}) {
  if (data.status !== "CONFIRMED") return;

  const textMessage = `Hello ${data.customerName}! 👋

Great news! Your stay reservation at *Skylight Village Jaj* has been *CONFIRMED*! 🌲⛺

📌 *Reservation Details*:
• *Option*: ${data.accommodationName}
• *Dates*: ${data.startDate} to ${data.endDate}
• *Guests*: ${data.peopleCount}
• *Total Cost*: $${data.totalPrice}

📍 *Location Pin*: ${GOOGLE_MAPS_LINK}

We look forward to welcoming you to Mount Lebanon!
Hotline & WhatsApp: +961 70 663399`;

  const htmlEmail = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #1c271c; max-width: 600px; margin: 0 auto; border: 1px solid #047857; border-radius: 16px; background: #fafbfa;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #047857; margin: 0; font-size: 24px;">Reservation Confirmed! 🎉</h2>
        <p style="color: #475569; font-size: 14px;">Skylight Village Jaj &bull; Mount Lebanon (1,200m Altitude)</p>
      </div>

      <p style="font-size: 15px; leading-height: 1.6;">Hello <strong>${data.customerName}</strong>,</p>
      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        We are delighted to inform you that your stay reservation at <strong>Skylight Village Jaj</strong> has been <strong>CONFIRMED</strong>!
      </p>

      <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #071308;">Booking Summary:</h4>
        <ul style="padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.8;">
          <li><strong>Lodging Option:</strong> ${data.accommodationName}</li>
          <li><strong>Check-in / Check-out:</strong> ${data.startDate} to ${data.endDate}</li>
          <li><strong>Guests:</strong> ${data.peopleCount}</li>
          <li><strong>Total Amount:</strong> <span style="color: #047857; font-weight: bold;">$${data.totalPrice}</span></li>
        </ul>
      </div>

      <p style="font-size: 13px; color: #475569;">
        📍 <strong>Location Pin:</strong> <a href="${GOOGLE_MAPS_LINK}" style="color: #047857; font-weight: bold;">Open in Google Maps</a>
      </p>

      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-t: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        Skylight Village Jaj &bull; Hotline / WhatsApp: +961 70 663399
      </div>
    </div>
  `;

  const tasks: Promise<any>[] = [
    sendAutomatedWhatsApp(data.customerPhone, textMessage),
  ];

  if (data.customerEmail) {
    tasks.push(sendServerEmail(data.customerEmail, `Reservation Confirmed - Skylight Village Jaj`, htmlEmail));
  }

  await Promise.all(tasks);
}

/**
 * 3. AUTOMATED CONTACT FORM NOTIFICATION (Triggered when a user submits Contact Us form)
 */
export async function sendContactFormNotification(data: {
  name: string;
  email?: string;
  phone: string;
  subject: string;
  scoutGroup?: string;
  groupSize?: string;
  message: string;
}) {
  const textMessage = `📩 *NEW CONTACT INQUIRY RECEIVED!*

👤 *Name*: ${data.name}
📞 *Phone*: ${data.phone}
${data.email ? `✉️ *Email*: ${data.email}\n` : ""}${data.scoutGroup === "Yes" ? `🏕️ *Scout Group*: Yes (${data.groupSize} members)\n` : ""}📌 *Subject*: ${data.subject}
💬 *Message*: ${data.message}`;

  const htmlEmail = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #1c271c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background: #fafbfa;">
      <div style="background: #071308; padding: 20px; border-radius: 12px; text-align: center; color: white; margin-bottom: 20px;">
        <span style="color: #f59e0b; font-size: 11px; font-weight: bold; text-transform: uppercase; tracking: 2px;">NEW WEBSITE INQUIRY</span>
        <h2 style="margin: 5px 0 0 0; font-size: 20px; color: white;">${data.subject}</h2>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Full Name</td><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${data.name}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Phone Number</td><td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
        ${data.email ? `<tr style="background: #f8fafc;"><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Email</td><td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>` : ""}
        ${data.scoutGroup === "Yes" ? `<tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0;">Scout Group</td><td style="padding: 10px; border: 1px solid #e2e8f0;">Yes (${data.groupSize} members)</td></tr>` : ""}
      </table>

      <div style="background: white; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
        <strong style="color: #071308;">Message Content:</strong>
        <p style="margin: 8px 0 0 0; white-space: pre-wrap; color: #475569;">${data.message}</p>
      </div>

      <div style="text-align: center; font-size: 11px; color: #64748b; margin-top: 20px; border-t: 1px solid #e2e8f0; padding-top: 15px;">
        Automatically dispatched from Skylight Village Contact Us Form.
      </div>
    </div>
  `;

  await Promise.all([
    sendServerEmail(ADMIN_EMAIL, `📩 New Contact Form Inquiry: ${data.name} (${data.subject})`, htmlEmail),
    sendAutomatedWhatsApp(ADMIN_PHONE, textMessage),
  ]);
}
