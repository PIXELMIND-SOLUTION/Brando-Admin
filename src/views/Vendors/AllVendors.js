import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Users, Eye, Trash2, Calendar, Mail, Phone,
  Building2, Sparkles, Filter, X, Table2,
  Grid3x3, Download, RefreshCw, CheckCircle, XCircle,
  SortAsc, SortDesc, Search, TrendingUp,
  BadgeCheck, Clock, Home, Tag, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, UserCheck,
  UserX, Shield, AlertCircle, Edit
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

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

// Pagination Component with Ellipsis
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - (maxVisible - 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
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
          className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:border-emerald-500 outline-none"
        >
          {[10, 20, 30, 50].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span>entries</span>
        <span className="ml-4">
          Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${currentPage === page
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

const AllVendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedVendors, setSelectedVendors] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const fetchVendors = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/getallvendors`);
      setVendors(data.data || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch vendors');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortConfig]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-bold',
        confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
      }
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await axios.delete(`${API}/deletevendor/${id}`);

      showAlert('success', 'Deleted!', 'Vendor has been deleted', 2000);
      fetchVendors();
      setSelectedVendors(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete vendor");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVendors.length === 0) {
      showAlert('warning', 'No selection', 'Please select vendors to delete');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `You are about to delete ${selectedVendors.length} vendors`,
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-bold',
        confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
      }
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));

      for (const id of selectedVendors) {
        await axios.delete(`${API}/deletevendor/${id}`);
      }

      showAlert('success', 'Deleted!', `${selectedVendors.length} vendors deleted`, 2000);
      fetchVendors();
      setSelectedVendors([]);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', 'Could not delete some vendors');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const viewVendor = (id) => {
    navigate(`/dashboard/vendors/${id}`);
  };

  const editVendor = (id) => {
    navigate(`/dashboard/vendors/edit/${id}`);
  };

  const getUniqueFilters = () => {
    const statuses = ['All', ...new Set(vendors.map(v => v.approvalStatus).filter(Boolean))];
    return statuses;
  };

  const filteredAndSortedVendors = () => {
    let filtered = filter === 'All'
      ? vendors
      : vendors.filter(v => v.approvalStatus === filter);

    if (searchTerm) {
      filtered = filtered.filter(v =>
        (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.mobileNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'totalHostels') {
        aVal = a.totalHostels || 0;
        bVal = b.totalHostels || 0;
      } else if (sortConfig.key === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else if (sortConfig.key === 'approvalStatus') {
        const statusOrder = { approved: 3, pending: 2, rejected: 1 };
        aVal = statusOrder[a.approvalStatus] || 0;
        bVal = statusOrder[b.approvalStatus] || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getPaginatedData = () => {
    const filtered = filteredAndSortedVendors();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      data: filtered.slice(start, end),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const { data: paginatedVendors, totalItems, totalPages } = getPaginatedData();

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedVendors.length === paginatedVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(paginatedVendors.map(v => v._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedVendors(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const exportToCSV = () => {
    const data = filteredAndSortedVendors();
    const headers = ['Name', 'Mobile', 'Email', 'Status', 'OTP Verified', 'Total Hostels', 'Created', 'Last Updated'];

    const csvData = data.map(v => [
      v.name || 'N/A',
      v.mobileNumber || 'N/A',
      v.email || 'N/A',
      v.approvalStatus || 'N/A',
      v.otpVerified ? 'Yes' : 'No',
      v.totalHostels || 0,
      new Date(v.createdAt).toLocaleDateString(),
      new Date(v.updatedAt).toLocaleDateString()
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
              {title}
              <BadgeCheck size={20} className="text-emerald-400" />
            </h1>
            <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
              <TrendingUp size={14} />
              {subtitle}
            </p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );

  const StatsCard = () => {
    const stats = [
      { label: 'Total Vendors', value: vendors.length, icon: Users, color: 'from-emerald-500 to-emerald-600' },
      { label: 'Approved', value: vendors.filter(v => v.approvalStatus === 'approved').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
      { label: 'Pending', value: vendors.filter(v => v.approvalStatus === 'pending').length, icon: Clock, color: 'from-yellow-500 to-orange-500' },
      { label: 'Rejected', value: vendors.filter(v => v.approvalStatus === 'rejected').length, icon: XCircle, color: 'from-red-500 to-rose-500' }
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 
            shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white 
                group-hover:scale-110 transition-transform`}>
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

  const ViewToggle = () => (
    <div className="flex items-center gap-2 p-1 bg-white/10 rounded-xl">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'grid'
          ? 'bg-white/20 text-emerald-400 shadow-md'
          : 'text-gray-400 hover:text-white'
          }`}
      >
        <Grid3x3 size={18} />
        <span className="text-sm font-medium hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => setViewMode('table')}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'table'
          ? 'bg-white/20 text-emerald-400 shadow-md'
          : 'text-gray-400 hover:text-white'
          }`}
      >
        <Table2 size={18} />
        <span className="text-sm font-medium hidden sm:inline">Table</span>
      </button>
    </div>
  );

  const SearchBar = () => (
    <div className="relative flex-1 max-w-md">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search vendors by name, mobile, email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
          placeholder:text-gray-500 text-sm text-white"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );

  const FilterBar = () => {
    const filters = getUniqueFilters();

    const getFilterIcon = (filter) => {
      switch (filter) {
        case 'approved': return <CheckCircle size={14} />;
        case 'rejected': return <XCircle size={14} />;
        case 'pending': return <Clock size={14} />;
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
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2
              ${filter === status
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
          >
            {getFilterIcon(status)}
            {status}
          </button>
        ))}
      </div>
    );
  };

  const ActionBar = () => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <SearchBar />
      <div className="flex items-center gap-2 ml-auto">
        {selectedVendors.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white 
              font-medium text-sm hover:bg-red-600 transition-all shadow-lg"
          >
            <Trash2 size={16} />
            Delete ({selectedVendors.length})
          </button>
        )}
        <button
          onClick={exportToCSV}
          className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
          title="Export to CSV"
        >
          <Download size={18} />
        </button>
        <button
          onClick={fetchVendors}
          className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading.fetch ? 'animate-spin' : ''} />
        </button>
        <ViewToggle />
      </div>
    </div>
  );

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const StatusBadge = ({ status }) => {
    const config = {
      approved: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10' },
      rejected: { icon: XCircle, color: 'text-red-400 bg-red-500/10' },
      pending: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/10' }
    };

    const { icon: Icon, color } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
        <Icon size={12} />
        {status || 'Unknown'}
      </span>
    );
  };

  const TableView = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 border-b border-white/10">
              <th className="px-4 py-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedVendors.length === paginatedVendors.length && paginatedVendors.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Users size={14} />
                  Vendor Name
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('mobileNumber')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Phone size={14} />
                  Contact
                  <SortIcon column="mobileNumber" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('approvalStatus')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Shield size={14} />
                  Status
                  <SortIcon column="approvalStatus" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('totalHostels')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Building2 size={14} />
                  Hostels
                  <SortIcon column="totalHostels" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Calendar size={14} />
                  Registered
                  <SortIcon column="createdAt" />
                </button>
              </th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVendors.map((vendor) => (
              <tr
                key={vendor._id}
                className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(vendor._id)}
                    onChange={() => toggleSelect(vendor._id)}
                    className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                      {vendor.hostelImage ? (
                        <img src={`http://187.127.146.52:2003/${vendor.hostelImage}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users size={14} className="text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-white">{vendor.name || 'Unknown'}</span>
                      {vendor.email && (
                        <p className="text-xs text-gray-400">{vendor.email}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Phone size={12} className="text-emerald-400" />
                    <span className="text-sm">{vendor.mobileNumber || 'N/A'}</span>
                  </div>
                  {!vendor.otpVerified && (
                    <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={10} />
                      OTP not verified
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={vendor.approvalStatus} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Building2 size={12} className="text-emerald-400" />
                    <span className="font-semibold text-white">{vendor.totalHostels || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/vendors/${vendor._id}/bookings`)}
                      className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500
                        text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="View bookings"
                    >
                      <Home size={14} />
                    </button>
                    <button
                      onClick={() => viewVendor(vendor._id)}
                      className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 
                        text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => editVendor(vendor._id)}
                      className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 
                        text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Edit vendor"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id)}
                      disabled={loading.delete}
                      className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 
                        text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-white/10 border-t border-white/10 
        flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Showing {paginatedVendors.length} of {totalItems} vendors
        </span>
        <span className="text-gray-400">
          {selectedVendors.length} selected
        </span>
      </div>
    </div>
  );

  const GridView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {paginatedVendors.map(vendor => (
          <div key={vendor._id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden 
            hover:shadow-xl transition-all group relative">
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedVendors.includes(vendor._id)}
                onChange={() => toggleSelect(vendor._id)}
                className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div className="relative h-40 sm:h-48 bg-white/5">
              <img
                src={vendor.hostelImage ? `http://187.127.146.52:2003/${vendor.hostelImage}` : '/api/placeholder/400/300'}
                alt={vendor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button onClick={() => viewVendor(vendor._id)}
                  className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80">
                  <Eye size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button onClick={() => editVendor(vendor._id)}
                  className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-yellow-400 hover:bg-black/80">
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button onClick={() => handleDelete(vendor._id)}
                  disabled={loading.delete}
                  className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-black/80">
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-8 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                <Building2 size={12} className="text-emerald-400" />
                {vendor.totalHostels || 0} Hostels
              </div>
              <div className="absolute bottom-2 left-2">
                <StatusBadge status={vendor.approvalStatus} />
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-white line-clamp-1">{vendor.name || 'Unknown Vendor'}</h3>
                {!vendor.otpVerified && (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 rounded-full text-yellow-400 font-semibold whitespace-nowrap">
                    OTP Pending
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-emerald-400 flex-shrink-0" />
                  <span>{vendor.mobileNumber || 'N/A'}</span>
                </div>

                {vendor.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Building2 size={12} className="text-emerald-400 flex-shrink-0" />
                  <span>Total Hostels: {vendor.totalHostels || 0}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar size={10} />
                  {new Date(vendor.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => viewVendor(vendor._id)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <PageHeader
        icon={Users}
        title="Vendor Management"
        subtitle={`${vendors.length} total vendors • ${vendors.filter(v => v.approvalStatus === 'approved').length} approved`}
      />

      <StatsCard />
      <ActionBar />
      <FilterBar />


      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Users size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedVendors.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Users size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No vendors found</p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try adjusting your search' : filter !== 'All' ? 'Try a different filter' : ''}
          </p>
          {(searchTerm || filter !== 'All') && (
            <button
              onClick={() => { setSearchTerm(''); setFilter('All'); }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white 
                rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? <GridView /> : <TableView />}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onItemsPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setCurrentPage(1);
            }}
          />

          <div className="mt-6 bg-white/10 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
                flex items-center justify-center text-white font-bold text-lg border border-white/20">
                {totalItems}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {filter === 'All' ? 'Total Vendors' : `${filter} Vendors`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'All' ? 'Across all statuses' : `Filtered by status`}
                  {searchTerm && ` • Search: "${searchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Hostels</p>
                <p className="font-bold text-white">
                  {paginatedVendors.reduce((acc, v) => acc + (v.totalHostels || 0), 0)}
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

export default AllVendors;