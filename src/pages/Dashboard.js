import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, UserCircle, MessageSquare, TrendingUp, ArrowUpRight,
  Calendar, Clock, Eye, Phone, MapPin, IndianRupee, Home, Image,
  Sparkles, BadgeCheck, RefreshCw, ChevronRight
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    counts: {
      users: 0,
      vendors: 0,
      hostels: 0,
      bookings: 0,
      banners: 0,
      vendorBanners: 0
    },
    latestBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${API}/dashboard`);
      setDashboardData(data.data);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-green-500/20 text-green-400',
      completed: 'bg-blue-500/20 text-blue-400',
      cancelled: 'bg-red-500/20 text-red-400',
      running: 'bg-purple-500/20 text-purple-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const stats = [
    {
      label: "Total Hostels",
      value: dashboardData.counts.hostels,
      change: "+12%",
      icon: Building2,
      sub: "vs last month",
      link: "/dashboard/hostels",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      label: "Total Vendors",
      value: dashboardData.counts.vendors,
      change: "+3%",
      icon: UserCircle,
      sub: "vs last month",
      link: "/dashboard/vendors",
      color: "from-blue-500 to-indigo-500"
    },
    {
      label: "Total Users",
      value: dashboardData.counts.users,
      change: "+28%",
      icon: Users,
      sub: "vs last month",
      link: "/dashboard/customers",
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Total Bookings",
      value: dashboardData.counts.bookings,
      change: "+9%",
      icon: TrendingUp,
      sub: "vs last month",
      link: "/dashboard/bookings",
      color: "from-orange-500 to-red-500"
    },
  ];

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] min-h-screen p-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Dashboard
            <BadgeCheck size={20} className="text-emerald-400" />
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">
            Welcome back, Admin. Here's what's happening.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 
              hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-sm font-bold text-white">Live</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-emerald-400 hover:text-emerald-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stats grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(({ label, value, change, icon: Icon, sub, link, color }) => (
              <div
                key={label}
                onClick={() => navigate(link)}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10
                  hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} 
                    border border-white/20 text-white
                    group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={20} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={11} />
                    {change}
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{value.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-300 mt-0.5">
                  {label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Banner Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Platform Banners</p>
                  <p className="text-3xl font-black text-white mt-1">{dashboardData.counts.banners}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Image size={24} className="text-white" />
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/banners')}
                className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Manage Banners <ChevronRight size={14} />
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Vendor Banners</p>
                  <p className="text-3xl font-black text-white mt-1">{dashboardData.counts.vendorBanners}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Image size={24} className="text-white" />
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/vendor-banners')}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Manage Vendor Banners <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Recent Bookings */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-400" />
                  Recent Bookings
                </h2>
                <button
                  onClick={() => navigate('/dashboard/bookings')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData.latestBookings.slice(0, 5).map((booking, i) => (
                  <div
                    key={booking._id}
                    onClick={() => navigate(`/dashboard/bookings/${booking._id}`)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white truncate">
                          {booking.hostelId?.name || 'Unknown Hostel'}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {booking.userId?.name || 'Guest'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Home size={10} />
                          {booking.roomType} • {booking.shareType}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee size={10} />
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(booking.createdAt).toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                      <Eye size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}

                {dashboardData.latestBookings.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No recent bookings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Overview Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-400" />
                Platform Overview
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Total Revenue</span>
                    <span className="text-white font-black">
                      {formatCurrency(
                        dashboardData.latestBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Booking Completion</span>
                    <span className="text-white font-black">
                      {Math.round((dashboardData.latestBookings.filter(b => b.status === 'completed').length /
                        (dashboardData.latestBookings.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{
                      width: `${Math.round((dashboardData.latestBookings.filter(b => b.status === 'completed').length /
                        (dashboardData.latestBookings.length || 1)) * 100)}%`
                    }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Active Bookings</span>
                    <span className="text-white font-black">
                      {dashboardData.latestBookings.filter(b => b.status === 'running').length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{
                      width: `${(dashboardData.latestBookings.filter(b => b.status === 'running').length /
                        (dashboardData.latestBookings.length || 1)) * 100}%`
                    }} />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Platform Growth</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ArrowUpRight size={12} />
                      +24%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <h3 className="text-xs font-semibold text-gray-400 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">

                  <button
                    onClick={() => navigate('/dashboard/banners')}
                    className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                  >
                    + Add Banner
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Additional Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Avg. Booking Value</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(
                  dashboardData.latestBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) /
                  (dashboardData.latestBookings.length || 1)
                )}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Most Popular Room Type</p>
              <p className="text-xl font-bold text-white">
                {(() => {
                  const types = dashboardData.latestBookings.map(b => b.roomType).filter(Boolean);
                  const mostCommon = types.sort((a, b) =>
                    types.filter(v => v === a).length - types.filter(v => v === b).length
                  ).pop();
                  return mostCommon || 'N/A';
                })()}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Most Popular Sharing</p>
              <p className="text-xl font-bold text-white">
                {(() => {
                  const types = dashboardData.latestBookings.map(b => b.shareType).filter(Boolean);
                  const mostCommon = types.sort((a, b) =>
                    types.filter(v => v === a).length - types.filter(v => v === b).length
                  ).pop();
                  return mostCommon || 'N/A';
                })()}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Success Rate</p>
              <p className="text-xl font-bold text-white">
                {Math.round((dashboardData.latestBookings.filter(b =>
                  b.status === 'confirmed' || b.status === 'completed'
                ).length / (dashboardData.latestBookings.length || 1)) * 100)}%
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;