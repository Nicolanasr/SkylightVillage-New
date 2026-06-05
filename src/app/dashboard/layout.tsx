import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/adminActions";
import { ShieldAlert, LogOut, Compass, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface SessionData {
    username: string;
    role: "admin" | "waiter" | "kitchen";
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");

    if (!sessionCookie || !sessionCookie.value) {
        redirect("/login");
    }

    let session: SessionData;
    try {
        session = JSON.parse(sessionCookie.value) as SessionData;
    } catch (e) {
        redirect("/login");
    }

    const roleLabels: Record<string, { label: string; color: string }> = {
        admin: { label: "Administrator", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
        waiter: { label: "Waiter Staff", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
        kitchen: { label: "Kitchen Crew", color: "bg-amber-50 text-amber-600 border-amber-200" },
    };

    const currentRole = roleLabels[session.role] || { label: session.role, color: "bg-slate-50 text-slate-600 border-slate-200" };

    // Server action trigger for logout
    const handleLogoutServer = async () => {
        "use server";
        await logoutAction();
        redirect("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-[140px] pointer-events-none" />

            {/* Main operations navigation */}
            <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Logo & Role Badge */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-slate-900 font-black tracking-wider text-xl hover:opacity-90 transition">
                            <Compass className="text-indigo-600 animate-spin-slow" size={24} />
                            <span>SKYLIGHT</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">OPS</span>
                        </Link>

                        <div className="hidden md:flex items-center">
                            <span className="text-slate-300 text-xs px-2">|</span>
                            <span className={`text-[10px] px-3 py-0.5 font-bold uppercase tracking-wider rounded-full border ${currentRole.color}`}>
                                {currentRole.label}
                            </span>
                        </div>
                    </div>

                    {/* Quick Dashboard Switchers / Profile & Logout */}
                    <div className="flex items-center gap-3">
                        {/* Quick dashboard link check */}
                        <div className="flex items-center gap-1.5 mr-2">
                            <Link
                                href="/dashboard/admin"
                                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition title"
                                title="Admin Panel"
                            >
                                <LayoutDashboard size={20} />
                            </Link>
                        </div>

                        {/* Profile Info */}
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-800">{session.username}</span>
                            <span className="text-[9px] text-slate-400 font-medium">Logged in via Portal</span>
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-xs font-black text-indigo-600 uppercase">
                            {session.username.substring(0, 2)}
                        </div>

                        {/* Logout Form Trigger */}
                        <form action={handleLogoutServer}>
                            <button
                                type="submit"
                                className="flex items-center justify-center p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition cursor-pointer"
                                title="Logout from operations"
                            >
                                <LogOut size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main operational workspace */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {children}
            </main>

            {/* Operations Footer */}
            <footer className="w-full py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-semibold relative z-10">
                Skylight Operations Control Room &bull; Confidential Administrative Access Only
            </footer>
        </div>
    );
}
