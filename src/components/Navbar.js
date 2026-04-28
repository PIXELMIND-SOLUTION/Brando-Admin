import { Bell, ChevronDown, Settings } from "lucide-react";

const Navbar = () => {
  return (
    <>
      {/* NAVBAR */}
      <div className="bg-[#0f172a]/90 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] px-4 md:px-6 py-3 flex items-center justify-between gap-4 border-b border-white/10">

        {/* Left (empty or logo space) */}
        <div className="flex-1 ml-12 md:ml-0">
          {/* You can add logo/title here if needed */}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Settings */}
          <button className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white hidden sm:flex transition-colors">
            <Settings size={18} />
          </button>

          {/* Bell */}
          <button className="relative p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0f172a]" />
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 cursor-pointer hover:bg-white/10 rounded-xl px-2.5 py-1.5 transition-colors">

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-black">
              A
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white">Admin</p>
              <p className="text-[11px] text-emerald-400">Super Admin</p>
            </div>

            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </div>

        </div>
      </div>
    </>
  );
};

export default Navbar;