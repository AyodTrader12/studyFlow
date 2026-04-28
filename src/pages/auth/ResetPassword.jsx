// src/pages/ResetPassword.jsx
// Step 2: Student enters their new password after OTP verification.
// Redirects to login on success.

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword } from "../../api/UserApi";
import logo from "../../assets/studylogo.png"
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate  = useNavigate();
  const location  = useLocation();
  
  // Must be verified before accessing this page
  const verified = location.state?.verified || false;
  const email    = location.state?.email || "";
  const otp      = location.state?.otp || "";

  const [newPwd,         setNewPwd]         = useState("");
  const [confirmPwd,     setConfirmPwd]     = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [showPwd,        setShowPwd]        = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Check if user is verified, redirect if not
  useEffect(() => {
    if (!verified || !email) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [verified, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPwd.length < 6) { 
      setError("Password must be at least 6 characters."); 
      return; 
    }
    
    if (newPwd !== confirmPwd) { 
      setError("Passwords do not match."); 
      return; 
    }

    setLoading(true);
    setError("");
    try {
      await resetPassword({ email, otp, newPassword: newPwd });
      toast.success("Password reset successfully!");
      navigate("/auth/login", { state: { passwordReset: true } });
    } catch (err) {
      toast.error(err.message || "Reset failed. Please try again.");
      setError(err.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-extrabold text-[#1a2a5e] mb-2">Create New Password</h1>
          <p className="text-gray-500 text-sm mb-6">
            Enter your new password. Make sure it's secure and different from your previous password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1a2a5e]/50 transition pr-10"
                  autoFocus
                />
                <button 
                  type="button" 
                  tabIndex={-1} 
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a2a5e] transition"
                >
                  {showPwd
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); setError(""); }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1a2a5e]/50 transition pr-10 ${
                    confirmPwd && confirmPwd !== newPwd ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a2a5e] transition"
                >
                  {showConfirmPwd ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords do not match</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !newPwd || !confirmPwd || newPwd !== confirmPwd}
              className="w-full py-3.5 rounded-xl bg-[#1a2a5e] hover:bg-[#14234d] text-white font-bold text-sm transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/auth/login" className="text-xs text-gray-400 hover:text-gray-600 transition">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}