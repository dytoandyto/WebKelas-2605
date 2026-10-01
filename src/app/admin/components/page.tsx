"use client";

import * as React from "react";
import {
  Calendar,
  CheckSquare,
  Users,
  Trophy,
  Sparkles,
  BookOpen,
  Plus,
  Search,
  Download,
  AlertCircle,
  Copy,
  Trash2,
  Clock,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Badge,
  TaskTypeBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { Tooltip } from "@/components/ui/tooltip";
import { Pagination } from "@/components/ui/pagination";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonCard, SkeletonList } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { TaskCard } from "@/components/tasks/task-card";
import { ScheduleBlock } from "@/components/schedule/schedule-block";
import { DailyNoteCard } from "@/components/daily-notes/daily-note-card";
import { StudentCard } from "@/components/students/student-card";

export default function ComponentsShowcasePage() {
  const { toast, success, error, warning, info } = useToast();
  const [currentPage, setCurrentPage] = React.useState(2);
  const [switchChecked, setSwitchChecked] = React.useState(true);
  const [checkboxChecked, setCheckboxChecked] = React.useState(true);
  const [currentView, setCurrentView] = React.useState<any>("board");

  // Sample data for showcase
  const sampleTask = {
    id: "task-demo-1",
    title: "Analisis Arsitektur Sistem Informasi Enterprise Bab 3",
    description: "Kaji implementasi TOGAF ADM pada studi kasus perbankan digital.",
    subject: { code: "BBK1AAB4", name: "Sistem Informasi Enterprise" },
    taskType: "GROUP",
    deadline: new Date(Date.now() + 86400000 * 2),
    priority: "HIGH",
    status: "IN_PROGRESS",
    groupName: "Kelompok 04",
  };

  const sampleStudent = {
    id: "std-1",
    studentNumber: "1202223001",
    name: "Ahmad Fauzi Rahman",
    major: "S1 Sistem Informasi",
    className: "JS1SI-26-REG-05",
    bio: "Passionate Cloud Architect and Full-Stack Web Developer.",
    motivation: "Konsistensi adalah kunci keunggulan teknologi.",
    achievements: [
      { id: "ach-1", title: "Juara 1 Hackathon Nasional 2026" },
      { id: "ach-2", title: "Medali Emas UI/UX Design Competition" },
    ],
  };

  const sampleDailyNote = {
    id: "note-1",
    title: "Pertemuan 5: Optimasi Query SQL dan Arsitektur Sharding",
    date: new Date(),
    summary:
      "Membahas indexing B-Tree, query explain plan, serta teknik horizontal partitioning pada PostgreSQL.",
    content: "Catatan detail perkuliahan basis data lanjut...",
    subject: { code: "BBK1AAB4", name: "Basis Data Lanjut" },
    author: { name: "Farhan Maulana" },
    tags: "sql, postgresql, indexing",
    createdAt: new Date(),
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24 text-left">
      {/* Page Header */}
      <PageHeader
        density="dashboard"
        badge="DESIGN SYSTEM • CLASS ARCHITECTURE"
        title="Komponen & Panduan Desain"
        description="Dokumentasi interaktif seluruh token dan komponen antarmuka sistem ClassHub. Mendukung Light Mode & Dark Mode dengan semantic tokens."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Design System" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Uji Tema:
            </span>
            <ThemeSwitcher variant="pill" />
          </div>
        }
      />

      {/* ── 1. BUTTONS ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1 border-b border-[var(--border-color)] pb-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            1. Button Component
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Varian: primary, secondary, outline, ghost, danger, success, link. Ukuran: sm, md, lg, icon. Mendukung loading, hover, focus, disabled.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400 light:text-blue-600 uppercase">
              // Varian Gaya
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary CTA</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400 light:text-blue-600 uppercase">
              // Ukuran & State
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Icon only">
                <Sparkles className="w-4 h-4" />
              </Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                With Icons
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CARDS ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1 border-b border-[var(--border-color)] pb-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            2. Card Component
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Varian: default, glass, elevated, outline, interactive, featured.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Border bersih & surface token</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--text-secondary)]">
                Digunakan untuk kontainer informasi standar.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Backdrop-blur & refleksi semi-transparan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--text-secondary)]">
                Digunakan untuk floating element atau overlay widget.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Bayangan dalam & kedalaman visual</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--text-secondary)]">
                Digunakan untuk konten tingkat tinggi.
              </p>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardHeader>
              <CardTitle>Outline Card</CardTitle>
              <CardDescription>Dominasi border transparan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--text-secondary)]">
                Cocok untuk section sekunder atau grid minimalis.
              </p>
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Hover lift & border highlight</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--text-secondary)]">
                Dipakai oleh TaskCard, ScheduleBlock, StudentCard.
              </p>
            </CardContent>
          </Card>

          <Card variant="featured">
            <CardHeader>
              <CardTitle>Featured Card</CardTitle>
              <CardDescription>Electric ambient glow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--text-secondary)]">
                Dipakai untuk banner prestasi atau sorotan utama.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── 3. BADGES ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1 border-b border-[var(--border-color)] pb-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            3. Badge Component
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Varian warna dan task badges khusus (Type, Priority, Status).
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="blue">Blue</Badge>
            <Badge variant="cyan">Cyan</Badge>
            <Badge variant="green" dot>
              Green (Live)
            </Badge>
            <Badge variant="yellow">Yellow</Badge>
            <Badge variant="red" dot>
              Red (Urgent)
            </Badge>
            <Badge variant="purple">Purple</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400 light:text-blue-600 uppercase">
              // Composed Task Badges
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <TaskTypeBadge type="INDIVIDUAL" />
              <TaskTypeBadge type="GROUP" />
              <TaskTypeBadge type="ADDITIONAL" />
              <TaskPriorityBadge priority="LOW" />
              <TaskPriorityBadge priority="MEDIUM" />
              <TaskPriorityBadge priority="HIGH" />
              <TaskPriorityBadge priority="URGENT" />
              <TaskStatusBadge status="TODO" />
              <TaskStatusBadge status="IN_PROGRESS" />
              <TaskStatusBadge status="SUBMITTED" />
              <TaskStatusBadge status="COMPLETED" />
              <TaskStatusBadge status="OVERDUE" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FORM INPUTS & SWITCHES ─────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1 border-b border-[var(--border-color)] pb-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            4. Form Inputs & Controls
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Input, Textarea, Select, Checkbox, Switch, Tabs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)]">
          <div className="space-y-4">
            <Input placeholder="Input teks biasa..." />
            <Input
              placeholder="Dengan ikon kiri & loading..."
              leftIcon={<Search className="w-4 h-4" />}
              isLoading
            />
            <Input
              placeholder="Dengan error validasi..."
              error="Format input tidak valid"
            />
            <Select>
              <option>Pilihan Opsi 1</option>
              <option>Pilihan Opsi 2</option>
              <option>Pilihan Opsi 3</option>
            </Select>
          </div>

          <div className="space-y-4">
            <Textarea placeholder="Area teks responsif..." rows={3} />
            <div className="flex items-center gap-6 pt-2">
              <Checkbox
                label="Checkbox Aktif"
                checked={checkboxChecked}
                onCheckedChange={setCheckboxChecked}
              />
              <Switch
                label="Switch Mode"
                checked={switchChecked}
                onCheckedChange={setSwitchChecked}
              />
            </div>
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        </div>
      </section>

      {/* ── 5. INTERACTIVE OVERLAYS & TOASTS ───────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1 border-b border-[var(--border-color)] pb-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            5. Interactive Overlays & Notifications
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Dialog modal, Drawer sheet, Dropdown menu, Tooltip, Toast notifications.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] flex flex-wrap items-center gap-4">
          {/* Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Buka Dialog Modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Tindakan</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin melakukan operasi ini pada sistem?
                </DialogDescription>
              </DialogHeader>
              <p className="text-xs text-[var(--text-secondary)]">
                Modal dialog mendukung aksesibilitas keyboard (Escape), backdrop blur, dan animasi smooth.
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary" size="sm">
                    Batal
                  </Button>
                </DialogClose>
                <Button variant="primary" size="sm">
                  Lanjutkan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Buka Drawer Sheet</Button>
            </DrawerTrigger>
            <DrawerContent size="md">
              <DrawerHeader>
                <DrawerTitle>Panel Drawer Kanan</DrawerTitle>
                <DrawerDescription>
                  Drawer desktop kanan / sheet layar penuh di mobile.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody className="space-y-4">
                <p className="text-sm text-[var(--text-primary)]">
                  Ini adalah konten drawer yang dapat digulir secara mandiri.
                </p>
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-xs text-[var(--text-secondary)]">
                  Mendukung detail tugas, formulir samping, atau pratinjau dokumen.
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button variant="primary" size="sm">
                  Simpan Perubahan
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Dropdown */}
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="secondary">Dropdown Menu</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem onClick={() => info("Aksi 1 dipilih")}>
                Opsi Tindakan 1
              </DropdownItem>
              <DropdownItem onClick={() => info("Aksi 2 dipilih")}>
                Opsi Tindakan 2
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem danger onClick={() => error("Hapus dipilih")}>
                Hapus Data
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Tooltip */}
          <Tooltip content="Tooltip helper pintar!" position="top">
            <Button variant="ghost">Hover Saya (Tooltip)</Button>
          </Tooltip>

          {/* Toasts */}
          <Button
            variant="success"
            size="sm"
            onClick={() =>
              success("Berhasil Disimpan", "Data akademik berhasil diperbarui.")
            }
          >
            Toast Success
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              error("Terjadi Kesalahan", "Gagal memproses permintaan server.")
            }
          >
            Toast Error
          </Button>
        </div>
      </section>

      {/* ── 6. FEATURE COMPONENTS ─────────────────────────────── */}
      <section className="space-y-6">
        <div className="space-y-1 border-b border-[var(--border-color)] pb-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            6. Feature Components Showcase
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            TaskCard, ScheduleBlock, DailyNoteCard, StudentCard yang tersusun rapi menggunakan Shared UI tokens.
          </p>
        </div>

        {/* Task Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold text-cyan-400 light:text-blue-600 uppercase">
            // TaskCard Varian (Default, Kanban, List, Calendar)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TaskCard task={sampleTask as any} variant="default" />
            <TaskCard task={sampleTask as any} variant="kanban" />
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-2">
              <span className="text-xs font-mono text-[var(--text-muted)] block">
                Calendar Pill:
              </span>
              <TaskCard task={sampleTask as any} variant="calendar" />
            </div>
          </div>
          <TaskCard task={sampleTask as any} variant="list" />
        </div>

        {/* Schedule Blocks */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold text-cyan-400 light:text-blue-600 uppercase">
            // ScheduleBlock Varian
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScheduleBlock
              code="BBK1AAB4"
              name="Algoritma dan Pemrograman"
              time="07:30 - 11:30"
              room="RLC.KJ.05.001"
              sks={4}
              isCurrent
            />
            <ScheduleBlock
              code="BBK1AAC3"
              name="Sistem Basis Data"
              time="13:30 - 16:30"
              room="RLC.KJ.05.004"
              sks={3}
              isNext
            />
            <ScheduleBlock
              code="BBK1AAD2"
              name="Pengantar Sistem Informasi"
              time="16:30 - 18:30"
              room="RLC.KJ.04.002"
              sks={2}
              isCompleted
            />
          </div>
        </div>

        {/* Daily Note & Student */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold text-cyan-400 light:text-blue-600 uppercase">
              // DailyNoteCard
            </h3>
            <DailyNoteCard note={sampleDailyNote as any} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold text-cyan-400 light:text-blue-600 uppercase">
              // StudentCard
            </h3>
            <StudentCard student={sampleStudent as any} />
          </div>
        </div>
      </section>
    </div>
  );
}
