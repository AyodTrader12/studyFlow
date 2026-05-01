// src/pages/ForgotPassword.jsx
// STEP 1 of 3 — student enters their email.
// Backend sends a 6-digit OTP to that email.
// Navigates to /verify-reset passing the email in router state.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../../api/UserApi";
import toast from 'react-hot-toast';
import logo from "../../assets/studylogo.png"

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({ email: email.trim() });
    } catch {
      // We navigate regardless — backend never reveals if email exists (security)
    } finally {
      setLoading(false);
      // Always move to OTP step even if backend says email doesn't exist
      navigate("/auth/verify-reset", { state: { email: email.trim() } });
    }
  };

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
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#1a2a5e" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1a2a5e] text-center mb-2">
            Forgot password?
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
            Enter your email and we will send you a 6-digit reset code.
          </p>

          {/* Step indicator — Step 1 active */}
          <StepIndicator active={0} />

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50
                              focus-within:bg-white focus-within:border-[#1a2a5e]/40 transition">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
                  className="flex-shrink-0 mr-3">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                onChange={(e) => { setEmail(e.target.value); }}
                  className="w-full py-3 text-sm bg-transparent outline-none
                             text-gray-700 placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1a2a5e] hover:bg-[#14234d]
                         text-white font-bold text-sm transition active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Sending code...
                </span>
              ) : "Send Reset Code"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Remembered it?{" "}
            <Link to="/auth/login" className="text-[#3b6fd4] font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared step indicator used by all 3 pages ─────────────────────────────────
export function StepIndicator({ active }) {
  const steps = ["Enter email", "Verify code", "New password"];
  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center
                            text-xs font-bold transition-colors ${
              i < active
                ? "bg-green-500 text-white"
                : i === active
                ? "bg-[#1a2a5e] text-white"
                : "bg-gray-100 text-gray-400"
            }`}>
              {i < active ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-[10px] font-medium mt-1 w-16 text-center leading-tight ${
              i === active ? "text-[#1a2a5e]" : i < active ? "text-green-600" : "text-gray-400"
            }`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 h-0.5 mx-1 mb-4 transition-colors ${
              i < active ? "bg-green-400" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}