"use client";

import * as React from "react";
import { Check, Copy, Info, AlertTriangle, Lightbulb, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { isHtmlContent, extractHeadings, generateHeadingId } from "@/lib/editor/content-converter";
import Prism from "prismjs";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface ArticleContentRendererProps {
  content: string;
  className?: string;
  onHeadingsExtracted?: (headings: TocItem[]) => void;
}

/**
 * Extracts H1, H2, and H3 headings for the Table of Contents from both HTML and Markdown
 */
export function extractHeadingsFromMarkdown(content: string): TocItem[] {
  return extractHeadings(content);
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawLang = (language || "csharp").toLowerCase().replace(/^language-/, "");
  const langKey =
    rawLang === "cs"
      ? "csharp"
      : rawLang === "js"
      ? "javascript"
      : rawLang === "ts"
      ? "typescript"
      : rawLang === "py"
      ? "python"
      : rawLang;
  const grammar = Prism.languages[langKey] || Prism.languages.csharp || Prism.languages.javascript;

  const highlightedCode = React.useMemo(() => {
    try {
      return Prism.highlight(code, grammar, langKey);
    } catch {
      return code;
    }
  }, [code, grammar, langKey]);

  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-slate-700/60 bg-[#070d19] dark:bg-[#050b14] shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/80 inline-block" />
          <span className="uppercase text-cyan-400 font-semibold">{langKey === "csharp" ? "C#" : langKey}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-xs"
          title="Salin kode"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans font-semibold">Tersalin ✓</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="font-sans">Salin</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-200 leading-relaxed no-scrollbar">
        <code className={`language-${langKey}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  );
}

export function ArticleContentRenderer({
  content,
  className,
  onHeadingsExtracted,
}: ArticleContentRendererProps) {
  React.useEffect(() => {
    if (onHeadingsExtracted) {
      onHeadingsExtracted(extractHeadingsFromMarkdown(content));
    }
  }, [content, onHeadingsExtracted]);

  // Parse markdown into blocks
  const renderBlocks = () => {
    const rawBlocks = content.split(/\n\s*\n/);
    const elements: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let currentLang = "";

    const lines = content.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block start or end
      if (line.trim().startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          currentLang = line.trim().slice(3).trim();
          codeBuffer = [];
          i++;
          continue;
        } else {
          inCodeBlock = false;
          elements.push(
            <CodeBlock
              key={`code-${elements.length}`}
              code={codeBuffer.join("\n")}
              language={currentLang}
            />
          );
          i++;
          continue;
        }
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        i++;
        continue;
      }

      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        i++;
        continue;
      }

      // H1 Header
      if (trimmed.startsWith("# ")) {
        const text = trimmed.replace(/^#\s+/, "");
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h1 key={`h1-${i}`} id={id} className="text-3xl font-extrabold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white font-display">
            {text}
          </h1>
        );
        i++;
        continue;
      }

      // H2 Header
      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace(/^##\s+/, "");
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h2
            key={`h2-${i}`}
            id={id}
            className="text-2xl font-bold tracking-tight mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white scroll-mt-24 font-display flex items-center gap-2 group"
          >
            <span className="text-cyan-500 font-mono text-xl opacity-80">#</span>
            {text}
          </h2>
        );
        i++;
        continue;
      }

      // H3 Header
      if (trimmed.startsWith("### ")) {
        const text = trimmed.replace(/^###\s+/, "");
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h3
            key={`h3-${i}`}
            id={id}
            className="text-lg sm:text-xl font-bold mt-7 mb-3 text-slate-900 dark:text-slate-100 scroll-mt-24 font-display"
          >
            {text}
          </h3>
        );
        i++;
        continue;
      }

      // Horizontal Rule
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        elements.push(
          <hr key={`hr-${i}`} className="my-8 border-slate-200 dark:border-slate-800/80" />
        );
        i++;
        continue;
      }

      // Blockquote / Callout box
      if (trimmed.startsWith("> ")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("> ")) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
          i++;
        }
        const quoteText = quoteLines.join("\n");
        const isWarning = quoteText.toLowerCase().includes("peringatan:") || quoteText.toLowerCase().includes("warning:");
        const isTip = quoteText.toLowerCase().includes("tips:") || quoteText.toLowerCase().includes("catatan:");

        elements.push(
          <div
            key={`quote-${i}`}
            className={cn(
              "p-4 my-5 rounded-xl border leading-relaxed text-sm sm:text-base",
              isWarning
                ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                : isTip
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-950 dark:text-cyan-200"
                : "bg-slate-100/80 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700/80 text-slate-800 dark:text-slate-300"
            )}
          >
            <div className="flex items-start gap-2.5">
              {isWarning ? (
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              ) : isTip ? (
                <Lightbulb size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              ) : (
                <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="whitespace-pre-line font-medium leading-relaxed">
                {quoteText}
              </div>
            </div>
          </div>
        );
        continue;
      }

      // Markdown Table
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0].split("|").slice(1, -1).map((s) => s.trim());
          const dataRows = tableLines
            .slice(2)
            .map((r) => r.split("|").slice(1, -1).map((s) => s.trim()));

          elements.push(
            <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold">
                  <tr>
                    {headerRow.map((cell, idx) => (
                      <th key={idx} className="px-4 py-3 font-semibold">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#070d19]/40">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Unordered List
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const listItems: string[] = [];
        while (
          i < lines.length &&
          (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
        ) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-4 space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300 pl-2 leading-relaxed max-w-prose xl:max-w-4xl">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered List
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-4 space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300 pl-2 leading-relaxed max-w-prose xl:max-w-4xl">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Standard Paragraph
      elements.push(
        <p key={`p-${i}`} className="my-4 text-base leading-relaxed text-slate-700 dark:text-slate-300 max-w-prose xl:max-w-4xl">
          {formatInline(trimmed)}
        </p>
      );
      i++;
    }

    return elements;
  };

  // Helper for bold, italic, inline code, and links
  const formatInline = (text: string): React.ReactNode => {
    // Regex tokenizer for bold (**text**), code (`text`), link ([text](url))
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline link: [label](url)
      const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [full, label, url] = linkMatch;
        const isExternal = url.startsWith("http");
        parts.push(
          <a
            key={keyIdx++}
            href={url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-cyan-600 dark:text-cyan-400 underline hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-0.5 font-medium"
          >
            {label}
            {isExternal && <ExternalLink size={12} className="inline ml-0.5 opacity-70" />}
          </a>
        );
        remaining = remaining.slice(full.length);
        continue;
      }

      // Bold: **text**
      const boldMatch = remaining.match(/^\*\*(.*?)\*\*/);
      if (boldMatch) {
        const [full, boldText] = boldMatch;
        parts.push(
          <strong key={keyIdx++} className="font-bold text-slate-900 dark:text-white">
            {boldText}
          </strong>
        );
        remaining = remaining.slice(full.length);
        continue;
      }

      // Inline code: `text`
      const codeMatch = remaining.match(/^`(.*?)`/);
      if (codeMatch) {
        const [full, codeText] = codeMatch;
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono bg-slate-100 dark:bg-slate-800/90 text-cyan-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700/60"
          >
            {codeText}
          </code>
        );
        remaining = remaining.slice(full.length);
        continue;
      }

      // Italic: *text*
      const italicMatch = remaining.match(/^\*(.*?)\*/);
      if (italicMatch) {
        const [full, italicText] = italicMatch;
        parts.push(
          <em key={keyIdx++} className="italic">
            {italicText}
          </em>
        );
        remaining = remaining.slice(full.length);
        continue;
      }

      // Plain text up to next special char
      const nextSpecial = remaining.search(/(\[|\*\*|`|\*)/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Just push character if not matched by any pattern above
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Enhance code blocks with syntax highlighting and copy buttons when HTML content is rendered
  React.useEffect(() => {
    if (!containerRef.current || !isHtmlContent(content)) return;
    const pres = containerRef.current.querySelectorAll("pre");
    pres.forEach((pre) => {
      let codeEl = pre.querySelector("code");
      if (!codeEl) {
        const newCode = document.createElement("code");
        newCode.innerHTML = pre.innerHTML;
        pre.innerHTML = "";
        pre.appendChild(newCode);
        codeEl = newCode;
      }

      // Check language from class list
      let lang = "csharp";
      const classes = Array.from(codeEl.classList).concat(Array.from(pre.classList));
      const langClass = classes.find((c) => c.startsWith("language-"));
      if (langClass) {
        const raw = langClass.replace("language-", "").toLowerCase();
        lang = raw === "cs" ? "csharp" : raw === "js" ? "javascript" : raw === "ts" ? "typescript" : raw;
      } else {
        const text = codeEl.innerText;
        if (/using System|namespace |Console\.Write|public class|int |void Main|string\[\]/.test(text)) {
          lang = "csharp";
        } else if (/const |let |function |import |export |=>/.test(text)) {
          lang = "typescript";
        } else if (/def |import |class |print\(/.test(text)) {
          lang = "python";
        }
        codeEl.classList.add(`language-${lang}`);
      }

      // Highlight syntax with Prism
      if (!codeEl.classList.contains("prism-highlighted")) {
        try {
          Prism.highlightElement(codeEl);
          codeEl.classList.add("prism-highlighted");
        } catch {
          // fallback
        }
      }

      // Add top code header bar with language badge and copy button
      if (!pre.querySelector(".code-header-bar")) {
        pre.classList.add("relative", "group", "overflow-hidden", "has-code-header");
        const header = document.createElement("div");
        header.className =
          "code-header-bar flex items-center justify-between px-4 py-2 bg-slate-900/95 border-b border-slate-800 text-xs font-mono text-slate-400 select-none";

        const badge = document.createElement("div");
        badge.className = "flex items-center gap-2 font-bold uppercase text-cyan-400 text-xs";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span><span>${lang === "csharp" ? "C#" : lang}</span>`;
        header.appendChild(badge);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "code-copy-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 shadow-sm";
        btn.innerHTML = `<span>Salin</span>`;
        btn.onclick = () => {
          const rawText = codeEl?.innerText || pre.innerText;
          navigator.clipboard.writeText(rawText);
          btn.innerHTML = `<span class="text-emerald-400 font-semibold">Tersalin ✓</span>`;
          setTimeout(() => {
            btn.innerHTML = `<span>Salin</span>`;
          }, 2000);
        };
        header.appendChild(btn);

        pre.insertBefore(header, pre.firstChild);
      }
    });
  }, [content]);

  if (isHtmlContent(content)) {
    // Inject heading anchor IDs if not present
    const processed = content.replace(/<h([1-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
      if (/id=/i.test(attrs)) return match;
      const cleanText = text.replace(/<[^>]+>/g, "").trim();
      const id = generateHeadingId(cleanText);
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    });

    return (
      <article
        ref={containerRef}
        className={cn(
          "article-rich-content prose-custom max-w-none text-slate-800 dark:text-slate-200",
          className
        )}
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    );
  }

  return (
    <article className={cn("prose-custom max-w-none text-slate-800 dark:text-slate-200", className)}>
      {renderBlocks()}
    </article>
  );
}

