import { NavLink } from "react-router-dom";
import Logo from "../assets/denberts-logo.png";

function Sidebar() {
  const mainMenu = [
    { name: "POS", path: "/pos" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Inventory", path: "/inventory" },
    { name: "Products", path: "/products" },
    { name: "Sales", path: "/sales" },
    { name: "Forecasting", path: "/forecasting" },
  ];

  const managementMenu = [
    { name: "Recommendations", path: "/recommendations" },
    { name: "Employees", path: "/employees", adminOnly: true },
    { name: "Audit Logs", path: "/audit-logs", adminOnly: true },
  ];

  const settingsMenu = [
    { name: "Account", path: "/account" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 h-screen w-56 bg-[#EFEABB] shadow-md">

      {/* Logo */}
      <div className="flex items-center justify-center p-4">
        <img
          src={Logo}
          alt="Denbert's Logo"
          className="h-10 w-10 object-contain"
        />
      </div>

      {/* Main */}
      <div className="px-2">
        <h3 className="mb-2 px-2 text-xs font-extrabold uppercase text-red-500">
          Main
        </h3>

        <nav className="space-y-1">
          {mainMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-700 hover:bg-white/60"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Management */}
      <div className="mt-6 px-2">
        <h3 className="mb-2 px-2 text-xs font-extrabold uppercase text-red-500">
          Management
        </h3>

        <nav className="space-y-1">
          {managementMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-700 hover:bg-white/60"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Settings */}
      <div className="mt-6 px-2">
        <h3 className="mb-2 px-2 text-xs font-extrabold uppercase text-red-500">
          Settings
        </h3>

        <nav className="space-y-1">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-xs font-semibold ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-700 hover:bg-white/60"
              }`
            }
          >
            Account
          </NavLink>

          <button
            type="button"
            className="w-full rounded-lg px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-white/60"
          >
            Logout
          </button>
        </nav>
      </div>

    </aside>
  );
}

export default Sidebar;