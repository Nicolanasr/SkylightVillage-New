import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminStockDashboard from "@/components/AdminStockDashboard";
import db from "@/lib/db";

export const revalidate = 0; // Live stock ledger checks

export default async function AdminStockPage() {
  const stockItems = await db.stockItem.findMany({
    include: {
      wasteLogs: true,
    },
    orderBy: { name: "asc" },
  });

  const wasteLogs = await db.wasteLog.findMany({
    include: {
      stockItem: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Control Center
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            Inventory & Provisions Ledger
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Review live auto-deductions triggered by customer QR orders, specify low stock warning parameters, and catalog waste spoilage.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <AdminStockDashboard stockItems={stockItems} wasteLogs={wasteLogs} />
        </div>
      </section>

      <Footer />
    </>
  );
}
