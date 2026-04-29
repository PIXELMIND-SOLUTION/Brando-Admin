import { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Users, Eye, Trash2, Calendar, Mail, Phone,
  Building2, Sparkles, Filter, X, Table2,
  Grid3x3, Download, RefreshCw, CheckCircle, XCircle,
  SortAsc, SortDesc, Search, TrendingUp,
  BadgeCheck, Clock, Home, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight,
  Shield, AlertCircle, Edit
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

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

// ── Status Badge (module-level, never remounts) ───────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    approved: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10' },
    rejected:  { icon: XCircle,    color: 'text-red-400 bg-red-500/10'     },
    pending:   { icon: Clock,      color: 'text-yellow-400 bg-yellow-500/10' }
  };
  const { icon: Icon, color } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
      <Icon size={12} /> {status || 'Unknown'}
    </span>
  );
};

// ── Pagination (module-level) ─────────────────────────────────────────────────
const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
  const pages = useMemo(() => {
    const list = [];
    const max = 5;
    if (totalPages <= max + 2) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= max; i++) list.push(i);
      list.push('...'); list.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      list.push(1); list.push('...');
      for (let i = totalPages - (max - 1); i <= totalPages; i++) list.push(i);
    } else {
      list.push(1); list.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) list.push(i);
      list.push('...'); list.push(totalPages);
    }
    return list;
  }, [currentPage, totalPages]);

  const btnBase = "p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
        <span>Show</span>
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-sm focus:border-emerald-500 outline-none">
          {[10, 20, 30, 50].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span>entries</span>
        <span className="hidden sm:inline ml-2">
          Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, totalItems)}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={btnBase}><ChevronsLeft size={16} /></button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btnBase}><ChevronLeft size={16} /></button>
        {pages.map((page, i) =>
          page === '...'
            ? <span key={`e${i}`} className="px-2 py-1 text-gray-400 text-sm">…</span>
            : <button key={page} onClick={() => onPageChange(page)}
                className={`min-w-[34px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}`}>
                {page}
              </button>
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btnBase}><ChevronRight size={16} /></button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={btnBase}><ChevronsRight size={16} /></button>
      </div>
    </div>
  );
});

// ── Main Component ────────────────────────────────────────────────────────────
const AllVendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors]               = useState([]);
  const [loading, setLoading]               = useState({ fetch: false, delete: false });
  const [filter, setFilter]                 = useState('All');
  const [viewMode, setViewMode]             = useState('table');
  const [searchTerm, setSearchTerm]         = useState('');
  const [sortConfig, setSortConfig]         = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [currentPage, setCurrentPage]       = useState(1);
  const [itemsPerPage, setItemsPerPage]     = useState(12);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(p => ({ ...p, fetch: true }));
      const { data } = await axios.get(`${API}/getallvendors`);
      setVendors(data.data || []);
    } catch (e) {
      showAlert('error', 'Oops...', 'Failed to fetch vendors');
    } finally {
      setLoading(p => ({ ...p, fetch: false }));
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);
  useEffect(() => { setCurrentPage(1); }, [filter, searchTerm, sortConfig]);

  // ── Derived data (memoized) ───────────────────────────────────────────────
  const uniqueFilters = useMemo(
    () => ['All', ...new Set(vendors.map(v => v.approvalStatus).filter(Boolean))],
    [vendors]
  );

  const filteredAndSorted = useMemo(() => {
    let list = filter === 'All' ? vendors : vendors.filter(v => v.approvalStatus === filter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(v =>
        (v.name || '').toLowerCase().includes(q) ||
        (v.mobileNumber || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let av, bv;
      if (sortConfig.key === 'totalHostels') { av = a.totalHostels || 0; bv = b.totalHostels || 0; }
      else if (sortConfig.key === 'createdAt') { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }
      else if (sortConfig.key === 'approvalStatus') {
        const ord = { approved: 3, pending: 2, rejected: 1 };
        av = ord[a.approvalStatus] || 0; bv = ord[b.approvalStatus] || 0;
      } else { av = a[sortConfig.key] || ''; bv = b[sortConfig.key] || ''; }
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vendors, filter, searchTerm, sortConfig]);

  const totalItems  = filteredAndSorted.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  // ── Stats (memoized) ──────────────────────────────────────────────────────
  const stats = useMemo(() => [
    { label: 'Total Vendors', value: vendors.length,                                                  icon: Users,        color: 'from-emerald-500 to-emerald-600' },
    { label: 'Approved',      value: vendors.filter(v => v.approvalStatus === 'approved').length,     icon: CheckCircle,  color: 'from-green-500 to-emerald-500'   },
    { label: 'Pending',       value: vendors.filter(v => v.approvalStatus === 'pending').length,      icon: Clock,        color: 'from-yellow-500 to-orange-500'   },
    { label: 'Rejected',      value: vendors.filter(v => v.approvalStatus === 'rejected').length,     icon: XCircle,      color: 'from-red-500 to-rose-500'        },
  ], [vendors]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedVendors(p =>
      p.length === paginatedVendors.length ? [] : paginatedVendors.map(v => v._id)
    );
  }, [paginatedVendors]);

  const toggleSelect = useCallback((id) => {
    setSelectedVendors(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  }, []);

  const handleDelete = useCallback(async (id) => {
    const r = await Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true,
      background: '#0f172a', color: '#fff',
      customClass: { popup: 'rounded-2xl', confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold', cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold' }
    });
    if (!r.isConfirmed) return;
    try {
      setLoading(p => ({ ...p, delete: true }));
      await axios.delete(`${API}/deletevendor/${id}`);
      showAlert('success', 'Deleted!', 'Vendor has been deleted', 2000);
      fetchVendors();
      setSelectedVendors(p => p.filter(s => s !== id));
    } catch (e) {
      showAlert('error', 'Delete failed', e.response?.data?.message || 'Could not delete vendor');
    } finally {
      setLoading(p => ({ ...p, delete: false }));
    }
  }, [fetchVendors]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedVendors.length) { showAlert('warning', 'No selection', 'Please select vendors to delete'); return; }
    const r = await Swal.fire({
      title: 'Delete Selected?', text: `You are about to delete ${selectedVendors.length} vendors`, icon: 'warning', showCancelButton: true,
      background: '#0f172a', color: '#fff',
      customClass: { popup: 'rounded-2xl', confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold', cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold' }
    });
    if (!r.isConfirmed) return;
    try {
      setLoading(p => ({ ...p, delete: true }));
      for (const id of selectedVendors) await axios.delete(`${API}/deletevendor/${id}`);
      showAlert('success', 'Deleted!', `${selectedVendors.length} vendors deleted`, 2000);
      fetchVendors(); setSelectedVendors([]);
    } catch (e) {
      showAlert('error', 'Delete failed', 'Could not delete some vendors');
    } finally {
      setLoading(p => ({ ...p, delete: false }));
    }
  }, [selectedVendors, fetchVendors]);

  const exportToCSV = useCallback(() => {
    const headers = ['Name','Mobile','Email','Status','OTP Verified','Total Hostels','Created','Last Updated'];
    const rows = filteredAndSorted.map(v => [
      v.name||'N/A', v.mobileNumber||'N/A', v.email||'N/A', v.approvalStatus||'N/A',
      v.otpVerified?'Yes':'No', v.totalHostels||0,
      new Date(v.createdAt).toLocaleDateString(), new Date(v.updatedAt).toLocaleDateString()
    ]);
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [filteredAndSorted]);

  // ── Sort icon helper ──────────────────────────────────────────────────────
  const SortIcon = ({ column }) =>
    sortConfig.key !== column
      ? <SortAsc size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      : sortConfig.direction === 'asc' ? <SortAsc size={13} /> : <SortDesc size={13} />;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

      {/* ── Page Header ── */}
      <div className="relative mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#020617] text-white border border-white/10 shadow-xl">
                <Users size={22} />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Vendor Management <BadgeCheck size={18} className="text-emerald-400" />
              </h1>
              <p className="text-xs sm:text-sm text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                <TrendingUp size={13} />
                {vendors.length} total · {vendors.filter(v => v.approvalStatus === 'approved').length} approved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-4 hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${s.color} text-white group-hover:scale-110 transition-transform`}>
                <s.icon size={14} />
              </div>
              <Sparkles size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Action Bar (search input INLINE — fixes remount/focus bug) ── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, mobile, email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-xl border border-white/10 bg-white/5
              focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
              placeholder:text-gray-500 text-sm text-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right-side controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedVendors.length > 0 && (
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all shadow-lg">
              <Trash2 size={14} />
              <span className="hidden xs:inline">Delete</span> ({selectedVendors.length})
            </button>
          )}
          <button onClick={exportToCSV} title="Export CSV"
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all">
            <Download size={16} />
          </button>
          <button onClick={fetchVendors} title="Refresh"
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all">
            <RefreshCw size={16} className={loading.fetch ? 'animate-spin' : ''} />
          </button>
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-white/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
              <Grid3x3 size={16} /><span className="text-xs sm:text-sm font-medium hidden sm:inline">Grid</span>
            </button>
            <button onClick={() => setViewMode('table')}
              className={`p-1.5 sm:p-2 rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-white/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
              <Table2 size={16} /><span className="text-xs sm:text-sm font-medium hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <Filter size={14} className="text-emerald-400" />
          <span className="font-medium">Status:</span>
        </div>
        {uniqueFilters.map(status => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5
              ${filter === status ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {status === 'approved' ? <CheckCircle size={12} /> : status === 'rejected' ? <XCircle size={12} /> : status === 'pending' ? <Clock size={12} /> : <Filter size={12} />}
            {status}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Users size={18} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedVendors.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Users size={28} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-base sm:text-lg mb-2">No vendors found</p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try adjusting your search' : filter !== 'All' ? 'Try a different filter' : 'No vendors yet'}
          </p>
          {(searchTerm || filter !== 'All') && (
            <button onClick={() => { setSearchTerm(''); setFilter('All'); }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (

        /* ── TABLE VIEW ── */
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
          <div className="overflow-x-auto -mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/10 border-b border-white/10">
                  <th className="px-3 sm:px-4 py-3 sm:py-4 w-10">
                    <input type="checkbox"
                      checked={selectedVendors.length === paginatedVendors.length && paginatedVendors.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                    />
                  </th>
                  {[
                    ['name',           'Vendor',     Users],
                    ['mobileNumber',   'Contact',    Phone],
                    ['approvalStatus', 'Status',     Shield],
                    ['totalHostels',   'Hostels',    Building2],
                    ['createdAt',      'Registered', Calendar],
                  ].map(([key, label, Icon]) => (
                    <th key={key} className="px-3 sm:px-4 py-3 sm:py-4 text-left">
                      <button onClick={() => handleSort(key)}
                        className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                        <Icon size={13} /> {label} <SortIcon column={key} />
                      </button>
                    </th>
                  ))}
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-right text-xs font-black text-emerald-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedVendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-white/5 hover:bg-white/10 transition-colors duration-150 group">
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <input type="checkbox" checked={selectedVendors.includes(vendor._id)}
                        onChange={() => toggleSelect(vendor._id)}
                        className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {vendor.hostelImage
                            ? <img src={`http://187.127.146.52:2003/${vendor.hostelImage}`} alt="" className="w-full h-full object-cover" />
                            : <Users size={13} className="text-emerald-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{vendor.name || 'Unknown'}</p>
                          {vendor.email && <p className="text-xs text-gray-400 truncate max-w-[140px]">{vendor.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Phone size={11} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-sm">{vendor.mobileNumber || 'N/A'}</span>
                      </div>
                      {!vendor.otpVerified && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={10} /> Not verified
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <StatusBadge status={vendor.approvalStatus} />
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-1">
                        <Building2 size={11} className="text-emerald-400" />
                        <span className="font-semibold text-white text-sm">{vendor.totalHostels || 0}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} /> {new Date(vendor.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => navigate(`/dashboard/vendors/${vendor._id}/bookings`)}
                          className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100" title="Bookings">
                          <Home size={13} />
                        </button>
                        <button onClick={() => navigate(`/dashboard/vendors/${vendor._id}`)}
                          className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100" title="View">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => navigate(`/dashboard/vendors/edit/${vendor._id}`)}
                          className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100" title="Edit">
                          <Edit size={13} />
                        </button>
                        <button onClick={() => handleDelete(vendor._id)} disabled={loading.delete}
                          className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100 disabled:opacity-40" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 sm:px-4 py-3 bg-white/10 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Showing {paginatedVendors.length} of {totalItems} vendors</span>
            <span className="text-gray-400">{selectedVendors.length} selected</span>
          </div>
        </div>

      ) : (

        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedVendors.map(vendor => (
            <div key={vendor._id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:shadow-xl hover:border-white/20 transition-all group relative">
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input type="checkbox" checked={selectedVendors.includes(vendor._id)}
                  onChange={() => toggleSelect(vendor._id)}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Image */}
              <div className="relative h-36 sm:h-44 bg-white/5">
                <img
                  src={vendor.hostelImage ? `http://187.127.146.52:2003/${vendor.hostelImage}` : '/api/placeholder/400/300'}
                  alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button onClick={() => navigate(`/dashboard/vendors/${vendor._id}`)}
                    className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80 transition-colors">
                    <Eye size={13} />
                  </button>
                  <button onClick={() => navigate(`/dashboard/vendors/edit/${vendor._id}`)}
                    className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-yellow-400 hover:bg-black/80 transition-colors">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => handleDelete(vendor._id)} disabled={loading.delete}
                    className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-black/80 transition-colors disabled:opacity-40">
                    <Trash2 size={13} />
                  </button>
                </div>
                {/* Hostel count badge */}
                <div className="absolute top-2 left-8 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <Building2 size={11} className="text-emerald-400" /> {vendor.totalHostels || 0}
                </div>
                {/* Status at bottom of image */}
                <div className="absolute bottom-2 left-2">
                  <StatusBadge status={vendor.approvalStatus} />
                </div>
              </div>

              {/* Card body */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-white text-sm sm:text-base leading-tight line-clamp-1">{vendor.name || 'Unknown Vendor'}</h3>
                  {!vendor.otpVerified && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded-full text-yellow-400 font-semibold whitespace-nowrap flex-shrink-0">
                      OTP Pending
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Phone size={11} className="text-emerald-400 flex-shrink-0" />
                    <span>{vendor.mobileNumber || 'N/A'}</span>
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} className="text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar size={10} /> {new Date(vendor.createdAt).toLocaleDateString()}
                  </div>
                  <button onClick={() => navigate(`/dashboard/vendors/${vendor._id}`)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    View →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination + Summary ── */}
      {!loading.fetch && paginatedVendors.length > 0 && (
        <>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />

          <div className="mt-5 sm:mt-6 bg-white/10 rounded-xl p-3 sm:p-4 border border-white/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0f172a] to-[#020617] flex items-center justify-center text-white font-bold text-base border border-white/20">
                {totalItems}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {filter === 'All' ? 'Total Vendors' : `${filter} Vendors`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'All' ? 'Across all statuses' : 'Filtered by status'}
                  {searchTerm && ` · "${searchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Page Hostels</p>
                <p className="font-bold text-white text-sm">
                  {paginatedVendors.reduce((acc, v) => acc + (v.totalHostels || 0), 0)}
                </p>
              </div>
              <Sparkles size={18} className="text-emerald-400" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllVendors;