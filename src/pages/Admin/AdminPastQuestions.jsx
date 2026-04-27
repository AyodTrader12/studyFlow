// src/pages/admin/AdminPastQuestions.jsx
// Past question management: upload, delete, list.
// Add a new past question form (exam body, subject, year, PDF URL, duration, marks).
// Same pattern as AdminResources — uses createPastQuestion / deletePastQuestion from api.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPastQuestions, createPastQuestion, deletePastQuestion } from "../../api/pastQuestionApi";
import { useEffect } from "react";
import { SUBJECTS } from "../../utils/Resourceutils";

const EXAM_BODIES = ["JAMB", "WAEC", "NECO", "GCE", "Junior WAEC", "Common Entrance", "Other"];
const LEVELS      = ["JSS","SS","University"];

export default function AdminPastQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState("");
  const [errors,    setErrors]    = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    examBody: "WAEC", subject: "", year: new Date().getFullYear(),
    title: "", description: "", fileUrl: "", duration: "",
    totalMarks: "", level: "SS",
  });

  useEffect(() => {
    getPastQuestions().then(({ questions: q }) => setQuestions(q)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.subject)  v.subject = "Subject is required";
    if (!form.fileUrl)  v.fileUrl = "PDF URL is required";
    if (!form.year)     v.year    = "Year is required";
    if (Object.keys(v).length) { setErrors(v); return; }

    setSaving(true);
    try {
      const title = form.title || `${form.examBody} ${form.subject} ${form.year}`;
      const { question } = await createPastQuestion({ ...form, title, year: parseInt(form.year), totalMarks: parseInt(form.totalMarks) || 0 });
      setQuestions((p) => [question, ...p]);
      setForm({ examBody: "WAEC", subject: "", year: new Date().getFullYear(), title: "", description: "", fileUrl: "", duration: "", totalMarks: "", level: "SS" });
      setSuccess("Past question added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePastQuestion(id);
      setQuestions((p) => p.filter((q) => q._id !== id));
      setDeleteConfirm(null);
    } catch (err) { console.error(err); }
  };

  const inp = "w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-xl font-bold text-white">Past Questions</h1>

      {success && <div className="p-3 bg-green-900/50 border border-green-700 rounded-xl text-green-400 text-sm">{success}</div>}

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-bold text-white mb-4">Add Past Question</h2>
        {errors.general && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-400 text-sm">{errors.general}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Exam Body</label>
              <select name="examBody" value={form.examBody} onChange={handleChange} className={`${inp} cursor-pointer`}>
                {EXAM_BODIES.map((e) => <option key={e}>{e}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Year *</label>
              <input name="year" type="number" min="1990" max={new Date().getFullYear()} value={form.year} onChange={handleChange} className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Subject *</label>
              <select name="subject" value={form.subject} onChange={handleChange} className={`${inp} cursor-pointer`}>
                <option value="">Select subject</option>
                {SUBJECTS.filter((s) => s !== "All Subjects").map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}</div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Level</label>
              <select name="level" value={form.level} onChange={handleChange} className={`${inp} cursor-pointer`}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">PDF URL *</label>
            <input name="fileUrl" placeholder="https://..." value={form.fileUrl} onChange={handleChange} className={inp}/>
            {errors.fileUrl && <p className="text-red-400 text-xs mt-1">{errors.fileUrl}</p>}
            <p className="text-gray-600 text-xs mt-1">Must be a publicly accessible PDF. Use Google Drive or Cloudinary.</p></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Duration</label>
              <input name="duration" placeholder="e.g. 2 hours 30 minutes" value={form.duration} onChange={handleChange} className={inp}/></div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Total Marks</label>
              <input name="totalMarks" type="number" placeholder="e.g. 200" value={form.totalMarks} onChange={handleChange} className={inp}/></div>
          </div>
          <button type="submit" disabled={saving}
            className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition disabled:opacity-60">
            {saving ? "Adding..." : "Add Past Question"}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h2 className="text-sm font-bold text-white mb-4">All Past Questions <span className="text-gray-600 font-normal">({questions.length})</span></h2>
        {loading ? <div className="flex justify-center py-8"><svg className="animate-spin h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        : questions.length === 0 ? <p className="text-gray-600 text-sm text-center py-8">No past questions yet.</p>
        : <div className="flex flex-col divide-y divide-gray-800">
            {questions.map((q) => (
              <div key={q._id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{q.title}</p>
                  <p className="text-xs text-gray-500">{q.examBody} · {q.subject} · {q.year}</p>
                </div>
                {deleteConfirm === q._id ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => handleDelete(q._id)} className="text-xs font-bold text-white bg-red-600 px-2.5 py-1 rounded-lg hover:bg-red-700">Confirm</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-xs font-bold text-gray-400 bg-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-600">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(q._id)} className="w-8 h-8 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/30 flex items-center justify-center transition">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}