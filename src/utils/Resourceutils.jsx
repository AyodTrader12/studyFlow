// resourceUtils.js — shared helpers used across ResourcesPage, ResourceViewer, AdminPanel

export const SUBJECTS = [
  "All Subjects",
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Literature",
  "Geography",
  "Agriculture",
  "Further Mathematics",
  "Civic Education",
  "Commerce",
  "Computer Science",
  "Information Technology",
  "Physical Education",
  "Home Economics",
  "Fine Arts",
  "Technical Drawing",
  "Health Science",
];

export const LEVELS = ["All Levels", "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

export const TYPES = ["All Types", "youtube", "pdf", "notes", "article"];

export const TYPE_META = {
  youtube: {
    label: "Video",
    badgeClass: "bg-red-50 text-red-600",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  pdf: {
    label: "PDF",
    badgeClass: "bg-blue-50 text-blue-600",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      </svg>
    ),
  },
  notes: {
    label: "Notes",
    badgeClass: "bg-purple-50 text-purple-600",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  article: {
    label: "Article",
    badgeClass: "bg-green-50 text-green-600",
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 6h16M4 12h16M4 18h10"/>
      </svg>
    ),
  },
};

// Converts a standard YouTube watch URL to an embed URL
export function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get("v");
    // Handle youtu.be short links
    if (!videoId && u.hostname === "youtu.be") videoId = u.pathname.slice(1);
    // Handle /embed/ links already
    if (!videoId && u.pathname.includes("/embed/")) return url;
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
  } catch {
    return url;
  }
}

// Wraps any PDF URL through Google Docs viewer so it renders in-browser
export function toPDFViewer(url) {
  // If already a Google Docs viewer URL, return as-is
  if (url.includes("docs.google.com/viewer")) return url;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}