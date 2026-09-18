import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F7F2]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1 lg:ml-60">
        <Header />

        <main className="relative">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-3 top-3 z-40 rounded-lg border border-amber-200 bg-[#EFEABB] p-2 text-gray-800 shadow-sm lg:hidden"
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;