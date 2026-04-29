import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Eye, Trash2, Building2,
  Sparkles, Filter, X, Table2, CreditCard,
  Download, RefreshCw, CheckCircle, XCircle,
  SortAsc, SortDesc, Search, TrendingUp,
  BadgeCheck, Clock, Home, Tag, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle,
  IndianRupee, User
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

// ─── SweetAlert helper ────────────────────────────────────────────────────────
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

// ─── Custom hooks ─────────────────────────────────────────────────────────────
const useDebouncedSearch = (initialValue = '', delay = 300) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearchTerm(searchTerm), delay);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchTerm, delay]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  return { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch };
};

const useFilterAndSortBookings = (bookings, filterStatus, searchTerm, sortConfig) => {
  return useMemo(() => {
    if (!bookings.length) return [];

    let filtered = filterStatus === 'All'
      ? bookings
      : bookings.filter(b => b.status === filterStatus);

    if (searchTerm) {
      filtered = filtered.filter(b =>
        (b.bookingReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.hostelId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.vendorId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'hostelId') { aVal = a.hostelId?.name || ''; bVal = b.hostelId?.name || ''; }
      else if (sortConfig.key === 'userId') { aVal = a.userId?.name || ''; bVal = b.userId?.name || ''; }
      else if (sortConfig.key === 'totalAmount') { aVal = a.totalAmount || 0; bVal = b.totalAmount || 0; }
      else if (sortConfig.key === 'createdAt') { aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); }
      else if (sortConfig.key === 'startDate') { aVal = new Date(a.startDate).getTime(); bVal = new Date(b.startDate).getTime(); }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bookings, filterStatus, searchTerm, sortConfig]);
};

const usePagination = (items, initialItemsPerPage = 15) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const changeItemsPerPage = useCallback((newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [items.length]);

  return { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage };
};

// ─── ALL sub-components defined outside AllBookings ───────────────────────────

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
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
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-sm focus:border-emerald-500 outline-none"
        >
          {[10, 15, 20, 30, 50].map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        <span>entries</span>
        <span className="ml-4">
          Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
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
          {pageNumbers.map((page, index) =>
            page === '...'
              ? <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
              : <button key={page} onClick={() => onPageChange(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}`}>
                  {page}
                </button>
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

const SortIcon = ({ sortConfig, column }) => {
  if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
  return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
};

const ViewToggle = ({ viewMode, setViewMode }) => (
  <div className="flex items-center gap-2 p-1 bg-white/10 rounded-xl">
    <button
      onClick={() => setViewMode('table')}
      className={`p-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'table'
        ? 'bg-white/20 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white'}`}
    >
      <Table2 size={18} />
      <span className="text-sm font-medium hidden sm:inline">Table</span>
    </button>
  </div>
);

const SearchBar = ({ searchTerm, setSearchTerm, clearSearch }) => (
  <div className="relative flex-1 max-w-md">
    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search by booking ref, hostel, customer, vendor..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5
        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
        placeholder:text-gray-500 text-sm text-white"
    />
    {searchTerm && (
      <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
        <X size={16} />
      </button>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    confirmed:      { icon: CheckCircle, color: 'text-green-400 bg-green-500/10',    label: 'Confirmed' },
    pending:        { icon: Clock,        color: 'text-yellow-400 bg-yellow-500/10', label: 'Pending' },
    completed:      { icon: CreditCard,   color: 'text-blue-400 bg-blue-500/10',     label: 'Completed' },
    cancelled:      { icon: XCircle,      color: 'text-red-400 bg-red-500/10',       label: 'Cancelled' },
    form_submitted: { icon: AlertCircle,  color: 'text-purple-400 bg-purple-500/10', label: 'Form Submitted' }
  };
  const { icon: Icon, color, label } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
      <Icon size={12} />{label}
    </span>
  );
};

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
            {title}<BadgeCheck size={20} className="text-emerald-400" />
          </h1>
          <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
            <TrendingUp size={14} />{subtitle}
          </p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  </div>
);

const StatsCard = ({ bookings }) => {
  const stats = useMemo(() => [
    { label: 'Total Bookings', value: bookings.length,                                       icon: Calendar,    color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending',        value: bookings.filter(b => b.status === 'pending').length,   icon: Clock,       color: 'from-yellow-500 to-orange-500' },
    { label: 'Confirmed',      value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Completed',      value: bookings.filter(b => b.status === 'completed').length, icon: CreditCard,  color: 'from-blue-500 to-indigo-500' }
  ], [bookings]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4
          shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-xl transition-all group">
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

const FilterBar = ({ filterStatus, setFilterStatus, getUniqueFilters }) => {
  const filters = getUniqueFilters();

  const getFilterIcon = (filter) => {
    switch (filter) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'pending':   return <Clock size={14} />;
      case 'completed': return <CreditCard size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default:          return <Filter size={14} />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Filter size={16} className="text-emerald-400" />
        <span className="font-medium">Filter by Status:</span>
      </div>
      {filters.map(status => (
        <button
          key={status}
          onClick={() => setFilterStatus(status)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2
            ${filterStatus === status
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
        >
          {getFilterIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
};

const ActionBar = ({
  searchTerm, setSearchTerm, clearSearch,
  selectedBookings, handleBulkDelete, loadingDelete,
  exportToCSV, fetchBookings, loadingFetch,
  viewMode, setViewMode
}) => (
  <div className="flex flex-wrap items-center gap-3 mb-6">
    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} clearSearch={clearSearch} />
    <div className="flex items-center gap-2 ml-auto">
      {selectedBookings.length > 0 && (
        <button
          onClick={handleBulkDelete}
          disabled={loadingDelete}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500
            text-white font-medium text-sm hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
        >
          <Trash2 size={16} />
          Delete ({selectedBookings.length})
        </button>
      )}
      <button onClick={exportToCSV}
        className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Export to CSV">
        <Download size={18} />
      </button>
      <button onClick={fetchBookings}
        className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Refresh">
        <RefreshCw size={18} className={loadingFetch ? 'animate-spin' : ''} />
      </button>
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  </div>
);

const TableView = ({
  paginatedItems, selectedBookings, toggleSelectAll, toggleSelect,
  handleSort, sortConfig, viewBooking, handleDelete, loadingDelete, totalItems
}) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-white/10 border-b border-white/10">
            <th className="px-4 py-4 w-12">
              <input
                type="checkbox"
                checked={selectedBookings.length === paginatedItems.length && paginatedItems.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
              />
            </th>
            {[
              { key: 'bookingReference', label: 'Booking Ref', icon: <Tag size={14} /> },
              { key: 'hostelId',         label: 'Hostel',      icon: <Building2 size={14} /> },
              { key: 'userId',           label: 'Customer',    icon: <User size={14} /> },
              { key: 'roomType',         label: 'Room',        icon: <Home size={14} /> },
              { key: 'totalAmount',      label: 'Amount',      icon: <IndianRupee size={14} /> },
              { key: 'status',           label: 'Status',      icon: <CheckCircle size={14} /> },
              { key: 'createdAt',        label: 'Booked On',   icon: <Calendar size={14} /> },
            ].map(({ key, label, icon }) => (
              <th key={key} className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort(key)}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  {icon}{label}<SortIcon sortConfig={sortConfig} column={key} />
                </button>
              </th>
            ))}
            <th className="px-4 py-4 text-right text-xs font-black text-emerald-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((booking) => (
            <tr key={booking._id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group">
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedBookings.includes(booking._id)}
                  onChange={() => toggleSelect(booking._id)}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </td>
              <td className="px-4 py-4">
                <span className="font-mono text-sm font-semibold text-white">{booking.bookingReference || 'N/A'}</span>
                <p className="text-xs text-gray-500">{booking.bookingType}</p>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                    {booking.hostelId?.images?.[0]
                      ? <img src={`http://187.127.146.52:2003/${booking.hostelId.images[0]}`} alt="" className="w-full h-full object-cover" />
                      : <Building2 size={14} className="text-emerald-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{booking.hostelId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{booking.hostelId?.address}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <p className="font-medium text-white text-sm">{booking.userId?.name || 'Guest User'}</p>
                {booking.vendorId && <p className="text-xs text-gray-500">Vendor: {booking.vendorId.name}</p>}
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white">{booking.roomType || 'N/A'}</p>
                <p className="text-xs text-gray-500">{booking.shareType || 'N/A'}</p>
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-white">₹{booking.totalAmount?.toLocaleString() || 0}</p>
                {booking.monthlyAdvance > 0 && <p className="text-xs text-gray-500">Advance: ₹{booking.monthlyAdvance}</p>}
              </td>
              <td className="px-4 py-4"><StatusBadge status={booking.status} /></td>
              <td className="px-4 py-4 text-sm text-gray-400">
                <div className="flex items-center gap-1"><Calendar size={12} />{new Date(booking.createdAt).toLocaleDateString()}</div>
                {booking.startDate && (
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <Clock size={10} />Start: {new Date(booking.startDate).toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => viewBooking(booking._id)}
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all"
                    title="View details">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => handleDelete(booking._id)} disabled={loadingDelete}
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
      <span className="text-gray-400">Showing {paginatedItems.length} of {totalItems} bookings</span>
      <span className="text-gray-400">{selectedBookings.length} selected</span>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AllBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedBookings, setSelectedBookings] = useState([]);

  const { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch } = useDebouncedSearch('', 300);

  const filteredAndSortedBookings = useFilterAndSortBookings(bookings, filterStatus, debouncedSearchTerm, sortConfig);

  const { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage }
    = usePagination(filteredAndSortedBookings, 15);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/getallbookings`);
      setBookings(data.data || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch bookings');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

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
      await axios.delete(`${API}/deletebooking/${id}`);
      showAlert('success', 'Deleted!', 'Booking has been deleted', 2000);
      fetchBookings();
      setSelectedBookings(prev => prev.filter(sid => sid !== id));
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete booking");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [fetchBookings]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedBookings.length === 0) { showAlert('warning', 'No selection', 'Please select bookings to delete'); return; }
    const result = await Swal.fire({
      title: 'Delete Selected Bookings?',
      text: `You are about to delete ${selectedBookings.length} booking(s). This action cannot be undone!`,
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
      await Promise.all(selectedBookings.map(id => axios.delete(`${API}/deletebooking/${id}`)));
      showAlert('success', 'Deleted!', `${selectedBookings.length} booking(s) have been deleted`, 2000);
      fetchBookings();
      setSelectedBookings([]);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', 'Could not delete some bookings. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [selectedBookings, fetchBookings]);

  const viewBooking = useCallback((id) => navigate(`/dashboard/bookings/${id}`), [navigate]);

  const getUniqueFilters = useCallback(() =>
    ['All', ...new Set(bookings.map(b => b.status).filter(Boolean))],
  [bookings]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedBookings(
      selectedBookings.length === paginatedItems.length ? [] : paginatedItems.map(b => b._id)
    );
  }, [selectedBookings.length, paginatedItems]);

  const toggleSelect = useCallback((id) => {
    setSelectedBookings(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ['Booking Ref','Hostel','Customer','Vendor','Room Type','Share Type','Booking Type','Total Amount','Status','Booking Date','Start Date'];
    const csvData = filteredAndSortedBookings.map(b => [
      b.bookingReference || 'N/A', b.hostelId?.name || 'N/A', b.userId?.name || 'N/A',
      b.vendorId?.name || 'N/A', b.roomType || 'N/A', b.shareType || 'N/A',
      b.bookingType || 'N/A', b.totalAmount || 0, b.status || 'N/A',
      new Date(b.createdAt).toLocaleDateString(),
      b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'
    ]);
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredAndSortedBookings]);

  const totalRevenue = useMemo(
    () => bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0),
    [bookings]
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <PageHeader
        icon={Calendar}
        title="Booking Management"
        subtitle={`${bookings.length} total bookings • ₹${totalRevenue.toLocaleString()} total revenue`}
      />

      <StatsCard bookings={bookings} />

      <ActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearSearch={clearSearch}
        selectedBookings={selectedBookings}
        handleBulkDelete={handleBulkDelete}
        loadingDelete={loading.delete}
        exportToCSV={exportToCSV}
        fetchBookings={fetchBookings}
        loadingFetch={loading.fetch}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <FilterBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        getUniqueFilters={getUniqueFilters}
      />

      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No bookings found</p>
          <p className="text-sm text-gray-400">
            {debouncedSearchTerm ? 'Try adjusting your search' : filterStatus !== 'All' ? 'Try a different filter' : ''}
          </p>
          {(debouncedSearchTerm || filterStatus !== 'All') && (
            <button
              onClick={() => { clearSearch(); setFilterStatus('All'); }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <TableView
            paginatedItems={paginatedItems}
            selectedBookings={selectedBookings}
            toggleSelectAll={toggleSelectAll}
            toggleSelect={toggleSelect}
            handleSort={handleSort}
            sortConfig={sortConfig}
            viewBooking={viewBooking}
            handleDelete={handleDelete}
            loadingDelete={loading.delete}
            totalItems={totalItems}
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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]
                flex items-center justify-center text-white font-bold text-lg border border-white/20">
                {totalItems}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {filterStatus === 'All' ? 'Total Bookings' : `${filterStatus} Bookings`}
                </p>
                <p className="text-xs text-gray-400">
                  {filterStatus === 'All' ? 'Across all statuses' : 'Filtered by status'}
                  {debouncedSearchTerm && ` • Search: "${debouncedSearchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Revenue</p>
                <p className="font-bold text-white">
                  ₹{paginatedItems.reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString()}
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

export default AllBookings;