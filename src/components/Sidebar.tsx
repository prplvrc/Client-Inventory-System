import { NavLink, useNavigate } from "react-router-dom";
import {
  Monitor,
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  TrendingUp,
  LineChart,
  Lightbulb,
  Users,
  ShieldAlert,
  Settings,
  LogOut,
} from "lucide-react";

import Logo from "../assets/denberts-logo.png";

function Sidebar() {
  const navigate = useNavigate();

  const mainMenu = [
    { name: "POS", path: "/pos", icon: Monitor },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Boxes },
    { name: "Products", path: "/products", icon: ShoppingBag },
    { name: "Sales", path: "/sales", icon: TrendingUp },
    { name: "Forecasting", path: "/forecasting", icon: LineChart },
  ];

  const managementMenu = [
    { name: "Recommendation", path: "/recommendation", icon: Lightbulb },
    { name: "Employees", path: "/employees", icon: Users, adminOnly: true },
    { name: "Audit Logs", path: "/audit-logs", icon: ShieldAlert, adminOnly: true },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
      isActive
        ? "bg-white text-red-600 shadow-sm border-l-4 border-red-600"
        : "text-gray-700 hover:bg-white/70 hover:text-red-600"
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col justify-between overflow-hidden border-r border-amber-200/50 bg-[#EFEABB] p-3">
      {/* Top Section */}
      <div className="space-y-3">
        {/* Logo Header */}
        <div className="flex shrink-0 items-center justify-center border-b border-black/5 pb-2 pt-1">
          <img
            src={Logo}
            alt="Denbert's Logo"
            className="h-14 w-auto max-w-full object-contain transition-transform hover:scale-105"
          />
        </div>

        {/* Main Section */}
        <div>
          <h3 className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-red-600/80">
            Main
          </h3>
          <nav className="space-y-0.5">
            {mainMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={navItemClass}>
                  <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Management Section */}
        <div>
          <h3 className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-red-600/80">
            Management
          </h3>
          <nav className="space-y-0.5">
            {managementMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={navItemClass}>
                  <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings & Footer pinned at bottom */}
      <div className="border-t border-black/5 pt-2">
        <h3 className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-red-600/80">
          Settings
        </h3>
        <nav className="space-y-0.5">
          <NavLink to="/account" className={navItemClass}>
            <Settings size={18} className="shrink-0 transition-transform group-hover:scale-110" />
            <span>Account</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} className="shrink-0 transition-transform group-hover:scale-110" />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;