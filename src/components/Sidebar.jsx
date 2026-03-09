import React from "react";
import {
  LayoutDashboard,
  PlusSquare,
  ArrowLeftRight,
  Database,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ currentView, onNavigate }) => {
  const { logout, user } = useAuth();
  return (
    <aside className="w-[240px] h-screen bg-white flex flex-col hidden md:flex sticky top-0 border-r border-gray-100/50">
      {/* Logo */}
      <div className="h-[88px] px-8 flex items-center gap-3 border-b border-gray-100 flex-shrink-0">
        <div className="bg-[#E47926] p-3 rounded-2xl text-white shadow-sm shadow-orange-500/20">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 17 14" fill="none">
  <path d="M6.25 5.83333L5.45833 7.54167L3.75 8.33333L5.45833 9.125L6.25 10.8333L7.04167 9.125L8.75 8.33333L7.04167 7.54167L6.25 5.83333ZM11.25 5.83333L10.7083 6.95833L9.58333 7.5L10.7083 8.04167L11.25 9.16667L11.7917 8.04167L12.9167 7.5L11.7917 6.95833L11.25 5.83333ZM1.66667 0L3.33333 3.33333H5.83333L4.16667 0H5.83333L7.5 3.33333H10L8.33333 0H10L11.6667 3.33333H14.1667L12.5 0H15C15.4583 0 15.8507 0.163194 16.1771 0.489583C16.5035 0.815972 16.6667 1.20833 16.6667 1.66667V11.6667C16.6667 12.125 16.5035 12.5174 16.1771 12.8438C15.8507 13.1701 15.4583 13.3333 15 13.3333H1.66667C1.20833 13.3333 0.815972 13.1701 0.489583 12.8438C0.163194 12.5174 0 12.125 0 11.6667V1.66667C0 1.20833 0.163194 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0ZM1.66667 5V11.6667H15V5H1.66667ZM1.66667 5V11.6667V5Z" fill="white"/>
</svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-[17px] leading-tight tracking-tight">
            Media Lab
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 flex flex-col gap-1">
        <button
          onClick={() => onNavigate?.("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[13px] transition-all ${
            currentView === "dashboard"
              ? "bg-orange-50/80 text-[#E47926] shadow-sm shadow-orange-500/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 group"
          }`}
        >
          <LayoutDashboard
            size={20}
            className={
              currentView === "dashboard"
                ? "stroke-[2.5px]"
                : "group-hover:stroke-[2.5px] transition-all"
            }
          />
          Dashboard
        </button>
        <button
          onClick={() => onNavigate?.("add-item")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[13px] transition-all ${
            currentView === "add-item"
              ? "bg-orange-50/80 text-[#E47926] shadow-sm shadow-orange-500/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 group"
          }`}
        >
          <PlusSquare
            size={20}
            className={
              currentView === "add-item"
                ? "stroke-[2.5px]"
                : "group-hover:stroke-[2.5px] transition-all"
            }
          />
          Add Item
        </button>
        <button
          onClick={() => onNavigate?.("movement")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[13px] transition-all ${
            currentView === "movement"
              ? "bg-orange-50/80 text-[#E47926] shadow-sm shadow-orange-500/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 group"
          }`}
        >
          <ArrowLeftRight
            size={20}
            className={
              currentView === "movement"
                ? "stroke-[2.5px]"
                : "group-hover:stroke-[2.5px] transition-all"
            }
          />
          Movement
        </button>
        <button
          onClick={() => onNavigate?.("inventory")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[13px] transition-all ${
            currentView === "inventory"
              ? "bg-orange-50/80 text-[#E47926] shadow-sm shadow-orange-500/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 group"
          }`}
        >
          <Database
            size={20}
            className={
              currentView === "inventory"
                ? "stroke-[2.5px]"
                : "group-hover:stroke-[2.5px] transition-all"
            }
          />
          Inventory
        </button>

        {/* Settings Section */}
        <div className="pt-10 pb-3">
          <p className="px-4 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
            SETTINGS
          </p>
        </div>
        <button
          onClick={() => onNavigate?.("configuration")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[13px] transition-all ${
            currentView === "configuration"
              ? "bg-orange-50/80 text-[#E47926] shadow-sm shadow-orange-500/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 group"
          }`}
        >
          <Settings
            size={20}
            className={
              currentView === "configuration"
                ? "stroke-[2.5px]"
                : "group-hover:stroke-[2.5px] transition-all"
            }
          />
          Configuration
        </button>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 rounded-xl font-medium text-sm transition-all group"
        >
          <HelpCircle
            size={20}
            className="group-hover:stroke-[2.5px] transition-all"
          />
          Help Center
        </a>
      </nav>

      {/* User Profile + Logout */}
      <div className="p-4 mb-4 mx-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50/80 transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors flex-shrink-0">
            <span className="text-[#E47926] font-bold text-sm">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "NK"}
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-gray-900 leading-tight truncate">
              {user?.name || "Admin"}
            </span>
            <span className="text-xs text-gray-400 font-medium mt-0.5 truncate">
              {user?.email || "Lab Manager"}
            </span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
