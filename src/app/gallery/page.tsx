import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Camera, Image as ImageIcon, Sparkles, MapPin } from "lucide-react";

export default function GalleryPage() {
  const images = [
    {
      title: "Cozy Wood Tent Setup",
      category: "Campsites",
      url: "https://picsum.photos/seed/gallery1/800/600",
      desc: "Our pre-assembled wood tents located inside the pine forest boundaries.",
    },
    {
      title: "Central Lodge Fireplace",
      category: "Restaurant",
      url: "https://picsum.photos/seed/gallery2/800/600",
      desc: "The warm, crackling brick fireplace where guests gather for stories.",
    },
    {
      title: "Scout Camping Assembly",
      category: "Scouts",
      url: "https://picsum.photos/seed/gallery3/800/600",
      desc: "Zone 1 campgrounds packed with active scout campfire structures.",
    },
    {
      title: "Stargazing Meteor Shower Peak",
      category: "Astronomy",
      url: "https://picsum.photos/seed/gallery4/800/600",
      desc: "A breathtaking crystal-clear evening capturing the Milky Way over Jaj peaks.",
    },
    {
      title: "Terrace Dining at 1,200m",
      category: "Restaurant",
      url: "https://picsum.photos/seed/gallery5/800/600",
      desc: "Sipping golden beer and traditional arak with panoramic valley views.",
    },
    {
      title: "Valley Cedar Hiking Trail",
      category: "Nature",
      url: "https://picsum.photos/seed/gallery6/800/600",
      desc: "Lush green cedar paths direct from the village campsite border.",
    },
  ];

  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Captured Moments
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            Scenic Village Gallery
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Browse snapshots of octagonal wood layouts, majestic bonfire setups, starry skies, and community gatherings in Jaj, Mount Lebanon.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-skylight-green/10 shadow-md hover-lift overflow-hidden"
              >
                {/* Visual image element with picsum.photos */}
                <div className="relative aspect-video overflow-hidden">
                  <img src={img.url} alt={img.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-skylight-dark to-transparent z-10" />
                  <div className="absolute top-3 left-3 z-20 bg-skylight-green/90 text-skylight-gold text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {img.category}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display font-bold text-sm text-skylight-green mb-1 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-skylight-gold" />
                    {img.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                    {img.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[9px] text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-skylight-gold" />
                    <span>Jaj Campgrounds, Lebanon</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User Image Invitation */}
          <div className="mt-16 bg-skylight-green-light/40 p-8 rounded-3xl border border-skylight-green/10 text-center max-w-2xl mx-auto space-y-4">
            <Sparkles className="w-6 h-6 text-skylight-gold mx-auto animate-pulse" />
            <h3 className="font-display font-extrabold text-lg text-skylight-green">
              Share Your Skylight Memories!
            </h3>
            <p className="text-xs text-gray-600 font-light max-w-md mx-auto leading-relaxed">
              Did you capture an incredible shooting star, a scout campfire gathering, or a wood-fired grill platter? Tag us on Instagram <span className="font-semibold text-skylight-green">@skylightvillage</span> to get featured in our seasonal catalog!
            </p>
            <a
              href="https://www.instagram.com/skylightvillage/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-semibold text-skylight-green border-b border-skylight-green pb-0.5 hover:text-skylight-gold hover:border-skylight-gold transition-colors"
            >
              FOLLOW US ON INSTAGRAM
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
