import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Wallet, Eye, Trash2, CheckCircle, XCircle, Clock,
  RefreshCw, Filter, X, Search, SortAsc, SortDesc,
  Calendar, Building2, User, AlertCircle, DollarSign,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Sparkles, BadgeCheck, TrendingUp, Download, CreditCard,
  IndianRupee, Phone, Tag, Home, ArrowLeft
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

// SweetAlert config
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

// Custom hook for debounced search
const useDebouncedSearch = (initialValue = '', delay = 300) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearchTerm(searchTerm), delay);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, delay]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  return { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch };
};

// Custom hook for local search
const useLocalSearch = (setSearchTerm, clearSearch, delay = 300) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const debounceTimerRef = useRef(null);

  const handleSearchChange = useCallback((value) => {
    setLocalSearchTerm(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setSearchTerm(value), delay);
  }, [setSearchTerm, delay]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm('');
    clearSearch();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, [clearSearch]);

  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  return { localSearchTerm, handleSearchChange, handleClearSearch };
};

// Custom hook for filtering and sorting
const useFilterAndSortPayments = (payments, filterStatus, searchTerm, sortConfig) => {
  return useMemo(() => {
    if (!payments.length) return [];
    
    let filtered = filterStatus === 'All' 
      ? payments 
      : payments.filter(p => p.status === filterStatus);

    if (searchTerm) {
      filtered = filtered.filter(p => 
        (p.bookingReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.hostelId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.roomType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.shareType || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'hostelId') {
        aVal = a.hostelId?.name || '';
        bVal = b.hostelId?.name || '';
      } else if (sortConfig.key === 'totalAmount') {
        aVal = a.totalAmount || 0;
        bVal = b.totalAmount || 0;
      } else if (sortConfig.key === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [payments, filterStatus, searchTerm, sortConfig]);
};

// Custom hook for pagination
const usePagination = (items, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const changeItemsPerPage = useCallback((newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  }, []);

  useEffect(() => setCurrentPage(1), [items.length]);

  return { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage };
};

// Pagination Component
const Pagination = React.memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - (maxVisible - 1); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const pageNumbers = useMemo(() => getPageNumbers(), [getPageNumbers]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-sm focus:border-emerald-500 outline-none"
        >
          {[5, 10, 15, 20, 30].map(size => <option key={size} value={size}>{size}</option>)}
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
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
            ) : (
              <button key={page} onClick={() => onPageChange(page)}
                className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-black border border-white/20 text-white hover:bg-white/20'
                }`}>
                {page}
              </button>
            )
          ))}
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
});

const SingleUserPayments = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch } = useDebouncedSearch('', 300);
  const { localSearchTerm, handleSearchChange, handleClearSearch } = useLocalSearch(setSearchTerm, clearSearch, 300);
  const filteredAndSortedPayments = useFilterAndSortPayments(payments, filterStatus, debouncedSearchTerm, sortConfig);
  const { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage } = usePagination(filteredAndSortedPayments, 10);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/userpayments/${userId}`);
      setPayments(data.payments || []);
      if (data.payments && data.payments[0]?.userId) {
        setUserInfo(data.payments[0].userId);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch user payments');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [userId]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await axios.delete(`${API}/deletepayment/${id}`);
      showAlert('success', 'Deleted!', 'Payment has been deleted', 2000);
      fetchPayments();
      setSelectedPayments(prev => prev.filter(selectedId => selectedId !== id));
      if (selectedPayment && selectedPayment._id === id) {
        setShowModal(false);
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete payment");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPayments.length === 0) {
      showAlert('warning', 'No selection', 'Please select payments to delete');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `You are about to delete ${selectedPayments.length} payment(s)`,
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      const deletePromises = selectedPayments.map(id => axios.delete(`${API}/deletepayment/${id}`));
      await Promise.all(deletePromises);
      showAlert('success', 'Deleted!', `${selectedPayments.length} payment(s) deleted`, 2000);
      fetchPayments();
      setSelectedPayments([]);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', 'Could not delete some payments');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const viewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getUniqueFilters = () => {
    const statuses = ['All', ...new Set(payments.map(p => p.status).filter(Boolean))];
    return statuses;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedPayments.length === paginatedItems.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(paginatedItems.map(p => p._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedPayments(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const exportToCSV = () => {
    const data = filteredAndSortedPayments;
    const headers = ['Booking Ref', 'Hostel', 'Room Type', 'Share Type', 'Booking Type', 'Total Amount', 'Advance', 'Status', 'Booking Date', 'Start Date'];
    
    const csvData = data.map(p => [
      p.bookingReference || 'N/A',
      p.hostelId?.name || 'N/A',
      p.roomType || 'N/A',
      p.shareType || 'N/A',
      p.bookingType || 'N/A',
      p.totalAmount || 0,
      p.monthlyAdvance || 0,
      p.status || 'N/A',
      new Date(p.createdAt).toLocaleString(),
      p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_payments_${userId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
        <Icon size={12} />
        {label}
      </span>
    );
  };

  const PaymentsTable = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 border-b border-white/10">
              <th className="px-4 py-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedPayments.length === paginatedItems.length && paginatedItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <button onClick={() => handleSort('bookingReference')} className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                  <Tag size={14} /> Booking Ref
                  {sortConfig.key === 'bookingReference' && (sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button onClick={() => handleSort('hostelId')} className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                  <Building2 size={14} /> Hostel
                  {sortConfig.key === 'hostelId' && (sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </button>
              </th>
              <th className="px-4 py-4 text-left">Room/Share</th>
              <th className="px-4 py-4 text-left">
                <button onClick={() => handleSort('totalAmount')} className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                  <IndianRupee size={14} /> Amount
                  {sortConfig.key === 'totalAmount' && (sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </button>
              </th>
              <th className="px-4 py-4 text-left">Status</th>
              <th className="px-4 py-4 text-left">
                <button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group">
                  <Calendar size={14} /> Booked On
                  {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </button>
              </th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((payment) => (
              <tr key={payment._id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group">
                <td className="px-4 py-4">
                  <input type="checkbox" checked={selectedPayments.includes(payment._id)} onChange={() => toggleSelect(payment._id)} className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500" />
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
                  <p className="text-sm text-white">{payment.roomType || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{payment.shareType || 'N/A'}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-white">{formatCurrency(payment.totalAmount || 0)}</p>
                  {payment.monthlyAdvance > 0 && <p className="text-xs text-gray-500">Advance: {formatCurrency(payment.monthlyAdvance)}</p>}
                </td>
                <td className="px-4 py-4"><StatusBadge status={payment.status} /></td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => viewPayment(payment)} className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all" title="View details">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleDelete(payment._id)} disabled={loading.delete} className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg transition-all" title="Delete">
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
  );

  const PaymentModal = () => {
    if (!selectedPayment) return null;
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Wallet size={20} className="text-emerald-400" />Payment Details</h2>
            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedPayment.status} />
              <p className="text-xs text-gray-500">ID: {selectedPayment._id.slice(-8)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Booking Reference</p>
              <p className="text-white font-mono text-lg">{selectedPayment.bookingReference}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><Building2 size={14} />Hostel Information</p>
              <p className="text-white font-medium">{selectedPayment.hostelId?.name}</p>
              <p className="text-sm text-gray-400">{selectedPayment.hostelId?.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Room Type</p><p className="text-white font-medium">{selectedPayment.roomType}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Share Type</p><p className="text-white font-medium">{selectedPayment.shareType}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Total Amount</p><p className="text-white font-bold text-lg">{formatCurrency(selectedPayment.totalAmount)}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Advance Paid</p><p className="text-white font-bold text-lg">{formatCurrency(selectedPayment.monthlyAdvance)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Booking Date</p><p className="text-white text-sm">{new Date(selectedPayment.createdAt).toLocaleString()}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Start Date</p><p className="text-white text-sm">{selectedPayment.startDate ? new Date(selectedPayment.startDate).toLocaleDateString() : 'N/A'}</p></div>
            </div>
            <button onClick={() => handleDelete(selectedPayment._id)} disabled={loading.delete} className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Trash2 size={18} /> Delete Payment
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
        <ArrowLeft size={18} /> Back
      </button>

      {/* User Info Header */}
      {userInfo && (
        <div className="mb-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">User Payments</h2>
              <p className="text-gray-400">Mobile: {userInfo.mobileNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm">Total Payments</p>
          <p className="text-2xl font-bold text-white">{payments.length}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0))}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm">Pending Payments</p>
          <p className="text-2xl font-bold text-white">{payments.filter(p => p.status === 'pending').length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by booking ref, hostel, room..." value={localSearchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white" />
          {localSearchTerm && <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={16} /></button>}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {selectedPayments.length > 0 && (
            <button onClick={handleBulkDelete} disabled={loading.delete} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium text-sm">
              <Trash2 size={16} /> Delete ({selectedPayments.length})
            </button>
          )}
          <button onClick={exportToCSV} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20" title="Export to CSV"><Download size={18} /></button>
          <button onClick={fetchPayments} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20" title="Refresh"><RefreshCw size={18} className={loading.fetch ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400"><Filter size={16} className="text-emerald-400" /><span className="font-medium">Filter by Status:</span></div>
        {getUniqueFilters().map(status => (
          <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === status ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {status === 'form_submitted' ? 'Form Submitted' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading.fetch ? (
        <div className="flex justify-center py-20"><div className="relative"><div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><Wallet size={20} className="text-emerald-400 animate-pulse" /></div></div></div>
      ) : paginatedItems.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <Wallet size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-white font-bold text-lg">No payments found</p>
        </div>
      ) : (
        <>
          <PaymentsTable />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} itemsPerPage={itemsPerPage} totalItems={totalItems} onItemsPerPageChange={changeItemsPerPage} />
        </>
      )}
      {showModal && <PaymentModal />}
    </div>
  );
};

export default SingleUserPayments;