import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono-code text-sm shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-slate-300">{language || 'Code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split into tokens / blocks
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block ```
    if (line.trim().startsWith('```')) {
      const language = line.trim().replace(/^```/, '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock
          key={`code-${i}`}
          language={language}
          code={codeLines.join('\n')}
        />
      );
      i++;
      continue;
    }

    // Horizontal Rule ---
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-8 border-slate-200" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-10 mb-4 tracking-tight">
          {formatInline(line.replace(/^#\s+/, ''))}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl sm:text-3xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">
          {formatInline(line.replace(/^##\s+/, ''))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl sm:text-2xl font-bold text-slate-800 mt-6 mb-3">
          {formatInline(line.replace(/^###\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote >
    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote key={`quote-${i}`} className="my-6 pl-4 border-l-4 border-brand-500 italic text-slate-700 bg-slate-50 py-2 rounded-r-lg">
          {formatInline(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Unordered List (- or *)
    if (/^[-*]\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 list-disc list-inside text-slate-700 text-lg leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered List (1. 2. etc.)
    if (/^\d+\.\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 list-decimal list-inside text-slate-700 text-lg leading-relaxed font-medium">
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1 font-normal text-slate-700">
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty Line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular Paragraph
    elements.push(
      <p key={`p-${i}`} className="my-4 text-slate-700 text-lg leading-relaxed font-serif-reading">
        {formatInline(line)}
      </p>
    );
    i++;
  }

  return <div className="markdown-content">{elements}</div>;
}

// Inline formatting helper (Bold, Italic, Code, Links)
function formatInline(text) {
  if (!text) return text;

  // Split by inline code `...`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 text-brand-700 font-mono-code text-sm font-semibold border border-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return <strong key={`${index}-${bIdx}`} className="font-bold text-slate-900">{bPart.slice(2, -2)}</strong>;
      }

      // Italic *text*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, iIdx) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
          return <em key={`${index}-${bIdx}-${iIdx}`}>{iPart.slice(1, -1)}</em>;
        }

        // Links [label](url)
        const linkMatch = iPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const pre = iPart.slice(0, linkMatch.index);
          const post = iPart.slice(linkMatch.index + linkMatch[0].length);
          return (
            <span key={`${index}-${bIdx}-${iIdx}`}>
              {pre}
              <a
                href={linkMatch[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-800 underline underline-offset-2 font-medium"
              >
                {linkMatch[1]}
              </a>
              {post}
            </span>
          );
        }

        return iPart;
      });
    });
  });
}
