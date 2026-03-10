import { useState, useEffect } from "react";
import { Bell, Search, ChevronDown, Settings, X, Loader2 } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API =
    "http://31.97.206.144:2003/api/auth/search-filter-hostels?search=";

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
      <div className="bg-white/90 backdrop-blur-sm shadow-[0_4px_20px_rgba(255,0,0,0.15)] px-4 md:px-6 py-3 flex items-center justify-between gap-4 border-b-2 border-red-500">

        {/* Search */}
        <div
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-yellow-50 border border-red-200 rounded-xl px-3 py-2 flex-1 max-w-sm ml-12 md:ml-0 cursor-pointer hover:border-red-400"
        >
          <Search size={15} className="text-red-400" />
          <span className="text-sm text-red-300">
            Search hostels, agents...
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Settings */}
          <button className="p-2 rounded-xl hover:bg-red-100 text-red-400 hidden sm:flex">
            <Settings size={18} />
          </button>

          {/* Bell */}
          <button className="relative p-2 rounded-xl hover:bg-red-100 text-red-400">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 cursor-pointer hover:bg-red-100 rounded-xl px-2.5 py-1.5">

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white text-sm font-black">
              A
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-800">Admin</p>
              <p className="text-[11px] text-red-500">Super Admin</p>
            </div>

            <ChevronDown size={14} className="text-red-400 hidden sm:block" />
          </div>

        </div>
      </div>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[999] bg-white/95 backdrop-blur-lg flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">

            <div className="flex items-center gap-2 text-red-500 font-bold">
              <Search size={20} />
              Search
            </div>

            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 hover:bg-red-100 rounded-lg"
            >
              <X size={20} />
            </button>

          </div>

          {/* Scrollable Search Area */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center pt-20 px-4">

            <div className="w-full max-w-3xl">

              {/* Search Input */}
              <div className="flex items-center gap-3 border-2 border-red-200 rounded-2xl px-6 py-4 focus-within:ring-4 focus-within:ring-red-200">

                <Search size={22} className="text-red-400" />

                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hostels..."
                  className="w-full text-lg outline-none"
                />

              </div>

              {/* Loading */}
              {loading && (
                <div className="flex justify-center mt-6">
                  <Loader2 className="animate-spin text-red-500" />
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <div className="mt-6 space-y-3 pb-20">

                  {results.map((item) => (

                    <div
                      key={item._id}
                      className="p-4 rounded-xl hover:bg-red-50 cursor-pointer border transition"
                    >

                      <p className="font-semibold text-gray-800">
                        {item.name || "Hostel"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Lat: {item.location?.coordinates?.[1] || "N/A"} ,
                        Lng: {item.location?.coordinates?.[0] || "N/A"}
                      </p>

                    </div>

                  ))}

                </div>
              )}

              {/* No results */}
              {!loading && query && results.length === 0 && (
                <p className="text-center text-gray-400 mt-6">
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