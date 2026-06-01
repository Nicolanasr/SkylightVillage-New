"use client";

import React, { useState, useEffect } from "react";
import { createRestaurantBooking } from "@/app/actions";
import { Utensils, Calendar, Users, Clock, Compass, CheckCircle2, AlertTriangle, User, Mail, Phone, ShoppingCart, Info, AlertCircle } from "lucide-react";
import CustomDropdown from "./CustomDropdown";

interface Zone {
    id: string;
    name: string;
    description: string | null;
    price: number;
    minCapacity: number;
    daysOpen: string;
    openHour: number;
}

interface TableReservationModalProps {
    zones: Zone[];
    initialMode?: "RESTAURANT" | "OUTDOOR_DIY";
    initialZoneId?: string;
    buttonText?: string;
    buttonClassName?: string;
}

export default function TableReservationModal({
    zones,
    initialMode = "RESTAURANT",
    initialZoneId,
    buttonText,
    buttonClassName
}: TableReservationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reservationMode, setReservationMode] = useState<"RESTAURANT" | "OUTDOOR_DIY">(initialMode);

    // Find matching zones
    const diyZone = zones.find(z => z.name.toLowerCase().includes("diy") || z.name.toLowerCase().includes("picnic"));
    const firstStandardZone = zones.find(z => z.id !== diyZone?.id) || zones[0];

    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [bookingDate, setBookingDate] = useState("2026-06-15");
    const [timeSlot, setTimeSlot] = useState("12:00 PM");
    const [peopleCount, setPeopleCount] = useState(4);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Initialize/sync selected zone when modal opens or mode changes
    useEffect(() => {
        if (isOpen) {
            if (reservationMode === "OUTDOOR_DIY") {
                if (diyZone) {
                    setSelectedZoneId(diyZone.id);
                }
                const currentMin = diyZone?.minCapacity ?? 4;
                if (peopleCount < currentMin) {
                    setPeopleCount(currentMin);
                }
            } else {
                if (initialZoneId && zones.some(z => z.id === initialZoneId && z.id !== diyZone?.id)) {
                    setSelectedZoneId(initialZoneId);
                } else if (firstStandardZone) {
                    setSelectedZoneId(firstStandardZone.id);
                }
            }
        }
    }, [reservationMode, isOpen, zones, initialZoneId]);

    // Retrieve dynamic pricing and capacity from active zone
    const diyPrice = diyZone?.price && diyZone.price > 0 ? diyZone.price : 5.0;
    const activeZone = zones.find(z => z.id === selectedZoneId);
    const chairPrice = activeZone?.price ?? 0;
    const minCap = activeZone?.minCapacity ?? 1;

    // Helper: validate reservation date by day of week based on selected zone constraints in the database
    const getReservationDateError = (zoneId: string, dateStr: string) => {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return "";
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return "";

        if (!zone.daysOpen || zone.daysOpen === "ALL") return "";

        const days = zone.daysOpen.toUpperCase().split(",");
        const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const currentDayName = dayNames[dayOfWeek];

        if (!days.includes(currentDayName)) {
            const formattedOpenDays = days
                .map(d => d.charAt(0) + d.slice(1).toLowerCase() + "s")
                .join(" and ");
            return `⚠️ The ${zone.name} is only open for reservations on ${formattedOpenDays}. Please select an open date.`;
        }
        return "";
    };

    // Helper: get dynamic timeslots based on the selected zone's opening hour in the database
    const getTimeSlotsForZone = (zoneId: string) => {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) {
            return ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"];
        }

        const startHour = zone.openHour ?? 12;
        // Sunset Bar closes later at 11 PM (23), others close at 10 PM (22)
        const endHour = zone.name.toLowerCase().includes("sunset") || zone.name.toLowerCase().includes("bar") ? 23 : 22;

        const slots: string[] = [];
        for (let h = startHour; h <= endHour; h++) {
            const ampm = h >= 12 ? "PM" : "AM";
            const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
            slots.push(`${displayHour}:00 ${ampm}`);
        }
        return slots;
    };

    const activeTimeSlots = getTimeSlotsForZone(selectedZoneId);
    const dateError = getReservationDateError(selectedZoneId, bookingDate);

    // Sync timeslot selection if the active options change
    useEffect(() => {
        if (activeTimeSlots.length > 0 && !activeTimeSlots.includes(timeSlot)) {
            setTimeSlot(activeTimeSlots[0]);
        }
    }, [selectedZoneId, reservationMode, activeTimeSlots]);

    const handleReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dateError) return; // Block submission of invalid dates
        setErrorMsg("");
        setIsSubmitting(true);

        const res = await createRestaurantBooking({
            customerName: (e.target as any).customerName.value,
            customerEmail: (e.target as any).customerEmail.value,
            customerPhone: (e.target as any).customerPhone.value,
            bookingDate,
            timeSlot,
            zoneId: selectedZoneId,
            peopleCount,
        });

        setIsSubmitting(false);
        if (res.success) {
            setSuccess(true);
        } else {
            setErrorMsg(res.error || "Failed to submit table reservation.");
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    setReservationMode(initialMode);
                    setIsOpen(true);
                    setSuccess(false);
                    setErrorMsg("");
                }}
                className={buttonClassName || "premium-btn bg-skylight-gold text-skylight-dark hover:bg-skylight-green hover:text-white font-display font-extrabold text-xs tracking-widest px-8 py-4 transition-all hover:-translate-y-0.5"}
            >
                {buttonText || "RESERVE DINING TABLE (FREE)"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-skylight-green/10 p-6 md:p-8 relative animate-scale-up my-8">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-skylight-green font-bold text-sm bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>

                        {success ? (
                            <div className="text-center py-12 space-y-4">
                                <CheckCircle2 className="w-16 h-16 text-skylight-green mx-auto" />
                                <h3 className="font-display font-extrabold text-2xl text-skylight-green">
                                    {reservationMode === "OUTDOOR_DIY" ? "DIY Picnic Spot Booked!" : "Table Reservation Confirmed!"}
                                </h3>
                                <p className="text-xs text-gray-500 font-light max-w-sm mx-auto leading-relaxed">
                                    {reservationMode === "OUTDOOR_DIY"
                                        ? "Your outdoor picnic spot setup has been successfully booked. We will prepare your table and chairs in a beautiful open-air location for you. Don't forget that our Skylight Village store is fully stocked for any supplies you need!"
                                        : "Your dining table reservation has been logged. We have reserved a cozy spot in your selected zone. The waiter assigned to your table will welcome you upon arrival!"
                                    }
                                </p>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="premium-btn bg-skylight-green text-white font-display font-bold text-[10px] tracking-widest px-8 py-3.5 mt-6"
                                >
                                    Return to Restaurant Menu
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleReservationSubmit} className="space-y-5">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-1">
                                        Dining & Outdoor Reservations
                                    </span>
                                    <h3 className="font-display font-extrabold text-xl text-skylight-green">
                                        Choose Your Seating Experience
                                    </h3>
                                </div>

                                {errorMsg && (
                                    <div className="flex gap-2 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs font-semibold leading-relaxed">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                {/* Reservation Type Tab Switcher */}
                                <div className="flex bg-[#fafbfa] p-1 rounded-2xl border border-gray-100 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setReservationMode("RESTAURANT")}
                                        className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${reservationMode === "RESTAURANT"
                                            ? "bg-skylight-green text-white shadow-md"
                                            : "text-gray-500 hover:text-skylight-green"
                                            }`}
                                    >
                                        <Utensils className="w-3.5 h-3.5" />
                                        Restaurant & Sunset Bar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReservationMode("OUTDOOR_DIY")}
                                        className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${reservationMode === "OUTDOOR_DIY"
                                            ? "bg-skylight-green text-white shadow-md"
                                            : "text-gray-500 hover:text-skylight-green"
                                            }`}
                                    >
                                        <Compass className="w-3.5 h-3.5" />
                                        Outdoor Picnic (${diyPrice.toFixed(0)}/chair)
                                    </button>
                                </div>

                                {/* Custom helper cards based on active mode */}
                                {reservationMode === "OUTDOOR_DIY" ? (
                                    <div className="bg-skylight-green-light/40 border border-skylight-green/10 rounded-2xl p-4 text-xs text-skylight-green leading-relaxed text-left space-y-2">
                                        <div className="font-bold flex items-center justify-between">
                                            <span className="flex items-center gap-1">🌲 Outdoor Picnic Spot</span>
                                            <span className="text-[9px] bg-skylight-gold text-skylight-dark px-2 py-0.5 rounded-full font-extrabold uppercase">
                                                ${diyPrice.toFixed(2)} / Chair / Day
                                            </span>
                                        </div>
                                        <p className="font-light text-gray-600">
                                            We provide a solid wood table and matching chairs at a scenic open-air spot. You bring everything else (food, drinks, custom grills, blankets)!
                                        </p>
                                        <div className="pt-2 border-t border-skylight-green/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10px] font-bold text-skylight-gold">
                                            <span className="flex items-center gap-1">
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                Forgot supplies? On-site village store is fully stocked!
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[#fafbfa] border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 leading-relaxed text-left flex gap-3 items-start">
                                        <Info className="w-5 h-5 text-skylight-gold flex-shrink-0 mt-0.5" />
                                        <p className="font-light">
                                            Reserve a spot in the Skylight Restaurant (open Sat/Sun starting 12 PM) or the scenic sunset cocktail bar (open Saturdays starting 5 PM). Reservations are free.
                                        </p>
                                    </div>
                                )}

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                                            Booking Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                                            <input
                                                required
                                                type="date"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                className="w-full p-3 pl-9 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <CustomDropdown
                                            label="Preferred Arrival Time (From)"
                                            icon={<Clock className="w-4 h-4" />}
                                            value={timeSlot}
                                            options={activeTimeSlots.map((ts) => ({ value: ts, label: ts }))}
                                            onChange={(val) => setTimeSlot(val)}
                                        />
                                    </div>
                                </div>

                                {/* Stacking Date Warning Alert (Blocks Reservation Form on invalid open days) */}
                                {dateError && (
                                    <div className="flex gap-2.5 bg-amber-50 border border-amber-200/80 p-4 rounded-2xl text-amber-850 text-xs font-medium leading-relaxed items-start shadow-sm animate-scale-up col-span-full">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-500">{dateError}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <div>
                                        {reservationMode === "RESTAURANT" ? (
                                            <CustomDropdown
                                                label="Dining Zone"
                                                icon={<Compass className="w-4 h-4" />}
                                                value={selectedZoneId}
                                                options={zones
                                                    .filter((z) => !z.name.toLowerCase().includes("diy") && !z.name.toLowerCase().includes("picnic"))
                                                    .map((z) => ({ value: z.id, label: z.name }))}
                                                onChange={(val) => setSelectedZoneId(val)}
                                            />
                                        ) : (
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                                                    Picnic Location Zone
                                                </label>
                                                <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-skylight-green flex items-center gap-2">
                                                    <Compass className="w-4 h-4 text-skylight-gold" />
                                                    <span>Outdoor Picnic Spot</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                                            {reservationMode === "OUTDOOR_DIY" ? `Chairs Booking (Min. ${minCap})` : "Guest Count"}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPeopleCount(Math.max(minCap, peopleCount - 1))}
                                                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center p-2.5 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-bold text-skylight-green flex items-center justify-center gap-1.5">
                                                <Users className="w-4 h-4 text-skylight-gold" />
                                                <span>{peopleCount} {reservationMode === "OUTDOOR_DIY" ? `Chair${peopleCount > 1 ? "s" : ""}` : `Guest${peopleCount > 1 ? "s" : ""}`}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPeopleCount(Math.min(30, peopleCount + 1))}
                                                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom pricing panel for outdoor spots */}
                                {reservationMode === "OUTDOOR_DIY" && (
                                    <div className="bg-skylight-green/5 border border-skylight-green/10 rounded-2xl p-4 flex items-center justify-between animate-scale-up">
                                        <div className="text-left">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase">Estimated Pricing</span>
                                            <span className="text-[10px] text-gray-500 font-light">
                                                {peopleCount} chairs x ${chairPrice.toFixed(2)}/day
                                            </span>
                                        </div>
                                        <span className="font-display font-extrabold text-lg text-skylight-green bg-white px-4 py-1.5 rounded-xl border border-skylight-green/10 shadow-sm">
                                            ${(peopleCount * chairPrice).toFixed(2)} total
                                        </span>
                                    </div>
                                )}

                                {/* Contact Fields */}
                                <div className="border-t border-gray-100 pt-5 space-y-3">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green">
                                        Contact Info
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                                <div className="border-t border-gray-100 pt-5 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !!dateError}
                                        className="premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-display font-extrabold text-xs tracking-widest px-8 py-4 transition-all"
                                    >
                                        {isSubmitting
                                            ? "PROCESSING..."
                                            : reservationMode === "OUTDOOR_DIY"
                                                ? `BOOK DIY SPOT ($${(peopleCount * chairPrice).toFixed(0)})`
                                                : "CONFIRM RESERVATION"
                                        }
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
