import { useEffect, useState } from "react";
import { CalendarDays, User } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { useBranch } from "../hooks/useBranch";

function Header() {
  const { user } = useAuth();

  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
  } = useBranch();

  const [currentDateTime, setCurrentDateTime] =
    useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Left: Branch Selector */}
        <div className="flex min-w-0 items-center gap-2.5">
          <label
            htmlFor="header-branch-select"
            className="hidden text-xs font-semibold text-[#64748B] sm:block"
          >
            Branch
          </label>

          <select
            id="header-branch-select"
            value={selectedBranchId}
            onChange={(e) =>
              setSelectedBranchId(
                e.target.value === "ALL"
                  ? "ALL"
                  : Number(e.target.value)
              )
            }
            disabled={user?.role === "STAFF"}
            className="max-w-44 rounded-lg border border-[#D8D3A8] bg-[#F8F7F2] px-3 py-2 text-xs font-medium text-[#292A24] outline-none transition hover:border-[#C8C18A] focus:border-[#B8AF68] focus:ring-2 focus:ring-[#EFEABB] disabled:cursor-not-allowed disabled:opacity-75 sm:max-w-none"
          >
            {user?.role !== "STAFF" && (
              <option value="ALL">
                All Branches
              </option>
            )}

            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: User + Date/Time */}
        <div className="flex shrink-0 items-center gap-3">
          {/* User */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFEABB]">
              <User
                size={16}
                className="text-[#292A24]"
                aria-hidden="true"
              />
            </div>

            <div className="leading-tight">
              <p className="max-w-32 truncate text-xs font-semibold text-[#1F2937]">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-[#64748B]">
                {user?.role}
              </p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="hidden items-center gap-2 border-l border-[#E5E7EB] pl-3 md:flex">
            <CalendarDays
              size={16}
              className="text-[#64748B]"
              aria-hidden="true"
            />

            <div className="leading-tight">
              <p className="text-xs font-medium text-[#1F2937]">
                {currentDateTime.toLocaleDateString()}
              </p>

              <p className="text-[10px] text-[#64748B]">
                {currentDateTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;