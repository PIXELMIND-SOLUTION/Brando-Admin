// src/components/AllProducts.jsx
// Props:
//   products         - array of product objects
//   categories       - array of category objects
//   onDelete         - (id) => void
//   onUpdate         - (updatedProduct) => void

import React, { memo, useState, useCallback, useMemo } from "react";
import {
  Search, List, Layers, Tag, Calendar, DollarSign,
  ImageIcon, Trash2, Edit2, Eye, X, Check, ChevronDown,
  Upload, Package, Filter, AlertTriangle,
} from "lucide-react";

/* ─────────────────────── CONSTANTS ─────────────────────── */
const UNITS = ["kg", "litre", "pcs", "box"];

/* ─────────────────────── SAMPLE DATA ─────────────────────── */
const SAMPLE_CATEGORIES = [
  {
    _id: 1001,
    name: "Fresh Vegetables",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    createdAt: new Date("2024-11-10"),
  },
  {
    _id: 1002,
    name: "Dairy & Eggs",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
    createdAt: new Date("2024-11-12"),
  },
];

const SAMPLE_PRODUCTS = [
  {
    _id: 2001,
    name: "Organic Spinach",
    category: 1001,
    price: "3.49",
    unit: "kg",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
    createdAt: new Date("2024-12-01"),
  },
  {
    _id: 2002,
    name: "Free-Range Eggs",
    category: 1002,
    price: "5.99",
    unit: "pcs",
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80",
    createdAt: new Date("2024-12-03"),
  },
];

/* ─────────────────────── SMALL ATOMS ─────────────────────── */
const InputField = memo(({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-3 rounded-2xl border border-green-500/10 bg-[#0a1710] text-sm text-white font-medium outline-none transition-all placeholder:text-green-100/25 focus:border-green-500/60 focus:ring-4 focus:ring-green-500/10"
  />
));

const SelectField = memo(({ value, onChange, placeholder, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-2xl border border-green-500/10 bg-[#0a1710] text-sm font-medium outline-none transition-all appearance-none text-white focus:border-green-500/60 focus:ring-4 focus:ring-green-500/10"
    >
      <option value="" disabled className="bg-[#0a1710]">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt} className="bg-[#0a1710]">
          {opt.label ?? opt}
        </option>
      ))}
    </select>
    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
  </div>
));

/* ─────────────────────── VIEW MODAL ─────────────────────── */
const ViewModal = ({ product, category, onClose }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0d1b13] border border-green-500/20 rounded-[32px] shadow-2xl shadow-green-500/10 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="h-48 w-full overflow-hidden relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-500/5">
              <Package size={48} className="text-green-400/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b13] to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/70 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-4 relative">
          <h2 className="text-xl font-black text-white mb-1">{product.name}</h2>
          <p className="text-green-100/40 text-xs mb-5">
            Added {new Date(product.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Category", value: category?.name || "—", icon: Tag },
              { label: "Unit", value: product.unit || "—", icon: Package },
              {
                label: "Price",
                value: product.price ? `$${Number(product.price).toFixed(2)}` : "—",
                icon: DollarSign,
                accent: true,
              },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div key={label} className="bg-[#0a1710] rounded-2xl p-4 border border-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className="text-green-400/60" />
                  <span className="text-[11px] text-green-100/40 font-semibold uppercase tracking-wider">{label}</span>
                </div>
                <p className={`font-black text-base ${accent ? "text-green-400" : "text-white"}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── EDIT MODAL ─────────────────────── */
const EditModal = ({ product, categories, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    unit: product?.unit || "",
    image: product?.image || "",
  });
  const [errors, setErrors] = useState({});

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, image: URL.createObjectURL(file) }));
  };

  const save = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.category) errs.category = "Category is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...product, ...form, name: form.name.trim() });
    onClose();
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0d1b13] border border-green-500/20 rounded-[32px] shadow-2xl shadow-green-500/10 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Edit2 size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-black tracking-[0.15em] uppercase text-white">Edit Product</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-3.5">
          <div>
            <InputField
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })); }}
              placeholder="Product name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1 pl-1">{errors.name}</p>}
          </div>

          <div>
            <SelectField
              value={form.category}
              onChange={(e) => { setForm((p) => ({ ...p, category: e.target.value })); setErrors((p) => ({ ...p, category: "" })); }}
              placeholder="Select category"
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
            />
            {errors.category && <p className="text-red-400 text-xs mt-1 pl-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="Price"
            />
            <SelectField
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              placeholder="Unit"
              options={UNITS}
            />
          </div>

          {/* Image upload */}
          <div className="flex items-center gap-3">
            <label className="flex-1 h-11 rounded-2xl bg-green-500/5 border border-green-500/10 hover:border-green-500/40 hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 text-xs font-bold text-green-300/60 hover:text-green-300 cursor-pointer">
              <Upload size={13} />
              Change Image
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
            {form.image ? (
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-green-500/20 shrink-0">
                <img src={form.image} alt="preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl border border-green-500/10 bg-green-500/5 flex items-center justify-center shrink-0">
                <ImageIcon size={16} className="text-green-400/30" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-2xl border border-green-500/10 text-white/60 hover:text-white hover:border-green-500/30 text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-sm hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Check size={15} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── DELETE CONFIRM MODAL ─────────────────────── */
const DeleteModal = ({ product, onClose, onConfirm }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0d1b13] border border-red-500/20 rounded-[28px] shadow-2xl w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h3 className="text-white font-black text-lg mb-1">Delete Product?</h3>
        <p className="text-white/40 text-sm mb-6">
          "<span className="text-white/60 font-semibold">{product.name}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(product._id); onClose(); }}
            className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── MAIN ─────────────────────── */
const AllProducts = ({
  products: productsProp,
  categories: categoriesProp,
  onDelete,
  onUpdate,
}) => {
  const [internalCategories] = useState(categoriesProp ?? SAMPLE_CATEGORIES);
  const [internalProducts, setInternalProducts] = useState(productsProp ?? SAMPLE_PRODUCTS);

  const products   = productsProp   ?? internalProducts;
  const categories = categoriesProp ?? internalCategories;

  const handleDelete = onDelete
    ? onDelete
    : (id) => setInternalProducts((p) => p.filter((pr) => pr._id !== id));

  const handleUpdate = onUpdate
    ? onUpdate
    : (updated) => setInternalProducts((p) => p.map((pr) => pr._id === updated._id ? updated : pr));

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() =>
    products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || String(p.category) === String(filterCat);
      return matchSearch && matchCat;
    }),
    [products, search, filterCat]
  );

  const getCat = useCallback(
    (catId) => categories.find((c) => String(c._id) === String(catId)),
    [categories]
  );

  return (
    <>
      {/* ── Modals ── */}
      {viewProduct && (
        <ViewModal
          product={viewProduct}
          category={getCat(viewProduct.category)}
          onClose={() => setViewProduct(null)}
        />
      )}
      {editProduct && (
        <EditModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSave={(updated) => { handleUpdate(updated); setEditProduct(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={(id) => { handleDelete(id); setDeleteTarget(null); }}
        />
      )}

      <div className="min-h-screen bg-[#07120c] p-4 sm:p-6 lg:p-8">
        <div className="fixed top-0 left-0 w-[300px] h-[300px] bg-green-500/6 blur-[120px] rounded-full pointer-events-none" />

        {/* ── Page title ── */}
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/25 shrink-0">
            <List size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black text-white leading-tight">All Products</h1>
            <p className="text-green-100/40 text-xs sm:text-sm mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        {/* ── Filters bar ── */}
        <div className="bg-[#0d1b13] rounded-[24px] border border-green-500/10 p-4 mb-5 flex flex-wrap gap-3 items-center shadow-xl">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/60" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0a1710] border border-green-500/10 text-sm text-white placeholder:text-white/25 outline-none focus:border-green-500/50 transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="relative min-w-[160px]">
            <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/60 pointer-events-none" />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#0a1710] border border-green-500/10 text-sm text-white outline-none appearance-none focus:border-green-500/50 transition-all"
            >
              <option value="" className="bg-[#0a1710]">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#0a1710]">{c.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/60 pointer-events-none" />
          </div>

          {/* Count chip */}
          <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Table card ── */}
        <div className="bg-[#0d1b13] rounded-[28px] border border-green-500/10 overflow-hidden shadow-2xl">

          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/5 border border-green-500/10 flex items-center justify-center">
                <Layers size={28} className="text-green-400/20" />
              </div>
              <div className="text-center">
                <p className="text-white/50 font-bold text-base">No products found</p>
                <p className="text-white/25 text-xs mt-1">
                  {search || filterCat ? "Try adjusting your filters" : "Create your first product to get started"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ─── Desktop Table ─── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-green-500/10">
                      {["#", "Image", "Product", "Category", "Price", "Unit", "Created", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-4 text-left text-[11px] uppercase tracking-widest text-green-400/70 font-black whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product, idx) => {
                      const cat = getCat(product.category);
                      return (
                        <tr
                          key={product._id}
                          className="border-b border-green-500/5 hover:bg-green-500/[0.03] transition-colors group"
                        >
                          {/* # */}
                          <td className="px-5 py-4 text-green-400/40 font-mono text-xs">
                            {String(idx + 1).padStart(2, "0")}
                          </td>

                          {/* Image */}
                          <td className="px-5 py-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-green-500/10 shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                  <ImageIcon size={15} className="text-green-400/40" />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                <Tag size={12} className="text-green-400" />
                              </div>
                              <span className="font-bold text-white text-sm whitespace-nowrap">{product.name}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            <span className="text-xs text-gray-300 font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-green-500/10 whitespace-nowrap">
                              {cat?.name || "—"}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-green-400 font-black text-sm">
                              <DollarSign size={13} />
                              <span>{Number(product.price || 0).toFixed(2)}</span>
                            </div>
                          </td>

                          {/* Unit */}
                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
                              {product.unit || "—"}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-gray-400 whitespace-nowrap">
                              <Calendar size={12} className="text-green-400/60" />
                              <span className="text-xs">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setViewProduct(product)}
                                title="View"
                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-all"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => setEditProduct(product)}
                                title="Edit"
                                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white transition-all"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(product)}
                                title="Delete"
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ─── Mobile Cards ─── */}
              <div className="md:hidden p-4 space-y-3">
                {filtered.map((product) => {
                  const cat = getCat(product.category);
                  return (
                    <div
                      key={product._id}
                      className="bg-[#0a1710] border border-green-500/10 rounded-2xl p-4 flex gap-3"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-green-500/10 shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <ImageIcon size={18} className="text-green-400/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="font-bold text-white text-sm truncate">{product.name}</p>
                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setViewProduct(product)}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-all"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => setEditProduct(product)}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white transition-all"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {cat && (
                            <span className="text-[11px] text-gray-400 px-2 py-0.5 rounded-lg bg-white/5 border border-green-500/10">
                              {cat.name}
                            </span>
                          )}
                          <span className="text-[11px] font-black text-green-400 flex items-center gap-0.5">
                            <DollarSign size={11} />
                            {Number(product.price || 0).toFixed(2)}
                          </span>
                          {product.unit && (
                            <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 uppercase">
                              {product.unit}
                            </span>
                          )}
                          <span className="text-[11px] text-white/25">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AllProducts;