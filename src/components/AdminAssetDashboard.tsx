"use client";

import React, { useState } from "react";
import { transferAssetAllocation } from "@/app/actions";
import { Hammer, Move, ShieldAlert, CheckCircle, RefreshCw, Layers, Sparkles } from "lucide-react";

interface Allocation {
  id: string;
  location: string;
  quantity: number;
  status: string;
}

interface Asset {
  id: string;
  name: string;
  totalQty: number;
  allocations: Allocation[];
}

export default function AdminAssetDashboard({ assets }: { assets: Asset[] }) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sourceLoc, setSourceLoc] = useState("RESERVE");
  const [targetLoc, setTargetLoc] = useState("RESTAURANT");
  const [transferQty, setTransferQty] = useState(5);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const locations = ["RESTAURANT", "CAMPGROUND", "RESERVE", "REPAIR", "DISCARDED"];

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setErrorMsg("");
    setIsSubmitting(true);

    const sourceAlloc = selectedAsset.allocations.find((a) => a.location === sourceLoc);
    if (!sourceAlloc || sourceAlloc.quantity < transferQty) {
      setErrorMsg(`Insufficient asset quantity. Only ${sourceAlloc?.quantity || 0} units available at ${sourceLoc}.`);
      setIsSubmitting(false);
      return;
    }

    const res = await transferAssetAllocation(selectedAsset.id, sourceLoc, targetLoc, transferQty);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSelectedAsset(null);
        window.location.reload();
      }, 1500);
    } else {
      setErrorMsg(res.error || "Failed to execute transfer.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="glassmorphic p-6 rounded-3xl border border-skylight-green/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-0.5">
            Logistics Control
          </span>
          <h2 className="font-display font-extrabold text-lg text-skylight-green">
            Village Equipment & Asset Allocations
          </h2>
          <p className="text-[10px] text-gray-500 font-light mt-0.5">
            Manage tables, chairs, and dome tents. Seamlessly transfer allocations to campgrounds, repair bays, or write off broken assets.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-4 py-2 bg-skylight-green-light border border-skylight-green/10 hover:bg-skylight-green hover:text-white rounded-xl text-xs font-semibold text-skylight-green transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Assets
        </button>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {assets.map((asset) => {
          return (
            <div
              key={asset.id}
              className="bg-white rounded-3xl border border-skylight-green/10 shadow-lg overflow-hidden flex flex-col justify-between hover-lift"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <span className="bg-skylight-green text-white text-[9px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                    Equipment Asset
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono font-bold">
                    Total: {asset.totalQty} Units
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-lg text-skylight-green border-b border-gray-100 pb-3">
                  {asset.name}
                </h3>

                {/* Allocations breakdown list */}
                <div className="space-y-2.5">
                  {locations.map((loc) => {
                    const alloc = asset.allocations.find((a) => a.location === loc);
                    const qty = alloc?.quantity || 0;

                    return (
                      <div
                        key={loc}
                        className="flex justify-between items-center text-xs p-2 rounded-lg bg-[#fafbfa] border border-gray-50"
                      >
                        <span className="font-semibold text-gray-500 tracking-wider text-[10px]">
                          {loc}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            loc === "REPAIR" && qty > 0
                              ? "text-red-500 font-semibold"
                              : loc === "DISCARDED" && qty > 0
                              ? "text-gray-400 font-normal line-through"
                              : "text-skylight-green"
                          }`}
                        >
                          {qty} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-8 bg-[#fafbfa] border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedAsset(asset);
                    setSourceLoc("RESERVE");
                    setTargetLoc("RESTAURANT");
                    setTransferQty(1);
                    setSuccess(false);
                    setErrorMsg("");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 octagon-clip bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-bold text-[10px] tracking-widest py-3.5 transition-colors shadow-md"
                >
                  <Move className="w-3.5 h-3.5" />
                  TRANSFER ALLOCATIONS
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Asset Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-skylight-green/10 p-6 md:p-8 relative animate-scale-up">
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-skylight-green font-bold text-sm"
            >
              Close
            </button>

            {success ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="w-12 h-12 text-skylight-green mx-auto animate-bounce" />
                <h3 className="font-display font-extrabold text-xl text-skylight-green">
                  Allocations Transferred!
                </h3>
                <p className="text-xs text-gray-500 font-light max-w-xs mx-auto leading-relaxed">
                  The physical equipment allocation has been updated. Stock counts adjusted instantly across locations.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-1">
                    Asset Allocation Transfer
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-skylight-green">
                    Adjust: {selectedAsset.name}
                  </h3>
                </div>

                {errorMsg && (
                  <div className="flex gap-2 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs font-semibold leading-relaxed animate-shake">
                    <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                        Source Location
                      </label>
                      <select
                        value={sourceLoc}
                        onChange={(e) => setSourceLoc(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                      >
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                        Target Location
                      </label>
                      <select
                        value={targetLoc}
                        onChange={(e) => setTargetLoc(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                      >
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                      Quantity to Transfer
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={transferQty}
                      onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                      className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="octagon-clip bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-xs tracking-widest px-8 py-4 transition-all shadow-lg"
                  >
                    {isSubmitting ? "PROCESSING..." : "CONFIRM TRANSFER"}
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
