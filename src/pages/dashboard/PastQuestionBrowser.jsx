// src/pages/PastQuestionsBrowser.jsx
// Shows available years for a given exam body + subject.
// Reached from PastQuestionsPage after clicking an exam card.

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPastQuestions } from "../../api/pastQuestionApi";
import { SUBJECTS } from "../../utils/Resourceutils";

const EXAM_META = {
  "JAMB":           { emoji: "🎓", color: "bg-blue-50 text-blue-700 border-blue-200" },
  "WAEC":           { emoji: "📋", color: "bg-green-50 text-green-700 border-green-200" },
  "NECO":           { emoji: "📝", color: "bg-purple-50 text-purple-700 border-purple-200" },
  "GCE":            { emoji: "🏅", color: "bg-orange-50 text-orange-700 border-orange-200" },
  "Junior WAEC":    { emoji: "📗", color: "bg-teal-50 text-teal-700 border-teal-200" },
  // "Common Entrance":{ emoji: "✏️", color: "bg-pink-50 text-pink-700 border-pink-200" },
  "Other":          { emoji: "📄", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

function YearCard({ question, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 text-left group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-3xl font-extrabold text-[#1a2a5e] group-hover:text-[#3b6fd4] transition">
          {question.year}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[#f0f3fa] flex items-center justify-center group-hover:bg-[#1a2a5e] transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#1a2a5e" strokeWidth="2" strokeLinecap="round"
            className="group-hover:stroke-white transition">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700 line-clamp-1">{question.title}</p>
      <div className="flex items-center gap-2 mt-2">
        {question.duration && (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            ⏱ {question.duration}
          </span>
        )}
        {question.totalMarks > 0 && (
          <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
            {question.totalMarks} marks
          </span>
        )}
        {question.views > 0 && (
          <span className="text-[10px] text-gray-400">
            {question.views} views
          </span>
        )}
      </div>
    </button>
  );
}

export default function PastQuestionsBrowser() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  const examBodyParam = searchParams.get("examBody") || "";
  const subjectParam  = searchParams.get("subject")  || "All Subjects";

  const [questions,     setQuestions]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [activeSubject, setActiveSubject] = useState(subjectParam || "All Subjects");

  const meta = EXAM_META[examBodyParam] || EXAM_META["Other"];

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { questions: q } = await getPastQuestions({
          examBody: examBodyParam !== "All" ? examBodyParam : undefined,
          subject:  activeSubject !== "All Subjects" ? activeSubject : undefined,
        });
        setQuestions(q);
      } catch (err) {
        const message = err.message || "Failed to load past questions.";
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [examBodyParam, activeSubject]);

  // Group by subject if viewing all subjects
  const grouped = questions.reduce((acc, q) => {
    const key = q.subject;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">

      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate("/dashboard/past-questions")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2a5e] transition mb-3"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Past Questions
        </button>

        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1a2a5e]">{examBodyParam} Past Questions</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {loading ? "Loading..." : `${questions.length} paper${questions.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>
      </div>

      {/* Subject filter */}
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
              activeSubject === s
                ? "bg-[#1a2a5e] border-[#1a2a5e] text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-[#1a2a5e]/40"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-8 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p className="text-center text-red-500 text-sm py-10">{error}</p>
      )}

      {/* Empty */}
      {!loading && !error && questions.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center gap-4">
          <div className="text-5xl">📭</div>
          <p className="text-base font-bold text-[#1a2a5e]">No past questions yet</p>
          <p className="text-sm text-gray-400 max-w-xs">
            {activeSubject !== "All Subjects"
              ? `No ${examBodyParam} past questions for ${activeSubject} have been uploaded yet.`
              : `No ${examBodyParam} past questions have been uploaded yet.`
            }
          </p>
        </div>
      )}

      {/* Questions — grouped by subject if viewing all */}
      {!loading && !error && questions.length > 0 && (
        activeSubject !== "All Subjects" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {questions
              .sort((a, b) => b.year - a.year)
              .map((q) => (
                <YearCard
                  key={q._id}
                  question={q}
                  onClick={() => navigate(`/dashboard/past-question-viewer/${q._id}`)}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).map(([subject, items]) => (
              <div key={subject}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-bold text-[#1a2a5e]">{subject}</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {items.length} year{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {items.sort((a, b) => b.year - a.year).map((q) => (
                    <YearCard
                      key={q._id}
                      question={q}
                      onClick={() => navigate(`/dashboard/past-question-viewer/${q._id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}