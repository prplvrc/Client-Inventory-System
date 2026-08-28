import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="min-w-0 flex-1 lg:ml-60">
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
  );
}

export default Layout;
