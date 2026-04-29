import { useState, useEffect, memo, useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Users, Eye, Trash2, Calendar, Phone, MapPin,
  Building2, Sparkles, Filter, X, Table2,
  Grid3x3, Download, RefreshCw, CheckCircle, XCircle,
  SortAsc, SortDesc, Search, TrendingUp,
  BadgeCheck, Clock, Home, Tag, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle,
  Mail, User, Edit, Star, IndianRupee,
  DollarSign
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

// ── Pagination ──────────────────────────────────────────────────────────────
const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
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
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-sm focus:border-emerald-500 outline-none">
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
        {getPageNumbers().map((page, index) => (
          page === '...'
            ? <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
            : <button key={page} onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${currentPage === page
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}`}>
              {page}
            </button>
        ))}
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

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, isVerified }) => {
  if (status === 'deleted') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10">
      <XCircle size={12} /> Deleted
    </span>
  );
  if (isVerified) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-green-400 bg-green-500/10">
      <CheckCircle size={12} /> Verified
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-yellow-400 bg-yellow-500/10">
      <Clock size={12} /> Pending
    </span>
  );
};

// ── Customer Modal ────────────────────────────────────────────────────────────
const CustomerModal = memo(({
  selectedCustomer, editMode, editFormData, loading,
  onClose, onEditModeChange, onFormDataChange, onSave, onDelete, onOpenEditModal
}) => {
  if (!selectedCustomer) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-emerald-400" />
            {editMode ? 'Edit User' : 'User Details'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input type="text" name="name" value={editFormData.name} onChange={onFormDataChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={editFormData.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")      // remove non-numbers
                      .slice(0, 10);          // limit to 10 digits

                    onFormDataChange({
                      target: {
                        name: "mobileNumber",
                        value,
                      },
                    });
                  }}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 
  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
  outline-none transition-all text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select name="status" value={editFormData.status} onChange={onFormDataChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-white">
                  <option value="active" className="bg-black">Active</option>
                  <option value="inactive" className="bg-black">Inactive</option>
                  <option value="deleted" className="bg-black">Deleted</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={() => onEditModeChange(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all">
                  Cancel
                </button>
                <button type="button" onClick={() => onSave(selectedCustomer._id, editFormData)} disabled={loading.update}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                  {loading.update ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedCustomer.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedCustomer.name || 'Guest User'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={14} className="text-gray-400" />
                    <p className="text-gray-300">{selectedCustomer.mobileNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <StatusBadge status={selectedCustomer.status} isVerified={selectedCustomer.isVerified} />
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Joined Date</p>
                  <p className="text-white text-sm">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                </div>
                {selectedCustomer.location && (
                  <div className="bg-white/5 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-400 mb-1">Location</p>
                    <p className="text-white text-sm flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-400" />
                      Lat: {selectedCustomer.location.latitude}, Lng: {selectedCustomer.location.longitude}
                    </p>
                  </div>
                )}
              </div>
              {selectedCustomer.hostelId && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <Building2 size={14} /> Associated Hostel
                  </p>
                  <p className="text-white font-medium">{selectedCustomer.hostelId.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{selectedCustomer.hostelId.address}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-white">{selectedCustomer.hostelId.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee size={12} className="text-emerald-400" />
                      <span className="text-sm text-white">Advance: ₹{selectedCustomer.hostelId.monthlyAdvance}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button onClick={() => onOpenEditModal(selectedCustomer)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Edit size={18} /> Edit Customer
                </button>
                <button onClick={() => onDelete(selectedCustomer._id)} disabled={loading.delete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// ── Main Component ────────────────────────────────────────────────────────────
const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, update: false, delete: false });
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', mobileNumber: '', status: 'active' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/getallusers`);
      setCustomers(data.data || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch customers');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { setCurrentPage(1); }, [filter, searchTerm, sortConfig]);

  // ── Filtered + sorted data (memoized — no re-creation on every render) ──
  const filteredAndSorted = useMemo(() => {
    let list = filter === 'All' ? customers : customers.filter(c => c.status === filter);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.mobileNumber?.toString() || '').toLowerCase().includes(q) ||
        (c.hostelId?.name || '').toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let aVal, bVal;
      if (sortConfig.key === 'hostelId') {
        aVal = a.hostelId?.name || ''; bVal = b.hostelId?.name || '';
      } else if (sortConfig.key === 'createdAt') {
        aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime();
      } else if (sortConfig.key === 'mobileNumber') {
        aVal = a.mobileNumber?.toString() || ''; bVal = b.mobileNumber?.toString() || '';
      } else {
        aVal = a[sortConfig.key] || ''; bVal = b[sortConfig.key] || '';
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [customers, filter, searchTerm, sortConfig]);

  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const uniqueFilters = useMemo(
    () => ['All', ...new Set(customers.map(c => c.status).filter(Boolean))],
    [customers]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  }, []);

  const handleEditFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const viewCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setEditMode(false);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((customer) => {
    setSelectedCustomer(customer);
    setEditFormData({
      name: customer.name || '',
      mobileNumber: customer.mobileNumber?.toString() || '',
      status: customer.status || 'active'
    });
    setEditMode(true);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditMode(false);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedCustomers(prev =>
      prev.length === paginatedCustomers.length ? [] : paginatedCustomers.map(c => c._id)
    );
  }, [paginatedCustomers]);

  const toggleSelect = useCallback((id) => {
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }, []);

  const handleUpdateCustomer = useCallback(async (userId, formData) => {
    const result = await Swal.fire({
      title: 'Update Customer?', text: 'Are you sure you want to update this customer?', icon: 'question', showCancelButton: true,
      background: '#0f172a', color: '#fff',
      customClass: { popup: 'rounded-2xl', confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold', cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold' }
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(prev => ({ ...prev, update: true }));
      await axios.put(`${API}/updateuser/${userId}`, formData);
      showAlert('success', 'Updated!', 'Customer has been updated successfully', 2000);
      fetchCustomers();
      setShowModal(false); setEditMode(false); setSelectedCustomer(null);
    } catch (error) {
      showAlert('error', 'Update failed', error.response?.data?.message || "Could not update customer");
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, [fetchCustomers]);

  const handleDelete = useCallback(async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true,
      background: '#0f172a', color: '#fff',
      customClass: { popup: 'rounded-2xl', confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold', cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold' }
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await axios.delete(`${API}/deleteuser/${userId}`);
      showAlert('success', 'Deleted!', 'Customer has been deleted', 2000);
      fetchCustomers();
      setSelectedCustomers(prev => prev.filter(id => id !== userId));
      if (selectedCustomer?._id === userId) { setShowModal(false); setSelectedCustomer(null); }
    } catch (error) {
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete customer");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [fetchCustomers, selectedCustomer]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedCustomers.length === 0) { showAlert('warning', 'No selection', 'Please select customers to delete'); return; }
    const result = await Swal.fire({
      title: 'Delete Selected?', text: `You are about to delete ${selectedCustomers.length} customers`, icon: 'warning', showCancelButton: true,
      background: '#0f172a', color: '#fff',
      customClass: { popup: 'rounded-2xl', confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold', cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold' }
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      for (const id of selectedCustomers) await axios.delete(`${API}/deleteuser/${id}`);
      showAlert('success', 'Deleted!', `${selectedCustomers.length} customers deleted`, 2000);
      fetchCustomers(); setSelectedCustomers([]);
    } catch (error) {
      showAlert('error', 'Delete failed', 'Could not delete some customers');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [selectedCustomers, fetchCustomers]);

  const exportToCSV = useCallback(() => {
    const headers = ['Name', 'Mobile Number', 'Status', 'Verified', 'Associated Hostel', 'Joined Date', 'Last Updated'];
    const rows = filteredAndSorted.map(c => [
      c.name || 'N/A', c.mobileNumber || 'N/A', c.status || 'active',
      c.isVerified ? 'Yes' : 'No', c.hostelId?.name || 'None',
      new Date(c.createdAt).toLocaleDateString(), new Date(c.updatedAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [filteredAndSorted]);

  // ── Sort icon helper ───────────────────────────────────────────────────────
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => [
    { label: 'Total Users', value: customers.length, icon: Users, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Active', value: customers.filter(c => c.status === 'active' || !c.status).length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Verified', value: customers.filter(c => c.isVerified).length, icon: BadgeCheck, color: 'from-blue-500 to-indigo-500' },
    { label: 'With Hostel', value: customers.filter(c => c.hostelId).length, icon: Building2, color: 'from-purple-500 to-pink-500' }
  ], [customers]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

      {/* Page Header */}
      <div className="relative mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10">
                <Users size={24} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                User Management <BadgeCheck size={20} className="text-emerald-400" />
              </h1>
              <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                <TrendingUp size={14} />
                {customers.length} total users • {customers.filter(c => c.isVerified).length} verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Action Bar — search input lives HERE, not inside a nested component */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, mobile, or hostel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-white/10 bg-white/5
              focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
              placeholder:text-gray-500 text-sm text-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {selectedCustomers.length > 0 && (
            <button onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all shadow-lg">
              <Trash2 size={16} /> Delete ({selectedCustomers.length})
            </button>
          )}
          <button onClick={exportToCSV} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Export CSV">
            <Download size={18} />
          </button>
          <button onClick={fetchCustomers} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Refresh">
            <RefreshCw size={18} className={loading.fetch ? 'animate-spin' : ''} />
          </button>
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-white/20 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white'}`}>
              <Grid3x3 size={18} /><span className="text-sm font-medium hidden sm:inline">Grid</span>
            </button>
            <button onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-white/20 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white'}`}>
              <Table2 size={18} /><span className="text-sm font-medium hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter size={16} className="text-emerald-400" />
          <span className="font-medium">Filter by Status:</span>
        </div>
        {uniqueFilters.map(status => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2
              ${filter === status ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {status === 'active' ? <CheckCircle size={14} /> : status === 'inactive' ? <XCircle size={14} /> : status === 'deleted' ? <Trash2 size={14} /> : <Filter size={14} />}
            {status}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Users size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedCustomers.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Users size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No customers found</p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try adjusting your search' : filter !== 'All' ? 'Try a different filter' : ''}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/10 border-b border-white/10">
                  <th className="px-4 py-4 w-12">
                    <input type="checkbox"
                      checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                    />
                  </th>
                  {[['name', 'User', User], ['mobileNumber', 'Mobile', Phone], ['hostelId', 'Associated Hostel', Building2]].map(([key, label, Icon]) => (
                    <th key={key} className="px-4 py-4 text-left">
                      <button onClick={() => handleSort(key)}
                        className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                        <Icon size={14} /> {label} <SortIcon column={key} />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-left text-xs font-black text-emerald-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-left">
                    <button onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                      <Calendar size={14} /> Joined <SortIcon column="createdAt" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-black text-emerald-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-200 group">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedCustomers.includes(customer._id)}
                        onChange={() => toggleSelect(customer._id)}
                        className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {customer.profileImage
                            ? <img src={customer.profileImage} alt="" className="w-full h-full object-cover" />
                            : <Users size={14} className="text-emerald-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{customer.name || 'Guest User'}</p>
                          {customer.location && (
                            <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> Location available</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Phone size={12} className="text-emerald-400" />
                        <span className="text-sm">{customer.mobileNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {customer.hostelId ? (
                        <div>
                          <p className="text-sm text-white font-medium">{customer.hostelId.name}</p>
                          <p className="text-xs text-gray-500">{customer.hostelId.address}</p>
                        </div>
                      ) : <span className="text-sm text-gray-500">None</span>}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={customer.status} isVerified={customer.isVerified} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/dashboard/user-payments/${customer._id}`)}
                          className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100" title="Payments">
                          <DollarSign size={14} />
                        </button>
                        <button onClick={() => viewCustomer(customer)}
                          className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEditModal(customer)}
                          className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(customer._id)} disabled={loading.delete}
                          className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100" title="Delete">
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
            <span className="text-gray-400">Showing {paginatedCustomers.length} of {totalItems} customers</span>
            <span className="text-gray-400">{selectedCustomers.length} selected</span>
          </div>
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {paginatedCustomers.map((customer) => (
            <div key={customer._id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:shadow-xl transition-all group relative">
              <div className="absolute top-2 left-2 z-10">
                <input type="checkbox" checked={selectedCustomers.includes(customer._id)}
                  onChange={() => toggleSelect(customer._id)}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="relative h-32 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
                <div className="absolute -bottom-8 left-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#020617] flex items-center justify-center border-2 border-emerald-500/30 overflow-hidden">
                    {customer.profileImage
                      ? <img src={customer.profileImage} alt={customer.name} className="w-full h-full object-cover" />
                      : <Users size={24} className="text-emerald-400" />}
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button onClick={() => viewCustomer(customer)} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80"><Eye size={14} /></button>
                  <button onClick={() => openEditModal(customer)} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-yellow-400 hover:bg-black/80"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(customer._id)} disabled={loading.delete} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-black/80"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-4 pt-10">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-white">{customer.name || 'Guest User'}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Phone size={10} /> {customer.mobileNumber || 'No mobile'}
                    </p>
                  </div>
                  <StatusBadge status={customer.status} isVerified={customer.isVerified} />
                </div>
                {customer.hostelId && (
                  <div className="mt-3 p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-emerald-400 font-semibold mb-1">Associated Hostel</p>
                    <p className="text-sm text-white">{customer.hostelId.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{customer.hostelId.address}</p>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={10} /> Joined: {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                  {customer.location && (
                    <button onClick={() => {
                      const { latitude, longitude } = customer.location;
                      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
                    }}>
                      <MapPin size={12} className="text-emerald-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading.fetch && paginatedCustomers.length > 0 && (
        <>
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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] to-[#020617] flex items-center justify-center text-white font-bold text-lg border border-white/20">
                {totalItems}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {filter === 'All' ? 'Total Users' : `${filter} Users`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'All' ? 'Across all statuses' : 'Filtered by status'}
                  {searchTerm && ` • Search: "${searchTerm}"`}
                </p>
              </div>
            </div>
            <Sparkles size={20} className="text-emerald-400" />
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <CustomerModal
          selectedCustomer={selectedCustomer}
          editMode={editMode}
          editFormData={editFormData}
          loading={loading}
          onClose={closeModal}
          onEditModeChange={setEditMode}
          onFormDataChange={handleEditFormChange}
          onSave={handleUpdateCustomer}
          onDelete={handleDelete}
          onOpenEditModal={openEditModal}
        />
      )}
    </div>
  );
};

export default Customers;