import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Plus, List, Tag, Calendar, Loader2, Edit2,
    Check, X, Layers, Sparkles, Hash, ArrowUpRight, Trash2, ImageIcon, Upload, Percent, Gift
} from "lucide-react";

const API = "https://api.brando.org.in/api/admin/offers";

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

const InputField = ({ value, onChange, placeholder, type = "text" }) => (
    <div className="relative group">
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 
          text-sm outline-none transition-all duration-300 placeholder:text-gray-500 font-medium text-white
          focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 group-hover:border-white/20"
        />
    </div>
);

const Offers = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState({ create: false, update: false, delete: false });
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState("");

    const fetchOffers = async () => {
        try {
            setFetching(true);
            setError("");
            const { data } = await axios.get(API);
            setOffers(data.data || []);
        } catch (error) {
            console.error(error);
            setError("Failed to fetch offers");
            showAlert('error', 'Oops...', 'Failed to fetch offers');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchOffers(); }, []);

    const handleImageChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (file) {
            if (isEdit) {
                setEditImage(file);
                setEditImagePreview(URL.createObjectURL(file));
            } else {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Offer title is required");
            showAlert('warning', 'Title required', 'Please enter an offer title');
            return;
        }
        if (!description.trim()) {
            setError("Offer description is required");
            showAlert('warning', 'Description required', 'Please enter an offer description');
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (image) {
            formData.append("image", image);
        }

        try {
            setLoading(prev => ({ ...prev, create: true }));
            setError("");
            await axios.post(API, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setTitle("");
            setDescription("");
            setImage(null);
            setImagePreview("");
            fetchOffers();
            showAlert('success', 'Success!', 'Offer created successfully', 2000);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Failed to create offer");
            showAlert('error', 'Creation failed', error.response?.data?.message || "Failed to create offer");
        } finally {
            setLoading(prev => ({ ...prev, create: false }));
        }
    };

    const startEdit = (offer) => {
        setEditingId(offer._id);
        setEditTitle(offer.title);
        setEditDescription(offer.description);
        setEditImagePreview(offer.image || "");
        setEditImage(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditImage(null);
        setEditImagePreview("");
    };

    const handleUpdate = async (id) => {
        if (!editTitle.trim()) {
            setError("Offer title is required");
            showAlert('warning', 'Title required', 'Please enter an offer title');
            return;
        }
        if (!editDescription.trim()) {
            setError("Offer description is required");
            showAlert('warning', 'Description required', 'Please enter an offer description');
            return;
        }

        const formData = new FormData();
        formData.append("title", editTitle);
        formData.append("description", editDescription);
        if (editImage) {
            formData.append("image", editImage);
        }

        try {
            setLoading(prev => ({ ...prev, update: true }));
            setError("");
            await axios.put(`${API}/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setEditingId(null);
            setEditTitle("");
            setEditDescription("");
            setEditImage(null);
            setEditImagePreview("");
            fetchOffers();
            showAlert('success', 'Updated!', 'Offer updated successfully', 2000);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Failed to update offer");
            showAlert('error', 'Update failed', error.response?.data?.message || "Failed to update offer");
        } finally {
            setLoading(prev => ({ ...prev, update: false }));
        }
    };

    const handleDelete = async (id, offerTitle) => {
        const result = await Swal.fire({
            title: 'Delete Offer?',
            text: `Are you sure you want to delete "${offerTitle}"? This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            background: '#0f172a',
            color: '#fff',
            customClass: {
                popup: 'rounded-2xl',
                title: 'text-lg font-bold',
                confirmButton: 'bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-xl font-semibold',
                cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
            }
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(prev => ({ ...prev, delete: true }));
            await axios.delete(`${API}/${id}`);
            
            showAlert('success', 'Deleted!', 'Offer has been deleted successfully', 2000);
            fetchOffers();
            
            if (editingId === id) {
                setEditingId(null);
                setEditTitle("");
                setEditDescription("");
                setEditImage(null);
                setEditImagePreview("");
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Failed to delete offer";
            setError(errorMessage);
            showAlert('error', 'Delete failed', errorMessage);
        } finally {
            setLoading(prev => ({ ...prev, delete: false }));
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

    const TableRow = ({ offer, index }) => (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
            {/* Index */}
            <td className="px-6 py-5">
                <span className="font-mono text-sm font-bold text-gray-500">
                    {(index + 1).toString().padStart(2, "0")}
                </span>
            </td>

            {/* Offer Image */}
            <td className="px-6 py-5">
                {editingId === offer._id ? (
                    <div className="space-y-3">
                        {editImagePreview && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10">
                                <img 
                                    src={editImagePreview} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl 
                        bg-white/10 hover:bg-white/20 transition-all text-sm text-white">
                            <Upload size={14} />
                            Choose Image
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, true)}
                                className="hidden"
                            />
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                            {offer.image ? (
                                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={20} className="text-emerald-400" />
                            )}
                        </div>
                    </div>
                )}
            </td>

            {/* Offer Title */}
            <td className="px-6 py-5">
                {editingId === offer._id ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-white/20 focus:border-emerald-500 
                        focus:ring-4 focus:ring-emerald-500/20 outline-none text-sm w-full bg-white/10 text-white"
                        autoFocus
                    />
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                            <Gift size={14} className="text-emerald-400" />
                        </div>
                        <span className="font-bold text-white">{offer.title}</span>
                    </div>
                )}
            </td>

            {/* Offer Description */}
            <td className="px-6 py-5">
                {editingId === offer._id ? (
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows="2"
                        className="px-4 py-2.5 rounded-xl border border-white/20 focus:border-emerald-500 
                        focus:ring-4 focus:ring-emerald-500/20 outline-none text-sm w-full bg-white/10 text-white resize-none"
                    />
                ) : (
                    <div className="flex items-center gap-3">
                        <Percent size={14} className="text-emerald-400" />
                        <span className="text-sm text-gray-300 max-w-xs truncate">{offer.description}</span>
                    </div>
                )}
            </td>

            {/* Created Date */}
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} className="text-emerald-400" />
                    <span className="text-sm font-medium">
                        {new Date(offer.createdAt).toLocaleDateString("en-US", {
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
                    {editingId === offer._id ? (
                        <>
                            <button
                                onClick={() => handleUpdate(offer._id)}
                                disabled={loading.update}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 
                                text-white hover:scale-110 transition-all"
                                title="Save"
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
                                title="Cancel"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => startEdit(offer)}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 
                                text-white hover:scale-110 transition-all"
                                title="Edit Offer"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(offer._id, offer.title)}
                                disabled={loading.delete}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 
                                text-white hover:scale-110 transition-all"
                                title="Delete Offer"
                            >
                                {loading.delete ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </button>
                        </>
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
                            <Percent size={28} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-white">Offer Management</h1>
                            <Sparkles size={20} className="text-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-base text-gray-400 font-medium">
                            Create and manage promotional offers and discounts
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
                {/* Create Offer Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 
                shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">

                    <div className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Plus size={16} className="text-white" />
                            </div>
                            <h2 className="text-sm font-black text-white tracking-widest uppercase">
                                Create New Offer
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-white/10">
                                        <Gift size={14} className="text-emerald-400" />
                                    </div>
                                    Offer Title
                                </label>
                                <InputField value={title} onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Summer Sale, Weekend Discount" />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-white/10">
                                        <ImageIcon size={14} className="text-emerald-400" />
                                    </div>
                                    Offer Image
                                </label>
                                <div className="space-y-3">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl 
                                    bg-white/10 hover:bg-white/20 transition-all text-sm text-white">
                                        <Upload size={16} />
                                        Choose Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, false)}
                                            className="hidden"
                                        />
                                    </label>
                                    {imagePreview && (
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/10">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImage(null);
                                                    setImagePreview("");
                                                }}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white 
                                                hover:scale-110 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-white/10">
                                        <Percent size={14} className="text-emerald-400" />
                                    </div>
                                    Offer Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    placeholder="Describe your offer in detail..."
                                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 
                                    text-sm outline-none transition-all duration-300 placeholder:text-gray-500 font-medium text-white
                                    focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <ActionButton onClick={handleSubmit} loading={loading.create} icon={Plus}>
                                Create Offer
                            </ActionButton>
                        </div>
                    </form>
                </div>

                {/* Offer List */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 
                shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">

                    <div className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <List size={16} className="text-white" />
                                </div>
                                <h2 className="text-sm font-black text-white tracking-widest uppercase">
                                    Active Offers
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                <span className="text-xs font-bold text-white">Total</span>
                                <span className="text-lg font-black text-white">{offers.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {fetching ? (
                            <div className="flex flex-col items-center py-20">
                                <Loader2 size={40} className="text-emerald-400 animate-spin" />
                                <p className="text-sm font-medium text-gray-500 mt-6">Loading offers...</p>
                            </div>
                        ) : offers.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/10 
                                flex items-center justify-center">
                                    <Percent size={40} className="text-emerald-400" />
                                </div>
                                <p className="text-white font-bold text-lg mb-2">No offers found</p>
                                <p className="text-sm text-gray-500">Create your first offer to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            {[
                                                { icon: Hash, label: '#' },
                                                { icon: ImageIcon, label: 'Image' },
                                                { icon: Gift, label: 'Title' },
                                                { icon: Percent, label: 'Description' },
                                                { icon: Calendar, label: 'Created' },
                                                { icon: Trash2, label: 'Actions', align: 'right' }
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
                                        {offers.map((offer, index) => (
                                            <TableRow key={offer._id} offer={offer} index={index} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Card */}
                {offers.length > 0 && (
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
                                            {offers.length}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 mb-1">Total Offers</p>
                                        <p className="text-2xl font-black text-white">{offers.length}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={fetchOffers}
                                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                                        title="Refresh">
                                        <Loader2 size={18} className={`text-emerald-400 ${fetching ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Offers;