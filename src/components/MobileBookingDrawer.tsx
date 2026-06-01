// components/MobileBookingDrawer.tsx
'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import StayBookingForm from './StayBookingForm';

interface Addon {
    id: string;
    name: string;
    price: number;
    priceType: string;
}

interface Accommodation {
    id: string;
    name: string;
    type: string;
    pricingType: string;
    basePrice: number;
    minCapacity: number;
    maxCapacity: number;
    addons: Addon[];
}

interface Props {
    accommodation: Accommodation;
    initialStartDate?: string;
    initialGuests?: string;
}

export default function MobileBookingDrawer({
    accommodation,
    initialStartDate,
    initialGuests,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Bottom Sticky Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-5 py-3 flex items-center justify-between">
                <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                        Reserve Stay
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-display font-extrabold text-skylight-green">
                            ${accommodation.basePrice.toFixed(0)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-light">
                            {accommodation.pricingType === "PER_PERSON_PER_DAY"
                                ? "/person/day"
                                : accommodation.pricingType === "PER_PERSON_PER_NIGHT"
                                    ? "/person/night"
                                    : "/unit/night"}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-[10px] tracking-widest px-6 py-3.5 transition-colors cursor-pointer border-0 shadow-md flex items-center gap-1.5"
                >
                    <Calendar className="w-3.5 h-3.5" />
                    BOOK NOW
                </button>
            </div>

            {/* Spacer to prevent page content from being clipped by the bottom sticky bar */}
            <div className="lg:hidden h-20 w-full" />

            {/* Slide-Up Bottom Sheet Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-end"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white w-full rounded-t-3xl shadow-2xl border-t border-skylight-green/10 flex flex-col animate-slide-up max-h-[88vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Pull Bar Indicator */}
                        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
                            <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        </div>

                        {/* Fixed header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <div>
                                <span className="text-[9px] font-bold text-skylight-gold uppercase tracking-widest">Reserve Stay</span>
                                <h3 className="font-display font-extrabold text-base text-skylight-green leading-tight">
                                    {accommodation.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-0 cursor-pointer transition-colors text-gray-400 hover:text-skylight-green flex-shrink-0"
                                aria-label="Close booking form"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 px-5 py-4 pb-safe-bottom">
                            <StayBookingForm
                                accommodation={accommodation}
                                initialStartDate={initialStartDate}
                                initialGuests={initialGuests}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
