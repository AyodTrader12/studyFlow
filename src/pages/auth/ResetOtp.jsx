// src/pages/VerifyResetOtp.jsx
// STEP 2 of 3 — student enters the 6-digit OTP sent to their email.
// This page is ONLY for password reset OTP verification.
// On success → navigates to /reset-password passing email + verified token in state.

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resendOtp } from "../../api/UserApi";
import { StepIndicator } from "../auth/Forgotpassword";
import toast from 'react-hot-toast';
import logo from "../../assets/studylogo.png"


const BASE_URL         = import.meta.env.VITE_RENDER_URL;
const RESEND_COUNTDOWN = 60;

export default function VerifyResetOtp() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Email passed from ForgotPassword via router state
  const email = location.state?.email || "";

  const [digits,    setDigits]    = useState(["", "", "", "", "", ""]);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);

  const inputRefs = useRef([]);

  // Redirect back if no email in state
  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const focusInput = (idx) => inputRefs.current[idx]?.focus();

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...digits];
    next[idx]   = digit;
    setDigits(next);
    if (digit && idx < 5) focusInput(idx + 1);
    // Auto-submit when all 6 filled
    if (digit && idx === 5) {
      const code = [...next].join("");
      if (code.length === 6) handleVerify(code);
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx]  = "";
        setDigits(next);
      } else if (idx > 0) {
        focusInput(idx - 1);
        const next       = [...digits];
        next[idx - 1]    = "";
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
    focusInput(Math.min(pasted.length, 5));
    if (pasted.length === 6) handleVerify(pasted);
  };

  // Verify the OTP against the backend
  // We call POST /api/auth/verify-reset-otp which only checks the code
  // WITHOUT changing the password — it returns a short-lived token
  // proving the OTP was valid, then we use that on the reset page.
  const handleVerify = async (code) => {
    if (loading) return;
    const otp = (code || digits.join("")).trim();
    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-reset-otp`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Incorrect code. Please try again.");
        setDigits(["", "", "", "", "", ""]);
        focusInput(0);
        return;
      }

      // OTP verified — move to reset password page
      // Pass resetToken (a short-lived JWT) so the reset page can prove
      // the OTP was already verified
      navigate("/auth/reset-password", {
        state: {
          email,
          resetToken: data.resetToken,
        },
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await resendOtp({ email, purpose: "reset" });
      setCountdown(RESEND_COUNTDOWN);
      setDigits(["", "", "", "", "", ""]);
      focusInput(0);
    } catch (err) {
      toast.error("Failed to resend. Please try again.");
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

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1a2a5e] text-center mb-2">
            Enter your code
          </h1>
          <p className="text-gray-500 text-sm text-center mb-1 leading-relaxed">
            We sent a 6-digit code to
          </p>
          <p className="text-[#1a2a5e] font-bold text-sm text-center mb-5 break-all">
            {email}
          </p>

          {/* Step indicator — Step 2 active */}
          <StepIndicator active={1} />

          {/* 6 OTP boxes */}
          <div className="flex justify-center gap-2.5 mb-5" onPaste={handlePaste}>
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
                autoComplete="one-time-code"
                autoFocus={idx === 0}
                className={`w-11 h-13 text-center text-xl font-extrabold rounded-xl border-2
                            outline-none transition-all
                            ${digit
                              ? "border-[#1a2a5e] bg-[#f0f3fa] text-[#1a2a5e]"
                              : "border-gray-200 bg-white text-gray-700"
                            }
                            focus:border-[#1a2a5e] focus:bg-[#f0f3fa]`}
                style={{ height: "52px" }}
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            onClick={() => handleVerify("")}
            disabled={!allFilled || loading}
            className="w-full py-3.5 rounded-xl bg-[#1a2a5e] hover:bg-[#14234d]
                       text-white font-bold text-sm transition active:scale-[0.98]
                       disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Verifying...
              </span>
            ) : "Verify Code"}
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
                className="text-sm text-[#3b6fd4] font-semibold hover:underline
                           disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          {/* Back link */}
          <div className="text-center mt-4">
            <Link to="/forgot-password"
              className="text-xs text-gray-400 hover:text-gray-600 transition">
              ← Try a different email
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Code expires in 10 minutes. Check your spam folder if you don't see it.
        </p>
      </div>
    </div>
  );
}