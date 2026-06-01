"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Campsite / Stay Booking Action
export async function createStayBooking(data: {
  accommodationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  addonSelections: { addonId: string; quantity: number }[];
}) {
  try {
    const acc = await db.accommodation.findUnique({
      where: { id: data.accommodationId },
      include: { addons: true },
    });

    if (!acc) throw new Error("Accommodation not found");

    // Capacity checks
    if (data.peopleCount < acc.minCapacity) {
      return {
        success: false,
        error: `Requires a minimum of ${acc.minCapacity} guests for booking.`,
      };
    }
    if (data.peopleCount > acc.maxCapacity) {
      return {
        success: false,
        error: `Exceeds maximum room/zone capacity of ${acc.maxCapacity} guests.`,
      };
    }

    // Calculate dynamic pricing
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const duration = daysCount > 0 ? daysCount : 1;

    let baseCost = 0;
    if (acc.pricingType === "PER_PERSON_PER_DAY") {
      baseCost = acc.basePrice * data.peopleCount * duration;
    } else if (acc.pricingType === "PER_PERSON_PER_NIGHT") {
      baseCost = acc.basePrice * data.peopleCount * duration;
    } else {
      // PER_UNIT_PER_NIGHT
      baseCost = acc.basePrice * duration;
    }

    // Addons Cost
    let addonsCost = 0;
    const selectionsToInsert = [];
    for (const sel of data.addonSelections) {
      const match = acc.addons.find((a) => a.id === sel.addonId);
      if (match) {
        const itemCost =
          match.priceType === "PER_NIGHT"
            ? match.price * sel.quantity * duration
            : match.price * sel.quantity;
        addonsCost += itemCost;
        selectionsToInsert.push({
          addonId: sel.addonId,
          quantity: sel.quantity,
        });
      }
    }

    const totalPrice = baseCost + addonsCost;

    // Insert into database
    const booking = await db.booking.create({
      data: {
        accommodationId: data.accommodationId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        startDate: start,
        endDate: end,
        peopleCount: data.peopleCount,
        totalPrice,
        status: "PENDING",
        addons: {
          create: selectionsToInsert,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/stay");
    return { success: true, bookingId: booking.id, totalPrice };
  } catch (error: any) {
    console.error("Booking failure:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

// 2. Restaurant Table Booking Action
export async function createRestaurantBooking(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  timeSlot: string;
  zoneId: string;
  peopleCount: number;
}) {
  try {
    const zone = await db.restaurantZone.findUnique({
      where: { id: data.zoneId },
    });
    if (!zone) throw new Error("Restaurant zone not found");

    const booking = await db.restaurantBooking.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        bookingDate: new Date(data.bookingDate),
        timeSlot: data.timeSlot,
        zone: zone.name,
        peopleCount: data.peopleCount,
        status: "PENDING",
      },
    });

    revalidatePath("/");
    revalidatePath("/restaurant");
    return { success: true, bookingId: booking.id };
  } catch (error: any) {
    console.error("Table reservation failure:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

// 3. QR Customer Order Submission Action
export async function submitQROrder(data: {
  tableId: string;
  notes?: string;
  items: { menuItemId: string; quantity: number; seatNumber: number }[];
}) {
  try {
    // 1. Create the primary Order
    const order = await db.order.create({
      data: {
        tableId: data.tableId,
        status: "PENDING",
        notes: data.notes,
      },
    });

    // 2. Process each OrderItem, map to dynamic category & stock item
    for (const item of data.items) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: item.menuItemId },
        include: { category: true },
      });

      if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);

      // Map prep zone dynamically based on category
      let prepZone = "KITCHEN_COLD";
      if (menuItem.category.name.toLowerCase().includes("grill")) {
        prepZone = "KITCHEN_GRILL";
      } else if (menuItem.category.name.toLowerCase().includes("drink") || menuItem.category.name.toLowerCase().includes("bar")) {
        prepZone = "BAR";
      } else if (menuItem.category.name.toLowerCase().includes("shisha")) {
        prepZone = "SHISHA";
      }

      await db.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          seatNumber: item.seatNumber,
          status: "PENDING",
          prepZone,
        },
      });

      // 3. Auto-deduct stock if linked
      if (menuItem.stockItemId) {
        await db.stockItem.update({
          where: { id: menuItem.stockItemId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    revalidatePath("/dashboard/kitchen");
    revalidatePath("/dashboard/waiter");
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("QR order submission error:", error);
    return { success: false, error: error.message };
  }
}

// 4. Update Order Item Status Action (Kitchen Dashboard)
export async function updateOrderItemStatus(orderItemId: string, newStatus: string) {
  try {
    const item = await db.orderItem.update({
      where: { id: orderItemId },
      data: { status: newStatus },
      include: { order: true },
    });

    // If all items in an order are ready, auto-update the overall order status
    const allItems = await db.orderItem.findMany({
      where: { orderId: item.orderId },
    });

    const allReady = allItems.every((i) => i.status === "READY" || i.status === "SERVED");
    if (allReady) {
      await db.order.update({
        where: { id: item.orderId },
        data: { status: "READY_TO_SERVE" },
      });
    } else {
      await db.order.update({
        where: { id: item.orderId },
        data: { status: "PREPARING" },
      });
    }

    revalidatePath("/dashboard/kitchen");
    revalidatePath("/dashboard/waiter");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update item status:", error);
    return { success: false, error: error.message };
  }
}

// 5. Update Order Status Action
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // If marked as paid, mark all sub items and sub invoices as served/paid
    if (newStatus === "PAID") {
      await db.orderItem.updateMany({
        where: { orderId },
        data: { status: "SERVED" },
      });
      await db.invoice.updateMany({
        where: { orderId },
        data: { status: "PAID" },
      });
    }

    revalidatePath("/dashboard/waiter");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { success: false, error: error.message };
  }
}

// 6. Combine/Merge Restaurant Tables Action
export async function combineRestaurantTables(tableId1: string, tableId2: string) {
  try {
    await db.restaurantTable.update({
      where: { id: tableId2 },
      data: { mergedWithTableId: tableId1 },
    });
    revalidatePath("/dashboard/waiter");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to combine tables:", error);
    return { success: false, error: error.message };
  }
}

// 7. Split Combined Tables Action
export async function splitRestaurantTable(tableId: string) {
  try {
    await db.restaurantTable.update({
      where: { id: tableId },
      data: { mergedWithTableId: null },
    });
    revalidatePath("/dashboard/waiter");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to split table:", error);
    return { success: false, error: error.message };
  }
}

// 8. Create Split Invoice for specific Table Seat
export async function createInvoiceForSeat(orderId: string, seatNumber: number, invoiceName: string) {
  try {
    const items = await db.orderItem.findMany({
      where: { orderId, seatNumber },
      include: { menuItem: true },
    });

    if (items.length === 0) {
      return { success: false, error: "No items ordered for this seat number yet." };
    }

    const totalPrice = items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);

    const invoice = await db.invoice.create({
      data: {
        orderId,
        invoiceName,
        totalPrice,
        status: "UNPAID",
      },
    });

    // Link items to this invoice
    await db.orderItem.updateMany({
      where: { orderId, seatNumber },
      data: { invoiceId: invoice.id },
    });

    revalidatePath("/dashboard/waiter");
    return { success: true, invoiceId: invoice.id, totalPrice };
  } catch (error: any) {
    console.error("Failed to create split check:", error);
    return { success: false, error: error.message };
  }
}

// 9. Mark Seat Invoice as Paid
export async function markInvoiceAsPaid(invoiceId: string) {
  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });

    // Mark matched items as served
    await db.orderItem.updateMany({
      where: { invoiceId },
      data: { status: "SERVED" },
    });

    // Check if ALL invoices in the order are paid, if so, complete the overall Order
    const order = await db.order.findUnique({
      where: { id: invoice.orderId },
      include: { invoices: true, items: true },
    });

    if (order) {
      const allInvoicesPaid = order.invoices.every((i) => i.status === "PAID");
      const allItemsInvoiced = order.items.every((i) => i.invoiceId !== null);
      
      if (allInvoicesPaid && allItemsInvoiced) {
        await db.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
      }
    }

    revalidatePath("/dashboard/waiter");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to checkout seat check:", error);
    return { success: false, error: error.message };
  }
}

// 10. Log Stock Waste Action
export async function logStockWaste(stockItemId: string, quantity: number, reason: string) {
  try {
    const stock = await db.stockItem.findUnique({ where: { id: stockItemId } });
    if (!stock) throw new Error("Stock item not found");

    if (stock.quantity < quantity) {
      return { success: false, error: `Cannot write off ${quantity} units. Only ${stock.quantity} in stock.` };
    }

    await db.stockItem.update({
      where: { id: stockItemId },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });

    await db.wasteLog.create({
      data: {
        stockItemId,
        quantity,
        reason,
      },
    });

    revalidatePath("/dashboard/admin/stock");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to log stock waste:", error);
    return { success: false, error: error.message };
  }
}

// 11. Transfer Asset Allocation (Restaurant / Campground / Reserve / Repair / Discarded)
export async function transferAssetAllocation(
  assetId: string,
  sourceLocation: string,
  targetLocation: string,
  quantityToMove: number
) {
  try {
    // 1. Fetch source allocation
    const sourceAlloc = await db.assetAllocation.findFirst({
      where: { assetId, location: sourceLocation },
    });

    if (!sourceAlloc || sourceAlloc.quantity < quantityToMove) {
      return { success: false, error: "Insufficient asset quantity at source location to transfer." };
    }

    // 2. Fetch or create target allocation
    const targetAlloc = await db.assetAllocation.findFirst({
      where: { assetId, location: targetLocation },
    });

    // 3. Perform atomic updates
    await db.assetAllocation.update({
      where: { id: sourceAlloc.id },
      data: {
        quantity: {
          decrement: quantityToMove,
        },
      },
    });

    if (targetAlloc) {
      await db.assetAllocation.update({
        where: { id: targetAlloc.id },
        data: {
          quantity: {
            increment: quantityToMove,
          },
        },
      });
    } else {
      await db.assetAllocation.create({
        data: {
          assetId,
          location: targetLocation,
          quantity: quantityToMove,
          status: targetLocation === "REPAIR" ? "REPAIRING" : targetLocation === "DISCARDED" ? "DISCARDED" : "ACTIVE",
        },
      });
    }

    revalidatePath("/dashboard/admin/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to transfer asset:", error);
    return { success: false, error: error.message };
  }
}

// 12. Fetch Locked Booking Dates for Accommodation
export async function getAccommodationBookings(accommodationId: string) {
  try {
    const bookings = await db.booking.findMany({
      where: {
        accommodationId,
        status: { not: "CANCELLED" },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    const blockedDates: string[] = [];
    bookings.forEach((b) => {
      let current = new Date(b.startDate);
      const end = new Date(b.endDate);
      while (current < end) {
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, "0");
        const dd = String(current.getDate()).padStart(2, "0");
        blockedDates.push(`${yyyy}-${mm}-${dd}`);
        current.setDate(current.getDate() + 1);
      }
    });

    return { success: true, blockedDates };
  } catch (error: any) {
    console.error("Failed to fetch accommodation bookings:", error);
    return { success: false, blockedDates: [], error: error.message };
  }
}

// 13. Create Event Reservation with Capacity Control
export async function createEventReservation(data: {
  eventId: string;
  customerName: string;
  customerEmail: string;
  ticketCount: number;
}) {
  try {
    const event = await db.event.findUnique({
      where: { id: data.eventId },
      include: { reservations: true },
    });
    if (!event) throw new Error("Event not found");

    const reservedCount = event.reservations.reduce((sum, r) => sum + r.ticketCount, 0);

    if (reservedCount + data.ticketCount > event.capacity) {
      return {
        success: false,
        error: `Ticket request exceeds remaining spots. Only ${event.capacity - reservedCount} tickets available.`,
      };
    }

    const reservation = await db.eventReservation.create({
      data: {
        eventId: data.eventId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        ticketCount: data.ticketCount,
        paid: event.price === 0, // Auto-paid if free event
      },
    });

    revalidatePath(`/events/${data.eventId}`);
    revalidatePath("/");
    return { success: true, reservationId: reservation.id };
  } catch (error: any) {
    console.error("Event reservation failure:", error);
    return { success: false, error: error.message || "Failed to reserve event tickets." };
  }
}



