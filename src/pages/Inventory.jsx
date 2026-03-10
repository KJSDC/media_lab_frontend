import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  Edit3,
  MoreVertical,
  Camera,
  Disc,
  Monitor,
  Mic,
  Trash2,
  X,
  Save,
  AlertCircle,
  Filter,
} from "lucide-react";
import api from "../api/api";

/* ──────────────────────────────────────── helpers ── */
const StatusPill = ({ status }) => {
  const s = {
    Available: "bg-green-50 text-green-600",
    "Under Service": "bg-orange-50 text-orange-600",
    Damaged: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${s[status] ?? "bg-gray-50 text-gray-500"}`}
    >
      {status}
    </span>
  );
};

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case "audio":
      return Mic;
    case "lens":
      return Disc;
    case "computer":
      return Monitor;
    default:
      return Camera;
  }
};

const STATUSES = [
  "All",
  "Available",
  "Under Service",
  "Damaged",
  "Lost",
  "Wear/Tear",
];
const CATEGORIES = [
  "All",
  "Cameras",
  "Lens",
  "Audio",
  "Lighting",
  "Accessories",
  "Computer",
];
const LOCATIONS = [
  "All",
  "Main Studio (Room 101)",
  "Audio Booth",
  "Equipment Cabinet A",
];

/* ──────────────────────────────────── edit modal ── */
const EditModal = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: item.name ?? "",
    category: item.category ?? "",
    assetTag: item.asset_tag ?? "",
    description: item.description ?? "",
    quantity: item.initial_quantity ?? 1,
    availableQuantity: item.available_quantity ?? 1,
    purchasePrice: item.purchase_cost ?? "",
    purchaseDate: item.purchase_date ? item.purchase_date.split("T")[0] : "",
    vendor: item.vendor ?? "",
    locationRoom: item.location_room ?? "",
    locationShelf: item.location_shelf ?? "",
    status: item.status ?? "Available",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Item name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      const res = await api.put(`/items/${item.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        onSaved(res.data.item);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-gray-50/70 border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all font-medium placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-[16px] font-extrabold text-gray-900">
              Edit Item
            </h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
              Update inventory record
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[12px] font-medium">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputCls + " appearance-none"}
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Asset Tag
              </label>
              <input
                name="assetTag"
                value={form.assetTag}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Total Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min={1}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Available Quantity
              </label>
              <input
                type="number"
                name="availableQuantity"
                value={form.availableQuantity}
                onChange={handleChange}
                min={0}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputCls + " appearance-none"}
              >
                {STATUSES.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Vendor
              </label>
              <input
                name="vendor"
                value={form.vendor}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Location
              </label>
              <select
                name="locationRoom"
                value={form.locationRoom}
                onChange={handleChange}
                className={inputCls + " appearance-none"}
              >
                {LOCATIONS.filter((l) => l !== "All").map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Purchase Cost (₹)
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={form.purchasePrice}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                name="description"
                value={form.description}
                onChange={handleChange}
                className={inputCls + " resize-none"}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 border border-gray-100 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E47926] text-white text-[13px] font-bold hover:bg-[#c4651f] transition-all disabled:opacity-70"
          >
            <Save size={15} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────── toggle active confirm ── */
const ToggleActiveModal = ({ item, onClose, onToggled }) => {
  const [toggling, setToggling] = useState(false);
  const isCurrentlyActive = item.is_active !== false; // handle null/undefined as true
  const targetState = !isCurrentlyActive;

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await api.patch(`/items/${item.id}/active`, {
        is_active: targetState,
      });
      if (res.data.success) {
        onToggled(res.data.item);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setToggling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${targetState ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}
        >
          {targetState ? <AlertCircle size={22} /> : <AlertCircle size={22} />}
        </div>
        <h2 className="text-[16px] font-extrabold text-gray-900 mb-1">
          Mark as {targetState ? "Active" : "Inactive"}?
        </h2>
        <p className="text-[13px] text-gray-500 font-medium mb-6">
          <span className="font-bold text-gray-900">"{item.name}"</span> will be
          marked as {targetState ? "Active" : "Inactive"}.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 border border-gray-100 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all disabled:opacity-70 ${targetState ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
          >
            {toggling
              ? "Updating…"
              : `Yes, Mark ${targetState ? "Active" : "Inactive"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────── row action menu ── */
const ActionMenu = ({ item, onEdit, onToggleActive }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-300 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-40 overflow-hidden">
          <button
            onClick={() => {
              setOpen(false);
              onEdit(item);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit3 size={14} className="text-[#E47926]" /> Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onToggleActive(item);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <AlertCircle
              size={14}
              className={
                item.is_active === false ? "text-green-500" : "text-red-500"
              }
            />
            {item.is_active === false ? "Mark Active" : "Mark Inactive"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────── main page ── */
const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");
  const [editItem, setEditItem] = useState(null);
  const [toggleActiveItem, setToggleActiveItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/items");
        if (res.data.success) setItems(res.data.items);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // ─── derived filtered list ───
  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.asset_tag?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.vendor?.toLowerCase().includes(q);

    const matchStatus = filterStatus === "All" || item.status === filterStatus;
    const matchCategory =
      filterCategory === "All" || item.category === filterCategory;
    const matchLocation =
      filterLocation === "All" || item.location_room === filterLocation;

    return matchSearch && matchStatus && matchCategory && matchLocation;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("All");
    setFilterCategory("All");
    setFilterLocation("All");
  };
  const hasActiveFilters =
    search ||
    filterStatus !== "All" ||
    filterCategory !== "All" ||
    filterLocation !== "All";

  const handleSaved = (saved) => {
    setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
  };

  const handleToggledActive = (updatedItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
    );
  };
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      "Item Name",
      "Asset Tag",
      "Category",
      "Location",
      "Purchase Price",
      "Purchase Date",
      "Total Quantity",
      "Available Quantity",
      "Issued",
      "Vendor",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filtered.map((item) => {
        const issued =
          (item.initial_quantity ?? 0) - (item.available_quantity ?? 0);
        const pDate = item.purchase_date
          ? new Date(item.purchase_date).toLocaleDateString("en-IN")
          : "";
        return [
          `"${(item.name || "").replace(/"/g, '""')}"`,
          `"${(item.asset_tag || "").replace(/"/g, '""')}"`,
          `"${(item.category || "").replace(/"/g, '""')}"`,
          `"${(item.location_room || "").replace(/"/g, '""')}"`,
          item.purchase_cost || 0,
          `"${pDate}"`,
          item.initial_quantity || 0,
          item.available_quantity || 0,
          Math.max(0, issued),
          `"${(item.vendor || "").replace(/"/g, '""')}"`,
          `"${(item.status || "").replace(/"/g, '""')}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `inventory_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 relative font-sans">
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={handleSaved}
        />
      )}
      {toggleActiveItem && (
        <ToggleActiveModal
          item={toggleActiveItem}
          onClose={() => setToggleActiveItem(null)}
          onToggled={handleToggledActive}
        />
      )}

      <main className="pl-10 pr-[15%] py-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-[13px] font-medium text-gray-400">
            Manage equipment stock levels, track availability, and update
            status.
          </p>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-white border border-gray-100 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-transparent mb-6 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-64 border-r border-gray-100 pr-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, tag, category…"
              className="w-full pl-8 pr-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-[12px] font-medium text-gray-400">
              Category:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div className="flex items-center gap-2 px-2 border-l border-gray-100 pl-4">
            <span className="text-[12px] font-medium text-gray-400">
              Location:
            </span>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 px-2 border-l border-gray-100 pl-4 pr-4 border-r">
            <span className="text-[12px] font-medium text-gray-400">
              Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[#E47926] text-[13px] font-bold hover:underline px-2 flex items-center gap-1"
            >
              <X size={13} /> Clear all
            </button>
          )}

          <div className="ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-orange-50 text-[#E47926] text-[13px] font-bold hover:bg-orange-100 transition-all border border-orange-100/50">
              <Edit3 size={14} strokeWidth={2.5} /> Bulk Edit
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-transparent overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-400 tracking-wider uppercase w-[35%]">
                    Item Name
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-400 tracking-wider uppercase text-center w-[10%]">
                    Quantity
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-400 tracking-wider uppercase text-center w-[10%]">
                    Available
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-400 tracking-wider uppercase text-center w-[10%]">
                    Issued
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-400 tracking-wider uppercase text-center w-[15%]">
                    Vendor
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-400 tracking-wider uppercase text-center w-[15%]">
                    Status
                  </th>
                  <th className="py-4 px-4 w-[5%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-8 text-gray-400 text-sm"
                    >
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-10 text-gray-400 text-sm font-medium"
                    >
                      {hasActiveFilters
                        ? "No items match the current filters."
                        : "No items found. Add your first item!"}
                    </td>
                  </tr>
                )}
                {filtered.map((item) => {
                  const IconComp = getCategoryIcon(item.category);
                  const issued =
                    (item.initial_quantity ?? 0) -
                    (item.available_quantity ?? 0);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors group ${item.is_active === false ? "opacity-60 bg-gray-50 hover:bg-gray-100/60" : "hover:bg-gray-50/50"}`}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-all overflow-hidden flex-shrink-0">
                            {item.image_b64 ? (
                              <img
                                src={item.image_b64}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <IconComp size={16} strokeWidth={2} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-gray-900 leading-tight mb-0.5 flex items-center gap-2">
                              {item.name}
                              {item.is_active === false && (
                                <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                                  Inactive
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
                              {item.asset_tag}
                              <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center text-[13px] font-medium text-gray-700">
                        {item.initial_quantity}
                      </td>
                      <td
                        className={`py-3 px-6 text-center text-[13px] font-medium ${(item.available_quantity ?? 0) > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {item.available_quantity}
                      </td>
                      <td className="py-3 px-6 text-center text-[13px] font-medium text-gray-500">
                        {issued < 0 ? 0 : issued}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="text-[13px] font-medium text-gray-700">
                          {item.vendor || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ActionMenu
                          item={item}
                          onEdit={setEditItem}
                          onToggleActive={setToggleActiveItem}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-gray-100 p-4 px-6 flex items-center justify-between">
            <p className="text-[12px] font-medium text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-900">{filtered.length}</span>{" "}
              of <span className="font-bold text-gray-900">{items.length}</span>{" "}
              items
              {hasActiveFilters && (
                <span className="text-[#E47926] font-bold"> (filtered)</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors">
                <span className="text-[10px] font-bold">❮</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors">
                <span className="text-[10px] font-bold">❯</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
