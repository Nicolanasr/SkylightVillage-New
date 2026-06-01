"use client";

import React, { useState } from "react";
import { submitQROrder } from "@/app/actions";
import { ShoppingCart, Utensils, Award, Plus, Minus, Trash, CheckCircle2, UserCheck, HelpCircle } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

interface Table {
  id: string;
  number: number;
  zone: { name: string };
}

export default function QRMenu({
  categories,
  tables,
  activeTableNumber,
}: {
  categories: Category[];
  tables: Table[];
  activeTableNumber: number;
}) {
  const matchingTable = tables.find((t) => t.number === activeTableNumber) || tables[0];
  
  const [cart, setCart] = useState<{ menuItemId: string; quantity: number; seatNumber: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notes, setNotes] = useState("");

  const addToCart = (menuItemId: string, seatNumber: number) => {
    setCart((prev) => {
      const match = prev.find((i) => i.menuItemId === menuItemId && i.seatNumber === seatNumber);
      if (match) {
        return prev.map((i) =>
          i.menuItemId === menuItemId && i.seatNumber === seatNumber
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prev, { menuItemId, quantity: 1, seatNumber }];
      }
    });
  };

  const updateQuantity = (menuItemId: string, seatNumber: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.menuItemId === menuItemId && i.seatNumber === seatNumber
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (menuItemId: string, seatNumber: number) => {
    setCart((prev) => prev.filter((i) => !(i.menuItemId === menuItemId && i.seatNumber === seatNumber)));
  };

  const getMenuItem = (menuItemId: string) => {
    for (const cat of categories) {
      const match = cat.menuItems.find((i) => i.id === menuItemId);
      if (match) return match;
    }
    return null;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const match = getMenuItem(item.menuItemId);
      return total + (match ? match.price * item.quantity : 0);
    }, 0);
  };

  const handleOrderSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const res = await submitQROrder({
      tableId: matchingTable.id,
      notes,
      items: cart,
    });

    setIsSubmitting(false);
    if (res.success) {
      setOrderSuccess(true);
      setCart([]);
      setNotes("");
    } else {
      setErrorMsg(res.error || "Failed to submit order.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Menu grids */}
      <div className="lg:col-span-2 space-y-8">
        {/* Table welcome banner */}
        <div className="glassmorphic p-6 rounded-3xl border border-skylight-green/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-skylight-gold uppercase tracking-widest block mb-0.5">
              Live QR Cabin Ordering
            </span>
            <h2 className="font-display font-extrabold text-lg text-skylight-green">
              Welcome to Table {matchingTable?.number}
            </h2>
            <p className="text-[10px] text-gray-500 font-light mt-0.5">
              Zone: {matchingTable?.zone.name} • Orders route instantly to kitchen channels.
            </p>
          </div>
          <div className="octagon-clip bg-skylight-green p-3 text-skylight-gold">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-skylight-green text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-[#fafbfa]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category Items */}
        {categories
          .filter((cat) => cat.id === activeCategory)
          .map((cat) => (
            <div key={cat.id} className="space-y-4">
              <h3 className="font-display font-bold text-base text-skylight-green border-b border-gray-100 pb-2">
                {cat.name} Items
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cat.menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-skylight-green/10 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-display font-extrabold text-sm text-skylight-green leading-snug">
                          {item.name}
                        </h4>
                        <span className="font-display font-bold text-sm text-skylight-green">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-light leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Seat Selector add buttons */}
                    <div className="border-t border-gray-50 pt-4 flex flex-col space-y-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Add to cart by Seat / Customer:
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {[1, 2, 3].map((seat) => {
                          const quantityInCart = cart.find(
                            (i) => i.menuItemId === item.id && i.seatNumber === seat
                          )?.quantity || 0;

                          return (
                            <button
                              key={seat}
                              onClick={() => addToCart(item.id, seat)}
                              className={`p-1.5 rounded-lg border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                                quantityInCart > 0
                                  ? "bg-skylight-green-light border-skylight-green text-skylight-green"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-[#fafbfa]"
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Seat {seat} {quantityInCart > 0 ? `(${quantityInCart})` : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Cart side panel */}
      <div className="lg:col-span-1">
        <div className="glassmorphic rounded-3xl border border-skylight-green/10 shadow-2xl p-6 md:p-8 sticky top-24 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-display font-extrabold text-base text-skylight-green flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-skylight-gold" />
              Active Table Cart
            </h3>
            <span className="bg-skylight-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((total, i) => total + i.quantity, 0)} Items
            </span>
          </div>

          {orderSuccess && (
            <div className="text-center py-6 bg-skylight-green-light/40 border border-skylight-green/10 p-4 rounded-2xl space-y-3">
              <CheckCircle2 className="w-8 h-8 text-skylight-green mx-auto" />
              <h4 className="font-display font-bold text-sm text-skylight-green">
                Order Submitted to Kitchen!
              </h4>
              <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                Your dishes and beverages have been routed to active preparation channels (Bar/Grill/Shisha). Track comments on waiter pickup screens!
              </p>
              <button
                onClick={() => setOrderSuccess(false)}
                className="text-[10px] font-bold text-skylight-green border-b border-skylight-green pb-0.5"
              >
                Place another order
              </button>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-3">
              <HelpCircle className="w-10 h-10 text-skylight-green/20 mx-auto" />
              <p className="text-xs font-light">Your shopping cart is currently empty.</p>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                Select menu items on the left and assign them to specific Seats to support individual check invoices later!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group cart items by Seat for gorgeous invoice visualization */}
              {[1, 2, 3].map((seat) => {
                const seatItems = cart.filter((i) => i.seatNumber === seat);
                if (seatItems.length === 0) return null;

                return (
                  <div key={seat} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <span className="text-[9px] font-extrabold text-skylight-gold uppercase tracking-widest block mb-2">
                      Seat #{seat} Invoice Group
                    </span>
                    <ul className="space-y-2.5">
                      {seatItems.map((item, idx) => {
                        const m = getMenuItem(item.menuItemId);
                        if (!m) return null;

                        return (
                          <li key={idx} className="flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-skylight-green">
                                {m.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <span>${m.price.toFixed(2)} each</span>
                                <button
                                  onClick={() => removeFromCart(item.menuItemId, seat)}
                                  className="text-red-500 hover:text-red-700 font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.menuItemId, seat, -1)}
                                className="p-1 rounded-md bg-[#fafbfa] border border-gray-200 hover:bg-gray-100"
                              >
                                <Minus className="w-3 h-3 text-skylight-green" />
                              </button>
                              <span className="font-mono font-bold text-skylight-green w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.menuItemId, seat, 1)}
                                className="p-1 rounded-md bg-[#fafbfa] border border-gray-200 hover:bg-gray-100"
                              >
                                <Plus className="w-3 h-3 text-skylight-green" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}

              {/* Order Notes */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                  Special Notes / Allergens
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. grill well done, separate sauces, extra shisha coal..."
                  className="w-full p-2.5 rounded-lg bg-[#fafbfa] border border-gray-200 text-[10px] text-skylight-green focus:outline-none focus:border-skylight-green"
                  rows={2}
                />
              </div>

              {/* Total Display & Submit */}
              <div className="border-t border-gray-100 pt-4 bg-[#fafbfa] -mx-6 -mb-6 p-6 rounded-b-3xl space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Subtotal Check:
                  </span>
                  <span className="text-2xl font-display font-extrabold text-skylight-green">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleOrderSubmit}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 octagon-clip bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-xs tracking-widest py-4 transition-all shadow-lg"
                >
                  <Utensils className="w-4 h-4" />
                  {isSubmitting ? "TRANSMITTING..." : "SUBMIT ORDER TO KITCHEN"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
