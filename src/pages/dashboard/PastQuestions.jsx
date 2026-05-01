// src/pages/PastQuestionsPage.jsx
// Landing page: shows a card for each exam body.
// Click a card → see available subjects + years.
// Click a year → opens the past question PDF in-app.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getPastQuestionsSummary } from "../../api/pastQuestionApi";

const EXAM_META = {
  "JAMB": {
    emoji:    "🎓",
    fullName: "Joint Admissions and Matriculation Board",
    short:    "UTME / DE",
    color:    "blue",
    desc:     "University entry exam for Nigerian students",
  },
  "WAEC": {
    emoji:    "📋",
    fullName: "West African Examinations Council",
    short:    "WASSCE",
    color:    "green",
    desc:     "Senior secondary school leaving certificate",
  },
  "NECO": {
    emoji:    "📝",
    fullName: "National Examinations Council",
    short:    "SSCE / BECE",
    color:    "purple",
    desc:     "Nigerian national secondary school exams",
  },
  "GCE": {
    emoji:    "🏅",
    fullName: "General Certificate of Education",
    short:    "Nov/Dec",
    color:    "orange",
    desc:     "Alternative O-level qualification",
  },
  "Junior WAEC": {
    emoji:    "📗",
    fullName: "Basic Education Certificate Examination",
    short:    "BECE / JSS3",
    color:    "teal",
    desc:     "Junior secondary school certificate exam",
  },
  // "Common Entrance": {
  //   emoji:    "✏️",
  //   fullName: "National Common Entrance Examination",
  //   short:    "Primary → JSS1",
  //   color:    "pink",
  //   desc:     "Entry into federal government colleges",
  // },
  "Other": {
    emoji:    "📄",
    fullName: "Other Examinations",
    short:    "Various",
    color:    "gray",
    desc:     "State exams and other assessments",
  },
};

const COLOR_MAP = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700",   btn: "bg-blue-600 hover:bg-blue-700" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  btn: "bg-green-600 hover:bg-green-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700", btn: "bg-orange-600 hover:bg-orange-700" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700",   badge: "bg-teal-100 text-teal-700",    btn: "bg-teal-600 hover:bg-teal-700" },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   text: "text-pink-700",   badge: "bg-pink-100 text-pink-700",    btn: "bg-pink-600 hover:bg-pink-700" },
  gray:   { bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-700",   badge: "bg-gray-100 text-gray-700",    btn: "bg-gray-600 hover:bg-gray-700" },
};

function ExamCard({ examBody, subjects, totalCount, onSelect }) {
  const meta   = EXAM_META[examBody] || EXAM_META["Other"];
  const c      = COLOR_MAP[meta.color] || COLOR_MAP.gray;
  const sorted = [...(subjects || [])].sort((a, b) => a.subject.localeCompare(b.subject));

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${c.border}`}>
      {/* Header */}
      <div className={`px-5 py-4 ${c.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.emoji}</span>
            <div>
              <h3 className={`text-base font-extrabold ${c.text}`}>{examBody}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{meta.short}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${c.badge}`}>
            {totalCount} paper{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{meta.desc}</p>
      </div>

      {/* Subject list */}
      <div className="px-5 py-3">
        {sorted.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">No past questions uploaded yet</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {sorted.slice(0, 5).map((s) => {
              const sortedYears = [...s.years].sort((a, b) => b - a);
              return (
                <button
                  key={s.subject}
                  onClick={() => onSelect(examBody, s.subject)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-gray-50 transition group text-left"
                >
                  <span className="text-sm font-medium text-gray-700">{s.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {sortedYears[0]}–{sortedYears[sortedYears.length - 1]}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                      {s.count} yr{s.count !== 1 ? "s" : ""}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
                      className="group-hover:stroke-[#1a2a5e] transition flex-shrink-0">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </button>
              );
            })}
            {sorted.length > 5 && (
              <p className="text-[11px] text-center text-gray-400 pt-1">
                +{sorted.length - 5} more subjects
              </p>
            )}
          </div>
        )}

        {/* View all */}
        <button
          onClick={() => onSelect(examBody, null)}
          className={`mt-3 w-full py-2.5 rounded-xl text-white text-sm font-bold transition ${c.btn}`}
        >
          Browse {examBody} past questions →
        </button>
      </div>
    </div>
  );
}

export default function PastQuestions() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getPastQuestionsSummary()
      .then(({ summary: s }) => setSummary(s))
      .catch((err) => {
        const message = err.message || "Failed to load past questions.";
        toast.error(message);
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (examBody, subject) => {
    const params = new URLSearchParams({ examBody });
    if (subject) params.set("subject", subject);
    navigate(`/dashboard/past-question-browser?${params.toString()}`);
  };

  // Build a map: { examBody: { subjects, totalCount } }
  const examMap = {};
  for (const item of summary) {
    examMap[item._id] = {
      subjects:   item.subjects,
      totalCount: item.totalCount,
    };
  }

  // Show all exam bodies in a fixed order even if no data yet
  const EXAM_ORDER = ["JAMB", "WAEC", "NECO", "GCE", "Junior WAEC", "Other"];

  return (
    <div className="flex flex-col gap-7">

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#1a2a5e]">Past Questions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Practice with real exam questions from JAMB, WAEC, NECO and more.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-[#1a2a5e] rounded-2xl px-6 py-5 flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex-1">
          <p className="text-white font-bold text-sm mb-1">How past questions work</p>
          <p className="text-blue-200 text-xs leading-relaxed">
            Select an exam body, choose your subject and year, then open the past question
            right inside the app. After viewing, use the AI assistant to get explanations
            for any question.
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {["📄 Select exam & subject", "📅 Pick a year", "🤖 AI explains answers"].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span className="text-blue-200 text-xs">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-100" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Exam cards grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXAM_ORDER.map((examBody) => (
            <ExamCard
              key={examBody}
              examBody={examBody}
              subjects={examMap[examBody]?.subjects || []}
              totalCount={examMap[examBody]?.totalCount || 0}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Admin hint */}
      {/* <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">No past questions yet?</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Past questions are added by the admin through the Admin Panel.
            Go to Admin → Past Questions tab to upload PDF links with their exam body, subject and year.
          </p>
        </div>
      </div> */}
    </div>
  );
}