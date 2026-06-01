"use client";

import React, { useState } from "react";
import {
  updateOrderItemStatus,
  updateOrderStatus,
  combineRestaurantTables,
  splitRestaurantTable,
  createInvoiceForSeat,
  markInvoiceAsPaid,
} from "@/app/actions";
import {
  Utensils,
  UserCheck,
  Combine,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  UserMinus,
  RefreshCw,
  BellRing,
  Award,
  BadgeAlert,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  seatNumber: number;
  status: string; // PENDING, PREPARING, READY, SERVED
  invoiceId: string | null;
  menuItem: { name: string; price: number };
}

interface Invoice {
  id: string;
  invoiceName: string;
  totalPrice: number;
  status: string; // UNPAID, PAID
}

interface Order {
  id: string;
  status: string; // PENDING, PREPARING, READY_TO_SERVE, SERVED, PAID
  notes: string | null;
  items: OrderItem[];
  invoices: Invoice[];
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  mergedWithTableId: string | null;
  assignedStaffId: string | null;
  assignedStaff: { name: string } | null;
  zone: { name: string };
  orders: Order[];
}

export default function WaiterDashboard({
  initialTables,
  staffList,
}: {
  initialTables: Table[];
  staffList: { id: string; name: string; role: string }[];
}) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [splitInvoiceName, setSplitInvoiceName] = useState("");

  const activeTable = tables.find((t) => t.id === selectedTableId);
  const activeOrder = activeTable?.orders.find((o) => o.status !== "PAID");

  const handleServeItem = async (itemId: string) => {
    setLoadingAction(true);
    const res = await updateOrderItemStatus(itemId, "SERVED");
    setLoadingAction(false);
    if (res.success) {
      // Reload page to get fresh items or refresh state
      window.location.reload();
    }
  };

  const handleMergeTables = async (targetTableId: string) => {
    if (!mergeSourceId || mergeSourceId === targetTableId) return;
    setLoadingAction(true);
    const res = await combineRestaurantTables(targetTableId, mergeSourceId);
    setLoadingAction(false);
    setMergeSourceId(null);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleSplitTable = async (tableId: string) => {
    setLoadingAction(true);
    const res = await splitRestaurantTable(tableId);
    setLoadingAction(false);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleCreateSplitInvoice = async (seatNum: number) => {
    if (!activeOrder) return;
    setLoadingAction(true);
    const checkName = splitInvoiceName || `Seat ${seatNum} Split`;
    const res = await createInvoiceForSeat(activeOrder.id, seatNum, checkName);
    setLoadingAction(false);
    setSplitInvoiceName("");
    if (res.success) {
      window.location.reload();
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    setLoadingAction(true);
    const res = await markInvoiceAsPaid(invoiceId);
    setLoadingAction(false);
    if (res.success) {
      window.location.reload();
    }
  };

  const handlePayOrderInFull = async (orderId: string) => {
    setLoadingAction(true);
    const res = await updateOrderStatus(orderId, "PAID");
    setLoadingAction(false);
    if (res.success) {
      window.location.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Tables layout grid */}
      <div className="lg:col-span-2 space-y-8">
        <div className="glassmorphic p-6 rounded-3xl border border-skylight-green/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-skylight-gold uppercase tracking-widest block mb-0.5">
              Service Operations
            </span>
            <h2 className="font-display font-extrabold text-lg text-skylight-green">
              Table & Waiter Lounge
            </h2>
            <p className="text-[10px] text-gray-500 font-light mt-0.5">
              Monitor orders, manage table combinations, and execute dynamic seat-split checkouts.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-4 py-2 bg-skylight-green-light border border-skylight-green/10 hover:bg-skylight-green hover:text-white rounded-xl text-xs font-semibold text-skylight-green transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Board
          </button>
        </div>

        {/* Merge action hint */}
        {mergeSourceId && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-800 text-xs font-semibold flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">
              <BadgeAlert className="w-5 h-5 text-amber-600" />
              Selecting target table to MERGE Table {tables.find((t) => t.id === mergeSourceId)?.number} into...
            </span>
            <button
              onClick={() => setMergeSourceId(null)}
              className="text-[10px] bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-lg text-amber-900"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {tables.map((table) => {
            const hasActiveOrder = table.orders.some((o) => o.status !== "PAID");
            const activeOrder = table.orders.find((o) => o.status !== "PAID");
            
            // Check if there are items ready to serve
            const hasReadyItems = activeOrder?.items.some((i) => i.status === "READY") || false;
            const isMerged = table.mergedWithTableId !== null;

            return (
              <div
                key={table.id}
                onClick={() => {
                  if (mergeSourceId) {
                    handleMergeTables(table.id);
                  } else {
                    setSelectedTableId(table.id);
                  }
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                  selectedTableId === table.id
                    ? "bg-skylight-green text-white border-skylight-green shadow-xl scale-[1.02]"
                    : isMerged
                    ? "bg-gray-100 border-gray-200 text-gray-400"
                    : hasReadyItems
                    ? "bg-cyan-50 border-cyan-300 text-cyan-900 shadow-md animate-pulse"
                    : hasActiveOrder
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm"
                    : "bg-white border-gray-100 text-skylight-green hover:bg-[#fafbfa] shadow-sm"
                }`}
              >
                {/* Visual alert */}
                {hasReadyItems && (
                  <div className="absolute top-2 right-2 z-10 p-1 bg-cyan-600 text-white rounded-full animate-bounce">
                    <BellRing className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display font-extrabold text-xl">
                      Table {table.number}
                    </h3>
                    <span className="text-[9px] uppercase font-bold tracking-wider">
                      Cap: {table.capacity}
                    </span>
                  </div>

                  <p className="text-[10px] font-light">
                    {table.zone.name}
                  </p>
                </div>

                <div className="border-t border-current/15 pt-3 mt-4 flex items-center justify-between text-[9px] font-semibold">
                  <span className="uppercase">
                    {isMerged
                      ? "Merged Combo"
                      : hasActiveOrder
                      ? "Occupied"
                      : "Open Table"}
                  </span>
                  <span>
                    {table.assignedStaff ? `Srv: ${table.assignedStaff.name}` : "Unassigned"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Table details */}
      <div className="lg:col-span-1">
        <div className="glassmorphic rounded-3xl border border-skylight-green/10 shadow-2xl p-6 md:p-8 sticky top-24 space-y-6 min-h-[60vh]">
          {activeTable ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[9px] font-bold text-skylight-gold uppercase tracking-widest block">
                    Table Details
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-skylight-green">
                    Table {activeTable.number}
                  </h3>
                </div>
                <div className="flex gap-1.5">
                  {!activeTable.mergedWithTableId ? (
                    <button
                      onClick={() => setMergeSourceId(activeTable.id)}
                      className="p-1.5 bg-skylight-green-light border border-skylight-green/10 text-skylight-green hover:bg-skylight-green hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
                      title="Merge Table"
                    >
                      <Combine className="w-3.5 h-3.5" />
                      Merge
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSplitTable(activeTable.id)}
                      className="p-1.5 bg-red-50 border border-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
                      title="Split Combined Tables"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      Split
                    </button>
                  )}
                </div>
              </div>

              {!activeOrder ? (
                <div className="text-center py-12 text-gray-400 space-y-3">
                  <Utensils className="w-10 h-10 text-skylight-green/20 mx-auto" />
                  <p className="text-xs font-light">Table is currently empty / open.</p>
                  <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Once customers scan the Table QR code and submit dishes, orders will stream here in real time!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order items segmented by seat */}
                  <div className="space-y-4">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green">
                      Active Dishes & Prep States
                    </span>

                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                      {activeOrder.items.map((item) => {
                        const isInvoiced = item.invoiceId !== null;

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
                              item.status === "READY"
                                ? "bg-cyan-50 border-cyan-200 text-cyan-900"
                                : isInvoiced
                                ? "bg-gray-100 border-gray-100 text-gray-400"
                                : "bg-white border-gray-100 text-skylight-green"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold block">
                                {item.quantity}x {item.menuItem.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <span>Seat #{item.seatNumber}</span>
                                <span>•</span>
                                <span className="font-semibold text-skylight-gold">
                                  {item.status === "READY" ? "READY FOR PICKUP" : item.status}
                                </span>
                              </div>
                            </div>

                            {item.status === "READY" && (
                              <button
                                onClick={() => handleServeItem(item.id)}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-2.5 py-1 rounded text-[9px] font-display font-extrabold uppercase tracking-widest shadow-sm"
                              >
                                SERVE ITEM
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seat Invoices / Billing */}
                  <div className="border-t border-gray-100 pt-5 space-y-4">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green">
                      Split Checkout Invoices
                    </span>

                    {/* Active dynamic Checks */}
                    {activeOrder.invoices.length > 0 && (
                      <div className="space-y-2">
                        {activeOrder.invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
                              inv.status === "PAID"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                : "bg-white border-gray-200 text-skylight-green"
                            }`}
                          >
                            <div>
                              <span className="font-bold block">{inv.invoiceName}</span>
                              <span className="text-[10px] text-gray-500 font-semibold">
                                Total: ${inv.totalPrice.toFixed(2)}
                              </span>
                            </div>

                            {inv.status === "UNPAID" ? (
                              <button
                                onClick={() => handlePayInvoice(inv.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-display font-extrabold uppercase tracking-widest shadow"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <span className="text-[9px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> PAID
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Invoice generator */}
                    <div className="bg-[#fafbfa] p-4 rounded-2xl border border-gray-100 space-y-3">
                      <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                        Generate Split Seat Invoice:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={splitInvoiceName}
                          onChange={(e) => setSplitInvoiceName(e.target.value)}
                          placeholder="Check name (e.g. Elie Check)"
                          className="flex-1 p-2 rounded-lg bg-white border border-gray-200 text-[10px] text-skylight-green focus:outline-none"
                        />
                        <div className="flex gap-1">
                          {[1, 2, 3].map((seatNum) => {
                            // Check if this seat has items that aren't invoiced yet
                            const hasUninvoicedItems = activeOrder.items.some(
                              (i) => i.seatNumber === seatNum && i.invoiceId === null
                            );

                            return (
                              <button
                                key={seatNum}
                                disabled={!hasUninvoicedItems}
                                onClick={() => handleCreateSplitInvoice(seatNum)}
                                className="px-2.5 py-2 bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark disabled:opacity-30 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                Seat {seatNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Pay order in full */}
                    <button
                      onClick={() => handlePayOrderInFull(activeOrder.id)}
                      className="w-full flex items-center justify-center gap-2 octagon-clip bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-xs tracking-widest py-4 transition-all shadow-lg"
                    >
                      <CreditCard className="w-4 h-4" />
                      PAY ENTIRE TABLE BILL
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 space-y-3">
              <Award className="w-10 h-10 text-skylight-green/20 mx-auto" />
              <h3 className="font-display font-bold text-sm text-skylight-green">
                Select a Dining Table
              </h3>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                Click on any active table clearing on the left to track orders, combine table bills, or check out split seat invoices!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
