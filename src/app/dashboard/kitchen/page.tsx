import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KitchenDashboard from "@/components/KitchenDashboard";
import db from "@/lib/db";

export const revalidate = 0; // Live kitchen queue reload

export default async function KitchenPage() {
  const activeOrderItems = await db.orderItem.findMany({
    where: {
      status: {
        in: ["PENDING", "PREPARING", "READY"],
      },
    },
    include: {
      menuItem: true,
      order: {
        include: {
          table: {
            include: {
              zone: true,
            },
          },
        },
      },
    },
    orderBy: {
      order: {
        createdAt: "desc",
      },
    },
  });

  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Internal Operations
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            Kitchen Prep Terminal
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Review food, drink, and shisha active prep statuses. Mark orders as preparing or ready for pickup.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <KitchenDashboard initialItems={activeOrderItems} />
        </div>
      </section>

      <Footer />
    </>
  );
}
