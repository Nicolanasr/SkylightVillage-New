// components/MobileRestaurantDrawer.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Utensils, Calendar, Clock, Users, User, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { createRestaurantBooking } from '@/app/actions';
import CustomDropdown from './CustomDropdown';

interface Zone {
    id: string;
    name: string;
    description: string | null;
    price: number;
    minCapacity: number;
    daysOpen: string;
    openHour: number;
}

interface Props {
    zones: Zone[];
    initialZoneId: string;
    initialMode?: 'RESTAURANT' | 'OUTDOOR_DIY';
    zoneName: string;
}

function getTimeSlotsForZone(zone: Zone | undefined): string[] {
    if (!zone) return ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];
    const startHour = zone.openHour ?? 12;
    const endHour = zone.name.toLowerCase().includes('sunset') || zone.name.toLowerCase().includes('bar') ? 23 : 22;
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        slots.push(`${displayHour}:00 ${ampm}`);
    }
    return slots;
}

function getDateError(zone: Zone | undefined, dateStr: string): string {
    if (!zone || !dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayOfWeek = dateObj.getDay();
    if (!zone.daysOpen || zone.daysOpen === 'ALL') return '';
    const days = zone.daysOpen.toUpperCase().split(',');
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    if (!days.includes(dayNames[dayOfWeek])) {
        const formatted = days.map(d => d.charAt(0) + d.slice(1).toLowerCase() + 's').join(' & ');
        return `Open on ${formatted} only`;
    }
    return '';
}

// Today's date as YYYY-MM-DD
function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MobileRestaurantDrawer({ zones, initialZoneId, initialMode = 'RESTAURANT', zoneName }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const isPicnic = initialMode === 'OUTDOOR_DIY';

    // Form state
    const activeZone = zones.find(z => z.id === initialZoneId);
    const timeSlots = getTimeSlotsForZone(activeZone);
    const minCap = activeZone?.minCapacity ?? 1;
    const chairPrice = activeZone?.price ?? 0;

    const [bookingDate, setBookingDate] = useState(todayStr());
    const [timeSlot, setTimeSlot] = useState(timeSlots[0] ?? '12:00 PM');
    const [peopleCount, setPeopleCount] = useState(Math.max(minCap, 2));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const dateError = getDateError(activeZone, bookingDate);

    // Sync timeslot when zone/time changes
    useEffect(() => {
        const slots = getTimeSlotsForZone(activeZone);
        if (slots.length > 0 && !slots.includes(timeSlot)) {
            setTimeSlot(slots[0]);
        }
    }, [initialZoneId]);

    const handleOpen = () => {
        setIsOpen(true);
        setSuccess(false);
        setErrorMsg('');
    };

    const handleClose = () => setIsOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dateError) return;
        setErrorMsg('');
        setIsSubmitting(true);

        const form = e.target as HTMLFormElement;
        const res = await createRestaurantBooking({
            customerName: (form.elements.namedItem('customerName') as HTMLInputElement).value,
            customerEmail: (form.elements.namedItem('customerEmail') as HTMLInputElement).value || undefined,
            customerPhone: (form.elements.namedItem('customerPhone') as HTMLInputElement).value,
            bookingDate,
            timeSlot,
            zoneId: initialZoneId,
            peopleCount,
        });

        setIsSubmitting(false);
        if (res.success) {
            setSuccess(true);
        } else {
            setErrorMsg(res.error || 'Failed to submit reservation.');
        }
    };

    return (
        <>
            {/* Bottom Sticky Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-5 py-3 flex items-center justify-between">
                <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {isPicnic ? 'Outdoor Spot' : 'Dining Table'}
                    </span>
                    <span className="text-sm font-display font-extrabold text-skylight-green truncate max-w-[160px]">
                        {zoneName}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleOpen}
                    className="premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-[10px] tracking-widest px-5 py-3 transition-colors cursor-pointer border-0 shadow-md flex items-center gap-1.5"
                >
                    <Utensils className="w-3.5 h-3.5" />
                    {isPicnic ? 'BOOK SPOT' : 'RESERVE TABLE'}
                </button>
            </div>

            {/* Spacer so page content isn't hidden behind bar */}
            <div className="lg:hidden h-20 w-full" />

            {/* Slide-Up Drawer */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-end"
                    onClick={handleClose}
                >
                    <div
                        className="bg-white w-full rounded-t-3xl shadow-2xl border-t border-skylight-green/10 flex flex-col animate-slide-up max-h-[88vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Pull handle */}
                        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
                            <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <div>
                                <span className="text-[9px] font-bold text-skylight-gold uppercase tracking-widest">
                                    {isPicnic ? 'Outdoor Spot Booking' : 'Table Reservation — Free'}
                                </span>
                                <h3 className="font-display font-extrabold text-base text-skylight-green leading-tight">
                                    {zoneName}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-0 cursor-pointer transition-colors text-gray-400 hover:text-skylight-green flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 pb-safe-bottom">
                            {success ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
                                    <CheckCircle2 className="w-14 h-14 text-skylight-green" />
                                    <h4 className="font-display font-extrabold text-xl text-skylight-green">
                                        {isPicnic ? 'Picnic Spot Booked!' : 'Table Reserved!'}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-light max-w-xs leading-relaxed">
                                        {isPicnic
                                            ? 'Your outdoor picnic spot is confirmed. Our team will set it up before your arrival.'
                                            : 'Your table is held. A staff member will welcome you at the entrance upon arrival.'}
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="mt-2 premium-btn bg-skylight-green text-white font-display font-bold text-[10px] tracking-widest px-8 py-3 border-0 cursor-pointer"
                                    >
                                        DONE
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                                    {errorMsg && (
                                        <div className="flex gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 text-xs font-semibold">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{errorMsg}</span>
                                        </div>
                                    )}

                                    {/* Date + Time row */}
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
                                                    min={todayStr()}
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
                                                options={timeSlots.map(ts => ({ value: ts, label: ts }))}
                                                onChange={val => setTimeSlot(val)}
                                            />
                                        </div>
                                    </div>

                                    {/* Date warning */}
                                    {dateError && (
                                        <div className="flex gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-700 text-xs font-medium items-start">
                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                            <span>{dateError}</span>
                                        </div>
                                    )}

                                    {/* Guests / Chairs */}
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-skylight-green mb-1.5">
                                            {isPicnic ? `Chairs (min. ${minCap})` : 'Guests'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPeopleCount(Math.max(minCap, peopleCount - 1))}
                                                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all border-solid cursor-pointer"
                                            >
                                                −
                                            </button>
                                            <div className="flex-1 text-center py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-skylight-green flex items-center justify-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-skylight-gold" />
                                                {peopleCount} {isPicnic ? `Chair${peopleCount > 1 ? 's' : ''}` : `Guest${peopleCount > 1 ? 's' : ''}`}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPeopleCount(Math.min(30, peopleCount + 1))}
                                                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all border-solid cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                        {isPicnic && chairPrice > 0 && (
                                            <p className="text-[10px] text-gray-400 mt-1 text-right">
                                                {peopleCount} × ${chairPrice.toFixed(2)} = <span className="font-bold text-skylight-green">${(peopleCount * chairPrice).toFixed(2)}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Contact Info — compact 3-column */}
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
                                                        type="email"
                                                        name="customerEmail"
                                                        placeholder="Email (Optional)"
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
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !!dateError}
                                        className="w-full premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-display font-extrabold text-[11px] tracking-widest py-3.5 transition-all border-0 cursor-pointer"
                                    >
                                        {isSubmitting
                                            ? 'PROCESSING...'
                                            : isPicnic
                                                ? `BOOK PICNIC SPOT${chairPrice > 0 ? ` — $${(peopleCount * chairPrice).toFixed(0)}` : ''}`
                                                : 'CONFIRM RESERVATION (FREE)'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
