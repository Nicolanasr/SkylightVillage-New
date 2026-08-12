"use client";

import React, { useState, useEffect } from "react";
import { createStayBooking } from "@/app/actions";
import CustomDatePicker from "./CustomDatePicker";
import CustomDropdown from "./CustomDropdown";
import WhatsAppIcon from "./WhatsAppIcon";
import { getNewStayAdminNotificationLink } from "@/lib/whatsapp";
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
    const getTodayStr = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const getTomorrowStr = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const [startDate, setStartDate] = useState(() => {
        if (initialStartDate) return initialStartDate;
        return getTodayStr();
    });

    const [endDate, setEndDate] = useState(() => {
        if (accommodation.type === "PICNIC_DAY") {
            return initialStartDate || getTodayStr();
        }
        if (initialStartDate) {
            const d = new Date(initialStartDate);
            d.setDate(d.getDate() + 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        }
        return getTomorrowStr();
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
    const [lastSubmittedData, setLastSubmittedData] = useState<{ customerName: string; customerPhone: string } | null>(null);
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [fullDailyPrice, setFullDailyPrice] = useState(0);
    const [isNightlyDiscount, setIsNightlyDiscount] = useState(false);

    // Calculate live pricing with night-threshold support
    useEffect(() => {
        let duration = 1;
        if (accommodation.type !== "PICNIC_DAY" && endDate && endDate > startDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
            duration = durationDays > 0 ? durationDays : 1;
        }

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

    const updateAddonQty = (addonId: string, delta: number) => {
        setSelectedAddons((prev) => {
            const existing = prev.find((a) => a.addonId === addonId);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + delta;
            if (newQty <= 0) {
                return prev.filter((a) => a.addonId !== addonId);
            } else {
                if (existing) {
                    return prev.map((a) => (a.addonId === addonId ? { ...a, quantity: newQty } : a));
                } else {
                    return [...prev, { addonId, quantity: newQty }];
                }
            }
        });
    };

    const getAddonQty = (addonId: string) => {
        const match = selectedAddons.find((a) => a.addonId === addonId);
        return match ? match.quantity : 0;
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

        const name = (e.target as any).customerName.value;
        const phone = (e.target as any).customerPhone.value;
        setLastSubmittedData({ customerName: name, customerPhone: phone });

        const res = await createStayBooking({
            accommodationId: accommodation.id,
            customerName: name,
            customerEmail: (e.target as any).customerEmail.value || undefined,
            customerPhone: phone,
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
            <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-skylight-green mx-auto animate-bounce" />
                <h3 className="font-display font-extrabold text-2xl text-skylight-green">
                    Stay Reserved!
                </h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed max-w-sm mx-auto">
                    Thank you! Your reservation for <span className="font-bold text-skylight-green">{accommodation.name}</span> has been logged. Total estimated checkout price: <span className="font-bold text-skylight-green">${calculatedPrice.toFixed(2)}</span>.
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                    Our team in Jaj will review your booking and send you a confirmation message shortly.
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

            {/* Addons Selection Block with Quantity Selectors */}
            {accommodation.addons.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-3 flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-skylight-gold" />
                        Gear &amp; Equipment Rental Addons:
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                        {accommodation.addons.map((a) => {
                            const qty = getAddonQty(a.id);
                            return (
                                <div
                                    key={a.id}
                                    className={`p-3.5 rounded-2xl border text-xs flex justify-between items-center transition-all ${
                                        qty > 0
                                            ? "bg-amber-50/80 border-amber-300 text-slate-800 shadow-sm"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-[#fafbfa]"
                                    }`}
                                >
                                    <div className="pr-2">
                                        <span className="font-bold text-skylight-green block">{a.name}</span>
                                        <span className="text-[10px] text-slate-500 font-semibold">
                                            ${a.price.toFixed(2)} {a.priceType === "PER_NIGHT" ? "/night" : ""}
                                        </span>
                                    </div>

                                    {/* Quantity Counter Controls */}
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => updateAddonQty(a.id, -1)}
                                            className="w-7 h-7 rounded-lg bg-white font-extrabold text-xs text-slate-700 shadow-xs hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer border-0"
                                        >
                                            -
                                        </button>
                                        <span className="w-5 text-center font-extrabold text-xs text-skylight-green">{qty}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateAddonQty(a.id, 1)}
                                            className="w-7 h-7 rounded-lg bg-skylight-green font-extrabold text-xs text-white shadow-xs hover:bg-emerald-800 transition-colors flex items-center justify-center cursor-pointer border-0"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
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
