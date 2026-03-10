import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Search,
  Calendar,
  AlignLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  ScanLine,
  X,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import api from "../api/api";

/* ─── shared input style ─── */
const inputCls =
  "w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-medium";

/* ─── read-only override — no orange ring ─── */
const readOnlyCls =
  "w-full px-4 py-3 bg-gray-50/80 border border-gray-100 rounded-xl text-[13px] text-gray-500 font-medium resize-none cursor-default select-none outline-none focus:ring-0 focus:border-gray-100";

/* ─── item thumbnail ─── */
const Thumb = ({ url, alt }) => (
  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-300 text-[9px] font-bold">
    {url ? (
      <img
        src={`http://localhost:5000${url}`}
        alt={alt}
        className="w-full h-full object-cover"
      />
    ) : (
      "IMG"
    )}
  </div>
);

/* ─── cart item row ─── */
const CartItem = ({ entry, onRemove, onQtyChange, maxQty }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white relative group">
    <button
      onClick={() => onRemove(entry.itemId)}
      className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
    >
      <X size={14} strokeWidth={3} />
    </button>
    <Thumb url={entry.image_url} alt={entry.name} />
    <div className="flex-1">
      <h4 className="text-[13px] font-bold text-gray-900 leading-tight mb-1 pr-6">
        {entry.name}
      </h4>
      <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
        <span>{entry.asset_tag}</span>
        {maxQty !== undefined && (
          <>
            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
            <span>Issued: {entry.qty}</span>
          </>
        )}
      </div>
    </div>
    <div className="flex items-center bg-gray-50/80 rounded-lg p-0.5 border border-gray-100 mr-4">
      <button
        onClick={() => onQtyChange(entry.itemId, -1)}
        disabled={entry.qty <= 1}
        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white rounded-md transition-all disabled:opacity-30 font-bold"
      >
        —
      </button>
      <span className="w-7 text-center text-[13px] font-bold text-gray-900">
        {entry.qty}
      </span>
      <button
        onClick={() => onQtyChange(entry.itemId, 1)}
        disabled={maxQty !== undefined && entry.qty >= maxQty}
        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white rounded-md transition-all disabled:opacity-30"
      >
        +
      </button>
    </div>
  </div>
);

/* ─── issue item search dropdown ─── */
const ItemSearch = ({ allItems, cart, onAdd }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = allItems.filter(
    (i) =>
      i.available_quantity > 0 &&
      !cart.find((c) => c.itemId === i.id) &&
      (i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.asset_tag.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div ref={ref} className="relative mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <ScanLine size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search item by name or asset tag…"
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#E47926]/20 focus:border-[#E47926] focus:outline-none transition-all placeholder:text-gray-400 font-semibold text-gray-700"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onAdd(item);
                setQuery("");
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Thumb url={item.image_url} alt={item.name} />
              <div>
                <p className="text-[13px] font-bold text-gray-900">
                  {item.name}
                </p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {item.asset_tag} · Available: {item.available_quantity}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── borrower search with debounce (return tab) ─── */
const BorrowerSearch = ({ value, onChange, onSelect }) => {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(timerRef.current);
    if (val.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/movements/borrower?q=${encodeURIComponent(val)}`,
        );
        if (res.data.success) {
          setResults(res.data.results);
          setOpen(true);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader size={14} className="text-gray-400 animate-spin" />
          ) : (
            <Search size={14} className="text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search by name or ID…"
          className={inputCls + " pl-9"}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto">
          {results.map((mv) => (
            <button
              key={mv.movement_id}
              onClick={() => {
                onSelect(mv);
                setOpen(false);
              }}
              className="w-full flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-gray-900">
                  {mv.borrower_name}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-50 text-[#E47926] px-2 py-0.5 rounded-full">
                  {(mv.items || []).length} item
                  {mv.items?.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {mv.borrower_id} {mv.contact ? `· ${mv.contact}` : ""}{" "}
                {mv.role ? `· ${mv.role}` : ""}
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(mv.items || []).map((it, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-md font-medium"
                  >
                    {it.name} ×{it.quantity}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && value.trim().length > 1 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-30 px-4 py-3 text-[12px] text-gray-400 font-medium">
          No active issues found for "{value}"
        </div>
      )}
    </div>
  );
};

/* ─── main page ─── */
const Movement = () => {
  const [activeTab, setActiveTab] = useState("issue");
  const [role, setRole] = useState("student");
  const [allItems, setAllItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    borrowerName: "",
    borrowerId: "",
    contact: "",
    purpose: "",
    comments: "",
    reviewerComments: "",
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [borrowerLocked, setBorrowerLocked] = useState(false);

  useEffect(() => {
    api.get("/items").then((res) => {
      if (res.data.success) setAllItems(res.data.items);
    });
  }, []);

  // Reset cart when switching tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    setCart([]);
    setBorrowerLocked(false);
    setForm({
      borrowerName: "",
      borrowerId: "",
      contact: "",
      purpose: "",
      comments: "",
      reviewerComments: "",
      dueDate: "",
    });
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* Issue tab — add from inventory search */
  const addToCart = (item) =>
    setCart((prev) => [
      ...prev,
      {
        itemId: item.id,
        name: item.name,
        asset_tag: item.asset_tag,
        image_url: item.image_url,
        available_quantity: item.available_quantity,
        qty: 1,
      },
    ]);

  /* Return tab — auto-populate from borrower lookup */
  const handleBorrowerSelect = (mv) => {
    setForm((prev) => ({
      ...prev,
      borrowerName: mv.borrower_name,
      borrowerId: mv.borrower_id || "",
      contact: mv.contact || "",
      purpose: mv.purpose || "",
      comments: mv.comments || "",
      reviewerComments: "",
    }));
    if (mv.role) setRole(mv.role);
    setBorrowerLocked(true);
    const newCart = (mv.items || []).map((it) => ({
      itemId: it.item_id,
      name: it.name,
      asset_tag: it.asset_tag,
      image_url: it.image_url,
      available_quantity: it.available_quantity,
      maxQty: it.quantity,
      qty: it.quantity,
    }));
    setCart(newCart);
  };

  const clearBorrower = () => {
    setBorrowerLocked(false);
    setCart([]);
    setForm((prev) => ({
      ...prev,
      borrowerName: "",
      borrowerId: "",
      contact: "",
      purpose: "",
      comments: "",
      reviewerComments: "",
    }));
  };

  const removeFromCart = (itemId) =>
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  const changeQty = (itemId, delta) =>
    setCart((prev) =>
      prev.map((c) =>
        c.itemId === itemId
          ? {
              ...c,
              qty: Math.max(
                1,
                Math.min(c.maxQty ?? c.available_quantity, c.qty + delta),
              ),
            }
          : c,
      ),
    );

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const handleSubmit = async () => {
    if (!form.borrowerName.trim()) {
      setErrorMsg("Borrower name is required.");
      return;
    }
    if (cart.length === 0) {
      setErrorMsg("Add at least one item to the list.");
      return;
    }
    if (activeTab === "issue" && !form.dueDate) {
      setErrorMsg("Return date is required for issuing items.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post("/movements", {
        type: activeTab,
        borrowerName: form.borrowerName,
        borrowerId: form.borrowerId,
        contact: form.contact,
        role,
        purpose: form.purpose,
        comments:
          activeTab === "return" ? form.reviewerComments : form.comments,
        dueDate: form.dueDate || null,
        items: cart.map((c) => ({ itemId: c.itemId, quantity: c.qty })),
      });
      if (res.data.success) {
        setSuccessMsg(
          activeTab === "issue"
            ? "Items issued successfully!"
            : "Items returned successfully!",
        );
        setCart([]);
        setBorrowerLocked(false);
        setForm({
          borrowerName: "",
          borrowerId: "",
          contact: "",
          purpose: "",
          comments: "",
          reviewerComments: "",
          dueDate: "",
        });
        const refreshed = await api.get("/items");
        if (refreshed.data.success) setAllItems(refreshed.data.items);
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message ?? "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 relative font-sans">
      <div className="fixed right-0 bottom-80 w-[28%] pointer-events-none z-0 overflow-hidden flex flex-col items-center">
        <img
          src="/movement.png"
          alt="Camera illustration"
          className="w-[90%] max-w-[420px] object-contain drop-shadow-2xl opacity-90 select-none"
          style={{ filter: "drop-shadow(0 24px 48px rgba(228,121,38,0.18))" }}
        />
      </div>
      <main className="pl-10 pr-[32%] py-8 max-w-[1600px] mx-auto">
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl font-medium text-[13px]">
            <CheckCircle size={18} className="flex-shrink-0" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium text-[13px]">
            <AlertCircle size={18} className="flex-shrink-0" /> {errorMsg}
            <button onClick={() => setErrorMsg("")} className="ml-auto">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex justify-between items-end mb-8">
          <p className="text-[13px] font-medium text-gray-400">
            Process new equipment loans for lab members.
          </p>
          <div className="flex items-center p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <button
              onClick={() => switchTab("issue")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === "issue" ? "bg-orange-50/50 text-[#E47926] shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <ArrowUpRight size={16} strokeWidth={2.5} /> Issue Item
            </button>
            <button
              onClick={() => switchTab("return")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === "return" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <ArrowDownLeft size={16} strokeWidth={2.5} /> Return Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── Left Col ─── */}
          <div className="space-y-6">
            <div className="bg-white p-7 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#E47926] flex items-center justify-center">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Borrower Details
                </h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name — borrower search on return tab */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    {activeTab === "return" ? (
                      borrowerLocked ? (
                        <div className="relative">
                          <input
                            value={form.borrowerName}
                            readOnly
                            className={
                              inputCls +
                              " bg-gray-50/80 text-gray-600 cursor-not-allowed pr-10"
                            }
                          />
                          <button
                            onClick={clearBorrower}
                            title="Clear selection"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-red-400 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <BorrowerSearch
                          value={form.borrowerName}
                          onChange={(val) =>
                            setForm((p) => ({ ...p, borrowerName: val }))
                          }
                          onSelect={handleBorrowerSelect}
                        />
                      )
                    ) : (
                      <input
                        name="borrowerName"
                        value={form.borrowerName}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter full name"
                        className={inputCls}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                      Student / Faculty ID
                    </label>
                    <input
                      name="borrowerId"
                      value={form.borrowerId}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g. KJ24F0912"
                      className={inputCls}
                      readOnly={activeTab === "return" && !!form.borrowerId}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                    Contact Number
                  </label>
                  <input
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter contact number"
                    className={
                      inputCls +
                      (borrowerLocked
                        ? " bg-gray-50/80 text-gray-600 cursor-not-allowed"
                        : "")
                    }
                    readOnly={borrowerLocked}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                    Role
                  </label>
                  <div
                    className={`flex items-center bg-gray-50/50 border border-gray-100 rounded-xl p-1 ${borrowerLocked ? "pointer-events-none opacity-60" : ""}`}
                  >
                    {["student", "faculty"].map((r) => (
                      <button
                        key={r}
                        onClick={() => !borrowerLocked && setRole(r)}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all capitalize ${role === r ? "bg-white text-[#E47926] border border-orange-100 shadow-sm" : "text-gray-500 border border-transparent"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === "issue" && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                      Return Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={14} className="text-gray-400" />
                      </div>
                      <input
                        name="dueDate"
                        value={form.dueDate}
                        onChange={handleChange}
                        type="date"
                        className={inputCls + " pl-9"}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-7 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#E47926] flex items-center justify-center">
                  <AlignLeft size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Purpose &amp; Comments
                </h3>
              </div>
              <div className="space-y-4">
                {/* Purpose — editable for issue, read-only for return */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                    {activeTab === "return"
                      ? "Original Purpose (from borrowing)"
                      : "Purpose"}
                  </label>
                  <textarea
                    name="purpose"
                    value={form.purpose}
                    onChange={activeTab === "issue" ? handleChange : undefined}
                    readOnly={activeTab === "return"}
                    rows="2"
                    placeholder={
                      activeTab === "issue"
                        ? "Describe the purpose of borrowing…"
                        : ""
                    }
                    className={
                      activeTab === "return"
                        ? readOnlyCls
                        : inputCls + " resize-none"
                    }
                  />
                </div>

                {/* Borrower's original comments — read-only, only on return if exists */}
                {activeTab === "return" && form.comments ? (
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                      Borrower's Comments
                    </label>
                    <textarea
                      value={form.comments}
                      readOnly
                      rows="2"
                      className={readOnlyCls}
                    />
                  </div>
                ) : activeTab === "issue" ? (
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                      Additional Comments
                    </label>
                    <textarea
                      name="comments"
                      value={form.comments}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Additional comments or notes"
                      className={inputCls + " resize-none"}
                    />
                  </div>
                ) : null}

                {/* Reviewer Comments — editable, only on return tab */}
                {activeTab === "return" && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 tracking-wide uppercase mb-2">
                      Reviewer Comments
                    </label>
                    <textarea
                      name="reviewerComments"
                      value={form.reviewerComments}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Add reviewer notes about the return…"
                      className={inputCls + " resize-none"}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Right Col ─── */}
          <div>
            <div
              className="bg-white p-7 rounded-[16px] shadow-[0_4px_30px_rgb(0,0,0,0.03)] flex flex-col"
              style={{ minHeight: "100%" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#E47926] flex items-center justify-center">
                    <ShoppingBag size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900">
                    {activeTab === "issue" ? "Issue Items" : "Return Items"}
                  </h3>
                </div>
                {cart.length > 0 && (
                  <span className="text-[11px] font-extrabold text-[#E47926] bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                )}
              </div>

              {/* Return tab — info hint */}
              {activeTab === "return" && cart.length === 0 && (
                <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-[12px] text-blue-600 font-medium">
                  Type the borrower's name or ID on the left to automatically
                  load their issued items here.
                </div>
              )}

              {/* Issue tab — item search */}
              {activeTab === "issue" && (
                <ItemSearch allItems={allItems} cart={cart} onAdd={addToCart} />
              )}

              {/* Cart */}
              <div className="space-y-3 flex-1 overflow-y-auto mb-6 min-h-[140px]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                    <ShoppingBag size={28} strokeWidth={1.5} className="mb-2" />
                    <p className="text-[12px] font-medium">
                      No items added yet
                    </p>
                  </div>
                ) : (
                  cart.map((entry) => (
                    <CartItem
                      key={entry.itemId}
                      entry={entry}
                      onRemove={removeFromCart}
                      onQtyChange={changeQty}
                      maxQty={entry.maxQty}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[13px] font-medium text-gray-500">
                    Total Items
                  </span>
                  <span className="text-xl font-extrabold text-gray-900">
                    {totalItems}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0}
                  className="w-full flex justify-center items-center gap-2 py-4 rounded-xl bg-[#E47926] hover:bg-[#c4651f] text-white font-bold text-[14px] transition-all shadow-sm shadow-orange-500/20 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Processing…"
                    : `Confirm ${activeTab === "issue" ? "Issue" : "Return"}`}
                  <ArrowRight
                    size={18}
                    strokeWidth={2.5}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Movement;
