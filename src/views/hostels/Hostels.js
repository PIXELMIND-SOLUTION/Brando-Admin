import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Building2, Eye, Trash2, Plus, Calendar, MapPin, 
  Star, IndianRupee, Home, Users, Image as ImageIcon,
  Filter, Sparkles, LayoutGrid, ChevronLeft, Edit2,
  Thermometer, Hash, X, Upload
} from "lucide-react";

const API = "http://31.97.206.144:2003/api/Admin";

// SweetAlert config
const showAlert = (icon, title, text, timer) => Swal.fire({
  icon, title, text, timer,
  background: '#fff',
  customClass: {
    popup: 'rounded-2xl',
    title: 'text-lg font-bold',
    confirmButton: 'bg-gradient-to-r from-red-500 to-yellow-500 text-white px-6 py-2 rounded-xl font-semibold'
  }
});

const Hostels = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [error, setError] = useState("");
  const [view, setView] = useState('list'); // 'list', 'view', 'edit'
  const [roomType, setRoomType] = useState('AC'); // 'AC' or 'NONAC'

  // Fetch all hostels
  const fetchHostels = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError("");
      const { data } = await axios.get(`${API}/getallHostels`);
      setHostels(data.hostels || []);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch hostels");
      showAlert('error', 'Oops...', 'Failed to fetch hostels');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => { fetchHostels(); }, []);

  // Get single hostel
  const getHostelById = async (id, type = roomType) => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/getHostelById/${id}?roomType=${type}`);
      setSelectedHostel(data.hostel);
      setView('view');
    } catch (error) {
      console.error(error);
      showAlert('error', 'Failed', 'Could not fetch hostel details');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Delete hostel
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      background: '#fff',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-bold',
        confirmButton: 'bg-gradient-to-r from-red-500 to-yellow-500 text-white px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold'
      }
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await axios.delete(`${API}/deleteHostel/${id}`);
      
      showAlert('success', 'Deleted!', 'Hostel has been deleted', 2000);
      await fetchHostels();
      if (view === 'view' && selectedHostel?._id === id) {
        setView('list');
        setSelectedHostel(null);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete hostel");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Navigation
  const goToList = () => {
    setSelectedHostel(null);
    setView('list');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Page Header Component
  const PageHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-[0_4px_16px_rgba(255,0,0,0.4)]">
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 font-medium">
            {subtitle}
          </p>
        </div>
      </div>
      {action}
    </div>
  );

  const BackButton = () => (
    <button onClick={goToList}
      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 
        rounded-xl transition-colors">
      <ChevronLeft size={16} />
      Back
    </button>
  );

  const ErrorAlert = () => error ? (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
      <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">!</div>
      <p className="text-sm font-medium flex-1">{error}</p>
      <button onClick={() => setError("")} className="p-1 hover:bg-red-100 rounded-lg">
        <X size={16} />
      </button>
    </div>
  ) : null;

  // Hostel Card Component
  const HostelCard = ({ hostel }) => (
    <div className="bg-white rounded-xl border border-red-100 overflow-hidden hover:shadow-xl transition-all group">
      <div className="relative h-40 sm:h-48 bg-gray-100">
        <img 
          src={hostel.images[0]} 
          alt={hostel.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button onClick={() => getHostelById(hostel._id)}
            className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:bg-white">
            <Eye size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => handleDelete(hostel._id)}
            disabled={loading.delete}
            className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-white">
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          <Star size={12} className="text-yellow-400" />
          {hostel.rating}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          <ImageIcon size={10} /> {hostel.images.length}
        </div>
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-800 line-clamp-1">{hostel.name}</h3>
          <span className="text-xs px-2 py-1 bg-gradient-to-r from-red-100 to-yellow-100 rounded-full text-red-600 font-semibold">
            {hostel.categoryId?.name || 'N/A'}
          </span>
        </div>
        
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-red-400 flex-shrink-0" />
            <span className="line-clamp-1">{hostel.address}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <IndianRupee size={12} className="text-red-400 flex-shrink-0" />
            <span>Advance: {formatCurrency(hostel.monthlyAdvance)}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-red-400 flex-shrink-0" />
            <span>{hostel.sharings?.length} sharing options</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-red-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={10} />
            {new Date(hostel.createdAt).toLocaleDateString()}
          </div>
          <button 
            onClick={() => getHostelById(hostel._id)}
            className="text-red-500 hover:text-red-600 font-semibold"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );

  // Single Hostel View Component
  const SingleHostelView = () => {
    if (!selectedHostel) return null;

    return (
      <>
        <PageHeader 
          icon={Building2} 
          title={selectedHostel.name} 
          subtitle={`Category: ${selectedHostel.categoryId?.name}`}
          action={<BackButton />}
        />

        {/* Room Type Toggle */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => {
              setRoomType('AC');
              getHostelById(selectedHostel._id, 'AC');
            }}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              roomType === 'AC' 
                ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Thermometer size={16} className="inline mr-1" />
            AC Rooms
          </button>
          <button
            onClick={() => {
              setRoomType('NONAC');
              getHostelById(selectedHostel._id, 'NONAC');
            }}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              roomType === 'NONAC' 
                ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Non-AC Rooms
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-red-100 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
                <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <ImageIcon size={14} />
                  Gallery
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {selectedHostel.images?.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-red-100">
                      <img src={img} alt={`${selectedHostel.name} ${idx}`} className="w-full h-32 object-cover" />
                      <a href={img} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                          flex items-center justify-center transition-opacity">
                        <Eye size={20} className="text-white" />
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
                  Sharing Plans ({roomType})
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid gap-3">
                  {selectedHostel.sharings?.map((sharing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 
                          flex items-center justify-center text-white font-bold">
                          {sharing.shareType.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-700">{sharing.shareType}</p>
                          <p className="text-xs text-gray-500">Monthly / Daily</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">{formatCurrency(sharing.monthlyPrice)}</p>
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
            <div className="bg-white rounded-xl border border-red-100 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">Details</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-gray-800">{selectedHostel.categoryId?.name}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Address
                  </p>
                  <p className="text-sm text-gray-600">{selectedHostel.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{selectedHostel.rating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monthly Advance</p>
                    <p className="font-bold text-gray-900">{formatCurrency(selectedHostel.monthlyAdvance)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Location Coordinates</p>
                  <p className="text-xs text-gray-600">
                    Lat: {selectedHostel.location?.coordinates[1]}, Lng: {selectedHostel.location?.coordinates[0]}
                  </p>
                </div>

                <div className="pt-4 border-t border-red-100">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    Created: {new Date(selectedHostel.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={12} />
                    Updated: {new Date(selectedHostel.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Render views
  const renderView = () => {
    switch(view) {
      case 'view':
        return <SingleHostelView />;

      default: // list view
        return (
          <>
            <PageHeader 
              icon={LayoutGrid} 
              title="Hostel Management" 
              subtitle={`${hostels.length} hostels available`}
            />

            <ErrorAlert />
            
            {/* Filters */}
            <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter size={16} className="text-red-400" />
                <span>Filter:</span>
              </div>
              {['All', 'MensPg', 'WomensPg', 'ColivingPg'].map(filter => (
                <button
                  key={filter}
                  className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                    bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {loading.fetch ? (
              <div className="flex justify-center py-12 sm:py-20">
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : hostels.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-red-100">
                <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No hostels found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {hostels.map(hostel => (
                  <HostelCard key={hostel._id} hostel={hostel} />
                ))}
              </div>
            )}

            {/* Stats Card */}
            {hostels.length > 0 && (
              <div className="mt-6 bg-gradient-to-br from-red-50 to-yellow-50 rounded-xl p-4 
                border border-red-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 
                    flex items-center justify-center text-white font-bold">
                    {hostels.length}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Total Hostels</p>
                    <p className="text-xs text-gray-500">Across all categories</p>
                  </div>
                </div>
                <Sparkles size={20} className="text-yellow-500" />
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {renderView()}
    </div>
  );
};

export default Hostels;