"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  UserCog,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/lib/actions/users";
import { UserRole } from "@prisma/client";
import { formatDate, cn } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date | string;
}

interface UsersManagerProps {
  initialUsers: UserItem[];
}

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  ADMIN: { label: "System Admin", className: "badge-red" },
  CLASS_ADMIN: { label: "Class Admin", className: "badge-blue" },
  LECTURER: { label: "Lecturer", className: "badge-purple" },
  ASSISTANT: { label: "Assistant", className: "badge-teal" },
};

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
  }>({
    name: "",
    email: "",
    password: "",
    role: UserRole.CLASS_ADMIN,
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  function openCreateModal() {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: UserRole.CLASS_ADMIN,
      isActive: true,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(user: UserItem) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(user: UserItem) {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  }

  async function handleToggleActive(user: UserItem) {
    startTransition(async () => {
      const res = await updateUserAction(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: !user.isActive,
      });

      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isActive: !user.isActive } : u
          )
        );
      }
    });
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("User's name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("Valid email address is required.");
      return;
    }
    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      if (editingUser) {
        const payload: any = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const res = await updateUserAction(editingUser.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update user.");
        } else {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? {
                    ...u,
                    ...payload,
                  }
                : u
            )
          );
          setModalOpen(false);
        }
      } else {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          role: formData.role,
          isActive: formData.isActive,
        };

        const res = await createUserAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to create user account.");
        } else {
          const newUser: UserItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            isActive: payload.isActive,
            createdAt: new Date(),
          };
          setUsers((prev) => [...prev, newUser]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingUser) return;
    const res = await deleteUserAction(deletingUser.id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    }
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Role Segmented Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
              roleFilter === "ALL"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>All Users</span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              {users.length}
            </span>
          </button>
          {Object.entries(ROLE_BADGE).map(([roleKey, badge]) => {
            const count = users.filter((u) => u.role === roleKey).length;
            return (
              <button
                key={roleKey}
                type="button"
                onClick={() => setRoleFilter(roleKey)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
                  roleFilter === roleKey
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <span>{badge.label}</span>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    count > 0 ? "text-slate-500 dark:text-slate-400 font-medium" : "text-slate-400 dark:text-slate-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-8.5 pr-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={16} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No users found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create an administrative, lecturer, or assistant account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">NAME & EMAIL</th>
                  <th className="py-3 px-6">SYSTEM ROLE</th>
                  <th className="py-3 px-6">STATUS</th>
                  <th className="py-3 px-6">CREATED</th>
                  <th className="py-3 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-[#0c1427]">
                {filteredUsers.map((user) => {
                  const roleBadge = ROLE_BADGE[user.role] || {
                    label: user.role,
                    className: "badge-gray",
                  };

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white leading-snug">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn("px-2 py-0.5 rounded text-[11px] font-medium border", roleBadge.className)}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          className="flex items-center gap-1.5 group cursor-pointer"
                          title={user.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          {user.isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 flex items-center gap-1">
                              <CheckCircle size={11} />
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 flex items-center gap-1">
                              <XCircle size={11} />
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteDialog(user)}
                            className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Edit User Account" : "Create New User Account"}
        description="Configure account permissions, role levels, and password."
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4.5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              {editingUser ? "New Password (Leave blank to keep unchanged)" : "Password"} {!editingUser && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="password"
              placeholder={editingUser ? "••••••••" : "Masukkan password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required={!editingUser}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Role Permission Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors cursor-pointer"
            >
              <option value={UserRole.ADMIN}>ADMIN (Full system access & user management)</option>
              <option value={UserRole.CLASS_ADMIN}>CLASS_ADMIN (Manage schedules, tasks, content)</option>
              <option value={UserRole.LECTURER}>LECTURER (Assignments & course material)</option>
              <option value={UserRole.ASSISTANT}>ASSISTANT (Schedule and lab tasks assistant)</option>
            </select>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Account is Active (can sign in)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary text-sm font-medium px-4 py-2"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-sm font-medium px-5 py-2 flex items-center gap-2"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              <span>{editingUser ? "Save Changes" : "Create Account"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        description="Are you sure you want to delete this user? They will immediately lose access to the administrative dashboard."
        itemTitle={deletingUser ? `${deletingUser.name} (${deletingUser.email})` : undefined}
      />
    </div>
  );
}
