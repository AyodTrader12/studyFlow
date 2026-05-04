// src/pages/ResourceViewer.jsx
// Opens when a student clicks any resource card.
// - Marks resource as viewed automatically (updates streak on backend)
// - YouTube: embedded iframe — no redirect
// - PDF: Google Docs Viewer iframe — no redirect
// - Notes: rendered markdown — fully in-app
// - Article: sandboxed iframe with fallback link
// - SummaryCard shown below every resource

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useResource, useProgress, useBookmarks } from "../../hook/UseApi";
import SummaryCard from "../../components/SummaryCard";

const TYPE_META = {
  youtube: { label: "Video",   badgeClass: "bg-red-50 text-red-600" },
  pdf:     { label: "PDF",     badgeClass: "bg-blue-50 text-blue-600" },
  notes:   { label: "Notes",   badgeClass: "bg-purple-50 text-purple-600" },
  article: { label: "Article", badgeClass: "bg-green-50 text-green-600" },
};

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    let id  = u.searchParams.get("v");
    if (!id && u.hostname === "youtu.be") id = u.pathname.slice(1);
    if (!id && u.pathname.includes("/embed/")) return url;
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : url;
  } catch { return url; }
}

function toPDFViewer(url) {
  if (url.includes("docs.google.com/viewer")) return url;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

// ── Notes markdown renderer ───────────────────────────────────────────────────
function renderInline(text) {
  const parts = [];
  let rem = text, k = 0;
  while (rem.length > 0) {
    const bold   = rem.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (bold)   { if (bold[1])   parts.push(<span key={k++}>{bold[1]}</span>);   parts.push(<strong key={k++} className="font-bold text-[#1a2a5e]">{bold[2]}</strong>);  rem = bold[3];   continue; }
    const code   = rem.match(/^(.*?)`(.+?)`(.*)/s);
    if (code)   { if (code[1])   parts.push(<span key={k++}>{code[1]}</span>);   parts.push(<code key={k++} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">{code[2]}</code>); rem = code[3];   continue; }
    const italic = rem.match(/^(.*?)\*(.+?)\*(.*)/s);
    if (italic) { if (italic[1]) parts.push(<span key={k++}>{italic[1]}</span>); parts.push(<em key={k++} className="italic text-gray-600">{italic[2]}</em>);            rem = italic[3]; continue; }
    parts.push(<span key={k++}>{rem}</span>); break;
  }
  return parts.length === 1 && typeof parts[0]?.props?.children === "string" ? parts[0].props.children : parts;
}

function NotesRenderer({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  const els   = [];
  let   i     = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("# "))   { els.push(<h1 key={i} className="text-2xl font-extrabold text-[#1a2a5e] mt-8 mb-4 pb-2 border-b-2 border-blue-100">{line.slice(2)}</h1>); i++; continue; }
    if (line.startsWith("## "))  { els.push(<h2 key={i} className="text-xl font-bold text-[#1a2a5e] mt-6 mb-3">{line.slice(3)}</h2>); i++; continue; }
    if (line.startsWith("### ")) { els.push(<h3 key={i} className="text-base font-bold text-[#1a2a5e] mt-5 mb-2">{line.slice(4)}</h3>); i++; continue; }
    if (line.startsWith("---"))  { els.push(<hr key={i} className="my-6 border-gray-200" />); i++; continue; }

    if (line.startsWith("```")) {
      const code = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      els.push(<pre key={`c${i}`} className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 my-4 overflow-x-auto text-sm font-mono text-gray-700 leading-relaxed"><code>{code.join("\n")}</code></pre>);
      i++; continue;
    }

    if (line.startsWith("|")) {
      const rows = []; while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i]); i++; }
      const dataRows = rows.filter((r) => !r.match(/^\|[-| ]+\|$/));
      els.push(
        <div key={`t${i}`} className="overflow-x-auto my-5 rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#1a2a5e] text-white">{dataRows[0]?.split("|").filter((c) => c.trim()).map((cell, ci) => <th key={ci} className="px-4 py-2.5 text-left font-semibold text-xs">{cell.trim()}</th>)}</tr></thead>
            <tbody>{dataRows.slice(1).map((row, ri) => <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>{row.split("|").filter((c) => c.trim()).map((cell, ci) => <td key={ci} className="px-4 py-2.5 text-gray-700 border-t border-gray-100">{renderInline(cell.trim())}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = []; while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { items.push(lines[i].slice(2)); i++; }
      els.push(<ul key={`u${i}`} className="my-3 flex flex-col gap-1.5 pl-5">{items.map((item, idx) => <li key={idx} className="text-gray-700 text-sm leading-relaxed list-disc">{renderInline(item)}</li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items = []; while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++; }
      els.push(<ol key={`o${i}`} className="my-3 flex flex-col gap-1.5 pl-6">{items.map((item, idx) => <li key={idx} className="text-gray-700 text-sm leading-relaxed list-decimal">{renderInline(item)}</li>)}</ol>);
      continue;
    }

    if (line.trim() === "") { i++; continue; }
    els.push(<p key={i} className="text-gray-700 text-sm leading-relaxed my-2">{renderInline(line)}</p>);
    i++;
  }
  return <div>{els}</div>;
}

// ── Main viewer ───────────────────────────────────────────────────────────────
export default function ResourceViewer() {
  const { id }   = useParams();
  const navigate = useNavigate();
  useOutletContext(); // keeps context alive

  const { resource, loading } = useResource(id);
  const { markViewed }               = useProgress();
  const { isBookmarked, toggle }     = useBookmarks();

  const [iframeLoading, setIframeLoading] = useState(true);
  const markedRef = useRef(false);
  const startTime = useRef(Date.now());

  // Mark as viewed once — records time spent when component unmounts
  useEffect(() => {
    if (resource && !markedRef.current) {
      markedRef.current = true;
      startTime.current = Date.now();
    }
    return () => {
      if (markedRef.current) {
        const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
        markViewed(resource?._id, timeSpent);
      }
    };
  }, [resource]); // eslint-disable-line

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (!resource) return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-red-500 text-sm">Resource not found.</p>
      <button onClick={() => navigate(-1)} className="text-sm text-[#1a2a5e] font-semibold hover:underline">
        ← Go back
      </button>
    </div>
  );

  const meta = TYPE_META[resource.type] || TYPE_META.article;
  const embedUrl =
    resource.type === "youtube" ? toYouTubeEmbed(resource.url) :
    resource.type === "pdf"     ? toPDFViewer(resource.url)    :
    resource.url;

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2a5e] transition w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to Resources
      </button>

      {/* Meta card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
              {meta.label}
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {resource.subject}
            </span>
            {resource.level && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {resource.level}
              </span>
            )}
            {resource.topic && (
              <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                {resource.topic}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-[#1a2a5e] leading-snug mb-1">{resource.title}</h1>
          {resource.description && (
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">{resource.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {resource.duration && <span>⏱ {resource.duration}</span>}
            {resource.views > 0 && <span>👁 {resource.views} views</span>}
          </div>
        </div>

        {/* Bookmark button */}
        <button
          onClick={() => toggle(resource._id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition flex-shrink-0 ${
            isBookmarked(resource._id)
              ? "bg-[#1a2a5e] border-[#1a2a5e] text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-[#1a2a5e] hover:text-[#1a2a5e]"
          }`}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill={isBookmarked(resource._id) ? "white" : "none"}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
          {isBookmarked(resource._id) ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      {/* Content area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* YouTube */}
        {resource.type === "youtube" && (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <svg className="animate-spin h-8 w-8 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            )}
            <iframe
              src={embedUrl}
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIframeLoading(false)}
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        )}

        {/* PDF */}
        {resource.type === "pdf" && (
          <div className="relative w-full" style={{ height: "80vh", minHeight: "500px" }}>
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-3">
                <svg className="animate-spin h-8 w-8 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-xs text-gray-400">Loading PDF...</p>
              </div>
            )}
            <iframe
              src={embedUrl}
              title={resource.title}
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* Notes — rendered in-app */}
        {resource.type === "notes" && (
          <div className="px-7 py-7 max-w-3xl">
            {resource.content
              ? <NotesRenderer content={resource.content} />
              : <p className="text-gray-400 text-sm italic">No content available.</p>
            }
            <div className="mt-10 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-gray-400">
                {resource.duration} · {resource.subject} · {resource.level}
              </p>
              <button
                onClick={() => toggle(resource._id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  isBookmarked(resource._id)
                    ? "bg-[#1a2a5e] text-white"
                    : "border border-gray-200 text-gray-500 hover:border-[#1a2a5e] hover:text-[#1a2a5e]"
                }`}
              >
                {isBookmarked(resource._id) ? "✓ Saved" : "Save for later"}
              </button>
            </div>
          </div>
        )}

        {/* Article */}
        {resource.type === "article" && (
          <div className="relative w-full" style={{ height: "80vh", minHeight: "500px" }}>
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-3">
                <svg className="animate-spin h-8 w-8 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-xs text-gray-400">Loading article...</p>
              </div>
            )}
            <iframe
              src={resource.url}
              title={resource.title}
              sandbox="allow-scripts allow-same-origin allow-popups"
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
            />
            <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
              <p className="text-xs text-gray-400">If the article does not load, open it directly:</p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#3b6fd4] hover:underline flex items-center gap-1"
              >
                Open in new tab
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Gemini AI Summary — shown below every resource */}
      <SummaryCard resourceId={resource._id} subject={resource.subject} />

    </div>
  );
}