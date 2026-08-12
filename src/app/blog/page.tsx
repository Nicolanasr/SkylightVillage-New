import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { BookOpen, User, Calendar, Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outdoor Camping, Day Picnic & Hiking Guides | Skylight Village Jaj",
  description:
    "Explore comprehensive travel guides for day picnic spots near Jbeil, attractions in Jaj, hiking the Jaj Cedars Reserve, stargazing in Mount Lebanon, and scout group camping.",
  keywords: [
    "best camping ground in Lebanon",
    "day picnic spots Jbeil",
    "attractions in Jaj",
    "hiking Jaj cedar reserve",
    "stargazing Lebanon",
    "scout campsites Lebanon",
    "wood cabins Lebanon",
    "glamping Lebanon",
  ],
};

export default function BlogPage() {
  const posts = [
    {
      title: "Top Outdoor Day Picnic Spots Near Jbeil & Byblos, Lebanon",
      excerpt:
        "Looking for a peaceful outdoor picnic spot near Jbeil? Discover why Jaj (1,200m altitude) is ideal for family day picnics with rented tables, chairs, running water, and fresh mountain air.",
      author: "Skylight Outdoor Team",
      date: "June 10, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800&auto=format&fit=crop",
      slug: "top-day-picnic-spots-jbeil",
    },
    {
      title: "Attractions in Jaj, Mount Lebanon: Cedar Reserve, Ancient Chapels & Outdoor Getaways",
      excerpt:
        "Explore top tourist attractions in Jaj. From ancient Phoenician cedar groves and Mar Abda stone chapel to stargazing camping grounds and family picnic spots near Byblos.",
      author: "Skylight Tourism Desk",
      date: "June 12, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
      slug: "attractions-in-jaj-mount-lebanon",
    },
    {
      title: "Hiking the Jaj Cedars Reserve: Trail Guide, History & Nearby Campsites",
      excerpt:
        "Everything you need to know about hiking to the ancient Cedars of God in Jaj, Mount Lebanon. Trail details, historical chapel sites, and nearby camping.",
      author: "Lebanon Hiking Trail Guide",
      date: "June 4, 2026",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
      slug: "hiking-jaj-cedars-reserve",
    },
    {
      title: "Glamping Cabins vs Ground Camping in Lebanon: Which Suits You Best?",
      excerpt:
        "Undecided between wooden cabin glamping and traditional tent camping in Lebanon? Compare comfort, setup effort, prices, and amenities at Skylight Village Jaj.",
      author: "Joe (Skylight Management)",
      date: "June 8, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop",
      slug: "glamping-vs-traditional-camping-lebanon",
    },
    {
      title: "The Ultimate Guide to Stargazing & Astrophotography in Mount Lebanon",
      excerpt:
        "Why the unpolluted, high-altitude skies of Jaj at 1,200 meters offer the absolute best conditions to witness meteor showers and capture the Milky Way in Lebanon.",
      author: "Astronomy Club Guest Writer",
      date: "June 1, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop",
      slug: "stargazing-mount-lebanon",
    },
    {
      title: "Traditional Lebanese BBQ & Outdoor Dining Guide in Jaj, Mount Lebanon",
      excerpt:
        "Discover the art of outdoor Lebanese charcoal grilling and open-air mountain dining in Jaj. Learn about prefilled BBQ grill rentals, firewood bonfires, and on-site restaurant service.",
      author: "Skylight Culinary Team",
      date: "June 2, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
      slug: "lebanese-bbq-outdoor-dining-jaj",
    },
    {
      title: "Scout Troop & Youth Group Camping Guide in Mount Lebanon",
      excerpt:
        "Essential group guidelines, campfire configurations, and spring water access for scout troop assemblies in Jaj, Mount Lebanon at Skylight Village.",
      author: "Skylight Scout Liaison",
      date: "May 20, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800&auto=format&fit=crop",
      slug: "scout-campsites-guideline",
    },
    {
      title: "Best Camping Spots in Lebanon: From Coastal Byblos to Jaj High Altitude",
      excerpt:
        "A complete guide to the best camping grounds in Lebanon. Learn about tent setups, wooden cabins, day picnic table rentals, and stargazing in Jaj, Mount Lebanon.",
      author: "Lebanon Travel Editor",
      date: "May 15, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop",
      slug: "best-camping-spots-in-lebanon",
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      <Navbar />

      <section className="relative py-24 px-4 md:px-8 bg-[#071308] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15)_0%,transparent_70%)] z-0" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Lebanon Outdoor &amp; Travel Guides</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight">
            The Skylight Wilderness Blog
          </h1>
          <div className="w-12 h-1 bg-amber-400 mx-auto mt-4 mb-6" />
          <p className="text-slate-300 font-light text-sm max-w-xl mx-auto leading-relaxed">
            Local travel guides, attractions in Jaj, hiking trails near Jaj Cedar Reserve, day picnic tips near Jbeil, and stargazing insights from Mount Lebanon.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, idx) => (
            <article
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-xl text-[#071308] group-hover:text-emerald-900 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs text-slate-600 font-light leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5 flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">
                    Lebanese Outdoors
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="px-5 py-2.5 bg-[#071308] hover:bg-emerald-900 text-amber-300 font-display font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span>Read Guide</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
