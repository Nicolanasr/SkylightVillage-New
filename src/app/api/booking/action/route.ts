import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sendCustomerConfirmationNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action"); // "confirm" or "decline"

  if (!id || !action) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id },
      include: { accommodation: true },
    });

    if (!booking) {
      return new NextResponse(
        `<html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h2>Booking Not Found</h2><p>This reservation ID does not exist in the database.</p></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const newStatus = action === "confirm" ? "CONFIRMED" : "CANCELLED";

    // Update status in DB
    await db.booking.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/admin");

    // If confirmed, trigger automated customer confirmation email & message
    if (action === "confirm") {
      sendCustomerConfirmationNotification({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        accommodationName: booking.accommodation?.name || "Stay Option",
        startDate: new Date(booking.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        endDate: new Date(booking.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        peopleCount: booking.peopleCount,
        totalPrice: booking.totalPrice,
        status: "CONFIRMED",
      }).catch((e) => console.error("Error triggering confirmation:", e));
    }

    const isConfirmed = action === "confirm";
    const statusColor = isConfirmed ? "#047857" : "#dc2626";
    const titleText = isConfirmed ? "Reservation Approved & Confirmed! 🎉" : "Reservation Declined & Cancelled ❌";
    const subText = isConfirmed
      ? `You have approved ${booking.customerName}'s reservation for ${booking.accommodation?.name}. An automated confirmation has been sent to the guest.`
      : `You have declined ${booking.customerName}'s reservation for ${booking.accommodation?.name}.`;

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reservation Updated | Skylight Village Jaj</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; background: #fafbfa; color: #1c271c; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: ${isConfirmed ? "#ecfdf5" : "#fef2f2"}; color: ${statusColor}; font-size: 28px; line-height: 60px; margin: 0 auto 20px auto;">
              ${isConfirmed ? "✓" : "✕"}
            </div>
            <h1 style="color: ${statusColor}; font-size: 22px; margin-bottom: 10px;">${titleText}</h1>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">${subText}</p>

            <div style="background: #f8fafc; border-radius: 12px; padding: 15px; text-align: left; font-size: 13px; margin-bottom: 25px;">
              <p style="margin: 5px 0;"><strong>Guest:</strong> ${booking.customerName}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${booking.customerPhone}</p>
              <p style="margin: 5px 0;"><strong>Lodging Option:</strong> ${booking.accommodation?.name}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span></p>
            </div>

            <a href="https://skylightvillagelb.com/dashboard/admin" style="display: inline-block; padding: 12px 24px; background: #071308; color: #f59e0b; font-weight: bold; text-decoration: none; border-radius: 10px; font-size: 12px; text-transform: uppercase; tracking: 1px;">
              Open Operations Control Room ↗
            </a>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(htmlResponse, { headers: { "Content-Type": "text/html" } });
  } catch (error: any) {
    console.error("Booking action API error:", error);
    return new NextResponse("Server error updating booking status", { status: 500 });
  }
}
