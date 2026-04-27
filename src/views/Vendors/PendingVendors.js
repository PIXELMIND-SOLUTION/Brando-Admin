import { Users, Clock, Mail, Phone, Calendar, CheckCircle, XCircle, Eye, ArrowUpRight, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";


const API_URL = "http://187.127.146.52:2003/api/admin/pending-vendors";
const APPROVE_API = "http://187.127.146.52:2003/api/admin/approve-vendor";
const REJECT_API = "http://187.127.146.52:2003/api/admin/reject-vendor";

const PendingVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectVendor, setRejectVendor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  
  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setVendors(data.vendors || []);
      } else {
        setError("Failed to fetch vendors");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleApprove = async (vendor) => {
    setActionLoadingId(vendor.id);
    setActionError(null);
    
    try {
      const response = await fetch(`${APPROVE_API}/${vendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Remove approved vendor from list
        setVendors(prev => prev.filter(v => v.id !== vendor.id));
        alert(`✅ Vendor "${vendor.name}" approved successfully!`);
      } else {
        setActionError(data.message || "Failed to approve vendor");
        alert(`❌ Failed to approve vendor: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Approve error:", err);
      setActionError("Network error while approving");
      alert("❌ Network error. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (vendor) => {
    setRejectVendor(vendor);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectVendor) return;
    
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    setRejectLoading(true);
    setActionError(null);
    
    try {
      const response = await fetch(`${REJECT_API}/${rejectVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Remove rejected vendor from list
        setVendors(prev => prev.filter(v => v.id !== rejectVendor.id));
        setShowRejectModal(false);
        alert(`❌ Vendor "${rejectVendor.name}" rejected successfully!`);
      } else {
        setActionError(data.message || "Failed to reject vendor");
        alert(`❌ Failed to reject vendor: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Reject error:", err);
      setActionError("Network error while rejecting");
      alert("❌ Network error. Please try again.");
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] min-h-screen p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Pending Vendors</h1>
            {vendors.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {vendors.length} pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 font-medium">
            Review and verify vendor registration requests
          </p>
        </div>
        <button
          onClick={fetchVendors}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-all duration-200 w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {actionError && (
        <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={18} />
            <p className="text-red-300 text-sm">{actionError}</p>
            <button
              onClick={() => setActionError(null)}
              className="ml-auto text-red-400 hover:text-red-300 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium">Loading pending vendors...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <XCircle className="text-red-400" size={20} />
              </div>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
            <button
              onClick={fetchVendors}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-bold text-red-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && vendors.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="p-4 bg-emerald-400/10 rounded-full">
              <CheckCircle className="text-emerald-400" size={32} />
            </div>
            <h3 className="text-lg font-black text-white">No Pending Vendors</h3>
            <p className="text-gray-400 text-sm max-w-md">
              All vendor applications have been processed. Check back later for new registrations.
            </p>
          </div>
        </div>
      )}

      {/* Vendors Grid */}
      {!loading && !error && vendors.length > 0 && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-400/10">
                  <Clock className="text-amber-400" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{vendors.length}</p>
                  <p className="text-xs text-gray-400">Pending Approvals</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-400/10">
                  <CheckCircle className="text-emerald-400" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">0</p>
                  <p className="text-xs text-gray-400">Approved This Month</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-400/10">
                  <Users className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">—</p>
                  <p className="text-xs text-gray-400">Total Vendors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendors List */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5">
              <div className="col-span-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Vendor Details</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Contact</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Registered On</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Actions</p>
              </div>
            </div>

            {/* Vendor Rows */}
            <div className="divide-y divide-white/10">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-4 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                  onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                >
                  {/* Mobile View */}
                  <div className="md:hidden">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center">
                            <span className="text-emerald-400 font-black text-sm">
                              {vendor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-bold">{vendor.name}</p>
                            <p className="text-xs text-gray-400">ID: {vendor.id.slice(-8)}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <Phone size={12} className="text-gray-500" />
                            <span className="text-gray-300">{vendor.mobileNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Mail size={12} className="text-gray-500" />
                            <span className="text-gray-300 truncate">{vendor.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar size={12} className="text-gray-500" />
                            <span className="text-gray-400">{formatDate(vendor.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(vendor);
                            }}
                            disabled={actionLoadingId === vendor.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl py-2 text-xs font-bold text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoadingId === vendor.id ? (
                              <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            {actionLoadingId === vendor.id ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRejectModal(vendor);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl py-2 text-xs font-bold text-red-400 transition-colors"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </div>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className={`text-gray-500 transition-transform duration-200 ${selectedVendor?.id === vendor.id ? 'rotate-90' : ''}`}
                      />
                    </div>

                    {/* Expanded Details for Mobile */}
                    {selectedVendor?.id === vendor.id && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">Full Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vendor ID</span>
                            <span className="text-white font-mono text-xs">{vendor.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Registration Date</span>
                            <span className="text-white">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time</span>
                            <span className="text-white">{new Date(vendor.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 font-bold">
                            {vendor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-bold">{vendor.name}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {vendor.id.slice(-8)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-gray-300 text-sm">{vendor.mobileNumber}</p>
                      <p className="text-gray-400 text-xs truncate">{vendor.email}</p>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500" />
                        <p className="text-gray-300 text-sm">{formatDate(vendor.createdAt)}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(vendor);
                        }}
                        disabled={actionLoadingId === vendor.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400/10 hover:bg-emerald-400/20 rounded-xl text-xs font-bold text-emerald-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoadingId === vendor.id ? (
                          <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        {actionLoadingId === vendor.id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRejectModal(vendor);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 hover:bg-red-400/20 rounded-xl text-xs font-bold text-red-400 transition-all duration-200"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Actions (Optional) */}
          <div className="flex justify-end">
            <button className="text-xs font-bold text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-white/5">
              View All Vendors
              <ArrowUpRight size={12} />
            </button>
          </div>
        </>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && rejectVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl border border-white/20 w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <AlertTriangle className="text-red-400" size={20} />
                </div>
                <h2 className="text-lg font-black text-white">Reject Vendor</h2>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Vendor Details</p>
                <p className="text-white font-bold">{rejectVendor.name}</p>
                <p className="text-xs text-gray-400">{rejectVendor.email}</p>
                <p className="text-xs text-gray-400">{rejectVendor.mobileNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Reason for Rejection <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason why this vendor application is being rejected..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be shared with the vendor.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-white/10 bg-white/5">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-gray-300 font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {rejectLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingVendors;