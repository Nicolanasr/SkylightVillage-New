"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, User, Utensils, Flame, ShieldAlert, Award, Compass } from "lucide-react";

export default function RoleSimulator() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [activeRole, setActiveRole] = useState<string>("PUBLIC");

  useEffect(() => {
    if (pathname.startsWith("/menu")) {
      setActiveRole("CUSTOMER");
    } else if (pathname.includes("/kitchen")) {
      setActiveRole("KITCHEN");
    } else if (pathname.includes("/waiter")) {
      setActiveRole("WAITER");
    } else if (pathname.includes("/admin")) {
      setActiveRole("ADMIN");
    } else {
      setActiveRole("PUBLIC");
    }
  }, [pathname]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-skylight-green text-white rounded-full shadow-2xl hover:bg-skylight-dark hover:scale-105 transition-all flex items-center gap-2 border border-skylight-gold/40"
        title="Open Role Simulator"
      >
        <Eye className="w-5 h-5 animate-pulse text-skylight-gold" />
        <span className="text-xs font-semibold tracking-wider font-display pr-1">SIMULATOR</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 glassmorphic p-4 rounded-2xl shadow-2xl border border-skylight-green/20 animate-fade-in">
      <div className="flex items-center justify-between border-b border-skylight-green/10 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-skylight-gold" />
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-skylight-green">
            Skylight Role Simulator
          </h4>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-xs text-gray-500 hover:text-skylight-green font-semibold"
        >
          Hide
        </button>
      </div>

      <p className="text-[10px] text-gray-600 mb-3 leading-relaxed">
        Toggle between views instantly to test booking logic, real-time QR ordering, kitchen channels, and inventory auto-deductions.
      </p>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <Link
          href="/"
          className={`p-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeRole === "PUBLIC"
              ? "bg-skylight-green text-white shadow-md"
              : "bg-skylight-green-light/40 text-skylight-green hover:bg-skylight-green-light"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Public Web
        </Link>

        <Link
          href="/menu?table=2"
          className={`p-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeRole === "CUSTOMER"
              ? "bg-skylight-green text-white shadow-md"
              : "bg-skylight-green-light/40 text-skylight-green hover:bg-skylight-green-light"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Customer QR
        </Link>

        <Link
          href="/dashboard/waiter"
          className={`p-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeRole === "WAITER"
              ? "bg-skylight-green text-white shadow-md"
              : "bg-skylight-green-light/40 text-skylight-green hover:bg-skylight-green-light"
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          Waiter Panel
        </Link>

        <Link
          href="/dashboard/kitchen"
          className={`p-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeRole === "KITCHEN"
              ? "bg-skylight-green text-white shadow-md"
              : "bg-skylight-green-light/40 text-skylight-green hover:bg-skylight-green-light"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Prep Queue
        </Link>

        <Link
          href="/dashboard/admin?tab=stock"
          className={`p-2 col-span-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeRole === "ADMIN"
              ? "bg-skylight-gold text-skylight-dark shadow-md"
              : "bg-skylight-green-light/60 text-skylight-green hover:bg-skylight-green-light"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-skylight-green" />
          Admin Stock & Assets
        </Link>
      </div>

      <div className="mt-3 text-center border-t border-skylight-green/10 pt-2 text-[9px] text-gray-500 font-mono">
        Active Route: <span className="text-skylight-green font-semibold">{pathname}</span>
      </div>
    </div>
  );
}
