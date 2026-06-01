"use client";

import React, { useState } from "react";
import { logStockWaste } from "@/app/actions";
import { Trash2, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, RefreshCw, FileText } from "lucide-react";

interface WasteLog {
  id: string;
  quantity: number;
  reason: string;
  createdAt: Date;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expirationDate: Date | null;
  wasteLogs: WasteLog[];
}

export default function AdminStockDashboard({
  stockItems,
  wasteLogs,
}: {
  stockItems: StockItem[];
  wasteLogs: { id: string; stockItem: { name: string }; quantity: number; reason: string; createdAt: Date }[];
}) {
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState("EXPIRED");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockItem) return;
    setErrorMsg("");
    setIsSubmitting(true);

    if (wasteQty > selectedStockItem.quantity) {
      setErrorMsg(`Cannot write off ${wasteQty} units. Only ${selectedStockItem.quantity} currently in stock.`);
      setIsSubmitting(false);
      return;
    }

    const res = await logStockWaste(selectedStockItem.id, wasteQty, wasteReason);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSelectedStockItem(null);
        window.location.reload();
      }, 1500);
    } else {
      setErrorMsg(res.error || "Failed to log stock write-off.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Stock listings */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glassmorphic p-6 rounded-3xl border border-skylight-green/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-0.5">
              Inventory Manager
            </span>
            <h2 className="font-display font-extrabold text-lg text-skylight-green">
              Cabin Stock & Provisions
            </h2>
            <p className="text-[10px] text-gray-500 font-light mt-0.5">
              Tracks menu auto-deductions, low thresholds warnings ($&lt;15$ units), and expiration calendars.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-4 py-2 bg-skylight-green-light border border-skylight-green/10 hover:bg-skylight-green hover:text-white rounded-xl text-xs font-semibold text-skylight-green transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Stock
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-skylight-green-light/40 text-skylight-green uppercase tracking-widest text-[9px] font-extrabold border-b border-gray-100">
                  <th className="p-4 pl-6">Stock Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Available Qty</th>
                  <th className="p-4">Status & Alerts</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stockItems.map((item) => {
                  const isLowStock = item.quantity <= item.minThreshold;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-4 pl-6 font-semibold text-skylight-green">
                        {item.name}
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium font-mono uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                            <AlertTriangle className="w-3 h-3" /> LOW STOCK ({item.quantity} left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => {
                            setSelectedStockItem(item);
                            setWasteQty(1);
                            setWasteReason("EXPIRED");
                            setSuccess(false);
                            setErrorMsg("");
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors inline-block"
                          title="Log Spoiled/Expired Waste"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Waste Audit Feed */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glassmorphic rounded-3xl border border-skylight-green/10 shadow-2xl p-6 md:p-8 space-y-4">
          <h3 className="font-display font-extrabold text-base text-skylight-green flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="w-5 h-5 text-skylight-gold" />
            Waste & Write-off Logs
          </h3>

          {wasteLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-light">
              No recent waste logs found.
            </div>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {wasteLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#fafbfa] border border-gray-100 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold uppercase">
                      {log.reason}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-skylight-green leading-snug">
                    {log.quantity} units of {log.stockItem.name}
                  </h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Waste Modal */}
      {selectedStockItem && (
        <div className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-skylight-green/10 p-6 md:p-8 relative animate-scale-up">
            <button
              onClick={() => setSelectedStockItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-skylight-green font-bold text-sm"
            >
              Close
            </button>

            {success ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="w-12 h-12 text-skylight-green mx-auto" />
                <h3 className="font-display font-extrabold text-xl text-skylight-green">
                  Stock Deducted Successfully!
                </h3>
                <p className="text-xs text-gray-500 font-light max-w-xs mx-auto leading-relaxed">
                  The stock has been written off and successfully logged into the village waste audit ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWasteSubmit} className="space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
                    Log Waste / Expired Inventory
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-skylight-green">
                    Write off: {selectedStockItem.name}
                  </h3>
                </div>

                {errorMsg && (
                  <div className="flex gap-2 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs font-semibold leading-relaxed">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Quantity to write off
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      max={selectedStockItem.quantity}
                      value={wasteQty}
                      onChange={(e) => setWasteQty(parseInt(e.target.value) || 1)}
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Reason for Write-off
                    </label>
                    <select
                      value={wasteReason}
                      onChange={(e) => setWasteReason(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    >
                      <option value="EXPIRED">Expired Food/Beverage item</option>
                      <option value="SPOILED">Spoiled / Bad item</option>
                      <option value="DAMAGED">Damaged / Broken asset items</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="octagon-clip bg-red-600 hover:bg-red-700 text-white font-display font-extrabold text-xs tracking-widest px-8 py-4 transition-all shadow-lg"
                  >
                    {isSubmitting ? "LOGGING..." : "LOG DEDUCTION"}
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
