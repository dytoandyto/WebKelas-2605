"use server";

import { revalidatePath } from "next/cache";
import { articleSchema, ArticleInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import { calculateReadingTime, generateSlug } from "@/lib/utils";
import { isHtmlContent, sanitizeArticleHtml } from "@/lib/editor/content-converter";
import prisma from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function createArticleAction(input: ArticleInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("ARTICLES_MANAGE");
    const validation = articleSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;

    // Check slug uniqueness
    const slugBase = data.slug?.trim() ? generateSlug(data.slug) : generateSlug(data.title);
    let finalSlug = slugBase;
    let counter = 1;

    while (await prisma.learningArticle.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slugBase}-${counter}`;
      counter++;
    }

    const cleanContent = isHtmlContent(data.content) ? sanitizeArticleHtml(data.content) : data.content;
    const readingTime = calculateReadingTime(cleanContent);
    const publishedAt = data.status === ArticleStatus.PUBLISHED ? new Date() : null;

    const article = await prisma.learningArticle.create({
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt || null,
        content: cleanContent,
        coverImage: data.coverImage || null,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
        readingTime,
        tags: data.tags || null,
        subjectId: data.subjectId || null,
        authorId: user.id,
        publishedAt,
        resources: {
          create: (data.resourceIds || []).map((resId) => ({
            resource: { connect: { id: resId } },
          })),
        },
      },
      include: {
        subject: { select: { id: true, code: true, name: true } },
        author: { select: { id: true, name: true, role: true } },
      },
    });

    // If related note IDs were passed, connect them
    if (data.noteIds && data.noteIds.length > 0) {
      await prisma.dailyNote.updateMany({
        where: { id: { in: data.noteIds } },
        data: { articleId: article.id },
      });
    }

    await logActivity("CREATE_ARTICLE", "ARTICLE", article.id, `Created educational article: ${article.title}`);

    revalidatePath("/learning");
    revalidatePath("/learning/articles");
    revalidatePath(`/learning/articles/${article.slug}`);
    revalidatePath("/admin/articles");
    revalidatePath("/");

    return { success: true, data: article };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat artikel pembelajaran." };
  }
}

export async function updateArticleAction(id: string, input: ArticleInput): Promise<ActionResult> {
  try {
    await assertPermission("ARTICLES_MANAGE");
    const validation = articleSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const existing = await prisma.learningArticle.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Artikel tidak ditemukan." };
    }

    // Verify slug uniqueness if slug was changed
    let finalSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      const slugCandidate = generateSlug(data.slug);
      const conflict = await prisma.learningArticle.findFirst({
        where: { slug: slugCandidate, NOT: { id } },
      });
      if (conflict) {
        return { success: false, error: `Slug "${slugCandidate}" sudah digunakan oleh artikel lain.` };
      }
      finalSlug = slugCandidate;
    }

    const cleanContent = isHtmlContent(data.content) ? sanitizeArticleHtml(data.content) : data.content;
    const readingTime = calculateReadingTime(cleanContent);
    let publishedAt = existing.publishedAt;
    if (data.status === ArticleStatus.PUBLISHED && !publishedAt) {
      publishedAt = new Date();
    }

    // Clear existing resource relations first
    await prisma.articleResource.deleteMany({ where: { articleId: id } });

    const article = await prisma.learningArticle.update({
      where: { id },
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt || null,
        content: cleanContent,
        coverImage: data.coverImage || null,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
        readingTime,
        tags: data.tags || null,
        subjectId: data.subjectId || null,
        publishedAt,
        resources: {
          create: (data.resourceIds || []).map((resId) => ({
            resource: { connect: { id: resId } },
          })),
        },
      },
      include: {
        subject: { select: { id: true, code: true, name: true } },
        author: { select: { id: true, name: true, role: true } },
      },
    });

    // Update note linkages
    if (data.noteIds) {
      // Disconnect notes that were unlinked
      await prisma.dailyNote.updateMany({
        where: { articleId: id, id: { notIn: data.noteIds } },
        data: { articleId: null },
      });
      // Connect newly linked notes
      if (data.noteIds.length > 0) {
        await prisma.dailyNote.updateMany({
          where: { id: { in: data.noteIds } },
          data: { articleId: id },
        });
      }
    }

    await logActivity("UPDATE_ARTICLE", "ARTICLE", article.id, `Updated educational article: ${article.title}`);

    revalidatePath("/learning");
    revalidatePath("/learning/articles");
    revalidatePath(`/learning/articles/${article.slug}`);
    if (existing.slug !== article.slug) {
      revalidatePath(`/learning/articles/${existing.slug}`);
    }
    revalidatePath("/admin/articles");
    revalidatePath("/");

    return { success: true, data: article };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui artikel pembelajaran." };
  }
}

export async function togglePublishArticleAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("ARTICLES_MANAGE");
    const existing = await prisma.learningArticle.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Artikel tidak ditemukan." };
    }

    const nextStatus =
      existing.status === ArticleStatus.PUBLISHED ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED;
    const publishedAt = nextStatus === ArticleStatus.PUBLISHED ? (existing.publishedAt || new Date()) : existing.publishedAt;

    const updated = await prisma.learningArticle.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt,
      },
    });

    await logActivity(
      "TOGGLE_PUBLISH_ARTICLE",
      "ARTICLE",
      id,
      `Changed article publication status to ${nextStatus}: ${updated.title}`
    );

    revalidatePath("/learning");
    revalidatePath("/learning/articles");
    revalidatePath(`/learning/articles/${updated.slug}`);
    revalidatePath("/admin/articles");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status publikasi artikel." };
  }
}

export async function archiveArticleAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("ARTICLES_MANAGE");
    const updated = await prisma.learningArticle.update({
      where: { id },
      data: { status: ArticleStatus.ARCHIVED },
    });

    await logActivity("ARCHIVE_ARTICLE", "ARTICLE", id, `Archived article: ${updated.title}`);

    revalidatePath("/learning");
    revalidatePath("/learning/articles");
    revalidatePath(`/learning/articles/${updated.slug}`);
    revalidatePath("/admin/articles");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengarsipkan artikel." };
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("ARTICLES_MANAGE");
    const article = await prisma.learningArticle.findUnique({ where: { id } });
    if (!article) {
      return { success: false, error: "Artikel tidak ditemukan." };
    }

    await prisma.dailyNote.updateMany({
      where: { articleId: id },
      data: { articleId: null },
    });

    await prisma.articleResource.deleteMany({
      where: { articleId: id },
    });

    await prisma.learningArticle.delete({ where: { id } });

    await logActivity("DELETE_ARTICLE", "ARTICLE", id, `Deleted educational article: ${article.title}`);

    revalidatePath("/learning");
    revalidatePath("/learning/articles");
    revalidatePath(`/learning/articles/${article.slug}`);
    revalidatePath("/admin/articles");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus artikel." };
  }
}

export async function uploadArticleImageAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertPermission("ARTICLES_MANAGE");
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { success: false, error: "Tidak ada berkas gambar yang dipilih." };
    }

    const { uploadImageFile } = await import("@/lib/storage");
    const result = await uploadImageFile(file, "articles");
    if (result.error || !result.url) {
      return { success: false, error: result.error || "Gagal mengunggah gambar." };
    }

    return { success: true, data: { url: result.url } };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah gambar." };
  }
}

