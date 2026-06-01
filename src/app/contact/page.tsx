"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";

export default function ContactPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-20">Loading contact page...</div>}>
      <ContactForm />
    </React.Suspense>
  );
}

function ContactForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    scoutGroup: "No",
    groupSize: "1",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const eventName = searchParams.get("event");
    if (eventName) {
      setFormData((prev) => ({
        ...prev,
        subject: `Event Ticket: ${decodeURIComponent(eventName)}`,
        message: `I would like to reserve spots for the event: "${decodeURIComponent(eventName)}". Please confirm availability and ticket delivery details!`,
      }));
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Scout capacity check
    if (formData.scoutGroup === "Yes" && parseInt(formData.groupSize) < 50) {
      setErrorMsg("Scout group bookings require a minimum capacity of 50 members to reserve Zone 1 or Zone 2 campgrounds.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Get in Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
            Connect With Skylight
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4" />
          <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-6">
            Inquire for scout gatherings, stargazing corporate events, or restaurant reservations. Our mountain support team in Jaj is ready to help.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Coordinates */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-xl font-display font-extrabold text-skylight-green mb-4">
                Camp Coordinates
              </h2>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Skylight Village sits at 1,200m altitude in Jaj, Mount Lebanon. Perfect crisp clean atmosphere.
              </p>
            </div>

            <ul className="space-y-5 text-xs text-gray-700">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                <div>
                  <span className="font-semibold text-skylight-green block">Location</span>
                  <span>Jaj, Mount Lebanon, Lebanon</span>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                <div>
                  <span className="font-semibold text-skylight-green block">Direct Hotlines</span>
                  <span>+961 76 987654 / +961 09 123456</span>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                <div>
                  <span className="font-semibold text-skylight-green block">Support Email</span>
                  <span>reservations@skylightvillagelb.com</span>
                </div>
              </li>
            </ul>

            <div className="bg-skylight-green-light p-6 rounded-2xl border border-skylight-green/10 space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-skylight-green">
                <HelpCircle className="w-4 h-4 text-skylight-gold" />
                Need Immediate Help?
              </span>
              <p className="text-[10px] text-gray-600 leading-relaxed font-light">
                For urgent tables or wood tent booking confirmation within 24 hours, please call our phone lines directly for quick updates.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-skylight-green/10 shadow-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-skylight-gold/5 rounded-full blur-3xl" />

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="w-12 h-12 text-skylight-green mx-auto animate-bounce" />
                <h3 className="font-display font-extrabold text-2xl text-skylight-green">
                  Inquiry Received!
                </h3>
                <p className="text-xs text-gray-500 font-light max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-skylight-green">{formData.name}</span>. Our scout booking and dining reservation desk in Jaj has logged your message and will confirm via phone or email within 12 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-skylight-green border-b border-skylight-green pb-0.5"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display font-extrabold text-xl text-skylight-green">
                  Submit Reservation Request
                </h3>

                {errorMsg && (
                  <div className="flex gap-2 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs font-semibold leading-relaxed animate-shake">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Elie Haddad"
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="elie@haddad.com"
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Phone Number
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+961 70 123456"
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Subject
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Scout campsite, table booking..."
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Are you a Scout Group?
                    </label>
                    <select
                      value={formData.scoutGroup}
                      onChange={(e) => setFormData({ ...formData, scoutGroup: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    >
                      <option value="No">No, Individual / Family camping</option>
                      <option value="Yes">Yes, Active Scout Troop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Estimated Group Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.groupSize}
                      onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                    Custom Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about dates, special requests, shisha arrangements, or hiking trail support..."
                    className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 octagon-clip bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-xs tracking-widest py-4 transition-all"
                >
                  <Send className="w-4 h-4" />
                  SUBMIT INQUIRY
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
