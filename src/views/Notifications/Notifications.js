import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Trash2, Eye, CheckCircle, XCircle, Clock,
  RefreshCw, Filter, X, Search, SortAsc, SortDesc,
  Calendar, Building2, User, AlertCircle, MessageSquare,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Sparkles, BadgeCheck, TrendingUp, Download
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
                className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${
                  currentPage === page
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

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fetchNotifications = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/allnotifications`);
      setNotifications(data.data || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch notifications');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

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
      await axios.delete(`${API}/deletenotifications/${id}`);
      
      showAlert('success', 'Deleted!', 'Notification has been deleted', 2000);
      fetchNotifications();
      setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
      if (selectedNotification && selectedNotification._id === id) {
        setShowModal(false);
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete notification");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      showAlert('warning', 'No selection', 'Please select notifications to delete');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `You are about to delete ${selectedNotifications.length} notifications`,
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
      
      for (const id of selectedNotifications) {
        await axios.delete(`${API}/deletenotifications/${id}`);
      }
      
      showAlert('success', 'Deleted!', `${selectedNotifications.length} notifications deleted`, 2000);
      fetchNotifications();
      setSelectedNotifications([]);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', 'Could not delete some notifications');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const viewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const getUniqueFilters = () => {
    const types = ['All', ...new Set(notifications.map(n => n.type).filter(Boolean))];
    return types;
  };

  const filteredAndSortedNotifications = () => {
    let filtered = filter === 'All' 
      ? notifications 
      : notifications.filter(n => n.type === filter);

    if (searchTerm) {
      filtered = filtered.filter(n => 
        (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.vendorId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'vendorId') {
        aVal = a.vendorId?.name || '';
        bVal = b.vendorId?.name || '';
      } else if (sortConfig.key === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getPaginatedData = () => {
    const filtered = filteredAndSortedNotifications();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      data: filtered.slice(start, end),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const { data: paginatedNotifications, totalItems, totalPages } = getPaginatedData();

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === paginatedNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(paginatedNotifications.map(n => n._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const exportToCSV = () => {
    const data = filteredAndSortedNotifications();
    const headers = ['Title', 'Message', 'Type', 'Vendor', 'Status', 'Created Date', 'Expires Date'];
    
    const csvData = data.map(n => [
      n.title || 'N/A',
      n.message || 'N/A',
      n.type || 'N/A',
      n.vendorId?.name || 'N/A',
      n.isRead ? 'Read' : 'Unread',
      new Date(n.createdAt).toLocaleString(),
      n.expiresAt ? new Date(n.expiresAt).toLocaleString() : 'N/A'
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`;
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
      { label: 'Total Notifications', value: notifications.length, icon: Bell, color: 'from-emerald-500 to-emerald-600' },
      { label: 'Unread', value: notifications.filter(n => !n.isRead).length, icon: MessageSquare, color: 'from-yellow-500 to-orange-500' },
      { label: 'Read', value: notifications.filter(n => n.isRead).length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
      { label: 'Booking Updates', value: notifications.filter(n => n.type === 'hostel').length, icon: Building2, color: 'from-blue-500 to-indigo-500' }
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

  const SearchBar = () => (
    <div className="relative flex-1 max-w-md">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search by title, message, or vendor..."
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
      switch(filter) {
        case 'hostel': return <Building2 size={14} />;
        case 'booking': return <Calendar size={14} />;
        default: return <Filter size={14} />;
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter size={16} className="text-emerald-400" />
          <span className="font-medium">Filter by Type:</span>
        </div>
        {filters.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2
              ${filter === type 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
          >
            {getFilterIcon(type)}
            {type}
          </button>
        ))}
      </div>
    );
  };

  const ActionBar = () => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <SearchBar />
      <div className="flex items-center gap-2 ml-auto">
        {selectedNotifications.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white 
              font-medium text-sm hover:bg-red-600 transition-all shadow-lg"
          >
            <Trash2 size={16} />
            Delete ({selectedNotifications.length})
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
          onClick={fetchNotifications}
          className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading.fetch ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const ReadStatusBadge = ({ isRead }) => {
    if (isRead) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-green-400 bg-green-500/10">
          <CheckCircle size={12} />
          Read
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-yellow-400 bg-yellow-500/10">
        <Clock size={12} />
        Unread
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const config = {
      hostel: { icon: Building2, color: 'text-blue-400 bg-blue-500/10' },
      booking: { icon: Calendar, color: 'text-purple-400 bg-purple-500/10' }
    };
    
    const { icon: Icon, color } = config[type] || { icon: Bell, color: 'text-gray-400 bg-gray-500/10' };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
        <Icon size={12} />
        {type || 'General'}
      </span>
    );
  };

  const NotificationsTable = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 border-b border-white/10">
              <th className="px-4 py-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === paginatedNotifications.length && paginatedNotifications.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Bell size={14} />
                  Title
                  <SortIcon column="title" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('message')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <MessageSquare size={14} />
                  Message
                  <SortIcon column="message" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Filter size={14} />
                  Type
                  <SortIcon column="type" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('vendorId')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <User size={14} />
                  Vendor
                  <SortIcon column="vendorId" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">Status</th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Calendar size={14} />
                  Created
                  <SortIcon column="createdAt" />
                </button>
              </th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedNotifications.map((notification) => (
              <tr 
                key={notification._id} 
                className={`border-b border-white/5 hover:bg-white/10 transition-all duration-300 group ${
                  !notification.isRead ? 'bg-emerald-500/5' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => toggleSelect(notification._id)}
                    className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-semibold text-white">{notification.title || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-4 py-4 max-w-md">
                  <p className="text-sm text-gray-300 line-clamp-2">{notification.message || 'N/A'}</p>
                </td>
                <td className="px-4 py-4">
                  <TypeBadge type={notification.type} />
                </td>
                <td className="px-4 py-4">
                  {notification.vendorId ? (
                    <div>
                      <p className="text-sm text-white font-medium">{notification.vendorId.name}</p>
                      <p className="text-xs text-gray-500">{notification.vendorId.mobileNumber}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">System</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <ReadStatusBadge isRead={notification.isRead} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => viewNotification(notification)}
                      className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 
                        text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
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
          Showing {paginatedNotifications.length} of {totalItems} notifications
        </span>
        <span className="text-gray-400">
          {selectedNotifications.length} selected
        </span>
      </div>
    </div>
  );

  // Notification Details Modal
  const NotificationModal = () => {
    if (!selectedNotification) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
           onClick={() => setShowModal(false)}>
        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
             onClick={(e) => e.stopPropagation()}>
          
          <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell size={20} className="text-emerald-400" />
              Notification Details
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TypeBadge type={selectedNotification.type} />
                <ReadStatusBadge isRead={selectedNotification.isRead} />
              </div>
              <p className="text-xs text-gray-500">
                ID: {selectedNotification._id.slice(-8)}
              </p>
            </div>
            
            {/* Title */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Title</p>
              <p className="text-white font-semibold text-lg">{selectedNotification.title}</p>
            </div>
            
            {/* Message */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Message</p>
              <p className="text-gray-300 whitespace-pre-wrap">{selectedNotification.message}</p>
            </div>
            
            {/* Vendor Info */}
            {selectedNotification.vendorId && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <User size={14} />
                  Vendor Information
                </p>
                <div className="space-y-1">
                  <p className="text-white font-medium">{selectedNotification.vendorId.name}</p>
                  <p className="text-sm text-gray-400">{selectedNotification.vendorId.mobileNumber}</p>
                </div>
              </div>
            )}
            
            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Created At</p>
                <p className="text-white text-sm">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Expires At</p>
                <p className="text-white text-sm">
                  {selectedNotification.expiresAt 
                    ? new Date(selectedNotification.expiresAt).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
            
            {/* Read Status Info */}
            {selectedNotification.readAt && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Read At</p>
                <p className="text-white text-sm">{new Date(selectedNotification.readAt).toLocaleString()}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => handleDelete(selectedNotification._id)}
                disabled={loading.delete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 
                  text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Notification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <PageHeader 
        icon={Bell} 
        title="Notifications" 
        subtitle={`${notifications.length} total notifications • ${notifications.filter(n => !n.isRead).length} unread`}
      />

      <StatsCard />
      <ActionBar />
      <FilterBar />
     
      
      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bell size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedNotifications.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Bell size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No notifications found</p>
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
          <NotificationsTable />
          
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
                  {filter === 'All' ? 'Total Notifications' : `${filter} Notifications`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'All' ? 'Across all types' : `Filtered by type`}
                  {searchTerm && ` • Search: "${searchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Unread</p>
                <p className="font-bold text-white">
                  {paginatedNotifications.filter(n => !n.isRead).length}
                </p>
              </div>
              <Sparkles size={20} className="text-emerald-400" />
            </div>
          </div>
        </>
      )}
      
      {/* Notification Details Modal */}
      {showModal && <NotificationModal />}
    </div>
  );
};

export default Notifications;