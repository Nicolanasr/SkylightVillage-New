import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Info, MapPin, ShieldCheck, Heart, Users, Compass, Eye, ShieldAlert } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Our Wilderness Story
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            About Skylight Village
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Discover the legacy of our mountaintop sanctuary in Jaj, Mount Lebanon. Mapped for adventure, tranquility, and community gatherings.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-skylight-green">
              Born from a Love of Mountains & Community
            </h2>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Skylight Village was founded as a pristine escape nestled among Jaj's legendary mountaintops. Mapped at 1,200 meters above sea level, our location enjoys zero light pollution and crisp, cooling alpine air, making it Mount Lebanon's absolute best stargazing campsite.
            </p>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Our passion is hosting groups who share a reverence for nature—from scouts seeking clean campsites for campfire drill assemblies, to families and solo campers wanting to experience premium wood tents without dealing with tedious setup.
            </p>
          </div>

          <div className="glassmorphic p-8 rounded-3xl border border-skylight-green/10 shadow-xl space-y-6">
            <div className="flex gap-4">
              <div className="octagon-clip bg-skylight-green p-3.5 text-skylight-gold flex-shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-skylight-green">
                  Outdoor Access
                </h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed mt-1">
                  Immediate connection to the Jaj hiking trails, ancient cedar forests, and scenic peaks of Mount Lebanon.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="octagon-clip bg-skylight-green p-3.5 text-skylight-gold flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-skylight-green">
                  Scout Heritage
                </h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed mt-1">
                  Featuring 2 dedicated scout sectors designed for safe gatherings, campfire structures, toilet access, and fresh spring water.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="octagon-clip bg-skylight-green p-3.5 text-skylight-gold flex-shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-skylight-green">
                  Upcoming Adventure
                </h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed mt-1">
                  We are expanding! Soon featuring extreme games, rope monkey bars, professional zip lines, and mountain obstacle trails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Core */}
      <section className="bg-skylight-green-light/40 py-20 px-4 md:px-8 border-t border-skylight-green/5">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-green uppercase">
            Conservation & Comfort
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-skylight-green mt-2 mb-12">
            Pillars of the Skylight Experience
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-skylight-green rounded-full flex items-center justify-center text-skylight-gold mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-sm text-skylight-green uppercase tracking-wide">
                Hygienic Toilets & Showers
              </h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Comfortable sanitary installations with running hot water, providing comfort in the heart of raw nature.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-skylight-green rounded-full flex items-center justify-center text-skylight-gold mx-auto shadow-md">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-sm text-skylight-green uppercase tracking-wide">
                Natural Spring Water
              </h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Our site feeds from fresh local spring water reservoirs, filtered and available for campers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-skylight-green rounded-full flex items-center justify-center text-skylight-gold mx-auto shadow-md">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-sm text-skylight-green uppercase tracking-wide">
                Eco Responsibility
              </h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                We strictly enforce "leave no trace" ethics to protect forest critters, local trees, and alpine ecology.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
