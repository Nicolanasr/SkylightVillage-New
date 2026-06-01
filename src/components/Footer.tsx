import React from "react";
import Link from "next/link";
import { Tent, Phone, Mail, MapPin, Star, Heart } from "lucide-react";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="w-full bg-[#0d1c0e] text-[#fafbfa] pt-16 pb-8 border-t border-skylight-green/30 mt-auto">
            <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-skylight-green/10 pb-12">
                {/* Brand */}
                <div className="flex flex-col space-y-4">

                    <Image
                        src="/images/Skylight-logo-white.png"
                        alt="Skylight Village Logo"
                        width={175}
                        height={100}
                        className="opacity-80"
                    />
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                        Escape to 1,200m altitude in Jaj, Mount Lebanon. Gather around the fire, sleep beneath the starry sky, and disconnect in nature.
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-skylight-gold font-semibold pt-1">
                        <Star className="w-4 h-4 fill-skylight-gold text-skylight-gold" />
                        <span>Stargazing Sanctuary</span>
                    </div>
                </div>

                {/* Navigation Quick Links */}
                <div>
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-skylight-gold mb-4">
                        Quick Links
                    </h4>
                    <ul className="space-y-3.5 text-xs text-gray-400 font-medium uppercase tracking-wider">
                        <li>
                            <Link href="/stay" className="hover:text-white transition-colors">
                                Stay & Campsites
                            </Link>
                        </li>
                        <li>
                            <Link href="/restaurant" className="hover:text-white transition-colors">
                                Restaurant Menu
                            </Link>
                        </li>
                        <li>
                            <Link href="/gallery" className="hover:text-white transition-colors">
                                Scenic Gallery
                            </Link>
                        </li>
                        <li>
                            <Link href="/blog" className="hover:text-white transition-colors">
                                Articles & Blog
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Contact info */}
                <div>
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-skylight-gold mb-4">
                        Find Us
                    </h4>
                    <ul className="space-y-3.5 text-xs text-gray-400">
                        <li className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-skylight-gold flex-shrink-0 pt-0.5" />
                            <span className="leading-relaxed">Jaj, Mount Lebanon, Lebanon (Altitude 1,200m)</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-skylight-gold flex-shrink-0" />
                            <span>+961 76 987654</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-skylight-gold flex-shrink-0" />
                            <span>info@skylightvillagelb.com</span>
                        </li>
                    </ul>
                </div>

                {/* Scout & Campsite info */}
                <div>
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-skylight-gold mb-4">
                        Scouts & Gatherings
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-light mb-4">
                        We feature two dedicated scout sectors (Zone 1 & 2) mapped for large campfire events, assemblies, and team building. Contact us for group discounts.
                    </p>
                    <Link
                        href="/contact"
                        className="text-xs font-semibold text-skylight-gold border-b border-skylight-gold pb-0.5 hover:text-white hover:border-white transition-colors"
                    >
                        INQUIRE FOR GROUP EVENTS
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 font-light">
                <p>© {new Date().getFullYear()} Skylight Village Jaj. All Rights Reserved.</p>
                <p className="flex items-center gap-1 mt-4 md:mt-0">
                    Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for nature lovers in Mount Lebanon.
                </p>
            </div>
        </footer>
    );
}
