import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  ArrowLeft, Building2, Calendar, Clock, User, 
  CheckCircle, XCircle, AlertCircle, Eye,
  Phone, Mail, MapPin, IndianRupee, CreditCard,
  Sparkles, BadgeCheck, TrendingUp, RefreshCw,
  Home, Users, Tag, Filter, Search, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  SortAsc, SortDesc, Download
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
          {[5, 10, 20, 30, 50].map(size => (
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

const VendorBookings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchVendorBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/vendorbookings/${id}`);
      setBookings(data.data || []);
      
      // Extract vendor info from first booking if available
      if (data.data && data.data.length > 0) {
        setVendor(data.data[0].vendorId);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error', 'Failed to fetch vendor bookings');
      navigate('/dashboard/vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVendorBookings();
    }
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortConfig]);

  const viewBooking = (bookingId) => {
    navigate(`/dashboard/bookings/${bookingId}`);
  };

  const viewHostel = (hostelId) => {
    navigate(`/dashboard/hostels/${hostelId}`);
  };

  const getUniqueFilters = () => {
    const statuses = ['All', ...new Set(bookings.map(b => b.status).filter(Boolean))];
    return statuses;
  };

  const filteredAndSortedBookings = () => {
    let filtered = filter === 'All' 
      ? bookings 
      : bookings.filter(b => b.status === filter);

    if (searchTerm) {
      filtered = filtered.filter(b => 
        (b.bookingReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.hostelId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.roomType || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'hostelId') {
        aVal = a.hostelId?.name || '';
        bVal = b.hostelId?.name || '';
      } else if (sortConfig.key === 'userId') {
        aVal = a.userId?.name || '';
        bVal = b.userId?.name || '';
      } else if (sortConfig.key === 'totalAmount') {
        aVal = a.totalAmount || 0;
        bVal = b.totalAmount || 0;
      } else if (sortConfig.key === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else if (sortConfig.key === 'startDate') {
        aVal = new Date(a.startDate).getTime();
        bVal = new Date(b.startDate).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getPaginatedData = () => {
    const filtered = filteredAndSortedBookings();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      data: filtered.slice(start, end),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const { data: paginatedBookings, totalItems, totalPages } = getPaginatedData();

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    const data = filteredAndSortedBookings();
    const headers = ['Booking Ref', 'Hostel', 'Customer', 'Room Type', 'Share Type', 'Booking Type', 'Total Amount', 'Status', 'Booking Date', 'Start Date'];
    
    const csvData = data.map(b => [
      b.bookingReference || 'N/A',
      b.hostelId?.name || 'N/A',
      b.userId?.name || 'N/A',
      b.roomType || 'N/A',
      b.shareType || 'N/A',
      b.bookingType || 'N/A',
      b.totalAmount || 0,
      b.status || 'N/A',
      new Date(b.createdAt).toLocaleDateString(),
      b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_${vendor?.name || id}_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const StatusBadge = ({ status }) => {
    const config = {
      confirmed: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Confirmed' },
      pending: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/10', label: 'Pending' },
      completed: { icon: CreditCard, color: 'text-blue-400 bg-blue-500/10', label: 'Completed' },
      cancelled: { icon: XCircle, color: 'text-red-400 bg-red-500/10', label: 'Cancelled' },
      form_submitted: { icon: AlertCircle, color: 'text-purple-400 bg-purple-500/10', label: 'Form Submitted' }
    };
    
    const { icon: Icon, color, label } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  const StatsCard = () => {
    const stats = [
      { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'from-emerald-500 to-emerald-600' },
      { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'from-yellow-500 to-orange-500' },
      { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
      { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CreditCard, color: 'from-blue-500 to-indigo-500' }
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
        placeholder="Search by booking ref, hostel, customer..."
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
        case 'confirmed': return <CheckCircle size={14} />;
        case 'pending': return <Clock size={14} />;
        case 'completed': return <CreditCard size={14} />;
        case 'cancelled': return <XCircle size={14} />;
        case 'form_submitted': return <AlertCircle size={14} />;
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
            {status === 'form_submitted' ? 'Form Submitted' : status}
          </button>
        ))}
      </div>
    );
  };

  const ActionBar = () => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <SearchBar />
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={exportToCSV}
          className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
          title="Export to CSV"
        >
          <Download size={18} />
        </button>
        <button
          onClick={fetchVendorBookings}
          className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );

  const BookingsTable = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 border-b border-white/10">
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('bookingReference')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Tag size={14} />
                  Booking Ref
                  <SortIcon column="bookingReference" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('hostelId')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Building2 size={14} />
                  Hostel
                  <SortIcon column="hostelId" />
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
                  onClick={() => handleSort('roomType')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <Home size={14} />
                  Room
                  <SortIcon column="roomType" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('totalAmount')}
                  className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider group"
                >
                  <IndianRupee size={14} />
                  Amount
                  <SortIcon column="totalAmount" />
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
                  Booked On
                  <SortIcon column="createdAt" />
                </button>
              </th>
              <th className="px-4 py-4 text-right text-xs font-black text-emerald-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking) => (
              <tr 
                key={booking._id} 
                className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group"
              >
                <td className="px-4 py-4">
                  <div>
                    <span className="font-mono text-sm font-semibold text-white">
                      {booking.bookingReference || 'N/A'}
                    </span>
                    <p className="text-xs text-gray-500 capitalize">
                      {booking.bookingType}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden cursor-pointer"
                         onClick={() => viewHostel(booking.hostelId?._id)}>
                      {booking.hostelId?.images?.[0] ? (
                        <img src={`http://187.127.146.52:2003/${booking.hostelId.images[0]}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={14} className="text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => viewHostel(booking.hostelId?._id)}
                        className="font-semibold text-white text-sm hover:text-emerald-400 transition-colors"
                      >
                        {booking.hostelId?.name || 'N/A'}
                      </button>
                      <p className="text-xs text-gray-500 line-clamp-1">{booking.hostelId?.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-white text-sm">{booking.userId?.name || 'Guest User'}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm text-white">{booking.roomType || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{booking.shareType || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-white">₹{booking.totalAmount?.toLocaleString() || 0}</p>
                  {booking.monthlyAdvance > 0 && (
                    <p className="text-xs text-gray-500">Advance: ₹{booking.monthlyAdvance}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                  {booking.startDate && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <Clock size={10} />
                      Start: {new Date(booking.startDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => viewBooking(booking._id)}
                      className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 
                        text-white hover:shadow-lg transition-all opacity-100 group-hover:opacity-100"
                      title="View details"
                    >
                      <Eye size={14} />
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
          Showing {paginatedBookings.length} of {totalItems} bookings
        </span>
        <span className="text-gray-400">
          Total Revenue: ₹{paginatedBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString()}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/vendors')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Vendors
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
                flex items-center justify-center border border-white/20">
                <Building2 size={32} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-2">
                {vendor?.name || 'Vendor Bookings'}
                <BadgeCheck size={24} className="text-emerald-400" />
              </h1>
              <div className="flex items-center gap-4 mt-1">
                {vendor?.mobileNumber && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Phone size={12} />
                    {vendor.mobileNumber}
                  </p>
                )}
                {vendor?.email && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Mail size={12} />
                    {vendor.email}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/dashboard/vendors/${id}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 
                text-white font-semibold hover:shadow-lg transition-all"
            >
              View Vendor Details
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCard />
      
      {/* Filters and Actions */}
      <ActionBar />
      <FilterBar />
      
      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar size={32} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg mb-2">No bookings found</p>
          <p className="text-sm text-gray-400">This vendor doesn't have any bookings yet</p>
        </div>
      ) : (
        <>
          <BookingsTable />
          
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
          
          {/* Summary Card */}
          <div className="mt-6 bg-white/10 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
                flex items-center justify-center text-white font-bold text-lg border border-white/20">
                {totalItems}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {filter === 'All' ? 'Total Bookings' : `${filter} Bookings`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'All' ? `All bookings for ${vendor?.name}` : `Filtered by status`}
                  {searchTerm && ` • Search: "${searchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Revenue</p>
                <p className="font-bold text-white">
                  ₹{paginatedBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString()}
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

export default VendorBookings;