import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, User, Calendar, Clock, ChevronRight } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      title: "The Ultimate Guide to Stargazing in Mount Lebanon",
      excerpt: "Why the unpolluted, high-altitude skies of Jaj at 1,200 meters offer the absolute best conditions to witness the Perseids meteor showers and capture the Milky Way.",
      author: "Astronomy Club Guest Writer",
      date: "June 1, 2026",
      readTime: "5 min read",
      slug: "stargazing-mount-lebanon",
    },
    {
      title: "Scout Campsites: Safety & Drill Preparation in Jaj",
      excerpt: "Essential packing guidelines, campfire configurations, and spring water hygiene checks to ensure scout troop assemblies run smoothly and sustainably in Mount Lebanon.",
      author: "Rita (Skylight Management)",
      date: "May 20, 2026",
      readTime: "7 min read",
      slug: "scout-campsites-guideline",
    },
    {
      title: "Wood Tents vs Ground Sleeping: Why Glamping Wins",
      excerpt: "Love the crackle of a mountain bonfire but hate waking up on rocky soil? Read how our octagonal wood tents combine raw nature with dry, comfortable bedding.",
      author: "Joe (Skylight Team)",
      date: "May 12, 2026",
      readTime: "4 min read",
      slug: "wood-tents-vs-ground",
    },
  ];

  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Mountain Guides & Articles
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            The Skylight Blog
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Get peak SEO-optimized guides on stargazing, campsite packing lists, scout organization, and hiking maps direct from Mount Lebanon.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl space-y-12">
          {posts.map((post, idx) => (
            <article
              key={idx}
              className="bg-white rounded-3xl border border-skylight-green/10 shadow-lg p-6 md:p-8 hover-lift flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-skylight-gold" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-skylight-gold" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-skylight-gold" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="font-display font-extrabold text-xl md:text-2xl text-skylight-green leading-tight">
                  {post.title}
                </h2>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-6 flex justify-between items-center">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-skylight-green uppercase tracking-widest">
                  <BookOpen className="w-4 h-4 text-skylight-gold" />
                  Lebanese Outdoors Guide
                </span>
                <button
                  className="text-xs text-skylight-gold hover:text-skylight-green font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  Read Full Article <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
