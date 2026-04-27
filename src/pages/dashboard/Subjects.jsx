// src/pages/DashboardSubjects.jsx
// FIX: cards now open independently.
// Root cause: CSS grid stretches all cards in a row to the same height when
// one expands, making them look like they all opened.
// Solution: when a card is open, render it as a single full-width column
// spanning the entire row so no other card is affected by its height.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResources } from "../../api/ResourceApi";

const SUBJECTS = [
  { name: "Mathematics",         emoji: "📐", color: "blue",   levels: "both" },
  { name: "English Language",    emoji: "📖", color: "green",  levels: "both" },
  { name: "Biology",             emoji: "🔬", color: "teal",   levels: "ss" },
  { name: "Chemistry",           emoji: "⚗️", color: "purple", levels: "ss" },
  { name: "Physics",             emoji: "⚡", color: "yellow",  levels: "ss" },
  { name: "Economics",           emoji: "📊", color: "orange", levels: "ss" },
  { name: "Government",          emoji: "🏛️", color: "red",    levels: "ss" },
  { name: "Literature",          emoji: "📜", color: "pink",   levels: "ss" },
  { name: "Geography",           emoji: "🌍", color: "green",  levels: "both" },
  { name: "Agriculture",         emoji: "🌱", color: "teal",   levels: "both" },
  { name: "Further Mathematics", emoji: "🧮", color: "blue",   levels: "ss" },
  { name: "Civic Education",     emoji: "🤝", color: "orange", levels: "both" },
  { name: "Commerce",            emoji: "💼", color: "purple", levels: "ss" },
  { name: "Computer Science",    emoji: "💻", color: "blue",   levels: "ss" },
  { name: "Information Technology", emoji: "🖥️", color: "teal", levels: "ss" },
  { name: "Physical Education",  emoji: "🏃", color: "orange", levels: "both" },
  { name: "Home Economics",      emoji: "🏠", color: "pink",   levels: "both" },
  { name: "Fine Arts",           emoji: "🎨", color: "purple", levels: "both" },
  { name: "Technical Drawing",   emoji: "📏", color: "gray",   levels: "ss" },
  { name: "Health Science",      emoji: "🩺", color: "green",  levels: "both" },
];

const JSS_LEVELS = ["JSS1", "JSS2", "JSS3"];
const SS_LEVELS  = ["SS1",  "SS2",  "SS3"];

const COLOR_MAP = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500",   pill: "bg-blue-100 text-blue-700",   hover: "hover:bg-blue-50" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500",  pill: "bg-green-100 text-green-700",  hover: "hover:bg-green-50" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700",   dot: "bg-teal-500",   pill: "bg-teal-100 text-teal-700",    hover: "hover:bg-teal-50" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500", pill: "bg-purple-100 text-purple-700", hover: "hover:bg-purple-50" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500", pill: "bg-yellow-100 text-yellow-700", hover: "hover:bg-yellow-50" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500", pill: "bg-orange-100 text-orange-700", hover: "hover:bg-orange-50" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    dot: "bg-red-500",    pill: "bg-red-100 text-red-700",      hover: "hover:bg-red-50" },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   text: "text-pink-700",   dot: "bg-pink-500",   pill: "bg-pink-100 text-pink-700",    hover: "hover:bg-pink-50" },
};

// ── Level row inside expanded card ────────────────────────────────────────────
function LevelRow({ level, count, onClick, colorClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition group ${colorClass.hover}`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClass.dot}`} />
        <span className="text-sm font-medium text-gray-700">{level}</span>
      </div>
      <div className="flex items-center gap-2">
        {count > 0 ? (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorClass.pill}`}>
            {count} resource{count !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-[10px] text-gray-300">No resources yet</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
          className="group-hover:stroke-[#1a2a5e] transition">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </button>
  );
}

// ── Subject card ──────────────────────────────────────────────────────────────
function SubjectCard({ subject, totalCount, levelCounts, onCardClick }) {
  const c = COLOR_MAP[subject.color] || COLOR_MAP.blue;

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200`}>

      {/* Card header — clickable to navigate */}
      <button
        onClick={onCardClick}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-gray-50`}>
          {subject.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1a2a5e]">
            {subject.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {totalCount > 0
              ? `${totalCount} resource${totalCount !== 1 ? "s" : ""} available`
              : "No resources yet"
            }
          </p>
        </div>

        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardSubjects() {
  const navigate = useNavigate();

  const [ subjectData,  setSubjectData]  = useState({});
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState("");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const data      = await getResources({ limit: 1000 });
        const resources = data.resources || [];
        const map       = {};
        for (const r of resources) {
          if (!map[r.subject]) map[r.subject] = { total: 0, levels: {} };
          map[r.subject].total += 1;
          const lvl = r.level || "Other";
          map[r.subject].levels[lvl] = (map[r.subject].levels[lvl] || 0) + 1;
        }
        setSubjectData(map);
      } catch (err) {
        console.error("Failed to fetch subject counts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  // Click subject card to navigate to all resources for that subject
  const handleCardClick = (subjectName) => {
    navigate(`/dashboard/resources?subject=${encodeURIComponent(subjectName)}`);
  };

  const handleLevelClick = (subject, level) => {
    const params = new URLSearchParams({ subject });
    if (level !== "All Levels") params.set("level", level);
    navigate(`/dashboard/resources?${params.toString()}`);
  };

  const filtered = SUBJECTS.filter((s) =>
    !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResources = Object.values(subjectData).reduce(
    (sum, d) => sum + d.total, 0
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#1a2a5e]">Subjects</h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading
            ? "Loading subjects..."
            : `${totalResources} resources across ${Object.keys(subjectData).length} subjects`
          }
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm
                     text-gray-700 placeholder-gray-400 outline-none
                     focus:border-[#1a2a5e]/40 transition"
        />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subject cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((subject) => {
            const data   = subjectData[subject.name] || { total: 0, levels: {} };

            return (
              <SubjectCard
                key={subject.name}
                subject={subject}
                totalCount={data.total}
                levelCounts={data.levels}
                onCardClick={() => handleCardClick(subject.name)}
              />
            );
          })}
        </div>
      )}

      {/* No search results */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">No subjects match "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-2 text-xs text-[#3b6fd4] font-semibold hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}