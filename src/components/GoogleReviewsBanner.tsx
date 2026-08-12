"use client";

import React from "react";
import { Star, MessageSquareHeart, ExternalLink, ShieldCheck } from "lucide-react";

export default function GoogleReviewsBanner() {
  const googleSearchUrl =
    "https://www.google.com/maps/search/?api=1&query=Skylight+Village+Jaj+Lebanon";

  return (
    <section className="py-12 px-4 md:px-8 bg-gradient-to-r from-[#071308] via-emerald-950 to-[#071308] text-white relative overflow-hidden border-y border-amber-400/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        {/* Left Info Column */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>4.9 ★★★★★ Rating on Google Reviews</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-tight">
            Loved Your Experience at Skylight Village Jaj?
          </h3>

          <p className="text-slate-300 font-light text-xs sm:text-sm leading-relaxed">
            Your reviews help fellow mountain campers, families, and scout troops discover our sanctuary in Jaj. Share your thoughts, photos, and ratings on Google!
          </p>
        </div>

        {/* Right CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#071308] font-display font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-lg shadow-amber-400/20 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 whitespace-nowrap"
          >
            <MessageSquareHeart size={16} className="text-[#071308]" />
            <span>Leave a Google Review</span>
            <ExternalLink size={14} className="opacity-70" />
          </a>
        </div>
      </div>
    </section>
  );
}
