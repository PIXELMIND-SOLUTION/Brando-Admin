import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Upload, X, Image, AlertCircle, Eye, Trash2, Edit2, 
  Plus, Calendar, Sparkles, LayoutGrid, ChevronLeft
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

const Banners = () => {
  // State management
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState({ create: false, fetch: false, update: false, delete: false });
  const [error, setError] = useState("");
  const [banners, setBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'view', 'edit'

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError("");
      const { data } = await axios.get(`${API}/getAllBanners`);
      setBanners(data.banners || []);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch banners");
      showAlert('error', 'Oops...', 'Failed to fetch banners');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // Get single banner
  const getBannerById = async (id) => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/getBannerById/${id}`);
      setSelectedBanner(data.banner);
      setView('view');
    } catch (error) {
      console.error(error);
      showAlert('error', 'Failed', 'Could not fetch banner details');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError("Only JPG, PNG, and WEBP images are allowed");
      return;
    }
    
    setError("");
    setImages(prev => [...prev, ...files]);
    setPreview(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(preview[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  // Reset form
  const resetForm = () => {
    preview.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setPreview([]);
    setError("");
  };

  // Create banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    try {
      setLoading(prev => ({ ...prev, create: true }));
      setError("");

      await axios.post(`${API}/createBanner`, formData);

      showAlert('success', 'Success!', 'Banner uploaded successfully', 2000);
      
      resetForm();
      await fetchBanners();
      setView('list');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Upload failed. Please try again.");
      showAlert('error', 'Upload failed', error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Update banner
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    try {
      setLoading(prev => ({ ...prev, update: true }));
      setError("");

      await axios.put(`${API}/updateBannerById/${selectedBanner._id}`, formData);

      showAlert('success', 'Updated!', 'Banner updated successfully', 2000);
      
      resetForm();
      await fetchBanners();
      setView('list');
      setSelectedBanner(null);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Update failed");
      showAlert('error', 'Update failed', error.response?.data?.message || "Update failed");
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Delete banner
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
      await axios.delete(`${API}/deleteBannerById/${id}`);
      
      showAlert('success', 'Deleted!', 'Banner has been deleted', 2000);
      await fetchBanners();
      if (view === 'view' && selectedBanner?._id === id) {
        setView('list');
        setSelectedBanner(null);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete banner");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Navigation
  const goToCreate = () => {
    resetForm();
    setView('create');
  };

  const goToList = () => {
    resetForm();
    setSelectedBanner(null);
    setView('list');
  };

  // Reusable Components
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
      <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{error}</p>
      <button onClick={() => setError("")} className="p-1 hover:bg-red-100 rounded-lg">
        <X size={16} />
      </button>
    </div>
  ) : null;

  const UploadArea = () => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
        <Upload size={13} className="text-red-500" />
        Banner Images
      </label>
      <div>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleImageChange}
          className="hidden"
          id="banner-upload"
        />
        <label
          htmlFor="banner-upload"
          className="flex flex-col items-center justify-center w-full p-6 sm:p-8 
            border-2 border-dashed border-red-400/30 rounded-xl sm:rounded-2xl
            bg-gradient-to-br from-red-50/30 to-yellow-50/30
            hover:from-red-50 hover:to-yellow-50
            hover:border-red-500/60 transition-all cursor-pointer"
        >
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 
            text-white shadow-[0_4px_16px_rgba(255,0,0,0.35)] mb-3 sm:mb-4">
            <Upload size={20} className="sm:w-6 sm:h-6" />
          </div>
          <p className="font-bold text-gray-700 text-sm sm:text-base">Click to upload banner images</p>
          <p className="text-xs text-gray-400 mt-1 text-center">PNG, JPG, WEBP — multiple allowed</p>
          <p className="text-xs text-gray-400 mt-2">Recommended: 1920x600px</p>
        </label>
      </div>
    </div>
  );

  const PreviewGrid = () => preview.length > 0 && (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">
        Preview ({preview.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {preview.map((img, index) => (
          <div key={index} className="relative group rounded-lg sm:rounded-xl overflow-hidden border-2 border-red-100
            shadow-[0_2px_12px_rgba(255,0,0,0.1)] aspect-video">
            <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
              transition-opacity flex items-center justify-center">
              <button type="button" onClick={() => removeImage(index)}
                className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full 
                  text-white hover:scale-110 transition-transform">
                <X size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SubmitButton = ({ loading, onClick, text }) => (
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        type="button"
        onClick={goToList}
        className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-gray-600 font-semibold 
          hover:bg-gray-100 transition order-2 sm:order-1"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={onClick}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 
          rounded-xl text-white font-black text-sm order-1 sm:order-2
          bg-gradient-to-r from-red-500 to-yellow-500 shadow-[0_4px_24px_rgba(255,0,0,0.4)]
          hover:shadow-[0_8px_40px_rgba(255,0,0,0.5)] hover:scale-[1.02]
          active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-all"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            <span>{text}</span>
          </>
        )}
      </button>
    </div>
  );

  const BannerCard = ({ banner }) => (
    <div className="bg-white rounded-xl border border-red-100 overflow-hidden hover:shadow-xl transition-all">
      <div className="relative h-32 sm:h-40 bg-gray-100">
        <img 
          src={banner.images[0]} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button onClick={() => getBannerById(banner._id)}
            className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:bg-white">
            <Eye size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => handleDelete(banner._id)}
            disabled={loading.delete}
            className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-white">
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          {banner.images.length} {banner.images.length === 1 ? 'image' : 'images'}
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={12} className="text-red-400" />
          {new Date(banner.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  // Render views
  const renderView = () => {
    switch(view) {
      case 'create':
        return (
          <>
            <PageHeader 
              icon={Image} 
              title="Create Banner" 
              subtitle="Upload new banner images"
              action={<BackButton />}
            />
            <ErrorAlert />
            <div className="bg-white rounded-xl sm:rounded-2xl border border-red-100 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">New Banner</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <UploadArea />
                <PreviewGrid />
                <SubmitButton loading={loading.create} text="Create Banner" />
              </form>
            </div>
          </>
        );

      case 'view':
        return selectedBanner && (
          <>
            <PageHeader 
              icon={Eye} 
              title="Banner Details" 
              subtitle={`ID: ${selectedBanner._id.slice(-8)}`}
              action={<BackButton />}
            />
            <div className="bg-white rounded-xl sm:rounded-2xl border border-red-100 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-yellow-500">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">Banner Images</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {selectedBanner.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg sm:rounded-xl overflow-hidden border-2 border-red-100">
                      <img src={img} alt={`Banner ${idx}`} className="w-full h-32 sm:h-40 object-cover" />
                      <a href={img} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                          flex items-center justify-center transition-opacity">
                        <Eye size={20} className="text-white" />
                      </a>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-semibold">{new Date(selectedBanner.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </>
        );

      default: // list view
        return (
          <>
            <PageHeader 
              icon={LayoutGrid} 
              title="Banner Management" 
              subtitle="View and manage all banners"
              action={
                <button onClick={goToCreate}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl 
                    bg-gradient-to-r from-red-500 to-yellow-500 text-white font-semibold 
                    hover:shadow-lg transition-all text-sm sm:text-base whitespace-nowrap">
                  <Plus size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Banner</span>
                  <span className="sm:hidden">New</span>
                </button>
              }
            />
            <ErrorAlert />
            
            {loading.fetch ? (
              <div className="flex justify-center py-12 sm:py-20">
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl border border-red-100">
                <Image size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-gray-500 font-medium">No banners found</p>
                <button onClick={goToCreate}
                  className="mt-3 sm:mt-4 text-sm text-red-500 hover:text-red-600 font-semibold">
                  Create your first banner
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {banners.map(banner => (
                  <BannerCard key={banner._id} banner={banner} />
                ))}
              </div>
            )}

            {/* Guidelines Card */}
            <div className="mt-6 bg-gradient-to-br from-red-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 
              border border-red-200 shadow-[0_2px_12px_rgba(255,0,0,0.08)]">
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-500" />
                Banner Guidelines
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-2"><span className="text-red-500">•</span>Use high-quality images</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span>Recommended: 1920x600px</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span>Max file size: 5MB per image</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span>Formats: JPG, PNG, WEBP</li>
              </ul>
            </div>
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

export default Banners;