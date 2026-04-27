// src/pages/Forbidden403.jsx
// 403 — Access Denied
// Mini-game: answer a Nigerian secondary school trivia question.
// Get it right → "access granted" and redirect.

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/studylogo.png"

const QUESTIONS = [
  {
    q:       "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    answer:  "Au",
    subject: "Chemistry",
  },
  {
    q:       "How many chambers does the human heart have?",
    options: ["2", "3", "4", "5"],
    answer:  "4",
    subject: "Biology",
  },
  {
    q:       "What is the value of π (pi) to 2 decimal places?",
    options: ["3.12", "3.14", "3.16", "3.18"],
    answer:  "3.14",
    subject: "Mathematics",
  },
  {
    q:       "In which year did Nigeria gain independence?",
    options: ["1957", "1960", "1963", "1967"],
    answer:  "1960",
    subject: "Government",
  },
  {
    q:       "What is the speed of light (approximately)?",
    options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁴ m/s", "3×10¹⁰ m/s"],
    answer:  "3×10⁸ m/s",
    subject: "Physics",
  },
  {
    q:       "Which gas do plants absorb during photosynthesis?",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
    answer:  "Carbon dioxide",
    subject: "Biology",
  },
  {
    q:       "What is the capital of Nigeria?",
    options: ["Lagos", "Kano", "Abuja", "Ibadan"],
    answer:  "Abuja",
    subject: "Geography",
  },
  {
    q:       "What does GDP stand for?",
    options: [
      "Gross Domestic Product",
      "General Domestic Production",
      "Gross Development Plan",
      "General Development Product",
    ],
    answer:  "Gross Domestic Product",
    subject: "Economics",
  },
];

export default function Forbidden403() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState(
    () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  );
  const [selected, setSelected] = useState(null);
  const [status,   setStatus]   = useState("playing"); // "playing" | "correct" | "wrong"
  const [streak,   setStreak]   = useState(0);

  const nextQuestion = useCallback(() => {
    const next = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setQuestion(next);
    setSelected(null);
    setStatus("playing");
  }, []);

  const handleSelect = (option) => {
    if (status !== "playing") return;
    setSelected(option);
    if (option === question.answer) {
      setStatus("correct");
      setStreak((s) => s + 1);
    } else {
      setStatus("wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3fa] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
     <div className="flex items-center justify-center gap-2 mb-8">
       <img 
         src={logo} 
         alt="StudyFlow Logo" 
         className="h-12 w-auto"
       />
     
     </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-red-600 px-8 py-7 text-center">
            <div className="text-6xl font-extrabold text-white/10 leading-none select-none">403</div>
            <p className="text-white font-bold text-xl mt-1">Access Denied</p>
            <p className="text-red-200 text-sm mt-2 leading-relaxed">
              You don't have permission to view this page.
              Prove your knowledge to earn your way back!
            </p>
          </div>

          <div className="px-7 py-6">

            {streak > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-4">
                <span className="text-base">🔥</span>
                <p className="text-xs font-bold text-orange-700">
                  {streak} correct answer{streak !== 1 ? "s" : ""} in a row!
                </p>
              </div>
            )}

            {/* Subject badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                {question.subject}
              </span>
              <p className="text-sm font-bold text-[#1a2a5e]">Quiz Challenge</p>
            </div>

            {/* Question */}
            <div className="bg-[#f0f3fa] rounded-2xl px-4 py-4 mb-4">
              <p className="text-sm font-semibold text-[#1a2a5e] leading-relaxed">
                {question.q}
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2 mb-4">
              {question.options.map((option) => {
                let style = "border-gray-200 bg-white text-gray-700 hover:border-[#1a2a5e]/30";
                if (selected === option) {
                  if (status === "correct") style = "border-green-400 bg-green-50 text-green-700";
                  else style = "border-red-400 bg-red-50 text-red-700";
                } else if (status !== "playing" && option === question.answer) {
                  style = "border-green-400 bg-green-50 text-green-700";
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    disabled={status !== "playing"}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-left transition ${style} disabled:cursor-default`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {status === "correct" && (
              <div className="text-center">
                <p className="text-base font-extrabold text-green-600 mb-1">✓ Correct!</p>
                <p className="text-xs text-gray-400 mb-4">Access unlocked. You clearly belong here.</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition active:scale-[0.98]"
                  >
                    Go to Dashboard →
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    Try another question
                  </button>
                </div>
              </div>
            )}

            {status === "wrong" && (
              <div className="text-center">
                <p className="text-sm font-bold text-red-600 mb-1">✗ Not quite!</p>
                <p className="text-xs text-gray-400 mb-3">
                  The correct answer was: <span className="font-semibold text-[#1a2a5e]">{question.answer}</span>
                </p>
                <button
                  onClick={nextQuestion}
                  className="w-full py-3 rounded-xl bg-[#1a2a5e] text-white font-bold text-sm hover:bg-[#14234d] transition"
                >
                  Try a different question
                </button>
              </div>
            )}

            {status === "playing" && (
              <p className="text-center text-xs text-gray-400">
                Select the correct answer above
              </p>
            )}

          </div>
        </div>

        {/* Links */}
        <div className="flex justify-center gap-4 mt-5">
          {[
            { label: "Home",  path: "/" },
            { label: "Login", path: "/auth/login" },
            { label: "Back",  action: () => navigate(-1) },
          ].map(({ label, path, action }) => (
            <button
              key={label}
              onClick={action || (() => navigate(path))}
              className="text-xs text-gray-400 hover:text-[#1a2a5e] transition font-medium"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
