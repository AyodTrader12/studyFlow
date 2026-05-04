// src/pages/AdminPanel.jsx
// Admin-only page to add resources to MongoDB.
// When a YouTube URL is pasted, backend auto-fetches title/thumbnail/duration.
// Shows a preview before saving.

import { useState, useEffect,useRef } from "react";
import { useNavigate, useOutletContext} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useResources } from "../../hook/UseApi";
import { createResource, deleteResource,updateResource } from "../../api/ResourceApi";
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
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();
  useOutletContext();
 
  useEffect(() => {
    if (!isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);
 
  const { resources, loading: resLoading, refetch } = useResources({ limit: 100 });
 
  // ── Form state ─────────────────────────────────────────────────────────────
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editingId,   setEditingId]   = useState(null);   // null = add mode, id = edit mode
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState("");
 
  // ── Delete state ───────────────────────────────────────────────────────────
  const [deleteId,      setDeleteId]      = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
 
  // ── List state ─────────────────────────────────────────────────────────────
  const [searchTerm,  setSearchTerm]  = useState("");
  const [typeFilter,  setTypeFilter]  = useState("all");
 
  // ── YouTube preview state ──────────────────────────────────────────────────
  const [ytPreview, setYtPreview] = useState(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError,   setYtError]   = useState("");
 
  // Ref to scroll form into view when editing starts
  const formRef = useRef(null);
 
  // ── YouTube auto-fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    const url = form.url.trim();
    if (form.type !== "youtube" || !url) {
      setYtPreview(null); setYtError(""); return;
    }
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) return;
 
    const timeout = setTimeout(async () => {
      setYtLoading(true); setYtError("");
      try {
        const res  = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/youtube-preview?url=${encodeURIComponent(url)}`,
          { credentials: "include" }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Could not fetch video details");
        setYtPreview(data);
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
 
  // ── Field change ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (name === "url") { setYtPreview(null); setYtError(""); }
  };
 
  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = "Title is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.level.trim())   e.level   = "Class level is required";
    if (form.type !== "notes" && !form.url.trim())     e.url     = "URL is required";
    if (form.type === "notes" && !form.content.trim()) e.content = "Notes content is required";
    return e;
  };
 
  // ── Submit — handles both Add and Edit ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
 
    setSaving(true);
    try {
      if (editingId) {
        // EDIT MODE → PATCH /api/resources/:id
        await updateResource(editingId, form);
        setSuccess("Resource updated successfully.");
      } else {
        // ADD MODE → POST /api/resources
        await createResource(form);
        setSuccess("Resource added! Students can see it now.");
      }
 
      resetForm();
      refetch();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };
 
  // ── Start editing a resource ───────────────────────────────────────────────
  const handleStartEdit = (resource) => {
    setEditingId(resource._id);
    setForm({
      title:       resource.title       || "",
      subject:     resource.subject     || "",
      topic:       resource.topic       || "",
      type:        resource.type        || "youtube",
      url:         resource.url         || "",
      duration:    resource.duration    || "",
      level:       resource.level       || "SS1",
      thumbnail:   resource.thumbnail   || "",
      content:     resource.content     || "",
      description: resource.description || "",
    });
    setErrors({});
    setYtPreview(null);
    setYtError("");
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
 
  // ── Cancel editing ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setYtPreview(null);
    setYtError("");
  };
 
  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await deleteResource(id);
      setDeleteConfirm(null);
      // If we were editing this resource, reset the form
      if (editingId === id) resetForm();
      refetch();
    } catch (err) {
      console.error("Delete failed:", err.message);
    } finally {
      setDeleteId(null);
    }
  };
 
  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = resources.filter((r) => {
    const matchSearch =
      !searchTerm ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });
 
  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-700 placeholder-gray-400
     outline-none transition focus:border-[#1a2a5e]/40 ${
      errors[field] ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
    }`;
 
  if (!isAdmin) return null;
 
  const isEditing = Boolean(editingId);
 
  return (
    <div className="flex flex-col gap-7 max-w-3xl">
 
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#1a2a5e]">Resource Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add, edit and delete resources. Changes are live for students immediately.
        </p>
      </div>
 
      {/* Global success message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700
                        text-sm font-medium flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}
 
      {/* ── ADD / EDIT FORM ── */}
      <div
        ref={formRef}
        className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${
          isEditing ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-100"
        }`}
      >
        {/* Form header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#3b6fd4" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-[#1a2a5e]">
                {isEditing ? "Edit Resource" : "Add New Resource"}
              </h2>
              {isEditing && (
                <p className="text-[11px] text-blue-500 mt-0.5">
                  Editing: {form.title?.slice(0, 40)}{form.title?.length > 40 ? "..." : ""}
                </p>
              )}
            </div>
          </div>
 
          {/* Cancel edit button */}
          {isEditing && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200
                         text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Cancel edit
            </button>
          )}
        </div>
 
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {errors.general}
          </div>
        )}
 
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
 
          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Resource Type *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["youtube", "pdf", "notes", "article"].map((t) => (
                <label key={t} className={`flex items-center justify-center gap-1.5 px-3 py-2.5
                  rounded-xl border cursor-pointer transition text-sm font-medium ${
                    form.type === t
                      ? "bg-[#1a2a5e] border-[#1a2a5e] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[#1a2a5e]/40"
                  }`}>
                  <input type="radio" name="type" value={t} checked={form.type === t}
                    onChange={handleChange} className="hidden"/>
                  {TYPE_META[t].label}
                </label>
              ))}
            </div>
          </div>
 
          {/* URL (hidden for notes) */}
          {form.type !== "notes" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {form.type === "youtube" ? "YouTube URL *"
                  : form.type === "pdf" ? "PDF URL *"
                  : "Article URL *"}
              </label>
              <input
                name="url"
                placeholder={
                  form.type === "youtube" ? "https://www.youtube.com/watch?v=..."
                    : form.type === "pdf" ? "https://example.com/document.pdf"
                    : "https://example.com/article"
                }
                value={form.url}
                onChange={handleChange}
                className={inputClass("url")}
              />
              {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
 
              {form.type === "youtube" && ytLoading && (
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Fetching video details...
                </p>
              )}
 
              {form.type === "youtube" && ytError && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ {ytError} — you can still fill in the title manually.
                </p>
              )}
 
              {form.type === "youtube" && ytPreview && !ytLoading && (
                <div className="mt-3 flex gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {ytPreview.thumbnail && (
                    <img src={ytPreview.thumbnail} alt="thumbnail"
                      className="w-24 h-14 object-cover rounded-lg flex-shrink-0"/>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                      {ytPreview.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{ytPreview.channelTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        ⏱ {ytPreview.duration}
                      </span>
                      <span className="text-[10px] text-green-600 font-medium">
                        ✓ Details auto-filled
                      </span>
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
              placeholder={form.type === "youtube" ? "Auto-filled from YouTube" : "Resource title"}
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
                Notes Content *{" "}
                <span className="font-normal text-gray-400">(markdown supported)</span>
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
              <select name="subject" value={form.subject} onChange={handleChange}
                className={`${inputClass("subject")} cursor-pointer`}>
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class Level *</label>
              <select name="level" value={form.level} onChange={handleChange}
                className={`${inputClass("level")} cursor-pointer`}>
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
              <input name="topic" placeholder="e.g. Quadratic Equations"
                value={form.topic} onChange={handleChange} className={inputClass("topic")}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Duration <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input name="duration"
                placeholder={form.type === "youtube" ? "Auto-filled from YouTube" : "e.g. 30 min read"}
                value={form.duration} onChange={handleChange} className={inputClass("duration")}/>
            </div>
          </div>
 
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input name="description" placeholder="Brief description shown on the card"
              value={form.description} onChange={handleChange} className={inputClass("description")}/>
          </div>
 
          {/* Submit + Cancel */}
          <div className="flex gap-3 mt-1">
            <button type="submit" disabled={saving}
              className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition
                active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
                isEditing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-[#1a2a5e] hover:bg-[#14234d]"
              }`}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {isEditing ? "Updating..." : "Adding..."}
                </span>
              ) : isEditing ? "Update Resource" : "Add Resource"}
            </button>
 
            {isEditing && (
              <button type="button" onClick={resetForm}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm text-gray-600
                           hover:bg-gray-50 transition font-medium">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
 
      {/* ── RESOURCE LIST ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
 
        {/* List header */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-base font-bold text-[#1a2a5e]">
            All Resources
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({resources.length})
            </span>
          </h2>
 
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type filter pills */}
            {["all", "youtube", "pdf", "notes", "article"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition ${
                  typeFilter === t
                    ? "bg-[#1a2a5e] border-[#1a2a5e] text-white"
                    : "border-gray-200 text-gray-500 hover:border-[#1a2a5e]/30"
                }`}>
                {t === "all" ? "All" : TYPE_META[t]?.label}
              </button>
            ))}
 
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </span>
              <input type="text" placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs
                           text-gray-700 placeholder-gray-400 outline-none
                           focus:border-[#1a2a5e]/40 transition w-40"/>
            </div>
          </div>
        </div>
 
        {/* List body */}
        {resLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-[#1a2a5e]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {resources.length === 0
              ? "No resources yet. Add your first one above."
              : "No results found."}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {filtered.map((r) => {
              const meta      = TYPE_META[r.type] || TYPE_META.article;
              const isThisEdit = editingId === r._id;
 
              return (
                <div key={r._id}
                  className={`flex items-center gap-3 py-3 px-2 rounded-xl transition ${
                    isThisEdit ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}>
 
                  {/* Type badge */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                    flex-shrink-0 ${meta.badgeClass}`}>
                    {meta.label}
                  </span>
 
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1a2a5e] truncate">
                        {r.title}
                      </p>
                      {isThisEdit && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5
                                        rounded-full font-semibold flex-shrink-0">
                          Editing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">
                      {r.subject} · {r.level}
                      {r.topic ? ` · ${r.topic}` : ""}
                    </p>
                  </div>
 
                  {/* Views count */}
                  <span className="text-[11px] text-gray-400 flex-shrink-0 hidden sm:block">
                    {r.views ?? 0} views
                  </span>
 
                  {/* Action buttons */}
                  {deleteConfirm === r._id ? (
                    // Delete confirmation
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => handleDelete(r._id)} disabled={deleteId === r._id}
                        className="text-[11px] font-bold text-white bg-red-500 px-2.5 py-1
                                   rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                        {deleteId === r._id ? "Deleting..." : "Confirm"}
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1
                                   rounded-lg hover:bg-gray-200 transition">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // Edit + Delete buttons
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(r)}
                        title="Edit resource"
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                          isThisEdit
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        }`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </button>
 
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirm(r._id)}
                        title="Delete resource"
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                   text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
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
 