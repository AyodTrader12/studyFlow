// src/pages/NotFound404.jsx
// 404 — Page Not Found
// Mini-game: unscramble a Nigerian secondary school subject name.
// Solving it unlocks a navigation hint.

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/studylogo.png"
const WORDS = [
  { word: "MATHEMATICS",   hint: "Numbers, algebra, calculus" },
  { word: "BIOLOGY",       hint: "Study of living things" },
  { word: "CHEMISTRY",     hint: "Elements and reactions" },
  { word: "PHYSICS",       hint: "Forces, energy, motion" },
  { word: "ECONOMICS",     hint: "Supply, demand, markets" },
  { word: "GEOGRAPHY",     hint: "Maps, climate, continents" },
  { word: "LITERATURE",    hint: "Novels, poetry, drama" },
  { word: "GOVERNMENT",    hint: "Politics and governance" },
  { word: "AGRICULTURE",   hint: "Farming and food science" },
];

function scramble(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Make sure scrambled is always different from original
  const result = arr.join("");
  return result === word ? scramble(word) : result;
}

export default function NotFound404() {
  const navigate = useNavigate();

  const [current,   setCurrent]   = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [scrambled, setScrambled] = useState("");
  const [input,     setInput]     = useState("");
  const [status,    setStatus]    = useState("playing"); // "playing" | "correct" | "wrong"
  const [attempts,  setAttempts]  = useState(0);
  const [shake,     setShake]     = useState(false);

  const newWord = useCallback(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrent(w);
    setScrambled(scramble(w.word));
    setInput("");
    setStatus("playing");
    setAttempts(0);
  }, []);

  useEffect(() => {
    setScrambled(scramble(current.word));
  }, [current]);

  const handleGuess = () => {
    if (!input.trim()) return;
    const guess = input.trim().toUpperCase();

    if (guess === current.word) {
      setStatus("correct");
    } else {
      setAttempts((a) => a + 1);
      setStatus("wrong");
      setShake(true);
      setTimeout(() => { setShake(false); setStatus("playing"); setInput(""); }, 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGuess();
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

        {/* Error card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Top section */}
          <div className="bg-[#1a2a5e] px-8 py-8 text-center">
            <p className="text-8xl font-extrabold text-white/10 leading-none select-none">404</p>
            <p className="text-white font-bold text-xl mt-1">Page not found</p>
            <p className="text-blue-200 text-sm mt-2 leading-relaxed">
              This page doesn't exist — but you found a study challenge!
            </p>
          </div>

          {/* Game section */}
          <div className="px-7 py-6">

            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔤</span>
              <p className="text-sm font-bold text-[#1a2a5e]">Unscramble the subject name</p>
            </div>

            {/* Scrambled word display */}
            <div className={`flex justify-center gap-2 mb-5 flex-wrap ${shake ? "animate-bounce" : ""}`}>
              {scrambled.split("").map((letter, i) => (
                <div
                  key={i}
                  className="w-9 h-10 rounded-xl bg-[#f0f3fa] border-2 border-blue-100 flex items-center justify-center text-base font-extrabold text-[#1a2a5e] tracking-widest select-none"
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Hint */}
            <p className="text-center text-xs text-gray-400 mb-4">
              💡 Hint: {current.hint}
            </p>

            {status !== "correct" ? (
              <>
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    maxLength={current.word.length + 2}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-center tracking-widest outline-none transition ${
                      status === "wrong"
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-gray-200 bg-gray-50 text-[#1a2a5e] focus:border-[#1a2a5e]/40 focus:bg-white"
                    }`}
                    autoFocus
                  />
                </div>

                {status === "wrong" && (
                  <p className="text-center text-xs text-red-500 mb-3">
                    Not quite! Try again. {attempts >= 3 ? `(${current.word.length} letters)` : ""}
                  </p>
                )}

                <button
                  onClick={handleGuess}
                  disabled={!input.trim()}
                  className="w-full py-3 rounded-xl bg-[#1a2a5e] text-white font-bold text-sm hover:bg-[#14234d] transition active:scale-[0.98] disabled:opacity-50"
                >
                  Check Answer
                </button>

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={newWord}
                    className="text-xs text-gray-400 hover:text-gray-600 transition"
                  >
                    Try a different word
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="text-xs text-[#3b6fd4] font-semibold hover:underline"
                  >
                    Skip to home →
                  </button>
                </div>
              </>
            ) : (
              /* Correct state */
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3 text-3xl">
                  🎉
                </div>
                <p className="text-base font-extrabold text-[#1a2a5e] mb-1">
                  Correct! It's <span className="text-green-600">{current.word}</span>
                </p>
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                  You clearly belong here. Let's get you back on track.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition active:scale-[0.98]"
                  >
                    Go to Dashboard →
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    Go back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex justify-center gap-4 mt-5">
          {[
            { label: "Home",      path: "/" },
            { label: "Dashboard", path: "/dashboard" },
            { label: "Resources", path: "/dashboard/resources" },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
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
