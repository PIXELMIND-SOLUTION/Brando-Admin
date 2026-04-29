import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Calendar,
  CheckCircle, XCircle, Clock, AlertCircle, Edit, Trash2,
  Image as ImageIcon, Users, Star, IndianRupee, Home,
  Camera, Bell, Shield, UserCheck, UserX, RefreshCw,
  Sparkles, BadgeCheck, TrendingUp, Eye, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

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
          {[5, 10, 20, 30].map(size => (
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

const SingleVendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Pagination states for hostels
  const [hostelsPage, setHostelsPage] = useState(1);
  const [hostelsPerPage, setHostelsPerPage] = useState(6);

  // Pagination states for notifications
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsPerPage, setNotificationsPerPage] = useState(10);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/getsinglevendor/${id}`);
      setVendor(data.data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch vendor details',
        background: '#0f172a',
        color: '#fff',
      });
      navigate('/dashboard/vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  // Reset pages when tab changes
  useEffect(() => {
    setHostelsPage(1);
    setNotificationsPage(1);
  }, [activeTab]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/deletevendor/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Vendor has been deleted',
          background: '#0f172a',
          color: '#fff',
        });
        navigate('/dashboard/vendors');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete vendor',
          background: '#0f172a',
          color: '#fff',
        });
      }
    }
  };

  // Get paginated hostels
  const getPaginatedHostels = () => {
    if (!vendor?.hostels) return { data: [], totalItems: 0, totalPages: 0 };
    const start = (hostelsPage - 1) * hostelsPerPage;
    const end = start + hostelsPerPage;
    const paginatedData = vendor.hostels.slice(start, end);
    return {
      data: paginatedData,
      totalItems: vendor.hostels.length,
      totalPages: Math.ceil(vendor.hostels.length / hostelsPerPage)
    };
  };

  // Get paginated notifications
  const getPaginatedNotifications = () => {
    if (!vendor?.notifications) return { data: [], totalItems: 0, totalPages: 0 };
    const start = (notificationsPage - 1) * notificationsPerPage;
    const end = start + notificationsPerPage;
    const paginatedData = vendor.notifications.slice(start, end);
    return {
      data: paginatedData,
      totalItems: vendor.notifications.length,
      totalPages: Math.ceil(vendor.notifications.length / notificationsPerPage)
    };
  };

  const { data: paginatedHostels, totalItems: totalHostels, totalPages: totalHostelsPages } = getPaginatedHostels();
  const { data: paginatedNotifications, totalItems: totalNotifications, totalPages: totalNotificationsPages } = getPaginatedNotifications();

  const StatusBadge = ({ status }) => {
    const config = {
      approved: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-400 bg-red-500/10', label: 'Rejected' },
      pending: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/10', label: 'Pending' }
    };

    const { icon: Icon, color, label } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${color}`}>
        <Icon size={16} />
        {label}
      </span>
    );
  };

  const InfoCard = ({ icon: Icon, title, value, subValue }) => {
    const isComponent = typeof value !== "string" && typeof value !== "number";

    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 
    p-4 flex flex-col h-full min-h-[120px] hover:shadow-lg transition-all">

        {/* Top Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex-shrink-0">
            <Icon size={18} />
          </div>
        </div>

        {/* Content (IMPORTANT: flex-1 for equal height) */}
        <div className="flex flex-col flex-1 justify-between">

          {/* Value */}
          <div className="text-white font-bold text-base sm:text-lg leading-tight break-words">
            {isComponent ? value : value}
          </div>

          {/* Bottom Section */}
          <div className="mt-2">
            <p className="text-xs text-gray-400">{title}</p>

            {subValue && (
              <p className="text-xs text-emerald-400 mt-1">
                {subValue}
              </p>
            )}
          </div>

        </div>
      </div>
    );
  };

  const HostelCard = ({ hostel }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:shadow-xl transition-all group">
      <div className="relative h-48 bg-white/5">
        <img
          src={hostel.images?.[0] ? `http://187.127.146.52:2003/${hostel.images[0]}` : '/api/placeholder/400/300'}
          alt={hostel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={() => navigate(`/dashboard/hostels/${hostel._id}`)}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80 transition-all"
          >
            <Eye size={14} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-semibold">{hostel.rating || 'N/A'}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-1">{hostel.name}</h3>

        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-emerald-400 flex-shrink-0" />
            <span className="line-clamp-1">{hostel.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <IndianRupee size={14} className="text-emerald-400 flex-shrink-0" />
            <span>Advance: ₹{hostel.monthlyAdvance}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={14} className="text-emerald-400 flex-shrink-0" />
            <span>{hostel.sharings?.length || 0} sharing options</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={10} />
            {new Date(hostel.createdAt).toLocaleDateString()}
          </div>
          <span className="text-xs px-2 py-1 bg-white/10 rounded-lg text-emerald-400">
            {hostel.categoryId?.name || 'Uncategorized'}
          </span>
        </div>
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
              <Building2 size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <Building2 size={48} className="text-emerald-400 mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Vendor not found</p>
          <button
            onClick={() => navigate('/dashboard/vendors')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
                flex items-center justify-center border border-white/20 overflow-hidden">
                {vendor.hostelImage ? (
                  <img
                    src={`http://187.127.146.52:2003/${vendor.hostelImage}`}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/80/80';
                    }}
                  />
                ) : (
                  <Building2 size={32} className="text-emerald-400" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-2">
                {vendor.name}
                <BadgeCheck size={24} className="text-emerald-400" />
              </h1>
              <p className="text-sm text-emerald-400 flex items-center gap-2 mt-1">
                <TrendingUp size={14} />
                Vendor since {new Date(vendor.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/dashboard/vendors/edit/${vendor._id}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 
                text-white font-semibold hover:shadow-lg transition-all"
            >
              <Edit size={18} />
              Edit Vendor
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 
                text-white font-semibold hover:shadow-lg transition-all"
            >
              <Trash2 size={18} />
              Delete
            </button>
            <button
              onClick={fetchVendorDetails}
              className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <InfoCard
          icon={Building2}
          title="Total Hostels"
          value={vendor.totalHostels || 0}
        />
        <InfoCard
          icon={Phone}
          title="Mobile Number"
          value={vendor.mobileNumber || 'N/A'}
          subValue={vendor.otpVerified ? 'OTP Verified' : 'OTP Not Verified'}
        />
        <InfoCard
          icon={Mail}
          title="Email"
          value={vendor.email || 'Not provided'}
        />
        <InfoCard
          icon={Shield}
          title="Approval Status"
          value={<StatusBadge status={vendor.approvalStatus} />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'details'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          Vendor Details
        </button>
        <button
          onClick={() => setActiveTab('hostels')}
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'hostels'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          Hostels ({vendor.totalHostels || 0})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'notifications'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          Notifications ({vendor.notifications?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-emerald-400" />
                Personal Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Full Name</span>
                  <span className="text-white font-medium">{vendor.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Mobile Number</span>
                  <span className="text-white font-medium">{vendor.mobileNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Email Address</span>
                  <span className="text-white font-medium">{vendor.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">OTP Verification</span>
                  <span className={vendor.otpVerified ? 'text-green-400' : 'text-yellow-400'}>
                    {vendor.otpVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Registration Completed</span>
                  <span className={vendor.registrationCompleted ? 'text-green-400' : 'text-yellow-400'}>
                    {vendor.registrationCompleted ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Account Status</span>
                  <span className={vendor.isActive ? 'text-green-400' : 'text-red-400'}>
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Information */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield size={20} className="text-emerald-400" />
                Approval Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Approval Status</span>
                  <StatusBadge status={vendor.approvalStatus} />
                </div>
                {vendor.approvedAt && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Approved At</span>
                    <span className="text-white font-medium">
                      {new Date(vendor.approvedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {vendor.rejectionReason && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Rejection Reason</span>
                    <span className="text-red-400 font-medium">{vendor.rejectionReason}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Account Created</span>
                  <span className="text-white font-medium">
                    {new Date(vendor.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white font-medium">
                    {new Date(vendor.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hostels' && (
          <div className="space-y-4">
            {vendor.hostels && vendor.hostels.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedHostels.map((hostel) => (
                    <HostelCard key={hostel._id} hostel={hostel} />
                  ))}
                </div>

                {/* Hostels Pagination */}
                {totalHostelsPages > 1 && (
                  <Pagination
                    currentPage={hostelsPage}
                    totalPages={totalHostelsPages}
                    onPageChange={setHostelsPage}
                    itemsPerPage={hostelsPerPage}
                    totalItems={totalHostels}
                    onItemsPerPageChange={(newSize) => {
                      setHostelsPerPage(newSize);
                      setHostelsPage(1);
                    }}
                  />
                )}

                {/* Hostels Summary */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
                        flex items-center justify-center text-white font-bold text-lg border border-white/20">
                        {totalHostels}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Total Hostels</p>
                        <p className="text-xs text-gray-400">
                          Showing {paginatedHostels.length} of {totalHostels} hostels
                        </p>
                      </div>
                    </div>
                    <Sparkles size={20} className="text-emerald-400" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <Building2 size={48} className="text-emerald-400 mx-auto mb-4" />
                <p className="text-white font-bold text-lg">No hostels found</p>
                <p className="text-sm text-gray-400">This vendor hasn't added any hostels yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {vendor.notifications && vendor.notifications.length > 0 ? (
              <>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-4 bg-white/10 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Bell size={18} className="text-emerald-400" />
                      Notification History
                    </h2>
                  </div>
                  <div className="divide-y divide-white/10">
                    {paginatedNotifications.map((notification, index) => (
                      <div key={notification._id || index} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'error' ? 'bg-red-500' :
                                  notification.type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                              }`} />
                            <span className="text-sm font-semibold text-white">
                              {notification.type === 'success' ? 'Success' :
                                notification.type === 'error' ? 'Error' :
                                  notification.type === 'info' ? 'Info' : 'Notification'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{notification.message}</p>
                        {!notification.read && (
                          <span className="text-xs text-emerald-400 mt-2 inline-block">Unread</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications Pagination */}
                {totalNotificationsPages > 1 && (
                  <Pagination
                    currentPage={notificationsPage}
                    totalPages={totalNotificationsPages}
                    onPageChange={setNotificationsPage}
                    itemsPerPage={notificationsPerPage}
                    totalItems={totalNotifications}
                    onItemsPerPageChange={(newSize) => {
                      setNotificationsPerPage(newSize);
                      setNotificationsPage(1);
                    }}
                  />
                )}

                {/* Notifications Summary */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
                        flex items-center justify-center text-white font-bold text-lg border border-white/20">
                        {totalNotifications}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Total Notifications</p>
                        <p className="text-xs text-gray-400">
                          Showing {paginatedNotifications.length} of {totalNotifications} notifications
                        </p>
                      </div>
                    </div>
                    <Sparkles size={20} className="text-emerald-400" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <Bell size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-white font-bold text-lg">No notifications found</p>
                <p className="text-sm text-gray-400">No notifications for this vendor yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleVendorDetails;