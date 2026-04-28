import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Upload, X, Image, AlertCircle, Eye, Trash2, Edit2, 
  Plus, Calendar, Sparkles, LayoutGrid, ChevronLeft
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/vendors";

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

const VendorBanners = () => {
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
      const { data } = await axios.get(`${API}/all`);
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

  // Get single banner by ID
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

  // Create banner - POST /api/vendors/create
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

      await axios.post(`${API}/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

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

  // Update banner - PUT /api/vendors/update/:id
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

      await axios.put(`${API}/update/${selectedBanner._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

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

  // Delete banner - DELETE /api/vendors/delete/:id
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
      await axios.delete(`${API}/delete/${id}`);
      
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

  const goToEdit = () => {
    resetForm();
    setImages([]);
    setPreview([]);
    setView('edit');
  };

  // Reusable Components
  const PageHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/10">
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-emerald-400 font-medium">
            {subtitle}
          </p>
        </div>
      </div>
      {action}
    </div>
  );

  const BackButton = () => (
    <button onClick={goToList}
      className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 
        rounded-xl transition-colors text-gray-300">
      <ChevronLeft size={16} />
      Back
    </button>
  );

  const ErrorAlert = () => error ? (
    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
      <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{error}</p>
      <button onClick={() => setError("")} className="p-1 hover:bg-white/10 rounded-lg">
        <X size={16} />
      </button>
    </div>
  ) : null;

  const UploadArea = () => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
        <Upload size={13} className="text-emerald-400" />
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
            border-2 border-dashed border-emerald-400/30 rounded-xl sm:rounded-2xl
            bg-white/5 hover:bg-white/10
            hover:border-emerald-400/60 transition-all cursor-pointer"
        >
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] 
            text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] mb-3 sm:mb-4 border border-white/10">
            <Upload size={20} className="sm:w-6 sm:h-6" />
          </div>
          <p className="font-bold text-white text-sm sm:text-base">Click to upload banner images</p>
          <p className="text-xs text-gray-400 mt-1 text-center">PNG, JPG, WEBP — multiple allowed</p>
          <p className="text-xs text-gray-500 mt-2">Recommended: 1920x600px</p>
        </label>
      </div>
    </div>
  );

  const PreviewGrid = () => preview.length > 0 && (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-emerald-400">
        Preview ({preview.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {preview.map((img, index) => (
          <div key={index} className="relative group rounded-lg sm:rounded-xl overflow-hidden border border-white/10
            shadow-[0_2px_12px_rgba(0,0,0,0.3)] aspect-video">
            <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
              transition-opacity flex items-center justify-center">
              <button type="button" onClick={() => removeImage(index)}
                className="p-1.5 sm:p-2 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] rounded-full 
                  text-white hover:scale-110 transition-transform border border-white/20">
                <X size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SubmitButton = ({ loading, onClick, text }) => (
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
      <button
        type="button"
        onClick={goToList}
        className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-gray-300 font-semibold 
          hover:bg-white/10 transition order-2 sm:order-1"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={onClick}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 
          rounded-xl text-white font-black text-sm order-1 sm:order-2
          bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_4px_24px_rgba(16,185,129,0.4)]
          hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] hover:scale-[1.02]
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
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:shadow-xl transition-all group">
      <div className="relative h-32 sm:h-40 bg-white/5">
        <img 
          src={banner.images && banner.images[0] ? banner.images[0] : '/api/placeholder/400/300'} 
          alt="Banner" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button onClick={() => getBannerById(banner._id)}
            className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80">
            <Eye size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => handleDelete(banner._id)}
            disabled={loading.delete}
            className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-black/80">
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
          {banner.images?.length || 0} {banner.images?.length === 1 ? 'image' : 'images'}
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} className="text-emerald-400" />
            {new Date(banner.createdAt).toLocaleDateString()}
          </div>
          <button onClick={() => {
            setSelectedBanner(banner);
            goToEdit();
          }}
            className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all">
            <Edit2 size={12} />
          </button>
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
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">New Banner</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <UploadArea />
                <PreviewGrid />
                <SubmitButton loading={loading.create} onClick={handleSubmit} text="Create Banner" />
              </form>
            </div>
          </>
        );

      case 'edit':
        return selectedBanner && (
          <>
            <PageHeader 
              icon={Edit2} 
              title="Edit Banner" 
              subtitle={`Update banner images (ID: ${selectedBanner._id.slice(-8)})`}
              action={<BackButton />}
            />
            <ErrorAlert />
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">Update Banner</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Current Images */}
                {selectedBanner.images && selectedBanner.images.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-emerald-400">
                      Current Images ({selectedBanner.images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {selectedBanner.images.map((img, idx) => (
                        <div key={idx} className="relative rounded-lg sm:rounded-xl overflow-hidden border border-white/10 aspect-video">
                          <img src={img} alt={`Current ${idx + 1}`} className="w-full h-full object-cover" />
                          <a href={img} target="_blank" rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 
                              flex items-center justify-center transition-opacity">
                            <Eye size={16} className="text-white" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload New Images */}
                <div className="border-t border-white/10 pt-4">
                  <UploadArea />
                  <PreviewGrid />
                </div>
                
                <SubmitButton loading={loading.update} onClick={handleUpdate} text="Update Banner" />
              </div>
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
              action={
                <div className="flex gap-2">
                  <button onClick={goToEdit}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500/20 hover:bg-yellow-500/30 
                      rounded-xl transition-colors text-yellow-400">
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <BackButton />
                </div>
              }
            />
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">Banner Images</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {selectedBanner.images && selectedBanner.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg sm:rounded-xl overflow-hidden border border-white/10">
                      <img src={img} alt={`Banner ${idx}`} className="w-full h-32 sm:h-40 object-cover" />
                      <a href={img} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                          flex items-center justify-center transition-opacity">
                        <Eye size={20} className="text-white" />
                      </a>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-xs text-gray-400">Created At</p>
                    <p className="text-sm font-semibold text-white">{new Date(selectedBanner.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm font-semibold text-white">{new Date(selectedBanner.updatedAt).toLocaleString()}</p>
                  </div>
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
              subtitle={`${banners.length} total banners`}
              action={
                <button onClick={goToCreate}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl 
                    bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold 
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
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image size={16} className="text-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
                <Image size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-500 mb-3 sm:mb-4" />
                <p className="text-gray-400 font-medium">No banners found</p>
                <button onClick={goToCreate}
                  className="mt-3 sm:mt-4 text-sm text-emerald-400 hover:text-emerald-300 font-semibold">
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
            <div className="mt-6 bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 
              border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                Banner Guidelines
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Use high-quality images for better display</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Recommended dimensions: 1920x600px</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Maximum file size: 5MB per image</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Supported formats: JPG, PNG, WEBP</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Multiple images can be uploaded at once</li>
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

export default VendorBanners;