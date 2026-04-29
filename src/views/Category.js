import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Plus, List, Tag, Calendar, Loader2, Edit2,
    Check, X, Layers, Sparkles, Hash, ArrowUpRight
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/Admin";

// SweetAlert config with dark theme
const showAlert = (icon, title, text, timer) => Swal.fire({
    icon, title, text, timer,
    background: '#0f172a',
    color: '#fff',
    customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-bold',
        confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold border-none'
    }
});


const InputField = ({ value, onChange, placeholder }) => (
    <div className="relative group">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 
          text-sm outline-none transition-all duration-300 placeholder:text-gray-500 font-medium text-white
          focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 group-hover:border-white/20"
        />
    </div>
);

const Category = () => {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState({ create: false, update: false });
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    const fetchCategories = async () => {
        try {
            setFetching(true);
            setError("");
            const { data } = await axios.get(`${API}/getallCategories`);
            setCategories(data.categories || []);
        } catch (error) {
            console.error(error);
            setError("Failed to fetch categories");
            showAlert('error', 'Oops...', 'Failed to fetch categories');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Category name is required");
            showAlert('warning', 'Name required', 'Please enter a category name');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, create: true }));
            setError("");
            await axios.post(`${API}/createCategory`, { name });
            setName("");
            fetchCategories();
            showAlert('success', 'Success!', 'Category created successfully', 2000);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Failed to create category");
            showAlert('error', 'Creation failed', error.response?.data?.message || "Failed to create category");
        } finally {
            setLoading(prev => ({ ...prev, create: false }));
        }
    };

    const startEdit = ({ _id, name }) => {
        setEditingId(_id);
        setEditName(name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleUpdate = async (id) => {
        if (!editName.trim()) {
            setError("Category name is required");
            showAlert('warning', 'Name required', 'Please enter a category name');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, update: true }));
            setError("");
            await axios.put(`${API}/updateCategory/${id}`, { name: editName });
            setEditingId(null);
            setEditName("");
            fetchCategories();
            showAlert('success', 'Updated!', 'Category updated successfully', 2000);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Failed to update category");
            showAlert('error', 'Update failed', error.response?.data?.message || "Failed to update category");
        } finally {
            setLoading(prev => ({ ...prev, update: false }));
        }
    };


    const ActionButton = ({ onClick, loading, icon: Icon, children, gradient = "from-emerald-500 to-emerald-600" }) => (
        <button
            onClick={onClick}
            disabled={loading}
            className="relative group overflow-hidden px-10 py-4 rounded-2xl text-white font-black text-sm 
        transition-all duration-300 min-w-[160px] justify-center disabled:opacity-60"
        >
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} group-hover:scale-105 transition-transform`} />
            <span className="relative flex items-center justify-center gap-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
                <span>{children}</span>
                {!loading && <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
            </span>
        </button>
    );

    const TableRow = ({ cat, index }) => (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">

            {/* Index */}
            <td className="px-6 py-5">
                <span className="font-mono text-sm font-bold text-gray-500">
                    {(index + 1).toString().padStart(2, "0")}
                </span>
            </td>

            {/* Category Name */}
            <td className="px-6 py-5">
                {editingId === cat._id ? (
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-white/20 focus:border-emerald-500 
          focus:ring-4 focus:ring-emerald-500/20 outline-none text-sm w-full bg-white/10 text-white"
                        autoFocus
                    />
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                            <Tag size={14} className="text-emerald-400" />
                        </div>
                        <span className="font-bold text-white">{cat.name}</span>
                    </div>
                )}
            </td>

            {/* Created Date */}
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} className="text-emerald-400" />
                    <span className="text-sm font-medium">
                        {new Date(cat.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-2">

                    {editingId === cat._id ? (
                        <>
                            <button
                                onClick={() => handleUpdate(cat._id)}
                                disabled={loading.update}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 
              text-white hover:scale-110 transition-all"
                            >
                                {loading.update ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Check size={16} />
                                )}
                            </button>

                            <button
                                onClick={cancelEdit}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 
              text-white hover:scale-110 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => startEdit(cat)}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 
            text-white hover:scale-110 transition-all"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}

                </div>
            </td>

        </tr>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/5 rounded-3xl -z-10 blur-3xl" />
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-50" />
                        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
              text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10">
                            <Layers size={28} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-white">Category Management</h1>
                            <Sparkles size={20} className="text-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-base text-gray-400 font-medium">
                            Create and manage your hostel categories with ease
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 
          rounded-2xl flex items-center gap-4 text-red-400">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
            text-white flex items-center justify-center text-sm font-bold border border-red-500/20">!</div>
                    <p className="text-sm font-medium flex-1">{error}</p>
                    <button onClick={() => setError("")} className="p-2 hover:bg-white/10 rounded-xl">
                        <X size={18} className="text-red-400" />
                    </button>
                </div>
            )}

            <div className="space-y-8">
                {/* Create Category Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 
          shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">

                    <div className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Plus size={16} className="text-white" />
                            </div>
                            <h2 className="text-sm font-black text-white tracking-widest uppercase">
                                Create New Category
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-white/10">
                                        <Hash size={14} className="text-emerald-400" />
                                    </div>
                                    Category Name
                                </label>
                                <InputField value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Boys Hostel, Girls PG, Co-living" />
                            </div>

                            <div className="flex items-end">
                                <ActionButton onClick={handleSubmit} loading={loading.create} icon={Plus}>
                                    Create
                                </ActionButton>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Category List */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 
          shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">

                    <div className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <List size={16} className="text-white" />
                                </div>
                                <h2 className="text-sm font-black text-white tracking-widest uppercase">
                                    Category Directory
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                <span className="text-xs font-bold text-white">Total</span>
                                <span className="text-lg font-black text-white">{categories.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {fetching ? (
                            <div className="flex flex-col items-center py-20">
                                <Loader2 size={40} className="text-emerald-400 animate-spin" />
                                <p className="text-sm font-medium text-gray-500 mt-6">Loading categories...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/10 
                  flex items-center justify-center">
                                    <Layers size={40} className="text-emerald-400" />
                                </div>
                                <p className="text-white font-bold text-lg mb-2">No categories found</p>
                                <p className="text-sm text-gray-500">Create your first category to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            {[
                                                { icon: Hash, label: '#' },
                                                { icon: Tag, label: 'Category Name' },
                                                { icon: Calendar, label: 'Created' },
                                                { icon: Edit2, label: 'Actions', align: 'right' }
                                            ].map(({ icon: Icon, label, align = 'left' }) => (
                                                <th key={label} className={`px-6 py-4 text-xs font-black text-emerald-400 uppercase tracking-wider
                          text-${align}`}>
                                                    <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
                                                        <Icon size={14} />
                                                        <span>{label}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((cat, index) => (
                                            <TableRow key={cat._id} cat={cat} index={index} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Card */}
                {categories.length > 0 && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 
              rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />

                        <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-6 
              border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 
                      rounded-2xl blur-md opacity-60" />
                                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br 
                      from-emerald-500 to-emerald-600 flex items-center justify-center 
                      text-white font-black text-xl shadow-2xl">
                                            {categories.length}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 mb-1">Total Categories</p>
                                        <p className="text-2xl font-black text-white">{categories.length}</p>
                                    </div>
                                </div>

                                <button onClick={fetchCategories}
                                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                                    <Loader2 size={18} className={`text-emerald-400 ${fetching ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Category;