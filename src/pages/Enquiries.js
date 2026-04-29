import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, Eye, Trash2, Calendar, User, 
  Sparkles, Filter, X, Table2, CheckCircle,
  Grid3x3, Download, RefreshCw, CheckCircle as CheckCircleIcon,
  SortAsc, SortDesc, Search, TrendingUp,
  BadgeCheck, Clock, Home, Tag, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle,
  Mail, Phone, Building2, Edit, XCircle
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

const Enquiries = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, update: false, delete: false });
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fetchTickets = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/getalltickets`);
      setTickets(data.data || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch tickets');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortConfig]);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    const result = await Swal.fire({
      title: 'Update Status?',
      text: `Are you sure you want to mark this ticket as ${newStatus}?`,
      icon: 'question',
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
      setLoading(prev => ({ ...prev, update: true }));
      await axios.put(`${API}/updateticket/${ticketId}`, { status: newStatus });
      
      showAlert('success', 'Updated!', `Ticket marked as ${newStatus}`, 2000);
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Update failed', error.response?.data?.message || "Could not update ticket");
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleDelete = async (ticketId) => {
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
      await axios.delete(`${API}/deleteticket/${ticketId}`);
      
      showAlert('success', 'Deleted!', 'Ticket has been deleted', 2000);
      fetchTickets();
      setSelectedTickets(prev => prev.filter(selectedId => selectedId !== ticketId));
      if (selectedTicket && selectedTicket._id === ticketId) {
        setShowModal(false);
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete ticket");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTickets.length === 0) {
      showAlert('warning', 'No selection', 'Please select tickets to delete');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `You are about to delete ${selectedTickets.length} tickets`,
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
      
      for (const id of selectedTickets) {
        await axios.delete(`${API}/deleteticket/${id}`);
      }
      
      showAlert('success', 'Deleted!', `${selectedTickets.length} tickets deleted`, 2000);
      fetchTickets();
      setSelectedTickets([]);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', 'Could not delete some tickets');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const viewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const getUniqueFilters = () => {
    const statuses = ['All', ...new Set(tickets.map(t => t.status).filter(Boolean))];
    return statuses;
  };

  const filteredAndSortedTickets = () => {
    let filtered = filter === 'All' 
      ? tickets 
      : tickets.filter(t => t.status === filter);

    if (searchTerm) {
      filtered = filtered.filter(t => 
        (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.status || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'userId') {
        aVal = a.userId?.name || '';
        bVal = b.userId?.name || '';
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
    const filtered = filteredAndSortedTickets();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      data: filtered.slice(start, end),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const { data: paginatedTickets, totalItems, totalPages } = getPaginatedData();

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedTickets.length === paginatedTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(paginatedTickets.map(t => t._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedTickets(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const exportToCSV = () => {
    const data = filteredAndSortedTickets();
    const headers = ['Title', 'Customer', 'Message', 'Status', 'Created Date', 'Last Updated'];
    
    const csvData = data.map(t => [
      t.title || 'N/A',
      t.userId?.name || 'N/A',
      t.message || 'N/A',
      t.status || 'N/A',
      new Date(t.createdAt).toLocaleString(),
      new Date(t.updatedAt).toLocaleString()
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
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
      { label: 'Total Tickets', value: tickets.length, icon: MessageCircle, color: 'from-emerald-500 to-emerald-600' },
      { label: 'Open', value: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: 'from-yellow-500 to-orange-500' },
      { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, icon: Clock, color: 'from-blue-500 to-indigo-500' },
      { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' }
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
        onClick={() => setViewMode('table')}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
          viewMode === 'table' 
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
        placeholder="Search by title, message, customer..."
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
        case 'open': return <AlertCircle size={14} />;
        case 'in-progress': return <Clock size={14} />;
        case 'resolved': return <CheckCircleIcon size={14} />;
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
            {status === 'in-progress' ? 'In Progress' : status}
          </button>
        ))}
      </div>
    );
  };

  const ActionBar = () => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <SearchBar />
      <div className="flex items-center gap-2 ml-auto">
        {selectedTickets.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white 
              font-medium text-sm hover:bg-red-600 transition-all shadow-lg"
          >
            <Trash2 size={16} />
            Delete ({selectedTickets.length})
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
          onClick={fetchTickets}
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
      open: { icon: AlertCircle, color: 'text-yellow-400 bg-yellow-500/10', label: 'Open' },
      'in-progress': { icon: Clock, color: 'text-blue-400 bg-blue-500/10', label: 'In Progress' },
      resolved: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Resolved' }
    };
    
    const { icon: Icon, color, label } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
        <Icon size={12} />
        {label}
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
                  checked={selectedTickets.length === paginatedTickets.length && paginatedTickets.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Tag size={14} />
                  Title
                  <SortIcon column="title" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('userId')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <User size={14} />
                  Customer
                  <SortIcon column="userId" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('message')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <MessageCircle size={14} />
                  Message
                  <SortIcon column="message" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <CheckCircle size={14} />
                  Status
                  <SortIcon column="status" />
                </button>
              </th>
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
              <th className="px-4 py-4 text-right text-xs font-black text-emerald-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map((ticket) => (
              <tr 
                key={ticket._id} 
                className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket._id)}
                    onChange={() => toggleSelect(ticket._id)}
                    className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500 focus:ring-emerald-500"
                  />
                 </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-semibold text-white">{ticket.title || 'N/A'}</p>
                  </div>
                 </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-white text-sm">{ticket.userId?.name || 'Guest User'}</p>
                  </div>
                 </td>
                <td className="px-4 py-4 max-w-md">
                  <p className="text-sm text-gray-300 line-clamp-2">{ticket.message || 'N/A'}</p>
                 </td>
                <td className="px-4 py-4">
                  <StatusBadge status={ticket.status} />
                 </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                 </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => viewTicket(ticket)}
                      className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 
                        text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                    {ticket.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(ticket._id, 'resolved')}
                        disabled={loading.update}
                        className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 
                          text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100"
                        title="Mark as Resolved"
                      >
                        <CheckCircleIcon size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(ticket._id)}
                      disabled={loading.delete}
                      className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 
                        text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100"
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
          Showing {paginatedTickets.length} of {totalItems} tickets
        </span>
        <span className="text-gray-400">
          {selectedTickets.length} selected
        </span>
      </div>
    </div>
  );

  // Ticket Details Modal
  const TicketModal = () => {
    if (!selectedTicket) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
           onClick={() => setShowModal(false)}>
        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
             onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-emerald-400" />
              Ticket Details
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Ticket Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ticket ID</p>
                <p className="font-mono text-white font-semibold">{selectedTicket._id}</p>
              </div>
              <StatusBadge status={selectedTicket.status} />
            </div>
            
            {/* Title */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Title</p>
              <p className="text-white font-semibold text-lg">{selectedTicket.title}</p>
            </div>
            
            {/* Customer Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Customer Information</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 
                  flex items-center justify-center text-white font-bold">
                  {selectedTicket.userId?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-white font-semibold">{selectedTicket.userId?.name || 'Guest User'}</p>
                  <p className="text-xs text-gray-400">User ID: {selectedTicket.userId?._id || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Message */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Message</p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
            </div>
            
            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-400">Created At</p>
                <p className="text-white text-sm">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-white text-sm">{new Date(selectedTicket.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              {selectedTicket.status !== 'resolved' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedTicket._id, 'resolved');
                    setShowModal(false);
                  }}
                  disabled={loading.update}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 
                    text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon size={18} />
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(selectedTicket._id);
                  setShowModal(false);
                }}
                disabled={loading.delete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 
                  text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Ticket
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
        icon={MessageCircle} 
        title="Enquiries Management" 
        subtitle={`${tickets.length} total tickets • ${tickets.filter(t => t.status === 'open').length} open`}
      />

      <StatsCard />
      <ActionBar />
      <FilterBar />
     
      
      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageCircle size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : paginatedTickets.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No tickets found</p>
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
          <TableView />
          
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
                  {filter === 'All' ? 'Total Tickets' : `${filter} Tickets`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'All' ? 'Across all statuses' : `Filtered by status`}
                  {searchTerm && ` • Search: "${searchTerm}"`}
                </p>
              </div>
            </div>
            <Sparkles size={20} className="text-emerald-400" />
          </div>
        </>
      )}
      
      {/* Ticket Details Modal */}
      {showModal && <TicketModal />}
    </div>
  );
};

export default Enquiries;