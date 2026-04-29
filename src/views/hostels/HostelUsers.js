import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Users, Eye, Trash2, CheckCircle, XCircle,
  RefreshCw, Filter, X, Search, SortAsc, SortDesc,
  Calendar, Building2, User, Phone, MapPin,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Sparkles, BadgeCheck, TrendingUp, Download, Shield,
  Star, Mail, ArrowLeft
} from "lucide-react";

const API = "http://187.127.146.52:2003/api/admin";

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

// Custom hooks (same as above)
const useDebouncedSearch = (initialValue = '', delay = 300) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearchTerm(searchTerm), delay);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, delay]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  return { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch };
};

const useLocalSearch = (setSearchTerm, clearSearch, delay = 300) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const debounceTimerRef = useRef(null);

  const handleSearchChange = useCallback((value) => {
    setLocalSearchTerm(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setSearchTerm(value), delay);
  }, [setSearchTerm, delay]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm('');
    clearSearch();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, [clearSearch]);

  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  return { localSearchTerm, handleSearchChange, handleClearSearch };
};

const useFilterAndSortUsers = (users, filterStatus, searchTerm, sortConfig) => {
  return useMemo(() => {
    if (!users.length) return [];
    
    let filtered = filterStatus === 'All' ? users : users.filter(u => u.status === filterStatus);

    if (searchTerm) {
      filtered = filtered.filter(u => 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.mobileNumber || '').toString().includes(searchTerm) ||
        (u.status || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
      } else if (sortConfig.key === 'mobileNumber') {
        aVal = a.mobileNumber || 0;
        bVal = b.mobileNumber || 0;
      } else if (sortConfig.key === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, filterStatus, searchTerm, sortConfig]);
};

const usePagination = (items, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))), [totalPages]);
  const changeItemsPerPage = useCallback((newSize) => { setItemsPerPage(newSize); setCurrentPage(1); }, []);
  useEffect(() => setCurrentPage(1), [items.length]);

  return { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage };
};

const Pagination = React.memo(({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - (maxVisible - 1); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
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
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))} className="px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-sm focus:border-emerald-500 outline-none">
          {[5, 10, 15, 20, 30].map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        <span>entries</span>
        <span className="ml-4">Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 disabled:opacity-40"><ChevronsLeft size={16} /></button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 disabled:opacity-40"><ChevronLeft size={16} /></button>
        {getPageNumbers().map((page, index) => page === '...' ? <span key={index} className="px-3 py-1 text-gray-400">...</span> : (
          <button key={page} onClick={() => onPageChange(page)} className={`min-w-[36px] h-9 px-3 rounded-lg font-medium transition-all ${currentPage === page ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-black border border-white/20 text-white hover:bg-white/20'}`}>{page}</button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 disabled:opacity-40"><ChevronRight size={16} /></button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 disabled:opacity-40"><ChevronsRight size={16} /></button>
      </div>
    </div>
  );
});

const HostelUsers = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch } = useDebouncedSearch('', 300);
  const { localSearchTerm, handleSearchChange, handleClearSearch } = useLocalSearch(setSearchTerm, clearSearch, 300);
  const filteredAndSortedUsers = useFilterAndSortUsers(users, filterStatus, debouncedSearchTerm, sortConfig);
  const { currentPage, itemsPerPage, totalItems, totalPages, paginatedItems, goToPage, changeItemsPerPage } = usePagination(filteredAndSortedUsers, 10);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get(`${API}/allhostelusers/${hostelId}`);
      setUsers(data.data || []);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Oops...', 'Failed to fetch hostel users');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [hostelId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Remove User?',
      text: "This user will be removed from the hostel!",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, remove!'
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await axios.delete(`${API}/removehosteluser/${id}`);
      showAlert('success', 'Removed!', 'User has been removed from hostel', 2000);
      fetchUsers();
      setSelectedUsers(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      showAlert('error', 'Failed', error.response?.data?.message || "Could not remove user");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const getUniqueFilters = () => {
    const statuses = ['All', ...new Set(users.map(u => u.status).filter(Boolean))];
    return statuses;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedItems.length) setSelectedUsers([]);
    else setSelectedUsers(paginatedItems.map(u => u._id));
  };

  const toggleSelect = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };

  const exportToCSV = () => {
    const data = filteredAndSortedUsers;
    const headers = ['Name', 'Mobile Number', 'Status', 'Verified', 'Created At', 'Last Updated'];
    const csvData = data.map(u => [
      u.name || 'N/A',
      u.mobileNumber || 'N/A',
      u.status || 'N/A',
      u.isVerified ? 'Yes' : 'No',
      new Date(u.createdAt).toLocaleString(),
      new Date(u.updatedAt).toLocaleString()
    ]);
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel_users_${hostelId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const StatusBadge = ({ status }) => {
    const config = {
      active: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10', label: 'Active' },
      inactive: { icon: XCircle, color: 'text-red-400 bg-red-500/10', label: 'Inactive' },
      blocked: { icon: Shield, color: 'text-red-400 bg-red-500/10', label: 'Blocked' }
    };
    const { icon: Icon, color, label } = config[status] || { icon: User, color: 'text-gray-400 bg-gray-500/10', label: status || 'Unknown' };
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}><Icon size={12} />{label}</span>;
  };

  const UsersTable = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 border-b border-white/10">
              <th className="px-4 py-4 w-12"><input type="checkbox" checked={selectedUsers.length === paginatedItems.length && paginatedItems.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500" /></th>
              <th className="px-4 py-4 text-left"><button onClick={() => handleSort('name')} className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider"><User size={14} /> Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</button></th>
              <th className="px-4 py-4 text-left"><button onClick={() => handleSort('mobileNumber')} className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider"><Phone size={14} /> Mobile {sortConfig.key === 'mobileNumber' && (sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</button></th>
              <th className="px-4 py-4 text-left">Status</th>
              <th className="px-4 py-4 text-left">Verified</th>
              <th className="px-4 py-4 text-left"><button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider"><Calendar size={14} /> Joined {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</button></th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((user) => (
              <tr key={user._id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 group">
                <td className="px-4 py-4"><input type="checkbox" checked={selectedUsers.includes(user._id)} onChange={() => toggleSelect(user._id)} className="w-4 h-4 rounded border-white/30 bg-transparent text-emerald-500" /></td>
                <td className="px-4 py-4"><div><p className="font-semibold text-white">{user.name || 'N/A'}</p></div></td>
                <td className="px-4 py-4"><p className="text-white">{user.mobileNumber}</p></td>
                <td className="px-4 py-4"><StatusBadge status={user.status} /></td>
                <td className="px-4 py-4">{user.isVerified ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}</td>
                <td className="px-4 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => viewUserDetails(user)} className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg"><Eye size={14} /></button><button onClick={() => handleDelete(user._id)} disabled={loading.delete} className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg"><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-white/10 border-t border-white/10 flex items-center justify-between text-sm">
        <span className="text-gray-400">Showing {paginatedItems.length} of {totalItems} users</span>
        <span className="text-gray-400">{selectedUsers.length} selected</span>
      </div>
    </div>
  );

  const UserModal = () => {
    if (!selectedUser) return null;
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl border border-white/20 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><User size={20} className="text-emerald-400" />User Details</h2>
            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4">
            {selectedUser.profileImage && (
              <div className="flex justify-center"><img src={selectedUser.profileImage} alt={selectedUser.name} className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500" /></div>
            )}
            <div className="bg-white/5 rounded-xl p-4"><p className="text-sm text-gray-400 mb-1">Name</p><p className="text-white font-semibold text-lg">{selectedUser.name || 'N/A'}</p></div>
            <div className="bg-white/5 rounded-xl p-4"><p className="text-sm text-gray-400 mb-1">Mobile Number</p><p className="text-white text-lg">{selectedUser.mobileNumber}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Status</p><StatusBadge status={selectedUser.status} /></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Verified</p>{selectedUser.isVerified ? <CheckCircle size={20} className="text-green-400" /> : <XCircle size={20} className="text-red-400" />}</div>
            </div>
            {selectedUser.location && (selectedUser.location.latitude || selectedUser.location.longitude) && (
              <div className="bg-white/5 rounded-xl p-4"><p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><MapPin size={14} />Location</p><p className="text-white">Lat: {selectedUser.location.latitude}, Lng: {selectedUser.location.longitude}</p></div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Joined</p><p className="text-white text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Last Updated</p><p className="text-white text-sm">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"><ArrowLeft size={18} /> Back</button>
      
      <div className="mb-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600"><Users size={24} className="text-white" /></div><div><h2 className="text-xl font-bold text-white">Hostel Users</h2><p className="text-gray-400">Total Users: {users.length}</p></div></div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by name or mobile..." value={localSearchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white" />{localSearchTerm && <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={16} /></button>}</div>
        <div className="flex items-center gap-2 ml-auto"><button onClick={exportToCSV} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20"><Download size={18} /></button><button onClick={fetchUsers} className="p-2.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20"><RefreshCw size={18} className={loading.fetch ? 'animate-spin' : ''} /></button></div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6"><div className="flex items-center gap-2 text-sm text-gray-400"><Filter size={16} className="text-emerald-400" /><span>Filter by Status:</span></div>{getUniqueFilters().map(status => (<button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === status ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>))}</div>

      {loading.fetch ? (<div className="flex justify-center py-20"><div className="relative"><div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><Users size={20} className="text-emerald-400 animate-pulse" /></div></div></div>) : paginatedItems.length === 0 ? (<div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10"><Users size={48} className="mx-auto text-gray-500 mb-4" /><p className="text-white font-bold text-lg">No users found</p></div>) : (<><UsersTable /><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} itemsPerPage={itemsPerPage} totalItems={totalItems} onItemsPerPageChange={changeItemsPerPage} /></>)}
      {showModal && <UserModal />}
    </div>
  );
};

export default HostelUsers;