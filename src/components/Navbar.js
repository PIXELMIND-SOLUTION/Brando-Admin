import { useState, useEffect } from "react";
import { Bell, Search, ChevronDown, Settings, X, Loader2 } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API =
    "http://187.127.146.52:2003/api/auth/search-filter-hostels?search=";

  // ESC close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Search API
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API}${query}`);

        setResults(res.data?.hostels || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <>
      {/* NAVBAR */}
      <div className="bg-[#0f172a]/90 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] px-4 md:px-6 py-3 flex items-center justify-between gap-4 border-b border-white/10">

        {/* Search */}
        <div
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 max-w-sm ml-12 md:ml-0 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-colors"
        >
          <Search size={15} className="text-gray-400" />
          <span className="text-sm text-gray-500">
            Search hostels, agents...
          </span>
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

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[999] bg-[#0f172a]/95 backdrop-blur-lg flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">

            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Search size={20} />
              Search
            </div>

            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

          </div>

          {/* Scrollable Search Area */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center pt-20 px-4">

            <div className="w-full max-w-3xl">

              {/* Search Input */}
              <div className="flex items-center gap-3 border border-white/10 rounded-2xl px-6 py-4 focus-within:ring-4 focus-within:ring-emerald-500/20 bg-white/5">

                <Search size={22} className="text-emerald-400" />

                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hostels..."
                  className="w-full text-lg outline-none bg-transparent text-white placeholder-gray-500"
                />

              </div>

              {/* Loading */}
              {loading && (
                <div className="flex justify-center mt-6">
                  <Loader2 className="animate-spin text-emerald-400" />
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <div className="mt-6 space-y-3 pb-20">

                  {results.map((item) => (

                    <div
                      key={item._id}
                      className="p-4 rounded-xl hover:bg-white/10 cursor-pointer border border-white/10 transition-colors"
                    >

                      <p className="font-semibold text-white">
                        {item.name || "Hostel"}
                      </p>

                      <p className="text-sm text-gray-400">
                        Lat: {item.location?.coordinates?.[1] || "N/A"} ,
                        Lng: {item.location?.coordinates?.[0] || "N/A"}
                      </p>

                    </div>

                  ))}

                </div>
              )}

              {/* No results */}
              {!loading && query && results.length === 0 && (
                <p className="text-center text-gray-500 mt-6">
                  No results found
                </p>
              )}

            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default Navbar;