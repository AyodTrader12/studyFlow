// src/components/DashboardTopbar.jsx
// Props: user, searchQuery, onSearchChange, onMenuToggle, mobileOpen
// Search input is debounced inside the layout so API calls are minimal.
import logo from "../assets/studylogo.png"
export default function DashboardTopbar({
  user,
  searchQuery,
  onSearchChange,
  onMenuToggle,
  mobileOpen,
}) {
  const displayName = user?.displayName || "Student";
  const initials    = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  
return (
  <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm h-16 flex items-center px-4 gap-4">
 
      {/* Mobile hamburger */}
      <button 
        className="md:hidden w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-lg hover:bg-gray-100 transition"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <span className={`block h-0.5 w-5 bg-[#1a2a5e] rounded transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block h-0.5 w-5 bg-[#1a2a5e] rounded transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-5 bg-[#1a2a5e] rounded transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
   <img src={logo} alt="StudyFlow Logo" className="w-30 h-10 "/> 
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-xl mx-auto relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search subjects, topics, resources..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#f0f3fa] border border-transparent text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1a2a5e]/30 focus:bg-white transition"
        />
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Right — notifications + avatar (desktop only) */}
      <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0">
        {/* <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button> */}
        <div className="w-9 h-9 rounded-xl bg-[#1a2a5e] flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}

