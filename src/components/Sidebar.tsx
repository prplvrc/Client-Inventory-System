import { NavLink, useNavigate } from "react-router-dom";
import {
  Monitor,
  ChartPie,
  BriefcaseBusiness,
  ShoppingBasket,
  ChartNoAxesColumnIncreasing,
  ChartNoAxesCombined,
  Lightbulb,
  UsersRound,
  NotebookTabs,
  Settings,
  LogOut,
} from "lucide-react";

import Logo from "../assets/denberts-logo.png";

function Sidebar() {
  const navigate = useNavigate();

  const mainMenu = [
    {
      name: "POS",
      path: "/pos",
      icon: Monitor,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: ChartPie,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: BriefcaseBusiness,
    },
    {
      name: "Products",
      path: "/products",
      icon: ShoppingBasket,
    },
    {
      name: "Sales",
      path: "/sales",
      icon: ChartNoAxesColumnIncreasing,
    },
    {
      name: "Forecasting",
      path: "/forecasting",
      icon: ChartNoAxesCombined,
    },
  ];

  const managementMenu = [
    {
      name: "Recommendation",
      path: "/recommendation",
      icon: Lightbulb,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: UsersRound,
      adminOnly: true,
    },
    {
      name: "Audit Logs",
      path: "/audit-logs",
      icon: NotebookTabs,
      adminOnly: true,
    },
  ];

  const handleLogout = () => {
    // TODO: Clear authentication data here
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 h-screen w-56 bg-[#EFEABB]">
      {/* Logo */}
      <div className="flex justify-center px-4 pt-5 pb-3">
        <img
          src={Logo}
          alt="Denbert's Logo"
          className="h-14 w-auto object-contain"
        />
      </div>

      {/* Main */}
      <div className="px-2">
        <h3 className="mb-2 px-2 text-xs font-extrabold uppercase text-red-500">
          Main
        </h3>

        <nav className="space-y-1">
          {mainMenu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-900 hover:bg-white/60"
                  }`
                }
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Management */}
      <div className="mt-6 px-2">
        <h3 className="mb-2 px-2 text-xs font-extrabold uppercase text-red-500">
          Management
        </h3>

        <nav className="space-y-1">
          {managementMenu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-900 hover:bg-white/60"
                  }`
                }
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Settings */}
      <div className="mt-6 px-2">
        <h3 className="mb-2 px-2 text-xs font-extrabold uppercase text-red-500">
          Settings
        </h3>

        <nav className="space-y-1">
          {/* Account */}
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-900 hover:bg-white/60"
              }`
            }
          >
            <Settings
              size={22}
              strokeWidth={2}
              className="shrink-0"
            />

            <span>Account</span>
          </NavLink>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium text-gray-900 transition hover:bg-white/60"
          >
            <LogOut
              size={22}
              strokeWidth={2}
              className="shrink-0"
            />

            <span>Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;