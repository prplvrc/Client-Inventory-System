import { useEffect, useState } from "react";
import { User, Lock, Save, RefreshCw } from "lucide-react";
import { Skeleton } from "./LoadingSkeleton";
import { API_URL } from "../services/api";

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

  // Fetch Account
  const fetchAccount = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${API_URL}/account`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.status}`);
      }

      const result: AccountData = await response.json();

      setAccount(result);
      setName(result.name ?? "");
      setEmail(result.email ?? "");
      setUsername(result.username ?? "");
    } catch (err) {
      console.error("Fetch account error:", err);
      setError("Unable to load account information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  // Save Profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${API_URL}/account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, username }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update account: ${response.status}`);
      }

      const result: AccountData = await response.json();

      setAccount(result);
      setName(result.name ?? "");
      setEmail(result.email ?? "");
      setUsername(result.username ?? "");

      setSuccess("Account information updated successfully.");
    } catch (err) {
      console.error("Update account error:", err);
      setError("Unable to update account information.");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
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

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${API_URL}/account/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error(`Failed to change password: ${response.status}`);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Password changed successfully.");
    } catch (err) {
      console.error("Change password error:", err);
      setError("Unable to change password. Please check your current password.");
    } finally {
      setSaving(false);
    }
  };

  // Reset
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
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Account
          </h1>
          <p className="text-xs text-gray-500">
            Manage your account information and security settings
          </p>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50/60 p-3 text-xs text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800">
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
          {/* PROFILE INFORMATION */}
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
              <User size={15} className="text-gray-500" />
              <span>Profile Information</span>
            </div>

            <div className="space-y-4 p-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Username */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  value={account?.role ?? ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Account Status
                </label>
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      account?.status?.toLowerCase() === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {account?.status ?? "Unknown"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <RefreshCw size={13} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-md border border-amber-200/60 bg-[#EFEABB] px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={13} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </section>

          {/* CHANGE PASSWORD */}
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Lock size={15} className="text-gray-500" />
              <span>Change Password</span>
            </div>

            <div className="space-y-4 p-4">
              {/* Current Password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div className="rounded-md border border-gray-200 bg-gray-50/50 p-2.5">
                <p className="text-[11px] leading-relaxed text-gray-500">
                  For security, use a password with at least 8 characters.
                </p>
              </div>

              {/* Action */}
              <div className="flex justify-end border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-md border border-amber-200/60 bg-[#EFEABB] px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock size={13} />
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

function ProfileInformationSkeleton() {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" role="status">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
        <User size={15} className="text-gray-400" />
        <span>Profile Information</span>
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}><Skeleton className="mb-1 h-3 w-20" /><Skeleton className="h-8 w-full rounded-md" /></div>
        ))}
        <div><Skeleton className="mb-1 h-3 w-24" /><Skeleton className="h-4 w-14 rounded-full" /></div>
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3"><Skeleton className="h-7 w-14 rounded-md" /><Skeleton className="h-7 w-24 rounded-md" /></div>
      </div>
      <span className="sr-only">Loading profile information...</span>
    </section>
  );
}

function ChangePasswordSkeleton() {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" role="status">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
        <Lock size={15} className="text-gray-400" />
        <span>Change Password</span>
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index}><Skeleton className="mb-1 h-3 w-28" /><Skeleton className="h-8 w-full rounded-md" /></div>
        ))}
        <div className="rounded-md border border-gray-100 bg-gray-50/70 p-2.5"><Skeleton className="h-3 w-full" /></div>
        <div className="flex justify-end border-t border-gray-100 pt-3"><Skeleton className="h-7 w-28 rounded-md" /></div>
      </div>
      <span className="sr-only">Loading security settings...</span>
    </section>
  );
}

export default Account;
