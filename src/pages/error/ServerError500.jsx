// src/pages/ServerError500.jsx
// 500 — Server Error
// Mini-game: click the flashing book icon before it disappears to "restart the server".
// Three rounds. Win all three → "server restarted" → navigation options.

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/studylogo.png"
const ROUNDS_TO_WIN = 3;
const BASE_VISIBLE_MS = 1400; // book visible for this long
const BASE_DELAY_MS   = 800;  // delay before it appears

export default function ServerError500() {
  const navigate = useNavigate();

  const [phase,      setPhase]      = useState("intro"); // "intro"|"waiting"|"click"|"success"|"fail"|"win"
  const [round,      setRound]      = useState(0);
  const [score,      setScore]      = useState(0);
  const [countdown,  setCountdown]  = useState(3);
  const [flash,      setFlash]      = useState(false); // book flashing state
  const [reactionMs, setReactionMs] = useState(null);
  const [bestMs,     setBestMs]     = useState(null);

  const appearTime  = useRef(null);
  const visibleRef  = useRef(null);
  const countRef    = useRef(null);

  const clearTimers = () => {
    clearTimeout(visibleRef.current);
    clearInterval(countRef.current);
  };

  const startRound = useCallback((roundNum) => {
    setPhase("waiting");
    setFlash(false);

    // Randomise delay slightly so you can't pattern-guess
    const delay = BASE_DELAY_MS + Math.random() * 600;

    visibleRef.current = setTimeout(() => {
      setPhase("click");
      setFlash(true);
      appearTime.current = Date.now();

      // Auto-fail if not clicked in time
      visibleRef.current = setTimeout(() => {
        setFlash(false);
        setPhase("fail");
      }, BASE_VISIBLE_MS - roundNum * 80); // gets slightly harder each round
    }, delay);
  }, []);

  const handleClick = () => {
    if (phase !== "click") return;
    clearTimers();
    const ms = Date.now() - appearTime.current;
    setReactionMs(ms);
    setBestMs((prev) => (prev === null ? ms : Math.min(prev, ms)));
    setFlash(false);

    const newScore = score + 1;
    setScore(newScore);

    if (newScore >= ROUNDS_TO_WIN) {
      setPhase("win");
    } else {
      setPhase("success");
    }
  };

  const startCountdown = () => {
    setPhase("counting");
    setScore(0);
    setRound(1);
    setCountdown(3);
    let c = 3;
    countRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) {
        clearInterval(countRef.current);
        startRound(0);
      }
    }, 1000);
  };

  const nextRound = () => {
    const next = round + 1;
    setRound(next);
    startRound(next - 1);
  };

  useEffect(() => () => clearTimers(), []);

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
          <div className="bg-amber-500 px-8 py-7 text-center">
            <div className="text-6xl font-extrabold text-white/10 leading-none select-none">500</div>
            <p className="text-white font-bold text-xl mt-1">Something went wrong</p>
            <p className="text-amber-100 text-sm mt-2 leading-relaxed">
              Our server hit a snag. Help us restart it — click the book when it flashes!
            </p>
          </div>

          <div className="px-7 py-7 text-center">

            {/* ── Intro ── */}
            {phase === "intro" && (
              <>
                <div className="text-6xl mb-5 select-none">📚</div>
                <p className="text-sm font-bold text-[#1a2a5e] mb-2">Reaction Speed Challenge</p>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  The book will flash {ROUNDS_TO_WIN} times. Click it each time before it disappears
                  to restart the server. Don't click too early!
                </p>
                <button
                  onClick={startCountdown}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition active:scale-[0.98]"
                >
                  Start Game
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
                >
                  Just take me home
                </button>
              </>
            )}

            {/* ── Countdown ── */}
            {phase === "counting" && (
              <>
                <p className="text-xs text-gray-400 mb-3">Get ready...</p>
                <div className="text-8xl font-extrabold text-[#1a2a5e] transition-all">
                  {countdown === 0 ? "GO!" : countdown}
                </div>
              </>
            )}

            {/* ── Waiting ── */}
            {phase === "waiting" && (
              <>
                <p className="text-xs text-gray-400 mb-4">Round {round} of {ROUNDS_TO_WIN}</p>
                <div className="text-6xl mb-4 opacity-20 select-none">📚</div>
                <p className="text-sm text-gray-400">Wait for it...</p>
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: ROUNDS_TO_WIN }, (_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < score ? "bg-green-500" : "bg-gray-200"}`} />
                  ))}
                </div>
              </>
            )}

            {/* ── Click now! ── */}
            {phase === "click" && (
              <>
                <p className="text-xs font-bold text-amber-600 mb-3 animate-pulse">CLICK NOW!</p>
                <button
                  onClick={handleClick}
                  className={`text-7xl mb-4 select-none transition-transform active:scale-90 cursor-pointer hover:scale-110 ${
                    flash ? "animate-bounce" : ""
                  }`}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  📚
                </button>
                <p className="text-xs text-gray-400">Round {round} of {ROUNDS_TO_WIN}</p>
                <div className="flex justify-center gap-2 mt-3">
                  {Array.from({ length: ROUNDS_TO_WIN }, (_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < score ? "bg-green-500" : "bg-gray-200"}`} />
                  ))}
                </div>
              </>
            )}

            {/* ── Hit ── */}
            {phase === "success" && (
              <>
                <div className="text-5xl mb-3">✅</div>
                <p className="text-base font-bold text-green-600 mb-1">Hit! +1</p>
                <p className="text-xs text-gray-400 mb-1">
                  Reaction time: <span className="font-bold text-[#1a2a5e]">{reactionMs}ms</span>
                </p>
                {bestMs && (
                  <p className="text-[10px] text-gray-300 mb-4">Best: {bestMs}ms</p>
                )}
                <div className="flex justify-center gap-2 mb-4">
                  {Array.from({ length: ROUNDS_TO_WIN }, (_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < score ? "bg-green-500" : "bg-gray-200"}`} />
                  ))}
                </div>
                <button
                  onClick={nextRound}
                  className="w-full py-3 rounded-xl bg-[#1a2a5e] text-white font-bold text-sm hover:bg-[#14234d] transition"
                >
                  Next round →
                </button>
              </>
            )}

            {/* ── Missed ── */}
            {phase === "fail" && (
              <>
                <div className="text-5xl mb-3">💥</div>
                <p className="text-base font-bold text-red-600 mb-1">Too slow!</p>
                <p className="text-xs text-gray-400 mb-5">The book disappeared. Let's try again.</p>
                <button
                  onClick={startCountdown}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition"
                >
                  Try again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
                >
                  Just take me home
                </button>
              </>
            )}

            {/* ── Win ── */}
            {phase === "win" && (
              <>
                <div className="text-5xl mb-3">🚀</div>
                <p className="text-xl font-extrabold text-[#1a2a5e] mb-1">Server restarted!</p>
                <p className="text-xs text-gray-400 mb-1">
                  You did it in {ROUNDS_TO_WIN} rounds.
                  {bestMs && ` Best reaction: ${bestMs}ms`}
                </p>
                {bestMs && bestMs < 400 && (
                  <p className="text-xs font-bold text-amber-600 mb-4">⚡ Lightning fast!</p>
                )}
                {bestMs && bestMs >= 400 && (
                  <p className="text-xs text-gray-400 mb-4">Keep practising — you'll get faster!</p>
                )}
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-3 rounded-xl bg-[#1a2a5e] hover:bg-[#14234d] text-white font-bold text-sm transition active:scale-[0.98]"
                  >
                    Back to Dashboard →
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
                  >
                    Reload page
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex justify-center gap-4 mt-5">
          {[
            { label: "Home",      path: "/" },
            { label: "Dashboard", path: "/dashboard" },
            { label: "Reload",    action: () => window.location.reload() },
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
