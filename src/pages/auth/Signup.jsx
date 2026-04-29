// src/pages/SignUp.jsx
// Calls POST /api/auth/signup directly. No Firebase.
// On success, navigates to /verify with the email in state.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../../api/UserApi";
import logo from "../../assets/studylogo.png"
import toast from 'react-hot-toast';

export default function SignUp() {
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.displayName.trim())               e.displayName     = "Name is required";
    if (!form.email.trim())                      e.email           = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email           = "Enter a valid email";
    if (!form.password)                          e.password        = "Password is required";
    else if (form.password.length < 6)           e.password        = "At least 6 characters";
    if (form.password !== form.confirmPassword)  e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    try {
      await signUp({
        displayName: form.displayName.trim(),
        email:       form.email.trim(),
        password:    form.password,
      });
      // Take the student to the verify page, passing their email
      navigate("/auth/verify", { state: { email: form.email.trim(), name: form.displayName.trim() } });
    } catch (err) {
      const msg =
        err.status === 409
          ? "An account with this email already exists."
          : "Error creating account. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${
      errors[field]
        ? "border-red-300 bg-red-50 text-red-700 placeholder-red-300"
        : "border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:border-[#1a2a5e]/50"
    }`;

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
          <h1 className="text-2xl font-bold text-[#1a2a5e] mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-[#3b6fd4] font-semibold hover:underline">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input
                name="displayName"
                type="text"
                placeholder="e.g. Chukwuemeka Obi"
                value={form.displayName}
                onChange={handleChange}
                className={inputClass("displayName")}
                autoFocus
              />
              {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={inputClass("email")}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={`${inputClass("password")} pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a2a5e] transition"
                >
                  {showPwd ? (
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`${inputClass("confirmPassword")} pr-10`}
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
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1a2a5e] hover:bg-[#14234d] text-white font-bold text-sm transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
            By creating an account you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}