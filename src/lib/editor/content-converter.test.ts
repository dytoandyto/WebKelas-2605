import { describe, it, expect } from "vitest";
import {
  isHtmlContent,
  markdownToHtml,
  extractHeadings,
  generateHeadingId,
  sanitizeArticleHtml,
} from "./content-converter";

describe("Content Converter Tests", () => {
  it("detects HTML vs Markdown accurately", () => {
    expect(isHtmlContent("<p>Hello world</p>")).toBe(true);
    expect(isHtmlContent("<h2>Heading</h2>")).toBe(true);
    expect(isHtmlContent("## Markdown Heading")).toBe(false);
    expect(isHtmlContent("Just plain text with no tags")).toBe(false);
  });

  it("converts headings, bold, italic, code block, and lists to HTML", () => {
    const md = `## Section Title\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2\n\n\`\`\`csharp\nConsole.WriteLine("Hi");\n\`\`\``;
    const html = markdownToHtml(md);

    expect(html).toContain("<h2>Section Title</h2>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>");
    expect(html).toContain('<pre><code class="language-csharp">Console.WriteLine(&quot;Hi&quot;);</code></pre>');
  });

  it("extracts headings from both Markdown and HTML", () => {
    const md = "## Introduction\n\nSome text\n\n### Core Concepts\n\nMore text";
    const mdHeadings = extractHeadings(md);
    expect(mdHeadings).toEqual([
      { id: "introduction", text: "Introduction", level: 2 },
      { id: "core-concepts", text: "Core Concepts", level: 3 },
    ]);

    const html = "<h2>Welcome to ClassHub</h2><p>Intro</p><h3 id=\"custom-id\">Deep Dive</h3>";
    const htmlHeadings = extractHeadings(html);
    expect(htmlHeadings).toEqual([
      { id: "welcome-to-classhub", text: "Welcome to ClassHub", level: 2 },
      { id: "custom-id", text: "Deep Dive", level: 3 },
    ]);
  });

  it("generates clean URL-friendly anchor IDs", () => {
    expect(generateHeadingId("1. Pengantar Sistem Enterprise")).toBe("1-pengantar-sistem-enterprise");
    expect(generateHeadingId("C# & .NET: Panduan Lengkap!")).toBe("c-net-panduan-lengkap");
  });

  it("detects and preserves articleImage figure and figcaption blocks", () => {
    const figureHtml = '<figure class="article-image align-center size-medium"><img src="https://example.com/diagram.png" alt="Diagram" /><figcaption class="article-caption">Gambar 1. Diagram Alur</figcaption></figure>';
    expect(isHtmlContent(figureHtml)).toBe(true);
    // When markdownToHtml receives rich HTML, it returns it untouched
    expect(markdownToHtml(figureHtml)).toBe(figureHtml);
  });

  it("converts markdown image syntax to img tag within paragraph", () => {
    const mdWithImg = "Berikut adalah diagram arsitektur:\n\n![Arsitektur Sistem](https://example.com/arch.png)\n\nPenjelasan lebih lanjut.";
    const html = markdownToHtml(mdWithImg);
    expect(html).toContain('<img src="https://example.com/arch.png" alt="Arsitektur Sistem" />');
    expect(html).toContain("<p>Berikut adalah diagram arsitektur:</p>");
    expect(html).toContain("<p>Penjelasan lebih lanjut.</p>");
  });

  describe("sanitizeArticleHtml XSS Prevention", () => {
    it("strips malicious script tags completely", () => {
      const dirty = "<p>Materi Kuliah</p><script>alert('xss')</script>";
      const clean = sanitizeArticleHtml(dirty);
      expect(clean).toBe("<p>Materi Kuliah</p>");
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert");
    });

    it("strips inline event handler attributes like onerror, onload, onclick", () => {
      const dirty = '<img src="invalid" onerror="alert(document.cookie)" alt="Test" />';
      const clean = sanitizeArticleHtml(dirty);
      expect(clean).toBe('<img src="invalid" alt="Test">');
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("alert");
    });

    it("strips javascript: pseudoprotocol URLs in anchor tags", () => {
      const dirty = '<a href="javascript:alert(1)">Klik Di Sini</a>';
      const clean = sanitizeArticleHtml(dirty);
      expect(clean).not.toContain("javascript:");
      expect(clean).toContain("Klik Di Sini");
    });

    it("preserves legitimate rich text elements and formatting", () => {
      const richHtml = '<h2>Judul</h2><p>Paragraf <strong>tebal</strong> dan <em>miring</em>.</p><table><thead><tr><th>Kolom</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>';
      const clean = sanitizeArticleHtml(richHtml);
      expect(clean).toBe(richHtml);
    });
  });
});
