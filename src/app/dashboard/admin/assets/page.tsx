import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminAssetDashboard from "@/components/AdminAssetDashboard";
import db from "@/lib/db";

export const revalidate = 0; // Live database revalidation on transfers

export default async function AdminAssetsPage() {
  const assets = await db.asset.findMany({
    include: {
      allocations: true,
    },
    orderBy: { name: "asc" },
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
            Equipment & Asset Allocations
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Review equipment levels assigned to campgrounds and restaurant zones. Seamlessly log broken repairs and discarded item write-offs.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <AdminAssetDashboard assets={assets} />
        </div>
      </section>

      <Footer />
    </>
  );
}
