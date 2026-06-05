"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ==========================================
// 1. SESSION & AUTHENTICATION ACTIONS
// ==========================================

export async function loginAction(data: {
  username?: string;
  password?: string;
  role: string;
  isQuickAccess?: boolean;
}) {
  try {
    const { username, password, role, isQuickAccess } = data;

    // Check credentials if not using Quick Access
    if (!isQuickAccess) {
      if (role === "admin") {
        if (username !== "admin" || password !== "admin123") {
          return { success: false, error: "Invalid Admin credentials (use admin/admin123 or Quick-Access)" };
        }
      } else if (role === "waiter") {
        if (username !== "waiter" || password !== "waiter123") {
          return { success: false, error: "Invalid Waiter credentials (use waiter/waiter123 or Quick-Access)" };
        }
      } else if (role === "kitchen") {
        if (username !== "kitchen" || password !== "kitchen123") {
          return { success: false, error: "Invalid Kitchen credentials (use kitchen/kitchen123 or Quick-Access)" };
        }
      } else {
        return { success: false, error: "Invalid role selected" };
      }
    }

    const sessionUser = username || `${role}_user`;

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "user_session",
      value: JSON.stringify({ username: sessionUser, role }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, role };
  } catch (error: any) {
    console.error("Login action failure:", error);
    return { success: false, error: error.message || "Authentication failed." };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("user_session");
    return { success: true };
  } catch (error: any) {
    console.error("Logout action failure:", error);
    return { success: false, error: error.message };
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie || !sessionCookie.value) return null;
    return JSON.parse(sessionCookie.value) as { username: string; role: string };
  } catch (e) {
    return null;
  }
}

// ==========================================
// 2. DASHBOARD STATS AGGREGATION
// ==========================================

export async function getDashboardStats() {
  try {
    // 1. Stays revenue (confirmed/paid bookings)
    const staysBookings = await db.booking.findMany({
      where: { status: { not: "CANCELLED" } }
    });
    const staysRevenue = staysBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // 2. Active occupancy stays count
    const activeStaysCount = await db.booking.count({
      where: { status: { in: ["DEPOSIT_PAID", "FULL_PAID", "CONFIRMED"] } }
    });

    // 3. Restaurant bookings count
    const restaurantBookingsCount = await db.restaurantBooking.count({
      where: { status: { not: "CANCELLED" } }
    });

    // 4. Stock items low threshold warning
    const lowStockCount = await db.stockItem.count({
      where: {
        quantity: { lte: 15 } // default minThreshold fallback
      }
    });

    // 5. Total Accommodations, Events, Attractions and Reviews
    const accommodationsCount = await db.accommodation.count();
    const eventsCount = await db.event.count();
    const attractionsCount = await db.localAttraction.count();
    const reviewsCount = await db.review.count();

    return {
      success: true,
      stats: {
        staysRevenue,
        activeStaysCount,
        restaurantBookingsCount,
        lowStockCount,
        accommodationsCount,
        eventsCount,
        attractionsCount,
        reviewsCount,
      }
    };
  } catch (error: any) {
    console.error("Stats fetching failure:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 3. ACCOMMODATION CRUD ACTIONS
// ==========================================

export async function createAccommodation(data: {
  name: string;
  slug: string;
  type: string;
  pricingType: string;
  basePrice: number;
  minCapacity: number;
  maxCapacity: number;
  description?: string;
  amenities?: string;
  nightThresholdEnabled?: boolean;
  nightThreshold?: number;
}) {
  try {
    const acc = await db.accommodation.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: data.type,
        pricingType: data.pricingType,
        basePrice: Number(data.basePrice),
        minCapacity: Number(data.minCapacity) || 1,
        maxCapacity: Number(data.maxCapacity),
        description: data.description || "",
        amenities: data.amenities || "",
        nightThresholdEnabled: data.nightThresholdEnabled ?? false,
        nightThreshold: Number(data.nightThreshold) || 5,
      }
    });
    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true, accommodation: acc };
  } catch (error: any) {
    console.error("Create accommodation error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAccommodation(
  id: string,
  data: {
    name: string;
    slug: string;
    type: string;
    pricingType: string;
    basePrice: number;
    minCapacity: number;
    maxCapacity: number;
    description?: string;
    amenities?: string;
    nightThresholdEnabled?: boolean;
    nightThreshold?: number;
  }
) {
  try {
    const acc = await db.accommodation.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        pricingType: data.pricingType,
        basePrice: Number(data.basePrice),
        minCapacity: Number(data.minCapacity) || 1,
        maxCapacity: Number(data.maxCapacity),
        description: data.description || "",
        amenities: data.amenities || "",
        nightThresholdEnabled: data.nightThresholdEnabled ?? false,
        nightThreshold: Number(data.nightThreshold) || 5,
      }
    });
    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true, accommodation: acc };
  } catch (error: any) {
    console.error("Update accommodation error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAccommodation(id: string) {
  try {
    // Delete related elements first to preserve referential integrity
    await db.accommodationImage.deleteMany({ where: { accommodationId: id } });
    await db.accommodationAddon.deleteMany({ where: { accommodationId: id } });
    await db.booking.deleteMany({ where: { accommodationId: id } });
    
    await db.accommodation.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete accommodation error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 4. STAY BOOKING / RESERVATION CRUD ACTIONS
// ==========================================

export async function createBookingManual(data: {
  accommodationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  groupName?: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  status: string;
  notes?: string;
}) {
  try {
    const acc = await db.accommodation.findUnique({
      where: { id: data.accommodationId }
    });
    if (!acc) throw new Error("Accommodation not found");

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const duration = daysCount > 0 ? daysCount : 1;

    // Apply night-threshold pricing: if enabled and duration >= threshold, charge for (duration-1) nights
    const useNightlyRate =
      (acc as any).nightThresholdEnabled &&
      duration >= ((acc as any).nightThreshold ?? 5);
    const billableUnits = useNightlyRate ? duration - 1 : duration;

    let totalPrice = 0;
    if (acc.pricingType === "PER_PERSON_PER_DAY" || acc.pricingType === "PER_PERSON_PER_NIGHT") {
      totalPrice = acc.basePrice * Number(data.peopleCount) * billableUnits;
    } else {
      totalPrice = acc.basePrice * billableUnits;
    }

    const booking = await db.booking.create({
      data: {
        accommodationId: data.accommodationId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        groupName: data.groupName,
        startDate: start,
        endDate: end,
        peopleCount: Number(data.peopleCount),
        totalPrice,
        status: data.status,
        notes: data.notes,
      }
    });

    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true, booking };
  } catch (error: any) {
    console.error("Manual booking error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBookingDetails(
  id: string,
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    groupName?: string;
    startDate: string;
    endDate: string;
    peopleCount: number;
    status: string;
    notes?: string;
  }
) {
  try {
    const booking = await db.booking.findUnique({
      where: { id },
      include: { accommodation: true }
    });
    if (!booking) throw new Error("Booking not found");

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const duration = daysCount > 0 ? daysCount : 1;

    let totalPrice = booking.totalPrice;
    if (booking.accommodation) {
      const useNightlyRate =
        (booking.accommodation as any).nightThresholdEnabled &&
        duration >= ((booking.accommodation as any).nightThreshold ?? 5);
      const billableUnits = useNightlyRate ? duration - 1 : duration;

      if (booking.accommodation.pricingType === "PER_PERSON_PER_DAY" || booking.accommodation.pricingType === "PER_PERSON_PER_NIGHT") {
        totalPrice = booking.accommodation.basePrice * Number(data.peopleCount) * billableUnits;
      } else {
        totalPrice = booking.accommodation.basePrice * billableUnits;
      }
    }

    await db.booking.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        groupName: data.groupName,
        startDate: start,
        endDate: end,
        peopleCount: Number(data.peopleCount),
        totalPrice,
        status: data.status,
        notes: data.notes,
      }
    });

    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Update booking error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBooking(id: string) {
  try {
    await db.bookingAddonSelection.deleteMany({ where: { bookingId: id } });
    await db.booking.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete booking error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 5. RESTAURANT BOOKING CRUD ACTIONS
// ==========================================

export async function createRestaurantBookingManual(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  timeSlot: string;
  zone: string;
  peopleCount: number;
  status: string;
  notes?: string;
}) {
  try {
    const booking = await db.restaurantBooking.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        bookingDate: new Date(data.bookingDate),
        timeSlot: data.timeSlot,
        zone: data.zone,
        peopleCount: Number(data.peopleCount),
        status: data.status,
        notes: data.notes,
      }
    });
    revalidatePath("/");
    revalidatePath("/restaurant");
    revalidatePath("/dashboard/admin");
    return { success: true, booking };
  } catch (error: any) {
    console.error("Manual restaurant booking error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateRestaurantBookingDetails(
  id: string,
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bookingDate: string;
    timeSlot: string;
    zone: string;
    peopleCount: number;
    status: string;
    notes?: string;
  }
) {
  try {
    await db.restaurantBooking.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        bookingDate: new Date(data.bookingDate),
        timeSlot: data.timeSlot,
        zone: data.zone,
        peopleCount: Number(data.peopleCount),
        status: data.status,
        notes: data.notes,
      }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Update restaurant booking error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRestaurantBooking(id: string) {
  try {
    await db.restaurantBooking.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete restaurant booking error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 6. EVENT CRUD ACTIONS
// ==========================================

export async function createEvent(data: {
  title: string;
  slug?: string;
  description: string;
  date: string;
  price: number;
  requiresTicket: boolean;
  capacity: number;
}) {
  try {
    const event = await db.event.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: data.description,
        date: new Date(data.date),
        price: Number(data.price),
        requiresTicket: data.requiresTicket,
        capacity: Number(data.capacity),
      }
    });
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/dashboard/admin");
    return { success: true, event };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEvent(
  id: string,
  data: {
    title: string;
    slug: string;
    description: string;
    date: string;
    price: number;
    requiresTicket: boolean;
    capacity: number;
  }
) {
  try {
    const event = await db.event.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        date: new Date(data.date),
        price: Number(data.price),
        requiresTicket: data.requiresTicket,
        capacity: Number(data.capacity),
      }
    });
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/dashboard/admin");
    return { success: true, event };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteEvent(id: string) {
  try {
    await db.eventReservation.deleteMany({ where: { eventId: id } });
    await db.event.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 7. LOCAL ATTRACTION (HIKE) CRUD ACTIONS
// ==========================================

export async function createAttraction(data: {
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  location: string;
  distance: string;
  details: string;
  externalUrl: string;
}) {
  try {
    const attraction = await db.localAttraction.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl || "https://picsum.photos/seed/attraction/600/400",
        location: data.location,
        distance: data.distance,
        details: data.details,
        externalUrl: data.externalUrl,
      }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true, attraction };
  } catch (error: any) {
    console.error("Create attraction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAttraction(
  id: string,
  data: {
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    location: string;
    distance: string;
    details: string;
    externalUrl: string;
  }
) {
  try {
    const attraction = await db.localAttraction.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        location: data.location,
        distance: data.distance,
        details: data.details,
        externalUrl: data.externalUrl,
      }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true, attraction };
  } catch (error: any) {
    console.error("Update attraction error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAttraction(id: string) {
  try {
    await db.localAttraction.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete attraction error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 8. REVIEW APPROVAL & CRUD ACTIONS
// ==========================================

export async function createReview(data: {
  authorName: string;
  rating: number;
  content: string;
}) {
  try {
    const review = await db.review.create({
      data: {
        authorName: data.authorName,
        rating: Number(data.rating),
        content: data.content,
        approved: false // requires admin moderation
      }
    });
    revalidatePath("/");
    return { success: true, review };
  } catch (error: any) {
    console.error("Create review error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleReviewApproval(id: string, approve: boolean) {
  try {
    await db.review.update({
      where: { id },
      data: { approved: approve }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle review approval error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteReview(id: string) {
  try {
    await db.review.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete review error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 9. RESTAURANT ZONE / DINING AREA CRUD ACTIONS
// ==========================================

export async function createRestaurantZone(data: {
  name: string;
  slug?: string;
  description?: string;
  capacity: number;
  price: number;
  minCapacity: number;
  daysOpen: string;
  openHour: number;
  coverImage?: string;
}) {
  try {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const zone = await db.restaurantZone.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        capacity: Number(data.capacity) || 60,
        price: Number(data.price) || 0,
        minCapacity: Number(data.minCapacity) || 1,
        daysOpen: data.daysOpen || "ALL",
        openHour: Number(data.openHour) || 12,
        coverImage: data.coverImage || "",
      }
    });
    revalidatePath("/");
    revalidatePath("/restaurant");
    revalidatePath("/dashboard/admin");
    return { success: true, zone };
  } catch (error: any) {
    console.error("Create restaurant zone error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateRestaurantZone(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    capacity: number;
    price: number;
    minCapacity: number;
    daysOpen: string;
    openHour: number;
    coverImage?: string;
  }
) {
  try {
    const zone = await db.restaurantZone.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        capacity: Number(data.capacity),
        price: Number(data.price),
        minCapacity: Number(data.minCapacity),
        daysOpen: data.daysOpen,
        openHour: Number(data.openHour),
        coverImage: data.coverImage,
      }
    });
    revalidatePath("/");
    revalidatePath("/restaurant");
    revalidatePath("/dashboard/admin");
    return { success: true, zone };
  } catch (error: any) {
    console.error("Update restaurant zone error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRestaurantZone(id: string) {
  try {
    // Cascade-delete related images/tables and reservations first to avoid database foreign key violations
    await db.restaurantZoneImage.deleteMany({ where: { zoneId: id } });
    await db.restaurantTable.deleteMany({ where: { zoneId: id } });
    
    await db.restaurantZone.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/restaurant");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete restaurant zone error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 10. ACCOMMODATION ADDONS & IMAGES ACTIONS
// ==========================================

export async function createAccommodationAddon(data: {
  accommodationId: string;
  name: string;
  price: number;
  priceType: string;
}) {
  try {
    const addon = await db.accommodationAddon.create({
      data: {
        accommodationId: data.accommodationId,
        name: data.name,
        price: Number(data.price),
        priceType: data.priceType,
      }
    });
    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true, addon };
  } catch (error: any) {
    console.error("Create accommodation addon error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAccommodationAddon(id: string) {
  try {
    // Delete selectors first to avoid referential integrity failure
    await db.bookingAddonSelection.deleteMany({ where: { addonId: id } });
    await db.accommodationAddon.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete accommodation addon error:", error);
    return { success: false, error: error.message };
  }
}

export async function addAccommodationImage(data: {
  accommodationId: string;
  imageUrl: string;
}) {
  try {
    const img = await db.accommodationImage.create({
      data: {
        accommodationId: data.accommodationId,
        imageUrl: data.imageUrl,
        order: 0,
      }
    });
    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true, image: img };
  } catch (error: any) {
    console.error("Add accommodation image error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAccommodationImage(id: string) {
  try {
    await db.accommodationImage.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/stay");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete accommodation image error:", error);
    return { success: false, error: error.message };
  }
}
