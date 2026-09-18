import { useEffect, useState } from "react";
import { User, Lock, Save, RefreshCw } from "lucide-react";

import { Skeleton } from "./LoadingSkeleton";
import PageHeader from "./ui/PageHeader";
import StatusBadge from "./ui/StatusBadge";
import { apiRequest } from "../services/api";

interface AccountData {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
}

function Account() {
  const [account, setAccount] = useState<AccountData | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch account information
  const fetchAccount = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await apiRequest<AccountData>("/account");

      setAccount(result);
      setName(result.name ?? "");
      setEmail(result.email ?? "");
      setUsername(result.username ?? "");
    } catch (err) {
      console.error("Fetch account error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load account information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  // Save profile information
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await apiRequest<AccountData>("/account", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          username,
        }),
      });

      setAccount(result);
      setName(result.name ?? "");
      setEmail(result.email ?? "");
      setUsername(result.username ?? "");

      setSuccess("Account information updated successfully.");
    } catch (err) {
      console.error("Update account error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update account information."
      );
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please complete all password fields.");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      setSuccess("");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await apiRequest("/account/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Password changed successfully.");
    } catch (err) {
      console.error("Change password error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change password. Please check your current password."
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset editable fields
  const handleReset = () => {
    if (!account) return;

    setName(account.name ?? "");
    setEmail(account.email ?? "");
    setUsername(account.username ?? "");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full p-4 sm:p-6">
      <PageHeader
        title="Account"
        description="Manage your account information and security settings"
      />

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"
        >
          {success}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProfileInformationSkeleton />
          <ChangePasswordSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Profile Information */}
          <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8F7F2] px-4 py-3">
              <User
                size={15}
                className="text-[#64748B]"
                aria-hidden="true"
              />

              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F2937]">
                Profile Information
              </h2>
            </div>

            <div className="space-y-4 p-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="account-name"
                  className="mb-1.5 block text-xs font-medium text-[#1F2937]"
                >
                  Name
                </label>

                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="account-username"
                  className="mb-1.5 block text-xs font-medium text-[#1F2937]"
                >
                  Username
                </label>

                <input
                  id="account-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="account-email"
                  className="mb-1.5 block text-xs font-medium text-[#1F2937]"
                >
                  Email
                </label>

                <input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                />
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="account-role"
                  className="mb-1.5 block text-xs font-medium text-[#1F2937]"
                >
                  Role
                </label>

                <input
                  id="account-role"
                  type="text"
                  value={account?.role ?? ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-slate-50 px-3 py-2 text-sm text-[#64748B]"
                />
              </div>

              {/* Status */}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-[#1F2937]">
                  Account Status
                </span>

                <StatusBadge status={account?.status ?? "UNKNOWN"} />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#292A24] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={14} />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </section>

          {/* Change Password */}
          <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8F7F2] px-4 py-3">
              <Lock
                size={15}
                className="text-[#64748B]"
                aria-hidden="true"
              />

              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F2937]">
                Change Password
              </h2>
            </div>

            <div className="space-y-4 p-4">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-1.5 block text-xs font-medium text-[#1F2937]"
                >
                  Current Password
                </label>

                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-xs font-medium text-[#1F2937]"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-xs font-medium text-[#1F2937]"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                />
              </div>

              {/* Password Requirement */}
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F8F7F2] p-3">
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  For security, use a password with at least 8 characters.
                </p>
              </div>

              {/* Action */}
              <div className="flex justify-end border-t border-[#E5E7EB] pt-4">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#292A24] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock size={14} />

                  {saving ? "Updating..." : "Change Password"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/* Profile Information Skeleton */
function ProfileInformationSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
      role="status"
    >
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8F7F2] px-4 py-3">
        <User size={15} className="text-[#94A3B8]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#1F2937]">
          Profile Information
        </span>
      </div>

      <div className="space-y-4 p-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <Skeleton className="mb-1.5 h-3 w-20" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}

        <div>
          <Skeleton className="mb-1.5 h-3 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] pt-4">
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      <span className="sr-only">
        Loading profile information...
      </span>
    </section>
  );
}

/* Change Password Skeleton */
function ChangePasswordSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
      role="status"
    >
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8F7F2] px-4 py-3">
        <Lock size={15} className="text-[#94A3B8]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#1F2937]">
          Change Password
        </span>
      </div>

      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index}>
            <Skeleton className="mb-1.5 h-3 w-28" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}

        <div className="rounded-lg border border-[#E5E7EB] bg-[#F8F7F2] p-3">
          <Skeleton className="h-3 w-full" />
        </div>

        <div className="flex justify-end border-t border-[#E5E7EB] pt-4">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      <span className="sr-only">
        Loading security settings...
      </span>
    </section>
  );
}

export default Account;