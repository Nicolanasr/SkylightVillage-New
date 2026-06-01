"use client";

import React, { useState } from "react";
import { updateOrderItemStatus } from "@/app/actions";
import { Flame, Compass, RefreshCw, CheckCircle, Clock, ChefHat, GlassWater } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  seatNumber: number;
  status: string; // PENDING, PREPARING, READY, SERVED
  prepZone: string; // KITCHEN_GRILL, KITCHEN_COLD, BAR, SHISHA
  menuItem: { name: string };
  order: {
    table: { number: number; zone: { name: string } };
    notes: string | null;
    createdAt: Date;
  };
}

export default function KitchenDashboard({ initialItems }: { initialItems: OrderItem[] }) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  // Filter items in active prep loop
  const activeItems = items.filter((i) => i.status === "PENDING" || i.status === "PREPARING" || i.status === "READY");

  const handleStatusChange = async (itemId: string, currentStatus: string) => {
    let nextStatus = "PREPARING";
    if (currentStatus === "PREPARING") nextStatus = "READY";
    
    setLoadingItemId(itemId);
    const res = await updateOrderItemStatus(itemId, nextStatus);
    setLoadingItemId(null);

    if (res.success) {
      // Update local state dynamically
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: nextStatus } : i))
      );
    }
  };

  const stations = [
    { key: "KITCHEN_GRILL", name: "Grill Station", icon: <Flame className="w-5 h-5 text-red-500" /> },
    { key: "KITCHEN_COLD", name: "Cold Kitchen", icon: <ChefHat className="w-5 h-5 text-emerald-500" /> },
    { key: "BAR", name: "Beverages & Bar", icon: <GlassWater className="w-5 h-5 text-cyan-500" /> },
    { key: "SHISHA", name: "Shisha Lounge", icon: <Flame className="w-5 h-5 text-amber-500" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="glassmorphic p-6 rounded-3xl border border-skylight-green/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-0.5">
            Active Prep Queues
          </span>
          <h2 className="font-display font-extrabold text-lg text-skylight-green">
            Multi-Channel Kitchen Terminal
          </h2>
          <p className="text-[10px] text-gray-500 font-light mt-0.5">
            Real-time orders grouped by target prep station. Updates immediately notify waiters for pickup.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-4 py-2 bg-skylight-green-light border border-skylight-green/10 hover:bg-skylight-green hover:text-white rounded-xl text-xs font-semibold text-skylight-green transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Board
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {stations.map((st) => {
          const stationItems = activeItems.filter((i) => i.prepZone === st.key);

          return (
            <div
              key={st.key}
              className="bg-white rounded-3xl border border-skylight-green/10 shadow-lg p-5 flex flex-col min-h-[60vh] relative overflow-hidden"
            >
              {/* Station title */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                {st.icon}
                <h3 className="font-display font-extrabold text-sm text-skylight-green">
                  {st.name}
                </h3>
                <span className="ml-auto bg-skylight-green-light text-skylight-green text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {stationItems.length}
                </span>
              </div>

              {/* Items list */}
              {stationItems.length === 0 ? (
                <div className="my-auto text-center text-gray-400 py-12 space-y-2">
                  <CheckCircle className="w-8 h-8 text-skylight-green/20 mx-auto" />
                  <p className="text-[11px] font-light">No active orders queued</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
                  {stationItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.status === "PREPARING"
                          ? "bg-amber-50/50 border-amber-200"
                          : item.status === "READY"
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-[#fafbfa] border-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono font-bold text-skylight-green">
                          T#{item.order.table.number} • Seat {item.seatNumber}
                        </span>
                        <span
                          className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.status === "PREPARING"
                              ? "bg-amber-500 text-white animate-pulse"
                              : item.status === "READY"
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-400 text-white"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h4 className="font-display font-extrabold text-xs text-skylight-green leading-snug">
                        {item.quantity}x {item.menuItem.name}
                      </h4>

                      {/* Display special comments/notes */}
                      {item.order.notes && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-100 mt-2 font-mono font-light">
                          Note: "{item.order.notes}"
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span className="text-[9px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Just now
                        </span>

                        {item.status !== "READY" ? (
                          <button
                            onClick={() => handleStatusChange(item.id, item.status)}
                            disabled={loadingItemId === item.id}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-display font-extrabold uppercase tracking-widest shadow-sm transition-all ${
                              item.status === "PENDING"
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {loadingItemId === item.id
                              ? "UPD..."
                              : item.status === "PENDING"
                              ? "START COOK"
                              : "READY TO SERVE"}
                          </button>
                        ) : (
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                            Waiting for Waiter
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
