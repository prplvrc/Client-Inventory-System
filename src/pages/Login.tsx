import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/denberts-logo.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: Connect this to your Express backend authentication
    console.log("Login attempt:", {
      email,
      password,
    });

    // Temporary navigation for testing
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 select-none">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#E3DEA8] bg-[#EFEABB] p-3 shadow-[0_15px_35px_rgba(0,0,0,0.08)] transition-all sm:p-7">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Denbert's Logo"
            className="h-[100px] w-[100px] object-contain"
          />

          <h1 className="text-3xl font-bold text-black">
            Login
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mt-8 flex flex-col">
            <label
              htmlFor="email"
              className="mb-2 text-base font-normal text-black"
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#D8D18A]"
              placeholder="denbert@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="mt-6 flex flex-col">
            <label
              htmlFor="password"
              className="mb-2 text-base font-normal text-black"
            >
              Password
            </label>

            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#D8D18A]"
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="mt-8 w-full rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Login
          </button>

          {/* Forgot Password */}
          <p className="mt-4 text-center text-sm text-gray-500">
            Forgot password? Contact your administrator to reset it.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;