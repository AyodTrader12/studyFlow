// src/pages/ResetPassword.jsx
// STEP 3 of 3 — student enters and confirms their new password.
// Only reachable after OTP was verified on /verify-reset.
// Uses resetToken (short-lived JWT from backend) to prove OTP was already verified.
// On success → navigates to /login.

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { StepIndicator } from "../auth/Forgotpassword";
import toast from 'react-hot-toast';
import logo from "../../assets/studylogo.png"
const BASE_URL = import.meta.env.VITE_RENDER_URL;

function EyeToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="text-gray-400 hover:text-[#1a2a5e] transition ml-2 flex-shrink-0"
    >
      {visible ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  const strength =
    password.length >= 12 && /[^a-zA-Z0-9]/.test(password) ? 4 :
    password.length >= 10 ? 3 :
    password.length >= 6  ? 2 : 1;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors  = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"];
  const textCol = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-green-600"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map((i) => (
          <div key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= strength ? colors[strength] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-semibold ${textCol[strength]}`}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function ResetPassword() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Both email and resetToken were passed from VerifyResetOtp
  const email      = location.state?.email      || "";
  const resetToken = location.state?.resetToken || "";

  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);

  // Redirect if accessed directly without going through OTP verification
  if (!email || !resetToken) {
    return (
      <div className="min-h-screen bg-[#f0f3fa] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8
                        text-center max-w-sm w-full">
          <p className="text-[#1a2a5e] font-bold mb-2">Session expired</p>
          <p className="text-gray-500 text-sm mb-5">
            Please start the password reset process again.
          </p>
          <Link to="/forgot-password"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#1a2a5e] text-white
                       text-sm font-bold hover:bg-[#14234d] transition">
            Start over
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPwd.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // POST /api/auth/reset-password — no OTP needed here,
      // the resetToken proves the OTP was already verified in step 2
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({
          email,
          resetToken,
          newPassword: newPwd,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to reset password. Please try again.");
        return;
      }

      // Success — go to login with a success message
      navigate("/auth/login", { state: { passwordReset: true } });

    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const mismatch = confirmPwd && confirmPwd !== newPwd;

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
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1a2a5e] text-center mb-2">
            Create new password
          </h1>
          <p className="text-gray-500 text-sm text-center mb-5 leading-relaxed">
            Choose a strong password for your account.
          </p>

          {/* Step indicator — Step 3 active */}
          <StepIndicator active={2} />

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                New Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4
                              bg-gray-50 focus-within:bg-white
                              focus-within:border-[#1a2a5e]/40 transition">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
                  className="flex-shrink-0 mr-3">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full py-3 text-sm bg-transparent outline-none
                             text-gray-700 placeholder-gray-400"
                  autoFocus
                />
                <EyeToggle visible={showNew} onToggle={() => setShowNew((v) => !v)} />
              </div>
              <StrengthBar password={newPwd} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Confirm New Password
              </label>
              <div className={`flex items-center border rounded-xl px-4 transition
                              ${mismatch
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-[#1a2a5e]/40"
                              }`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
                  className="flex-shrink-0 mr-3">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showConf ? "text" : "password"}
                  placeholder="Repeat your new password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="w-full py-3 text-sm bg-transparent outline-none
                             text-gray-700 placeholder-gray-400"
                />
                <EyeToggle visible={showConf} onToggle={() => setShowConf((v) => !v)} />
              </div>
              {mismatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPwd || !confirmPwd || !!mismatch}
              className="w-full py-3.5 rounded-xl bg-[#1a2a5e] hover:bg-[#14234d]
                         text-white font-bold text-sm transition active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Resetting password...
                </span>
              ) : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}