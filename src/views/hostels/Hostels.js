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
  ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/Admin";

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

// ─── Pagination (outside – stable) ───────────────────────────────────────────
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
                className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${
                  currentPage === page
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

// ─── SortIcon (outside) ───────────────────────────────────────────────────────
const SortIcon = ({ sortConfig, column }) => {
  if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
  return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
};

// ─── PageHeader (outside) ────────────────────────────────────────────────────
const PageHeader = ({ icon: Icon, title, subtitle, actions }) => (
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
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  </div>
);

// ─── StatsCard (outside) ─────────────────────────────────────────────────────
const StatsCard = ({ hostels, uniqueCategoriesCount }) => {
  const stats = [
    { label: 'Total Hostels', value: hostels.length, icon: Building2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Categories', value: uniqueCategoriesCount, icon: Tag, color: 'from-blue-500 to-indigo-500' },
    { label: 'Total Images', value: hostels.reduce((acc, h) => acc + (h.images?.length || 0), 0), icon: ImageIcon, color: 'from-purple-500 to-pink-500' },
    { label: 'Avg Rating', value: (hostels.reduce((acc, h) => acc + (h.rating || 0), 0) / hostels.length || 0).toFixed(1), icon: Star, color: 'from-yellow-500 to-orange-500' }
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

// ─── ViewToggle (outside) ────────────────────────────────────────────────────
const ViewToggle = ({ viewMode, onViewChange }) => (
  <div className="flex items-center gap-2 p-1 bg-white/10 rounded-xl">
    <button onClick={() => onViewChange('grid')}
      className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
        viewMode === 'grid' ? 'bg-white/20 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white'
      }`}>
      <Grid3x3 size={18} />
      <span className="text-sm font-medium hidden sm:inline">Grid</span>
    </button>
    <button onClick={() => onViewChange('table')}
      className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
        viewMode === 'table' ? 'bg-white/20 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white'
      }`}>
      <Table2 size={18} />
      <span className="text-sm font-medium hidden sm:inline">Table</span>
    </button>
  </div>
);

// ─── SearchBar (outside) ─────────────────────────────────────────────────────
const SearchBar = ({ searchTerm, onSearchChange }) => (
  <div className="relative flex-1 max-w-md">
    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search hostels by name, address, category..."
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

// ─── FilterBar (outside) ─────────────────────────────────────────────────────
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

// ─── ActionBar (outside) ─────────────────────────────────────────────────────
const ActionBar = ({ searchTerm, onSearchChange, selectedCount, onBulkDelete, onExport, onRefresh, loadingFetch, viewMode, onViewChange }) => (
  <div className="flex flex-wrap items-center gap-3 mb-6">
    <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
    <div className="flex items-center gap-2 ml-auto">
      {selectedCount > 0 && (
        <button onClick={onBulkDelete}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all shadow-lg">
          <Trash2 size={16} /> Delete ({selectedCount})
        </button>
      )}
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

// ─── TableView (outside) ─────────────────────────────────────────────────────
const TableView = ({ paginatedHostels, selectedHostels, sortConfig, loadingDelete, totalItems, onToggleSelectAll, onToggleSelect, onSort, onView, onDelete }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-white/10 border-b border-white/10">
            <th className="px-4 py-4 w-12">
              <input type="checkbox"
                checked={selectedHostels.length === paginatedHostels.length && paginatedHostels.length > 0}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
              />
            </th>
            {[
              { key: 'name', label: 'Hostel Name', icon: <Home size={14} /> },
              { key: 'categoryId', label: 'Category', icon: <Tag size={14} /> },
              { key: 'rating', label: 'Rating', icon: <Star size={14} /> },
              { key: 'address', label: 'Address', icon: <MapPin size={14} /> },
              { key: 'price', label: 'Advance', icon: <IndianRupee size={14} /> },
              { key: 'sharings', label: 'Sharing', icon: <Users size={14} /> },
              { key: 'createdAt', label: 'Created', icon: <Calendar size={14} /> },
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
                <input type="checkbox"
                  checked={selectedHostels.includes(hostel._id)}
                  onChange={() => onToggleSelect(hostel._id)}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </td>
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
                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-semibold text-emerald-400">
                  {hostel.categoryId?.name || 'N/A'}
                </span>
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
                <div className="flex items-center gap-1 text-gray-400">
                  <Users size={12} />
                  <span>{hostel.sharings?.length || 0}</span>
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
                  <button onClick={() => onDelete(hostel._id)} disabled={loadingDelete}
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
      <span className="text-gray-400">Showing {paginatedHostels.length} of {totalItems} hostels</span>
      <span className="text-gray-400">{selectedHostels.length} selected</span>
    </div>
  </div>
);

// ─── GridView (outside) ──────────────────────────────────────────────────────
const GridView = ({ paginatedHostels, selectedHostels, loadingDelete, onToggleSelect, onView, onDelete }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {paginatedHostels.map(hostel => (
      <div key={hostel._id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:shadow-xl transition-all group relative">
        <div className="absolute top-2 left-2 z-10">
          <input type="checkbox"
            checked={selectedHostels.includes(hostel._id)}
            onChange={() => onToggleSelect(hostel._id)}
            className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div className="relative h-40 sm:h-48 bg-white/5">
          <img src={hostel.images?.[0]} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button onClick={() => onView(hostel._id)}
              className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80">
              <Eye size={14} />
            </button>
            <button onClick={() => onDelete(hostel._id)} disabled={loadingDelete}
              className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-black/80">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="absolute top-2 left-8 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
            <Star size={12} className="text-yellow-400" /> {hostel.rating}
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
            <ImageIcon size={10} /> {hostel.images?.length || 0}
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-white line-clamp-1">{hostel.name}</h3>
            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-emerald-400 font-semibold whitespace-nowrap">
              {hostel.categoryId?.name || 'N/A'}
            </span>
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
              <Users size={12} className="text-emerald-400 flex-shrink-0" />
              <span>{hostel.sharings?.length} sharing options</span>
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

// ─── Main Component ───────────────────────────────────────────────────────────
const Hostels = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedHostels, setSelectedHostels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const fetchHostels = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/hostels`);
      setHostels(data.hostels || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch hostels');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => { fetchHostels(); }, [fetchHostels]);

  useEffect(() => { setCurrentPage(1); }, [filter, searchTerm, sortConfig]);

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
      await axios.delete(`${API}/deleteHostel/${id}`);
      showAlert('success', 'Deleted!', 'Hostel has been deleted', 2000);
      fetchHostels();
      setSelectedHostels(prev => prev.filter(sid => sid !== id));
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete hostel");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [fetchHostels]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedHostels.length === 0) { showAlert('warning', 'No selection', 'Please select hostels to delete'); return; }
    const result = await Swal.fire({
      title: 'Delete Selected?', text: `You are about to delete ${selectedHostels.length} hostels`,
      icon: 'warning', showCancelButton: true, background: '#0f172a', color: '#fff',
      customClass: {
        popup: 'rounded-2xl', title: 'text-lg font-bold',
        confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
      }
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      for (const id of selectedHostels) await axios.delete(`${API}/deleteHostel/${id}`);
      showAlert('success', 'Deleted!', `${selectedHostels.length} hostels deleted`, 2000);
      fetchHostels();
      setSelectedHostels([]);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', 'Could not delete some hostels');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [selectedHostels, fetchHostels]);

  const viewHostel = useCallback((id) => navigate(`/dashboard/hostels/${id}`), [navigate]);

  const getUniqueCategories = useCallback(() =>
    ['All', ...new Set(hostels.map(h => h.categoryId?.name).filter(Boolean))],
    [hostels]
  );

  const filteredAndSortedHostels = useCallback(() => {
    let filtered = filter === 'All' ? hostels : hostels.filter(h => h.categoryId?.name === filter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(term) ||
        h.address.toLowerCase().includes(term) ||
        (h.categoryId?.name || '').toLowerCase().includes(term)
      );
    }
    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'categoryId') { aVal = a.categoryId?.name || ''; bVal = b.categoryId?.name || ''; }
      else if (sortConfig.key === 'price') { aVal = a.monthlyAdvance || 0; bVal = b.monthlyAdvance || 0; }
      else if (sortConfig.key === 'sharings') { aVal = a.sharings?.length || 0; bVal = b.sharings?.length || 0; }
      else if (sortConfig.key === 'createdAt') { aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); }
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

  const toggleSelectAll = useCallback(() => {
    setSelectedHostels(prev =>
      prev.length === paginatedHostels.length ? [] : paginatedHostels.map(h => h._id)
    );
  }, [paginatedHostels]);

  const toggleSelect = useCallback((id) => {
    setSelectedHostels(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  }, []);

  const exportToCSV = useCallback(() => {
    const data = filteredAndSortedHostels();
    const headers = ['Name', 'Category', 'Rating', 'Address', 'Advance', 'Sharing Options', 'Images', 'Created'];
    const csvData = data.map(h => [
      h.name, h.categoryId?.name || 'N/A', h.rating, h.address,
      h.monthlyAdvance, h.sharings?.length || 0, h.images?.length || 0,
      new Date(h.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostels_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [filteredAndSortedHostels]);

  const categories = getUniqueCategories();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <PageHeader
        icon={LayoutGrid}
        title="Hostel Management"
        subtitle={`${hostels.length} properties • ${categories.length - 1} categories`}
      />

      <StatsCard hostels={hostels} uniqueCategoriesCount={categories.length - 1} />

      <ActionBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCount={selectedHostels.length}
        onBulkDelete={handleBulkDelete}
        onExport={exportToCSV}
        onRefresh={fetchHostels}
        loadingFetch={loading.fetch}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      <FilterBar
        categories={categories}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedHostels.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Building2 size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No hostels found</p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try adjusting your search' : filter !== 'All' ? 'Try a different category' : ''}
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
              selectedHostels={selectedHostels}
              loadingDelete={loading.delete}
              onToggleSelect={toggleSelect}
              onView={viewHostel}
              onDelete={handleDelete}
            />
          ) : (
            <TableView
              paginatedHostels={paginatedHostels}
              selectedHostels={selectedHostels}
              sortConfig={sortConfig}
              loadingDelete={loading.delete}
              totalItems={totalItems}
              onToggleSelectAll={toggleSelectAll}
              onToggleSelect={toggleSelect}
              onSort={handleSort}
              onView={viewHostel}
              onDelete={handleDelete}
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

          <div className="mt-6 bg-white/10 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] flex items-center justify-center text-white font-bold text-lg border border-white/20">
                {totalItems}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {filter === 'All' ? 'Total Hostels' : `${filter} Hostels`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'All' ? 'Across all categories' : 'Filtered by category'}
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
              <Sparkles size={20} className="text-emerald-400" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Hostels;