// src/pages/PastQuestionViewer.jsx
// Opens a past question PDF inside the app.
// Gemini AI panel: explain answers, generate similar questions, exam tips.

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPastQuestion } from "../../api/pastQuestionApi";

const EXAM_META = {
  "JAMB":           { emoji: "🎓" },
  "WAEC":           { emoji: "📋" },
  "NECO":           { emoji: "📝" },
  "GCE":            { emoji: "🏅" },
  "Junior WAEC":    { emoji: "📗" },
  "Common Entrance":{ emoji: "✏️" },
  "Other":          { emoji: "📄" },
};

// ── Gemini AI assistant panel ─────────────────────────────────────────────────
function AIPanel({ question }) {
  const [mode,      setMode]      = useState(null); // "explain" | "generate" | "tips" | "summary"
  const [prompt,    setPrompt]    = useState("");
  const [response,  setResponse]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const MODES = [
    {
      key:   "explain",
      label: "Explain a question",
      icon:  "💡",
      desc:  "Paste a question and I'll explain the correct answer step by step",
      placeholder: "Paste a question from the paper here, e.g. 'Which of the following is the formula for water? A) CO2 B) H2O C) NaCl'",
    },
    {
      key:   "generate",
      label: "Generate similar questions",
      icon:  "🔄",
      desc:  "I'll create practice questions similar to this exam paper",
      placeholder: "Tell me the topic you want practice questions on, e.g. 'Quadratic equations' or 'Photosynthesis'",
    },
    {
      key:   "tips",
      label: "Exam tips",
      icon:  "🎯",
      desc:  "Get exam strategy tips for this paper",
      placeholder: "Ask about exam strategy, e.g. 'How should I approach the comprehension section?' or 'What topics appear most in WAEC Chemistry?'",
    },
    {
      key:   "summary",
      label: "Topic summary",
      icon:  "📋",
      desc:  "Get a quick summary of a topic in this paper",
      placeholder: "Enter a topic from the paper, e.g. 'Cell division' or 'Nigerian independence'",
    },
  ];

  const activeMode = MODES.find((m) => m.key === mode);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResponse("");

    try {
      // Build a context-aware prompt
      const systemPrompt = `You are a helpful tutor for Nigerian secondary school students.
    The student is studying ${question.subject} using the ${question.examBody} ${question.year} past question paper.
    The exam is at ${question.level} level.
    Be concise, clear, and appropriate for the Nigerian secondary school curriculum.`;

      let userPrompt = "";
      if (mode === "explain") {
        userPrompt = `A student needs help understanding this exam question:\n\n${prompt}\n\nPlease:\n1. Identify the correct answer\n2. Explain WHY it is correct step by step\n3. Explain why the other options are wrong (if multiple choice)\n4. Give a tip to remember this concept`;
      } else if (mode === "generate") {
        userPrompt = `Generate 5 exam-style practice questions on the topic: "${prompt}" for ${question.examBody} ${question.subject} at ${question.level} level.\n\nFor each question:\n- Write the question clearly\n- Provide 4 options (A, B, C, D) if multiple choice\n- Mark the correct answer\n- Give a brief explanation`;
      } else if (mode === "tips") {
        userPrompt = `${prompt}\n\nContext: ${question.examBody} ${question.subject} ${question.year} past question paper at ${question.level} level.`;
      } else if (mode === "summary") {
        userPrompt = `Give me a concise study summary of "${prompt}" as it appears in ${question.examBody} ${question.subject} exams in Nigeria.\n\nInclude:\n1. Key definitions\n2. Important facts to memorise\n3. Common exam questions on this topic\n4. Tips for answering these questions`;
      }

      const res = await fetch(`${import.meta.env.VITE_RENDER_URL}/api/ai/ask`, {
        method:  "POST",
        credentials: "include",
        headers: {
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "AI request failed");
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
            <path d="M22 2 16 8"/><path d="m22 8-6-6"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a2a5e]">AI Study Assistant</p>
          <p className="text-[10px] text-gray-400">Powered by Gemini</p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setResponse(""); setError(""); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition ${
                mode === m.key
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-purple-200"
              }`}
            >
              <span className="text-base flex-shrink-0">{m.icon}</span>
              <span className="text-xs font-medium leading-snug">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Prompt area */}
        {mode && (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-2">{activeMode?.desc}</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeMode?.placeholder}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-purple-300 transition resize-none"
              />
            </div>

            <button
              onClick={handleAsk}
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Thinking...
                </span>
              ) : "Ask AI →"}
            </button>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs font-bold text-purple-700 mb-2">AI Response</p>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {response}
            </div>
            <button
              onClick={() => { setResponse(""); setPrompt(""); }}
              className="mt-3 text-xs text-purple-500 hover:text-purple-700 font-medium"
            >
              Ask another question
            </button>
          </div>
        )}

        {/* Empty state */}
        {!mode && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Choose a mode above to get AI help with this past question paper.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main viewer ───────────────────────────────────────────────────────────────
export default function PastQuestionViewer() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    getPastQuestion(id)
      .then(({ question: q }) => setQuestion(q))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const embedUrl = question?.fileUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(question.fileUrl)}&embedded=true`
    : null;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (error || !question) return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-red-500 text-sm">{error || "Past question not found."}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-[#1a2a5e] font-semibold hover:underline">
        ← Go back
      </button>
    </div>
  );

  const meta = EXAM_META[question.examBody] || EXAM_META["Other"];

  return (
    <div className="flex flex-col gap-5">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2a5e] transition w-fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </button>

      {/* Meta */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-3xl">{meta.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {question.examBody}
              </span>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {question.subject}
              </span>
              <span className="text-[10px] font-bold bg-[#1a2a5e] text-white px-2 py-0.5 rounded-full">
                {question.year}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#1a2a5e] leading-snug">{question.title}</h1>
            {question.description && (
              <p className="text-sm text-gray-500 mt-1">{question.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
              {question.duration    && <span>⏱ {question.duration}</span>}
              {question.totalMarks  > 0 && <span>📊 {question.totalMarks} marks</span>}
              {question.views       > 0 && <span>👁 {question.views} views</span>}
            </div>
          </div>

          {/* Direct PDF link fallback */}
          <a href={question.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#1a2a5e] hover:text-[#1a2a5e] transition flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open PDF
          </a>
        </div>
      </div>

      {/* Two-column layout: PDF + AI panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* PDF viewer — takes 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          style={{ height: "80vh", minHeight: "500px" }}>
          {iframeLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <svg className="animate-spin h-8 w-8 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-xs text-gray-400">Loading past question paper...</p>
            </div>
          )}
          <iframe
            src={embedUrl}
            title={question.title}
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
            style={{ display: iframeLoading ? "none" : "block" }}
          />
        </div>

        {/* AI panel — takes 1/3 */}
        <div className="flex flex-col gap-4">
          <AIPanel question={question} />
        </div>
      </div>
    </div>
  );
}