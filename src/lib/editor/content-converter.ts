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

const ALLOWED_ARTICLE_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "span", "div", "pre", "code", "blockquote", "hr", "br",
  "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "img", "figure", "figcaption"
]);

const ALLOWED_ARTICLE_ATTRS = new Set([
  "href", "src", "alt", "title", "class", "id", "target", "rel",
  "width", "height", "align", "style", "colspan", "rowspan"
]);

const DANGEROUS_BLOCKS_REGEX = /<(?:script|style|iframe|object|embed|applet|template|noscript|noembed|canvas|form|button|textarea|select)\b[^>]*>[\s\S]*?<\/(?:script|style|iframe|object|embed|applet|template|noscript|noembed|canvas|form|button|textarea|select)>|<(?:iframe|meta|link|base|form|input|embed|object|applet)\b[^>]*\/?>/gi;

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&colon;?/gi, ":")
    .replace(/&tab;?/gi, "")
    .replace(/&newline;?/gi, "");
}

/**
 * Strict, zero-dependency, isomorphic HTML sanitizer for rich text articles.
 * Compatible with Next.js Server Components, Server Actions, Node.js, and browser environments.
 * Protects against XSS attacks while preserving legitimate educational and mathematical content.
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  // 1. Remove dangerous blocks completely (including content)
  let sanitized = html.replace(DANGEROUS_BLOCKS_REGEX, "");

  // Repeat in case of nested constructs like <scr<script>ipt>
  while (DANGEROUS_BLOCKS_REGEX.test(sanitized)) {
    sanitized = sanitized.replace(DANGEROUS_BLOCKS_REGEX, "");
  }

  // 2. Remove HTML comments
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, "");

  // 3. Process tags and attributes safely
  sanitized = sanitized.replace(/<\/?([a-zA-Z0-9\-]+)([^>]*)>/gi, (fullTag, rawTagName, rawAttrs) => {
    const tagName = rawTagName.toLowerCase();

    // If tag is not allowed, strip the tag completely
    if (!ALLOWED_ARTICLE_TAGS.has(tagName)) {
      return "";
    }

    // Closing tag
    if (fullTag.startsWith("</")) {
      return `</${tagName}>`;
    }

    // Parse attributes for opening tag
    const attrRegex = /([a-zA-Z0-9\-:]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    const cleanAttrs: string[] = [];
    let match: RegExpExecArray | null;

    let hasTargetBlank = false;
    let existingRel = "";

    while ((match = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = match[1].toLowerCase();
      const rawValue = match[2] ?? match[3] ?? match[4] ?? "";

      // Reject all inline event handlers (onerror, onload, onclick, etc.)
      if (attrName.startsWith("on")) {
        continue;
      }

      // Only allow predefined safe attributes
      if (!ALLOWED_ARTICLE_ATTRS.has(attrName)) {
        continue;
      }

      // Check dangerous URLs in href/src
      if (attrName === "href" || attrName === "src") {
        let decoded = decodeHtmlEntities(rawValue);
        try {
          decoded = decodeURIComponent(decoded);
        } catch {}
        decoded = decoded.replace(/[\x00-\x20\s]/g, "").toLowerCase();

        if (
          decoded.startsWith("javascript:") ||
          decoded.startsWith("vbscript:") ||
          decoded.startsWith("data:text/html")
        ) {
          continue;
        }

        // For href, disallow data: URIs
        if (attrName === "href" && decoded.startsWith("data:")) {
          continue;
        }

        // For src, only allow safe image data URIs if data: is used
        if (attrName === "src" && decoded.startsWith("data:")) {
          if (!/^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml);base64,/i.test(rawValue.trim())) {
            continue;
          }
        }
      }

      // Check style attribute for CSS injection
      if (attrName === "style") {
        const lowerStyle = decodeHtmlEntities(rawValue).toLowerCase();
        if (
          lowerStyle.includes("expression(") ||
          lowerStyle.includes("javascript:") ||
          lowerStyle.includes("url(") ||
          lowerStyle.includes("behavior:") ||
          lowerStyle.includes("@import")
        ) {
          continue;
        }
      }

      if (attrName === "target" && rawValue.toLowerCase() === "_blank") {
        hasTargetBlank = true;
      }

      if (attrName === "rel") {
        existingRel = rawValue;
        continue;
      }

      cleanAttrs.push(`${attrName}="${rawValue.replace(/"/g, "&quot;")}"`);
    }

    if (hasTargetBlank) {
      const relParts = new Set(existingRel ? existingRel.split(/\s+/) : []);
      relParts.add("noopener");
      relParts.add("noreferrer");
      cleanAttrs.push(`rel="${Array.from(relParts).join(" ")}"`);
    } else if (existingRel) {
      cleanAttrs.push(`rel="${existingRel.replace(/"/g, "&quot;")}"`);
    }

    const attrsString = cleanAttrs.length > 0 ? " " + cleanAttrs.join(" ") : "";
    return `<${tagName}${attrsString}>`;
  });

  return sanitized;
}
