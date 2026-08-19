import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/denberts-logo.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Login attempt:", {
      email,
      password,
      rememberMe,
    });

    // Temporary navigation for testing
    navigate("/dashboard");
  };

  const handleGoogleLogin = () => {
    console.log("Continue with Google");
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 select-none"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(255, 226, 100, 0.28), transparent 30%), radial-gradient(circle at 100% 100%, rgba(255, 226, 100, 0.28), transparent 30%)",
      }}
    >
      {/* Container: standard width with modern padding and subtle border */}
      <div className="w-full max-w-sm rounded-2xl border border-[#E3DEA8]/60 bg-[#F0EBB7] p-8 shadow-xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 -mt-2">
          <img
            src={logo}
            alt="Denbert's Logo"
            className="h-16 w-auto object-contain mb-1"
          />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Login
          </h1>
          <p className="text-xs text-gray-700 mt-1">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-gray-800"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="denbert@gmail.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-400 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Password */}
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
              className="w-full rounded-lg border border-gray-400 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Remember Me & Forgot Password Side-by-Side */}
          <div className="flex items-center justify-between pt-1">
            <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer text-xs text-gray-800">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-gray-400 accent-black cursor-pointer"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => console.log("Forgot password")}
              className="text-xs font-medium text-gray-900 hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-gray-400/40" />
            <span className="absolute bg-[#F0EBB7] px-2 text-xs text-gray-600">or</span>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-400 bg-white py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
              />
              <path
                fill="#34A853"
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"
              />
              <path
                fill="#FBBC05"
                d="M6.54 13.59a5.86 5.86 0 0 1 0-3.18V7.88H3.3a9.5 9.5 0 0 0 0 8.24l3.24-2.53Z"
              />
              <path
                fill="#EA4335"
                d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;