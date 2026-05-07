import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
    Building2, Eye, Trash2, Calendar, MapPin,
    Star, IndianRupee, Users, Image as ImageIcon,
    Filter, Sparkles, LayoutGrid, X, Table2,
    Grid3x3, Download, RefreshCw,
    SortAsc, SortDesc, Search, TrendingUp,
    BadgeCheck, Clock, Home, Tag, ChevronLeft,
    ChevronRight, ChevronsLeft, ChevronsRight, Heart
} from "lucide-react";

const API = "https://api.brando.org.in/api/Admin";

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

// ─── Pagination ─────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
    const getPageNumbers = () => {
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
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Show</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-sm focus:border-emerald-500 outline-none"
                >
                    {[10, 20, 30, 50].map(size => <option key={size} value={size}>{size}</option>)}
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
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) =>
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
                        ) : (
                            <button key={page} onClick={() => onPageChange(page)}
                                className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${currentPage === page
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                                    }`}>
                                {page}
                            </button>
                        )
                    )}
                </div>
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
};

// ─── SortIcon ───────────────────────────────────────────────────────
const SortIcon = ({ sortConfig, column }) => {
    if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
};

// ─── PageHeader ─────────────────────────────────────────────────────
const PageHeader = ({ icon: Icon, title, subtitle, count }) => (
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
                        {title} <Heart size={20} className="text-red-500 fill-red-500" />
                    </h1>
                    <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                        <TrendingUp size={14} /> {subtitle}
                    </p>
                </div>
            </div>
            {count > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl px-4 py-2 border border-emerald-500/20">
                    <Heart size={16} className="text-red-400 fill-red-400" />
                    <span className="text-white font-bold text-lg">{count}</span>
                    <span className="text-gray-400 text-sm">Recommended Hostels</span>
                </div>
            )}
        </div>
    </div>
);

// ─── StatsCard ─────────────────────────────────────────────────────
const StatsCard = ({ hostels }) => {
    const stats = [
        { label: 'Total Recommended', value: hostels.length, icon: Heart, color: 'from-red-500 to-red-600' },
        { label: 'Avg Rating', value: (hostels.reduce((acc, h) => acc + (h.rating || 0), 0) / hostels.length || 0).toFixed(1), icon: Star, color: 'from-yellow-500 to-orange-500' },
        { label: 'Total Images', value: hostels.reduce((acc, h) => acc + (h.images?.length || 0), 0), icon: ImageIcon, color: 'from-purple-500 to-pink-500' },
        { label: 'Categories', value: new Set(hostels.map(h => h.category?.name).filter(Boolean)).size, icon: Tag, color: 'from-blue-500 to-indigo-500' }
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

// ─── ViewToggle ─────────────────────────────────────────────────────
const ViewToggle = ({ viewMode, onViewChange }) => (
    <div className="flex items-center gap-2 p-1 bg-white/10 rounded-xl">
        <button onClick={() => onViewChange('grid')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white/20 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white'
                }`}>
            <Grid3x3 size={18} />
            <span className="text-sm font-medium hidden sm:inline">Grid</span>
        </button>
        <button onClick={() => onViewChange('table')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-white/20 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white'
                }`}>
            <Table2 size={18} />
            <span className="text-sm font-medium hidden sm:inline">Table</span>
        </button>
    </div>
);

// ─── SearchBar ─────────────────────────────────────────────────────
const SearchBar = ({ searchTerm, onSearchChange }) => (
    <div className="relative flex-1 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
            type="text"
            placeholder="Search recommended hostels by name, address, category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5
        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
        placeholder:text-gray-500 text-sm text-white"
        />
        {searchTerm && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={16} />
            </button>
        )}
    </div>
);

// ─── FilterBar ─────────────────────────────────────────────────────
const FilterBar = ({ categories, activeFilter, onFilterChange }) => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter size={16} className="text-emerald-400" />
            <span className="font-medium">Filter:</span>
        </div>
        {categories.map(cat => (
            <button key={cat} onClick={() => onFilterChange(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
          ${activeFilter === cat
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                {cat}
            </button>
        ))}
    </div>
);

// ─── ActionBar ─────────────────────────────────────────────────────
const ActionBar = ({ searchTerm, onSearchChange, onExport, onRefresh, loadingFetch, viewMode, onViewChange }) => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <div className="flex items-center gap-2 ml-auto">
            <button onClick={onExport} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Export to CSV">
                <Download size={18} />
            </button>
            <button onClick={onRefresh} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Refresh">
                <RefreshCw size={18} className={loadingFetch ? 'animate-spin' : ''} />
            </button>
            <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
        </div>
    </div>
);

// ─── TableView ─────────────────────────────────────────────────────
const TableView = ({ paginatedHostels, sortConfig, onSort, onView, setHostels, hostels }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-white/10 border-b border-white/10">
                        {[
                            { key: 'name', label: 'Hostel Name', icon: <Home size={14} /> },
                            { key: 'category', label: 'Category', icon: <Tag size={14} /> },
                            { key: 'rating', label: 'Rating', icon: <Star size={14} /> },
                            { key: 'address', label: 'Address', icon: <MapPin size={14} /> },
                            { key: 'monthlyAdvance', label: 'Advance', icon: <IndianRupee size={14} /> },
                            { key: 'rooms', label: 'Room Types', icon: <Building2 size={14} /> },
                            { key: 'recommended', label: 'Recommended', icon: <Heart size={14} /> },
                            { key: 'createdAt', label: 'Created', icon: <Calendar size={14} /> }
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
                    {paginatedHostels.map((hostel) => (
                        <tr key={hostel._id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group">
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                                        {hostel.images?.[0]
                                            ? <img src={hostel.images[0]} alt="" className="w-full h-full object-cover" />
                                            : <Building2 size={14} className="text-emerald-400" />}
                                    </div>
                                    <span className="font-semibold text-white">{hostel.name}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    {hostel.category?.image && (
                                        <img src={hostel.category.image} alt="" className="w-5 h-5 rounded object-cover" />
                                    )}
                                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-semibold text-emerald-400">
                                        {hostel.category?.name || 'N/A'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-1">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium text-white">{hostel.rating}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 max-w-xs">
                                <p className="text-sm text-gray-400 truncate">{hostel.address}</p>
                            </td>
                            <td className="px-4 py-4 font-semibold text-white">{formatCurrency(hostel.monthlyAdvance)}</td>
                            <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {hostel.type?.map((type, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-gray-300">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const updatedValue = !hostel.isRecommended;
                                                const res = await fetch(
                                                    `https://api.brando.org.in/api/Admin/makeRecommended/${hostel._id}`,
                                                    {
                                                        method: "PUT",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            isRecommended: updatedValue,
                                                        }),
                                                    }
                                                );
                                                const data = await res.json();
                                                if (res.ok) {
                                                    setHostels((prev) =>
                                                        prev.map((item) =>
                                                            item._id === hostel._id
                                                                ? {
                                                                    ...item,
                                                                    isRecommended: updatedValue,
                                                                }
                                                                : item
                                                        )
                                                    );
                                                    showAlert('success', 'Updated!', `Hostel ${updatedValue ? 'added to' : 'removed from'} recommendations`, 2000);
                                                } else {
                                                    alert(data.message || "Failed to update recommendation");
                                                }
                                            } catch (error) {
                                                console.error(error);
                                                alert("Something went wrong");
                                            }
                                        }}
                                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 shadow-inner
                      ${hostel.isRecommended
                                                ? "bg-gradient-to-r from-red-500 to-rose-500"
                                                : "bg-gray-600"
                                            }
                    `}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300
                        ${hostel.isRecommended
                                                    ? "translate-x-8"
                                                    : "translate-x-1"
                                                }
                      `}
                                        />
                                        <span
                                            className={`absolute text-[10px] font-semibold tracking-wide uppercase transition-all duration-300
                        ${hostel.isRecommended
                                                    ? "left-2 text-white"
                                                    : "right-2 text-white"
                                                }
                      `}
                                        >
                                            {hostel.isRecommended ? "ON" : "OFF"}
                                        </span>
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(hostel.createdAt).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => onView(hostel._id)}
                                        className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all"
                                        title="View details">
                                        <Eye size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="px-4 py-3 bg-white/10 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-gray-400">Showing {paginatedHostels.length} recommended hostels</span>
            <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-400 fill-red-400" />
                <span className="text-gray-400">Premium Listings</span>
            </div>
        </div>
    </div>
);

// ─── GridView ─────────────────────────────────────────────────────
const GridView = ({ paginatedHostels, onView, setHostels, hostels }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {paginatedHostels.map(hostel => (
            <div key={hostel._id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:shadow-xl transition-all group relative">
                <div className="absolute top-2 left-2 z-10">
                    <div className={`text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${hostel.isRecommended ? 'bg-red-500' : 'bg-gray-600'
                        }`}>
                        <Heart size={10} className={hostel.isRecommended ? "fill-white" : ""} />
                        {hostel.isRecommended ? 'Recommended' : 'Not Recommended'}
                    </div>
                </div>
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={async () => {
                            try {
                                const updatedValue = !hostel.isRecommended;
                                const res = await fetch(
                                    `https://api.brando.org.in/api/Admin/makeRecommended/${hostel._id}`,
                                    {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            isRecommended: updatedValue,
                                        }),
                                    }
                                );
                                const data = await res.json();
                                if (res.ok) {
                                    setHostels((prev) =>
                                        prev.map((item) =>
                                            item._id === hostel._id
                                                ? {
                                                    ...item,
                                                    isRecommended: updatedValue,
                                                }
                                                : item
                                        )
                                    );
                                    showAlert('success', 'Updated!', `Hostel ${updatedValue ? 'added to' : 'removed from'} recommendations`, 2000);
                                } else {
                                    alert(data.message || "Failed to update recommendation");
                                }
                            } catch (error) {
                                console.error(error);
                                alert("Something went wrong");
                            }
                        }}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 shadow-inner
              ${hostel.isRecommended
                                ? "bg-gradient-to-r from-red-500 to-rose-500"
                                : "bg-gray-600"
                            }
            `}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300
                ${hostel.isRecommended
                                    ? "translate-x-7"
                                    : "translate-x-1"
                                }
              `}
                        />
                        <span
                            className={`absolute text-[8px] font-semibold tracking-wide uppercase transition-all duration-300
                ${hostel.isRecommended
                                    ? "left-1.5 text-white"
                                    : "right-1.5 text-white"
                                }
              `}
                        >
                            {hostel.isRecommended ? "ON" : "OFF"}
                        </span>
                    </button>
                </div>
                <div className="relative h-40 sm:h-48 bg-white/5 mt-2">
                    <img src={hostel.images?.[0]} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                        <button onClick={() => onView(hostel._id)}
                            className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80">
                            <Eye size={14} />
                        </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star size={12} className="text-yellow-400" /> {hostel.rating}
                    </div>
                    <div className="absolute top-2 left-24 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                        <ImageIcon size={10} /> {hostel.images?.length || 0}
                    </div>
                </div>
                <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white line-clamp-1">{hostel.name}</h3>
                        <div className="flex items-center gap-1">
                            {hostel.category?.image && (
                                <img src={hostel.category.image} alt="" className="w-4 h-4 rounded object-cover" />
                            )}
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-emerald-400 font-semibold whitespace-nowrap">
                                {hostel.category?.name || 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-emerald-400 flex-shrink-0" />
                            <span className="line-clamp-1">{hostel.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <IndianRupee size={12} className="text-emerald-400 flex-shrink-0" />
                            <span>Advance: {formatCurrency(hostel.monthlyAdvance)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-emerald-400 flex-shrink-0" />
                            <span>{hostel.type?.join(', ')}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar size={10} />
                            {new Date(hostel.createdAt).toLocaleDateString()}
                        </div>
                        <button onClick={() => onView(hostel._id)} className="text-emerald-400 hover:text-emerald-300 font-semibold">
                            View Details →
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// ─── Main Component ─────────────────────────────────────────────────
const RecommendedHostels = () => {
    const navigate = useNavigate();
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('All');
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    const fetchRecommendedHostels = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API}/recomemdedhostels`);
            setHostels(data.hostels || []);
        } catch (error) {
            console.error(error);
            showAlert('error', 'Oops...', 'Failed to fetch recommended hostels');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecommendedHostels(); }, [fetchRecommendedHostels]);
    useEffect(() => { setCurrentPage(1); }, [filter, searchTerm, sortConfig]);

    const viewHostel = useCallback((id) => navigate(`/dashboard/hostels/${id}`), [navigate]);

    const getUniqueCategories = useCallback(() =>
        ['All', ...new Set(hostels.map(h => h.category?.name).filter(Boolean))],
        [hostels]
    );

    const filteredAndSortedHostels = useCallback(() => {
        let filtered = filter === 'All' ? hostels : hostels.filter(h => h.category?.name === filter);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(h =>
                h.name.toLowerCase().includes(term) ||
                h.address.toLowerCase().includes(term) ||
                (h.category?.name || '').toLowerCase().includes(term)
            );
        }
        return filtered.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === 'category') { aVal = a.category?.name || ''; bVal = b.category?.name || ''; }
            else if (sortConfig.key === 'monthlyAdvance') { aVal = a.monthlyAdvance || 0; bVal = b.monthlyAdvance || 0; }
            else if (sortConfig.key === 'createdAt') { aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); }
            else if (sortConfig.key === 'rooms') { aVal = a.type?.length || 0; bVal = b.type?.length || 0; }
            else if (sortConfig.key === 'recommended') { aVal = a.isRecommended ? 1 : 0; bVal = b.isRecommended ? 1 : 0; }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [hostels, filter, searchTerm, sortConfig]);

    const getPaginatedData = () => {
        const filtered = filteredAndSortedHostels();
        const start = (currentPage - 1) * itemsPerPage;
        return {
            data: filtered.slice(start, start + itemsPerPage),
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / itemsPerPage)
        };
    };

    const { data: paginatedHostels, totalItems, totalPages } = getPaginatedData();

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    }, []);

    const exportToCSV = useCallback(() => {
        const data = filteredAndSortedHostels();
        const headers = ['Name', 'Category', 'Rating', 'Address', 'Advance', 'Room Types', 'Recommended', 'Features', 'Furnishing', 'Created'];
        const csvData = data.map(h => [
            h.name, h.category?.name || 'N/A', h.rating, h.address,
            h.monthlyAdvance, h.type?.join(', ') || 'N/A',
            h.isRecommended ? 'Yes' : 'No',
            h.features?.join(', ') || 'N/A', h.furnishing || 'N/A',
            new Date(h.createdAt).toLocaleDateString()
        ]);
        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recommended_hostels_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }, [filteredAndSortedHostels]);

    const categories = getUniqueCategories();

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <PageHeader
                icon={Heart}
                title="Recommended Hostels"
                subtitle="Premium properties handpicked for you"
                count={hostels.length}
            />

            <StatsCard hostels={hostels} />

            <ActionBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onExport={exportToCSV}
                onRefresh={fetchRecommendedHostels}
                loadingFetch={loading}
                viewMode={viewMode}
                onViewChange={setViewMode}
            />

            <FilterBar
                categories={categories}
                activeFilter={filter}
                onFilterChange={setFilter}
            />

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Heart size={20} className="text-red-400 animate-pulse" />
                        </div>
                    </div>
                </div>
            ) : paginatedHostels.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <Heart size={32} className="text-red-400" />
                    </div>
                    <p className="text-white font-bold text-lg mb-2">No recommended hostels found</p>
                    <p className="text-sm text-gray-400">
                        {searchTerm ? 'Try adjusting your search' : filter !== 'All' ? 'Try a different category' : 'No hostels have been marked as recommended yet'}
                    </p>
                    {(searchTerm || filter !== 'All') && (
                        <button onClick={() => { setSearchTerm(''); setFilter('All'); }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <GridView
                            paginatedHostels={paginatedHostels}
                            onView={viewHostel}
                            setHostels={setHostels}
                            hostels={hostels}
                        />
                    ) : (
                        <TableView
                            paginatedHostels={paginatedHostels}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onView={viewHostel}
                            setHostels={setHostels}
                            hostels={hostels}
                        />
                    )}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        onItemsPerPageChange={(newSize) => { setItemsPerPage(newSize); setCurrentPage(1); }}
                    />

                    <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-red-500/10 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {totalItems}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">
                                    {filter === 'All' ? 'Total Recommended' : `${filter} Recommended`}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {filter === 'All' ? 'Premium handpicked properties' : 'Filtered by category'}
                                    {searchTerm && ` • Search: "${searchTerm}"`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Avg. Rating</p>
                                <p className="font-bold text-white">
                                    {(paginatedHostels.reduce((acc, h) => acc + (h.rating || 0), 0) / paginatedHostels.length || 0).toFixed(1)}
                                </p>
                            </div>
                            <Heart size={20} className="text-red-400 fill-red-400 animate-pulse" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecommendedHostels;