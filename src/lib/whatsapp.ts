/**
 * Utility helpers to build pre-formatted WhatsApp notification links
 * for both Admin Alerts and Customer Confirmation Messages.
 */

export const ADMIN_WHATSAPP_NUMBER = "96170663399";
export const GOOGLE_MAPS_LOCATION = "https://maps.app.goo.gl/v3TU1HqX9YGE1hSSA";

/**
 * Format any Lebanese phone number into standard international format for WhatsApp (e.g. 70663399 -> 96170663399)
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return ADMIN_WHATSAPP_NUMBER;
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "961" + cleaned.substring(1);
  } else if (!cleaned.startsWith("961") && cleaned.length === 8) {
    cleaned = "961" + cleaned;
  }
  return cleaned;
}

/**
 * Generate Admin Notification Link when a NEW stay booking is submitted
 */
export function getNewStayAdminNotificationLink(data: {
  customerName: string;
  customerPhone: string;
  accommodationName: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  totalPrice: number;
  addonsList?: string[];
}): string {
  const addonsText =
    data.addonsList && data.addonsList.length > 0
      ? `\n📦 Addons:\n${data.addonsList.map((a) => `  • ${a}`).join("\n")}`
      : "";

  const text = `🔔 *NEW STAY RESERVATION RECEIVED!*

👤 *Guest*: ${data.customerName}
📞 *Phone*: ${data.customerPhone}
🏕️ *Option*: ${data.accommodationName}
📅 *Dates*: ${data.startDate} to ${data.endDate}
👥 *Guests*: ${data.peopleCount}
💰 *Total*: $${data.totalPrice}${addonsText}

Please review and confirm in the Admin Control Room!`;

  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate Customer Confirmation Link when Admin changes status to CONFIRMED
 */
export function getCustomerStayConfirmationLink(booking: {
  customerName: string;
  customerPhone: string;
  accommodationName: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  totalPrice: number;
  status: string;
  addons?: { quantity: number; addon?: { name: string } }[];
}): string {
  const targetPhone = formatWhatsAppPhone(booking.customerPhone);
  const isConfirmed = booking.status === "CONFIRMED";

  const addonsText =
    booking.addons && booking.addons.length > 0
      ? `\n📦 *Addons*: ${booking.addons.map((item) => `${item.addon?.name || "Addon"} (Qty: ${item.quantity})`).join(", ")}`
      : "";

  const text = isConfirmed
    ? `Hello ${booking.customerName}! 👋

Great news! Your reservation at *Skylight Village Jaj* has been *CONFIRMED*! 🌲⛺

📌 *Reservation Summary*:
• *Option*: ${booking.accommodationName}
• *Dates*: ${booking.startDate} to ${booking.endDate}
• *Guests*: ${booking.peopleCount}
• *Total Cost*: $${booking.totalPrice}${addonsText}

📍 *Location Pin*: ${GOOGLE_MAPS_LOCATION}

We look forward to welcoming you to Mount Lebanon! If you have any questions, feel free to reply directly to this message.`
    : `Hello ${booking.customerName}! 👋

Regarding your stay reservation at *Skylight Village Jaj* (${booking.accommodationName}):
Status: *${booking.status.replace(/_/g, " ")}*
Total: $${booking.totalPrice}

📍 Location: ${GOOGLE_MAPS_LOCATION}
Contact Desk: +961 70 663399`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
