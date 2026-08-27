import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar with fixed width matching w-60 */}
      <Sidebar />

      {/* Main Content Area automatically offset by ml-60 */}
      <main className="ml-60 flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;