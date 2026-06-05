"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  // Accommodations Actions
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  // Stays Actions
  createBookingManual,
  updateBookingDetails,
  deleteBooking,
  // Restaurant Bookings Actions
  createRestaurantBookingManual,
  updateRestaurantBookingDetails,
  deleteRestaurantBooking,
  // Events Actions
  createEvent,
  updateEvent,
  deleteEvent,
  // Hikes Actions
  createAttraction,
  updateAttraction,
  deleteAttraction,
  // Reviews Actions
  toggleReviewApproval,
  deleteReview,
  // Dining Zones Actions
  createRestaurantZone,
  updateRestaurantZone,
  deleteRestaurantZone,
  // Accommodations addons / images Actions
  createAccommodationAddon,
  deleteAccommodationAddon,
  addAccommodationImage,
  deleteAccommodationImage,
} from "@/app/actions/adminActions";
import {
  Calendar as CalendarIcon,
  Tent,
  Utensils,
  MapPin,
  Flame,
  Star,
  Users,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Layers,
} from "lucide-react";

interface AdminDashboardClientProps {
  stats: {
    staysRevenue: number;
    activeStaysCount: number;
    restaurantBookingsCount: number;
    lowStockCount: number;
    accommodationsCount: number;
    eventsCount: number;
    attractionsCount: number;
    reviewsCount: number;
  };
  accommodations: any[];
  bookings: any[];
  restaurantBookings: any[];
  events: any[];
  attractions: any[];
  reviews: any[];
  restaurantZones: any[];
}

export default function AdminDashboardClient({
  stats,
  accommodations,
  bookings,
  restaurantBookings,
  events,
  attractions,
  reviews,
  restaurantZones,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Helpers for restaurant zone availability and timing rules
  const getTimeSlotsForZone = (zoneName: string) => {
    const zone = restaurantZones.find(z => z.name === zoneName);
    if (!zone) return ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"];
    const startHour = zone.openHour ?? 12;
    const endHour = zone.name.toLowerCase().includes("sunset") || zone.name.toLowerCase().includes("bar") ? 23 : 22;
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      slots.push(`${displayHour}:00 ${ampm}`);
    }
    return slots;
  };

  const getReservationDateError = (zoneName: string, dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = dateObj.getDay();
    const zone = restaurantZones.find(z => z.name === zoneName);
    if (!zone || !zone.daysOpen || zone.daysOpen === "ALL") return "";
    const days = zone.daysOpen.toUpperCase().split(",");
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    if (!days.includes(dayNames[dayOfWeek])) {
      const formatted = days.map((d: string) => d.charAt(0) + d.slice(1).toLowerCase() + "s").join(" & ");
      return `${zone.name} is only open on ${formatted}. Please select an open day.`;
    }
    return "";
  };

  const [activeTab, setActiveTab] = useState<"calendar" | "stays" | "restaurant" | "accommodations" | "events" | "hikes" | "reviews" | "zones">("calendar");

  // Filters States
  const [staySearch, setStaySearch] = useState("");
  const [stayStatusFilter, setStayStatusFilter] = useState("ALL");
  const [stayAccFilter, setStayAccFilter] = useState("ALL");

  const [restSearch, setRestSearch] = useState("");
  const [restStatusFilter, setRestStatusFilter] = useState("ALL");
  const [restZoneFilter, setRestZoneFilter] = useState("ALL");

  const [calType, setCalType] = useState<"all" | "stays" | "restaurant">("all");
  const [calGroupSearch, setCalGroupSearch] = useState("");
  const [calMinPersons, setCalMinPersons] = useState<number | "">("");
  // Multi-select arrays for calendar filter (OR logic)
  const [calStayStatuses, setCalStayStatuses] = useState<string[]>([]);
  const [calRestStatuses, setCalRestStatuses] = useState<string[]>([]);
  const [calAccFilters, setCalAccFilters] = useState<string[]>([]);   // accommodation IDs
  const [calZoneFilters, setCalZoneFilters] = useState<string[]>([]);  // zone names
  // Dropdown open states for multi-select pickers
  const [stayStatusDropdownOpen, setStayStatusDropdownOpen] = useState(false);
  const [restStatusDropdownOpen, setRestStatusDropdownOpen] = useState(false);
  const [accDropdownOpen, setAccDropdownOpen] = useState(false);
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");

  const [accSearch, setAccSearch] = useState("");
  const [accTypeFilter, setAccTypeFilter] = useState("ALL");

  const [eventSearch, setEventSearch] = useState("");

  const [hikeSearch, setHikeSearch] = useState("");
  const [hikeCategoryFilter, setHikeCategoryFilter] = useState("ALL");

  const [zoneSearch, setZoneSearch] = useState("");

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(staySearch.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(staySearch.toLowerCase()) ||
      b.customerPhone.toLowerCase().includes(staySearch.toLowerCase());
    const matchesStatus = stayStatusFilter === "ALL" || b.status === stayStatusFilter;
    const matchesAcc = stayAccFilter === "ALL" || b.accommodationId === stayAccFilter;
    return matchesSearch && matchesStatus && matchesAcc;
  });

  // Calendar-specific filtered bookings (uses separate multi-select filters)
  const calFilteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(staySearch.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(staySearch.toLowerCase()) ||
      b.customerPhone.toLowerCase().includes(staySearch.toLowerCase());
    const matchesStatus = calStayStatuses.length === 0 || calStayStatuses.includes(b.status);
    const matchesAcc = calAccFilters.length === 0 || calAccFilters.includes(b.accommodationId);
    const matchesGroup = !calGroupSearch || (b.groupName && b.groupName.toLowerCase().includes(calGroupSearch.toLowerCase()));
    const matchesPersons = calMinPersons === "" || b.peopleCount >= Number(calMinPersons);
    return matchesSearch && matchesStatus && matchesAcc && matchesGroup && matchesPersons;
  });

  const calFilteredRestBookings = restaurantBookings.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(restSearch.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(restSearch.toLowerCase()) ||
      r.customerPhone.toLowerCase().includes(restSearch.toLowerCase());
    const matchesStatus = calRestStatuses.length === 0 || calRestStatuses.includes(r.status);
    const matchesZone = calZoneFilters.length === 0 || calZoneFilters.includes(r.zone);
    return matchesSearch && matchesStatus && matchesZone;
  });

  const filteredRestBookings = restaurantBookings.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(restSearch.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(restSearch.toLowerCase()) ||
      r.customerPhone.toLowerCase().includes(restSearch.toLowerCase());
    const matchesStatus = restStatusFilter === "ALL" || r.status === restStatusFilter;
    const matchesZone = restZoneFilter === "ALL" || r.zone === restZoneFilter;
    return matchesSearch && matchesStatus && matchesZone;
  });

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.authorName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      r.content.toLowerCase().includes(reviewSearch.toLowerCase());
    const matchesStatus =
      reviewStatusFilter === "all" ||
      (reviewStatusFilter === "approved" && r.approved) ||
      (reviewStatusFilter === "pending" && !r.approved);
    const matchesRating =
      reviewRatingFilter === "all" || r.rating === Number(reviewRatingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const filteredAccommodations = accommodations.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(accSearch.toLowerCase());
    const matchesType = accTypeFilter === "ALL" || a.type === accTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredEvents = events.filter((e) => {
    return (
      e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.description.toLowerCase().includes(eventSearch.toLowerCase())
    );
  });

  const filteredAttractions = attractions.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(hikeSearch.toLowerCase()) ||
      h.description.toLowerCase().includes(hikeSearch.toLowerCase()) ||
      h.location.toLowerCase().includes(hikeSearch.toLowerCase());
    const matchesCategory = hikeCategoryFilter === "ALL" || h.category.toLowerCase() === hikeCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredZones = restaurantZones.filter((z) => {
    return (
      z.name.toLowerCase().includes(zoneSearch.toLowerCase()) ||
      (z.description && z.description.toLowerCase().includes(zoneSearch.toLowerCase()))
    );
  });

  // State for Calendars
  const [currentDate, setCurrentDate] = useState(new Date());

  // Universal Loading state
  const [actionLoading, setActionLoading] = useState(false);

  // Modal / Form States
  const [modalType, setModalType] = useState<"accommodation" | "stay" | "restaurant" | "event" | "hike" | "zone" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null); // holds item for update, or null for create

  // Form Fields State
  const [accForm, setAccForm] = useState({ name: "", type: "WOOD_TENT", pricingType: "PER_UNIT_PER_NIGHT", basePrice: 0, minCapacity: 1, maxCapacity: 4, description: "", amenities: "", nightThresholdEnabled: false, nightThreshold: 5 });
  const [stayForm, setStayForm] = useState({ accommodationId: "", customerName: "", customerEmail: "", customerPhone: "", groupName: "", startDate: "", endDate: "", peopleCount: 2, status: "PENDING", notes: "" });
  const [restForm, setRestForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", bookingDate: "", timeSlot: "12:00 PM", zone: "Skylight Restaurant", peopleCount: 2, status: "PENDING", notes: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", price: 0, requiresTicket: false, capacity: 100 });
  const [hikeForm, setHikeForm] = useState({ name: "", category: "Nature Reserve", description: "", imageUrl: "", location: "", distance: "", details: "", externalUrl: "" });
  const [zoneForm, setZoneForm] = useState({ name: "", slug: "", description: "", capacity: 60, price: 0, minCapacity: 1, daysOpen: "ALL", openHour: 12, coverImage: "" });

  // Dynamic validation for restaurant bookings
  const activeTimeSlots = getTimeSlotsForZone(restForm.zone);
  const dateError = getReservationDateError(restForm.zone, restForm.bookingDate);

  React.useEffect(() => {
    if (activeTimeSlots.length > 0 && !activeTimeSlots.includes(restForm.timeSlot)) {
      setRestForm((prev) => ({ ...prev, timeSlot: activeTimeSlots[0] }));
    }
  }, [restForm.zone, activeTimeSlots]);

  const refreshData = () => {
    router.refresh();
  };

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const handleAccSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    let res;
    if (editingItem) {
      res = await updateAccommodation(editingItem.id, { ...accForm, slug: editingItem.slug });
    } else {
      res = await createAccommodation({ ...accForm, slug: "" });
    }
    setActionLoading(false);
    if (res.success) {
      setModalType(null);
      setEditingItem(null);
      refreshData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleStaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    let res;
    if (editingItem) {
      res = await updateBookingDetails(editingItem.id, stayForm);
    } else {
      res = await createBookingManual(stayForm);
    }
    setActionLoading(false);
    if (res.success) {
      setModalType(null);
      setEditingItem(null);
      refreshData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleRestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    let res;
    if (editingItem) {
      res = await updateRestaurantBookingDetails(editingItem.id, restForm);
    } else {
      res = await createRestaurantBookingManual(restForm);
    }
    setActionLoading(false);
    if (res.success) {
      setModalType(null);
      setEditingItem(null);
      refreshData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    let res;
    if (editingItem) {
      res = await updateEvent(editingItem.id, { ...eventForm, slug: editingItem.slug });
    } else {
      res = await createEvent(eventForm);
    }
    setActionLoading(false);
    if (res.success) {
      setModalType(null);
      setEditingItem(null);
      refreshData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleHikeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    let res;
    if (editingItem) {
      res = await updateAttraction(editingItem.id, hikeForm);
    } else {
      res = await createAttraction(hikeForm);
    }
    setActionLoading(false);
    if (res.success) {
      setModalType(null);
      setEditingItem(null);
      refreshData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    let res;
    if (editingItem) {
      res = await updateRestaurantZone(editingItem.id, zoneForm);
    } else {
      res = await createRestaurantZone(zoneForm);
    }
    setActionLoading(false);
    if (res.success) {
      setModalType(null);
      setEditingItem(null);
      refreshData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dining/picnic zone? All tables assigned to it will also be deleted!")) return;
    setActionLoading(true);
    const res = await deleteRestaurantZone(id);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  // ==========================================
  // DELETE HANDLERS
  // ==========================================

  const handleDeleteAcc = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this accommodation? All bookings and image assets related to it will be deleted!")) return;
    setActionLoading(true);
    const res = await deleteAccommodation(id);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  const handleDeleteStay = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this campground stay reservation?")) return;
    setActionLoading(true);
    const res = await deleteBooking(id);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  const handleDeleteRest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table reservation?")) return;
    setActionLoading(true);
    const res = await deleteRestaurantBooking(id);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? All attendee registrations will also be deleted!")) return;
    setActionLoading(true);
    const res = await deleteEvent(id);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  const handleDeleteHike = async (id: string) => {
    if (!confirm("Are you sure you want to delete this local hike/attraction?")) return;
    setActionLoading(true);
    const res = await deleteAttraction(id);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  // ==========================================
  // REVIEW APPROVAL MODERATION HANDLER
  // ==========================================

  const handleToggleReview = async (id: string, approved: boolean) => {
    setActionLoading(true);
    const res = await toggleReviewApproval(id, approved);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this customer review?")) return;
    setActionLoading(true);
    const res = await deleteReview(id);
    setActionLoading(false);
    if (res.success) refreshData();
    else alert("Error: " + res.error);
  };

  // ==========================================
  // EDIT TRIGGER INITIALIZERS
  // ==========================================

  const initEditAcc = (item: any) => {
    setEditingItem(item);
    setAccForm({
      name: item.name,
      type: item.type,
      pricingType: item.pricingType,
      basePrice: item.basePrice,
      minCapacity: item.minCapacity,
      maxCapacity: item.maxCapacity,
      description: item.description || "",
      amenities: item.amenities || "",
      nightThresholdEnabled: item.nightThresholdEnabled ?? false,
      nightThreshold: item.nightThreshold ?? 5,
    });
    setModalType("accommodation");
  };

  const initEditStay = (item: any) => {
    setEditingItem(item);
    setStayForm({
      accommodationId: item.accommodationId,
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      customerPhone: item.customerPhone,
      groupName: item.groupName || "",
      startDate: new Date(item.startDate).toISOString().split("T")[0],
      endDate: new Date(item.endDate).toISOString().split("T")[0],
      peopleCount: item.peopleCount,
      status: item.status,
      notes: item.notes || "",
    });
    setModalType("stay");
  };

  const initEditRest = (item: any) => {
    setEditingItem(item);
    setRestForm({
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      customerPhone: item.customerPhone,
      bookingDate: new Date(item.bookingDate).toISOString().split("T")[0],
      timeSlot: item.timeSlot,
      zone: item.zone,
      peopleCount: item.peopleCount,
      status: item.status,
      notes: item.notes || "",
    });
    setModalType("restaurant");
  };

  const initEditEvent = (item: any) => {
    setEditingItem(item);
    setEventForm({
      title: item.title,
      description: item.description,
      date: new Date(item.date).toISOString().split("T")[0],
      price: item.price,
      requiresTicket: item.requiresTicket,
      capacity: item.capacity,
    });
    setModalType("event");
  };

  const initEditHike = (item: any) => {
    setEditingItem(item);
    setHikeForm({
      name: item.name,
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl || "",
      location: item.location,
      distance: item.distance,
      details: item.details,
      externalUrl: item.externalUrl || "",
    });
    setModalType("hike");
  };

  const initEditZone = (item: any) => {
    setEditingItem(item);
    setZoneForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      capacity: item.capacity,
      price: item.price,
      minCapacity: item.minCapacity,
      daysOpen: item.daysOpen,
      openHour: item.openHour,
      coverImage: item.coverImage || "",
    });
    setModalType("zone");
  };

  // ==========================================
  // CALENDAR GENERATOR
  // ==========================================

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    // Padding from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      calendarDays.push({ date: new Date(year, month - 1, new Date(year, month, 0).getDate() - i), isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      calendarDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Padding for next month to complete the grid (multiples of 7)
    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return calendarDays;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const checkStayOverlap = (cellDate: Date, booking: any) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    
    // Normalize dates to midnight to check overlap accurately
    const cellTime = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate()).getTime();
    const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

    return cellTime >= startTime && cellTime <= endTime;
  };

  const checkRestOverlap = (cellDate: Date, booking: any) => {
    const bDate = new Date(booking.bookingDate);
    return (
      cellDate.getDate() === bDate.getDate() &&
      cellDate.getMonth() === bDate.getMonth() &&
      cellDate.getFullYear() === bDate.getFullYear()
    );
  };

  const calendarDays = getDaysInMonth(currentDate);

  // Status visual color maps
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "PAID":
      case "FULL_PAID":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "DEPOSIT_PAID":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "PENDING":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Accommodation type abbreviation for calendar badges
  const getAccTypeBadge = (type: string) => {
    switch (type) {
      case "SCOUT_ZONE": return "LG";
      case "INDIVIDUAL_CAMP": return "IND";
      case "WOOD_TENT": return "TENT";
      case "BUNGALOW": return "BNG";
      default: return type.substring(0, 3);
    }
  };

  // Toggle a status in a multi-status array
  const toggleCalStatus = (arr: string[], setArr: (v: string[]) => void, status: string) => {
    if (arr.includes(status)) {
      setArr(arr.filter(s => s !== status));
    } else {
      setArr([...arr, status]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. OPERATIONS METRICS OVERVIEW */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-500/30 transition duration-300 shadow-sm shadow-slate-100">
          <div className="flex justify-between items-start text-indigo-600 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Stay Revenue</span>
            <TrendingUp size={18} />
          </div>
          <div className="text-3xl font-black text-slate-800">${stats.staysRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-bold mt-2">LTD Stays Checkout Earnings</div>
        </div>

        {/* Campground Stays */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-cyan-500/30 transition duration-300 shadow-sm shadow-slate-100">
          <div className="flex justify-between items-start text-cyan-600 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Campground Stays</span>
            <Tent size={18} />
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.activeStaysCount}</div>
          <div className="text-xs text-slate-500 font-bold mt-2">Active / Confirmed Reservations</div>
        </div>

        {/* Restaurant Tables */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-500/30 transition duration-300 shadow-sm shadow-slate-100">
          <div className="flex justify-between items-start text-emerald-600 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Table Bookings</span>
            <Utensils size={18} />
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.restaurantBookingsCount}</div>
          <div className="text-xs text-slate-500 font-bold mt-2">Reservations cataloged</div>
        </div>

        {/* Alert Card (Low Stock) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-500/30 transition duration-300 shadow-sm shadow-slate-100">
          <div className="flex justify-between items-start text-amber-600 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Stock Alerts</span>
            <AlertCircle size={18} />
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.lowStockCount} items</div>
          <div className="text-xs text-slate-500 font-bold mt-2">Triggering replenishment warning</div>
        </div>

      </section>

      {/* 2. NAVIGATION CONTROL PANEL */}
      <section className="flex flex-wrap gap-3 border-b border-slate-200 pb-6">
        {[
          { id: "calendar", label: "Calendar", icon: CalendarIcon },
          { id: "stays", label: "Stay Bookings", icon: Tent },
          { id: "restaurant", label: "Restaurant Bookings", icon: Utensils },
          { id: "accommodations", label: "Accommodations", icon: Tent },
          { id: "events", label: "Events", icon: Flame },
          { id: "hikes", label: "Local Attractions", icon: MapPin },
          { id: "reviews", label: "Customer Reviews", icon: Star },
          { id: "zones", label: "Dining Zones", icon: Layers },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500"
                  : "bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <IconComp size={16} />
              {tab.label}
            </button>
          );
        })}
      </section>

      {/* 3. WORKING WORKSPACE TABS */}
      <section className="min-h-[400px]">

        {/* ==========================================
            TAB: CALENDAR VIEW
            ========================================== */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            
            {/* Calendar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Interactive Bookings Calendar</h2>
                <p className="text-sm text-slate-500">Monthly overview of campsite stays & table reservations</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-md font-black text-slate-800 min-w-[160px] text-center uppercase tracking-wider">
                  {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Filters Row */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100 space-y-5">
              {/* Row 1: Resource toggle + quick clear */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500">View Resource:</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(["all", "stays", "restaurant"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCalType(type)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                          calType === type
                            ? "bg-indigo-600 text-white shadow"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {type === "all" ? "Show All" : type === "stays" ? "Stays Only" : "Dining Only"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear all calendar filters */}
                {(staySearch || restSearch || stayAccFilter !== "ALL" || restZoneFilter !== "ALL" || calGroupSearch || calMinPersons !== "" || calStayStatuses.length > 0 || calRestStatuses.length > 0 || calAccFilters.length > 0 || calZoneFilters.length > 0) && (
                  <button
                    onClick={() => {
                      setStaySearch("");
                      setRestSearch("");
                      setStayAccFilter("ALL");
                      setRestZoneFilter("ALL");
                      setCalGroupSearch("");
                      setCalMinPersons("");
                      setCalStayStatuses([]);
                      setCalRestStatuses([]);
                      setCalAccFilters([]);
                      setCalZoneFilters([]);
                      setAccDropdownOpen(false);
                      setZoneDropdownOpen(false);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Row 2: Search + Accommodation/Zone + Group + Persons */}
              <div className="flex flex-wrap gap-4 items-end">
                {/* Guest name search */}
                <div className="w-44">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Guest Name</label>
                  <input
                    type="text"
                    placeholder="Search guest..."
                    value={calType === "restaurant" ? restSearch : staySearch}
                    onChange={(e) => {
                      if (calType === "all") {
                        setStaySearch(e.target.value);
                        setRestSearch(e.target.value);
                      } else if (calType === "restaurant") {
                        setRestSearch(e.target.value);
                      } else {
                        setStaySearch(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Stays: Accommodation multi-select */}
                {(calType === "all" || calType === "stays") && (
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Accommodation</label>
                    <button
                      type="button"
                      onClick={() => { setAccDropdownOpen(o => !o); setZoneDropdownOpen(false); setStayStatusDropdownOpen(false); setRestStatusDropdownOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer min-w-[190px] justify-between"
                    >
                      <span className="truncate max-w-[150px]">
                        {calAccFilters.length === 0
                          ? "All accommodations"
                          : calAccFilters.length === 1
                            ? accommodations.find(a => a.id === calAccFilters[0])?.name || "1 selected"
                            : `${calAccFilters.length} selected`}
                      </span>
                      <span className="text-slate-400 text-[10px] flex-shrink-0">{accDropdownOpen ? "▲" : "▼"}</span>
                    </button>
                    {accDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-0.5 max-h-60 overflow-y-auto">
                        {accommodations.map((acc) => {
                          const isActive = calAccFilters.includes(acc.id);
                          return (
                            <button
                              key={acc.id}
                              type="button"
                              onClick={() => toggleCalStatus(calAccFilters, setCalAccFilters, acc.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-indigo-300" />
                              <span className="truncate">{acc.name}</span>
                              {isActive && <span className="ml-auto text-indigo-500 font-black flex-shrink-0">✓</span>}
                            </button>
                          );
                        })}
                        {calAccFilters.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCalAccFilters([])}
                            className="w-full px-3 py-1.5 text-[10px] text-slate-400 hover:text-red-500 font-bold text-left transition cursor-pointer border-t border-slate-100 mt-1 pt-2"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Stays: Group name search */}
                {(calType === "all" || calType === "stays") && (
                  <div className="w-40">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g. GSS Jounieh"
                      value={calGroupSearch}
                      onChange={(e) => setCalGroupSearch(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {/* Stays: Min persons filter */}
                {(calType === "all" || calType === "stays") && (
                  <div className="w-28">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Min Persons</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 10"
                      value={calMinPersons}
                      onChange={(e) => setCalMinPersons(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {/* Restaurant: Dining Zone multi-select */}
                {(calType === "all" || calType === "restaurant") && (
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Dining Zone</label>
                    <button
                      type="button"
                      onClick={() => { setZoneDropdownOpen(o => !o); setAccDropdownOpen(false); setStayStatusDropdownOpen(false); setRestStatusDropdownOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer min-w-[180px] justify-between"
                    >
                      <span className="truncate max-w-[140px]">
                        {calZoneFilters.length === 0
                          ? "All dining zones"
                          : calZoneFilters.length === 1
                            ? calZoneFilters[0]
                            : `${calZoneFilters.length} selected`}
                      </span>
                      <span className="text-slate-400 text-[10px] flex-shrink-0">{zoneDropdownOpen ? "▲" : "▼"}</span>
                    </button>
                    {zoneDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-0.5 max-h-60 overflow-y-auto">
                        {restaurantZones.map((zone) => {
                          const isActive = calZoneFilters.includes(zone.name);
                          return (
                            <button
                              key={zone.id}
                              type="button"
                              onClick={() => toggleCalStatus(calZoneFilters, setCalZoneFilters, zone.name)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-rose-300" />
                              <span className="truncate">{zone.name}</span>
                              {isActive && <span className="ml-auto text-indigo-500 font-black flex-shrink-0">✓</span>}
                            </button>
                          );
                        })}
                        {calZoneFilters.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCalZoneFilters([])}
                            className="w-full px-3 py-1.5 text-[10px] text-slate-400 hover:text-red-500 font-bold text-left transition cursor-pointer border-t border-slate-100 mt-1 pt-2"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 3: Multi-select status dropdown pickers */}
              <div className="flex flex-wrap gap-4 items-start">
                {/* Stay statuses */}
                {(calType === "all" || calType === "stays") && (
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stay Statuses</label>
                    <button
                      type="button"
                      onClick={() => { setStayStatusDropdownOpen(o => !o); setRestStatusDropdownOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer min-w-[180px] justify-between"
                    >
                      <span>
                        {calStayStatuses.length === 0
                          ? "All statuses"
                          : calStayStatuses.map(s => s.replace(/_/g, " ")).join(", ")}
                      </span>
                      <span className="text-slate-400 text-[10px]">{stayStatusDropdownOpen ? "▲" : "▼"}</span>
                    </button>
                    {stayStatusDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-0.5">
                        {["PENDING", "DEPOSIT_PAID", "FULL_PAID", "CONFIRMED", "CANCELLED"].map((status) => {
                          const isActive = calStayStatuses.includes(status);
                          const dotColor: Record<string, string> = {
                            PENDING: "bg-amber-400",
                            DEPOSIT_PAID: "bg-cyan-400",
                            FULL_PAID: "bg-emerald-500",
                            CONFIRMED: "bg-emerald-400",
                            CANCELLED: "bg-red-400",
                          };
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => toggleCalStatus(calStayStatuses, setCalStayStatuses, status)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[status]}`} />
                              {status.replace(/_/g, " ")}
                              {isActive && <span className="ml-auto text-indigo-500 font-black">✓</span>}
                            </button>
                          );
                        })}
                        {calStayStatuses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCalStayStatuses([])}
                            className="w-full px-3 py-1.5 text-[10px] text-slate-400 hover:text-red-500 font-bold text-left transition cursor-pointer border-t border-slate-100 mt-1 pt-2"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Restaurant statuses */}
                {(calType === "all" || calType === "restaurant") && (
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Dining Statuses</label>
                    <button
                      type="button"
                      onClick={() => { setRestStatusDropdownOpen(o => !o); setStayStatusDropdownOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer min-w-[180px] justify-between"
                    >
                      <span>
                        {calRestStatuses.length === 0
                          ? "All statuses"
                          : calRestStatuses.join(", ")}
                      </span>
                      <span className="text-slate-400 text-[10px]">{restStatusDropdownOpen ? "▲" : "▼"}</span>
                    </button>
                    {restStatusDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-0.5">
                        {["PENDING", "CONFIRMED", "CANCELLED"].map((status) => {
                          const isActive = calRestStatuses.includes(status);
                          const dotColor: Record<string, string> = {
                            PENDING: "bg-amber-400",
                            CONFIRMED: "bg-emerald-400",
                            CANCELLED: "bg-red-400",
                          };
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => toggleCalStatus(calRestStatuses, setCalRestStatuses, status)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[status]}`} />
                              {status}
                              {isActive && <span className="ml-auto text-indigo-500 font-black">✓</span>}
                            </button>
                          );
                        })}
                        {calRestStatuses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCalRestStatuses([])}
                            className="w-full px-3 py-1.5 text-[10px] text-slate-400 hover:text-red-500 font-bold text-left transition cursor-pointer border-t border-slate-100 mt-1 pt-2"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Grid layout */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100">
              {/* Day header */}
              <div className="grid grid-cols-7 bg-slate-50 text-center text-xs font-black uppercase tracking-wider text-slate-500 py-4 border-b border-slate-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 grid-rows-6 auto-rows-[140px] border-collapse bg-slate-50/20">
                {calendarDays.map((cell, idx) => {
                  const overlapsStays = (calType === "all" || calType === "stays") ? calFilteredBookings.filter((b) => checkStayOverlap(cell.date, b)) : [];
                  const overlapsRest = (calType === "all" || calType === "restaurant") ? calFilteredRestBookings.filter((r) => checkRestOverlap(cell.date, r)) : [];

                  return (
                    <div
                      key={idx}
                      className={`p-3 border-r border-b border-slate-200/80 flex flex-col justify-between hover:bg-slate-50 transition duration-200 ${
                        cell.isCurrentMonth ? "text-slate-800" : "text-slate-400 bg-slate-100/10"
                      }`}
                    >
                      <span className="text-sm font-black self-end">{cell.date.getDate()}</span>
                      
                      {/* Booking badging inside cell */}
                      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto mt-1 scrollbar-none max-h-[100px]">
                        {/* Camp bookings */}
                        {overlapsStays.map((booking) => {
                          const zoneName = booking.accommodation?.name || "Stay";
                          return (
                            <div
                              key={booking.id}
                              onClick={() => initEditStay(booking)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border truncate cursor-pointer transition hover:brightness-95 ${getStatusColor(booking.status)}`}
                              title={`${zoneName}${booking.groupName ? ` · ${booking.groupName}` : ""} · ${booking.customerName}`}
                            >
                              <span className="truncate block leading-tight">{zoneName}</span>
                              <span className="truncate block text-[9px] opacity-80 leading-tight font-normal">{booking.groupName || booking.customerName}</span>
                            </div>
                          );
                        })}

                        {/* Restaurant bookings */}
                        {overlapsRest.map((res) => (
                          <div
                            key={res.id}
                            onClick={() => initEditRest(res)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border truncate cursor-pointer transition hover:brightness-95 ${getStatusColor(res.status)}`}
                            title={`${res.zone} · ${res.customerName} · ${res.timeSlot}`}
                          >
                            <span className="truncate block leading-tight">{res.zone}</span>
                            <span className="truncate block text-[9px] opacity-80 leading-tight font-normal">{res.customerName} · {res.timeSlot.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB: STAY BOOKINGS MANAGEMENT
            ========================================== */}
        {activeTab === "stays" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Campground & Stay Bookings</h2>
                <p className="text-sm text-slate-500">Total stay reservations and status modifiers</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setStayForm({
                    accommodationId: accommodations[0]?.id || "",
                    customerName: "",
                    customerEmail: "",
                    customerPhone: "",
                    groupName: "",
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
                    peopleCount: 2,
                    status: "PENDING",
                    notes: "",
                  });
                  setModalType("stay");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <Plus size={16} /> Add Reservation
              </button>
            </div>

            {/* Stays Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Guest</label>
                <input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={staySearch}
                  onChange={(e) => setStaySearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none placeholder-slate-400"
                />
              </div>
              <div className="w-56">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Accommodation Option</label>
                <select
                  value={stayAccFilter}
                  onChange={(e) => setStayAccFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                >
                  <option value="ALL">All Accommodations</option>
                  {accommodations.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Booking Status</label>
                <select
                  value={stayStatusFilter}
                  onChange={(e) => setStayStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="DEPOSIT_PAID">DEPOSIT_PAID</option>
                  <option value="FULL_PAID">FULL_PAID</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="self-end pb-0.5">
                {(staySearch || stayStatusFilter !== "ALL" || stayAccFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setStaySearch("");
                      setStayStatusFilter("ALL");
                      setStayAccFilter("ALL");
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="p-5">Customer</th>
                      <th className="p-5">Stay Option</th>
                      <th className="p-5">Dates</th>
                      <th className="p-5">Guests</th>
                      <th className="p-5">Total Cost</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-5">
                          <div className="font-bold text-slate-800 text-base">{booking.customerName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{booking.customerEmail}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{booking.customerPhone}</div>
                          {booking.groupName && (
                            <div className="text-xs text-indigo-600 mt-1 font-bold flex items-center gap-1">
                              <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide">Group</span>
                              {booking.groupName}
                            </div>
                          )}
                          {booking.notes && (
                            <div className="text-xs text-indigo-600 mt-1.5 font-bold italic max-w-[240px] truncate" title={booking.notes}>
                              Note: {booking.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-5 font-semibold text-slate-700 text-sm">
                          {booking.accommodation?.name || "N/A"}
                        </td>
                        <td className="p-5 text-slate-700 text-sm">
                          <div className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500 mt-0.5">to {new Date(booking.endDate).toLocaleDateString()}</div>
                        </td>
                        <td className="p-5 font-bold text-slate-700 text-sm">{booking.peopleCount} guests</td>
                        <td className="p-5 font-black text-indigo-600 text-base">${booking.totalPrice}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 text-xs font-bold uppercase rounded-full border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => initEditStay(booking)}
                              className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition cursor-pointer"
                              title="Edit Reservation"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteStay(booking.id)}
                              className="p-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 transition cursor-pointer"
                              title="Delete/Cancel"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-500 font-semibold text-sm">
                          No Campground bookings found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: RESTAURANT BOOKINGS MANAGEMENT
            ========================================== */}
        {activeTab === "restaurant" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Restaurant & Picnic Bookings</h2>
                <p className="text-sm text-slate-500">View and adjust table configurations and schedules</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setRestForm({
                    customerName: "",
                    customerEmail: "",
                    customerPhone: "",
                    bookingDate: new Date().toISOString().split("T")[0],
                    timeSlot: "12:00 PM",
                    zone: "Skylight Restaurant",
                    peopleCount: 2,
                    status: "PENDING",
                    notes: "",
                  });
                  setModalType("restaurant");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <Plus size={16} /> Add Reservation
              </button>
            </div>

            {/* Restaurant Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Guest</label>
                <input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={restSearch}
                  onChange={(e) => setRestSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none placeholder-slate-400"
                />
              </div>
              <div className="w-56">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Zone Location</label>
                <select
                  value={restZoneFilter}
                  onChange={(e) => setRestZoneFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                >
                  <option value="ALL">All Zones</option>
                  <option value="Skylight Restaurant">Skylight Restaurant</option>
                  <option value="Sunset Bar">Sunset Bar</option>
                  <option value="Outdoor Picnic Spot">Outdoor Picnic Spot</option>
                </select>
              </div>
              <div className="w-48">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Booking Status</label>
                <select
                  value={restStatusFilter}
                  onChange={(e) => setRestStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="self-end pb-0.5">
                {(restSearch || restStatusFilter !== "ALL" || restZoneFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setRestSearch("");
                      setRestStatusFilter("ALL");
                      setRestZoneFilter("ALL");
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="p-5">Customer</th>
                      <th className="p-5">Location Zone</th>
                      <th className="p-5">Booking Date</th>
                      <th className="p-5">Time Slot</th>
                      <th className="p-5">Guests</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRestBookings.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-5">
                          <div className="font-bold text-slate-800 text-base">{res.customerName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{res.customerEmail}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{res.customerPhone}</div>
                          {res.notes && (
                            <div className="text-xs text-indigo-600 mt-1.5 font-bold italic max-w-[240px] truncate" title={res.notes}>
                              Note: {res.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-5 font-semibold text-emerald-600 text-sm">{res.zone}</td>
                        <td className="p-5 text-slate-700 text-sm">
                          <div className="font-medium">{new Date(res.bookingDate).toLocaleDateString()}</div>
                        </td>
                        <td className="p-5 font-bold text-slate-700 text-sm">{res.timeSlot}</td>
                        <td className="p-5 font-bold text-slate-700 text-sm">{res.peopleCount} guests</td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 text-xs font-bold uppercase rounded-full border ${getStatusColor(res.status)}`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => initEditRest(res)}
                              className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition cursor-pointer"
                              title="Edit Reservation"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRest(res.id)}
                              className="p-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 transition cursor-pointer"
                              title="Delete/Cancel"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRestBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-gray-500 font-semibold text-sm">
                          No table/picnic reservations found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: ACCOMMODATIONS CRUD
            ========================================== */}
        {activeTab === "accommodations" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Accommodations Listings</h2>
                <p className="text-sm text-slate-500">Manage stay properties (Wood Tents, campgrounds, bungalows)</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setAccForm({
                    name: "",
                    type: "WOOD_TENT",
                    pricingType: "PER_UNIT_PER_NIGHT",
                    basePrice: 50,
                    minCapacity: 1,
                    maxCapacity: 4,
                    description: "",
                    amenities: "",
                    nightThresholdEnabled: false,
                    nightThreshold: 5,
                  });
                  setModalType("accommodation");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <Plus size={16} /> Add Option
              </button>
            </div>

            {/* Accommodations Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Option</label>
                <input
                  type="text"
                  placeholder="Search by option name..."
                  value={accSearch}
                  onChange={(e) => setAccSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div className="w-56">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Accommodation Type</label>
                <select
                  value={accTypeFilter}
                  onChange={(e) => setAccTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="WOOD_TENT">WOOD_TENT</option>
                  <option value="INDIVIDUAL_CAMP">INDIVIDUAL_CAMP</option>
                  <option value="SCOUT_ZONE">SCOUT_ZONE</option>
                  <option value="BUNGALOW">BUNGALOW</option>
                </select>
              </div>
              <div className="self-end pb-0.5">
                {(accSearch || accTypeFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setAccSearch("");
                      setAccTypeFilter("ALL");
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAccommodations.map((acc) => (
                <div key={acc.id} className="bg-white border border-slate-200 hover:border-indigo-500/30 rounded-2xl p-7 flex flex-col justify-between shadow-sm shadow-slate-100 hover:shadow-md transition duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {acc.type}
                      </span>
                      <div className="text-indigo-600 font-black text-xl">${acc.basePrice}</div>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-3">{acc.name}</h3>
                    <p className="text-xs text-slate-500 mb-5 uppercase tracking-wider font-semibold">
                      Pricing: {acc.pricingType.replace(/_/g, " ")}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-500 border-t border-slate-100 pt-5">
                      <Users size={16} />
                      <span>Capacity: {acc.minCapacity} to {acc.maxCapacity} guests</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                    <button
                      onClick={() => initEditAcc(acc)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAcc(acc.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 text-xs font-bold text-red-600 transition cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredAccommodations.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold text-sm">
                  No accommodations found matching filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: EVENTS CRUD
            ========================================== */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Upcoming Events</h2>
                <p className="text-sm text-slate-500">Schedule Stargazing Nights, Scout Bonfires, or community gatherings</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setEventForm({
                    title: "",
                    description: "",
                    date: new Date().toISOString().split("T")[0],
                    price: 0,
                    requiresTicket: false,
                    capacity: 100,
                  });
                  setModalType("event");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <Plus size={16} /> Add Event
              </button>
            </div>

            {/* Events Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Event</label>
                <input
                  type="text"
                  placeholder="Search by title, description..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div className="self-end pb-0.5">
                {eventSearch && (
                  <button
                    onClick={() => setEventSearch("")}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white border border-slate-200 hover:border-orange-500/30 rounded-2xl p-7 flex flex-col justify-between shadow-sm shadow-slate-100 hover:shadow-md transition duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                        {event.price === 0 ? "FREE ENTRY" : `$${event.price}`}
                      </span>
                      <span className="text-sm text-slate-500 font-semibold">
                        {new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-3">{event.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-5 leading-relaxed">{event.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-5">
                      <span>Max Capacity: <strong className="text-slate-700">{event.capacity}</strong></span>
                      <span>Requires Ticket: <strong className="text-slate-700">{event.requiresTicket ? "Yes" : "No"}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                    <button
                      onClick={() => initEditEvent(event)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 text-xs font-bold text-red-600 transition cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold text-sm">
                  No scheduled events found matching filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: HIKES / LOCAL ATTRACTIONS
            ========================================== */}
        {activeTab === "hikes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Local Hikes & Attractions</h2>
                <p className="text-sm text-slate-500">View and update location details, grotto paths, or landmarks</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setHikeForm({
                    name: "",
                    category: "Nature Reserve",
                    description: "",
                    imageUrl: "https://picsum.photos/seed/hike/600/400",
                    location: "",
                    distance: "",
                    details: "",
                    externalUrl: "",
                  });
                  setModalType("hike");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <Plus size={16} /> Add Attraction
              </button>
            </div>

            {/* Hikes Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Attractions</label>
                <input
                  type="text"
                  placeholder="Search by name, description, region..."
                  value={hikeSearch}
                  onChange={(e) => setHikeSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div className="w-56">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                <select
                  value={hikeCategoryFilter}
                  onChange={(e) => setHikeCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Nature Reserve">Nature Reserve</option>
                  <option value="Waterfall">Waterfall</option>
                  <option value="Historical">Historical</option>
                  <option value="Grotto">Grotto</option>
                </select>
              </div>
              <div className="self-end pb-0.5">
                {(hikeSearch || hikeCategoryFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setHikeSearch("");
                      setHikeCategoryFilter("ALL");
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAttractions.map((hike) => (
                <div key={hike.id} className="bg-white border border-slate-200 hover:border-indigo-500/30 rounded-2xl p-7 flex flex-col justify-between shadow-sm shadow-slate-100 hover:shadow-md transition duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {hike.category}
                      </span>
                      <span className="text-sm text-emerald-600 font-bold">{hike.distance}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">{hike.name}</h3>
                    <div className="text-xs text-slate-500 mb-4 font-semibold">{hike.location}</div>
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-5">{hike.description}</p>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                    <button
                      onClick={() => initEditHike(hike)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHike(hike.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 text-xs font-bold text-red-600 transition cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredAttractions.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold text-sm">
                  No local hikes or attractions found matching filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: CUSTOMER REVIEWS
            ========================================== */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <h2 className="text-xl font-black text-slate-800">Customer Reviews Moderation</h2>
              <p className="text-sm text-slate-500">Approve customer feedback entries to go public, or delete reviews</p>
            </div>

            {/* Reviews Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Review text / Author</label>
                <input
                  type="text"
                  placeholder="Author or comment contents..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div className="w-56">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Moderation Status</label>
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Reviews</option>
                  <option value="approved">Approved Only</option>
                  <option value="pending">Pending Moderation</option>
                </select>
              </div>
              <div className="w-48">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Rating</label>
                <select
                  value={reviewRatingFilter}
                  onChange={(e) => setReviewRatingFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="self-end pb-0.5">
                {(reviewSearch || reviewStatusFilter !== "all" || reviewRatingFilter !== "all") && (
                  <button
                    onClick={() => {
                      setReviewSearch("");
                      setReviewStatusFilter("all");
                      setReviewRatingFilter("all");
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredReviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-sm shadow-slate-100 transition hover:bg-slate-50/50">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="font-bold text-slate-800 text-base">{rev.authorName}</div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                        {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                          <Star key={i} size={16} className="text-slate-300" />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 italic mb-5 leading-relaxed">
                      &ldquo;{rev.content}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-t border-slate-100 pt-5">
                      <span>Submitted {new Date(rev.createdAt).toLocaleDateString()}</span>
                      <span className={`px-3 py-1 rounded-full border ${rev.approved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                        {rev.approved ? "APPROVED" : "PENDING MODERATION"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                    {rev.approved ? (
                      <button
                        onClick={() => handleToggleReview(rev.id, false)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs font-bold text-amber-600 hover:bg-amber-100 transition cursor-pointer"
                      >
                        <XCircle size={14} /> Disapprove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleReview(rev.id, true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <CheckCircle size={14} /> Approve Public
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 transition cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredReviews.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold text-sm">
                  No customer reviews found matching filters.
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "zones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Dining Zones & Picnic Areas</h2>
                <p className="text-sm text-slate-500">Configure restaurant sections, outdoor picnic spots, capacity rules, and pricing</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setZoneForm({
                    name: "",
                    slug: "",
                    description: "",
                    capacity: 60,
                    price: 0,
                    minCapacity: 1,
                    daysOpen: "ALL",
                    openHour: 12,
                    coverImage: "",
                  });
                  setModalType("zone");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <Plus size={16} /> Add Zone Area
              </button>
            </div>

            {/* Dining Zones Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Dining Zones</label>
                <input
                  type="text"
                  placeholder="Search by zone name or description..."
                  value={zoneSearch}
                  onChange={(e) => setZoneSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div className="self-end pb-0.5">
                {zoneSearch && (
                  <button
                    onClick={() => setZoneSearch("")}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredZones.map((zone) => (
                <div key={zone.id} className="bg-white border border-slate-200 hover:border-indigo-500/30 rounded-2xl p-7 flex flex-col justify-between shadow-sm shadow-slate-100 hover:shadow-md transition duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {zone.daysOpen === "ALL" ? "Open Daily" : zone.daysOpen}
                      </span>
                      <div className="text-emerald-600 font-black text-xl">
                        {zone.price === 0 ? "Free Entry" : `$${zone.price}`}
                      </div>
                    </div>
                    
                    {zone.coverImage && (
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-slate-100">
                        <img src={zone.coverImage} alt={zone.name} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <h3 className="text-lg font-black text-slate-800 mb-2">{zone.name}</h3>
                    <div className="text-xs text-slate-500 mb-3 font-semibold">Slug: {zone.slug}</div>
                    
                    {zone.description && (
                      <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-5">{zone.description}</p>
                    )}
                    
                    <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                      <div className="flex justify-between">
                        <span>Max Capacity:</span>
                        <strong className="text-slate-700">{zone.capacity} guests</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Capacity:</span>
                        <strong className="text-slate-700">{zone.minCapacity} guests</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Open Hour:</span>
                        <strong className="text-slate-700">{zone.openHour}:00 PM</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                    <button
                      onClick={() => initEditZone(zone)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 text-xs font-bold text-red-600 transition cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredZones.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold text-sm">
                  No dining or picnic zones found matching filters.
                </div>
              )}
            </div>
          </div>
        )}

      </section>

      {/* ==========================================
          OVERLAY MODALS FOR FORMS
          ========================================== */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full ${modalType === "accommodation" && editingItem ? "max-w-2xl" : "max-w-lg"} bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto`}>
            
            {/* Modal Header */}
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider">
              {editingItem ? "Edit" : "Create"} {modalType}
            </h3>

            {/* Form Accommodations */}
            {modalType === "accommodation" && (
              <form onSubmit={handleAccSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Accommodation Name</label>
                  <input
                    type="text"
                    required
                    value={accForm.name}
                    onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    placeholder="e.g. Deluxe Wood Tent #5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Type</label>
                    <select
                      value={accForm.type}
                      onChange={(e) => setAccForm({ ...accForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      <option value="WOOD_TENT">WOOD_TENT</option>
                      <option value="INDIVIDUAL_CAMP">INDIVIDUAL_CAMP</option>
                      <option value="SCOUT_ZONE">SCOUT_ZONE</option>
                      <option value="BUNGALOW">BUNGALOW</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Pricing Model</label>
                    <select
                      value={accForm.pricingType}
                      onChange={(e) => setAccForm({ ...accForm, pricingType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      <option value="PER_UNIT_PER_NIGHT">PER_UNIT_PER_NIGHT</option>
                      <option value="PER_PERSON_PER_NIGHT">PER_PERSON_PER_NIGHT</option>
                      <option value="PER_PERSON_PER_DAY">PER_PERSON_PER_DAY</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Base Price ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={accForm.basePrice}
                    onChange={(e) => setAccForm({ ...accForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Min Guests Capacity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={accForm.minCapacity}
                      onChange={(e) => setAccForm({ ...accForm, minCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Max Guests Capacity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={accForm.maxCapacity}
                      onChange={(e) => setAccForm({ ...accForm, maxCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={accForm.description}
                    onChange={(e) => setAccForm({ ...accForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none"
                    placeholder="Describe stay amenities, clearings, and features..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Amenities (comma-separated list)</label>
                  <input
                    type="text"
                    value={accForm.amenities}
                    onChange={(e) => setAccForm({ ...accForm, amenities: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    placeholder="e.g. Spring Water, Campfire Area, Warm Showers"
                  />
                </div>

                {/* Night Threshold Pricing */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accForm.nightThresholdEnabled}
                        onChange={(e) => setAccForm({ ...accForm, nightThresholdEnabled: e.target.checked })}
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      <span className="font-bold text-slate-700 text-xs">Enable Night Rate Discount Pricing</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    When enabled: if a booking is <strong>less than</strong> the threshold (e.g. 4 days), the daily rate applies normally. 
                    If <strong>≥ threshold</strong>, the customer is charged for <em>(days − 1) nights</em> instead, showing a discount on the frontend.
                  </p>
                  {accForm.nightThresholdEnabled && (
                    <div className="w-48">
                      <label className="block font-bold text-slate-500 mb-1.5 text-xs">Threshold (min days to activate)</label>
                      <input
                        type="number"
                        min={2}
                        max={30}
                        value={accForm.nightThreshold}
                        onChange={(e) => setAccForm({ ...accForm, nightThreshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "Save Listing"}
                  </button>
                </div>

                {editingItem && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
                    {/* Addon Management */}
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">Manage Stay Addons</h4>
                      {editingItem.addons && editingItem.addons.length > 0 ? (
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                          {editingItem.addons.map((addon: any) => (
                            <div key={addon.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                              <div>
                                <span className="font-bold text-slate-800 text-[11px]">{addon.name}</span>
                                <span className="text-[10px] text-slate-500 ml-2">(${addon.price} {addon.priceType === "PER_NIGHT" ? "/night" : "once"})</span>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Delete addon "${addon.name}"?`)) {
                                    setActionLoading(true);
                                    const res = await deleteAccommodationAddon(addon.id);
                                    setActionLoading(false);
                                    if (res.success) {
                                      const updatedAddons = editingItem.addons.filter((a: any) => a.id !== addon.id);
                                      setEditingItem({ ...editingItem, addons: updatedAddons });
                                      refreshData();
                                    } else {
                                      alert(res.error);
                                    }
                                  }
                                }}
                                className="text-red-500 hover:text-red-600 font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic mb-3">No addons configured yet.</p>
                      )}

                      {/* Add Addon Inline Form */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                        <span className="block text-[10px] font-bold text-slate-500">Add New Addon</span>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            id="newAddonName"
                            placeholder="Addon Name"
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none text-[11px]"
                          />
                          <input
                            type="number"
                            id="newAddonPrice"
                            placeholder="Price ($)"
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none text-[11px]"
                          />
                          <select
                            id="newAddonPriceType"
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none text-[11px]"
                          >
                            <option value="PER_NIGHT">PER_NIGHT</option>
                            <option value="ONCE">ONCE</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const nameEl = document.getElementById("newAddonName") as HTMLInputElement;
                            const priceEl = document.getElementById("newAddonPrice") as HTMLInputElement;
                            const priceTypeEl = document.getElementById("newAddonPriceType") as HTMLSelectElement;
                            if (!nameEl.value || !priceEl.value) {
                              alert("Please enter addon name and price");
                              return;
                            }
                            setActionLoading(true);
                            const res = await createAccommodationAddon({
                              accommodationId: editingItem.id,
                              name: nameEl.value,
                              price: Number(priceEl.value),
                              priceType: priceTypeEl.value,
                            });
                            setActionLoading(false);
                            if (res.success) {
                              nameEl.value = "";
                              priceEl.value = "";
                              const updatedAddons = [...(editingItem.addons || []), res.addon];
                              setEditingItem({ ...editingItem, addons: updatedAddons });
                              refreshData();
                            } else {
                              alert(res.error);
                            }
                          }}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-[11px]"
                        >
                          Add Addon
                        </button>
                      </div>
                    </div>

                    {/* Gallery Management */}
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">Manage Gallery Images</h4>
                      {editingItem.images && editingItem.images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 mb-3 max-h-40 overflow-y-auto">
                          {editingItem.images.map((img: any) => (
                            <div key={img.id} className="relative group border border-slate-200 rounded-lg overflow-hidden h-16 bg-slate-100">
                              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm("Delete this gallery image?")) {
                                    setActionLoading(true);
                                    const res = await deleteAccommodationImage(img.id);
                                    setActionLoading(false);
                                    if (res.success) {
                                      const updatedImages = editingItem.images.filter((i: any) => i.id !== img.id);
                                      setEditingItem({ ...editingItem, images: updatedImages });
                                      refreshData();
                                    } else {
                                      alert(res.error);
                                    }
                                  }
                                }}
                                className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center font-bold text-[10px] opacity-0 group-hover:opacity-100 transition"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic mb-3">No gallery images uploaded yet.</p>
                      )}

                      {/* Add Image Inline Form */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                        <span className="block text-[10px] font-bold text-slate-500">Add New Image URL</span>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            id="newImageUrl"
                            placeholder="https://images.unsplash.com/... or relative path"
                            className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const urlEl = document.getElementById("newImageUrl") as HTMLInputElement;
                              if (!urlEl.value) {
                                alert("Please enter a valid image URL");
                                return;
                              }
                              setActionLoading(true);
                              const res = await addAccommodationImage({
                                accommodationId: editingItem.id,
                                imageUrl: urlEl.value,
                              });
                              setActionLoading(false);
                              if (res.success) {
                                urlEl.value = "";
                                const updatedImages = [...(editingItem.images || []), res.image];
                                setEditingItem({ ...editingItem, images: updatedImages });
                                refreshData();
                              } else {
                                alert(res.error);
                              }
                            }}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-[11px]"
                          >
                            Add Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Form Stay Bookings */}
            {modalType === "stay" && (
              <form onSubmit={handleStaySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Select Option</label>
                  <select
                    value={stayForm.accommodationId}
                    onChange={(e) => setStayForm({ ...stayForm, accommodationId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  >
                    {accommodations.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} (${a.basePrice})</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const selAcc = accommodations.find((a) => a.id === stayForm.accommodationId);
                  if (selAcc?.type === "SCOUT_ZONE") {
                    return (
                      <div>
                        <label className="block font-bold text-slate-500 mb-1.5">Group Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. GSS Jounieh"
                          value={stayForm.groupName}
                          onChange={(e) => setStayForm({ ...stayForm, groupName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={stayForm.customerName}
                      onChange={(e) => setStayForm({ ...stayForm, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Customer Phone</label>
                    <input
                      type="text"
                      required
                      value={stayForm.customerPhone}
                      onChange={(e) => setStayForm({ ...stayForm, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={stayForm.customerEmail}
                    onChange={(e) => setStayForm({ ...stayForm, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={stayForm.startDate}
                      onChange={(e) => setStayForm({ ...stayForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">End Date</label>
                    <input
                      type="date"
                      required
                      value={stayForm.endDate}
                      onChange={(e) => setStayForm({ ...stayForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Guest Count</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={stayForm.peopleCount}
                      onChange={(e) => setStayForm({ ...stayForm, peopleCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Booking Status</label>
                    <select
                      value={stayForm.status}
                      onChange={(e) => setStayForm({ ...stayForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="DEPOSIT_PAID">DEPOSIT_PAID</option>
                      <option value="FULL_PAID">FULL_PAID</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Booking Notes</label>
                  <textarea
                    rows={3}
                    value={stayForm.notes}
                    onChange={(e) => setStayForm({ ...stayForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none"
                    placeholder="e.g. Near coordinates, close to campfire setup, scout preferences..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "Save Reservation"}
                  </button>
                </div>
              </form>
            )}

            {/* Form Restaurant Bookings */}
            {modalType === "restaurant" && (
              <form onSubmit={handleRestSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={restForm.customerName}
                      onChange={(e) => setRestForm({ ...restForm, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Customer Phone</label>
                    <input
                      type="text"
                      required
                      value={restForm.customerPhone}
                      onChange={(e) => setRestForm({ ...restForm, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={restForm.customerEmail}
                    onChange={(e) => setRestForm({ ...restForm, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Booking Date</label>
                    <input
                      type="date"
                      required
                      value={restForm.bookingDate}
                      onChange={(e) => setRestForm({ ...restForm, bookingDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Time Slot</label>
                    <select
                      value={restForm.timeSlot}
                      onChange={(e) => setRestForm({ ...restForm, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      {activeTimeSlots.map((ts) => (
                        <option key={ts} value={ts}>
                          {ts}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {dateError && (
                  <div className="p-3 bg-amber-100 border border-amber-200 text-amber-700 rounded-xl font-bold text-[10px] animate-scaleUp">
                    ⚠️ {dateError}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-500 mb-1.5">Zone Location</label>
                    <select
                      value={restForm.zone}
                      onChange={(e) => setRestForm({ ...restForm, zone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      <option value="Skylight Restaurant">Skylight Restaurant</option>
                      <option value="Sunset Bar">Sunset Bar</option>
                      <option value="Outdoor Picnic Spot">Outdoor Picnic Spot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Guests</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={restForm.peopleCount}
                      onChange={(e) => setRestForm({ ...restForm, peopleCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Booking Status</label>
                  <select
                    value={restForm.status}
                    onChange={(e) => setRestForm({ ...restForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Reservation Notes</label>
                  <textarea
                    rows={3}
                    value={restForm.notes}
                    onChange={(e) => setRestForm({ ...restForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none"
                    placeholder="e.g. Birthday celebration, window seat preference, gluten free options..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "Save Reservation"}
                  </button>
                </div>
              </form>
            )}

            {/* Form Events */}
            {modalType === "event" && (
              <form onSubmit={handleEventSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Event Title</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    placeholder="e.g. Autumn Stargazing Peak"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Description Summary</label>
                  <textarea
                    required
                    rows={4}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none"
                    placeholder="Provide details about astronomers, bonfire guidelines, or snacks included..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Event Date</label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Ticket Price ($)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={eventForm.price}
                      onChange={(e) => setEventForm({ ...eventForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Total Capacity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 font-bold text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.requiresTicket}
                        onChange={(e) => setEventForm({ ...eventForm, requiresTicket: e.target.checked })}
                        className="w-4 h-4 bg-slate-50 border border-slate-200 rounded accent-indigo-600 focus:ring-0 outline-none"
                      />
                      Requires Ticket Reservation
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "Save Event"}
                  </button>
                </div>
              </form>
            )}

            {/* Form Hikes / Attractions */}
            {modalType === "hike" && (
              <form onSubmit={handleHikeSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Attraction Name</label>
                    <input
                      type="text"
                      required
                      value={hikeForm.name}
                      onChange={(e) => setHikeForm({ ...hikeForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="e.g. Afqa Waterfalls"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Category</label>
                    <input
                      type="text"
                      required
                      value={hikeForm.category}
                      onChange={(e) => setHikeForm({ ...hikeForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="e.g. Nature Reserve, Grotto"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Short Description</label>
                  <input
                    type="text"
                    required
                    value={hikeForm.description}
                    onChange={(e) => setHikeForm({ ...hikeForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    placeholder="Short one-liner summary..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Region/Location</label>
                    <input
                      type="text"
                      required
                      value={hikeForm.location}
                      onChange={(e) => setHikeForm({ ...hikeForm, location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="e.g. Tannourine, Lebanon"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Distance/Time from Village</label>
                    <input
                      type="text"
                      required
                      value={hikeForm.distance}
                      onChange={(e) => setHikeForm({ ...hikeForm, distance: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="e.g. 15 mins hike"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Extended Details & Guidelines</label>
                  <textarea
                    required
                    rows={4}
                    value={hikeForm.details}
                    onChange={(e) => setHikeForm({ ...hikeForm, details: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none"
                    placeholder="Describe historical context, geological features, or gear guidelines for visitors..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Image Link</label>
                    <input
                      type="url"
                      value={hikeForm.imageUrl}
                      onChange={(e) => setHikeForm({ ...hikeForm, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">External Travel Guide Link</label>
                    <input
                      type="url"
                      value={hikeForm.externalUrl}
                      onChange={(e) => setHikeForm({ ...hikeForm, externalUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "Save Attraction"}
                  </button>
                </div>
              </form>
            )}

            {/* Form Dining Zones */}
            {modalType === "zone" && (
              <form onSubmit={handleZoneSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 mb-1.5">Zone Name</label>
                  <input
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setZoneForm({ ...zoneForm, name, slug });
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Sunset Bar Patio"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-400 mb-1.5">Unique Slug</label>
                    <input
                      type="text"
                      required
                      value={zoneForm.slug}
                      onChange={(e) => setZoneForm({ ...zoneForm, slug: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="sunset-bar-patio"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 mb-1.5">Base Price / Cover ($)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={zoneForm.price}
                      onChange={(e) => setZoneForm({ ...zoneForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={zoneForm.description}
                    onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Describe zone vibes, views, rules..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-400 mb-1.5">Max Guests</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={zoneForm.capacity}
                      onChange={(e) => setZoneForm({ ...zoneForm, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 mb-1.5">Min Guests</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={zoneForm.minCapacity}
                      onChange={(e) => setZoneForm({ ...zoneForm, minCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 mb-1.5">Open Hour</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={23}
                      value={zoneForm.openHour}
                      onChange={(e) => setZoneForm({ ...zoneForm, openHour: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. 12"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Days Open (Check individual days)</label>
                    <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => {
                        const isDaySelected = zoneForm.daysOpen === "ALL" || zoneForm.daysOpen.toUpperCase().split(",").includes(day);
                        return (
                          <label key={day} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-700 select-none">
                            <input
                              type="checkbox"
                              checked={isDaySelected}
                              onChange={() => {
                                let currentDays = zoneForm.daysOpen === "ALL" ? ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] : zoneForm.daysOpen.split(",").filter(Boolean);
                                if (currentDays.includes(day)) {
                                  currentDays = currentDays.filter(d => d !== day);
                                } else {
                                  currentDays.push(day);
                                }
                                if (currentDays.length === 7) {
                                  setZoneForm({ ...zoneForm, daysOpen: "ALL" });
                                } else if (currentDays.length === 0) {
                                  setZoneForm({ ...zoneForm, daysOpen: "" });
                                } else {
                                  setZoneForm({ ...zoneForm, daysOpen: currentDays.join(",") });
                                }
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            {day.substring(0, 3)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1.5">Cover Image URL</label>
                    <input
                      type="url"
                      value={zoneForm.coverImage}
                      onChange={(e) => setZoneForm({ ...zoneForm, coverImage: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "Save Zone"}
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
