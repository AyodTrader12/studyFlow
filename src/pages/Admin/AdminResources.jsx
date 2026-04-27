// src/pages/AdminPanel.jsx
// Admin-only page to add resources to MongoDB.
// When a YouTube URL is pasted, backend auto-fetches title/thumbnail/duration.
// Shows a preview before saving.

import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useResources } from "../../hook/UseApi";
import { createResource, deleteResource } from "../../api/ResourceApi";
import { SUBJECTS } from "../../utils/Resourceutils";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3", "All Levels"];

const TYPE_META = {
  youtube: { label: "Video",   badgeClass: "bg-red-50 text-red-600" },
  pdf:     { label: "PDF",     badgeClass: "bg-blue-50 text-blue-600" },
  notes:   { label: "Notes",   badgeClass: "bg-purple-50 text-purple-600" },
  article: { label: "Article", badgeClass: "bg-green-50 text-green-600" },
};

const EMPTY_FORM = {
  title: "", subject: "", topic: "", type: "youtube",
  url: "", duration: "", level: "SS1",
  thumbnail: "", content: "", description: "",
};

export default function AdminResources() {
  const { isAdmin }  = useAuth();
  const navigate     = useNavigate();
  useOutletContext();

  // Guard non-admins
  useEffect(() => {
    if (!isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);

  const { resources, loading: resLoading, refetch } = useResources({ limit: 100 });

  const [form,          setForm]          = useState(EMPTY_FORM);
  const [errors,        setErrors]        = useState({});
  const [saving,        setSaving]        = useState(false);
  const [success,       setSuccess]       = useState("");
  const [deleteId,      setDeleteId]      = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm,    setSearchTerm]    = useState("");

  // YouTube URL preview state
  const [ytPreview,  setYtPreview]  = useState(null);
  const [ytLoading,  setYtLoading]  = useState(false);
  const [ytError,    setYtError]    = useState("");

  // Auto-fetch YouTube preview when URL is pasted
  useEffect(() => {
    const url = form.url.trim();
    if (form.type !== "youtube" || !url) {
      setYtPreview(null);
      setYtError("");
      return;
    }

    // Check it looks like a YouTube URL before calling backend
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) return;

    const timeout = setTimeout(async () => {
      setYtLoading(true);
      setYtError("");
      try {
        // We call the backend which uses the YouTube Data API
        // The backend returns metadata and we show a preview
         const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/youtube-preview?url=${encodeURIComponent(url)}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Could not fetch video details");
        const data = await res.json();
        setYtPreview(data);
        // Auto-fill title and duration if not already set
        setForm((prev) => ({
          ...prev,
          title:     prev.title     || data.title,
          duration:  prev.duration  || data.duration,
          thumbnail: prev.thumbnail || data.thumbnail,
        }));
      } catch (err) {
        setYtError(err.message || "Could not fetch video details");
      } finally {
        setYtLoading(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [form.url, form.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    // Reset YouTube preview when URL changes
    if (name === "url") { setYtPreview(null); setYtError(""); }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = "Title is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.level.trim())   e.level   = "Class level is required";
    if (form.type !== "notes" && !form.url.trim())     e.url     = "URL is required";
    if (form.type === "notes" && !form.content.trim()) e.content = "Notes content is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setSaving(true);
    try {
      await createResource(form);
      setForm(EMPTY_FORM);
      setYtPreview(null);
      setErrors({});
      setSuccess("Resource added! Students can see it now.");
      refetch();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await deleteResource(id);
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-[#1a2a5e]/40 ${
      errors[field] ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
    }`;

  const filtered = resources.filter(
    (r) =>
      !searchTerm ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-7 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#1a2a5e]">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Add resources to MongoDB. Students see them immediately.</p>
      </div>

      {/* How YouTube API works */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div className="text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-[#1a2a5e] mb-1">How the YouTube API works</p>
          <p>
            Paste any YouTube URL → the backend calls YouTube Data API v3 to automatically
            fetch the title, thumbnail and duration. You just set the subject and class level.
          </p>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}

      {/* ── Add form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1a2a5e] mb-5">Add New Resource</h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Resource Type *</label>
            <div className="grid grid-cols-4 gap-2">
              {["youtube", "pdf", "notes", "article"].map((t) => (
                <label key={t} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border cursor-pointer transition text-sm font-medium ${
                  form.type === t
                    ? "bg-[#1a2a5e] border-[#1a2a5e] text-white"
                    : "border-gray-200 text-gray-600 hover:border-[#1a2a5e]/40"
                }`}>
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} className="hidden" />
                  {TYPE_META[t].label}
                </label>
              ))}
            </div>
          </div>

          {/* URL — hidden for notes */}
          {form.type !== "notes" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {form.type === "youtube" ? "YouTube URL *" : form.type === "pdf" ? "PDF URL *" : "Article URL *"}
              </label>
              <input
                name="url"
                placeholder={
                  form.type === "youtube" ? "https://www.youtube.com/watch?v=..."
                  : form.type === "pdf"   ? "https://example.com/document.pdf"
                  : "https://example.com/article"
                }
                value={form.url}
                onChange={handleChange}
                className={inputClass("url")}
              />
              {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}

              {/* YouTube loading indicator */}
              {form.type === "youtube" && ytLoading && (
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Fetching video details from YouTube...
                </p>
              )}

              {/* YouTube error */}
              {form.type === "youtube" && ytError && (
                <p className="text-xs text-amber-600 mt-1">⚠️ {ytError} — you can still fill in the title manually.</p>
              )}

              {/* YouTube preview card */}
              {form.type === "youtube" && ytPreview && !ytLoading && (
                <div className="mt-3 flex gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {ytPreview.thumbnail && (
                    <img
                      src={ytPreview.thumbnail}
                      alt="thumbnail"
                      className="w-24 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2">{ytPreview.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{ytPreview.channelTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        ⏱ {ytPreview.duration}
                      </span>
                      <span className="text-[10px] text-green-600 font-medium">✓ Details auto-filled</span>
                    </div>
                  </div>
                </div>
              )}

              {form.type === "pdf" && (
                <p className="text-[11px] text-gray-400 mt-1">
                  PDF must be publicly accessible. It opens via Google Docs Viewer.
                </p>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
            <input
              name="title"
              placeholder={form.type === "youtube" ? "Auto-filled from YouTube" : "e.g. WAEC Maths Past Questions 2023"}
              value={form.title}
              onChange={handleChange}
              className={inputClass("title")}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Notes content */}
          {form.type === "notes" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Notes Content * <span className="font-normal text-gray-400">(markdown supported)</span>
              </label>
              <textarea
                name="content"
                placeholder={"# Topic Title\n\n## Section 1\n\nYour content here...\n\n- Bullet point\n- **Bold text**"}
                value={form.content}
                onChange={handleChange}
                rows={10}
                className={`${inputClass("content")} resize-none font-mono text-xs leading-relaxed`}
              />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              <p className="text-[11px] text-gray-400 mt-1">
                Use # for headings, ** for bold, - for bullets, | for tables.
              </p>
            </div>
          )}

          {/* Subject + Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
              <select name="subject" value={form.subject} onChange={handleChange} className={`${inputClass("subject")} cursor-pointer`}>
                <option value="">Select subject</option>
                {SUBJECTS.filter((s) => s !== "All Subjects").map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class Level *</label>
              <select name="level" value={form.level} onChange={handleChange} className={`${inputClass("level")} cursor-pointer`}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
              {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
            </div>
          </div>

          {/* Topic + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Topic <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input name="topic" placeholder="e.g. Quadratic Equations" value={form.topic} onChange={handleChange} className={inputClass("topic")} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Duration <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input name="duration" placeholder={form.type === "youtube" ? "Auto-filled from YouTube" : "e.g. 30 min read"} value={form.duration} onChange={handleChange} className={inputClass("duration")} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Short Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input name="description" placeholder="Brief description shown on the card" value={form.description} onChange={handleChange} className={inputClass("description")} />
          </div>

          <button type="submit" disabled={saving}
            className="mt-1 w-full py-3 rounded-xl bg-[#1a2a5e] text-white font-bold text-sm hover:bg-[#14234d] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Adding resource...
              </span>
            ) : "Add Resource"}
          </button>
        </form>
      </div>

      {/* ── Resources list ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-base font-bold text-[#1a2a5e]">
            All Resources
            <span className="ml-2 text-xs font-normal text-gray-400">({resources.length})</span>
          </h2>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-[#1a2a5e]/40 transition w-48"
            />
          </div>
        </div>

        {resLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {resources.length === 0 ? "No resources yet. Add your first one above." : "No results found."}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {filtered.map((r) => {
              const meta = TYPE_META[r.type] || TYPE_META.article;
              return (
                <div key={r._id} className="flex items-center gap-3 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${meta.badgeClass}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a2a5e] truncate">{r.title}</p>
                    <p className="text-[11px] text-gray-400 truncate">{r.subject} · {r.level}</p>
                  </div>
                  {deleteConfirm === r._id ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => handleDelete(r._id)} disabled={deleteId === r._id}
                        className="text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                        {deleteId === r._id ? "Deleting..." : "Confirm"}
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(r._id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="Delete">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}