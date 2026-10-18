"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import * as React from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  Settings2,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArticleImageAttributes {
  src: string;
  alt?: string;
  caption?: string;
  align?: "left" | "center" | "right";
  size?: "small" | "medium" | "full";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    articleImage: {
      setArticleImage: (options: ArticleImageAttributes) => ReturnType;
    };
  }
}

/**
 * Interactive React NodeView for Image Block (WordPress Gutenberg / Word style)
 */
export function ArticleImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const { src, alt, caption, align = "center", size = "full" } = node.attrs as ArticleImageAttributes;
  const [isEditingModalOpen, setIsEditingModalOpen] = React.useState(false);
  const [tempAlt, setTempAlt] = React.useState(alt || "");
  const [tempCaption, setTempCaption] = React.useState(caption || "");
  const [tempSrc, setTempSrc] = React.useState(src || "");
  const [imageError, setImageError] = React.useState(false);

  const alignClasses = {
    left: "mr-auto text-left",
    center: "mx-auto text-center",
    right: "ml-auto text-right",
  }[align] || "mx-auto text-center";

  const sizeClasses = {
    small: "max-w-xs sm:max-w-sm w-full",
    medium: "max-w-lg sm:max-w-xl w-full",
    full: "w-full max-w-full",
  }[size] || "w-full max-w-full";

  const handleSaveModal = () => {
    updateAttributes({
      alt: tempAlt.trim(),
      caption: tempCaption.trim(),
      src: tempSrc.trim() || src,
    });
    setIsEditingModalOpen(false);
  };

  return (
    <NodeViewWrapper
      className={cn(
        "relative my-6 group transition-all select-none block",
        alignClasses,
        sizeClasses
      )}
      data-drag-handle
    >
      <figure
        className={cn(
          "relative inline-block w-full rounded-2xl transition-all duration-200",
          selected
            ? "ring-3 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md"
            : "hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-700"
        )}
      >
        {/* Floating Gutenberg-style Controls (Visible on Selection or Hover) */}
        <div
          className={cn(
            "absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 rounded-xl bg-slate-900/95 text-white shadow-xl backdrop-blur-md border border-slate-700/80 transition-all duration-150 pointer-events-auto",
            selected
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
          )}
        >
          {/* Alignment Controls */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-slate-700/80">
            <button
              type="button"
              onClick={() => updateAttributes({ align: "left" })}
              className={cn(
                "p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white",
                align === "left" && "bg-blue-600 text-white font-bold"
              )}
              title="Rata Kiri"
              aria-label="Rata Kiri"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ align: "center" })}
              className={cn(
                "p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white",
                align === "center" && "bg-blue-600 text-white font-bold"
              )}
              title="Rata Tengah"
              aria-label="Rata Tengah"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ align: "right" })}
              className={cn(
                "p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white",
                align === "right" && "bg-blue-600 text-white font-bold"
              )}
              title="Rata Kanan"
              aria-label="Rata Kanan"
            >
              <AlignRight size={14} />
            </button>
          </div>

          {/* Size Controls */}
          <div className="flex items-center gap-1 px-1.5 text-[11px] font-mono border-r border-slate-700/80">
            <button
              type="button"
              onClick={() => updateAttributes({ size: "small" })}
              className={cn(
                "px-2 py-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white",
                size === "small" && "bg-blue-600 text-white font-bold"
              )}
              title="Ukuran Kecil (33%)"
            >
              Kecil
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ size: "medium" })}
              className={cn(
                "px-2 py-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white",
                size === "medium" && "bg-blue-600 text-white font-bold"
              )}
              title="Ukuran Sedang (66%)"
            >
              Sedang
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ size: "full" })}
              className={cn(
                "px-2 py-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white",
                size === "full" && "bg-blue-600 text-white font-bold"
              )}
              title="Ukuran Penuh (100%)"
            >
              Penuh
            </button>
          </div>

          {/* Edit Alt Text & Source URL Button */}
          <button
            type="button"
            onClick={() => {
              setTempAlt(alt || "");
              setTempCaption(caption || "");
              setTempSrc(src || "");
              setIsEditingModalOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white"
            title="Edit Alt Text & URL Gambar"
            aria-label="Edit Gambar"
          >
            <Settings2 size={14} />
          </button>

          {/* Delete Image Button */}
          <button
            type="button"
            onClick={deleteNode}
            className="p-1.5 rounded-lg hover:bg-red-900/60 hover:text-red-300 transition-colors cursor-pointer text-slate-400"
            title="Hapus Gambar"
            aria-label="Hapus Gambar"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* The Image Itself */}
        <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
          {imageError ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <AlertCircle size={28} className="mx-auto text-amber-500" />
              <p className="text-xs font-semibold">Gagal memuat gambar</p>
              <p className="text-[11px] font-mono break-all text-slate-400">{src}</p>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || "Gambar artikel"}
              onError={() => setImageError(true)}
              className="w-full h-auto block rounded-xl transition-all"
            />
          )}
        </div>

        {/* Inline Editable Caption Field (WordPress Gutenberg Style) */}
        <div className="mt-2 text-center">
          <input
            type="text"
            value={caption || ""}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            placeholder="Tambahkan keterangan gambar (caption opsional)..."
            className="w-full text-center text-xs text-slate-600 dark:text-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-600 bg-transparent border-0 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 outline-none py-1 italic transition-colors font-sans"
            aria-label="Keterangan gambar"
          />
        </div>
      </figure>

      {/* Modal Dialog to Edit Image Alt Text & Settings */}
      {isEditingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in-0 duration-150"
          onClick={() => setIsEditingModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Settings2 size={16} className="text-blue-600 dark:text-cyan-400" />
                <span>Pengaturan Gambar</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Gambar
                </label>
                <input
                  type="text"
                  value={tempSrc}
                  onChange={(e) => setTempSrc(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teks Alternatif (Alt Text)
                </label>
                <input
                  type="text"
                  value={tempAlt}
                  onChange={(e) => setTempAlt(e.target.value)}
                  placeholder="Jelaskan isi gambar untuk pembaca tunanetra & screen reader..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Membantu aksesibilitas (SEO &amp; pembaca layar).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan Gambar (Caption)
                </label>
                <input
                  type="text"
                  value={tempCaption}
                  onChange={(e) => setTempCaption(e.target.value)}
                  placeholder="Keterangan gambar opsional di bawah foto..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

/**
 * Tiptap Node Extension for Article Images
 */
export const ArticleImageExtension = Node.create({
  name: "articleImage",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: "",
      },
      caption: {
        default: "",
      },
      align: {
        default: "center",
      },
      size: {
        default: "full",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.article-image",
        getAttrs: (el) => {
          const figure = el as HTMLElement;
          const img = figure.querySelector("img");
          const figcaption = figure.querySelector("figcaption");

          let align: "left" | "center" | "right" = "center";
          if (figure.classList.contains("align-left")) align = "left";
          if (figure.classList.contains("align-right")) align = "right";

          let size: "small" | "medium" | "full" = "full";
          if (figure.classList.contains("size-small")) size = "small";
          if (figure.classList.contains("size-medium")) size = "medium";

          return {
            src: img?.getAttribute("src") || null,
            alt: img?.getAttribute("alt") || "",
            caption: figcaption?.innerText || "",
            align,
            size,
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (el) => {
          const img = el as HTMLElement;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") || "",
            caption: img.getAttribute("title") || img.getAttribute("data-caption") || "",
            align: (img.getAttribute("data-align") as any) || "center",
            size: (img.getAttribute("data-size") as any) || "full",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, align = "center", size = "full" } = HTMLAttributes;
    const figureClasses = [
      "article-image",
      `align-${align || "center"}`,
      `size-${size || "full"}`,
    ].join(" ");

    const children: any[] = [
      ["img", { src, alt: alt || "", class: "rounded-xl border border-slate-200 dark:border-slate-800" }],
    ];

    if (caption && caption.trim()) {
      children.push(["figcaption", { class: "article-caption" }, caption.trim()]);
    }

    return ["figure", mergeAttributes({ class: figureClasses }), ...children];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ArticleImageNodeView);
  },

  addCommands() {
    return {
      setArticleImage:
        (options: ArticleImageAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
