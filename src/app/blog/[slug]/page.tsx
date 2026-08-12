import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Calendar, Clock, ChevronLeft, ArrowRight, Share2, Compass, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const articlesData: Record<
  string,
  {
    title: string;
    description: string;
    author: string;
    date: string;
    readTime: string;
    keywords: string[];
    content: string[];
  }
> = {
  "top-day-picnic-spots-jbeil": {
    title: "Top Outdoor Day Picnic Spots Near Jbeil & Byblos, Lebanon",
    description:
      "Looking for a peaceful outdoor picnic spot near Jbeil? Discover why Jaj (1,200m altitude) is the ideal place for family day picnics with rented wooden tables, chairs, running water, and fresh mountain air.",
    author: "Skylight Outdoor Team",
    date: "June 10, 2026",
    readTime: "5 min read",
    keywords: [
      "day picnic spots Jbeil",
      "picnic spots near Byblos",
      "rent picnic tables Jaj",
      "family outdoor picnic Lebanon",
      "Jaj picnic area",
    ],
    content: [
      "When escaping the coastal heat of Byblos and Beirut, heading up into the Jbeil highlands offers immediate relief. At 1,200 meters above sea level, Jaj provides crisp pine air, shade, and open mountain views.",
      "At Skylight Village, we offer a dedicated Day Picnic Area where families and groups can relax without needing to haul heavy furniture. Each picnic pass includes reserved picnic tables, comfortable chairs, clean restroom access, running mountain spring water, and electricity.",
      "Want to grill? You can bring your own food or rent on-site BBQ grills with charcoal and firewood boxes. For those looking to travel completely light, our on-site kitchen serves traditional Lebanese Cold & Hot Mezza, charcoal-grilled Taouk, and clay head Shisha directly to your table."
    ],
  },
  "hiking-jaj-cedars-reserve": {
    title: "Hiking the Jaj Cedars Reserve: Complete Trail & Visiting Guide",
    description:
      "Everything you need to know about hiking to the ancient Cedars of God in Jaj, Mount Lebanon. Trail details, historical chapel sites, and camping options nearby at Skylight Village.",
    author: "Lebanon Hiking Trail Guide",
    date: "June 4, 2026",
    readTime: "6 min read",
    keywords: [
      "hiking Jaj cedar reserve",
      "Cedars of Jaj trail",
      "Jaj hiking trail",
      "Jbeil hiking spots",
      "attractions in Jaj",
    ],
    content: [
      "Perched high on Mount Lebanon cliffside between 1,500 and 1,800 meters, the Cedars of Jaj represent one of the oldest and most historical cedar groves in the Mediterranean basin. Legend has it that cedar timber harvested from these peaks was sent to ancient Byblos for Phoenician shipbuilding.",
      "The hike to the Jaj Cedars begins near Mar Abda square and winds upward through scenic limestone karst formations. The 6-kilometer trail offers panoramic views over the Jbeil district and leads directly to the secluded stone chapel nestled beneath ancient cedar trees.",
      "After completing the hike, visitors often head down to Skylight Village (1,200m altitude) for a rewarding Lebanese meal or an overnight camp beneath the stars."
    ],
  },
  "stargazing-mount-lebanon": {
    title: "The Ultimate Guide to Stargazing in Mount Lebanon",
    description:
      "Why the unpolluted, high-altitude skies of Jaj at 1,200 meters offer the absolute best conditions to witness the Perseids meteor shower and capture the Milky Way in Lebanon.",
    author: "Astronomy Club Guest Writer",
    date: "June 1, 2026",
    readTime: "5 min read",
    keywords: [
      "stargazing Lebanon",
      "Perseids meteor shower Lebanon",
      "astronomy Jaj",
      "best night sky Lebanon",
      "camping stargazing Mount Lebanon",
    ],
    content: [
      "Light pollution from coastal cities often hides the beauty of the night sky. However, rising to 1,200 meters altitude in Jaj positions you above low-level haze and well away from urban glow.",
      "During annual astronomical events like the August Perseids meteor shower, Skylight Village hosts stargazing nights around our central fireplace. Campers can lie back on outdoor hammocks or wood cabin porches to view hundreds of shooting stars.",
      "Whether you are an amateur astrophotographer capturing the galactic core or a family introducing kids to constellations, Jaj provides unparalleled dark-sky visibility."
    ],
  },
  "scout-campsites-guideline": {
    title: "Scout Troop Campsites: Group Preparation & Camping in Jaj",
    description:
      "Essential group guidelines, campfire configurations, and spring water access for scout troop assemblies in Jaj, Mount Lebanon at Skylight Village.",
    author: "Skylight Scout Liaison",
    date: "May 20, 2026",
    readTime: "7 min read",
    keywords: [
      "scout troop camping Lebanon",
      "scout campsites Jbeil",
      "scout group rate Jaj",
      "youth group camping Mount Lebanon",
    ],
    content: [
      "Hosting scout troops requires spacious grounds, clean sanitation, reliable drinking water, and safe campfire areas. Skylight Village features two dedicated scout sectors (Small Section for 20+ members and Large Section for 50+ members) at an affordable $3 per person / night rate.",
      "Troops have full access to running water taps, electricity outlets for equipment, clean restrooms, and designated assembly fields for morning drills and evening bonfires.",
      "Our team collaborates with Scout leaders to coordinate early check-in, equipment rentals (firewood, tables, chairs), and catering options upon request."
    ],
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesData[slug];

  if (!article) {
    return { title: "Article Not Found | Skylight Village" };
  }

  return {
    title: `${article.title} | Skylight Village Jaj`,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = articlesData[slug];

  if (!article) {
    return notFound();
  }

  // Schema.org Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Skylight Village Jaj",
      "logo": {
        "@type": "ImageObject",
        "url": "https://skylightvillagelb.com/images/Skylight-logo-white.png",
      },
    },
    "datePublished": article.date,
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />

      {/* Article Header */}
      <section className="relative py-20 px-4 md:px-8 bg-[#071308] text-white overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-widest hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={16} />
            <span>Back to All Articles</span>
          </Link>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-amber-400" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              {article.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-xl space-y-6">
          {article.content.map((p, idx) => (
            <p key={idx} className="text-base text-slate-700 font-light leading-relaxed">
              {p}
            </p>
          ))}

          <div className="border-t border-slate-100 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin size={16} className="text-amber-600" />
              <span>Location: Jaj, Mount Lebanon (1,200m Altitude)</span>
            </div>
            <Link
              href="/stay"
              className="px-6 py-3 bg-[#071308] hover:bg-emerald-900 text-amber-300 font-display font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>Book Camping &amp; Picnic</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
