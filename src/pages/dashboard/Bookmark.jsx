// src/pages/DashboardBookmarks.jsx
// Enhanced bookmarks page:
// - Cards grouped by subject
// - Search bar + type filter
// - Remove with one-click (no modal needed, undo via re-bookmark)
// - Empty state per group
// - Pulls real data from GET /api/bookmarks

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookmarks } from "../../hook/UseApi";

const TYPE_META = {
  youtube: { label: "Video",   bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400" },
  pdf:     { label: "PDF",     bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-400" },
  notes:   { label: "Notes",   bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
  article: { label: "Article", bg: "bg-green-50",  text: "text-green-600",  dot: "bg-green-400" },
};

const CARD_GRADIENTS = [
  "from-[#1a2a5e] to-[#3b6fd4]",
  "from-purple-700 to-purple-500",
  "from-teal-700 to-teal-500",
  "from-orange-600 to-orange-400",
  "from-green-700 to-green-500",
  "from-pink-600 to-pink-400",
];

function BookmarkCard({ resource, onRemove, onClick, gradientIdx }) {
  const meta     = TYPE_META[resource.type] || TYPE_META.article;
  const gradient = CARD_GRADIENTS[gradientIdx % CARD_GRADIENTS.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">

      {/* Thumbnail */}
      <div
        className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative cursor-pointer overflow-hidden`}
        onClick={onClick}
      >
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : resource.type === "youtube" ? (
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        ) : resource.type === "notes" ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        ) : resource.type === "pdf" ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h10"/>
          </svg>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
            {meta.label}
          </span>
        </div>

        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(resource._id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/30 hover:bg-red-500 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
          title="Remove bookmark"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 cursor-pointer" onClick={onClick}>
        <p className="text-sm font-semibold text-[#1a2a5e] line-clamp-2 leading-snug mb-2">
          {resource.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          {resource.level && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
              {resource.level}
            </span>
          )}
          {resource.duration && (
            <span className="text-[10px] text-gray-400">{resource.duration}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardBookmarks() {
  const navigate = useNavigate();
  const { bookmarks, loading, error, toggle } = useBookmarks();

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode,   setViewMode]   = useState("grouped"); // "grouped" | "grid"

  // Apply filters
  const filtered = bookmarks.filter((r) => {
    const matchSearch =
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.subject?.toLowerCase().includes(search.toLowerCase()) ||
      r.topic?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  // Group by subject
  const grouped = filtered.reduce((acc, r) => {
    const key = r.subject || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const subjectList = Object.keys(grouped).sort();

  // Stats
  const byType = bookmarks.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1a2a5e]">My Bookmarks</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading
              ? "Loading..."
              : `${bookmarks.length} saved resource${bookmarks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {/* {bookmarks.length > 0 && (
          <button
            onClick={() => navigate("/dashboard/resource-page")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            Find more resources
          </button>
        )} */}
      </div>

      {/* Stats strip — only shown when there are bookmarks */}
      {!loading && bookmarks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = byType[type] || 0;
            if (count === 0) return null;
            return (
              <div key={type} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${meta.bg}`}>
                <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                <span className={`text-xs font-semibold ${meta.text}`}>
                  {count} {meta.label}{count !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters — only shown when there are bookmarks */}
      {!loading && bookmarks.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1a2a5e]/40 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all",     label: "All" },
              { value: "youtube", label: "Videos" },
              { value: "notes",   label: "Notes" },
              { value: "pdf",     label: "PDFs" },
              { value: "article", label: "Articles" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  typeFilter === value
                    ? "bg-[#1a2a5e] border-[#1a2a5e] text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#1a2a5e]/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 ml-auto">
            {[
              { mode: "grouped", icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> },
              { mode: "grid",    icon: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></> },
            ].map(({ mode, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  viewMode === mode ? "bg-[#1a2a5e] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {icon}
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-100" />
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      )}

      {/* Empty — no bookmarks at all */}
      {!loading && !error && bookmarks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-[#1a2a5e] mb-2">No bookmarks yet</p>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              When you find a resource you want to revisit, tap the bookmark icon to save it here.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/resource-page")}
            className="px-6 py-3 rounded-xl bg-[#1a2a5e] text-white text-sm font-bold hover:bg-[#14234d] transition active:scale-95"
          >
            Browse Resources
          </button>
        </div>
      )}

      {/* Empty after filtering */}
      {!loading && !error && bookmarks.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No bookmarks match your search.</p>
          <button
            onClick={() => { setSearch(""); setTypeFilter("all"); }}
            className="mt-2 text-xs text-[#3b6fd4] font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Flat grid mode */}
      {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((resource, i) => (
            <BookmarkCard
              key={resource._id}
              resource={resource}
              gradientIdx={i}
              onRemove={toggle}
              onClick={() => navigate(`/dashboard/resource-view/${resource._id}`)}
            />
          ))}
        </div>
      )}

      {/* Grouped by subject mode */}
      {!loading && !error && filtered.length > 0 && viewMode === "grouped" && (
        <div className="flex flex-col gap-8">
          {subjectList.map((subject) => {
            const items = grouped[subject];
            return (
              <div key={subject}>
                {/* Subject header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-bold text-[#1a2a5e]">{subject}</h2>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {items.length} resource{items.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => navigate(`/dashboard/resource-page?subject=${encodeURIComponent(subject)}`)}
                    className="text-[11px] text-[#3b6fd4] hover:underline font-medium ml-auto"
                  >
                    More {subject} →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((resource, i) => (
                    <BookmarkCard
                      key={resource._id}
                      resource={resource}
                      gradientIdx={i}
                      onRemove={toggle}
                      onClick={() => navigate(`/dashboard/resource-view/${resource._id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}