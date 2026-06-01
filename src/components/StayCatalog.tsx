"use client";

import React, { useState, useEffect } from "react";
import { createStayBooking } from "@/app/actions";
import { Tent, Star, AlertTriangle, CheckCircle2, ShoppingBag, Calendar, Users, Phone, Mail, User } from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";
import CustomDropdown from "./CustomDropdown";
import Link from "next/link";

interface Addon {
    id: string;
    name: string;
    price: number;
    priceType: string;
}

interface Accommodation {
    id: string;
    slug: string;
    name: string;
    type: string;
    pricingType: string;
    basePrice: number;
    minCapacity: number;
    maxCapacity: number;
    addons: Addon[];
}

interface SerializedBooking {
    accommodationId: string;
    startDate: string;
    endDate: string;
}

interface Props {
    accommodations: Accommodation[];
    bookings?: SerializedBooking[];
    initialType?: string;
    initialStartDate?: string;
    initialGuests?: string;
}

export default function StayCatalog({
    accommodations,
    bookings = [],
    initialType,
    initialStartDate,
    initialGuests
}: Props) {
    const [selectedAcc, setSelectedAcc] = useState<Accommodation | null>(null);

    // Applied URL-synced filter states
    const [filterType, setFilterType] = useState(initialType || "ALL");
    const [filterGuests, setFilterGuests] = useState(initialGuests ? parseInt(initialGuests) : 2);
    const [filterStartDate, setFilterStartDate] = useState(initialStartDate || "2026-06-15");

    // UI Draft states (before applying) - allowing empty string "" so they can delete the box!
    const [draftType, setDraftType] = useState(initialType || "ALL");
    const [draftGuests, setDraftGuests] = useState<number | string>(initialGuests ? parseInt(initialGuests) : 2);
    const [draftStartDate, setDraftStartDate] = useState(initialStartDate || "2026-06-15");

    const [startDate, setStartDate] = useState(initialStartDate || "2026-06-15");
    const [endDate, setEndDate] = useState("2026-06-17");
    const [peopleCount, setPeopleCount] = useState(initialGuests ? parseInt(initialGuests) : 2);
    const [selectedAddons, setSelectedAddons] = useState<{ addonId: string; quantity: number }[]>([]);

    // Keep drafts in sync when page loads or search parameters change
    useEffect(() => {
        if (initialType) {
            setFilterType(initialType);
            setDraftType(initialType);
        }
        if (initialGuests) {
            const g = parseInt(initialGuests);
            setFilterGuests(g);
            setDraftGuests(g);
        }
        if (initialStartDate) {
            setFilterStartDate(initialStartDate);
            setDraftStartDate(initialStartDate);
        }
    }, [initialType, initialStartDate, initialGuests]);

    const handleApplyFilters = () => {
        setFilterType(draftType);
        const guestsNum = typeof draftGuests === "string" && draftGuests === "" ? 2 : Number(draftGuests);
        setFilterGuests(guestsNum);
        setFilterStartDate(draftStartDate);
    };

    const handleResetFilters = () => {
        setDraftType("ALL");
        setDraftGuests(2);
        setDraftStartDate("2026-06-15");
        setFilterType("ALL");
        setFilterGuests(2);
        setFilterStartDate("2026-06-15");
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [calculatedPrice, setCalculatedPrice] = useState(0);

    // Sync state changes to browser URL query parameters in real-time
    useEffect(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (filterType !== "ALL") {
                url.searchParams.set("type", filterType);
            } else {
                url.searchParams.delete("type");
            }

            if (filterGuests > 1) {
                url.searchParams.set("guests", String(filterGuests));
            } else {
                url.searchParams.delete("guests");
            }

            if (filterStartDate) {
                url.searchParams.set("startDate", filterStartDate);
            } else {
                url.searchParams.delete("startDate");
            }

            window.history.replaceState(null, "", url.pathname + url.search);
        }
    }, [filterType, filterGuests, filterStartDate]);

    // Keep active booking values fully synchronized with filter updates
    useEffect(() => {
        setStartDate(filterStartDate);
        const d = new Date(filterStartDate);
        d.setDate(d.getDate() + 2);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setEndDate(`${yyyy}-${mm}-${dd}`);
    }, [filterStartDate]);

    useEffect(() => {
        setPeopleCount(filterGuests);
    }, [filterGuests]);

    // Calculate live price based on selections
    useEffect(() => {
        if (!selectedAcc) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        const duration = durationDays > 0 ? durationDays : 1;

        let baseCost = 0;
        if (selectedAcc.pricingType === "PER_PERSON_PER_DAY" || selectedAcc.pricingType === "PER_PERSON_PER_NIGHT") {
            baseCost = selectedAcc.basePrice * peopleCount * duration;
        } else {
            baseCost = selectedAcc.basePrice * duration;
        }

        let addonsCost = 0;
        selectedAddons.forEach((sel) => {
            const match = selectedAcc.addons.find((a) => a.id === sel.addonId);
            if (match) {
                const itemCost =
                    match.priceType === "PER_NIGHT"
                        ? match.price * sel.quantity * duration
                        : match.price * sel.quantity;
                addonsCost += itemCost;
            }
        });

        setCalculatedPrice(baseCost + addonsCost);
    }, [selectedAcc, startDate, endDate, peopleCount, selectedAddons]);

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
        if (!selectedAcc) return;
        setErrorMsg("");
        setIsSubmitting(true);

        // Dynamic Scout Capacity check
        if (selectedAcc.type === "SCOUT_ZONE" && peopleCount < selectedAcc.minCapacity) {
            setErrorMsg(`Scout campground Zone reservations require a minimum capacity of ${selectedAcc.minCapacity} people. Your current selection is ${peopleCount}.`);
            setIsSubmitting(false);
            return;
        }

        const res = await createStayBooking({
            accommodationId: selectedAcc.id,
            customerName: (e.target as any).customerName.value,
            customerEmail: (e.target as any).customerEmail.value,
            customerPhone: (e.target as any).customerPhone.value,
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

    // Filter local accommodations based on UI selectors
    const filteredAccommodations = accommodations.filter((acc) => {
        // 1. Filter by Stay Type
        if (filterType !== "ALL" && acc.type !== filterType) {
            return false;
        }

        // 2. Filter by Capacity
        if (filterGuests > acc.maxCapacity) {
            return false;
        }

        return true;
    });

    return (
        <div className="py-6">
            {/* Premium URL-Synced Filtering Dashboard Panel */}
            <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-xl p-6 md:p-8 mb-12 grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-30 -mt-24">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2.5">
                        Stay Type Filter
                    </label>
                    <CustomDropdown
                        value={draftType}
                        options={[
                            { value: "ALL", label: "All Lodging Options" },
                            { value: "INDIVIDUAL_CAMP", label: "Normal Campground Spot" },
                            { value: "SCOUT_ZONE", label: "Scout Camp" },
                            { value: "WOOD_TENT", label: "Wood Tents (1-4 Persons)" },
                            { value: "BUNGALOW", label: "Bungalows (Coming Soon)" },
                        ]}
                        onChange={(val) => setDraftType(val)}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2.5">
                        Guests
                    </label>
                    <div className="relative">
                        <Users className="w-4 h-4 text-skylight-gold absolute left-3.5 top-3.5" />
                        <input
                            type="number"
                            min="1"
                            value={draftGuests}
                            onChange={(e) => setDraftGuests(e.target.value === "" ? "" : parseInt(e.target.value) || 1)}
                            className="w-full p-3 pl-10 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2.5 flex items-center justify-between">
                        <span>Planned Arrival Date</span>
                    </label>
                    <div className="relative font-sans">
                        <input
                            type="date"
                            value={draftStartDate}
                            onChange={(e) => setDraftStartDate(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex gap-2.5 h-11">
                        <button
                            type="button"
                            onClick={handleApplyFilters}
                            className="flex-1 premium-btn bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-extrabold text-[10px] tracking-wider py-3.5 px-4 shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-display font-bold text-[10px] tracking-wider py-3.5 px-4 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* List cards */}
            {filteredAccommodations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredAccommodations.map((acc) => {
                        return (
                            <div
                                key={acc.id}
                                className="bg-white rounded-3xl border border-skylight-green/10 shadow-xl overflow-hidden flex flex-col justify-between hover-lift animate-scale-up transition-all duration-300"
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-skylight-green-light text-skylight-green text-[9px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                                            {acc.type.replace("_", " ")}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            Capacity: {acc.minCapacity} - {acc.maxCapacity} Guests
                                        </span>
                                    </div>

                                    <h3 className="font-display font-extrabold text-xl text-skylight-green mb-3">
                                        {acc.name}
                                    </h3>

                                    <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                                        Experience premium lodging at 1,200m altitude in Jaj. Mapped with private toilets, fresh spring water access, campfire pits, and pristine hiking boundaries.
                                    </p>

                                    {/* dynamic constraints info */}
                                    {acc.type === "SCOUT_ZONE" && (
                                        <div className="mb-6 flex gap-2 bg-yellow-50 border border-yellow-100 p-3.5 rounded-xl text-yellow-700 text-xs font-semibold leading-relaxed">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                            <span>Scout group constraint: Requires a minimum capacity of {acc.minCapacity} members to confirm campground slots.</span>
                                        </div>
                                    )}

                                    {/* Price Tag */}
                                    <div className="border-t border-gray-100 pt-5 mt-auto flex items-baseline gap-2">
                                        <span className="text-3xl font-display font-extrabold text-skylight-green">
                                            ${acc.basePrice.toFixed(0)}
                                        </span>
                                        <span className="text-xs text-gray-400 font-light">
                                            {acc.pricingType === "PER_PERSON_PER_DAY"
                                                ? "per person / day"
                                                : acc.pricingType === "PER_PERSON_PER_NIGHT"
                                                    ? "per person / night"
                                                    : "per unit / night"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 bg-[#fafbfa] border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                        {acc.addons.length} Addons Available
                                    </span>
                                    <Link
                                        href={`/stay/${acc.slug}?startDate=${filterStartDate}&guests=${filterGuests}`}
                                        className="premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-bold text-[10px] tracking-widest px-6 py-3 transition-colors text-center"
                                    >
                                        VIEW DETAILS & BOOK
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-skylight-green/10 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-scale-up">
                    <Tent className="w-12 h-12 text-skylight-gold mx-auto animate-pulse" />
                    <h3 className="font-display font-extrabold text-lg text-skylight-green">
                        No Lodging Options Match Your Filters
                    </h3>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">
                        We couldn't find stays that accommodate {filterGuests} guests in our {filterType.replace("_", " ")} catalog. Try lowering the guest count or picking another stay type.
                    </p>
                    <button
                        onClick={handleResetFilters}
                        className="premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-bold text-[10px] tracking-widest px-6 py-2.5 shadow cursor-pointer border-0"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}

            {/* Booking Form Modal */}
            {selectedAcc && (
                <div className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-skylight-green/10 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto animate-scale-up">
                        <button
                            onClick={() => setSelectedAcc(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-skylight-green font-bold text-sm"
                        >
                            Close
                        </button>

                        {bookingSuccess ? (
                            <div className="text-center py-12 space-y-4">
                                <CheckCircle2 className="w-16 h-16 text-skylight-green mx-auto" />
                                <h3 className="font-display font-extrabold text-2xl text-skylight-green">
                                    Stay Booking Submitted!
                                </h3>
                                <p className="text-xs text-gray-500 font-light max-w-sm mx-auto leading-relaxed">
                                    Your reservation for <span className="font-bold text-skylight-green">{selectedAcc.name}</span> has been queued. Please note the estimated checkout cost is <span className="font-bold text-skylight-green">${calculatedPrice.toFixed(2)}</span>. A manager will confirm via phone shortly!
                                </p>
                                <button
                                    onClick={() => setSelectedAcc(null)}
                                    className="premium-btn bg-skylight-green text-white font-display font-bold text-[10px] tracking-widest px-8 py-3.5 mt-6"
                                >
                                    Return to stay listings
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit} className="space-y-6">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-1">
                                        Booking Stay
                                    </span>
                                    <h3 className="font-display font-extrabold text-xl text-skylight-green">
                                        {selectedAcc.name}
                                    </h3>
                                </div>

                                {errorMsg && (
                                    <div className="flex gap-2 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs font-semibold leading-relaxed">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                {/* Date Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                                            Booking Stay Duration
                                        </label>
                                        <CustomDatePicker
                                            accommodationId={selectedAcc.id}
                                            accommodationType={selectedAcc.type}
                                            startDate={startDate}
                                            endDate={endDate}
                                            onChange={(start, end) => {
                                                setStartDate(start);
                                                setEndDate(end);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <CustomDropdown
                                            label="Guest Count"
                                            icon={<Users className="w-4 h-4" />}
                                            value={String(peopleCount)}
                                            options={Array.from({ length: selectedAcc.maxCapacity - selectedAcc.minCapacity + 1 }, (_, i) => {
                                                const val = selectedAcc.minCapacity + i;
                                                return { value: String(val), label: `${val} Guests` };
                                            })}
                                            onChange={(val) => setPeopleCount(parseInt(val))}
                                        />
                                    </div>
                                </div>

                                {/* Addons Selection Block */}
                                {selectedAcc.addons.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-3 flex items-center gap-1">
                                            <ShoppingBag className="w-4 h-4 text-skylight-gold" />
                                            Campsite Selections & Addons
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedAcc.addons.map((a) => {
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

                                {/* Contact Fields */}
                                <div className="border-t border-gray-100 pt-6 space-y-4">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green">
                                        Contact Info
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <User className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                                            <input
                                                required
                                                type="text"
                                                name="customerName"
                                                placeholder="Elie Haddad"
                                                className="w-full p-3 pl-9 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                                            <input
                                                required
                                                type="email"
                                                name="customerEmail"
                                                placeholder="elie@haddad.com"
                                                className="w-full p-3 pl-9 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                                            <input
                                                required
                                                type="text"
                                                name="customerPhone"
                                                placeholder="+961 70 123456"
                                                className="w-full p-3 pl-9 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Price Display & Booking Submit */}
                                <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fafbfa] -mx-6 -mb-6 p-6 rounded-b-3xl">
                                    <div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                            Estimated Reservation Cost:
                                        </span>
                                        <span className="text-3xl font-display font-extrabold text-skylight-green">
                                            ${calculatedPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-xs tracking-widest px-8 py-4 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? "PROCESSING..." : "CONFIRM BOOKING"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
