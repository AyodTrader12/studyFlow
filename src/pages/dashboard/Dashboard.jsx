// src/pages/DashboardHome.jsx
// Main dashboard page. Pulls real data from the backend:
// - User profile (streak, stats) from AuthContext
// - Progress stats (per-subject breakdown) from useProgress
// - Recent bookmarks from useBookmarks
// - Featured resources from useResources

import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProgress, useBookmarks, useResources } from "../../hook/UseApi";

const TYPE_META = {
  youtube: { label: "Video",   color: "bg-red-50 text-red-600" },
  pdf:     { label: "PDF",     color: "bg-blue-50 text-blue-600" },
  notes:   { label: "Notes",   color: "bg-purple-50 text-purple-600" },
  article: { label: "Article", color: "bg-green-50 text-green-600" },
};

const SUBJECT_COLORS = [
  "bg-blue-50 text-blue-700",
  "bg-purple-50 text-purple-700",
  "bg-green-50 text-green-700",
  "bg-orange-50 text-orange-700",
  "bg-teal-50 text-teal-700",
  "bg-pink-50 text-pink-700",
  "bg-amber-50 text-amber-700",
  "bg-red-50 text-red-700",
];

const SUBJECT_EMOJIS = {
  "Mathematics":         "📐",
  "English Language":    "📖",
  "Biology":             "🔬",
  "Chemistry":           "⚗️",
  "Physics":             "⚡",
  "Economics":           "📊",
  "Government":          "🏛️",
  "Literature":          "📜",
  "Geography":           "🌍",
  "Agriculture":         "🌱",
  "Further Mathematics": "🧮",
  "Civic Education":     "🤝",
  "Commerce":            "💼",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Skeleton loader for cards ─────────────────────────────────────────────────
function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 animate-pulse ${className}`}>
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

// ── Streak day indicator ──────────────────────────────────────────────────────
function StreakWeek({ streak }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  // Show today and the 6 days before
  const today = new Date().getDay(); // 0=Sun
  const orderedDays = [...days.slice(today === 0 ? 0 : today), ...days.slice(0, today === 0 ? 0 : today)].slice(0, 7);
  const activeDays = Math.min(streak, 7);

  return (
    <div className="flex gap-1.5">
      {orderedDays.map((d, i) => {
        const isActive = i >= (7 - activeDays);
        return (
          <div
            key={i}
            className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
              isActive ? "bg-orange-400 text-white shadow-sm" : "bg-white/10 text-blue-300"
            }`}
          >
            {isActive ? "✓" : d}
          </div>
        );
      })}
    </div>
  );
}

// ── Resource mini card ────────────────────────────────────────────────────────
function ResourceMiniCard({ resource, onClick }) {
  const meta = TYPE_META[resource.type] || TYPE_META.article;
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm hover:border-blue-100 transition cursor-pointer group"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a2a5e] to-[#3b6fd4] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
        {resource.type === "youtube" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        ) : resource.type === "notes" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#1a2a5e] truncate leading-snug">{resource.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[9px] text-gray-400">{resource.subject}</span>
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { searchQuery }           = useOutletContext();
  const { userProfile }           = useAuth();
  const navigate                  = useNavigate();
  const { stats, loading: progLoading } = useProgress();
  const { bookmarks, loading: bookLoading } = useBookmarks();
  const { resources, loading: resLoading } = useResources({ limit: 6 });

  const firstName    = userProfile?.displayName?.split(" ")[0] || "Student";
  const streak       = userProfile?.streak?.current ?? 0;
  const longestStreak = userProfile?.streak?.longest ?? 0;
  const totalViewed  = userProfile?.totalResourcesViewed ?? 0;
  const totalBookmarks = userProfile?.totalBookmarks ?? 0;
  const isVerified   = userProfile?.isVerified ?? false;

  // Filter resources by search if there is a search query
  const filteredResources = searchQuery
    ? resources.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resources;

  return (
    <div className="flex flex-col gap-7">

      {/* ── Email verification banner ── */}
      {userProfile && !isVerified && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Please verify your email</p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              Check your inbox for the verification link we sent you. Some features may be limited until you verify.
            </p>
          </div>
        </div>
      )}

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1a2a5e]">
            {getGreeting()}, {firstName}! 
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {streak > 0
              ? `You're on a ${streak}-day streak — keep it going👋`
              : "What would you like to study today?"
            }
          </p>
        </div>
        {/* <button
          onClick={() => navigate("/dashboard/resource-page")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a2a5e] text-white text-sm font-bold hover:bg-[#14234d] transition active:scale-95 flex-shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          Browse Resources
        </button> */}
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Study Streak",
            value: streak > 0 ? `${streak} 🔥` : "0",
            sub:   streak > 0 ? `Best: ${longestStreak} days` : "Start studying today!",
            bg:    "bg-orange-50",
          },
          {
            label: "Resources Viewed",
            value: totalViewed,
            sub:   "total resources",
            bg:    "bg-blue-50",
          },
          {
            label: "Bookmarks",
            value: totalBookmarks,
            sub:   "saved resources",
            bg:    "bg-purple-50",
          },
          {
            label: "Subjects",
            value: stats.length,
            sub:   "subjects studied",
            bg:    "bg-green-50",
          },
        ].map(({ label, value, sub, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className="text-2xl md:text-3xl font-extrabold text-[#1a2a5e]">{value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — subject progress (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Subject Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-[#1a2a5e]">Subject Progress</h2>
              <button
                onClick={() => navigate("/dashboard/progress")}
                className="text-xs text-[#3b6fd4] font-semibold hover:underline"
              >
                View all →
              </button>
            </div>

            {progLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#1a2a5e] mb-1">No progress yet</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Start viewing resources to track your progress by subject.
                </p>
                <button
                  onClick={() => navigate("/dashboard/resource-page")}
                  className="mt-3 text-xs text-[#3b6fd4] font-semibold hover:underline"
                >
                  Browse resources →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {stats.slice(0, 6).map((stat, i) => {
                  const emoji = SUBJECT_EMOJIS[stat._id] || "📚";
                  const colorClass = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                  // Calculate a visual progress percentage (max shown is the most-viewed subject)
                  const maxCount = stats[0]?.count || 1;
                  const pct = Math.round((stat.count / maxCount) * 100);

                  return (
                    <div
                      key={stat._id}
                      onClick={() => navigate(`/dashboard/resource-page?subject=${encodeURIComponent(stat._id)}`)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${colorClass}`}>
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold text-[#1a2a5e] group-hover:underline truncate">
                            {stat._id}
                          </p>
                          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                            {stat.count} resource{stat.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-[#1a2a5e] h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Featured / Search Resources */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1a2a5e]">
                {searchQuery ? `Results for "${searchQuery}"` : "Featured Resources"}
              </h2>
              <button
                onClick={() => navigate("/dashboard/resource-page")}
                className="text-xs text-[#3b6fd4] font-semibold hover:underline"
              >
                View all →
              </button>
            </div>

            {resLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                {searchQuery ? `No resources found for "${searchQuery}"` : "No resources yet."}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredResources.map((resource) => (
                  <ResourceMiniCard
                    key={resource._id}
                    resource={resource}
                    onClick={() => navigate(`/dashboard/resource-view/${resource._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — streak + recent bookmarks (1/3 width) */}
        <div className="flex flex-col gap-5">

          {/* Streak card */}
          <div className="bg-[#1a2a5e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <p className="text-white text-sm font-bold">Study Streak</p>
              </div>
              <span className="text-orange-300 text-2xl font-extrabold">{streak}</span>
            </div>
            <p className="text-blue-200 text-xs mb-4 leading-snug">
              {streak === 0
                ? "Study something today to start your streak!"
                : streak >= 7
                ? `Amazing! ${streak} days straight 🏆`
                : `${7 - streak} more day${7 - streak !== 1 ? "s" : ""} to hit a week!`
              }
            </p>
            <StreakWeek streak={streak} />
            {longestStreak > 0 && (
              <p className="text-blue-300 text-[10px] mt-2">
                Personal best: <span className="text-orange-300 font-bold">{longestStreak} days</span>
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-[#1a2a5e] mb-3">Quick Actions</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Browse all resources", icon: "▶", path: "/dashboard/resources" },
                { label: "View my subjects",     icon: "📚", path: "/dashboard/subjects" },
                { label: "My bookmarks",         icon: "🔖", path: "/dashboard/bookmarks" },
                { label: "My progress",          icon: "📊", path: "/dashboard/progress" },
              ].map(({ label, icon, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1a2a5e] transition group"
                >
                  <span className="text-base">{icon}</span>
                  <span className="font-medium flex-1">{label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" className="group-hover:stroke-[#1a2a5e] transition">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Recent bookmarks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1a2a5e]">Recent Bookmarks</h2>
              <button
                onClick={() => navigate("/dashboard/bookmarks")}
                className="text-xs text-[#3b6fd4] font-semibold hover:underline"
              >
                View all →
              </button>
            </div>

            {bookLoading ? (
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                <p className="text-xs text-gray-400">No bookmarks yet</p>
                <p className="text-[10px] text-gray-300 mt-0.5">
                  Tap the bookmark icon on any resource
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {bookmarks.slice(0, 4).map((resource) => (
                  <ResourceMiniCard
                    key={resource._id}
                    resource={resource}
                    onClick={() => navigate(`/dashboard/resource-view/${resource._id}`)}
                  />
                ))}
                {bookmarks.length > 4 && (
                  <button
                    onClick={() => navigate("/dashboard/bookmarks")}
                    className="text-xs text-center text-gray-400 hover:text-[#1a2a5e] transition mt-1"
                  >
                    +{bookmarks.length - 4} more bookmarks
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}