"use client";

import React, { useState, useEffect } from "react";
import { createRestaurantBooking } from "@/app/actions";
import { Utensils, Calendar, Users, Clock, Compass, CheckCircle2, AlertTriangle, User, Mail, Phone, AlertCircle, X } from "lucide-react";
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
                if (diyZone) setSelectedZoneId(diyZone.id);
                const currentMin = diyZone?.minCapacity ?? 4;
                if (peopleCount < currentMin) setPeopleCount(currentMin);
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

    // Helper: validate reservation date
    const getReservationDateError = (zoneId: string, dateStr: string) => {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return "";
        const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayOfWeek = dateObj.getDay();
        const zone = zones.find(z => z.id === zoneId);
        if (!zone || !zone.daysOpen || zone.daysOpen === "ALL") return "";
        const days = zone.daysOpen.toUpperCase().split(",");
        const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        if (!days.includes(dayNames[dayOfWeek])) {
            const formatted = days.map(d => d.charAt(0) + d.slice(1).toLowerCase() + "s").join(" & ");
            return `${zone.name} is only open on ${formatted}. Please pick another date.`;
        }
        return "";
    };

    // Helper: get timeslots
    const getTimeSlotsForZone = (zoneId: string) => {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"];
        const startHour = zone.openHour ?? 12;
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

    useEffect(() => {
        if (activeTimeSlots.length > 0 && !activeTimeSlots.includes(timeSlot)) {
            setTimeSlot(activeTimeSlots[0]);
        }
    }, [selectedZoneId, reservationMode, activeTimeSlots]);

    const handleReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dateError) return;
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
                <div
                    className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-skylight-green/10 relative animate-scale-up flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Fixed Header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                            <div>
                                <span className="text-[9px] font-bold text-skylight-gold uppercase tracking-widest block mb-0.5">
                                    {reservationMode === "OUTDOOR_DIY" ? "Outdoor Spot Booking" : "Table Reservation — Free"}
                                </span>
                                <h3 className="font-display font-extrabold text-lg text-skylight-green leading-tight">
                                    {reservationMode === "OUTDOOR_DIY"
                                        ? "Outdoor Picnic Spot"
                                        : activeZone?.name || "Choose Your Table"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-skylight-green transition-colors flex-shrink-0 border-0 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto flex-1">
                            {success ? (
                                <div className="text-center py-12 px-6 space-y-3">
                                    <CheckCircle2 className="w-14 h-14 text-skylight-green mx-auto" />
                                    <h4 className="font-display font-extrabold text-xl text-skylight-green">
                                        {reservationMode === "OUTDOOR_DIY" ? "Picnic Spot Booked!" : "Table Reserved!"}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-light max-w-xs mx-auto leading-relaxed">
                                        {reservationMode === "OUTDOOR_DIY"
                                            ? "Your picnic spot is confirmed. Our team will set it up before your arrival."
                                            : "Your table is held. A staff member will welcome you upon arrival!"}
                                    </p>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="premium-btn bg-skylight-green text-white font-display font-bold text-[10px] tracking-widest px-8 py-3 mt-4 border-0 cursor-pointer"
                                    >
                                        DONE
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleReservationSubmit} className="px-6 py-4 space-y-4">
                                    {errorMsg && (
                                        <div className="flex gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 text-xs font-semibold">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{errorMsg}</span>
                                        </div>
                                    )}

                                    {/* Mode switcher — compact pill style */}
                                    <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setReservationMode("RESTAURANT")}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                                                reservationMode === "RESTAURANT"
                                                    ? "bg-skylight-green text-white shadow"
                                                    : "text-gray-500 hover:text-skylight-green"
                                            }`}
                                        >
                                            <Utensils className="w-3 h-3" />
                                            Restaurant &amp; Bar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReservationMode("OUTDOOR_DIY")}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                                                reservationMode === "OUTDOOR_DIY"
                                                    ? "bg-skylight-green text-white shadow"
                                                    : "text-gray-500 hover:text-skylight-green"
                                            }`}
                                        >
                                            <Compass className="w-3 h-3" />
                                            Picnic (${diyPrice.toFixed(0)}/chair)
                                        </button>
                                    </div>

                                    {/* Date + Time in 2 columns */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[9px] font-bold uppercase tracking-widest text-skylight-green mb-1.5">
                                                Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="w-3.5 h-3.5 text-skylight-gold absolute left-3 top-3" />
                                                <input
                                                    required
                                                    type="date"
                                                    value={bookingDate}
                                                    onChange={e => setBookingDate(e.target.value)}
                                                    className="w-full py-2.5 pl-8 pr-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <CustomDropdown
                                                label="Arrival Time"
                                                icon={<Clock className="w-3.5 h-3.5" />}
                                                value={timeSlot}
                                                options={activeTimeSlots.map(ts => ({ value: ts, label: ts }))}
                                                onChange={val => setTimeSlot(val)}
                                            />
                                        </div>
                                    </div>

                                    {/* Date error — compact amber strip */}
                                    {dateError && (
                                        <div className="flex gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-700 text-xs font-medium items-start animate-scale-up">
                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                            <span>{dateError}</span>
                                        </div>
                                    )}

                                    {/* Zone selector (restaurant only) + Guests in 2 columns */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {reservationMode === "RESTAURANT" ? (
                                            <CustomDropdown
                                                label="Dining Zone"
                                                icon={<Compass className="w-3.5 h-3.5" />}
                                                value={selectedZoneId}
                                                options={zones
                                                    .filter(z => !z.name.toLowerCase().includes("diy") && !z.name.toLowerCase().includes("picnic"))
                                                    .map(z => ({ value: z.id, label: z.name }))}
                                                onChange={val => setSelectedZoneId(val)}
                                            />
                                        ) : (
                                            <div>
                                                <label className="block text-[9px] font-bold uppercase tracking-widest text-skylight-green mb-1.5">
                                                    Estimated Cost
                                                </label>
                                                <div className="py-2.5 px-3 rounded-xl bg-skylight-green/5 border border-skylight-green/10 text-xs font-extrabold text-skylight-green text-center">
                                                    ${(peopleCount * chairPrice).toFixed(2)} total
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-[9px] font-bold uppercase tracking-widest text-skylight-green mb-1.5">
                                                {reservationMode === "OUTDOOR_DIY" ? `Chairs (min ${minCap})` : "Guests"}
                                            </label>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setPeopleCount(Math.max(minCap, peopleCount - 1))}
                                                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all border-solid cursor-pointer"
                                                >
                                                    −
                                                </button>
                                                <div className="flex-1 text-center py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-skylight-green flex items-center justify-center gap-1">
                                                    <Users className="w-3.5 h-3.5 text-skylight-gold" />
                                                    {peopleCount}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setPeopleCount(Math.min(30, peopleCount + 1))}
                                                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all border-solid cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact info — name full-width, email + phone side by side */}
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-skylight-green mb-1.5">
                                            Contact Info
                                        </label>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <User className="w-3.5 h-3.5 text-skylight-gold absolute left-3 top-3" />
                                                <input
                                                    required
                                                    type="text"
                                                    name="customerName"
                                                    placeholder="Full name"
                                                    className="w-full py-2.5 pl-8 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="relative">
                                                    <Mail className="w-3.5 h-3.5 text-skylight-gold absolute left-3 top-3" />
                                                    <input
                                                        required
                                                        type="email"
                                                        name="customerEmail"
                                                        placeholder="Email"
                                                        className="w-full py-2.5 pl-8 pr-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Phone className="w-3.5 h-3.5 text-skylight-gold absolute left-3 top-3" />
                                                    <input
                                                        required
                                                        type="tel"
                                                        name="customerPhone"
                                                        placeholder="+961 70 xxxxxx"
                                                        className="w-full py-2.5 pl-8 pr-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="pb-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !!dateError}
                                            className="w-full premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-display font-extrabold text-[11px] tracking-widest py-3.5 transition-all border-0 cursor-pointer"
                                        >
                                            {isSubmitting
                                                ? "PROCESSING..."
                                                : reservationMode === "OUTDOOR_DIY"
                                                    ? `BOOK PICNIC SPOT — $${(peopleCount * chairPrice).toFixed(0)}`
                                                    : "CONFIRM RESERVATION (FREE)"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
