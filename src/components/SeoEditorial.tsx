import React from "react";
import seoEditorialContent from "@/utils/seo-editorial-content.json";

interface SeoEditorialProps {
  route: string;
}

export function SeoEditorial({ route }: SeoEditorialProps) {
  // Safe lookup for route content
  const pageData = (seoEditorialContent as Record<string, any>)[route];
  if (!pageData) return null;

  // Helper to parse simple markdown-style links [Label](/url) and lists
  const renderParagraph = (text: string, idx: number) => {
    // Regex to match [Label](/url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
        >
          {label}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // Handle bullet points
    if (text.trim().startsWith("- ")) {
      const bulletContent = text.trim().substring(2);
      // Recursively parse links inside bullet items
      const bulletParts = [];
      let bulletLastIndex = 0;
      let bulletMatch;
      // Reset regex index
      linkRegex.lastIndex = 0;
      while ((bulletMatch = linkRegex.exec(bulletContent)) !== null) {
        if (bulletMatch.index > bulletLastIndex) {
          bulletParts.push(bulletContent.substring(bulletLastIndex, bulletMatch.index));
        }
        bulletParts.push(
          <a
            key={`bullet-link-${bulletMatch.index}`}
            href={bulletMatch[2]}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            {bulletMatch[1]}
          </a>
        );
        bulletLastIndex = linkRegex.lastIndex;
      }
      if (bulletLastIndex < bulletContent.length) {
        bulletParts.push(bulletContent.substring(bulletLastIndex));
      }

      return (
        <li key={idx} className="ml-4 list-disc pl-1 text-slate-600 dark:text-slate-400 leading-relaxed">
          {bulletParts.length > 0 ? bulletParts : bulletContent}
        </li>
      );
    }

    return (
      <p key={idx} className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
        {parts.length > 0 ? parts : text}
      </p>
    );
  };

  const renderSectionText = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith("- ")) {
        currentList.push(renderParagraph(line, index));
      } else {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="space-y-2 mb-4">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        elements.push(renderParagraph(line, index));
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <ul key="list-final" className="space-y-2 mb-4">
          {currentList}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div id={`seo-editorial-${route.replace(/\//g, "-")}`} className="seo-editorial-section py-16 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 mt-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-6">
          {pageData.h1}
        </h1>
        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 mb-10 font-medium">
          {pageData.intro}
        </p>

        <div className="space-y-10">
          {pageData.sections.map((sec: any, idx: number) => (
            <div key={idx} className="border-l-4 border-slate-200 dark:border-slate-700 pl-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {sec.heading}
              </h2>
              {renderSectionText(sec.text)}
            </div>
          ))}
        </div>

        {pageData.faqs && pageData.faqs.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="grid gap-6 md:grid-cols-1">
              {pageData.faqs.map((faq: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800/40 p-6 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm"
                >
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-lg">
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
