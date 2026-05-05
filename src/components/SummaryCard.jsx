// src/components/SummaryCard.jsx
// Shown below a resource after the student has viewed it.
// Fetches a cached Gemini summary or lets the student generate one.
import { useSummary } from "../hook/UseApi";

export default function SummaryCard({ resourceId, subject }) {
  const { summary, loading, generating, generate } = useSummary(resourceId);

  if (loading) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-5">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
              <path d="M22 2 16 8"/><path d="m22 8-6-6"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1a2a5e]">AI Study Summary</p>
            <p className="text-[10px] text-gray-400">Powered by Gemini</p>
          </div>
        </div>

        {!summary && !generating && (
          <button
            onClick={generate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a2a5e] text-white text-xs font-bold hover:bg-[#14234d] transition active:scale-95"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="13 2 13 9 20 9"/><path d="M11 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2v-7"/>
            </svg>
            Generate Summary
          </button>
        )}
      </div>

      {/* Generating */}
      {generating && (
        <div className="px-6 py-8 flex flex-col items-center gap-3 text-center">
          <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-gray-500">Gemini is reading and summarising this resource...</p>
          <p className="text-xs text-gray-400">This takes about 5–10 seconds</p>
        </div>
      )}

      {/* Empty state */}
      {!summary && !generating && (
        <div className="px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#1a2a5e] mb-1">No summary yet</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Click "Generate Summary" to get an AI breakdown of this {subject} lesson
            — key points and exam questions included.
          </p>
        </div>
      )}

      {/* Summary content */}
      {summary && !generating && (
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Summary text */}
          <div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Summary</p>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
          </div>

          {/* Key points */}
          {summary.keyPoints.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#1a2a5e] uppercase tracking-widest mb-2">Key Points</p>
              <ul className="flex flex-col gap-2">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-[#1a2a5e] text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exam questions */}
          {summary.examQuestions.length > 0 && (
            <div className="bg-[#f5f7fc] rounded-xl p-4">
              <p className="text-xs font-bold text-[#1a2a5e] uppercase tracking-widest mb-3">
                Practice Questions
              </p>
              <ol className="flex flex-col gap-3">
                {summary.examQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-[#1a2a5e]">{i + 1}. </span>{q}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-gray-400">
              Generated {new Date(summary.generatedAt).toLocaleDateString()}
            </p>
            <button
              onClick={generate}
              className="text-[10px] text-gray-400 hover:text-[#1a2a5e] transition font-medium flex items-center gap-1"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}