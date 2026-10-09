"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Mail,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import { changePasswordAction } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date | string;
}

interface ProfileViewProps {
  user: ProfileUser;
}

const ROLE_META: Record<UserRole, { label: string; desc: string; badgeClass: string }> = {
  ADMIN: {
    label: "Super Admin",
    desc: "Akses penuh konfigurasi sistem, database, dan manajemen akun pengguna.",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  CLASS_ADMIN: {
    label: "Class Admin",
    desc: "Pengelola aktivitas kelas, jadwal, tugas kuliah, materi, jurnal, dan pengumuman.",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  LECTURER: {
    label: "Dosen / Wali Dosen",
    desc: "Akses pemantauan progres kelas, input materi, dan jurnal perkuliahan.",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  ASSISTANT: {
    label: "Asisten Praktikum",
    desc: "Membantu input penugasan praktikum, materi ajar, dan rekap pembelajaran.",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};

export function ProfileView({ user }: ProfileViewProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const roleInfo = ROLE_META[user.role] || {
    label: user.role,
    desc: "Pengguna terdaftar di ClassHub.",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, text: "Lemah (min. 8 karakter)", color: "bg-rose-500 text-rose-400" };
    if (score <= 3) return { score: 2, text: "Sedang", color: "bg-amber-500 text-amber-400" };
    return { score: 3, text: "Kuat & Aman", color: "bg-emerald-500 text-emerald-400" };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword.trim()) {
      setErrorMessage("Silakan masukkan password saat ini.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi password baru tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mengubah password.");
      } else {
        setSuccessMessage("Kata sandi berhasil diperbarui! Silakan gunakan password baru ini pada login Anda berikutnya.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Profile Card & Role Info */}
      <div className="lg:col-span-5 space-y-6">
        {/* User Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="relative mb-3.5">
              <Avatar name={user.name} size="lg" className="ring-4 ring-blue-500/20" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1427] flex items-center justify-center text-white text-[10px]" title="Akun Aktif">
                <Check size={11} strokeWidth={3} />
              </div>
            </div>

            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {user.email}
            </p>

            <div className="mt-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${roleInfo.badgeClass}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>

          {/* Account Details List */}
          <div className="pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield size={13} className="text-blue-500" />
                <span>Hak Akses</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {roleInfo.label}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Mail size={13} className="text-blue-500" />
                <span>Email Terdaftar</span>
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                {user.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-500" />
                <span>Terdaftar Sejak</span>
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {user.createdAt ? formatDate(user.createdAt) : "Terverifikasi"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Status Akun</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Aktif & Terlindungi
              </span>
            </div>
          </div>
        </div>

        {/* Role Permissions Summary */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/15 dark:border-blue-500/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Sparkles size={14} />
            <span>Deskripsi Peran ({roleInfo.label})</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {roleInfo.desc}
          </p>
        </div>
      </div>

      {/* Right Column: Password Change Form */}
      <div className="lg:col-span-7">
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Ubah Kata Sandi Akun
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ganti password lama Anda untuk menjaga keamanan akses kelas
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in-0 duration-150">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in-0 duration-150">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password Saat Ini <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama Anda"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060b17] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                {newPassword && (
                  <span className={`text-[10px] font-semibold ${strength.color.split(" ")[1]}`}>
                    {strength.text}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060b17] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength bar */}
              {newPassword && (
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      strength.score >= 1 ? strength.color.split(" ")[0] : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      strength.score >= 2 ? strength.color.split(" ")[0] : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      strength.score >= 3 ? strength.color.split(" ")[0] : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Konfirmasi Password Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060b17] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[10px] text-rose-500 font-medium">
                  Konfirmasi password tidak cocok dengan password baru.
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Password cocok
                </p>
              )}
            </div>

            {/* Password security tips */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060b17] border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Tips Keamanan Akun:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Gunakan minimal 8 karakter dengan campuran huruf, angka, dan simbol.</li>
                  <li>Jangan gunakan password yang sama dengan akun media sosial atau email pribadi.</li>
                  <li>Jangan bagikan kredensial admin Anda kepada pihak yang tidak berwenang.</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                className="btn btn-primary btn-sm flex items-center gap-1.5 px-5 py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Memperbarui Password...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Simpan Perubahan Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
