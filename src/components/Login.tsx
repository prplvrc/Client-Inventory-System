import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/denberts-logo.png";
import { apiRequest } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "STAFF";
    status: "ACTIVE" | "INACTIVE";

    branch: {
    id: number;
    code: "BRANCH_1" | "BRANCH_2";
    name: string;
  };
  };
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      setResetMessage("Password reset instructions have been sent to your email.");
    } catch (err) {
      console.error("Forgot password error:", err);
      setResetError(
        err instanceof Error ? err.message : "Unable to send reset email. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!result.user || !result.user.id) {
        throw new Error("Invalid login response from server.");
      }

      login(result.user, rememberMe);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 select-none"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(255, 226, 100, 0.28), transparent 30%), radial-gradient(circle at 100% 100%, rgba(255, 226, 100, 0.28), transparent 30%)",
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#E3DEA8]/60 bg-[#F0EBB7] p-8 shadow-xl">
        {/* HEADER */}
        <div className="mb-6 -mt-2 flex flex-col items-center">
          <img
            src={logo}
            alt="Denbert's Logo"
            className="mb-1 h-16 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Login
          </h1>
          <p className="mt-1 text-xs text-gray-700">Sign in to continue</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-gray-800"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="denberts@gmail.com"
              autoComplete="email"
              required
              disabled={loading}
              className="w-full rounded-lg border border-gray-400 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-gray-800"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
              className="w-full rounded-lg border border-gray-400 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* REMEMBER ME + FORGOT PASSWORD */}
          <div className="flex items-center justify-between pt-1">
            <label
              htmlFor="rememberMe"
              className="flex cursor-pointer items-center gap-2 text-xs text-gray-800"
            >
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                disabled={loading}
                className="h-4 w-4 cursor-pointer rounded border-gray-400 accent-black"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
              className="text-xs font-medium text-gray-900 hover:underline focus:outline-none disabled:cursor-not-allowed"
            >
              Forgot password?
            </button>
          </div>

          {/* SIGN IN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
            <p className="mt-1 text-xs text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {resetError && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-800">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="denberts@gmail.com"
                  required
                  disabled={resetLoading}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage("");
                    setResetError("");
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="rounded-md bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-500"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;