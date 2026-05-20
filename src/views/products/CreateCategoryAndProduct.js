import React, { memo, useState, useCallback } from "react";
import {
    Plus, FolderTree, Package, Upload, ChevronDown,
    ImageIcon, Trash2, Sparkles,
} from "lucide-react";

/* ─────────────────────── UNITS ─────────────────────── */
const UNITS = ["kg", "litre", "dozen"];

/* ─────────────────────── HELPERS ─────────────────────── */
const InputField = memo(({ value, onChange, placeholder, type = "text" }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3.5 rounded-2xl border border-green-500/10 bg-[#0a1710] text-sm text-white font-medium outline-none transition-all placeholder:text-green-100/25 focus:border-green-500/60 focus:ring-4 focus:ring-green-500/10"
    />
));

const SelectField = memo(({ value, onChange, placeholder, options }) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3.5 rounded-2xl border border-green-500/10 bg-[#0a1710] text-sm font-medium outline-none transition-all appearance-none text-white focus:border-green-500/60 focus:ring-4 focus:ring-green-500/10"
        >
            <option value="" disabled className="bg-[#0a1710]">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt} className="bg-[#0a1710]">
                    {opt.label ?? opt}
                </option>
            ))}
        </select>
        <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
    </div>
));

const UploadBox = memo(({ preview, onChange, label = "Upload Image" }) => (
    <div className="flex items-center gap-3">
        <label className="flex-1 h-11 rounded-2xl bg-green-500/5 border border-green-500/10 hover:border-green-500/40 hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 text-xs font-bold text-green-300/70 hover:text-green-300 cursor-pointer">
            <Upload size={13} />
            {label}
            <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        </label>
        {preview ? (
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-green-500/20 shrink-0">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
            </div>
        ) : (
            <div className="w-11 h-11 rounded-xl border border-green-500/10 bg-green-500/5 flex items-center justify-center shrink-0">
                <ImageIcon size={16} className="text-green-400/30" />
            </div>
        )}
    </div>
));

const SectionHeader = ({ icon: Icon, title, count }) => (
    <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
                <Icon size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-black tracking-[0.15em] uppercase text-white">{title}</h2>
        </div>
        {count !== undefined && (
            <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                {count}
            </span>
        )}
    </div>
);

/* ─────────────────────── MAIN ─────────────────────── */
const CreateProductAndCategory = ({
    categories = [],
    onAddCategory,
    onDeleteCategory,
    onAddProduct,
    products = [],
}) => {
    const [catForm, setCatForm] = useState({ name: "", image: "" });
    const [catError, setCatError] = useState("");

    const [prodForm, setProdForm] = useState({
        name: "", category: "", price: "", unit: "", image: "",
    });
    const [prodErrors, setProdErrors] = useState({});

    /* ── Category image ── */
    const handleCatImage = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCatForm((p) => ({ ...p, image: URL.createObjectURL(file) }));
    }, []);

    /* ── Product image ── */
    const handleProdImage = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProdForm((p) => ({ ...p, image: URL.createObjectURL(file) }));
    }, []);

    /* ── Create category ── */
    const submitCategory = () => {
        if (!catForm.name.trim()) { setCatError("Category name is required"); return; }
        setCatError("");
        onAddCategory?.({
            _id: Date.now(),
            name: catForm.name.trim(),
            image: catForm.image,
            createdAt: new Date(),
        });
        setCatForm({ name: "", image: "" });
    };

    /* ── Create product ── */
    const submitProduct = () => {
        const errs = {};
        if (!prodForm.name.trim()) errs.name = "Product name is required";
        if (!prodForm.category) errs.category = "Select a category";
        setProdErrors(errs);
        if (Object.keys(errs).length) return;

        onAddProduct?.({
            _id: Date.now(),
            ...prodForm,
            name: prodForm.name.trim(),
            createdAt: new Date(),
        });
        setProdForm({ name: "", category: "", price: "", unit: "", image: "" });
        setProdErrors({});
    };

    return (
        <div className="min-h-screen bg-[#07120c] p-4 sm:p-6 lg:p-8">

            {/* Ambient glow */}
            <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-green-500/8 blur-[140px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Page title */}
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/25 shrink-0">
                    <Package size={22} className="text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-[28px] font-black text-white leading-tight">
                            Products & Categories
                        </h1>
                        <Sparkles size={16} className="text-green-400 hidden sm:block" />
                    </div>
                    <p className="text-green-100/40 text-xs sm:text-sm mt-0.5">Create and organise your catalogue</p>
                </div>
            </div>

            {/* ══ TOP GRID: Create forms ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

                {/* ── CREATE CATEGORY ── */}
                <div className="bg-[#0d1b13] rounded-[28px] border border-green-500/10 p-5 sm:p-6 shadow-2xl">
                    <SectionHeader icon={FolderTree} title="Create Category" />

                    <div className="space-y-3">
                        <div>
                            <InputField
                                value={catForm.name}
                                onChange={(e) => { setCatForm((p) => ({ ...p, name: e.target.value })); setCatError(""); }}
                                placeholder="Category name"
                            />
                            {catError && <p className="text-red-400 text-xs mt-1.5 pl-1">{catError}</p>}
                        </div>

                        <UploadBox preview={catForm.image} onChange={handleCatImage} />

                        <button
                            onClick={submitCategory}
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-sm transition-all hover:scale-[1.015] hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
                        >
                            <Plus size={16} />
                            Create Category
                        </button>
                    </div>
                </div>

                {/* ── CREATE PRODUCT ── */}
                <div className="bg-[#0d1b13] rounded-[28px] border border-green-500/10 p-5 sm:p-6 shadow-2xl">
                    <SectionHeader icon={Package} title="Create Product" />

                    <div className="space-y-3">
                        <div>
                            <InputField
                                value={prodForm.name}
                                onChange={(e) => { setProdForm((p) => ({ ...p, name: e.target.value })); setProdErrors((p) => ({ ...p, name: "" })); }}
                                placeholder="Product name"
                            />
                            {prodErrors.name && <p className="text-red-400 text-xs mt-1.5 pl-1">{prodErrors.name}</p>}
                        </div>

                        <div>
                            <SelectField
                                value={prodForm.category}
                                onChange={(e) => { setProdForm((p) => ({ ...p, category: e.target.value })); setProdErrors((p) => ({ ...p, category: "" })); }}
                                placeholder="Select category"
                                options={categories.map((c) => ({ value: c._id, label: c.name }))}
                            />
                            {prodErrors.category && <p className="text-red-400 text-xs mt-1.5 pl-1">{prodErrors.category}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                type="number"
                                value={prodForm.price}
                                onChange={(e) => setProdForm((p) => ({ ...p, price: e.target.value }))}
                                placeholder="Price"
                            />
                            <SelectField
                                value={prodForm.unit}
                                onChange={(e) => setProdForm((p) => ({ ...p, unit: e.target.value }))}
                                placeholder="Unit"
                                options={UNITS}
                            />
                        </div>

                        <UploadBox preview={prodForm.image} onChange={handleProdImage} />

                        <button
                            onClick={submitProduct}
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-sm transition-all hover:scale-[1.015] hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
                        >
                            <Plus size={16} />
                            Create Product
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ CATEGORIES GRID ══ */}
            <div className="bg-[#0d1b13] rounded-[28px] border border-green-500/10 p-5 sm:p-6 shadow-2xl">
                <SectionHeader icon={FolderTree} title="All Categories" count={categories.length} />

                {categories.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/5 border border-green-500/10 flex items-center justify-center">
                            <FolderTree size={24} className="text-green-400/30" />
                        </div>
                        <p className="text-white/30 text-sm font-semibold">No categories yet</p>
                        <p className="text-white/20 text-xs">Create your first category above</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {categories.map((cat) => {
                            const itemCount = products.filter((p) => String(p.category) === String(cat._id)).length;
                            return (
                                <div
                                    key={cat._id}
                                    className="group relative bg-[#0a1710] border border-green-500/10 rounded-2xl overflow-hidden hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300"
                                >
                                    {/* Image area */}
                                    <div className="h-20 sm:h-24 overflow-hidden">
                                        {cat.image ? (
                                            <img
                                                src={cat.image}
                                                alt={cat.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-green-500/5">
                                                <FolderTree size={26} className="text-green-400/20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Item count badge */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                                        <span className="text-[10px] font-bold text-green-400">{itemCount} items</span>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => onDeleteCategory?.(cat._id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/40 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={11} />
                                    </button>

                                    {/* Name + date */}
                                    <div className="p-3">
                                        <p className="text-white font-bold text-xs truncate mb-0.5">{cat.name}</p>
                                        <p className="text-green-100/30 text-[10px]">
                                            {new Date(cat.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateProductAndCategory;