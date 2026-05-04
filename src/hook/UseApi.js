// src/hooks/useApi.js
// Re-usable React hooks that wrap every API call.
// Components import these hooks — they never call the api files directly.

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import { getResources,getResource } from "../api/ResourceApi";
import { getBookmarks, addBookmark, removeBookmark } from "../api/BookMarkApi";
import { getProgress, getProgressStats, markResourceViewed } from "../api/Progress";
import { getReminders, createReminder, deleteReminder } from "../api/RemiderApi";
import { getSummary, generateSummary } from "../api/SummaryApi";

// ── useResources ──────────────────────────────────────────────────────────────
export function useResources(filters = {}) {
  const [resources,   setResources]   = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const filtersKey = JSON.stringify(filters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResources(filters);
      setResources(data.resources);
      setPagination(data.pagination);
    } catch (err) {
      const message = err.message || "Failed to load resources.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { resources, pagination, loading, error, refetch: fetchData };
}

// ── useResource (single) ──────────────────────────────────────────────────────
export function useResource(id) {
  const [resource, setResource] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getResource(id)
      .then(({ resource: r }) => setResource(r))
      .catch((err) => {
        toast.error("Failed to load resource. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { resource, loading };
}

// ── useBookmarks ──────────────────────────────────────────────────────────────
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { bookmarks: data } = await getBookmarks();
      setBookmarks(data);
    } catch (err) {
      toast.error("Failed to load bookmarks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = async (resourceId) => {
    const isAlreadyBookmarked = bookmarks.some((b) => b._id === resourceId);
    try {
      if (isAlreadyBookmarked) {
        await removeBookmark(resourceId);
        setBookmarks((prev) => prev.filter((b) => b._id !== resourceId));
      } else {
        await addBookmark(resourceId);
        fetchData(); // refetch to get full resource data
      }
    } catch (err) {
      toast.error("Failed to update bookmark. Please try again.");
    }
  };

  const isBookmarked = (resourceId) => bookmarks.some((b) => b._id === resourceId);

  return { bookmarks, loading, toggle, isBookmarked, refetch: fetchData };
}

// ── useProgress ───────────────────────────────────────────────────────────────
export function useProgress() {
  const [progress, setProgress] = useState([]);
  const [stats,    setStats]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [streak,   setStreak]   = useState(0);

  useEffect(() => {
    Promise.all([getProgress(), getProgressStats()])
      .then(([{ progress: p }, { stats: s }]) => {
        setProgress(p);
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markViewed = async (resourceId, timeSpent = 0) => {
    try {
      const { streak: newStreak } = await markResourceViewed(resourceId, timeSpent);
      setStreak(newStreak);
      // Add to local list optimistically
      setProgress((prev) => {
        const exists = prev.some((p) => {
          const id = typeof p.resourceId === "object" ? p.resourceId._id : p.resourceId;
          return id === resourceId;
        });
        if (exists) return prev;
        return [
          {
            _id:         resourceId,
            resourceId:  {},
            subject:     "",
            level:       "",
            completedAt: new Date().toISOString(),
            timeSpent,
          },
          ...prev,
        ];
      });
    } catch (err) {
      console.error("Failed to mark resource viewed:", err.message);
    }
  };

  const hasViewed = (resourceId) =>
    progress.some((p) => {
      const id = typeof p.resourceId === "object" ? p.resourceId._id : p.resourceId;
      return id === resourceId;
    });

  return { progress, stats, loading, streak, markViewed, hasViewed };
}

// ── useReminders ──────────────────────────────────────────────────────────────
export function useReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getReminders()
      .then(({ reminders: r }) => setReminders(r))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const add = async (data) => {
    const { reminder } = await createReminder(data);
    setReminders((prev) => [...prev, reminder]);
    return reminder;
  };

  const remove = async (id) => {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r._id !== id));
  };

  return { reminders, loading, add, remove };
}

// ── useSummary ────────────────────────────────────────────────────────────────
export function useSummary(resourceId) {
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(false);

  // Try to fetch a cached summary when the component mounts
  useEffect(() => {
    if (!resourceId) return;
    setLoading(true);
    getSummary(resourceId)
      .then(({ summary: s }) => setSummary(s))
      .catch(() => {}) // 404 is fine — means not generated yet
      .finally(() => setLoading(false));
  }, [resourceId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { summary: s } = await generateSummary(resourceId);
      setSummary(s);
    } catch (err) {
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return { summary, loading, generating, generate };
}