import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Box } from "lucide-react";
import api from "../api/api";

const Topbar = ({ title = "Dashboard Overview", onNavigate }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/items?search=${encodeURIComponent(q)}`);
      const items = res.data?.items ?? res.data ?? [];
      setResults(items.slice(0, 6));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    if (onNavigate) onNavigate("inventory");
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const statusColors = {
    Available: "bg-emerald-50 text-emerald-600",
    Issued: "bg-amber-50 text-amber-600",
    Maintenance: "bg-red-50 text-red-500",
    Retired: "bg-gray-100 text-gray-400",
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20 w-full flex-shrink-0">
      <div className="flex items-center justify-between pl-10 pr-[2%] h-[88px] mx-auto w-full">
        <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">
          {title}
        </h1>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-64 md:w-80" ref={containerRef}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={handleChange}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search inventory, users..."
              className="w-full pl-11 pr-9 py-3 bg-white border border-gray-100 hover:border-gray-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all text-gray-700 placeholder:text-gray-400 font-semibold"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-gray-500 transition"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown */}
            {open && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/60 overflow-hidden z-50">
                {loading && (
                  <div className="px-4 py-5 text-[12px] text-gray-400 font-medium text-center">
                    Searching...
                  </div>
                )}
                {!loading && results.length === 0 && (
                  <div className="px-4 py-5 text-[12px] text-gray-400 font-medium text-center">
                    No results for "{query}"
                  </div>
                )}
                {!loading && results.length > 0 && (
                  <>
                    <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                      Inventory Items
                    </div>
                    <ul>
                      {results.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={handleSelect}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <Box size={14} className="text-[#E47926]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-gray-400 font-medium truncate">
                                {item.asset_tag} · {item.category}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                                statusColors[item.status] ??
                                "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {item.status}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-gray-50 px-4 py-2">
                      <button
                        onClick={handleSelect}
                        className="text-[12px] font-bold text-[#E47926] hover:text-[#c4651f] transition-colors"
                      >
                        View all results in Inventory →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
