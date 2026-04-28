// src/pages/VerifyOtp.jsx
// The page students land on after signing up.
// 6 individual input boxes — one digit per box.
// Features: auto-advance, backspace, paste support, resend countdown.

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../api/UserApi";
import toast from 'react-hot-toast';
import logo from "../../assets/studylogo.png"

const RESEND_COUNTDOWN = 60; // seconds before resend is available

export default function Verify() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Email and name passed from SignUp via navigate state
  const email = location.state?.email || "";
  const name  = location.state?.name  || "Student";

  const [digits,     setDigits]     = useState(["", "", "", "", "", ""]);
  const [loading,    setLoading]    = useState(false);
  const [resending,  setResending]  = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [countdown,  setCountdown]  = useState(RESEND_COUNTDOWN);

  const inputRefs = useRef([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Redirect to signup if no email in state
  useEffect(() => {
    if (!email) navigate("/auth/login", { replace: true });
  }, [email, navigate]);

  const focusInput = (idx) => {
    inputRefs.current[idx]?.focus();
  };

  const handleChange = (idx, val) => {
    // Accept only digits
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...digits];
    next[idx]   = digit;
    setDigits(next);
    setError("");

    // Auto-advance to next box
    if (digit && idx < 5) focusInput(idx + 1);

    // Auto-submit when all 6 digits filled
    if (digit && idx === 5) {
      const code = [...next].join("");
      if (code.length === 6) handleVerify(code);
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        // Clear current box
        const next = [...digits];
        next[idx]  = "";
        setDigits(next);
      } else if (idx > 0) {
        // Move to previous box
        focusInput(idx - 1);
        const next = [...digits];
        next[idx - 1] = "";
        setDigits(next);
      }
    }
    if (e.key === "ArrowLeft"  && idx > 0) focusInput(idx - 1);
    if (e.key === "ArrowRight" && idx < 5) focusInput(idx + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setDigits(next);
    // Focus the last filled box
    focusInput(Math.min(pasted.length, 5));
    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (code) => {
    if (loading) return;
    const otp = (code || digits.join("")).trim();
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await verifyOtp({ email, otp });
      setSuccess("OTP verified! Redirecting to reset password...");
      setTimeout(() => navigate("/auth/reset-password", { state: { verified: true, email, otp } }), 1500);
    } catch (err) {
      toast.error(err.message || "Verification failed. Please try again.");
      // Clear digits on error so student can re-enter
      setDigits(["", "", "", "", "", ""]);
      focusInput(0);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await resendOtp({ email, purpose: "reset" });
      setCountdown(RESEND_COUNTDOWN);
      setDigits(["", "", "", "", "", ""]);
      focusInput(0);
      setSuccess("A new code has been sent to your email.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      toast.error(err.message || "Failed to resend.");
    } finally {
      setResending(false);
    }
  };

  const allFilled = digits.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-[#f0f3fa] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <img 
          src={logo} 
          alt="StudyFlow Logo" 
          className="h-12 w-auto"  
        />
      </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-8">

          {/* Email icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a2a5e" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1a2a5e] text-center mb-2">
            Verify Your Password Reset
          </h1>
          <p className="text-gray-500 text-sm text-center mb-1 leading-relaxed">
            We sent a 6-digit reset code to
          </p>
          <p className="text-[#1a2a5e] font-bold text-sm text-center mb-6 break-all">
            {email}
          </p>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium text-center">
              {success}
            </div>
          )}

          {/* 6 OTP boxes */}
          <div
            className="flex justify-center gap-2 sm:gap-3 mb-6"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onFocus={(e) => e.target.select()}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold rounded-xl border-2 outline-none transition
                  ${digit
                    ? "border-[#1a2a5e] bg-[#f0f3fa] text-[#1a2a5e]"
                    : "border-gray-200 bg-white text-gray-700"
                  }
                  focus:border-[#1a2a5e] focus:bg-[#f0f3fa]
                  ${error ? "border-red-300 bg-red-50" : ""}
                `}
                autoComplete="one-time-code"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            onClick={() => handleVerify("")}
            disabled={!allFilled || loading}
            className="w-full py-3.5 rounded-xl bg-[#1a2a5e] hover:bg-[#14234d] text-white font-bold text-sm transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Verifying...
              </span>
            ) : "Verify otp"}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Didn't receive the code?</p>
            {countdown > 0 ? (
              <p className="text-xs text-gray-400">
                Resend available in{" "}
                <span className="font-bold text-[#1a2a5e]">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-[#3b6fd4] font-semibold hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          {/* Back to forgot password */}
          <div className="text-center mt-4">
            <Link
              to="auth/forgot-password"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              ← Back to forgot password
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          The code expires in 10 minutes. Check your spam folder if you don't see it.
        </p>
      </div>
    </div>
  );
}