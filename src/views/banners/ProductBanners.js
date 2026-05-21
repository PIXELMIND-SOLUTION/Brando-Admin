import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Upload, X, Image, AlertCircle, Eye, Trash2, Edit2,
  Plus, Calendar, Sparkles, LayoutGrid, ChevronLeft
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

const ProductBanners = () => {
  // State management
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState({ create: false, fetch: false, update: false, delete: false });
  const [error, setError] = useState("");
  const [banners, setBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'view', 'edit'

  // Fetch all product banners
  const fetchBanners = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError("");
      const { data } = await axios.get(`${API}/product-banner`);
      setBanners(data.productBanners || []);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch product banners");
      showAlert('error', 'Oops...', 'Failed to fetch product banners');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // Get single product banner
  const getBannerById = async (id) => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/product-banner/${id}`);
      setSelectedBanner(data.productBanner);
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
    const file = e.target.files?.[0];
    
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!validTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Reset form
  const resetForm = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview("");
    setError("");
  };

  // Create product banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Please upload an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(prev => ({ ...prev, create: true }));
      setError("");

      await axios.post(`${API}/product-banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showAlert('success', 'Success!', 'Product banner uploaded successfully', 2000);

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

  // Update product banner
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!image && !selectedBanner?.image) {
      setError("Please upload an image");
      return;
    }

    const formData = new FormData();
    if (image) formData.append("image", image);

    try {
      setLoading(prev => ({ ...prev, update: true }));
      setError("");

      await axios.put(`${API}/product-banner/${selectedBanner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showAlert('success', 'Updated!', 'Product banner updated successfully', 2000);

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

  // Delete product banner
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
      await axios.delete(`${API}/product-banner/${id}`);

      showAlert('success', 'Deleted!', 'Product banner has been deleted', 2000);
      await fetchBanners();
      if (view === 'view' && selectedBanner?._id === id) {
        setView('list');
        setSelectedBanner(null);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete product banner");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Navigation
  const goToCreate = () => {
    resetForm();
    setView('create');
  };

  const goToEdit = (banner) => {
    setSelectedBanner(banner);
    setImage(null);
    setPreview("");
    setView('edit');
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
        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/10">
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Product Banner Management</h1>
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
        Product Banner Image
      </label>
      <div>
        <input
          type="file"
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
          <p className="font-bold text-white text-sm sm:text-base">Click to upload product banner image</p>
          <p className="text-xs text-gray-400 mt-1 text-center">PNG, JPG, WEBP — single image only</p>
          <p className="text-xs text-gray-500 mt-2">Recommended: 1920x600px</p>
        </label>
      </div>
    </div>
  );

  const PreviewSection = () => (preview || (selectedBanner?.image && view === 'edit')) && (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-emerald-400">
        Image Preview
      </h3>
      <div className="relative group rounded-lg sm:rounded-xl overflow-hidden border border-white/10
        shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <img 
          src={preview || selectedBanner?.image} 
          alt="Banner preview" 
          className="w-full h-48 sm:h-64 object-cover" 
        />
        {preview && (
          <button 
            type="button" 
            onClick={() => {
              URL.revokeObjectURL(preview);
              setImage(null);
              setPreview("");
            }}
            className="absolute top-2 right-2 p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full 
              text-white hover:scale-110 transition-transform shadow-lg"
          >
            <X size={16} />
          </button>
        )}
        {!preview && view === 'edit' && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
            Current Image
          </div>
        )}
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
            <span>{text === "Update Banner" ? "Updating..." : "Uploading..."}</span>
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
      <div className="relative h-40 sm:h-48 bg-white/5">
        <img
          src={banner.image}
          alt="Product Banner"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button onClick={() => getBannerById(banner._id)}
            className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-blue-400 hover:bg-black/80 transition-all">
            <Eye size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => goToEdit(banner)}
            className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-emerald-400 hover:bg-black/80 transition-all">
            <Edit2 size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => handleDelete(banner._id)}
            disabled={loading.delete}
            className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-black/80 transition-all">
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} className="text-emerald-400" />
            {new Date(banner.createdAt).toLocaleDateString()}
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            Banner
          </span>
        </div>
      </div>
    </div>
  );

  // Render views
  const renderView = () => {
    switch (view) {
      case 'create':
        return (
          <>
            <PageHeader
              icon={Image}
              title="Create Product Banner"
              subtitle="Upload new product banner image"
              action={<BackButton />}
            />
            <ErrorAlert />
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">New Product Banner</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <UploadArea />
                <PreviewSection />
                <SubmitButton loading={loading.create} text="Create Banner" onClick={handleSubmit} />
              </form>
            </div>
          </>
        );

      case 'edit':
        return selectedBanner && (
          <>
            <PageHeader
              icon={Edit2}
              title="Edit Product Banner"
              subtitle={`ID: ${selectedBanner._id.slice(-8)}`}
              action={<BackButton />}
            />
            <ErrorAlert />
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">Update Product Banner</h2>
              </div>
              <form onSubmit={handleUpdate} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <UploadArea />
                <PreviewSection />
                <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-lg">
                  <p className="flex items-center gap-1">💡 <span>Tips for updating:</span></p>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    <li>• Upload a new image to replace the current one</li>
                    <li>• The current image will be replaced with the new one</li>
                    <li>• Leave image field empty to keep current image</li>
                  </ul>
                </div>
                <SubmitButton loading={loading.update} text="Update Banner" onClick={handleUpdate} />
              </form>
            </div>
          </>
        );

      case 'view':
        return selectedBanner && (
          <>
            <PageHeader
              icon={Eye}
              title="Product Banner Details"
              subtitle={`ID: ${selectedBanner._id.slice(-8)}`}
              action={
                <div className="flex gap-2">
                  <button onClick={() => goToEdit(selectedBanner)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 
                      hover:shadow-lg transition-all rounded-xl text-white font-semibold">
                    <Edit2 size={14} />
                    Edit Banner
                  </button>
                  <BackButton />
                </div>
              }
            />
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <h2 className="text-xs font-black text-white tracking-widest uppercase">Product Banner</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="relative group rounded-lg sm:rounded-xl overflow-hidden border border-white/10">
                  <img 
                    src={selectedBanner.image} 
                    alt="Product Banner" 
                    className="w-full h-64 sm:h-96 object-cover" 
                  />
                  <a href={selectedBanner.image} target="_blank" rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                      flex items-center justify-center transition-opacity">
                    <Eye size={32} className="text-white" />
                  </a>
                </div>
                <div className="mt-4 sm:mt-6 p-4 bg-white/10 rounded-xl">
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm font-semibold text-white">{new Date(selectedBanner.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-2">Last Updated</p>
                  <p className="text-sm font-semibold text-white">{new Date(selectedBanner.updatedAt).toLocaleString()}</p>
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
              title="Product Banner Management"
              subtitle="View and manage all product banners"
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
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
                <Image size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-500 mb-3 sm:mb-4" />
                <p className="text-gray-400 font-medium">No product banners found</p>
                <button onClick={goToCreate}
                  className="mt-3 sm:mt-4 text-sm text-emerald-400 hover:text-emerald-300 font-semibold">
                  Create your first product banner
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                Product Banner Guidelines
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Use high-quality product images</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Recommended: 1360x680px</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Max file size: 5MB per image</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Formats: JPG, PNG, WEBP</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span>Showcase featured products or promotions</li>
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

export default ProductBanners;