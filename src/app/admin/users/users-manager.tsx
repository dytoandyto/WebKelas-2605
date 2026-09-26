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
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              roleFilter === "ALL"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            All Users ({users.length})
          </button>
          {Object.entries(ROLE_BADGE).map(([roleKey, badge]) => {
            const count = users.filter((u) => u.role === roleKey).length;
            return (
              <button
                key={roleKey}
                type="button"
                onClick={() => setRoleFilter(roleKey)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                  roleFilter === roleKey
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {badge.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input text-xs pl-8 pr-3 py-1.5 w-full"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No users found</p>
            <p className="text-xs text-slate-400 mt-1">
              Create an administrative, lecturer, or assistant account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Name & Email</th>
                  <th className="py-3.5 px-6">System Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.map((user) => {
                  const roleBadge = ROLE_BADGE[user.role] || {
                    label: user.role,
                    className: "badge-gray",
                  };

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn("badge text-xs", roleBadge.className)}>
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
                            <span className="badge badge-green text-xs flex items-center gap-1">
                              <CheckCircle size={11} />
                              Active
                            </span>
                          ) : (
                            <span className="badge badge-gray text-xs flex items-center gap-1">
                              <XCircle size={11} />
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteDialog(user)}
                            className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-red-600"
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
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Maya Indah"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              placeholder="e.g. maya@classhub.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">
              {editingUser ? "New Password (Leave blank to keep unchanged)" : "Password *"}
            </label>
            <input
              type="password"
              placeholder={editingUser ? "••••••••" : "Minimum 8 characters"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input text-sm w-full"
              required={!editingUser}
            />
          </div>

          <div>
            <label className="form-label">Role Permission Level *</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="form-select text-sm w-full"
            >
              <option value={UserRole.ADMIN}>ADMIN (Full system access & user management)</option>
              <option value={UserRole.CLASS_ADMIN}>CLASS_ADMIN (Manage schedules, tasks, content)</option>
              <option value={UserRole.LECTURER}>LECTURER (Assignments & course material)</option>
              <option value={UserRole.ASSISTANT}>ASSISTANT (Schedule and lab tasks assistant)</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Account is Active (can sign in)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary text-sm"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-sm flex items-center gap-2"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              {editingUser ? "Save Changes" : "Create Account"}
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
