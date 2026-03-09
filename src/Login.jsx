import React, { useState } from "react";
import { Mail, Lock, CalendarDays } from "lucide-react";
import api from "./api/api";
import { useAuth } from "./context/AuthContext";
import LogoImage from "../src/assets/Container.png"

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        // AuthContext handles localStorage — no need for manual calls
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-[#F9FAFB]">
      {/* Header section containing logos */}
      <header className="w-full flex justify-between items-center p-6 md:p-8 absolute top-0 z-20">
        <div className="flex items-center gap-2">
          {/* Placeholder for left logo, matching the blue academic logo in ref */}
          <div className="flex flex-col">
        <img src={LogoImage} alt="Logo" className="w-[250px] h-[70px] object-cover" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#E47926] p-4 rounded-2xl text-white">
<svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none">
  <path d="M6.25 5.83333L5.45833 7.54167L3.75 8.33333L5.45833 9.125L6.25 10.8333L7.04167 9.125L8.75 8.33333L7.04167 7.54167L6.25 5.83333ZM11.25 5.83333L10.7083 6.95833L9.58333 7.5L10.7083 8.04167L11.25 9.16667L11.7917 8.04167L12.9167 7.5L11.7917 6.95833L11.25 5.83333ZM1.66667 0L3.33333 3.33333H5.83333L4.16667 0H5.83333L7.5 3.33333H10L8.33333 0H10L11.6667 3.33333H14.1667L12.5 0H15C15.4583 0 15.8507 0.163194 16.1771 0.489583C16.5035 0.815972 16.6667 1.20833 16.6667 1.66667V11.6667C16.6667 12.125 16.5035 12.5174 16.1771 12.8438C15.8507 13.1701 15.4583 13.3333 15 13.3333H1.66667C1.20833 13.3333 0.815972 13.1701 0.489583 12.8438C0.163194 12.5174 0 12.125 0 11.6667V1.66667C0 1.20833 0.163194 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0ZM1.66667 5V11.6667H15V5H1.66667ZM1.66667 5V11.6667V5Z" fill="white"/>
</svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 leading-tight">
              Media Lab
            </span>
            <span className="text-gray-500 text-sm">Inventory System</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full ">
        {/* Login Form Card */}
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[440px] border border-gray-100 relative z-20">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4 text-[#E47926]">
              <CalendarDays size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm">
              Log in to manage your inventory
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="email"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@kristujayanti.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-[#E47926] hover:text-[#c4651f] transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E47926] hover:bg-[#c4651f] text-white font-medium py-2.5 rounded-lg transition-colors mt-2 text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{" "}
              <a
                href="#"
                className="font-medium text-[#E47926] hover:text-[#c4651f]"
              >
                Contact Admin
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* 3D Illustration - Only visible on lg screens, fixed to bottom right */}
       <div className="fixed right-0 bottom-0 w-[28%] pointer-events-none z-0 overflow-hidden flex flex-col items-center">
        <img
          src="/camera.png"
          alt="Camera illustration"
          className="w-[80%] max-w-[620px] object-contain drop-shadow-2xl opacity-90 select-none"
          style={{ filter: "drop-shadow(0 24px 48px rgba(228,121,38,0.18))" }}
        />
      </div>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs font-medium text-gray-500 absolute bottom-0 z-20">
        <div className="flex justify-center mb-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          </div>
        </div>
        © Designed & Developed by Kristu Jayanti Software Development Centre
      </footer>
    </div>
  );
};

export default Login;
