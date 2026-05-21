import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import {
    Plus, FolderTree, Package, Upload, ChevronDown,
    ImageIcon, Trash2, Sparkles, Edit2, X, ChevronLeft, ChevronRight
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const API = "https://api.brando.org.in/api/admin";

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

/* ─────────────────────── UNITS ─────────────────────── */
const UNITS = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "g", label: "Gram (g)" },
    { value: "litre", label: "Litre (L)" },
    { value: "ml", label: "Millilitre (ml)" },
    { value: "dozen", label: "Dozen" },
    { value: "piece", label: "Piece" },
    { value: "packet", label: "Packet" },
    { value: "bottle", label: "Bottle" }
];

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

// Responsive Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= (maxVisible === 3 ? 3 : 4); i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - (maxVisible === 3 ? 2 : 3); i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-500/20 transition-all"
            >
                <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
            </button>
            
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        currentPage === page
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            : 'bg-green-500/10 border border-green-500/20 text-white/70 hover:bg-green-500/20'
                    }`}
                    disabled={page === '...'}
                >
                    {page}
                </button>
            ))}
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-500/20 transition-all"
            >
                <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </button>
        </div>
    );
};

// Data Table Component with responsive design
const DataTable = ({ columns, data, onEdit, onDelete, itemsPerPage = 10 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerPageState(5);
            } else if (window.innerWidth < 768) {
                setItemsPerPageState(7);
            } else {
                setItemsPerPageState(itemsPerPage);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [itemsPerPage]);
    
    const totalPages = Math.ceil(data.length / itemsPerPageState);
    const startIndex = (currentPage - 1) * itemsPerPageState;
    const endIndex = startIndex + itemsPerPageState;
    const currentData = data.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [data.length, itemsPerPageState]);

    if (data.length === 0) {
        return (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-green-500/5 border border-green-500/10 flex items-center justify-center">
                    <Package size={24} className="text-green-400/30" />
                </div>
                <p className="text-white/30 text-sm font-semibold">No data available</p>
                <p className="text-white/20 text-xs">Create your first entry above</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-green-500/10">
                            <thead className="bg-green-500/5">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className="py-2 sm:py-3 px-2 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-green-400 uppercase tracking-wider">
                                            {col.header}
                                        </th>
                                    ))}
                                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-green-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-500/5">
                                {currentData.map((item, idx) => (
                                    <tr key={item._id || idx} className="hover:bg-green-500/5 transition-colors">
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className="py-2 sm:py-3 px-2 sm:px-4 text-[11px] sm:text-sm text-white/80">
                                                {col.accessor === 'image' ? (
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-green-500/20">
                                                        {item[col.accessor] ? (
                                                            <img src={item[col.accessor]} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-green-500/5">
                                                                <ImageIcon size={14} className="sm:w-4 sm:h-4 text-green-400/30" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : col.accessor === 'category' ? (
                                                    <span className="truncate max-w-[100px] block">{item.categoryId?.name || 'Uncategorized'}</span>
                                                ) : col.accessor === 'price' ? (
                                                    <span>₹{item.price}</span>
                                                ) : col.accessor === 'createdAt' ? (
                                                    <span className="text-[10px] sm:text-xs whitespace-nowrap">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                ) : typeof col.accessor === 'function' ? (
                                                    <span>{col.accessor(item)}</span>
                                                ) : (
                                                    <span className={col.accessor === 'name' ? 'font-semibold truncate max-w-[120px] sm:max-w-none block' : ''}>
                                                        {item[col.accessor]}
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                                            <div className="flex gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="p-1 sm:p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                                                >
                                                    <Edit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(item._id)}
                                                    className="p-1 sm:p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
    );
};

/* ─────────────────────── MAIN ─────────────────────── */
const CreateProductAndCategory = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState({ categories: false, products: false });
    
    const [catForm, setCatForm] = useState({ name: "", image: null, imagePreview: "" });
    const [catError, setCatError] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [highlightCategory, setHighlightCategory] = useState(false);

    const [prodForm, setProdForm] = useState({
        name: "", 
        categoryId: "", 
        price: "", 
        quantity: "", 
        unit: "", 
        type: "", 
        image: null, 
        imagePreview: ""
    });
    const [prodErrors, setProdErrors] = useState({});
    const [editingProduct, setEditingProduct] = useState(null);
    const [highlightProduct, setHighlightProduct] = useState(false);

    // Refs for scrolling
    const categoryFormRef = useRef(null);
    const productFormRef = useRef(null);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(prev => ({ ...prev, categories: true }));
            const { data } = await axios.get(`${API}/product-category`);
            setCategories(data.categories || []);
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', 'Could not fetch categories');
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(prev => ({ ...prev, products: true }));
            const { data } = await axios.get(`${API}/product`);
            setProducts(data.products || []);
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', 'Could not fetch products');
        } finally {
            setLoading(prev => ({ ...prev, products: false }));
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    // Scroll to element with highlight effect
    const scrollToElement = (elementRef, setHighlight) => {
        if (elementRef.current) {
            elementRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
            
            setHighlight(true);
            setTimeout(() => setHighlight(false), 2000);
        }
    };

    /* ── Category image ── */
    const handleCatImage = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCatForm((p) => ({ ...p, image: file, imagePreview: URL.createObjectURL(file) }));
    }, []);

    /* ── Product image ── */
    const handleProdImage = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProdForm((p) => ({ ...p, image: file, imagePreview: URL.createObjectURL(file) }));
    }, []);

    /* ── Create category ── */
    const submitCategory = async () => {
        if (!catForm.name.trim()) { 
            setCatError("Category name is required"); 
            return; 
        }
        
        setCatError("");
        
        const formData = new FormData();
        formData.append("name", catForm.name.trim());
        if (catForm.image) formData.append("image", catForm.image);

        try {
            await axios.post(`${API}/product-category`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            showAlert('success', 'Success!', 'Category created successfully', 2000);
            setCatForm({ name: "", image: null, imagePreview: "" });
            await fetchCategories();
            await fetchProducts();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', error.response?.data?.message || "Could not create category");
        }
    };

    /* ── Update category ── */
    const updateCategory = async () => {
        if (!catForm.name.trim()) {
            setCatError("Category name is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", catForm.name.trim());
        if (catForm.image) formData.append("image", catForm.image);

        try {
            await axios.put(`${API}/product-category/${editingCategory._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            showAlert('success', 'Updated!', 'Category updated successfully', 2000);
            setCatForm({ name: "", image: null, imagePreview: "" });
            setEditingCategory(null);
            await fetchCategories();
            await fetchProducts();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', error.response?.data?.message || "Could not update category");
        }
    };

    /* ── Delete category ── */
    const handleDeleteCategory = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Products in this category will also be deleted!",
            icon: 'warning',
            showCancelButton: true,
            background: '#0f172a',
            color: '#fff',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-semibold',
                cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${API}/product-category/${id}`);
            showAlert('success', 'Deleted!', 'Category deleted successfully', 2000);
            await fetchCategories();
            await fetchProducts();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', error.response?.data?.message || "Could not delete category");
        }
    };

    /* ── Edit category ── */
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCatForm({
            name: category.name,
            image: null,
            imagePreview: category.image
        });
        setCatError("");
        scrollToElement(categoryFormRef, setHighlightCategory);
    };

    /* ── Cancel edit category ── */
    const cancelEditCategory = () => {
        setEditingCategory(null);
        setCatForm({ name: "", image: null, imagePreview: "" });
        setCatError("");
        setHighlightCategory(false);
    };

    // Helper function to combine quantity and unit
    const combineQuantityAndUnit = (quantity, unit) => {
        if (!quantity && !unit) return "";
        if (quantity && !unit) return quantity.toString();
        if (!quantity && unit) return unit;
        return `${quantity}${unit}`;
    };

    // Helper function to parse type into quantity and unit
    const parseType = (type) => {
        if (!type) return { quantity: "", unit: "" };
        
        // Try to match pattern: number followed by letters
        const match = type.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
        if (match) {
            return { quantity: match[1], unit: match[2] };
        }
        
        // If no number found, treat as unit only
        return { quantity: "", unit: type };
    };

    /* ── Create product ── */
    const submitProduct = async () => {
        const errs = {};
        if (!prodForm.name.trim()) errs.name = "Product name is required";
        if (!prodForm.categoryId) errs.categoryId = "Select a category";
        if (!prodForm.price) errs.price = "Price is required";
        if (!prodForm.quantity && !prodForm.unit) errs.type = "Either quantity or unit is required";
        
        setProdErrors(errs);
        if (Object.keys(errs).length) return;

        // Combine quantity and unit to create type
        const combinedType = combineQuantityAndUnit(prodForm.quantity, prodForm.unit);
        
        const formData = new FormData();
        formData.append("name", prodForm.name.trim());
        formData.append("price", prodForm.price);
        formData.append("type", combinedType);
        formData.append("categoryId", prodForm.categoryId);
        if (prodForm.image) formData.append("image", prodForm.image);

        try {
            await axios.post(`${API}/product`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            showAlert('success', 'Success!', `Product created successfully with type: ${combinedType}`, 2000);
            setProdForm({ 
                name: "", 
                categoryId: "", 
                price: "", 
                quantity: "", 
                unit: "", 
                type: "", 
                image: null, 
                imagePreview: "" 
            });
            setProdErrors({});
            await fetchProducts();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', error.response?.data?.message || "Could not create product");
        }
    };

    /* ── Update product ── */
    const updateProduct = async () => {
        const errs = {};
        if (!prodForm.name.trim()) errs.name = "Product name is required";
        if (!prodForm.categoryId) errs.categoryId = "Select a category";
        if (!prodForm.price) errs.price = "Price is required";
        if (!prodForm.quantity && !prodForm.unit) errs.type = "Either quantity or unit is required";
        
        setProdErrors(errs);
        if (Object.keys(errs).length) return;

        // Combine quantity and unit to create type
        const combinedType = combineQuantityAndUnit(prodForm.quantity, prodForm.unit);
        
        const formData = new FormData();
        formData.append("name", prodForm.name.trim());
        formData.append("price", prodForm.price);
        formData.append("type", combinedType);
        formData.append("categoryId", prodForm.categoryId);
        if (prodForm.image) formData.append("image", prodForm.image);

        try {
            await axios.put(`${API}/product/${editingProduct._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            showAlert('success', 'Updated!', `Product updated successfully with type: ${combinedType}`, 2000);
            setProdForm({ 
                name: "", 
                categoryId: "", 
                price: "", 
                quantity: "", 
                unit: "", 
                type: "", 
                image: null, 
                imagePreview: "" 
            });
            setEditingProduct(null);
            setProdErrors({});
            await fetchProducts();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', error.response?.data?.message || "Could not update product");
        }
    };

    /* ── Delete product ── */
    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            background: '#0f172a',
            color: '#fff',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-semibold',
                cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${API}/product/${id}`);
            showAlert('success', 'Deleted!', 'Product deleted successfully', 2000);
            await fetchProducts();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', error.response?.data?.message || "Could not delete product");
        }
    };

    /* ── Edit product ── */
    const handleEditProduct = (product) => {
        // Parse the type field to get quantity and unit
        const { quantity, unit } = parseType(product.type);
        
        setEditingProduct(product);
        setProdForm({
            name: product.name,
            categoryId: product.categoryId?._id || product.categoryId,
            price: product.price,
            quantity: quantity,
            unit: unit,
            type: product.type,
            image: null,
            imagePreview: product.image
        });
        setProdErrors({});
        scrollToElement(productFormRef, setHighlightProduct);
    };

    /* ── Cancel edit product ── */
    const cancelEditProduct = () => {
        setEditingProduct(null);
        setProdForm({ 
            name: "", 
            categoryId: "", 
            price: "", 
            quantity: "", 
            unit: "", 
            type: "", 
            image: null, 
            imagePreview: "" 
        });
        setProdErrors({});
        setHighlightProduct(false);
    };

    // Table columns configuration
    const categoryColumns = [
        { header: "Image", accessor: "image" },
        { header: "Name", accessor: "name" },
        { header: "Products Count", accessor: (item) => products.filter(p => String(p.categoryId?._id || p.categoryId) === String(item._id)).length },
        { header: "Created At", accessor: "createdAt" }
    ];

    const productColumns = [
        { header: "Image", accessor: "image" },
        { header: "Name", accessor: "name" },
        { header: "Category", accessor: "category" },
        { header: "Price", accessor: "price" },
        { header: "Type", accessor: "type" },
        { header: "Created At", accessor: "createdAt" }
    ];

    return (
        <div className="min-h-screen bg-[#07120c] p-3 sm:p-4 md:p-6 lg:p-8">

            {/* Ambient glow */}
            <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-green-500/8 blur-[140px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Page title */}
            <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/25 shrink-0">
                    <Package size={18} className="sm:w-[22px] sm:h-[22px] text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl md:text-[28px] font-black text-white leading-tight">
                            Products & Categories
                        </h1>
                        <Sparkles size={14} className="sm:w-4 sm:h-4 text-green-400 hidden sm:block" />
                    </div>
                    <p className="text-green-100/40 text-[11px] sm:text-xs md:text-sm mt-0.5">Create and organise your catalogue</p>
                </div>
            </div>

            {/* ══ TOP GRID: Create forms ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">

                {/* ── CREATE/EDIT CATEGORY ── */}
                <div 
                    ref={categoryFormRef}
                    className={`bg-[#0d1b13] rounded-[24px] sm:rounded-[28px] border transition-all duration-500 p-4 sm:p-5 md:p-6 shadow-2xl ${
                        highlightCategory 
                            ? 'border-green-500/60 shadow-lg shadow-green-500/20 ring-2 ring-green-500/30' 
                            : 'border-green-500/10'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <SectionHeader icon={FolderTree} title={editingCategory ? "Edit Category" : "Create Category"} />
                        {editingCategory && (
                            <button onClick={cancelEditCategory} className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                <X size={14} className="sm:w-4 sm:h-4 text-red-400" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <InputField
                                value={catForm.name}
                                onChange={(e) => { setCatForm((p) => ({ ...p, name: e.target.value })); setCatError(""); }}
                                placeholder="Category name"
                            />
                            {catError && <p className="text-red-400 text-xs mt-1.5 pl-1">{catError}</p>}
                        </div>

                        <UploadBox preview={catForm.imagePreview} onChange={handleCatImage} />

                        <button
                            onClick={editingCategory ? updateCategory : submitCategory}
                            className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xs sm:text-sm transition-all hover:scale-[1.015] hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
                        >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                            {editingCategory ? "Update Category" : "Create Category"}
                        </button>
                    </div>
                </div>

                {/* ── CREATE/EDIT PRODUCT ── */}
                <div 
                    ref={productFormRef}
                    className={`bg-[#0d1b13] rounded-[24px] sm:rounded-[28px] border transition-all duration-500 p-4 sm:p-5 md:p-6 shadow-2xl ${
                        highlightProduct 
                            ? 'border-green-500/60 shadow-lg shadow-green-500/20 ring-2 ring-green-500/30' 
                            : 'border-green-500/10'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <SectionHeader icon={Package} title={editingProduct ? "Edit Product" : "Create Product"} />
                        {editingProduct && (
                            <button onClick={cancelEditProduct} className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                <X size={14} className="sm:w-4 sm:h-4 text-red-400" />
                            </button>
                        )}
                    </div>

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
                                value={prodForm.categoryId}
                                onChange={(e) => { setProdForm((p) => ({ ...p, categoryId: e.target.value })); setProdErrors((p) => ({ ...p, categoryId: "" })); }}
                                placeholder="Select category"
                                options={categories.map((c) => ({ value: c._id, label: c.name }))}
                            />
                            {prodErrors.categoryId && <p className="text-red-400 text-xs mt-1.5 pl-1">{prodErrors.categoryId}</p>}
                        </div>

                        <div>
                            <InputField
                                type="number"
                                value={prodForm.price}
                                onChange={(e) => setProdForm((p) => ({ ...p, price: e.target.value }))}
                                placeholder="Price (₹)"
                            />
                            {prodErrors.price && <p className="text-red-400 text-xs mt-1.5 pl-1">{prodErrors.price}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputField
                                    type="number"
                                    value={prodForm.quantity}
                                    onChange={(e) => setProdForm((p) => ({ ...p, quantity: e.target.value }))}
                                    placeholder="Quantity (e.g., 1, 250, 500)"
                                />
                            </div>
                            <div>
                                <SelectField
                                    value={prodForm.unit}
                                    onChange={(e) => setProdForm((p) => ({ ...p, unit: e.target.value }))}
                                    placeholder="Select unit"
                                    options={UNITS}
                                />
                            </div>
                        </div>
                        {prodErrors.type && <p className="text-red-400 text-xs mt-1.5 pl-1">{prodErrors.type}</p>}
                        
                        {/* Preview of combined type */}
                        {(prodForm.quantity || prodForm.unit) && (
                            <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-xs text-green-400">
                                    <span className="font-semibold">Preview:</span> Will be saved as "{combineQuantityAndUnit(prodForm.quantity, prodForm.unit)}"
                                </p>
                            </div>
                        )}

                        <UploadBox preview={prodForm.imagePreview} onChange={handleProdImage} />

                        <button
                            onClick={editingProduct ? updateProduct : submitProduct}
                            className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xs sm:text-sm transition-all hover:scale-[1.015] hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
                        >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                            {editingProduct ? "Update Product" : "Create Product"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ CATEGORIES TABLE ══ */}
            <div className="bg-[#0d1b13] rounded-[24px] sm:rounded-[28px] border border-green-500/10 p-4 sm:p-5 md:p-6 shadow-2xl mb-6">
                <SectionHeader icon={FolderTree} title="All Categories" count={categories.length} />

                {loading.categories ? (
                    <div className="py-10 flex justify-center">
                        <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <DataTable
                        columns={categoryColumns}
                        data={categories}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        itemsPerPage={10}
                    />
                )}
            </div>

            {/* ══ PRODUCTS TABLE ══ */}
            <div className="bg-[#0d1b13] rounded-[24px] sm:rounded-[28px] border border-green-500/10 p-4 sm:p-5 md:p-6 shadow-2xl">
                <SectionHeader icon={Package} title="All Products" count={products.length} />

                {loading.products ? (
                    <div className="py-10 flex justify-center">
                        <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <DataTable
                        columns={productColumns}
                        data={products}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        itemsPerPage={10}
                    />
                )}
            </div>
        </div>
    );
};

export default CreateProductAndCategory;