import React, { useState, useRef } from "react";
import {
  FileText,
  MapPin,
  PackageCheck,
  Image as ImageIcon,
  UploadCloud,
  Save,
  CheckSquare,
  AlertCircle,
  X,
} from "lucide-react";
import api from "../api/api";

const REQUIRED_FIELDS = ["name", "category", "assetTag", "locationRoom"];

const FieldError = ({ message }) =>
  message ? (
    <p className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-red-500">
      <AlertCircle size={11} /> {message}
    </p>
  ) : null;

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    assetTag: "",
    description: "",
    quantity: 1,
    purchasePrice: "",
    purchaseDate: "",
    vendor: "",
    locationRoom: "Main Studio (Room 101)",
    locationShelf: "",
  });

  const [photo, setPhoto] = useState(null); // File object
  const [photoPreview, setPhotoPreview] = useState(null); // Data URL
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleQtyChange = (delta) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta),
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Photo must be under 3MB.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Item name is required";
    if (!formData.category) errs.category = "Please select a category";
    if (!formData.assetTag.trim()) errs.assetTag = "Asset tag is required";
    if (!formData.locationRoom) errs.locationRoom = "Location is required";
    return errs;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      assetTag: "",
      description: "",
      quantity: 1,
      purchasePrice: "",
      purchaseDate: "",
      vendor: "",
      locationRoom: "Main Studio (Room 101)",
      locationShelf: "",
    });
    setPhoto(null);
    setPhotoPreview(null);
    setFieldErrors({});
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fill in all required fields before saving.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Use FormData to support file upload
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      if (photo) payload.append("photo", photo);

      const response = await api.post("/items", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSuccess(true);
        resetForm();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 bg-gray-50/50 border ${
      fieldErrors[field]
        ? "border-red-300 ring-1 ring-red-200"
        : "border-gray-100"
    } rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium`;

  return (
    <div className="flex-1 relative font-sans">
          <div className="fixed right-0 bottom-5 w-[28%] pointer-events-none z-0 overflow-hidden flex flex-col items-center">
        <img
          src="/add item.png"
          alt="Camera illustration"
          className="w-[80%] max-w-[320px] object-contain drop-shadow-2xl opacity-90 select-none"
          style={{ filter: "drop-shadow(0 24px 48px rgba(228,121,38,0.18))" }}
        />
      </div>
      <main className="pl-10 pr-[32%] py-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-[13px] font-medium text-gray-400">
            Register new equipment or consumables into the Media Lab database.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-[12px] bg-white border border-gray-100/80 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#E47926] text-white text-[13px] font-bold hover:bg-[#c4651f] transition-all shadow-sm shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={16} className="bg-white/20 rounded pl-0.5 pr-0.5" />
              {loading ? "Saving..." : "Save Item"}
            </button>
          </div>
        </div>

        {/* Global messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl font-medium">
            ✅ Item saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── Left Column ─── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Item Details */}
            <div className="bg-white p-7 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <FileText size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Item Details
                </h3>
              </div>

              <div className="space-y-5">
                {/* Item Name */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sony Alpha a7S III"
                    className={inputCls("name")}
                  />
                  <FieldError message={fieldErrors.name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={inputCls("category") + " appearance-none"}
                    >
                      <option value="">Select category</option>
                      <option value="Cameras">Camera</option>
                      <option value="Lens">Lens</option>
                      <option value="Audio">Audio</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Computer">Computer</option>
                    </select>
                    <FieldError message={fieldErrors.category} />
                  </div>

                  {/* Asset Tag */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                      Asset ID / Tag <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="assetTag"
                      value={formData.assetTag}
                      onChange={handleChange}
                      placeholder="e.g., ML-CAM-001"
                      className={inputCls("assetTag")}
                    />
                    <FieldError message={fieldErrors.assetTag} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description, model number, or condition notes..."
                    className={inputCls("description") + " resize-none"}
                  />
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-white p-7 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                  <PackageCheck size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Stock Information
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* Quantity */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Initial Quantity
                  </label>
                  <div className="flex items-center bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      className="px-3 py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-colors font-bold"
                    >
                      —
                    </button>
                    <input
                      type="text"
                      value={formData.quantity}
                      readOnly
                      className="w-full text-center bg-transparent border-none text-[13px] font-bold text-gray-900 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQtyChange(1)}
                      className="px-3 py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Purchase Cost */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Purchase Cost
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="₹"
                    className={inputCls("purchasePrice")}
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className={inputCls("purchaseDate")}
                  />
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Vendor
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    className={inputCls("vendor")}
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                <div className="mt-0.5 text-[#E47926]">
                  <CheckSquare
                    size={18}
                    className="fill-current text-[#E47926] stroke-white"
                  />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-gray-900 mb-0.5">
                    Movable Item
                  </h4>
                  <p className="text-[12px] text-gray-500 font-medium">
                    This item can be checked out by students or staff.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Storage Location */}
            <div className="bg-white p-7 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Storage Location
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Room / Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="locationRoom"
                    value={formData.locationRoom}
                    onChange={handleChange}
                    className={inputCls("locationRoom") + " appearance-none"}
                  >
                    <option value="Main Studio (Room 101)">
                      Main Studio (Room 101)
                    </option>
                    <option value="Audio Booth">Audio Booth</option>
                    <option value="Equipment Cabinet A">
                      Equipment Cabinet A
                    </option>
                  </select>
                  <FieldError message={fieldErrors.locationRoom} />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-900 tracking-wide mb-2">
                    Shelf / Bin
                  </label>
                  <input
                    type="text"
                    name="locationShelf"
                    value={formData.locationShelf}
                    onChange={handleChange}
                    placeholder="e.g., Shelf 4, Bin A"
                    className={inputCls("locationShelf")}
                  />
                </div>
              </div>
            </div>

            {/* Item Photo */}
            <div className="bg-white p-7 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                  <ImageIcon size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Item Photo
                </h3>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />

              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleDropZoneClick}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50/50 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={20} />
                  </div>
                  <p className="text-[13px] font-bold text-gray-900 mb-1">
                    <span className="text-[#E47926]">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">
                    PNG, JPG, GIF (MAX. 3MB)
                  </p>
                </div>
              )}
            </div>

            {/* Status meta */}
            <div className="flex flex-col bg-white p-7 rounded-[16px] border border-transparent">
              <div className="flex justify-between w-full items-center px-4 mt-2">
                <span className="text-[12px] font-medium text-gray-500">
                  Status
                </span>
                <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-extrabold uppercase tracking-widest">
                  Active
                </span>
              </div>
              <div className="flex justify-between w-full items-center px-4 mt-4">
                <span className="text-[12px] font-medium text-gray-500">
                  Created by
                </span>
                <span className="text-[13px] font-bold text-gray-900">
                  Current User
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddItem;
