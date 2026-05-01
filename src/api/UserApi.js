// src/services/api/userApi.js
import { get, post, patch } from "./client";

/** Create a new account. Backend sends OTP email. */
export const signUp = (data) =>
  post("/api/auth/signup", data);
// data: { displayName, email, password }

/** Verify 6-digit OTP.
 *  purpose: "verify"  → email verification after signup
 *  purpose: "reset"   → step 2 of password reset flow
 */
export const verifyOtp = (data) =>
  post("/api/auth/verify-otp", data);
// data: { email, otp, purpose?: "verify" | "reset" }

/** Resend a fresh OTP. */
export const resendOtp = (data) =>
  post("/api/auth/resend-otp", data);
// data: { email, purpose: "verify" | "reset" }

/** Log in. Backend sets httpOnly cookie. */
export const login = (data) =>
  post("/api/auth/login", data);
// data: { email, password }

/** Log out — clears the JWT cookie. */
export const logout = () =>
  post("/api/auth/logout");

/** Step 1 of password reset — send OTP to email. */
export const forgotPassword = (data) =>
  post("/api/auth/forgot-password", data);
// data: { email }

/** Step 3 of password reset — set new password.
 *  OTP was already verified in step 2 (/verify-otp with purpose: "reset").
 *  No OTP needed here.
 */
export const resetPassword = (data) =>
  post("/api/auth/reset-password", data);
// data: { email, newPassword }

/** Change password while logged in (from Settings page). */
export const changePassword = (data) =>
  post("/api/auth/change-password", data);
// data: { currentPassword, newPassword }

/** Get the current logged-in user's profile. */
export const getMe = () =>
  get("/api/auth/me");

/** Update profile fields. */
export const updateProfile = (data) =>
  patch("/api/auth/profile", data);
// data: { displayName?, classLevel?, subjects?, emailPreferences? }