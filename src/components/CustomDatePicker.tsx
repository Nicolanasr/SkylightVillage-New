"use client";

import React, { useState, useEffect } from "react";
import { getAccommodationBookings } from "@/app/actions";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";

interface CustomDatePickerProps {
    accommodationId: string;
    accommodationType?: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    onChange: (startDate: string, endDate: string) => void;
}

export default function CustomDatePicker({
    accommodationId,
    accommodationType,
    startDate,
    endDate,
    onChange,
}: CustomDatePickerProps) {
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // Initialize near June 2026 as per seeds
    const [selectingStep, setSelectingStep] = useState<"checkin" | "checkout">("checkin");
    const [tempStart, setTempStart] = useState<string | null>(startDate);

    // Fetch blocked dates whenever accommodation changes
    useEffect(() => {
        async function loadAvailability() {
            if (!accommodationId) return;
            
            // INDIVIDUAL_CAMP allows unlimited concurrent multi-group bookings, so it never blocks dates
            if (accommodationType === "INDIVIDUAL_CAMP") {
                setBlockedDates([]);
                return;
            }

            const res = await getAccommodationBookings(accommodationId);
            if (res.success && res.blockedDates) {
                setBlockedDates(res.blockedDates);
            }
        }
        loadAvailability();
    }, [accommodationId, accommodationType]);

    // Synchronize internal state with props
    useEffect(() => {
        setTempStart(startDate);
    }, [startDate]);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const startDayOfWeek = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const formatDateString = (year: number, month: number, day: number) => {
        const mm = String(month + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${year}-${mm}-${dd}`;
    };

    const isBlocked = (dateStr: string) => {
        return blockedDates.includes(dateStr);
    };

    const isPast = (year: number, month: number, day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cellDate = new Date(year, month, day);
        return cellDate < today;
    };

    const hasOverlap = (startStr: string, endStr: string) => {
        let current = new Date(startStr);
        const end = new Date(endStr);
        while (current < end) {
            const yyyy = current.getFullYear();
            const mm = String(current.getMonth() + 1).padStart(2, "0");
            const dd = String(current.getDate()).padStart(2, "0");
            const currentStr = `${yyyy}-${mm}-${dd}`;
            if (blockedDates.includes(currentStr)) {
                return true;
            }
            current.setDate(current.getDate() + 1);
        }
        return false;
    };

    const handleDayClick = (dayStr: string) => {
        if (isBlocked(dayStr)) return;

        if (selectingStep === "checkin") {
            setTempStart(dayStr);
            if (endDate && endDate > dayStr && !hasOverlap(dayStr, endDate)) {
                onChange(dayStr, endDate);
            } else {
                onChange(dayStr, "");
            }
            setSelectingStep("checkout");
        } else {
            // We are selecting checkout
            if (tempStart && dayStr > tempStart) {
                if (hasOverlap(tempStart, dayStr)) {
                    alert("Selected range overlaps with existing bookings that are Not Available. Please choose available dates.");
                    return;
                }
                onChange(tempStart, dayStr);
                setSelectingStep("checkin");
            } else {
                // If checkout is chosen before checkin, treat it as the new checkin
                setTempStart(dayStr);
                onChange(dayStr, "");
                setSelectingStep("checkout");
            }
        }
    };

    const monthYearLabel = currentMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    const weeks = [];
    const daysCount = daysInMonth(currentMonth);
    const startDay = startDayOfWeek(currentMonth);

    // Pad previous month days
    const tempCells = [];
    for (let i = 0; i < startDay; i++) {
        tempCells.push(null);
    }

    // Current month days
    for (let day = 1; day <= daysCount; day++) {
        tempCells.push(day);
    }

    // Chunk into weeks
    for (let i = 0; i < tempCells.length; i += 7) {
        weeks.push(tempCells.slice(i, i + 7));
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm w-full space-y-4">
            {/* Date Header Display */}
            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <button
                    type="button"
                    onClick={() => setSelectingStep("checkin")}
                    className={`p-2.5 rounded-xl transition-all text-left cursor-pointer border ${selectingStep === "checkin"
                            ? "bg-skylight-green-light border-skylight-green/40 shadow-sm"
                            : "bg-gray-50 border-transparent hover:border-gray-300"
                        }`}
                >
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Check-In Date</span>
                    <span className="text-xs font-bold text-skylight-green flex items-center gap-1.5 mt-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-skylight-gold" />
                        {startDate || "Select Arrival"}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSelectingStep("checkout")}
                    className={`p-2.5 rounded-xl transition-all text-left cursor-pointer border ${selectingStep === "checkout"
                            ? "bg-skylight-green-light border-skylight-green/40 shadow-sm"
                            : "bg-gray-50 border-transparent hover:border-gray-300"
                        }`}
                >
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Check-Out Date</span>
                    <span className="text-xs font-bold text-skylight-green flex items-center gap-1.5 mt-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-skylight-gold" />
                        {endDate || "Select Departure"}
                    </span>
                </button>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-skylight-green">{monthYearLabel}</h4>
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-skylight-green"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-skylight-green"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="text-center">
                {/* Days of week */}
                <div className="grid grid-cols-7 text-[10px] font-bold text-gray-400 uppercase mb-2">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                </div>

                {/* Weeks */}
                <div className="space-y-1">
                    {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="grid grid-cols-7 gap-1">
                            {week.map((day, dIdx) => {
                                if (day === null) {
                                    return <div key={dIdx} className="aspect-square" />;
                                }

                                const dayStr = formatDateString(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth(),
                                    day
                                );

                                const blocked = isBlocked(dayStr);
                                const past = isPast(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth(),
                                    day
                                );

                                const isSelectedStart = tempStart === dayStr;
                                const isSelectedEnd = endDate === dayStr;
                                const isInRange = tempStart && endDate && dayStr > tempStart && dayStr < endDate;

                                let dayClass = "text-skylight-green hover:bg-skylight-green-light hover:text-skylight-green";
                                if (past) {
                                    dayClass = "text-gray-300 opacity-40 cursor-not-allowed";
                                } else if (blocked) {
                                    dayClass = "text-red-500 bg-red-50/70 border border-red-100 line-through cursor-not-allowed";
                                } else if (isSelectedStart || isSelectedEnd) {
                                    dayClass = "bg-skylight-green text-white font-bold rounded-lg shadow-sm";
                                } else if (isInRange) {
                                    dayClass = "bg-skylight-green-light/80 text-skylight-green font-semibold rounded-md";
                                }

                                return (
                                    <button
                                        key={dIdx}
                                        type="button"
                                        disabled={blocked || past}
                                        onClick={() => handleDayClick(dayStr)}
                                        className={`aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all relative ${dayClass}`}
                                        title={blocked ? "Not Available" : ""}
                                    >
                                        <span>{day}</span>
                                        {blocked && (
                                            <span className="absolute bottom-0.5 text-[5px] font-bold tracking-tight text-red-600 leading-none">
                                                UNAVAIL
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
