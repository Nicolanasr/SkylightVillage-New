"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    createStockItem,
    updateStockItem,
    restockItem,
    deleteStockItem,
    logStockWaste,
    createAsset,
    updateAsset,
    deleteAsset,
    allocateAsset,
    deleteAssetAllocation,
} from "@/app/actions/adminStockActions";
import {
    Trash2,
    AlertTriangle,
    CheckCircle,
    Plus,
    Edit,
    Activity,
    Layers,
    FileText,
    Search,
    Package,
    Boxes,
    MapPin,
    RefreshCw,
    History,
} from "lucide-react";

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

interface StockMovement {
    id: string;
    stockItemId: string;
    stockItem: { name: string; unit: string };
    quantity: number;
    type: string;
    notes: string | null;
    createdAt: Date;
}

interface AssetAllocation {
    id: string;
    assetId: string;
    location: string;
    quantity: number;
    status: string;
}

interface Asset {
    id: string;
    name: string;
    totalQty: number;
    allocations: AssetAllocation[];
}

export default function AdminStockDashboard({
    stockItems,
    wasteLogs,
    initialAssets,
    stockMovements = [],
}: {
    stockItems: StockItem[];
    wasteLogs: { id: string; stockItem: { name: string }; quantity: number; reason: string; createdAt: Date }[];
    initialAssets: Asset[];
    stockMovements?: StockMovement[];
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<"consumables" | "assets">("consumables");
    const [sideTab, setSideTab] = useState<"audit" | "movement">("movement");

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Common Action States
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Modals Type & Selection
    const [modalType, setModalType] = useState<"stock_form" | "waste_form" | "asset_form" | "allocate_form" | "restock_form" | null>(null);
    const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // Form Field States - Consumables
    const [stockForm, setStockForm] = useState({
        name: "",
        category: "FOOD",
        quantity: 10,
        unit: "units",
        minThreshold: 15,
        expirationDate: "",
    });

    const [wasteQty, setWasteQty] = useState(1);
    const [wasteReason, setWasteReason] = useState("EXPIRED");
    const [restockQty, setRestockQty] = useState(10);

    // Form Field States - Assets
    const [assetForm, setAssetForm] = useState({
        name: "",
        totalQty: 10,
    });

    const [allocationForm, setAllocationForm] = useState({
        location: "CAMPGROUND",
        quantity: 1,
        status: "ACTIVE",
    });

    // Filter Logic - Consumables
    const filteredStock = stockItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
        const isLowStock = item.quantity <= item.minThreshold;
        const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();

        let matchesStatus = true;
        if (statusFilter === "LOW_STOCK") matchesStatus = isLowStock;
        if (statusFilter === "EXPIRED") matchesStatus = !!isExpired;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Filter Logic - Assets
    const filteredAssets = initialAssets.filter((asset) => {
        return asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Actions handlers
    const handleStockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        let res;
        if (selectedStockItem) {
            res = await updateStockItem(selectedStockItem.id, stockForm);
        } else {
            res = await createStockItem(stockForm);
        }

        setActionLoading(false);
        if (res.success) {
            setSuccessMsg(selectedStockItem ? "Stock item updated!" : "New stock item added!");
            startTransition(() => {
                router.refresh();
            });
            setTimeout(() => {
                setModalType(null);
                setSelectedStockItem(null);
            }, 1200);
        } else {
            setErrorMsg(res.error || "Action failed.");
        }
    };

    const handleRestockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStockItem) return;
        setActionLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const res = await restockItem(selectedStockItem.id, restockQty);
        setActionLoading(false);

        if (res.success) {
            setSuccessMsg("Stock updated successfully!");
            startTransition(() => {
                router.refresh();
            });
            setTimeout(() => {
                setModalType(null);
                setSelectedStockItem(null);
            }, 1200);
        } else {
            setErrorMsg(res.error || "Failed to update stock.");
        }
    };

    const handleWasteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStockItem) return;
        setActionLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (wasteQty > selectedStockItem.quantity) {
            setErrorMsg(`Cannot write off ${wasteQty} units. Only ${selectedStockItem.quantity} currently in stock.`);
            setActionLoading(false);
            return;
        }

        const res = await logStockWaste(selectedStockItem.id, wasteQty, wasteReason);
        setActionLoading(false);

        if (res.success) {
            setSuccessMsg("Waste written off successfully!");
            startTransition(() => {
                router.refresh();
            });
            setTimeout(() => {
                setModalType(null);
                setSelectedStockItem(null);
            }, 1200);
        } else {
            setErrorMsg(res.error || "Failed to log write-off.");
        }
    };

    const handleDeleteStock = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stock item? This will also purge its waste logs.")) return;
        const res = await deleteStockItem(id);
        if (res.success) {
            startTransition(() => {
                router.refresh();
            });
        } else {
            alert("Delete failed: " + res.error);
        }
    };

    const handleAssetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        let res;
        if (selectedAsset) {
            res = await updateAsset(selectedAsset.id, assetForm);
        } else {
            res = await createAsset(assetForm);
        }

        setActionLoading(false);
        if (res.success) {
            setSuccessMsg(selectedAsset ? "Asset details updated!" : "New asset added!");
            startTransition(() => {
                router.refresh();
            });
            setTimeout(() => {
                setModalType(null);
                setSelectedAsset(null);
            }, 1200);
        } else {
            setErrorMsg(res.error || "Action failed.");
        }
    };

    const handleDeleteAssetItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this asset? This will discard all current allocations.")) return;
        const res = await deleteAsset(id);
        if (res.success) {
            startTransition(() => {
                router.refresh();
            });
        } else {
            alert("Delete failed: " + res.error);
        }
    };

    const handleAllocationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset) return;
        setActionLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const currentAllocated = selectedAsset.allocations.reduce((sum, a) => sum + a.quantity, 0);
        const available = selectedAsset.totalQty - currentAllocated;

        if (allocationForm.quantity > available) {
            setErrorMsg(`Cannot allocate ${allocationForm.quantity} units. Only ${available} available.`);
            setActionLoading(false);
            return;
        }

        const res = await allocateAsset({
            assetId: selectedAsset.id,
            location: allocationForm.location,
            quantity: allocationForm.quantity,
            status: allocationForm.status,
        });
        setActionLoading(false);

        if (res.success) {
            setSuccessMsg("Asset allocation logged!");
            startTransition(() => {
                router.refresh();
            });
            setTimeout(() => {
                setModalType(null);
                setSelectedAsset(null);
            }, 1200);
        } else {
            setErrorMsg(res.error || "Failed to save allocation.");
        }
    };

    const handleReleaseAllocation = async (id: string) => {
        if (!confirm("Are you sure you want to release this allocation?")) return;
        const res = await deleteAssetAllocation(id);
        if (res.success) {
            startTransition(() => {
                router.refresh();
            });
        } else {
            alert("Release allocation failed: " + res.error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs Selector Navigation */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button
                    onClick={() => {
                        setActiveTab("consumables");
                        setSearchQuery("");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition border-0 cursor-pointer ${activeTab === "consumables"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200"
                        }`}
                >
                    <Package className="w-4 h-4" />
                    Consumable Provisions
                </button>
                <button
                    onClick={() => {
                        setActiveTab("assets");
                        setSearchQuery("");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition border-0 cursor-pointer ${activeTab === "assets"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200"
                        }`}
                >
                    <Boxes className="w-4 h-4" />
                    Rental & Village Assets
                </button>
            </div>

            {/* Metric KPI Banner */}
            {activeTab === "consumables" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Consumables</p>
                            <h4 className="text-xl font-black text-slate-800">{stockItems.length} Items</h4>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Warnings</p>
                            <h4 className="text-xl font-black text-slate-800">
                                {stockItems.filter(item => item.quantity <= item.minThreshold && item.quantity > 0).length} Items
                            </h4>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                            <AlertTriangle className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Out of Stock</p>
                            <h4 className="text-xl font-black text-red-600">
                                {stockItems.filter(item => item.quantity <= 0).length} Items
                            </h4>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Boxes className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Asset Types</p>
                            <h4 className="text-xl font-black text-slate-800">{initialAssets.length} Types</h4>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Reserves (Available)</p>
                            <h4 className="text-xl font-black text-emerald-600">
                                {initialAssets.reduce((sum, asset) => {
                                    const allocated = asset.allocations.reduce((s, a) => s + a.quantity, 0);
                                    return sum + (asset.totalQty - allocated);
                                }, 0)} units
                            </h4>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Allocated (In Use)</p>
                            <h4 className="text-xl font-black text-blue-600">
                                {initialAssets.reduce((sum, asset) => sum + asset.allocations.reduce((s, a) => s + a.quantity, 0), 0)} units
                            </h4>
                        </div>
                    </div>
                </div>
            )}

            <div className="">
                {/* Main inventory list */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters & Actions Panel */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 flex-wrap gap-3 w-full">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder={activeTab === "consumables" ? "Search provisions..." : "Search assets..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800"
                                />
                            </div>

                            {activeTab === "consumables" && (
                                <>
                                    {/* Category Filter */}
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
                                    >
                                        <option value="ALL">All Categories</option>
                                        <option value="FOOD">FOOD</option>
                                        <option value="ALCOHOL">ALCOHOL</option>
                                        <option value="BEVERAGE">BEVERAGE</option>
                                        <option value="SHISHA_ITEM">SHISHA</option>
                                    </select>

                                    {/* Status Filter */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="LOW_STOCK">⚠️ Low Stock</option>
                                        <option value="EXPIRED">📅 Expired</option>
                                    </select>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                if (activeTab === "consumables") {
                                    setSelectedStockItem(null);
                                    setStockForm({
                                        name: "",
                                        category: "FOOD",
                                        quantity: 0,
                                        unit: "units",
                                        minThreshold: 15,
                                        expirationDate: "",
                                    });
                                    setModalType("stock_form");
                                } else {
                                    setSelectedAsset(null);
                                    setAssetForm({
                                        name: "",
                                        totalQty: 0,
                                    });
                                    setModalType("asset_form");
                                }
                                setSuccessMsg("");
                                setErrorMsg("");
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-xs font-bold uppercase tracking-wider transition border-0 cursor-pointer shadow-md w-full md:w-auto justify-center"
                        >
                            <Plus className="w-4 h-4" />
                            {activeTab === "consumables" ? "Add Provision" : "Add Asset"}
                        </button>
                    </div>

                    {/* List Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {activeTab === "consumables" ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[9px] font-extrabold border-b border-slate-200">
                                            <th className="p-4 pl-6">Stock Item</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Available Qty</th>
                                            <th className="p-4">Expiry Date</th>
                                            <th className="p-4">Alerts</th>
                                            <th className="p-4 text-right pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredStock.map((item) => {
                                            const isLowStock = item.quantity <= item.minThreshold;
                                            const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/50">
                                                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm">
                                                        {item.name}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-extrabold font-mono">
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-sm">
                                                        {item.quantity} {item.unit}
                                                    </td>
                                                    <td className="p-4 text-slate-500">
                                                        {item.expirationDate
                                                            ? new Date(item.expirationDate).toLocaleDateString()
                                                            : "N/A"}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            {isLowStock && (
                                                                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full w-fit">
                                                                    <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                                                                </span>
                                                            )}
                                                            {isExpired && (
                                                                <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full w-fit">
                                                                    📅 Expired
                                                                </span>
                                                            )}
                                                            {!isLowStock && !isExpired && (
                                                                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full w-fit">
                                                                    Healthy
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedStockItem(item);
                                                                    setRestockQty(10);
                                                                    setModalType("restock_form");
                                                                    setSuccessMsg("");
                                                                    setErrorMsg("");
                                                                }}
                                                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[10px] transition-colors border-0 cursor-pointer"
                                                                title="Add Stock"
                                                            >
                                                                + Restock
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedStockItem(item);
                                                                    setStockForm({
                                                                        name: item.name,
                                                                        category: item.category,
                                                                        quantity: item.quantity,
                                                                        unit: item.unit,
                                                                        minThreshold: item.minThreshold,
                                                                        expirationDate: item.expirationDate
                                                                            ? new Date(item.expirationDate).toISOString().split("T")[0]
                                                                            : "",
                                                                    });
                                                                    setModalType("stock_form");
                                                                    setSuccessMsg("");
                                                                    setErrorMsg("");
                                                                }}
                                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border-0 cursor-pointer"
                                                                title="Edit Item"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedStockItem(item);
                                                                    setWasteQty(1);
                                                                    setWasteReason("EXPIRED");
                                                                    setModalType("waste_form");
                                                                    setSuccessMsg("");
                                                                    setErrorMsg("");
                                                                }}
                                                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border-0 cursor-pointer"
                                                                title="Log Waste / Write-off"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStock(item.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 cursor-pointer"
                                                                title="Delete Item"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredStock.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400 font-light">
                                                    No consumable stock items found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[9px] font-extrabold border-b border-slate-200">
                                            <th className="p-4 pl-6">Asset Item</th>
                                            <th className="p-4">Total Inventory</th>
                                            <th className="p-4">In Reserves</th>
                                            <th className="p-4">Active Allocations</th>
                                            <th className="p-4 text-right pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredAssets.map((asset) => {
                                            const totalAllocated = asset.allocations.reduce((sum, a) => sum + a.quantity, 0);
                                            const reserveQty = asset.totalQty - totalAllocated;

                                            return (
                                                <tr key={asset.id} className="hover:bg-gray-50/50">
                                                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm">
                                                        {asset.name}
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-slate-700 text-sm">
                                                        {asset.totalQty} units
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-emerald-600 text-sm">
                                                        {reserveQty} units
                                                    </td>
                                                    <td className="p-4 text-slate-600">
                                                        {totalAllocated > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {asset.allocations.map((alloc) => (
                                                                    <span
                                                                        key={alloc.id}
                                                                        className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 border border-indigo-100"
                                                                    >
                                                                        <MapPin className="w-2.5 h-2.5" />
                                                                        {alloc.location} ({alloc.quantity})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 font-light italic">None allocated</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAsset(asset);
                                                                    setAssetForm({
                                                                        name: asset.name,
                                                                        totalQty: asset.totalQty,
                                                                    });
                                                                    setModalType("asset_form");
                                                                    setSuccessMsg("");
                                                                    setErrorMsg("");
                                                                }}
                                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border-0 cursor-pointer"
                                                                title="Edit Asset Total"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAsset(asset);
                                                                    setAllocationForm({
                                                                        location: "CAMPGROUND",
                                                                        quantity: 1,
                                                                        status: "ACTIVE",
                                                                    });
                                                                    setModalType("allocate_form");
                                                                    setSuccessMsg("");
                                                                    setErrorMsg("");
                                                                }}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border-0 cursor-pointer"
                                                                title="Allocate Gear"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAssetItem(asset.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 cursor-pointer"
                                                                title="Delete Asset"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredAssets.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-400 font-light">
                                                    No staging assets found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {/* Side Audit Panels */}
                    <div className="lg:col-span-1 space-y-6">
                        {activeTab === "consumables" ? (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                                {/* Sidebar Header Tabs */}
                                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full">
                                    <button
                                        onClick={() => setSideTab("movement")}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition border-0 cursor-pointer ${sideTab === "movement"
                                            ? "bg-indigo-600 text-white shadow"
                                            : "text-slate-500 hover:text-indigo-600"
                                            }`}
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        Movement History
                                    </button>
                                    <button
                                        onClick={() => setSideTab("audit")}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition border-0 cursor-pointer ${sideTab === "audit"
                                            ? "bg-indigo-600 text-white shadow"
                                            : "text-slate-500 hover:text-indigo-600"
                                            }`}
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        Waste Audits
                                    </button>
                                </div>

                                {sideTab === "movement" ? (
                                    <div className="space-y-4">
                                        <h3 className="font-display font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                                            <History className="w-4 h-4 text-indigo-600" />
                                            Stock Movement Log
                                        </h3>

                                        {stockMovements.length === 0 ? (
                                            <div className="text-center py-12 text-slate-400 text-xs font-light">
                                                No stock movement history recorded yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                                {stockMovements.map((move) => {
                                                    const isPositive = move.quantity > 0;
                                                    const badgeColor =
                                                        move.type === "RESTOCK" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                            move.type === "WASTE" ? "bg-red-50 text-red-700 border-red-100" :
                                                                move.type === "ORDER_DEDUCTION" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                                    "bg-amber-50 text-amber-700 border-amber-100";

                                                    return (
                                                        <div key={move.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1 hover:border-slate-200 transition">
                                                            <div className="flex justify-between items-center text-[9px] text-slate-400">
                                                                <span>
                                                                    {new Date(move.createdAt).toLocaleDateString("en-US", {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black tracking-wider uppercase font-mono ${badgeColor}`}>
                                                                    {move.type}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-bold text-slate-800 leading-snug">
                                                                {isPositive ? "+" : ""}{move.quantity} {move.stockItem?.unit || "units"} of {move.stockItem?.name || "Deleted item"}
                                                            </h4>
                                                            {move.notes && (
                                                                <p className="text-[10px] text-slate-500 font-light mt-0.5 leading-relaxed bg-white/50 p-1.5 rounded-lg border border-slate-100/50">
                                                                    {move.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="font-display font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                                            <FileText className="w-4 h-4 text-indigo-600" />
                                            Waste & Spoilage Audits
                                        </h3>

                                        {wasteLogs.length === 0 ? (
                                            <div className="text-center py-12 text-slate-400 text-xs font-light">
                                                No recent write-offs recorded.
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                                {wasteLogs.map((log) => (
                                                    <div
                                                        key={log.id}
                                                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
                                                    >
                                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                            <span>
                                                                {new Date(log.createdAt).toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                            <span className="font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-wider">
                                                                {log.reason}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 leading-snug">
                                                            {log.quantity} units of {log.stockItem?.name || "Deleted item"}
                                                        </h4>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                                <h3 className="font-display font-extrabold text-base text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                                    <Activity className="w-5 h-5 text-indigo-600" />
                                    Active Allocations Feed
                                </h3>

                                {/* Flatten and display all asset allocations */}
                                {(() => {
                                    const allAllocations = initialAssets.flatMap((asset) =>
                                        asset.allocations.map((alloc) => ({
                                            ...alloc,
                                            assetName: asset.name,
                                        }))
                                    );

                                    if (allAllocations.length === 0) {
                                        return (
                                            <div className="text-center py-12 text-slate-400 text-xs font-light">
                                                No physical gear allocated.
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                            {allAllocations.map((alloc) => (
                                                <div
                                                    key={alloc.id}
                                                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                                                >
                                                    <div className="space-y-1.5">
                                                        <span className="bg-indigo-100 text-indigo-700 font-extrabold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-full">
                                                            {alloc.location}
                                                        </span>
                                                        <h4 className="font-bold text-slate-800 leading-none">
                                                            {alloc.quantity} × {alloc.assetName}
                                                        </h4>
                                                        <span className="text-[10px] text-slate-400 block">
                                                            Status: <span className="font-semibold text-slate-600">{alloc.status}</span>
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleReleaseAllocation(alloc.id)}
                                                        className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer font-bold text-xs p-1"
                                                        title="Release / Return to Reserve"
                                                    >
                                                        Release
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* ==========================================
          INVENTORY CRUD MODALS
          ========================================== */}

                {/* 0. Quick Restock Modal */}
                {modalType === "restock_form" && selectedStockItem && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 relative">
                            <button
                                onClick={() => setModalType(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold border-0 bg-transparent cursor-pointer"
                            >
                                Close
                            </button>

                            <form onSubmit={handleRestockSubmit} className="space-y-5 text-xs">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                                        Add Stock Inventory
                                    </span>
                                    <h3 className="font-display font-extrabold text-lg text-indigo-950">
                                        Restock: {selectedStockItem.name}
                                    </h3>
                                </div>

                                {errorMsg && (
                                    <div className="flex gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 font-semibold">
                                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="flex gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-700 font-semibold">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Quantity to Add</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={restockQty}
                                            onChange={(e) => setRestockQty(Number(e.target.value) || 1)}
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-base text-emerald-600"
                                        />
                                        <span className="block text-[10px] text-slate-400 mt-1">
                                            Current inventory: {selectedStockItem.quantity} {selectedStockItem.unit}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalType(null)}
                                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold border-0 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-0 cursor-pointer shadow"
                                    >
                                        {actionLoading ? "Processing..." : "Confirm Restock"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 1. Consumable Stock Form Modal */}
                {modalType === "stock_form" && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 relative">
                            <button
                                onClick={() => setModalType(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold border-0 bg-transparent cursor-pointer"
                            >
                                Close
                            </button>

                            <form onSubmit={handleStockSubmit} className="space-y-5 text-xs">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                                        Inventory Provision
                                    </span>
                                    <h3 className="font-display font-extrabold text-lg text-indigo-950">
                                        {selectedStockItem ? `Edit: ${selectedStockItem.name}` : "Create Stock Provision"}
                                    </h3>
                                </div>

                                {errorMsg && (
                                    <div className="flex gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 font-semibold">
                                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="flex gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-700 font-semibold">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Item Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={stockForm.name}
                                            onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                                            placeholder="e.g. Hamburger Buns"
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-bold text-slate-500 mb-1.5">Category</label>
                                            <select
                                                value={stockForm.category}
                                                onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}
                                                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                                            >
                                                <option value="FOOD">FOOD</option>
                                                <option value="ALCOHOL">ALCOHOL</option>
                                                <option value="BEVERAGE">BEVERAGE</option>
                                                <option value="SHISHA_ITEM">SHISHA</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-500 mb-1.5">Measurement Unit</label>
                                            <input
                                                required
                                                type="text"
                                                value={stockForm.unit}
                                                onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
                                                placeholder="e.g. units, kg, liters"
                                                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-bold text-slate-500 mb-1.5">Starting Qty</label>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                value={stockForm.quantity}
                                                onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                                                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-500 mb-1.5">Low-Stock Alert Threshold</label>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                value={stockForm.minThreshold}
                                                onChange={(e) => setStockForm({ ...stockForm, minThreshold: Number(e.target.value) })}
                                                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Expiration Date</label>
                                        <input
                                            type="date"
                                            value={stockForm.expirationDate}
                                            onChange={(e) => setStockForm({ ...stockForm, expirationDate: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalType(null)}
                                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold border-0 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-0 cursor-pointer shadow"
                                    >
                                        {actionLoading ? "Saving..." : "Save Provision"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 2. Write-off / Waste Modal */}
                {modalType === "waste_form" && selectedStockItem && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 relative">
                            <button
                                onClick={() => setModalType(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold border-0 bg-transparent cursor-pointer"
                            >
                                Close
                            </button>

                            <form onSubmit={handleWasteSubmit} className="space-y-5 text-xs">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
                                        Waste Audit Writing
                                    </span>
                                    <h3 className="font-display font-extrabold text-lg text-indigo-950">
                                        Discard: {selectedStockItem.name}
                                    </h3>
                                </div>

                                {errorMsg && (
                                    <div className="flex gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 font-semibold">
                                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="flex gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-700 font-semibold">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Quantity to write off</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            max={selectedStockItem.quantity}
                                            value={wasteQty}
                                            onChange={(e) => setWasteQty(Number(e.target.value) || 1)}
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-base"
                                        />
                                        <span className="block text-[10px] text-slate-400 mt-1">
                                            Available stock: {selectedStockItem.quantity} {selectedStockItem.unit}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Reason Code</label>
                                        <select
                                            value={wasteReason}
                                            onChange={(e) => setWasteReason(e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                                        >
                                            <option value="EXPIRED">Expired Food/Beverage item</option>
                                            <option value="SPOILED">Spoiled / Bad item</option>
                                            <option value="DAMAGED">Damaged / Broken asset items</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalType(null)}
                                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold border-0 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold border-0 cursor-pointer shadow"
                                    >
                                        {actionLoading ? "Processing..." : "Deduct & Log Waste"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. Physical Asset Form Modal */}
                {modalType === "asset_form" && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 relative">
                            <button
                                onClick={() => setModalType(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold border-0 bg-transparent cursor-pointer"
                            >
                                Close
                            </button>

                            <form onSubmit={handleAssetSubmit} className="space-y-5 text-xs">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                                        Staging Asset
                                    </span>
                                    <h3 className="font-display font-extrabold text-lg text-indigo-950">
                                        {selectedAsset ? `Edit: ${selectedAsset.name}` : "Register Staging Asset"}
                                    </h3>
                                </div>

                                {errorMsg && (
                                    <div className="flex gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 font-semibold">
                                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="flex gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-700 font-semibold">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Asset Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={assetForm.name}
                                            onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                                            placeholder="e.g. Chairs, Sleeping Tents"
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Total Physical Quantity</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={assetForm.totalQty}
                                            onChange={(e) => setAssetForm({ ...assetForm, totalQty: Number(e.target.value) })}
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-base"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalType(null)}
                                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold border-0 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-0 cursor-pointer shadow"
                                    >
                                        {actionLoading ? "Saving..." : "Save Asset"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 4. Asset Allocation Form Modal */}
                {modalType === "allocate_form" && selectedAsset && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 relative">
                            <button
                                onClick={() => setModalType(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold border-0 bg-transparent cursor-pointer"
                            >
                                Close
                            </button>

                            <form onSubmit={handleAllocationSubmit} className="space-y-5 text-xs">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                                        Location Allocation
                                    </span>
                                    <h3 className="font-display font-extrabold text-lg text-indigo-950">
                                        Allocate: {selectedAsset.name}
                                    </h3>
                                </div>

                                {errorMsg && (
                                    <div className="flex gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 font-semibold">
                                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="flex gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-700 font-semibold">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1.5">Destination Location</label>
                                        <select
                                            value={allocationForm.location}
                                            onChange={(e) => setAllocationForm({ ...allocationForm, location: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                                        >
                                            <option value="CAMPGROUND">CAMPGROUND</option>
                                            <option value="RESTAURANT">RESTAURANT</option>
                                            <option value="RESERVE">RESERVE</option>
                                            <option value="REPAIR">REPAIR / MAINTENANCE</option>
                                            <option value="DISCARDED">DISCARDED / DAMAGED</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-bold text-slate-500 mb-1.5">Quantity to Allocate</label>
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                value={allocationForm.quantity}
                                                onChange={(e) => setAllocationForm({ ...allocationForm, quantity: Number(e.target.value) || 1 })}
                                                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-500 mb-1.5">Allocation Status</label>
                                            <select
                                                value={allocationForm.status}
                                                onChange={(e) => setAllocationForm({ ...allocationForm, status: e.target.value })}
                                                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="REPAIRING">REPAIRING</option>
                                                <option value="DISCARDED">DISCARDED</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalType(null)}
                                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold border-0 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-0 cursor-pointer shadow"
                                    >
                                        {actionLoading ? "Processing..." : "Allocate Quantity"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
