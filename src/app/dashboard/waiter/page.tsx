import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaiterDashboard from "@/components/WaiterDashboard";
import db from "@/lib/db";

export const revalidate = 0; // Live database revalidation on waiter actions

export default async function WaiterPage() {
  const tables = await db.restaurantTable.findMany({
    include: {
      zone: true,
      assignedStaff: true,
      orders: {
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          invoices: true,
        },
      },
    },
    orderBy: { number: "asc" },
  });

  const staffList = await db.staff.findMany({
    where: { role: "WAITER" },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Server Dashboard
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            Waiter Command Lounge
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Execute table bill mergers, receive visual notification bells for kitchen prep pickups, and perform individual seat split checkouts.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <WaiterDashboard initialTables={tables} staffList={staffList} />
        </div>
      </section>

      <Footer />
    </>
  );
}
