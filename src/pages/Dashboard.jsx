import React, { useState, useEffect } from "react";
import api from "../api/api";
import {
  Package,
  Send,
  AlertTriangle,
  Wrench,
  ChevronDown,
  Crosshair,
  FileText,
} from "lucide-react";

/* ── helpers ── */
const buildWeekActivity = (items) => {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  items.forEach((item) => {
    const d = new Date(item.created_at);
    if (d >= weekStart) counts[d.getDay()]++;
  });
  const max = Math.max(...counts, 1);
  return days.map((day, i) => ({
    day,
    count: counts[i],
    h: `${Math.round((counts[i] / max) * 100)}%`,
    active: counts[i] > 0,
  }));
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  // Same calendar day → only overdue after 4:30 PM
  if (due.toDateString() === now.toDateString()) {
    const cutoff = new Date(now);
    cutoff.setHours(16, 30, 0, 0);
    return now > cutoff;
  }
  // Any past day → overdue
  return due < now;
};

/* For each movement, explode into per-item rows */
const buildActivityRows = (movements) => {
  const rows = [];
  movements.forEach((mv) => {
    const isReturned = mv.type === "return" || !!mv.returned_at;
    const overdue =
      !isReturned && mv.type === "issue" && isOverdue(mv.due_date);
    (mv.items || []).forEach((it) => {
      rows.push({
        mvId: mv.id,
        itemName: it.name,
        assetTag: it.asset_tag,
        category: it.category,
        imageUrl: it.image_url,
        issuedTo: mv.borrower_name,
        role: mv.role,
        borrowerId: mv.borrower_id,
        contact: mv.contact,
        dueDate: mv.due_date,
        returnedAt: mv.returned_at,
        purpose: mv.purpose,
        comments: mv.comments,
        type: mv.type,
        createdAt: mv.created_at,
        overdue,
        status: isReturned ? "Returned" : overdue ? "Overdue" : "Issued",
      });
    });
  });
  return rows;
};

const StatusPill = ({ status }) => {
  const s = {
    Issued: "bg-blue-50 text-blue-600",
    Overdue: "bg-red-50 text-red-600",
    Returned: "bg-green-50 text-green-600",
    "Under Service": "bg-orange-50 text-orange-600",
  };
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-[10px] font-normal uppercase tracking-widest ${s[status] ?? "bg-gray-50 text-gray-500"}`}
    >
      {status}
    </span>
  );
};

/* ── main ── */
const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalItems: 0,
    available: 0,
    categories: 0,
    lowStock: 0,
  });
  const [items, setItems] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [movements, setMovements] = useState([]);
  const [actPage, setActPage] = useState(0);
  const [activeTab, setActiveTab] = useState("items");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  const PAGE_SIZE = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes, mvRes] = await Promise.all([
          api.get("/items/stats"),
          api.get("/items"),
          api.get("/movements"),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (itemsRes.data.success) {
          setItems(itemsRes.data.items);
          setChartData(buildWeekActivity(itemsRes.data.items));
        }
        if (mvRes.data.success) setMovements(mvRes.data.movements);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allActivityRows = buildActivityRows(movements);
  const activityRows = showOverdueOnly
    ? allActivityRows.filter((r) => r.overdue)
    : allActivityRows;
  const totalPages = Math.ceil(activityRows.length / PAGE_SIZE) || 1;
  const pageRows = activityRows.slice(
    actPage * PAGE_SIZE,
    actPage * PAGE_SIZE + PAGE_SIZE,
  );

  const handleExportCSV = () => {
    const headers = [
      "Item Name",
      "Asset Tag",
      "Category",
      "Issued To",
      "Role",
      "Borrower ID",
      "Contact",
      "Due Date",
      "Returned On",
      "Status",
      "Purpose",
      "Comments",
      "Type",
      "Date",
    ];
    const fmt = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
    const rows = activityRows.map((r) => [
      r.itemName,
      r.assetTag,
      r.category,
      r.issuedTo,
      r.role,
      r.borrowerId,
      r.contact,
      r.type === "return" ? "" : fmt(r.dueDate),
      r.type === "return" ? fmt(r.createdAt) : fmt(r.returnedAt),
      r.status,
      r.purpose,
      r.comments,
      r.type === "issue" ? "Issue" : "Return",
      fmt(r.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 relative font-sans">
      {/* ── Right-side camera panel ── */}
      <div className="fixed right-0 bottom-0 w-[28%] pointer-events-none z-0 overflow-hidden flex flex-col items-center">
        <img
          src="/mic.png"
          alt="Camera illustration"
          className="w-[80%] max-w-[320px] object-contain drop-shadow-2xl opacity-90 select-none"
          style={{ filter: "drop-shadow(0 24px 48px rgba(228,121,38,0.18))" }}
        />
      </div>

      <main className="pl-10 pr-[32%] py-8 max-w-[1600px] mx-auto">
        {/* ── Stats Grid ── */}
        <div className="grid  grid-cols-1 xl:grid-cols-4 gap-3 mb-4">
          {[
            {
              label: "Total Items",
              value: stats.totalItems,
              icon: Package,
              color: "#E47926",
              bg: "bg-orange-50",
              bar: "bg-[#E47926]",
              w: "80%",
            },
            {
              label: "Available Items",
              value: stats.available,
              icon: Send,
              color: "#3b82f6",
              bg: "bg-blue-50",
              bar: "bg-blue-500",
              w: "45%",
            },
            {
              label: "Low Stock",
              value: stats.lowStock,
              icon: AlertTriangle,
              color: "#ef4444",
              bg: "bg-red-50",
              bar: "bg-red-500",
              w: "15%",
              red: true,
            },
            {
              label: "Categories",
              value: stats.categories,
              icon: Wrench,
              color: "#f59e0b",
              bg: "bg-yellow-50",
              bar: "bg-yellow-500",
              w: "30%",
            },
          ].map(({ label, value, icon: Icon, color, bg, bar, w, red }) => (
            <div
              key={label}
              className="bg-white p-7 border border-gray-100 rounded-[12px]  flex flex-col relative overflow-hidden h-40"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}
                style={{ color }}
              >
                <Icon size={22} className="stroke-[1.5px]" />
              </div>
              <p className="text-sm font-semibold text-gray-400 mb-1 tracking-wide">
                {label}
              </p>
              <h3
                className={`text-4xl font-normal tracking-tight ${red ? "text-red-500" : "text-gray-900"}`}
              >
                {value}
              </h3>
              <div className="absolute bottom-6 left-7 right-7 h-[3px] bg-gray-100 rounded-full overflow-hidden">
                <div className={`${bar} h-full`} style={{ width: w }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts & Actions ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-4">
          {/* Activity Chart */}
          <div className="bg-white border border-gray-100 p-8 rounded-[12px] xl:col-span-2 min-h-[380px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Activity Overview
                </h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                  Items added this week
                </p>
              </div>
              <button className="flex items-center gap-2 text-[11px] font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                This Week <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Total Added
                </p>
                <p
                  className="text-2xl font-normal
                 text-gray-900"
                >
                  {stats.totalItems}
                </p>
              </div>
              {stats.lowStock > 0 && (
                <div className="pl-6 border-l border-gray-100">
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-1">
                    Low Stock
                  </p>
                  <p className="text-2xl font-normal text-red-500">
                    {stats.lowStock}
                  </p>
                </div>
              )}
            </div>
            <div className="flex-1 flex items-end gap-3 mt-auto pb-2">
              {(chartData.length > 0
                ? chartData
                : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                    (d) => ({ day: d, h: "0%", active: false, count: 0 }),
                  )
              ).map((col, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-3"
                >
                  <div
                    className="w-full relative flex flex-col justify-end"
                    style={{ height: "160px" }}
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 bg-gray-50 rounded-t-lg"
                      style={{ height: "100%" }}
                    ></div>
                    <div
                      className={`relative rounded-t-lg transition-all duration-700 ${col.active ? "bg-[#E47926]" : "bg-gray-100"}`}
                      style={{ height: col.h || "4px", minHeight: "4px" }}
                    >
                      {col.active && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-normal text-[#E47926]">
                          {col.count}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                    {col.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 p-8 rounded-[12px] flex flex-col min-h-[380px]">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="space-y-4 flex-1">
              {[
                {
                  label: "Overdue Items",
                  sub: "View return overdue items",
                  icon: AlertTriangle,
                  bg: "bg-red-50/50 group-hover:bg-red-50",
                  color: "text-red-400 group-hover:text-red-500",
                  onClick: () => {
                    setActiveTab("activity");
                    setShowOverdueOnly(true);
                    setActPage(0);
                    document
                      .getElementById("dashboard-tabs")
                      ?.scrollIntoView({ behavior: "smooth" });
                  },
                },
                {
                  label: "Scan Item",
                  sub: "Check-in via barcode",
                  icon: Crosshair,
                  bg: "bg-blue-50/50 group-hover:bg-blue-50",
                  color: "text-blue-400 group-hover:text-blue-500",
                  onClick: null,
                },
                {
                  label: "Generate Report",
                  sub: "Export inventory status",
                  icon: FileText,
                  bg: "bg-purple-50/50 group-hover:bg-purple-50",
                  color: "text-purple-400 group-hover:text-purple-500",
                  onClick: handleExportCSV,
                },
              ].map(({ label, sub, icon: Icon, bg, color, onClick }) => (
                <button
                  key={label}
                  onClick={onClick || undefined}
                  disabled={!onClick}
                  className={`w-full flex items-center gap-4 p-4 rounded-[24px] border border-gray-100 transition-all group text-left ${
                    onClick
                      ? "hover:bg-gray-50 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${bg} ${color}`}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">
                      {label}
                    </h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs (Recent Items / Activity) ── */}
        <div
          id="dashboard-tabs"
          className="bg-white rounded-[12px] border border-gray-100  overflow-hidden w-full mb-4"
        >
          <div className="px-8 pt-6 flex justify-between items-center bg-gray-50/30 border-b border-gray-100">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("items")}
                className={`text-[15px] font-bold pb-4 border-b-2 transition-colors -mb-[1px] ${activeTab === "items" ? "border-[#E47926] text-[#E47926]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Recent Items
              </button>
              <button
                onClick={() => {
                  setActiveTab("activity");
                  setActPage(0);
                }}
                className={`text-[15px] font-bold pb-4 border-b-2 transition-colors -mb-[1px] ${activeTab === "activity" ? "border-[#E47926] text-[#E47926]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Recent Activity
              </button>
            </div>
            <div className="flex items-center gap-6 pb-2">
              {activeTab === "activity" && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer touch-none select-none">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={showOverdueOnly}
                        onChange={(e) => {
                          setShowOverdueOnly(e.target.checked);
                          setActPage(0);
                        }}
                        className="peer sr-only"
                      />
                      <div
                        className={`w-9 h-5 rounded-full transition-colors ${showOverdueOnly ? "bg-red-500" : "bg-gray-200"}`}
                      ></div>
                      <div
                        className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showOverdueOnly ? "translate-x-4 shadow-sm" : "shadow-sm"}`}
                      ></div>
                    </div>
                    <span
                      className={`text-[13px] font-bold transition-colors ${showOverdueOnly ? "text-red-600" : "text-gray-500"}`}
                    >
                      Overdue Only
                    </span>
                  </label>
                  <button
                    onClick={handleExportCSV}
                    disabled={activityRows.length === 0}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-100 transition-all disabled:opacity-40"
                  >
                    <FileText size={13} />
                    Export CSV
                  </button>
                </>
              )}
              <a
                href="#"
                className="text-sm font-bold text-[#E47926] hover:text-[#c4651f] transition-colors px-4 py-2 rounded-lg hover:bg-orange-50"
              >
                View all
              </a>
            </div>
          </div>

          {activeTab === "items" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr>
                    {[
                      "Item",
                      "Category",
                      "Location",
                      "Stock",
                      "Date Added",
                      "Status",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`py-4 ${i === 0 ? "px-8" : "px-4"} text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 5 ? "text-right px-8" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-12 text-gray-400 text-sm font-medium"
                      >
                        No items yet — add your first item to get started.
                      </td>
                    </tr>
                  )}
                  {items.slice(0, 5).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.image_url ? (
                              <img
                                src={`http://localhost:5000${item.image_url}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[9px] font-bold text-gray-300">
                                IMG
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-900">
                              {item.name || "—"}
                            </p>
                            <p className="text-[11px] font-medium text-gray-400">
                              {item.asset_tag}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1.5 rounded-md font-bold text-[11px] bg-gray-50 text-gray-600 border border-gray-100/50">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[12px] font-medium text-gray-500">
                        {item.location_room || "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[13px]">
                        <span className="font-bold text-green-600">
                          {item.available_quantity}
                        </span>
                        <span className="text-gray-400 font-medium">
                          {" "}
                          / {item.initial_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[12px] font-medium text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-right">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-normal tracking-wide uppercase ${item.status === "Available" ? "bg-green-50 text-green-600" : item.status === "Damaged" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "activity" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr>
                      {[
                        "Item Name",
                        "Category",
                        "Issued To",
                        "Role",
                        "ID",
                        "Contact",
                        "Due Date",
                        "Status",
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`py-4 ${i === 0 ? "px-8" : "px-4"} text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 7 ? "text-right pr-8" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activityRows.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-12 text-gray-400 text-sm font-medium"
                        >
                          {showOverdueOnly
                            ? "No overdue items found."
                            : "No movement records yet. Issue an item to see activity here."}
                        </td>
                      </tr>
                    )}
                    {pageRows.map((row, idx) => {
                      const due = row.dueDate ? new Date(row.dueDate) : null;
                      const dueFmt = due
                        ? due.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—";
                      return (
                        <tr
                          key={`${row.mvId}-${idx}`}
                          onClick={() => setSelectedRow(row)}
                          className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                        >
                          {/* Item */}
                          <td className="px-8 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {row.imageUrl ? (
                                  <img
                                    src={`http://localhost:5000${row.imageUrl}`}
                                    alt={row.itemName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[8px] font-bold text-gray-300">
                                    IMG
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-gray-900 leading-tight">
                                  {row.itemName}
                                </p>
                                <p className="text-[11px] font-medium text-gray-400">
                                  ID: {row.assetTag}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Category */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1.5 rounded-md font-bold text-[11px] bg-gray-50 text-gray-600 border border-gray-100/50">
                              {row.category || "—"}
                            </span>
                          </td>
                          {/* Issued To */}
                          <td className="px-4 py-4 whitespace-nowrap text-[13px] font-semibold text-gray-800">
                            {row.issuedTo || "—"}
                          </td>
                          {/* Role */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-[12px] font-semibold capitalize text-gray-500">
                              {row.role || "—"}
                            </span>
                          </td>
                          {/* Borrower ID */}
                          <td className="px-4 py-4 whitespace-nowrap text-[12px] font-medium text-gray-500">
                            {row.borrowerId || "—"}
                          </td>
                          {/* Contact */}
                          <td className="px-4 py-4 whitespace-nowrap text-[12px] font-medium text-gray-500">
                            {row.contact || "—"}
                          </td>
                          {/* Due Date */}
                          <td
                            className={`px-4 py-4 whitespace-nowrap text-[12px] font-normal ${row.overdue ? "text-red-500" : "text-gray-500"}`}
                          >
                            {dueFmt}
                          </td>
                          {/* Status */}
                          <td className="px-8 py-4 whitespace-nowrap text-right">
                            <StatusPill status={row.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {activityRows.length > 0 && (
                <div className="border-t border-gray-100 px-8 py-4 flex items-center justify-between">
                  <p className="text-[12px] font-medium text-gray-500">
                    Showing{" "}
                    <span className="font-bold text-gray-900">
                      {pageRows.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900">
                      {activityRows.length}
                    </span>{" "}
                    issued items
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActPage((p) => Math.max(0, p - 1))}
                      disabled={actPage === 0}
                      className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 border border-gray-100 hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setActPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={actPage >= totalPages - 1}
                      className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 border border-gray-100 hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Movement Detail Modal */}
      {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-white rounded-[20px] shadow-2xl w-full max-w-lg p-7 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900 leading-tight">
                  Movement Details
                </h2>
                <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                  Read-only record
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={selectedRow.status} />
                <button
                  onClick={() => setSelectedRow(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Item Info */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {selectedRow.imageUrl ? (
                  <img
                    src={`http://localhost:5000${selectedRow.imageUrl}`}
                    alt={selectedRow.itemName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] font-bold text-gray-300">
                    IMG
                  </span>
                )}
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">
                  {selectedRow.itemName}
                </p>
                <p className="text-[11px] font-medium text-gray-400">
                  ID: {selectedRow.assetTag} · {selectedRow.category}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
              {[
                { label: "Issued To", val: selectedRow.issuedTo },
                { label: "Role", val: selectedRow.role },
                { label: "Borrower ID", val: selectedRow.borrowerId },
                { label: "Contact", val: selectedRow.contact },
                {
                  label: "Due Date",
                  val:
                    selectedRow.type === "return"
                      ? "—"
                      : selectedRow.dueDate
                        ? new Date(selectedRow.dueDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )
                        : "—",
                  red: selectedRow.overdue,
                },
                {
                  label: "Returned On",
                  val:
                    selectedRow.type === "return"
                      ? new Date(selectedRow.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )
                      : selectedRow.returnedAt
                        ? new Date(selectedRow.returnedAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )
                        : "—",
                  green: selectedRow.type === "return",
                },
                {
                  label: "Issued On",
                  val: selectedRow.createdAt
                    ? new Date(selectedRow.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : "—",
                },
                {
                  label: "Type",
                  val: selectedRow.type === "issue" ? "Issue" : "Return",
                },
              ].map(({ label, val, red, green }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p
                    className={`text-[13px] font-semibold ${red ? "text-red-500" : green ? "text-green-600" : "text-gray-800"}`}
                  >
                    {val || "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Purpose & Comments */}
            {(selectedRow.purpose || selectedRow.comments) && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                {selectedRow.purpose && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Purpose
                    </p>
                    <p className="text-[13px] font-medium text-gray-700 leading-relaxed">
                      {selectedRow.purpose}
                    </p>
                  </div>
                )}
                {selectedRow.comments && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Comments
                    </p>
                    <p className="text-[13px] font-medium text-gray-700 leading-relaxed">
                      {selectedRow.comments}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
