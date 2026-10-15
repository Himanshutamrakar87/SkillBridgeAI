import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse code blocks vs regular text blocks
  const parts: Array<{ type: 'code' | 'text'; code?: string; language?: string; text?: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.slice(lastIndex),
    });
  }

  const renderInlineFormatted = (text: string) => {
    // Split by inline code `...`
    const codeSegments = text.split(/(`[^`]+`)/g);

    return codeSegments.map((seg, idx) => {
      if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 text-xs font-mono rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }

      // Handle bold **text** and *italic*
      const boldSegments = seg.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={idx}>
          {boldSegments.map((bSeg, bIdx) => {
            if (bSeg.startsWith('**') && bSeg.endsWith('**') && bSeg.length > 4) {
              return (
                <strong key={bIdx} className="font-semibold text-slate-900">
                  {bSeg.slice(2, -2)}
                </strong>
              );
            }
            return bSeg;
          })}
        </span>
      );
    });
  };

  const renderTextBlock = (rawText: string, blockKey: string | number) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = (listKey: string) => {
      if (!currentList) return;
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={listKey} className="my-2.5 space-y-1.5 pl-4 text-slate-700">
            {currentList.items.map((item, iIdx) => (
              <li key={iIdx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span className="leading-relaxed">{renderInlineFormatted(item)}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={listKey} className="my-2.5 space-y-1.5 pl-4 text-slate-700">
            {currentList.items.map((item, iIdx) => (
              <li key={iIdx} className="flex items-start gap-2">
                <span className="font-mono text-xs font-semibold text-indigo-600 mt-0.5 shrink-0">
                  {iIdx + 1}.
                </span>
                <span className="leading-relaxed">{renderInlineFormatted(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        flushList(`list-before-h3-${lineIdx}`);
        elements.push(
          <h4 key={`h3-${lineIdx}`} className="text-base font-semibold text-slate-900 mt-4 mb-2 tracking-tight">
            {renderInlineFormatted(trimmed.slice(4))}
          </h4>
        );
        return;
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        flushList(`list-before-h2-${lineIdx}`);
        elements.push(
          <h3 key={`h2-${lineIdx}`} className="text-lg font-semibold text-indigo-900 mt-5 mb-2.5 tracking-tight border-b border-slate-200 pb-1">
            {renderInlineFormatted(trimmed.slice(3))}
          </h3>
        );
        return;
      }

      // Heading 1
      if (trimmed.startsWith('# ')) {
        flushList(`list-before-h1-${lineIdx}`);
        elements.push(
          <h2 key={`h1-${lineIdx}`} className="text-xl font-bold text-slate-900 mt-6 mb-3 tracking-tight">
            {renderInlineFormatted(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList(`list-before-quote-${lineIdx}`);
        elements.push(
          <blockquote
            key={`quote-${lineIdx}`}
            className="my-3 pl-3.5 border-l-2 border-indigo-500 bg-indigo-50/60 py-2 pr-3 text-slate-700 italic text-sm rounded-r-md"
          >
            {renderInlineFormatted(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.slice(2);
        if (!currentList || currentList.type !== 'ul') {
          flushList(`list-before-ul-${lineIdx}`);
          currentList = { type: 'ul', items: [itemText] };
        } else {
          currentList.items.push(itemText);
        }
        return;
      }

      // Numbered lists
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        const itemText = numberedMatch[2];
        if (!currentList || currentList.type !== 'ol') {
          flushList(`list-before-ol-${lineIdx}`);
          currentList = { type: 'ol', items: [itemText] };
        } else {
          currentList.items.push(itemText);
        }
        return;
      }

      // Empty line
      if (!trimmed) {
        flushList(`list-before-empty-${lineIdx}`);
        return;
      }

      // Regular paragraph
      flushList(`list-before-p-${lineIdx}`);
      elements.push(
        <p key={`p-${lineIdx}`} className="my-2 leading-relaxed text-slate-700 text-sm md:text-base">
          {renderInlineFormatted(line)}
        </p>
      );
    });

    flushList('list-end');

    return <div key={blockKey}>{elements}</div>;
  };

  return (
    <div className={`space-y-3 font-sans text-slate-700 ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'code' && part.code) {
          const isCopied = copiedIndex === index;
          return (
            <div
              key={index}
              className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] text-slate-100 font-mono text-xs md:text-sm shadow-md"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1E293B] border-b border-slate-700/80 text-slate-400 text-xs">
                <span className="font-semibold text-slate-200 uppercase tracking-wider">{part.language}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(part.code!, index)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-slate-700"
                  aria-label="Copy code"
                >
                  {isCopied ? (
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
              <pre className="p-3.5 overflow-x-auto font-mono text-sky-200 leading-relaxed">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        return renderTextBlock(part.text || '', index);
      })}
    </div>
  );
};
