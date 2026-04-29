import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  BadgeCheck,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  TrendingUp,
} from "lucide-react";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
        "http://187.127.146.52:2003/api/Admin/login",
        { email, password }
      );
      console.log(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] flex items-center justify-center p-6">

      {/* Ambient floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            top: "-10%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            bottom: "-10%",
            right: "-5%",
            background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">

        {/* Brand header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 border border-white/20 text-white overflow-hidden">
            <img
              src={logo}
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              Brando Admin
              <BadgeCheck size={16} className="text-emerald-400" />
            </h1>
            <p className="text-xs text-gray-400 font-medium">Hostel Management System</p>
          </div>

          {/* Live badge */}
          <div className="ml-auto flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5">
            <TrendingUp size={13} className="text-emerald-400" />
            <span className="text-xs font-bold text-white">Live</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-black text-white tracking-tight">
              Welcome back, Admin.
            </h2>
            <p className="text-sm text-gray-400 mt-0.5 font-medium">
              Sign in to access your dashboard.
            </p>
          </div>

          <div className="h-px bg-white/10 mb-6" />

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail size={11} className="text-emerald-400" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@hostel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(16,185,129,0.5)";
                  e.target.style.background = "rgba(16,185,129,0.05)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.background = "rgba(255,255,255,0.05)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock size={11} className="text-emerald-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(16,185,129,0.5)";
                    e.target.style.background = "rgba(16,185,129,0.05)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.target.style.background = "rgba(255,255,255,0.05)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 6px 28px rgba(16,185,129,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-gray-500">Restricted access only</p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
              v2.4.1
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Hostel Management System · Admin Portal
        </p>
      </div>
    </div>
  );
};

export default Login;