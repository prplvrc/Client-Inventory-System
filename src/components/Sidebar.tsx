import { NavLink, useNavigate } from "react-router-dom";
import {
  Monitor,
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Tags,
  TrendingUp,
  LineChart,
  Lightbulb,
  ShieldAlert,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import Logo from "../assets/denberts-logo.png";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const mainMenu = [
    { name: "POS", path: "/pos", icon: Monitor },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Boxes },
    { name: "Products", path: "/products", icon: ShoppingBag },
    { name: "Categories", path: "/categories", icon: Tags },
    { name: "Sales", path: "/sales", icon: TrendingUp },
    { name: "Forecasting", path: "/forecasting", icon: LineChart },
  ];

  const managementMenu = [
    {
      name: "Recommendation",
      path: "/recommendation",
      icon: Lightbulb,
    },
    {
      name: "Audit Logs",
      path: "/audit-logs",
      icon: ShieldAlert,
      adminOnly: true,
    },
  ];

  const handleLogout = () => {
    onClose();
    navigate("/login");
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive
        ? "bg-red-600 text-white"
        : "text-gray-700 hover:bg-black/5"
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-black/10 bg-[#EFEABB] transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative flex h-20 items-center justify-center border-b border-black/10 px-4">
          <img
            src={Logo}
            alt="Denbert's Logo"
            className="h-12 w-auto object-contain"
          />

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="absolute right-3 rounded-md p-1.5 text-gray-700 hover:bg-black/5 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Main */}
          <div className="mb-6">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
              Main
            </h3>

            <nav className="space-y-1">
              {mainMenu.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Management */}
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
              Management
            </h3>

            <nav className="space-y-1">
              {managementMenu.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-black/10 p-3">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
            Settings
          </h3>

          <nav className="space-y-1">
            <NavLink
              to="/account"
              className={navItemClass}
              onClick={onClose}
            >
              <Settings size={18} />
              <span>Account</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-red-600 hover:text-white"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;