"use client";

import React, { useState, useEffect } from "react";
import { createStayBooking } from "@/app/actions";
import CustomDatePicker from "./CustomDatePicker";
import CustomDropdown from "./CustomDropdown";
import { ShoppingBag, AlertTriangle, CheckCircle2, User, Mail, Phone, Loader2, Users } from "lucide-react";

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
    nightThresholdEnabled?: boolean;
    nightThreshold?: number;
}

interface StayBookingFormProps {
    accommodation: Accommodation;
    initialStartDate?: string;
    initialGuests?: string;
}

export default function StayBookingForm({
    accommodation,
    initialStartDate,
    initialGuests,
}: StayBookingFormProps) {
    const [startDate, setStartDate] = useState(initialStartDate || "2026-06-15");
    const [endDate, setEndDate] = useState(() => {
        const start = initialStartDate || "2026-06-15";
        const d = new Date(start);
        d.setDate(d.getDate() + 2);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    });
    const [peopleCount, setPeopleCount] = useState(() => {
        if (initialGuests) {
            const g = parseInt(initialGuests);
            if (!isNaN(g)) {
                return Math.max(accommodation.minCapacity, Math.min(accommodation.maxCapacity, g));
            }
        }
        return accommodation.type === "SCOUT_ZONE" ? accommodation.minCapacity : 2;
    });
    const [selectedAddons, setSelectedAddons] = useState<{ addonId: string; quantity: number }[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [fullDailyPrice, setFullDailyPrice] = useState(0);
    const [isNightlyDiscount, setIsNightlyDiscount] = useState(false);

    // Calculate live pricing with night-threshold support
    useEffect(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        const duration = durationDays >= 0 ? durationDays + 1 : 1;

        // Night threshold: if enabled and duration >= threshold, charge for (duration-1) nights
        const useNightlyRate =
            accommodation.nightThresholdEnabled &&
            duration >= (accommodation.nightThreshold ?? 5);
        const billableUnits = useNightlyRate ? duration - 1 : duration;

        let baseCost = 0;
        if (accommodation.pricingType === "PER_PERSON_PER_DAY" || accommodation.pricingType === "PER_PERSON_PER_NIGHT") {
            baseCost = accommodation.basePrice * peopleCount * billableUnits;
        } else {
            baseCost = accommodation.basePrice * billableUnits;
        }

        // Also compute full daily total for strikethrough display
        let fullDailyCost = 0;
        if (accommodation.pricingType === "PER_PERSON_PER_DAY" || accommodation.pricingType === "PER_PERSON_PER_NIGHT") {
            fullDailyCost = accommodation.basePrice * peopleCount * duration;
        } else {
            fullDailyCost = accommodation.basePrice * duration;
        }

        let addonsCost = 0;
        selectedAddons.forEach((sel) => {
            const match = accommodation.addons.find((a) => a.id === sel.addonId);
            if (match) {
                const itemCost =
                    match.priceType === "PER_NIGHT"
                        ? match.price * sel.quantity * billableUnits
                        : match.price * sel.quantity;
                addonsCost += itemCost;
            }
        });

        setCalculatedPrice(baseCost + addonsCost);
        setFullDailyPrice(fullDailyCost + addonsCost);
        setIsNightlyDiscount(useNightlyRate ?? false);
    }, [accommodation, startDate, endDate, peopleCount, selectedAddons]);

    const toggleAddon = (addonId: string) => {
        setSelectedAddons((prev) => {
            const exists = prev.find((a) => a.addonId === addonId);
            if (exists) {
                return prev.filter((a) => a.addonId !== addonId);
            } else {
                return [...prev, { addonId, quantity: 1 }];
            }
        });
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);

        if (accommodation.type === "SCOUT_ZONE" && peopleCount < accommodation.minCapacity) {
            setErrorMsg(`Scout campground reservations require a minimum of ${accommodation.minCapacity} people. Your current selection is ${peopleCount}.`);
            setIsSubmitting(false);
            return;
        }

        const res = await createStayBooking({
            accommodationId: accommodation.id,
            customerName: (e.target as any).customerName.value,
            customerEmail: (e.target as any).customerEmail.value || undefined,
            customerPhone: (e.target as any).customerPhone.value,
            groupName: (e.target as any).groupName?.value || undefined,
            startDate,
            endDate,
            peopleCount,
            addonSelections: selectedAddons,
        });

        setIsSubmitting(false);
        if (res.success) {
            setBookingSuccess(true);
        } else {
            setErrorMsg(res.error || "Failed to submit booking.");
        }
    };

    if (bookingSuccess) {
        return (
            <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-skylight-green mx-auto" />
                <h3 className="font-display font-extrabold text-2xl text-skylight-green">
                    Stay Reserved!
                </h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed max-w-sm mx-auto">
                    Your reservation for <span className="font-bold text-skylight-green">{accommodation.name}</span> is confirmed. Total estimated checkout price: <span className="font-bold text-skylight-green">${calculatedPrice.toFixed(2)}</span>.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
                <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-1">
                    Reserve Booking
                </span>
                <h3 className="font-display font-extrabold text-lg text-skylight-green">
                    Book {accommodation.name}
                </h3>
            </div>

            {errorMsg && (
                <div className="flex gap-2 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs font-semibold leading-relaxed">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Custom Picker */}
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                        Select Stay Dates
                    </label>
                    <CustomDatePicker
                        accommodationId={accommodation.id}
                        accommodationType={accommodation.type}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(start, end) => {
                            setStartDate(start);
                            setEndDate(end);
                        }}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                        Guest Count
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPeopleCount(Math.max(accommodation.minCapacity, peopleCount - 1))}
                            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            -
                        </button>
                        <div className="flex-1 text-center p-2.5 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-bold text-skylight-green flex items-center justify-center gap-1.5">
                            <User className="w-4 h-4 text-skylight-gold" />
                            <span>{peopleCount} Guest{peopleCount > 1 ? "s" : ""}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPeopleCount(Math.min(accommodation.maxCapacity, peopleCount + 1))}
                            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            +
                        </button>
                    </div>
                    <span className="block text-[9px] text-gray-400 mt-1.5 font-light text-right">
                        Capacity: {accommodation.minCapacity} - {accommodation.maxCapacity} Guests
                    </span>
                </div>
            </div>

            {/* Addons Selection Block */}
            {accommodation.addons.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-3 flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-skylight-gold" />
                        Campsite selections & addons:
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                        {accommodation.addons.map((a) => {
                            const isSelected = selectedAddons.some((sel) => sel.addonId === a.id);
                            return (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => toggleAddon(a.id)}
                                    className={`p-3 text-left rounded-xl border text-xs flex justify-between items-center transition-all ${isSelected
                                            ? "bg-skylight-green-light border-skylight-green text-skylight-green font-semibold"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-[#fafbfa]"
                                        }`}
                                >
                                    <span>{a.name}</span>
                                    <span className="font-bold text-skylight-green">${a.price} {a.priceType === "PER_NIGHT" ? "/nt" : ""}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Contact coordinates */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green">
                    Contact info:
                </span>
                <div className="space-y-3">
                    {accommodation.type === "SCOUT_ZONE" && (
                        <div className="relative">
                            <Users className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                            <input
                                type="text"
                                name="groupName"
                                placeholder="Scout Group Name (e.g. GSS Jounieh) (Optional)"
                                className="w-full p-3 pl-9 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <User className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                        <input
                            required
                            type="text"
                            name="customerName"
                            placeholder="Elie Haddad"
                            className="w-full p-3 pl-9 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                        <input
                            type="email"
                            name="customerEmail"
                            placeholder="elie@haddad.com (Optional)"
                            className="w-full p-3 pl-9 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                        <input
                            required
                            type="text"
                            name="customerPhone"
                            placeholder="+961 70 123456"
                            className="w-full p-3 pl-9 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                        />
                    </div>
                </div>
            </div>

            {/* Submit booking block */}
            <div className="border-t border-gray-100 pt-5 flex items-center justify-between gap-4 bg-[#fafbfa] -mx-6 -mb-6 p-6 rounded-b-3xl">
                <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                        Total Cost:
                    </span>
                    {isNightlyDiscount && (
                        <span className="block text-xs text-gray-400 line-through">
                            ${fullDailyPrice.toFixed(2)}
                        </span>
                    )}
                    <span className="text-2xl font-display font-extrabold text-skylight-green">
                        ${calculatedPrice.toFixed(2)}
                    </span>
                    {isNightlyDiscount && (
                        <span className="block text-[9px] text-emerald-600 font-bold mt-0.5">
                            🏷️ Nightly rate discount applied
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 max-w-[200px] flex items-center justify-center gap-1.5 bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-extrabold text-[10px] tracking-widest py-3.5 rounded-xl shadow-lg transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "CONFIRM BOOKING"}
                </button>
            </div>
        </form>
    );
}
