import logo from "../assets/denberts-logo.png";

function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 select-none">

      {/* Login Container */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#E3DEA8] bg-[#EFEABB] p-3 shadow-[0_15px_35px_rgba(0,0,0,0.08)] transition-all sm:p-7">

        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Denbert's Logo"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
            }}
          />

          <h1 className="text-3xl font-bold text-black">
            Login
          </h1>
        </div>

        {/* Email Field */}
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
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#D8D18A]"
            placeholder="denbert@gmail.com"
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
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
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#D8D18A]"
            placeholder="********"
            autoComplete="current-password"
          />
        </div>

        {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Login
            </button>

            {/* Forgot Password */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Forgot password? Contact your administrator to reset it.
            </p>


      </div>
    </div>
  );
}

export default Login;