"use client";

import React, { useState } from "react";
import { createEventReservation } from "@/app/actions";
import { User, Mail, Ticket, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface EventBookingFormProps {
  eventId: string;
  ticketPrice: number;
  remainingCapacity: number;
}

export default function EventBookingForm({
  eventId,
  ticketPrice,
  remainingCapacity,
}: EventBookingFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [ticketCount, setTicketCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCapacity <= 0) return;
    setErrorMsg("");
    setIsSubmitting(true);

    if (ticketCount > remainingCapacity) {
      setErrorMsg(`Cannot request ${ticketCount} tickets. Only ${remainingCapacity} spots remaining.`);
      setIsSubmitting(false);
      return;
    }

    const res = await createEventReservation({
      eventId,
      customerName,
      customerEmail,
      ticketCount,
    });

    setIsSubmitting(false);
    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.error || "Failed to reserve tickets.");
    }
  };

  const totalPrice = ticketPrice * ticketCount;

  if (remainingCapacity <= 0) {
    return (
      <div className="bg-red-50/70 border border-red-100 p-6 rounded-2xl text-center space-y-2">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h4 className="font-display font-extrabold text-sm text-red-800 uppercase tracking-wider">
          Sold Out!
        </h4>
        <p className="text-xs text-red-700 font-light leading-relaxed">
          This event has reached full capacity. No tickets are currently available. Check back soon for future gatherings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-skylight-gold/5 rounded-full blur-2xl" />

      {success ? (
        <div className="text-center py-10 space-y-4">
          <CheckCircle2 className="w-14 h-14 text-skylight-green mx-auto animate-pulse" />
          <h3 className="font-display font-extrabold text-xl text-skylight-green">
            Spot Reserved Successfully!
          </h3>
          <p className="text-xs text-gray-500 font-light leading-relaxed max-w-sm mx-auto">
            Thank you, <span className="font-bold text-skylight-green">{customerName}</span>. Your ticket reservation is confirmed. We look forward to welcoming you at Jaj mountain campfire!
          </p>
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit} className="space-y-5">
          <h3 className="font-display font-extrabold text-lg text-skylight-green border-b border-gray-100 pb-2">
            Reserve Your Ticket
          </h3>

          {errorMsg && (
            <div className="flex gap-2 bg-red-50 border border-red-100 p-3.5 rounded-xl text-red-700 text-xs font-semibold leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Elie Haddad"
                  className="w-full p-3 pl-9 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-skylight-gold absolute left-3 top-3.5" />
                <input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="elie@haddad.com"
                  className="w-full p-3 pl-9 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                Ticket Count
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all"
                >
                  -
                </button>
                <div className="flex-1 text-center p-2 rounded-xl bg-[#fafbfa] border border-gray-200 text-xs font-bold text-skylight-green flex items-center justify-center gap-1.5">
                  <Ticket className="w-4 h-4 text-skylight-gold" />
                  <span>{ticketCount} Tickets</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketCount(Math.min(remainingCapacity, ticketCount + 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-skylight-green hover:bg-gray-50 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
              <span className="block text-[9px] text-gray-400 mt-1.5 font-light text-right">
                Limit based on {remainingCapacity} spots remaining
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4 bg-[#fafbfa] -mx-6 -mb-6 p-6 rounded-b-3xl mt-4">
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                Total Price:
              </span>
              <span className="text-xl font-display font-extrabold text-skylight-green">
                {ticketPrice > 0 ? `$${totalPrice.toFixed(2)}` : "FREE"}
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 max-w-[200px] flex items-center justify-center gap-1.5 bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-bold text-[10px] tracking-widest py-3.5 rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "CONFIRM SPOT"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
