"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/adminActions";
import { ShieldCheck, UserCheck, ChefHat, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "waiter" | "kitchen">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginAction({ username, password, role, isQuickAccess: false });
    setLoading(false);

    if (res.success) {
      router.push(`/dashboard/${res.role}`);
      router.refresh();
    } else {
      setError(res.error || "Login failed");
    }
  };

  const handleQuickAccess = async (selectedRole: "admin" | "waiter" | "kitchen") => {
    setLoading(true);
    setError(null);

    // Auto-fill presets for credentials just for visual aid
    const presetUser = selectedRole;
    const presetPass = `${selectedRole}123`;
    
    const res = await loginAction({
      username: presetUser,
      password: presetPass,
      role: selectedRole,
      isQuickAccess: true,
    });
    setLoading(false);

    if (res.success) {
      router.push(`/dashboard/${res.role}`);
      router.refresh();
    } else {
      setError(res.error || "Quick Access failed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0f1d] flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 text-indigo-400">
            <ShieldCheck size={32} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Skylight Village</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Staff & Operations Portal</p>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold animate-shake">
            {error}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setRole("admin"); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              role === "admin"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldCheck size={16} />
            Admin
          </button>
          <button
            onClick={() => { setRole("waiter"); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              role === "waiter"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <UserCheck size={16} />
            Waiter
          </button>
          <button
            onClick={() => { setRole("kitchen"); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              role === "kitchen"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ChefHat size={16} />
            Kitchen
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder={role}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In to Operations"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative z-10 px-3 bg-[#0c1224] text-xs font-bold text-gray-500 uppercase tracking-widest">
            Quick Sandbox Access
          </span>
        </div>

        {/* Quick Access Badges */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleQuickAccess("admin")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition text-indigo-400 cursor-pointer"
          >
            <ShieldCheck size={20} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickAccess("waiter")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition text-emerald-400 cursor-pointer"
          >
            <UserCheck size={20} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Waiter</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickAccess("kitchen")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition text-amber-400 cursor-pointer"
          >
            <ChefHat size={20} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Kitchen</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-500 font-medium">
          Skylight Village Lebanon • Secured Backend
        </div>
      </div>
    </div>
  );
}
