"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Menu, X, Tent, Phone, MapPin, ImageIcon, Info, BookOpen, ForkKnife } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 w-full glassmorphic border-b border-skylight-green/10 text-skylight-dark">
            <div className="container mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="/images/Skylight-logo-white.png"
                        alt="Skylight Village Logo"
                        width={175}
                        height={100}
                        className="filter invert-100"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex space-x-7 items-center text-xs font-semibold uppercase tracking-widest text-skylight-green">
                    <Link href="/stay" className="hover:text-skylight-gold transition-colors flex items-center gap-1">
                        <Tent className="w-3.5 h-3.5" /> Stay
                    </Link>
                    <Link href="/restaurant" className="hover:text-skylight-gold transition-colors flex items-center gap-1">
                        <ForkKnife className="w-3.5 h-3.5" /> Restaurant
                    </Link>
                    <Link href="/gallery" className="hover:text-skylight-gold transition-colors flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> Gallery
                    </Link>
                    <Link href="/blog" className="hover:text-skylight-gold transition-colors flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Blog
                    </Link>
                    <Link href="/about" className="hover:text-skylight-gold transition-colors flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> About
                    </Link>
                    <Link href="/contact" className="hover:text-skylight-gold transition-colors flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Contact
                    </Link>
                    <Link
                        href="/stay"
                        className="premium-btn bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark transition-all duration-300 px-6 py-2.5 inline-block font-display font-bold tracking-widest text-[10px] hover:-translate-y-0.5"
                    >
                        BOOK NOW
                    </Link>
                </nav>

                {/* Mobile Hamburger Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden p-2 text-skylight-green hover:text-skylight-gold transition-all"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 glassmorphic border-b border-skylight-green/10 p-5 animate-fade-in shadow-xl">
                    <nav className="flex flex-col space-y-4 font-display font-semibold uppercase tracking-wider text-sm text-skylight-green text-center">
                        <Link onClick={() => setIsOpen(false)} href="/stay" className="py-2 hover:text-skylight-gold transition-colors">
                            Stay & Campgrounds
                        </Link>
                        <Link onClick={() => setIsOpen(false)} href="/restaurant" className="py-2 hover:text-skylight-gold transition-colors">
                            Restaurant & Menus
                        </Link>
                        <Link onClick={() => setIsOpen(false)} href="/gallery" className="py-2 hover:text-skylight-gold transition-colors">
                            Scenic Gallery
                        </Link>
                        <Link onClick={() => setIsOpen(false)} href="/blog" className="py-2 hover:text-skylight-gold transition-colors">
                            Village Blog
                        </Link>
                        <Link onClick={() => setIsOpen(false)} href="/about" className="py-2 hover:text-skylight-gold transition-colors">
                            Our Story
                        </Link>
                        <Link onClick={() => setIsOpen(false)} href="/contact" className="py-2 hover:text-skylight-gold transition-colors">
                            Get in Touch
                        </Link>
                        <Link
                            onClick={() => setIsOpen(false)}
                            href="/stay"
                            className="premium-btn bg-skylight-green text-white font-bold py-3 hover:bg-skylight-gold hover:text-skylight-dark transition-all text-xs tracking-widest block w-full mt-2"
                        >
                            BOOK RESERVATIONS
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
