import { Building2, Users, UserCircle, MessageSquare, TrendingUp, ArrowUpRight } from "lucide-react";

const stats = [
  { label: "Total Hostels",   value: "124", change: "+12%", icon: Building2,     sub: "vs last month" },
  { label: "Active Agents",   value: "18",  change: "+3%",  icon: UserCircle,    sub: "vs last month" },
  { label: "Customers",       value: "342", change: "+28%", icon: Users,         sub: "vs last month" },
  { label: "Enquiries",       value: "57",  change: "+9%",  icon: MessageSquare, sub: "vs last month" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] min-h-screen p-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">
            Welcome back, Admin. Here's what's happening.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">Live</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon, sub }) => (
          <div
            key={label}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10
              hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
                border border-white/20 text-white
                group-hover:scale-110 transition-transform duration-200">
                <Icon size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                <ArrowUpRight size={11} />
                {change}
              </span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{value}</p>
            <p className="text-sm font-semibold text-gray-300 mt-0.5">
              {label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Recent activity */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-gray-300 uppercase tracking-wider">
              Recent Activity
            </h2>
            <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { action: "New hostel added",    detail: "Sunrise PG · KPHB",         time: "2m ago"  },
              { action: "Agent registered",    detail: "Ravi Kumar · Hyderabad",     time: "18m ago" },
              { action: "New enquiry",         detail: "3 Share · Madhapur",         time: "1h ago"  },
              { action: "Customer onboarded",  detail: "Priya Sharma · Kukatpally",  time: "3h ago"  },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.action}</p>
                  <p className="text-xs text-gray-400 truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-300 mb-4">Monthly Overview</h2>
          <div className="space-y-4">
            {[
              { label: "Occupancy Rate", value: "78%",  bar: 78  },
              { label: "New Bookings",   value: "43",   bar: 60  },
              { label: "Revenue",        value: "₹2.4L", bar: 85 },
            ].map(({ label, value, bar }) => (
              <div key={label}>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-white font-black">{value}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;