// src/layouts/DashboardLayout.jsx
// Owns shared state: sidebar collapse, mobile menu, search query.
// Search is debounced here before being passed to pages via Outlet context.

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import DashBoardTopbar from "../components/TopBar"
import LeftSideBar from "../components/LeftSideBar"
import RightSideBar from "../components/RightsideBar";
import { useDebounce } from "../hook/UseSearch";

export default function DashboardLayout() {
  const { userProfile } = useAuth();
  const [collapsed,    setCollapsed]   = useState(false);
  const [mobileOpen,   setMobileOpen]  = useState(false);
  const [rawSearch,    setRawSearch]   = useState("");

  // Debounce the search so the API is only called after typing stops
  const searchQuery = useDebounce(rawSearch, 400);

  // Pass both the raw value (for the input to stay responsive)
  // and the debounced value (for API calls) to child pages
  const user = userProfile; 

  return (
    <div className="min-h-screen bg-[#f0f3fa] flex flex-col">

      <DashBoardTopbar
        user={user}
        searchQuery={rawSearch}
        onSearchChange={setRawSearch}
        onMenuToggle={() => setMobileOpen((v) => !v)}
        mobileOpen={mobileOpen}
      />

      <div className="flex flex-1 overflow-hidden">

        <LeftSideBar
          user={user}
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main content — passes debounced searchQuery to every page */}
        <main className={`flex-1 min-w-0 overflow-auto p-5 lg:p-7 transition-all duration-300 ${collapsed ? "md:ml-[68px]" : "md:ml-[220px]"} xl:mr-[280px]`}>
          <Outlet context={{ searchQuery, rawSearch, user }} />
        </main>

        {/* Right sidebar — desktop xl+ only */}
        <aside className="hidden xl:flex flex-col w-[280px] flex-shrink-0 p-5 gap-5 overflow-y-auto xl:fixed xl:top-16 xl:right-0 xl:h-[calc(100vh-4rem)]">
          <RightSideBar user={user} />
        </aside>

      </div>
      <Toaster />
    </div>
  );
}