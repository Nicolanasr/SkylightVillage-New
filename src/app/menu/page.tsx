import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QRMenu from "@/components/QRMenu";
import db from "@/lib/db";

export const revalidate = 0; // Fresh menu items on every load

interface SearchParams {
  table?: string;
}

export default async function QRMenuPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await props.searchParams;
  const activeTableNumber = parseInt(resolvedParams.table || "2") || 2;

  const categories = await db.menuCategory.findMany({
    include: {
      menuItems: true,
    },
    orderBy: { name: "asc" },
  });

  const tables = await db.restaurantTable.findMany({
    include: {
      zone: true,
    },
    orderBy: { number: "asc" },
  });

  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Scan & Dine
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            Skylight QR Menu
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Scan QR code at your table, add items to your seat order, and submit directly to kitchen preparation channels.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <QRMenu
            categories={categories}
            tables={tables}
            activeTableNumber={activeTableNumber}
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
