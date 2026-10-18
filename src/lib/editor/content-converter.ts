/**
 * Content format converter and sanitizer for ClassHub Article Editor.
 * Supports bidirectional handling for legacy Markdown and modern rich HTML.
 */

export interface TocHeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Checks if a content string is HTML or Markdown.
 */
export function isHtmlContent(content: string): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  return /<\/?(p|h[1-6]|ul|ol|li|blockquote|pre|code|table|tr|th|td|div|hr|img|a|figure|figcaption)\b/i.test(trimmed);
}

/**
 * Generates URL-friendly anchor ID for headings
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "heading";
}

/**
 * Converts Markdown string into clean HTML for Tiptap editor initialization.
 * Handles headings, bold, italic, underline, lists, blockquotes, code blocks, tables, hr, links, and images.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "<p></p>";
  if (isHtmlContent(markdown)) return markdown;

  const lines = markdown.split("\n");
  const htmlParts: string[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = "";

  let inList = false;
  let listType: "ul" | "ol" | null = null;

  let inTable = false;
  let tableRows: string[] = [];

  const closeListIfNeeded = () => {
    if (inList && listType) {
      htmlParts.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  };

  const closeTableIfNeeded = () => {
    if (inTable && tableRows.length > 0) {
      const headerLine = tableRows[0];
      const dataLines = tableRows.slice(2); // Skip separator row

      const parseRow = (line: string) =>
        line
          .split("|")
          .slice(1, -1)
          .map((c) => formatInlineToHtml(c.trim()));

      const headerCells = parseRow(headerLine);
      const thHtml = headerCells.map((c) => `<th>${c}</th>`).join("");

      const rowsHtml = dataLines
        .map((r) => {
          const cells = parseRow(r);
          return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
        })
        .join("");

      htmlParts.push(`<table><thead><tr>${thHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`);
      inTable = false;
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Code blocks (```lang ... ```)
    if (trimmed.startsWith("```")) {
      closeListIfNeeded();
      closeTableIfNeeded();

      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
        codeBuffer = [];
        continue;
      } else {
        inCodeBlock = false;
        const escaped = escapeHtml(codeBuffer.join("\n"));
        const langAttr = codeLanguage ? ` class="language-${codeLanguage}"` : "";
        htmlParts.push(`<pre><code${langAttr}>${escaped}</code></pre>`);
        codeBuffer = [];
        codeLanguage = "";
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // 2. Empty lines
    if (!trimmed) {
      closeListIfNeeded();
      closeTableIfNeeded();
      continue;
    }

    // 3. Table lines (| col | col |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      closeListIfNeeded();
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else {
      closeTableIfNeeded();
    }

    // 4. Horizontal Rules
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      closeListIfNeeded();
      htmlParts.push("<hr />");
      continue;
    }

    // 5. Headings (# H1, ## H2, ### H3, #### H4)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeListIfNeeded();
      const level = headingMatch[1].length;
      const text = formatInlineToHtml(headingMatch[2]);
      htmlParts.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // 6. Blockquote (> quote)
    if (trimmed.startsWith(">")) {
      closeListIfNeeded();
      const quoteContent = formatInlineToHtml(trimmed.replace(/^>\s*/, ""));
      htmlParts.push(`<blockquote><p>${quoteContent}</p></blockquote>`);
      continue;
    }

    // 7. Unordered lists (- item, * item)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemContent = formatInlineToHtml(trimmed.replace(/^[-*]\s+/, ""));
      if (!inList || listType !== "ul") {
        closeListIfNeeded();
        inList = true;
        listType = "ul";
        htmlParts.push("<ul>");
      }
      htmlParts.push(`<li><p>${itemContent}</p></li>`);
      continue;
    }

    // 8. Ordered lists (1. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemContent = formatInlineToHtml(trimmed.replace(/^\d+\.\s+/, ""));
      if (!inList || listType !== "ol") {
        closeListIfNeeded();
        inList = true;
        listType = "ol";
        htmlParts.push("<ol>");
      }
      htmlParts.push(`<li><p>${itemContent}</p></li>`);
      continue;
    }

    closeListIfNeeded();

    // 9. Standard paragraph
    htmlParts.push(`<p>${formatInlineToHtml(trimmed)}</p>`);
  }

  // Ensure any dangling state is closed
  if (inCodeBlock && codeBuffer.length > 0) {
    const escaped = escapeHtml(codeBuffer.join("\n"));
    htmlParts.push(`<pre><code>${escaped}</code></pre>`);
  }
  closeListIfNeeded();
  closeTableIfNeeded();

  return htmlParts.join("");
}

/**
 * Formats inline Markdown (bold, italic, code, links, images) into HTML
 */
function formatInlineToHtml(text: string): string {
  let result = escapeHtml(text);

  // Images: ![alt](url)
  result = result.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

  // Links: [label](url)
  result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_
  result = result.replace(/\*(.*?)\*/g, "<em>$1</em>");
  result = result.replace(/_(.*?)_/g, "<em>$1</em>");

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.*?)~~/g, "<s>$1</s>");

  // Inline code: `text`
  result = result.replace(/`(.*?)`/g, "<code>$1</code>");

  return result;
}

/**
 * Basic HTML special character escape
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Extracts Headings from both HTML content and Markdown content for Table of Contents
 */
export function extractHeadings(content: string): TocHeadingItem[] {
  if (!content) return [];

  const headings: TocHeadingItem[] = [];

  if (isHtmlContent(content)) {
    // Regex match for <h1-3 ...>text</h1-3>
    const headingRegex = /<h([1-3])([^>]*)>(.*?)<\/h\1>/gi;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1], 10);
      const attrs = match[2] || "";
      const rawText = match[3].replace(/<[^>]+>/g, "").trim();
      if (!rawText) continue;

      const idMatch = attrs.match(/\bid=["']([^"']*)["']/i);
      const existingId = idMatch ? idMatch[1] : undefined;
      const id = existingId || generateHeadingId(rawText);
      headings.push({ id, text: rawText, level });
    }
  } else {
    // Markdown parser
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[*_`]/g, "").trim();
        const id = generateHeadingId(text);
        headings.push({ id, text, level });
      }
    }
  }

  return headings;
}
