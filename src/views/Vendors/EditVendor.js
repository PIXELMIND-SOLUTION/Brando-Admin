import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  ArrowLeft, Save, X, User, Phone, Mail, Building2,
  Shield, CheckCircle, XCircle, AlertCircle, RefreshCw
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

const EditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    approvalStatus: 'pending',
    isActive: true,
    rejectionReason: ''
  });

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setFetching(true);
      const { data } = await axios.get(`${API}/getsinglevendor/${id}`);
      const vendor = data.data;
      setFormData({
        name: vendor.name || '',
        mobileNumber: vendor.mobileNumber || '',
        email: vendor.email || '',
        approvalStatus: vendor.approvalStatus || 'pending',
        isActive: vendor.isActive !== undefined ? vendor.isActive : true,
        rejectionReason: vendor.rejectionReason || ''
      });
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
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to update this vendor?',
      icon: 'question',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold'
      }
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      
      // Prepare data for API
      const updateData = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        approvalStatus: formData.approvalStatus,
        isActive: formData.isActive,
        rejectionReason: formData.approvalStatus === 'rejected' ? formData.rejectionReason : null
      };
      
      await axios.put(`${API}/updatevendor/${id}`, updateData);
      
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Vendor has been updated successfully',
        background: '#0f172a',
        color: '#fff',
        timer: 2000
      });
      
      navigate(`/dashboard/vendors/${id}`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update vendor',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      approved: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10' },
      rejected: { icon: XCircle, color: 'text-red-400 bg-red-500/10' },
      pending: { icon: AlertCircle, color: 'text-yellow-400 bg-yellow-500/10' }
    };
    
    const { icon: Icon, color } = config[status] || { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10' };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
        <Icon size={12} />
        {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending'}
      </span>
    );
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/dashboard/vendors/${id}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Vendor Details
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Edit Vendor</h1>
            <p className="text-sm text-gray-400 mt-1">Update vendor information and status</p>
          </div>
          <div className="flex items-center gap-3">
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-emerald-400" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
                  text-white placeholder:text-gray-500"
                placeholder="Enter vendor name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
                  text-white placeholder:text-gray-500"
                placeholder="Enter mobile number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
                  text-white placeholder:text-gray-500"
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            Account Status
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Approval Status
              </label>
              <select
                name="approvalStatus"
                value={formData.approvalStatus}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
                  text-white"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current status: <StatusBadge status={formData.approvalStatus} />
              </p>
            </div>
            
            {formData.approvalStatus === 'rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  name="rejectionReason"
                  value={formData.rejectionReason}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 
                    focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
                    text-white placeholder:text-gray-500 resize-none"
                  placeholder="Enter reason for rejection"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Account Active Status
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  formData.isActive ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/vendors/${id}`)}
            className="px-6 py-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 
              font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r 
              from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-lg 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVendor;