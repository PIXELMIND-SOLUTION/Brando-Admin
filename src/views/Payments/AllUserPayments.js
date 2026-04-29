import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
    Wallet, Eye, Trash2, CheckCircle, XCircle, Clock,
    RefreshCw, Filter, X, Search, SortAsc, SortDesc,
    Calendar, Building2, User, AlertCircle, DollarSign,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Sparkles, BadgeCheck, TrendingUp, Download, CreditCard,
    IndianRupee, Phone, Tag, Home
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

// ─── Pure helpers (module-level, never recreated) ─────────────────────────────
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

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// ─── Custom hooks ─────────────────────────────────────────────────────────────
const useDebouncedSearch = (initialValue = '', delay = 300) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);
    const timerRef = useRef(null);

    useEffect(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setDebouncedSearchTerm(searchTerm), delay);
        return () => clearTimeout(timerRef.current);
    }, [searchTerm, delay]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
    }, []);

    return { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch };
};

const usePagination = (items, initialItemsPerPage = 15) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    }, [items, currentPage, itemsPerPage]);

    const goToPage = useCallback((page) => {
        setCurrentPage(p => Math.max(1, Math.min(page, Math.ceil(items.length / itemsPerPage))));
    }, [items.length, itemsPerPage]);

    const changeItemsPerPage = useCallback((newSize) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    }, []);

    // Reset to page 1 whenever the filtered list changes length
    useEffect(() => { setCurrentPage(1); }, [items.length]);

    return { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage };
};

// ─── Stateless UI components (outside – stable references) ───────────────────

const Pagination = React.memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= maxVisible; i++) pages.push(i);
            pages.push('...'); pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1); pages.push('...');
            for (let i = totalPages - (maxVisible - 1); i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1); pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('...'); pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Show</span>
                <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-sm focus:border-emerald-500 outline-none">
                    {[10, 15, 20, 30, 50].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span>entries</span>
                <span className="ml-4">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(1)} disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronsLeft size={16} />
                </button>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={16} />
                </button>
                {pageNumbers.map((page, i) =>
                    page === '...' ? (
                        <span key={`e-${i}`} className="px-3 py-1 text-gray-400">...</span>
                    ) : (
                        <button key={page} onClick={() => onPageChange(page)}
                            className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${currentPage === page
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-black border border-white/20 text-white hover:bg-white/20'
                                }`}>
                            {page}
                        </button>
                    )
                )}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={16} />
                </button>
                <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
});

const SortIcon = ({ sortConfig, column }) => {
    if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
};

const StatusBadge = ({ status }) => {
    const config = {
        pending: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/10', label: 'Pending' },
        form_submitted: { icon: AlertCircle, color: 'text-purple-400 bg-purple-500/10', label: 'Form Submitted' },
        confirmed: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Confirmed' },
        completed: { icon: DollarSign, color: 'text-blue-400 bg-blue-500/10', label: 'Completed' },
        cancelled: { icon: XCircle, color: 'text-red-400 bg-red-500/10', label: 'Cancelled' }
    };
    const { icon: Icon, color, label } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
            <Icon size={12} /> {label}
        </span>
    );
};

const PageHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/5 rounded-3xl -z-10 blur-3xl" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10">
                        <Icon size={24} />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                        {title} <BadgeCheck size={20} className="text-emerald-400" />
                    </h1>
                    <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                        <TrendingUp size={14} /> {subtitle}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const StatsCard = ({ payments }) => {
    const totalRevenue = useMemo(() => payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0), [payments]);
    const totalAdvance = useMemo(() => payments.reduce((sum, p) => sum + (p.monthlyAdvance || 0), 0), [payments]);
    const pendingCount = useMemo(() => payments.filter(p => p.status === 'pending').length, [payments]);

    const stats = [
        { label: 'Total Payments', value: payments.length, icon: Wallet, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: IndianRupee, color: 'from-yellow-500 to-orange-500' },
        { label: 'Total Advance', value: formatCurrency(totalAdvance), icon: CreditCard, color: 'from-blue-500 to-indigo-500' },
        { label: 'Pending', value: pendingCount, icon: Clock, color: 'from-purple-500 to-pink-500' }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white group-hover:scale-110 transition-transform`}>
                            <stat.icon size={16} />
                        </div>
                        <Sparkles size={16} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

// SearchBar uses a local ref-controlled input to fully decouple from parent renders
const SearchBar = React.memo(({ onSearchChange, onClear }) => {
    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const [hasValue, setHasValue] = useState(false);

    const handleChange = useCallback((e) => {
        const val = e.target.value;
        setHasValue(val.length > 0);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onSearchChange(val), 300);
    }, [onSearchChange]);

    const handleClear = useCallback(() => {
        if (inputRef.current) inputRef.current.value = '';
        setHasValue(false);
        clearTimeout(timerRef.current);
        onClear();
    }, [onClear]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                ref={inputRef}
                type="text"
                defaultValue=""
                placeholder="Search by booking ref, hostel, mobile, room, share..."
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
          placeholder:text-gray-500 text-sm text-white"
            />
            {hasValue && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <X size={16} />
                </button>
            )}
        </div>
    );
});

const FilterBar = React.memo(({ filters, activeFilter, onFilterChange }) => {
    const getFilterIcon = (f) => {
        switch (f) {
            case 'pending': return <Clock size={14} />;
            case 'form_submitted': return <AlertCircle size={14} />;
            case 'confirmed': return <CheckCircle size={14} />;
            case 'completed': return <DollarSign size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Filter size={14} />;
        }
    };
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Filter size={16} className="text-emerald-400" />
                <span className="font-medium">Filter by Status:</span>
            </div>
            {filters.map(status => (
                <button key={status} onClick={() => onFilterChange(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2
            ${activeFilter === status
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    {getFilterIcon(status)}
                    {status === 'form_submitted' ? 'Form Submitted' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
            ))}
        </div>
    );
});

const ActionBar = React.memo(({ onSearchChange, onClear, selectedCount, onBulkDelete, loadingDelete, onExport, onRefresh, loadingFetch }) => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchBar onSearchChange={onSearchChange} onClear={onClear} />
        <div className="flex items-center gap-2 ml-auto">
            {selectedCount > 0 && (
                <button onClick={onBulkDelete} disabled={loadingDelete}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium text-sm hover:from-red-600 hover:to-rose-600 transition-all shadow-lg">
                    <Trash2 size={16} /> Delete ({selectedCount})
                </button>
            )}
            <button onClick={onExport} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Export to CSV">
                <Download size={18} />
            </button>
            <button onClick={onRefresh} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Refresh">
                <RefreshCw size={18} className={loadingFetch ? 'animate-spin' : ''} />
            </button>
        </div>
    </div>
));

const PaymentsTable = React.memo(({
    paginatedItems, selectedPayments, sortConfig, loadingDelete, totalItems,
    onToggleSelectAll, onToggleSelect, onSort, onView, onDelete
}) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-white/10 border-b border-white/10">
                        <th className="px-4 py-4 w-12">
                            <input type="checkbox"
                                checked={selectedPayments.length === paginatedItems.length && paginatedItems.length > 0}
                                onChange={onToggleSelectAll}
                                className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                            />
                        </th>
                        {[
                            { key: 'bookingReference', label: 'Booking Ref', icon: <Tag size={14} /> },
                            { key: 'hostelId', label: 'Hostel', icon: <Building2 size={14} /> },
                            { key: 'userId', label: 'User Mobile', icon: <Phone size={14} /> },
                            { key: 'roomType', label: 'Room/Share', icon: <Home size={14} /> },
                            { key: 'totalAmount', label: 'Amount', icon: <IndianRupee size={14} /> },
                            { key: 'status', label: 'Status', icon: <CheckCircle size={14} /> },
                            { key: 'createdAt', label: 'Booked On', icon: <Calendar size={14} /> },
                        ].map(col => (
                            <th key={col.key} className="px-4 py-4 text-left">
                                <button onClick={() => onSort(col.key)}
                                    className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                                    {col.icon} {col.label}
                                    <SortIcon sortConfig={sortConfig} column={col.key} />
                                </button>
                            </th>
                        ))}
                        <th className="px-4 py-4 text-right text-xs font-black text-emerald-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedItems.map((payment) => (
                        <tr key={payment._id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group">
                            <td className="px-4 py-4">
                                <input type="checkbox"
                                    checked={selectedPayments.includes(payment._id)}
                                    onChange={() => onToggleSelect(payment._id)}
                                    className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                                />
                            </td>
                            <td className="px-4 py-4">
                                <span className="font-mono text-sm font-semibold text-white">{payment.bookingReference || 'N/A'}</span>
                                <p className="text-xs text-gray-500">{payment.bookingType}</p>
                            </td>
                            <td className="px-4 py-4">
                                <p className="font-semibold text-white text-sm">{payment.hostelId?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{payment.hostelId?.address}</p>
                            </td>
                            <td className="px-4 py-4">
                                <p className="font-medium text-white text-sm">{payment.userId?.mobileNumber || 'Guest User'}</p>
                                {!payment.userId && <p className="text-xs text-gray-500">Guest Booking</p>}
                            </td>
                            <td className="px-4 py-4">
                                <p className="text-sm text-white">{payment.roomType || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{payment.shareType || 'N/A'}</p>
                            </td>
                            <td className="px-4 py-4">
                                <p className="font-semibold text-white">{formatCurrency(payment.totalAmount || 0)}</p>
                                {payment.monthlyAdvance > 0 && (
                                    <p className="text-xs text-gray-500">Advance: {formatCurrency(payment.monthlyAdvance)}</p>
                                )}
                            </td>
                            <td className="px-4 py-4"><StatusBadge status={payment.status} /></td>
                            <td className="px-4 py-4 text-sm text-gray-400">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(payment.createdAt).toLocaleDateString()}
                                    </div>
                                    {payment.startDate && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <Clock size={10} /> Start: {new Date(payment.startDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => onView(payment)}
                                        className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all"
                                        title="View details">
                                        <Eye size={14} />
                                    </button>
                                    <button onClick={() => onDelete(payment._id)} disabled={loadingDelete}
                                        className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg transition-all"
                                        title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="px-4 py-3 bg-white/10 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-gray-400">Showing {paginatedItems.length} of {totalItems} payments</span>
            <span className="text-gray-400">{selectedPayments.length} selected</span>
        </div>
    </div>
));

const PaymentModal = React.memo(({ payment, loadingDelete, onClose, onDelete }) => {
    if (!payment) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet size={20} className="text-emerald-400" /> Payment Details
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-all">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <StatusBadge status={payment.status} />
                        <p className="text-xs text-gray-500">ID: {payment._id.slice(-8)}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1">Booking Reference</p>
                        <p className="text-white font-mono text-lg">{payment.bookingReference}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><Building2 size={14} /> Hostel Information</p>
                        <p className="text-white font-medium">{payment.hostelId?.name}</p>
                        <p className="text-sm text-gray-400">{payment.hostelId?.address}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><User size={14} /> User Information</p>
                        <p className="text-white font-medium">{payment.userId?.mobileNumber || 'Guest User'}</p>
                        {!payment.userId && <p className="text-xs text-gray-500">Guest Booking (No registration)</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Room Type</p>
                            <p className="text-white font-medium">{payment.roomType}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Share Type</p>
                            <p className="text-white font-medium">{payment.shareType}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                            <p className="text-white font-bold text-lg">{formatCurrency(payment.totalAmount)}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Advance Paid</p>
                            <p className="text-white font-bold text-lg">{formatCurrency(payment.monthlyAdvance)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Booking Date</p>
                            <p className="text-white text-sm">{new Date(payment.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Start Date</p>
                            <p className="text-white text-sm">{payment.startDate ? new Date(payment.startDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                        <button onClick={() => onDelete(payment._id)} disabled={loadingDelete}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            <Trash2 size={18} /> Delete Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AllUserPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState({ fetch: false, delete: false });
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // debouncedSearchTerm drives filtering; setSearchTerm is passed to SearchBar via onSearchChange
    const { debouncedSearchTerm, setSearchTerm, clearSearch } = useDebouncedSearch('', 300);

    const filteredAndSortedPayments = useMemo(() => {
        let filtered = filterStatus === 'All' ? payments : payments.filter(p => p.status === filterStatus);
        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.bookingReference || '').toLowerCase().includes(term) ||
                (p.hostelId?.name || '').toLowerCase().includes(term) ||
                (p.userId?.mobileNumber || '').toString().includes(term) ||
                (p.roomType || '').toLowerCase().includes(term) ||
                (p.shareType || '').toLowerCase().includes(term)
            );
        }
        return filtered.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === 'hostelId') { aVal = a.hostelId?.name || ''; bVal = b.hostelId?.name || ''; }
            else if (sortConfig.key === 'userId') { aVal = a.userId?.mobileNumber || ''; bVal = b.userId?.mobileNumber || ''; }
            else if (sortConfig.key === 'totalAmount') { aVal = a.totalAmount || 0; bVal = b.totalAmount || 0; }
            else if (sortConfig.key === 'createdAt') { aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); }
            else if (sortConfig.key === 'startDate') { aVal = new Date(a.startDate).getTime(); bVal = new Date(b.startDate).getTime(); }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [payments, filterStatus, debouncedSearchTerm, sortConfig]);

    const { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage } =
        usePagination(filteredAndSortedPayments, 15);

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, fetch: true }));
            const { data } = await axios.get(`${API}/allpayments`);
            setPayments(data.payments || []);
        } catch (error) {
            console.error(error);
            showAlert('error', 'Oops...', 'Failed to fetch payments');
        } finally {
            setLoading(prev => ({ ...prev, fetch: false }));
        }
    }, []);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const handleDelete = useCallback(async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
            showCancelButton: true, background: '#0f172a', color: '#fff',
            customClass: {
                popup: 'rounded-2xl', title: 'text-lg font-bold',
                confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold',
                cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
            }
        });
        if (!result.isConfirmed) return;
        try {
            setLoading(prev => ({ ...prev, delete: true }));
            await axios.delete(`${API}/deletepayment/${id}`);
            showAlert('success', 'Deleted!', 'Payment has been deleted', 2000);
            fetchPayments();
            setSelectedPayments(prev => prev.filter(sid => sid !== id));
            setSelectedPayment(prev => { if (prev?._id === id) { setShowModal(false); return null; } return prev; });
        } catch (error) {
            console.error(error);
            showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete payment");
        } finally {
            setLoading(prev => ({ ...prev, delete: false }));
        }
    }, [fetchPayments]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedPayments.length === 0) { showAlert('warning', 'No selection', 'Please select payments to delete'); return; }
        const result = await Swal.fire({
            title: 'Delete Selected?', text: `You are about to delete ${selectedPayments.length} payment(s)`,
            icon: 'warning', showCancelButton: true, background: '#0f172a', color: '#fff',
            customClass: {
                popup: 'rounded-2xl', title: 'text-lg font-bold',
                confirmButton: 'bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-xl font-semibold',
                cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
            }
        });
        if (!result.isConfirmed) return;
        try {
            setLoading(prev => ({ ...prev, delete: true }));
            await Promise.all(selectedPayments.map(id => axios.delete(`${API}/deletepayment/${id}`)));
            showAlert('success', 'Deleted!', `${selectedPayments.length} payment(s) deleted`, 2000);
            fetchPayments();
            setSelectedPayments([]);
        } catch (error) {
            console.error(error);
            showAlert('error', 'Delete failed', 'Could not delete some payments');
        } finally {
            setLoading(prev => ({ ...prev, delete: false }));
        }
    }, [selectedPayments, fetchPayments]);

    const viewPayment = useCallback((payment) => { setSelectedPayment(payment); setShowModal(true); }, []);
    const closeModal = useCallback(() => setShowModal(false), []);

    const uniqueFilters = useMemo(() =>
        ['All', ...new Set(payments.map(p => p.status).filter(Boolean))],
        [payments]
    );

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedPayments(prev => prev.length === paginatedItems.length ? [] : paginatedItems.map(p => p._id));
    }, [paginatedItems]);

    const toggleSelect = useCallback((id) => {
        setSelectedPayments(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    }, []);

    const exportToCSV = useCallback(() => {
        const headers = ['Booking Ref', 'Hostel', 'User Mobile', 'Room Type', 'Share Type', 'Booking Type', 'Total Amount', 'Advance', 'Status', 'Booking Date', 'Start Date'];
        const csvData = filteredAndSortedPayments.map(p => [
            p.bookingReference || 'N/A', p.hostelId?.name || 'N/A', p.userId?.mobileNumber || 'Guest',
            p.roomType || 'N/A', p.shareType || 'N/A', p.bookingType || 'N/A',
            p.totalAmount || 0, p.monthlyAdvance || 0, p.status || 'N/A',
            new Date(p.createdAt).toLocaleString(),
            p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'
        ]);
        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }, [filteredAndSortedPayments]);

    const totalRevenue = useMemo(() => payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0), [payments]);
    const pageRevenue = useMemo(() => paginatedItems.reduce((sum, p) => sum + (p.totalAmount || 0), 0), [paginatedItems]);

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <PageHeader
                icon={Wallet}
                title="User Payments"
                subtitle={`${payments.length} total payments • ${formatCurrency(totalRevenue)} total revenue`}
            />

            <StatsCard payments={payments} />

            <ActionBar
                onSearchChange={setSearchTerm}
                onClear={clearSearch}
                selectedCount={selectedPayments.length}
                onBulkDelete={handleBulkDelete}
                loadingDelete={loading.delete}
                onExport={exportToCSV}
                onRefresh={fetchPayments}
                loadingFetch={loading.fetch}
            />

            <FilterBar
                filters={uniqueFilters}
                activeFilter={filterStatus}
                onFilterChange={setFilterStatus}
            />

            {loading.fetch ? (
                <div className="flex justify-center py-20">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Wallet size={20} className="text-emerald-400 animate-pulse" />
                        </div>
                    </div>
                </div>
            ) : paginatedItems.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <Wallet size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-white font-bold text-lg mb-2">No payments found</p>
                    <p className="text-sm text-gray-400">
                        {debouncedSearchTerm ? 'Try adjusting your search' : filterStatus !== 'All' ? 'Try a different filter' : ''}
                    </p>
                    {(debouncedSearchTerm || filterStatus !== 'All') && (
                        <button onClick={() => { clearSearch(); setFilterStatus('All'); }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <PaymentsTable
                        paginatedItems={paginatedItems}
                        selectedPayments={selectedPayments}
                        sortConfig={sortConfig}
                        loadingDelete={loading.delete}
                        totalItems={totalItems}
                        onToggleSelectAll={toggleSelectAll}
                        onToggleSelect={toggleSelect}
                        onSort={handleSort}
                        onView={viewPayment}
                        onDelete={handleDelete}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        onItemsPerPageChange={changeItemsPerPage}
                    />

                    <div className="mt-6 bg-white/10 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] flex items-center justify-center text-white font-bold text-lg border border-white/20">
                                {totalItems}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">
                                    {filterStatus === 'All' ? 'Total Payments' : `${filterStatus} Payments`}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {filterStatus === 'All' ? 'Across all statuses' : 'Filtered by status'}
                                    {debouncedSearchTerm && ` • Search: "${debouncedSearchTerm}"`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Page Revenue</p>
                                <p className="font-bold text-white">{formatCurrency(pageRevenue)}</p>
                            </div>
                            <Sparkles size={20} className="text-emerald-400" />
                        </div>
                    </div>
                </>
            )}

            {showModal && (
                <PaymentModal
                    payment={selectedPayment}
                    loadingDelete={loading.delete}
                    onClose={closeModal}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default AllUserPayments;