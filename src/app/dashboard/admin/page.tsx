import React from "react";
import db from "@/lib/db";
import { getDashboardStats } from "@/app/actions/adminActions";
import AdminDashboardClient from "./AdminDashboardClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Guard check (Double-safety check)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session");
  if (!sessionCookie || !sessionCookie.value) {
    redirect("/login");
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "admin") {
      redirect(`/dashboard/${session.role}`);
    }
  } catch (e) {
    redirect("/login");
  }

  // 2. Fetch live statistical indicators from server
  const statsRes = await getDashboardStats();
  const stats = statsRes.success
    ? statsRes.stats
    : {
        staysRevenue: 0,
        activeStaysCount: 0,
        restaurantBookingsCount: 0,
        lowStockCount: 0,
        accommodationsCount: 0,
        eventsCount: 0,
        attractionsCount: 0,
        reviewsCount: 0,
      };

  // 3. Fetch comprehensive records in parallel from DB
  const [
    accommodations,
    bookings,
    restaurantBookings,
    events,
    attractions,
    reviews,
    restaurantZones,
    stockItems,
    wasteLogs,
    assets,
    stockMovements
  ] = await Promise.all([
    db.accommodation.findMany({
      include: { addons: true, images: true },
      orderBy: { name: "asc" },
    }),
    db.booking.findMany({
      include: { accommodation: true },
      orderBy: { startDate: "desc" },
    }),
    db.restaurantBooking.findMany({
      orderBy: { bookingDate: "desc" },
    }),
    db.event.findMany({
      orderBy: { date: "desc" },
    }),
    db.localAttraction.findMany({
      orderBy: { name: "asc" },
    }),
    db.review.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.restaurantZone.findMany({
      orderBy: { name: "asc" },
    }),
    db.stockItem.findMany({
      include: { wasteLogs: true },
      orderBy: { name: "asc" },
    }),
    db.wasteLog.findMany({
      include: {
        stockItem: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    db.asset.findMany({
      include: { allocations: true },
      orderBy: { name: "asc" },
    }),
    db.stockMovement.findMany({
      include: {
        stockItem: { select: { name: true, unit: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // 4. Render client control console with props
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Operations Control Room</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">
          Live campground accommodations, restaurant booking grids, events planning, and community reviews
        </p>
      </div>

      <AdminDashboardClient
        stats={stats as any}
        accommodations={accommodations}
        bookings={bookings}
        restaurantBookings={restaurantBookings}
        events={events}
        attractions={attractions}
        reviews={reviews}
        restaurantZones={restaurantZones}
        stockItems={stockItems as any}
        wasteLogs={wasteLogs as any}
        assets={assets as any}
        stockMovements={stockMovements as any}
      />
    </div>
  );
}
