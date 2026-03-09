import React, { useState, useEffect } from "react";
import {
  FolderIcon,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  X,
  Camera,
  Mic,
  Sun,
  Monitor,
  Save,
  Loader,
} from "lucide-react";
import api from "../api/api";

// Modals
const ModalOverlay = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
      <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
        {children}
      </div>
    </div>
  );
};

const Configuration = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [catForm, setCatForm] = useState({
    id: null,
    name: "",
    sub: "",
    max_quantity: "",
  });
  const [locForm, setLocForm] = useState({
    id: null,
    name: "",
    block_name: "",
    campus_name: "",
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, locRes] = await Promise.all([
        api.get("/config/categories"),
        api.get("/config/locations"),
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (locRes.data.success) setLocations(locRes.data.locations);
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCatIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("audio") || n.includes("mic")) return <Mic size={16} />;
    if (n.includes("light")) return <Sun size={16} />;
    if (n.includes("computer") || n.includes("accessory"))
      return <Monitor size={16} />;
    return <Camera size={16} />;
  };

  // --- Category Handlers ---
  const openCatModal = (cat = null) => {
    if (cat)
      setCatForm({
        id: cat.id,
        name: cat.name,
        sub: cat.description || "",
        max_quantity: cat.max_quantity || "",
      });
    else setCatForm({ id: null, name: "", sub: "", max_quantity: "" });
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    if (!catForm.name.trim()) return;
    try {
      if (catForm.id) {
        await api.put(`/config/categories/${catForm.id}`, catForm);
      } else {
        await api.post("/config/categories", catForm);
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save category");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await api.delete(`/config/categories/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  // --- Location Handlers ---
  const openLocModal = (loc = null) => {
    if (loc)
      setLocForm({
        id: loc.id,
        name: loc.name,
        block_name: loc.block_name || "",
        campus_name: loc.campus_name || "",
      });
    else setLocForm({ id: null, name: "", block_name: "", campus_name: "" });
    setIsLocationModalOpen(true);
  };

  const saveLocation = async () => {
    if (!locForm.name.trim()) return;
    try {
      if (locForm.id) {
        await api.put(`/config/locations/${locForm.id}`, locForm);
      } else {
        await api.post("/config/locations", locForm);
      }
      setIsLocationModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save location");
    }
  };

  const deleteLocation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;
    try {
      await api.delete(`/config/locations/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete location");
    }
  };

  return (
    <div className="flex-1 relative font-sans">
      <div className="fixed right-0 bottom-80 w-[28%] pointer-events-none z-0 overflow-hidden flex flex-col items-center">
        <img
          src="/config.png"
          alt="Camera illustration"
          className="w-[80%] max-w-[320px] object-contain drop-shadow-2xl opacity-90 select-none"
          style={{ filter: "drop-shadow(0 24px 48px rgba(228,121,38,0.18))" }}
        />
      </div>
      <main className="pl-10 pr-[32%] py-8 max-w-[1600px] mx-auto">
        {/* Header Description */}
        <div className="mb-6">
          <p className="text-[13px] font-medium text-gray-400">
            Manage item categories and equipment locations.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-100 mb-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 pb-4 text-[13px] font-bold transition-all border-b-2 ${
              activeTab === "categories"
                ? "border-[#E47926] text-[#E47926]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <FolderIcon size={16} strokeWidth={2.5} />
            Item Categories
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`flex items-center gap-2 pb-4 text-[13px] font-bold transition-all border-b-2 ${
              activeTab === "locations"
                ? "border-[#E47926] text-[#E47926]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <MapPin size={16} strokeWidth={2.5} />
            Equipment Locations
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50/50 rounded-[16px] border border-gray-100 p-6">
          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <div>
              {/* Tab Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-gray-900 mb-0.5">
                    Item Categories
                  </h3>
                  <p className="text-[12px] font-medium text-gray-400">
                    Categorize your inventory assets
                  </p>
                </div>
                <button
                  onClick={() => openCatModal()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#E47926] text-white text-[13px] font-bold hover:bg-[#c4651f] transition-all shadow-sm shadow-orange-500/20"
                >
                  <Plus size={16} strokeWidth={3} />
                  Add New Category
                </button>
              </div>

              {/* Data Table equivalent */}
              <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                        Category Name
                      </th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase text-center">
                        Items
                      </th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading && (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-8 text-center text-gray-400 text-sm"
                        >
                          Loading categories...
                        </td>
                      </tr>
                    )}
                    {!loading && categories.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-8 text-center text-gray-400 text-sm font-medium"
                        >
                          No categories found.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      categories.map((cat) => (
                        <tr
                          key={cat.id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-400 flex items-center justify-center">
                                {getCatIcon(cat.name)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-900">
                                  {cat.name}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400">
                                  {cat.description || "—"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-center text-[12px] font-bold text-gray-700">
                            {cat.max_quantity || 0} items
                          </td>
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-2 text-gray-300">
                              <button
                                onClick={() => openCatModal(cat)}
                                className="hover:text-gray-900 p-1.5 rounded-lg transition-colors bg-white hover:bg-gray-100 border border-transparent"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => deleteCategory(cat.id)}
                                className="hover:text-red-500 p-1.5 rounded-lg transition-colors bg-white hover:bg-gray-100 border border-transparent"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LOCATIONS TAB */}
          {activeTab === "locations" && (
            <div>
              {/* Tab Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-gray-900 mb-0.5">
                    Equipment Locations
                  </h3>
                  <p className="text-[12px] font-medium text-gray-400">
                    Manage equipment rooms and shelves
                  </p>
                </div>
                <button
                  onClick={() => openLocModal()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#E47926] text-white text-[13px] font-bold hover:bg-[#c4651f] transition-all shadow-sm shadow-orange-500/20"
                >
                  <Plus size={16} strokeWidth={3} />
                  Add New Location
                </button>
              </div>

              {/* Data Table equivalent */}
              <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                        Location Name
                      </th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading && (
                      <tr>
                        <td
                          colSpan="2"
                          className="py-8 text-center text-gray-400 text-sm"
                        >
                          Loading locations...
                        </td>
                      </tr>
                    )}
                    {!loading && locations.length === 0 && (
                      <tr>
                        <td
                          colSpan="2"
                          className="py-8 text-center text-gray-400 text-sm font-medium"
                        >
                          No locations found.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      locations.map((loc) => (
                        <tr
                          key={loc.id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center">
                                <MapPin size={16} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-900">
                                  {loc.name}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400">
                                  {[loc.block_name, loc.campus_name]
                                    .filter(Boolean)
                                    .join(" · ") || "—"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-2 text-gray-300">
                              <button
                                onClick={() => openLocModal(loc)}
                                className="hover:text-gray-900 p-1.5 rounded-lg transition-colors bg-white hover:bg-gray-100 border border-transparent"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => deleteLocation(loc.id)}
                                className="hover:text-red-500 p-1.5 rounded-lg transition-colors bg-white hover:bg-gray-100 border border-transparent"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CATEGORY MODAL */}
      <ModalOverlay
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      >
        <h2 className="text-[18px] font-bold text-gray-900 mb-1">
          New Category
        </h2>
        <p className="text-[12px] font-medium text-gray-400 mb-6">
          Add a new item category to organize your inventory.
        </p>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={catForm.name}
              onChange={(e) =>
                setCatForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Audio Equipments"
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm shadow-gray-100/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2 mt-4">
              Description (Optional)
            </label>
            <input
              type="text"
              value={catForm.sub}
              onChange={(e) =>
                setCatForm((prev) => ({ ...prev, sub: e.target.value }))
              }
              placeholder="e.g. Mics, Mixers, Recorders"
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm shadow-gray-100/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2 mt-4">
              Number of Items
            </label>
            <input
              type="number"
              min="0"
              value={catForm.max_quantity}
              onChange={(e) =>
                setCatForm((prev) => ({
                  ...prev,
                  max_quantity: e.target.value,
                }))
              }
              placeholder="e.g. 10"
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm shadow-gray-100/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className="px-5 py-2.5 rounded-[12px] bg-white border border-gray-100 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={saveCategory}
            className="px-5 py-2.5 rounded-[12px] bg-[#E47926] text-white text-[13px] font-bold hover:bg-[#c4651f] transition-all shadow-sm shadow-orange-500/20"
          >
            {catForm.id ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </ModalOverlay>

      {/* LOCATION MODAL */}
      <ModalOverlay
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      >
        <h2 className="text-[18px] font-bold text-gray-900 mb-1">
          Add Location
        </h2>
        <p className="text-[12px] font-medium text-gray-400 mb-6">
          Enter the details for the new equipment location to keep your assets
          organized across the campus.
        </p>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
              Location Name
            </label>
            <input
              type="text"
              value={locForm.name}
              onChange={(e) =>
                setLocForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Room 101"
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm shadow-gray-100/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
              Block Name
            </label>
            <input
              type="text"
              value={locForm.block_name}
              onChange={(e) =>
                setLocForm((prev) => ({ ...prev, block_name: e.target.value }))
              }
              placeholder="e.g., Building A"
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm shadow-gray-100/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
              Campus Name
            </label>
            <input
              type="text"
              value={locForm.campus_name}
              onChange={(e) =>
                setLocForm((prev) => ({ ...prev, campus_name: e.target.value }))
              }
              placeholder="e.g., Main Campus"
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm shadow-gray-100/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 z-50">
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="px-5 py-2.5 rounded-[12px] bg-white border border-gray-100 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={saveLocation}
            className="px-5 py-2.5 rounded-[12px] bg-[#E47926] text-white text-[13px] font-bold hover:bg-[#c4651f] transition-all shadow-sm shadow-orange-500/20"
          >
            {locForm.id ? "Save Changes" : "Add Location"}
          </button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default Configuration;
