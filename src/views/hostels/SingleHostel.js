import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Building2, Eye, Calendar, MapPin, Star, IndianRupee, 
  Users, Image as ImageIcon, Thermometer, ChevronLeft,
  Home, Clock
} from "lucide-react";

const API = "http://31.97.206.144:2003/api/Admin";

// SweetAlert config
const showAlert = (icon, title, text) => Swal.fire({
  icon, title, text,
  background: '#fff',
  customClass: {
    popup: 'rounded-2xl',
    title: 'text-lg font-bold',
    confirmButton: 'bg-gradient-to-r from-red-500 to-yellow-500 text-white px-6 py-2 rounded-xl font-semibold'
  }
});

const SingleHostel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomType, setRoomType] = useState('AC');

  // Fetch hostel details
  const fetchHostel = async (type = roomType) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${API}/getHostelById/${id}?roomType=${type}`);
      setHostel(data.hostel);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch hostel details");
      showAlert('error', 'Failed', 'Could not fetch hostel details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHostel(); }, [id]);

  // Handle room type change
  const changeRoomType = (type) => {
    setRoomType(type);
    fetchHostel(type);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="text-center py-20 bg-white rounded-xl border border-red-100">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">{error || 'Hostel not found'}</p>
          <button 
            onClick={() => navigate('/dashboard/hostels')}
            className="mt-4 text-red-500 hover:text-red-600 font-semibold"
          >
            Back to Hostels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/dashboard/hostels')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-[0_4px_16px_rgba(255,0,0,0.4)]">
            <Building2 size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{hostel.name}</h1>
            <p className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 font-medium">
              {hostel.categoryId?.name} • ID: {hostel._id.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      {/* Room Type Toggle */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => changeRoomType('AC')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            roomType === 'AC' 
              ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Thermometer size={16} />
          AC Rooms
        </button>
        <button
          onClick={() => changeRoomType('NONAC')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            roomType === 'NONAC' 
              ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Thermometer size={16} />
          Non-AC Rooms
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Sharing Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Gallery */}
          <div className="bg-white rounded-xl border border-red-100 shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
              <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <ImageIcon size={14} />
                Gallery ({hostel.images?.length} images)
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {hostel.images?.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-red-100 aspect-video">
                    <img 
                      src={img} 
                      alt={`${hostel.name} ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <a href={img} target="_blank" rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                        flex items-center justify-center transition-opacity">
                      <Eye size={24} className="text-white" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sharing Plans */}
          <div className="bg-white rounded-xl border border-red-100 shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
              <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <Users size={14} />
                {roomType} Sharing Plans
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid gap-3">
                {hostel.sharings?.map((sharing, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 
                        flex items-center justify-center text-white font-bold text-lg">
                        {sharing.shareType.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{sharing.shareType}</p>
                        <p className="text-xs text-gray-500">Monthly / Daily</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-lg">{formatCurrency(sharing.monthlyPrice)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(sharing.dailyPrice)}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-red-100 shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
              <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <Home size={14} />
                Property Details
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-gray-800">{hostel.categoryId?.name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-800">{hostel.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Address
                </p>
                <p className="text-sm text-gray-700">{hostel.address}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <IndianRupee size={12} /> Monthly Advance
                </p>
                <p className="text-lg font-black text-gray-900">{formatCurrency(hostel.monthlyAdvance)}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Location Coordinates</p>
                <p className="text-xs text-gray-600">
                  Lat: {hostel.location?.coordinates[1].toFixed(4)}<br />
                  Lng: {hostel.location?.coordinates[0].toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-red-100 shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
              <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <Clock size={14} />
                Timeline
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Calendar size={14} className="text-red-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(hostel.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={14} className="text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(hostel.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-xl p-4 border border-red-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Actions</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => window.open(hostel.images[0], '_blank')}
                className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                View Images
              </button>
              <button 
                onClick={() => navigate('/dashboard/hostels')}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg text-sm font-medium text-white hover:shadow-lg transition-all"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleHostel;