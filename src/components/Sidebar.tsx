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
import { useBranch } from "../hooks/useBranch";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MENU_ITEMS = [
  { name: "POS", path: "/pos", icon: Monitor, section: "main" },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, section: "main", admin: true },
  { name: "Inventory", path: "/inventory", icon: Boxes, section: "main" },
  { name: "Products", path: "/products", icon: ShoppingBag, section: "main" },
  { name: "Categories", path: "/categories", icon: Tags, section: "main" },
  { name: "Sales", path: "/sales", icon: TrendingUp, section: "main", admin: true },
  { name: "Forecasting", path: "/forecasting", icon: LineChart, section: "main", admin: true },
  { name: "Recommendation", path: "/recommendation", icon: Lightbulb, section: "management", admin: true },
  { name: "Audit Logs", path: "/audit-logs", icon: ShieldAlert, section: "management", admin: true },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { branches, selectedBranchId, setSelectedBranchId } = useBranch();

  const isAdmin = user?.role === "ADMIN";

  const mainItems = MENU_ITEMS.filter((i) => i.section === "main" && (!i.admin || isAdmin));
  const mgmtItems = MENU_ITEMS.filter((i) => i.section === "management" && (!i.admin || isAdmin));

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-red-600 text-white" : "text-gray-700 hover:bg-black/5"
    }`;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-black/10 bg-[#EFEABB] transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative flex h-20 shrink-0 items-center justify-center border-b border-black/10 px-4">
          <img src={Logo} alt="Logo" className="h-12 w-auto object-contain" />
          <button
            onClick={onClose}
            className="absolute right-3 rounded-md p-1.5 text-gray-700 hover:bg-black/5 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shrink-0 border-b border-black/10 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Operating Branch
          </p>
          {isAdmin ? (
            <select
              value={selectedBranchId}
              onChange={(e) =>
                setSelectedBranchId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="w-full rounded-md border border-black/20 bg-white px-2 py-1.5 text-xs font-semibold text-gray-800"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-md border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-gray-800">
              {user?.branch.name}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-hidden p-3">
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase text-gray-500">
                Main
              </h3>
              <nav className="space-y-0.5">
                {mainItems.map(({ name, path, icon: Icon }) => (
                  <NavLink key={path} to={path} className={navClass} onClick={onClose}>
                    <Icon size={18} />
                    <span>{name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {mgmtItems.length > 0 && (
              <div>
                <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase text-gray-500">
                  Management
                </h3>
                <nav className="space-y-0.5">
                  {mgmtItems.map(({ name, path, icon: Icon }) => (
                    <NavLink key={path} to={path} className={navClass} onClick={onClose}>
                      <Icon size={18} />
                      <span>{name}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase text-gray-500">
              Settings
            </h3>
            <nav className="space-y-0.5">
              <NavLink to="/account" className={navClass} onClick={onClose}>
                <Settings size={18} />
                <span>Account</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-red-600 hover:text-white"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}