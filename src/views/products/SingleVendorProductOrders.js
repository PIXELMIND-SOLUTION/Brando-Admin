import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Package, Eye, Truck, MapPin, CheckCircle, XCircle,
  Sparkles, Filter, X, CreditCard, Clock,
  Download, RefreshCw, SortAsc, SortDesc, Search,
  TrendingUp, BadgeCheck, Home, Tag, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle,
  IndianRupee, Building2, Map, Phone, Mail, Calendar as CalendarIcon
} from "lucide-react";

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

// Custom hooks
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

const useFilterAndSortOrders = (orders, filterStatus, filterPaymentStatus, searchTerm, sortConfig) => {
  return useMemo(() => {
    if (!orders.length) return [];

    let filtered = [...orders];
    
    if (filterStatus !== 'All') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }
    
    if (filterPaymentStatus !== 'All') {
      filtered = filtered.filter(o => o.paymentStatus === filterPaymentStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(o =>
        (o._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.deliveryAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.deliveryAddress?.phone || '').includes(searchTerm)
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'grandTotal') { aVal = a.grandTotal || 0; bVal = b.grandTotal || 0; }
      else if (sortConfig.key === 'createdAt') { aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); }
      else if (sortConfig.key === 'itemsCount') { aVal = a.items?.length || 0; bVal = b.items?.length || 0; }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, filterStatus, filterPaymentStatus, searchTerm, sortConfig]);
};

const usePagination = (items, initialItemsPerPage = 10) => {
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

// Components
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

const SearchBar = ({ searchTerm, setSearchTerm, clearSearch }) => (
  <div className="relative flex-1 max-w-md">
    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search by order ID, customer name, phone..."
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
    delivered:      { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Delivered' },
    pending:        { icon: Clock,        color: 'text-yellow-400 bg-yellow-500/10', label: 'Pending' },
    processing:     { icon: Truck,        color: 'text-blue-400 bg-blue-500/10',   label: 'Processing' },
    cancelled:      { icon: XCircle,      color: 'text-red-400 bg-red-500/10',     label: 'Cancelled' }
  };
  const { icon: Icon, color, label } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
      <Icon size={12} />{label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const config = {
    paid:   { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Paid' },
    unpaid: { icon: CreditCard,  color: 'text-red-400 bg-red-500/10',    label: 'Unpaid' }
  };
  const { icon: Icon, color, label } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
      <Icon size={12} />{label}
    </span>
  );
};

const PageHeader = ({ icon: Icon, title, subtitle, vendorId, onBack }) => (
  <div className="relative mb-8">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/5 rounded-3xl -z-10 blur-3xl" />
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
          <ChevronLeft size={20} className="text-white" />
        </button>
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
            <Building2 size={14} />Vendor ID: {vendorId}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const StatsCard = ({ orders }) => {
  const stats = useMemo(() => [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Revenue', value: `₹${orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0).toLocaleString()}`, icon: IndianRupee, color: 'from-blue-500 to-indigo-500' }
  ], [orders]);

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

const FilterBar = ({ filterStatus, setFilterStatus, filterPaymentStatus, setFilterPaymentStatus }) => (
  <div className="flex flex-wrap items-center gap-3 mb-6">
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Filter size={16} className="text-emerald-400" />
      <span className="font-medium">Order Status:</span>
    </div>
    {['All', 'pending', 'delivered'].map(status => (
      <button
        key={status}
        onClick={() => setFilterStatus(status)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
          ${filterStatus === status
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
            : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
      >
        {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    ))}
    
    <div className="flex items-center gap-2 text-sm text-gray-400 ml-4">
      <CreditCard size={16} className="text-emerald-400" />
      <span className="font-medium">Payment:</span>
    </div>
    {['All', 'paid', 'unpaid'].map(status => (
      <button
        key={status}
        onClick={() => setFilterPaymentStatus(status)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
          ${filterPaymentStatus === status
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
            : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
      >
        {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    ))}
  </div>
);

const ActionBar = ({ searchTerm, setSearchTerm, clearSearch, exportToCSV, fetchOrders, loadingFetch }) => (
  <div className="flex flex-wrap items-center gap-3 mb-6">
    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} clearSearch={clearSearch} />
    <div className="flex items-center gap-2 ml-auto">
      <button onClick={exportToCSV}
        className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Export to CSV">
        <Download size={18} />
      </button>
      <button onClick={fetchOrders}
        className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all" title="Refresh">
        <RefreshCw size={18} className={loadingFetch ? 'animate-spin' : ''} />
      </button>
    </div>
  </div>
);

// Order Detail Modal
const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0d1b13] rounded-2xl border border-green-500/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0d1b13] border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Order Details</h3>
                <p className="text-xs text-gray-400 font-mono">ID: {order._id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Order Status</p>
              <StatusBadge status={order.status} />
              <p className="text-xs text-gray-400 mt-2">Payment Status</p>
              <PaymentStatusBadge status={order.paymentStatus} />
              {order.otp && (
                <>
                  <p className="text-xs text-gray-400 mt-2">Delivery OTP</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">{order.otp}</p>
                </>
              )}
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Order Type</p>
              <p className="text-sm text-white font-semibold capitalize">{order.orderedBy}</p>
              <p className="text-xs text-gray-400 mt-2">Delivery Type</p>
              <p className="text-sm text-white font-semibold capitalize">{order.deliveryType === 'live_location' ? 'Live Location' : 'Address'}</p>
            </div>
          </div>
          
          {/* Delivery Details */}
          {order.deliveryType === 'address' && order.deliveryAddress && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" />
                Delivery Address
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-white"><span className="text-gray-400">Name:</span> {order.deliveryAddress.fullName}</p>
                <p className="text-white"><span className="text-gray-400">Phone:</span> {order.deliveryAddress.phone}</p>
                <p className="text-white"><span className="text-gray-400">Address:</span> {order.deliveryAddress.flatNo}, {order.deliveryAddress.area}</p>
                <p className="text-white"><span className="text-gray-400">City:</span> {order.deliveryAddress.city} - {order.deliveryAddress.pincode}</p>
              </div>
            </div>
          )}
          
          {order.deliveryType === 'live_location' && order.liveLocation && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Map size={16} className="text-emerald-400" />
                Live Location
              </h4>
              <p className="text-sm text-white">Latitude: {order.liveLocation.latitude}</p>
              <p className="text-sm text-white">Longitude: {order.liveLocation.longitude}</p>
              <a 
                href={`https://www.google.com/maps?q=${order.liveLocation.latitude},${order.liveLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MapPin size={14} />
                Open in Google Maps
              </a>
            </div>
          )}
          
          {/* Items */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <h4 className="text-sm font-bold text-white p-4 border-b border-white/10 flex items-center gap-2">
              <Package size={16} className="text-emerald-400" />
              Order Items ({order.items?.length || 0})
            </h4>
            <div className="divide-y divide-white/10">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    {item.productId?.image && (
                      <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.productId?.name}</p>
                    <p className="text-xs text-gray-400">₹{item.productId?.price}/{item.productId?.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-emerald-400">₹{item.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex justify-between items-center">
                <p className="font-bold text-white">Grand Total</p>
                <p className="text-xl font-bold text-emerald-400">₹{order.grandTotal?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* Timestamps */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
            <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
            {order.updatedAt !== order.createdAt && <p className="mt-1">Last Updated: {new Date(order.updatedAt).toLocaleString()}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Table View
const TableView = ({ paginatedItems, handleSort, sortConfig, viewOrder }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-white/10 border-b border-white/10">
            {[
              { key: '_id', label: 'Order ID', icon: <Tag size={14} /> },
              { key: 'itemsCount', label: 'Items', icon: <Package size={14} /> },
              { key: 'grandTotal', label: 'Total', icon: <IndianRupee size={14} /> },
              { key: 'status', label: 'Status', icon: <CheckCircle size={14} /> },
              { key: 'paymentStatus', label: 'Payment', icon: <CreditCard size={14} /> },
              { key: 'createdAt', label: 'Order Date', icon: <CalendarIcon size={14} /> },
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
          {paginatedItems.map((order) => (
            <tr key={order._id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group">
              <td className="px-4 py-4">
                <span className="font-mono text-sm font-semibold text-white">{order._id.slice(-8)}</span>
                <p className="text-xs text-gray-500 capitalize">{order.orderedBy}</p>
               </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white">{order.items?.length || 0} items</p>
               </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-white">₹{order.grandTotal?.toLocaleString() || 0}</p>
               </td>
              <td className="px-4 py-4"><StatusBadge status={order.status} /> </td>
              <td className="px-4 py-4"><PaymentStatusBadge status={order.paymentStatus} /> </td>
              <td className="px-4 py-4 text-sm text-gray-400">
                <div className="flex items-center gap-1"><CalendarIcon size={12} />{new Date(order.createdAt).toLocaleDateString()}</div>
               </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => viewOrder(order)}
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
  </div>
);

// Main Component
const SingleVendorProductOrders = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState({ fetch: false });
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch } = useDebouncedSearch('', 300);

  const filteredAndSortedOrders = useFilterAndSortOrders(orders, filterStatus, filterPaymentStatus, debouncedSearchTerm, sortConfig);

  const { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage }
    = usePagination(filteredAndSortedOrders, 10);

  const fetchOrders = useCallback(async () => {
    if (!vendorId) return;
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/order/vendor/${vendorId}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch vendor orders');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [vendorId]);

  useEffect(() => {
    if (vendorId) {
      fetchOrders();
    }
  }, [vendorId, fetchOrders]);

  const viewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ['Order ID', 'Items Count', 'Grand Total', 'Status', 'Payment Status', 'Order Date', 'Delivery Type'];
    const csvData = filteredAndSortedOrders.map(o => [
      o._id, o.items?.length || 0, o.grandTotal || 0,
      o.status, o.paymentStatus, new Date(o.createdAt).toLocaleDateString(), o.deliveryType
    ]);
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_orders_${vendorId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredAndSortedOrders, vendorId]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#07120c] p-3 sm:p-4 md:p-6 lg:p-8">
      <PageHeader
        icon={Building2}
        title="Vendor Orders"
        subtitle={`${orders.length} total orders`}
        vendorId={vendorId}
        onBack={handleBack}
      />

      <StatsCard orders={orders} />

      <ActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearSearch={clearSearch}
        exportToCSV={exportToCSV}
        fetchOrders={fetchOrders}
        loadingFetch={loading.fetch}
      />

      <FilterBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPaymentStatus={filterPaymentStatus}
        setFilterPaymentStatus={setFilterPaymentStatus}
      />

      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Package size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Package size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No orders found for this vendor</p>
          <p className="text-sm text-gray-400">
            {debouncedSearchTerm ? 'Try adjusting your search' : filterStatus !== 'All' ? 'Try a different filter' : ''}
          </p>
          {(debouncedSearchTerm || filterStatus !== 'All' || filterPaymentStatus !== 'All') && (
            <button
              onClick={() => { clearSearch(); setFilterStatus('All'); setFilterPaymentStatus('All'); }}
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
            handleSort={handleSort}
            sortConfig={sortConfig}
            viewOrder={viewOrder}
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
                  {filterStatus === 'All' ? 'Total Orders' : `${filterStatus} Orders`}
                </p>
                <p className="text-xs text-gray-400">
                  {filterStatus === 'All' ? 'Across all statuses' : 'Filtered by status'}
                  {debouncedSearchTerm && ` • Search: "${debouncedSearchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Page Total</p>
                <p className="font-bold text-white">
                  ₹{paginatedItems.reduce((acc, o) => acc + (o.grandTotal || 0), 0).toLocaleString()}
                </p>
              </div>
              <Sparkles size={20} className="text-emerald-400" />
            </div>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }}
        order={selectedOrder}
      />
    </div>
  );
};

export default SingleVendorProductOrders;