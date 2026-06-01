"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Amazing experience! The mountains, the staff, and the absolute tranquility are unmatched. Everything was perfect down to the smallest detail.",
    author: "Alex P.",
    role: "Outdoor Enthusiast",
    avatar: "https://picsum.photos/seed/alex/120/120",
    rating: 5
  },
  {
    text: "Loved the stargazing nights! Staring up at the clear mountain sky from our deck was unforgettable. Highly recommend for a family getaway.",
    author: "Maya L.",
    role: "Family Adventurer",
    avatar: "https://picsum.photos/seed/maya/120/120",
    rating: 5
  },
  {
    text: "Best camping and glamping spot I've ever visited. The facilities are absolutely top‑notch, combining rugged nature with premium luxury.",
    author: "Samir K.",
    role: "Frequent Camper",
    avatar: "https://picsum.photos/seed/samir/120/120",
    rating: 5
  }
];

export default function TestimonialSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.clientWidth, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.clientWidth, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 px-4 md:px-8 bg-skylight-green-light/20 relative overflow-hidden">
      {/* Background soft ambient glows */}
      <div className="absolute top-1/4 left-[10%] w-96 h-96 bg-skylight-green-light/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-skylight-gold/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-5xl text-center">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-skylight-green-light border border-skylight-green/10 text-skylight-green text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
            ✨ Guest Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-skylight-green mb-4 tracking-tight">
            What Our Guests Say
          </h2>
          <div className="w-16 h-1.5 bg-skylight-gold rounded-full mb-4"></div>
          <p className="text-base md:text-lg text-gray-600 font-light max-w-2xl leading-relaxed">
            Hear stories from adventurers who fell in love with our mountain haven and premium glamping retreats.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative px-4 md:px-12">
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 scrollbar-none py-6 px-2"
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="flex-none w-full max-w-md snap-center bg-white rounded-3xl p-8 shadow-md border border-skylight-green/10 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Decorative Quote Icon */}
                <div className="absolute right-6 top-6 text-skylight-green-light/20">
                  <Quote className="w-16 h-16 transform rotate-180" />
                </div>

                <div className="relative z-10">
                  {/* Star Rating & Value Badge */}
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className="w-4 h-4 fill-skylight-gold text-skylight-gold"
                      />
                    ))}
                    <span className="text-[10px] font-bold text-skylight-gold ml-2 bg-skylight-gold/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {t.rating.toFixed(1)} Rating
                    </span>
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-gray-700 italic text-base leading-relaxed mb-6 font-light text-left pr-4">
                    “{t.text}”
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 mt-auto pt-5 border-t border-gray-100 relative z-10">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-12 h-12 rounded-full border-2 border-skylight-green/20 object-cover shadow-sm"
                  />
                  <div className="text-left">
                    <h4 className="font-bold text-skylight-green text-sm">{t.author}</h4>
                    <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 bg-white border border-skylight-green/10 rounded-full p-3 shadow-lg hover:bg-skylight-gold hover:text-skylight-dark text-skylight-green transition-all hover:scale-110 active:scale-95 z-20"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 bg-white border border-skylight-green/10 rounded-full p-3 shadow-lg hover:bg-skylight-gold hover:text-skylight-dark text-skylight-green transition-all hover:scale-110 active:scale-95 z-20"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
