import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StayCatalog from "@/components/StayCatalog";
import db from "@/lib/db";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campgrounds & Wooden Cabins | Best Camping Ground in Jaj, Lebanon",
  description:
    "Book your stay at Skylight Village in Jaj, Mount Lebanon (1,200m altitude). Choose from private campgrounds, wooden A-frame cabins, and scout camp fields.",
  keywords: [
    "best camping ground in Lebanon",
    "Jaj camping ground",
    "wood cabins Lebanon",
    "wooden tents Jaj",
    "scout camp Jaj",
    "Mount Lebanon campgrounds",
  ],
};

export const revalidate = 0; // Fresh database items on every load

interface PageProps {
  searchParams: Promise<{
    type?: string;
    startDate?: string;
    guests?: string;
  }>;
}

export default async function StayPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const accommodations = await db.accommodation.findMany({
    include: { addons: true },
    orderBy: { basePrice: "asc" },
  });

  const activeBookings = await db.booking.findMany({
    where: {
      status: { not: "CANCELLED" }
    }
  });

  const serializedBookings = activeBookings.map(b => ({
    accommodationId: b.accommodationId,
    startDate: b.startDate.toISOString().split("T")[0],
    endDate: b.endDate.toISOString().split("T")[0],
  }));

  return (
    <>
      <Navbar />

      <section 
        className="bg-skylight-green text-[#fafbfa] pt-24 pb-36 px-4 md:px-8 relative overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop')` 
        }}
      >
        {/* Contrast gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-skylight-dark/95 via-skylight-green/75 to-skylight-dark/50" />
        
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase drop-shadow-sm">
            Nature Immersion Lodges
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight drop-shadow-md">
            Campgrounds &amp; Wooden Tents in Jaj
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6 drop-shadow-sm">
            Compare camp spaces, individual clearings, wood tents, and upcoming octagon bungalows in Mount Lebanon's top stargazing campsite.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <StayCatalog
            accommodations={accommodations}
            bookings={serializedBookings}
            initialType={resolvedParams.type}
            initialStartDate={resolvedParams.startDate}
            initialGuests={resolvedParams.guests}
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
