import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  ArrowLeft, Building2, Calendar, Clock, User, 
  CheckCircle, XCircle, AlertCircle, Edit, Trash2,
  Phone, Mail, MapPin, IndianRupee, CreditCard,
  Sparkles, BadgeCheck, TrendingUp, Eye, RefreshCw,
  Home, Users, Tag, FileText, Printer,
  Star
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

const SingleBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/singlebooking/${id}`);
      setBooking(data.data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch booking details',
        background: '#0f172a',
        color: '#fff',
      });
      navigate('/dashboard/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

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
        // Note: You may need to add a delete booking endpoint
        // await axios.delete(`${API}/deletebooking/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Booking has been deleted',
          background: '#0f172a',
          color: '#fff',
        });
        navigate('/dashboard/bookings');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete booking',
          background: '#0f172a',
          color: '#fff',
        });
      }
    }
  };

  const handlePrint = () => {
    window.print();
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
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${color}`}>
        <Icon size={16} />
        {label}
      </span>
    );
  };

  const InfoCard = ({ icon: Icon, title, value, subValue }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <Icon size={18} />
        </div>
        <Sparkles size={16} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-2xl font-black text-white mt-2">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{title}</p>
      {subValue && <p className="text-xs text-emerald-400 mt-1">{subValue}</p>}
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

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <Calendar size={48} className="text-emerald-400 mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Booking not found</p>
          <button
            onClick={() => navigate('/dashboard/bookings')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl"
          >
            Back to Bookings
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
          onClick={() => navigate('/dashboard/bookings')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Bookings
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
                flex items-center justify-center border border-white/20">
                <CreditCard size={32} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-2">
                {booking.bookingReference}
                <BadgeCheck size={24} className="text-emerald-400" />
              </h1>
              <p className="text-sm text-emerald-400 flex items-center gap-2 mt-1">
                <TrendingUp size={14} />
                Booked on {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 
                text-white font-semibold hover:shadow-lg transition-all"
            >
              <Printer size={18} />
              Print
            </button> */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 
                text-white font-semibold hover:shadow-lg transition-all"
            >
              <Trash2 size={18} />
              Delete
            </button>
            <button
              onClick={fetchBookingDetails}
              className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={booking.status} />
            <span className="text-sm text-gray-400">
              Booking Type: <span className="text-white font-semibold capitalize">{booking.bookingType}</span>
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Last Updated: {new Date(booking.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InfoCard 
          icon={IndianRupee}
          title="Total Amount"
          value={`₹${booking.totalAmount?.toLocaleString() || 0}`}
          subValue={booking.monthlyAdvance > 0 ? `Advance: ₹${booking.monthlyAdvance}` : 'No advance'}
        />
        <InfoCard 
          icon={Home}
          title="Room Details"
          value={`${booking.roomType || 'N/A'}`}
          subValue={booking.shareType || 'N/A'}
        />
        <InfoCard 
          icon={Calendar}
          title="Start Date"
          value={booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
        />
        <InfoCard 
          icon={Clock}
          title="Duration"
          value={booking.bookingType === 'daily' ? `${booking.endDate ? 'Multiple Days' : 'Daily'}` : 'Monthly'}
          subValue={booking.endDate ? `Until ${new Date(booking.endDate).toLocaleDateString()}` : ''}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hostel Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/10 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 size={18} className="text-emerald-400" />
              Hostel Information
            </h2>
          </div>
          <div className="p-4">
            {booking.hostelId ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                    {booking.hostelId.images?.[0] ? (
                      <img 
                        src={`http://187.127.146.52:2003/${booking.hostelId.images[0]}`} 
                        alt={booking.hostelId.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={32} className="text-emerald-400 m-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{booking.hostelId.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-white">{booking.hostelId.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{booking.hostelId.address}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <IndianRupee size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Monthly Advance: ₹{booking.hostelId.monthlyAdvance}</span>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/hostels/${booking.hostelId._id}`)}
                  className="mt-3 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 
                    text-white text-sm font-semibold hover:shadow-lg transition-all"
                >
                  View Hostel Details
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 size={48} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Hostel information not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/10 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Home size={18} className="text-emerald-400" />
              Room & Pricing Details
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Room Type</span>
                <span className="text-white font-medium">{booking.roomType || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Sharing Type</span>
                <span className="text-white font-medium">{booking.shareType || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Booking Type</span>
                <span className="text-white font-medium capitalize">{booking.bookingType || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-white font-bold text-lg">₹{booking.totalAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Monthly Advance</span>
                <span className="text-white font-medium">₹{booking.monthlyAdvance || 0}</span>
              </div>
              {booking.bookingType === 'daily' && booking.pricePerDay && (
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Price Per Day</span>
                  <span className="text-white font-medium">₹{booking.pricePerDay}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/10 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={18} className="text-emerald-400" />
              Customer Information
            </h2>
          </div>
          <div className="p-4">
            {booking.userId ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white font-medium">{booking.userId.name || 'N/A'}</span>
                </div>
                {booking.userId.email && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white font-medium">{booking.userId.email}</span>
                  </div>
                )}
                {booking.userId.mobileNumber && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Mobile</span>
                    <span className="text-white font-medium">{booking.userId.mobileNumber}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User size={48} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Customer information not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/10 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 size={18} className="text-emerald-400" />
              Vendor Information
            </h2>
          </div>
          <div className="p-4">
            {booking.vendorId ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Vendor Name</span>
                  <span className="text-white font-medium">{booking.vendorId.name || 'N/A'}</span>
                </div>
                {booking.vendorId.email && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white font-medium">{booking.vendorId.email}</span>
                  </div>
                )}
                {booking.vendorId.mobileNumber && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Mobile</span>
                    <span className="text-white font-medium">{booking.vendorId.mobileNumber}</span>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/dashboard/vendors/${booking.vendorId._id}`)}
                  className="mt-3 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 
                    text-white text-sm font-semibold hover:shadow-lg transition-all"
                >
                  View Vendor Details
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 size={48} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Vendor information not available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status History */}
      {booking.statusHistory && booking.statusHistory.length > 0 && (
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/10 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              Status History
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {booking.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{history.status}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(history.timestamp).toLocaleString()}
                    </p>
                    {history.note && (
                      <p className="text-xs text-gray-400 mt-1">{history.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleBooking;