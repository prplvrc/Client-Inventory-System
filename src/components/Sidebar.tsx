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
import { useAuth } from "../hooks/useAuth";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MENU_ITEMS = [
  {
    name: "POS",
    path: "/pos",
    icon: Monitor,
    section: "main",
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    section: "main",
    admin: true,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Boxes,
    section: "main",
  },
  {
    name: "Products",
    path: "/products",
    icon: ShoppingBag,
    section: "main",
  },
  {
    name: "Categories",
    path: "/categories",
    icon: Tags,
    section: "main",
  },
  {
    name: "Sales",
    path: "/sales",
    icon: TrendingUp,
    section: "main",
    admin: true,
  },
  {
    name: "Forecasting",
    path: "/forecasting",
    icon: LineChart,
    section: "main",
    admin: true,
  },
  {
    name: "Recommendation",
    path: "/recommendation",
    icon: Lightbulb,
    section: "management",
    admin: true,
  },
  {
    name: "Audit Logs",
    path: "/audit-logs",
    icon: ShieldAlert,
    section: "management",
    admin: true,
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const mainItems = MENU_ITEMS.filter(
    (item) =>
      item.section === "main" &&
      (!item.admin || isAdmin)
  );

  const managementItems = MENU_ITEMS.filter(
    (item) =>
      item.section === "management" &&
      (!item.admin || isAdmin)
  );

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login");
  };

  const navClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/80 text-[#292A24] shadow-sm"
        : "text-slate-700 hover:bg-white/40 hover:text-[#292A24]"
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-[#D8D3A8] bg-[#EFEABB] transition-transform duration-200 lg:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="relative flex h-20 shrink-0 items-center justify-center border-b border-[#D8D3A8] px-4">
          <img
            src={Logo}
            alt="Denbert's Goto, Pares at iba pa"
            className="h-12 w-auto object-contain"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute right-3 rounded-lg p-1.5 text-slate-700 transition hover:bg-white/40 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto p-3">
          <div className="space-y-5">
            {/* Main */}
            <div>
              <h3 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                Main
              </h3>

              <nav
                className="space-y-0.5"
                aria-label="Main navigation"
              >
                {mainItems.map(
                  ({
                    name,
                    path,
                    icon: Icon,
                  }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={navClass}
                      onClick={onClose}
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />

                      <span>{name}</span>
                    </NavLink>
                  )
                )}
              </nav>
            </div>

            {/* Management */}
            {managementItems.length > 0 && (
              <div>
                <h3 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Management
                </h3>

                <nav
                  className="space-y-0.5"
                  aria-label="Management navigation"
                >
                  {managementItems.map(
                    ({
                      name,
                      path,
                      icon: Icon,
                    }) => (
                      <NavLink
                        key={path}
                        to={path}
                        className={navClass}
                        onClick={onClose}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />

                        <span>{name}</span>
                      </NavLink>
                    )
                  )}
                </nav>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="pt-5">
            <h3 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              Settings
            </h3>

            <nav
              className="space-y-0.5"
              aria-label="Settings navigation"
            >
              <NavLink
                to="/account"
                className={navClass}
                onClick={onClose}
              >
                <Settings
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <span>Account</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700"
              >
                <LogOut
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}