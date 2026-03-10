import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Eye, Trash2, Calendar, MapPin, 
  Star, IndianRupee, Users, Image as ImageIcon,
  Filter, Sparkles, LayoutGrid, X, Table2,
  Grid3x3, ChevronDown, Download, RefreshCw,
  SortAsc, SortDesc, Search, TrendingUp,
  BadgeCheck, Clock, Home, Tag, Hash
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
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, delete: false });
  const [error, setError] = useState("");
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedHostels, setSelectedHostels] = useState([]);

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
      fetchHostels();
      setSelectedHostels(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', error.response?.data?.message || "Could not delete hostel");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedHostels.length === 0) {
      showAlert('warning', 'No selection', 'Please select hostels to delete');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Selected?',
      text: `You are about to delete ${selectedHostels.length} hostels`,
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
      
      // Delete sequentially
      for (const id of selectedHostels) {
        await axios.delete(`${API}/deleteHostel/${id}`);
      }
      
      showAlert('success', 'Deleted!', `${selectedHostels.length} hostels deleted`, 2000);
      fetchHostels();
      setSelectedHostels([]);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Delete failed', 'Could not delete some hostels');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // View hostel details
  const viewHostel = (id) => {
    navigate(`/dashboard/hostels/${id}`);
  };

  // Filter and sort hostels
  const getUniqueCategories = () => {
    return ['All', ...new Set(hostels.map(h => h.categoryId?.name).filter(Boolean))];
  };

  const filteredAndSortedHostels = () => {
    let filtered = filter === 'All' 
      ? hostels 
      : hostels.filter(h => h.categoryId?.name === filter);

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.categoryId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'categoryId') {
        aVal = a.categoryId?.name || '';
        bVal = b.categoryId?.name || '';
      } else if (sortConfig.key === 'price') {
        aVal = a.monthlyAdvance || 0;
        bVal = b.monthlyAdvance || 0;
      } else if (sortConfig.key === 'sharings') {
        aVal = a.sharings?.length || 0;
        bVal = b.sharings?.length || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedHostels.length === filteredAndSortedHostels().length) {
      setSelectedHostels([]);
    } else {
      setSelectedHostels(filteredAndSortedHostels().map(h => h._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedHostels(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = filteredAndSortedHostels();
    const headers = ['Name', 'Category', 'Rating', 'Address', 'Advance', 'Sharing Options', 'Images', 'Created'];
    
    const csvData = data.map(h => [
      h.name,
      h.categoryId?.name || 'N/A',
      h.rating,
      h.address,
      h.monthlyAdvance,
      h.sharings?.length || 0,
      h.images?.length || 0,
      new Date(h.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostels_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Premium Components
  const PageHeader = ({ icon: Icon, title, subtitle, actions }) => (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-yellow-500/5 rounded-3xl -z-10 blur-3xl" />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-[0_10px_40px_rgba(255,0,0,0.3)]">
              <Icon size={24} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              {title}
              <BadgeCheck size={20} className="text-yellow-500" />
            </h1>
            <p className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 font-medium flex items-center gap-2">
              <TrendingUp size={14} />
              {subtitle}
            </p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );

  const StatsCard = () => {
    const stats = [
      { label: 'Total Hostels', value: hostels.length, icon: Building2, color: 'from-red-500 to-yellow-500' },
      { label: 'Categories', value: getUniqueCategories().length - 1, icon: Tag, color: 'from-blue-500 to-indigo-500' },
      { label: 'Total Images', value: hostels.reduce((acc, h) => acc + (h.images?.length || 0), 0), icon: ImageIcon, color: 'from-purple-500 to-pink-500' },
      { label: 'Avg Rating', value: (hostels.reduce((acc, h) => acc + (h.rating || 0), 0) / hostels.length || 0).toFixed(1), icon: Star, color: 'from-green-500 to-emerald-500' }
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-100 p-4 
            shadow-[0_4px_20px_rgba(255,0,0,0.08)] hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white 
                group-hover:scale-110 transition-transform`}>
                <stat.icon size={16} />
              </div>
              <Sparkles size={16} className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    );
  };

  const ViewToggle = () => (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
          viewMode === 'grid' 
            ? 'bg-white text-red-500 shadow-md' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Grid3x3 size={18} />
        <span className="text-sm font-medium hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => setViewMode('table')}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
          viewMode === 'table' 
            ? 'bg-white text-red-500 shadow-md' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Table2 size={18} />
        <span className="text-sm font-medium hidden sm:inline">Table</span>
      </button>
    </div>
  );

  const SearchBar = () => (
    <div className="relative flex-1 max-w-md">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search hostels by name, address, category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-red-100 bg-white/50 
          focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all
          placeholder:text-gray-400 text-sm"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );

  const FilterBar = () => {
    const categories = getUniqueCategories();
    
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={16} className="text-red-400" />
          <span className="font-medium">Filter:</span>
        </div>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
              ${filter === cat 
                ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  };

  const ActionBar = () => (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <SearchBar />
      <div className="flex items-center gap-2 ml-auto">
        {selectedHostels.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white 
              font-medium text-sm hover:bg-red-600 transition-all shadow-lg"
          >
            <Trash2 size={16} />
            Delete ({selectedHostels.length})
          </button>
        )}
        <button
          onClick={exportToCSV}
          className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          title="Export to CSV"
        >
          <Download size={18} />
        </button>
        <button
          onClick={fetchHostels}
          className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading.fetch ? 'animate-spin' : ''} />
        </button>
        <ViewToggle />
      </div>
    </div>
  );

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <SortAsc size={14} className="opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const TableView = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-100 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-red-50 to-yellow-50 border-b-2 border-red-200">
              <th className="px-4 py-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedHostels.length === filteredAndSortedHostels().length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-red-300 text-red-500 focus:ring-red-500"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-black text-transparent 
                    bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 uppercase 
                    tracking-wider group"
                >
                  <Home size={14} className="text-red-400" />
                  Hostel Name
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('categoryId')}
                  className="flex items-center gap-2 text-xs font-black text-transparent 
                    bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 uppercase 
                    tracking-wider group"
                >
                  <Tag size={14} className="text-red-400" />
                  Category
                  <SortIcon column="categoryId" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('rating')}
                  className="flex items-center gap-2 text-xs font-black text-transparent 
                    bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 uppercase 
                    tracking-wider group"
                >
                  <Star size={14} className="text-red-400" />
                  Rating
                  <SortIcon column="rating" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('address')}
                  className="flex items-center gap-2 text-xs font-black text-transparent 
                    bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 uppercase 
                    tracking-wider group"
                >
                  <MapPin size={14} className="text-red-400" />
                  Address
                  <SortIcon column="address" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-2 text-xs font-black text-transparent 
                    bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 uppercase 
                    tracking-wider group"
                >
                  <IndianRupee size={14} className="text-red-400" />
                  Advance
                  <SortIcon column="price" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('sharings')}
                  className="flex items-center gap-2 text-xs font-black text-transparent 
                    bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 uppercase 
                    tracking-wider group"
                >
                  <Users size={14} className="text-red-400" />
                  Sharing
                  <SortIcon column="sharings" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button 
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-2 text-xs font-black text-transparent 
                    bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 uppercase 
                    tracking-wider group"
                >
                  <Calendar size={14} className="text-red-400" />
                  Created
                  <SortIcon column="createdAt" />
                </button>
              </th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedHostels().map((hostel) => (
              <tr 
                key={hostel._id} 
                className="border-b border-red-50 hover:bg-gradient-to-r hover:from-red-50/30 
                  hover:to-yellow-50/30 transition-all duration-300 group"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedHostels.includes(hostel._id)}
                    onChange={() => toggleSelect(hostel._id)}
                    className="w-4 h-4 rounded border-red-300 text-red-500 focus:ring-red-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-100 to-yellow-100 
                      flex items-center justify-center overflow-hidden">
                      {hostel.images[0] ? (
                        <img src={hostel.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={14} className="text-red-400" />
                      )}
                    </div>
                    <span className="font-semibold text-gray-800">{hostel.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-yellow-100 
                    rounded-lg text-xs font-semibold text-red-600">
                    {hostel.categoryId?.name || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{hostel.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-4 max-w-xs">
                  <p className="text-sm text-gray-600 truncate">{hostel.address}</p>
                </td>
                <td className="px-4 py-4 font-semibold text-gray-800">
                  {formatCurrency(hostel.monthlyAdvance)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-red-400" />
                    <span>{hostel.sharings?.length || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-red-400" />
                    {new Date(hostel.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => viewHostel(hostel._id)}
                      className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 
                        text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(hostel._id)}
                      disabled={loading.delete}
                      className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 
                        text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-yellow-50 border-t border-red-100 
        flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Showing {filteredAndSortedHostels().length} of {hostels.length} hostels
        </span>
        <span className="text-gray-500">
          {selectedHostels.length} selected
        </span>
      </div>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredAndSortedHostels().map(hostel => (
        <div key={hostel._id} className="bg-white rounded-xl border border-red-100 overflow-hidden 
          hover:shadow-xl transition-all group relative">
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selectedHostels.includes(hostel._id)}
              onChange={() => toggleSelect(hostel._id)}
              className="w-4 h-4 rounded border-red-300 text-red-500 focus:ring-red-500"
            />
          </div>
          <div className="relative h-40 sm:h-48 bg-gray-100">
            <img 
              src={hostel.images[0]} 
              alt={hostel.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button onClick={() => viewHostel(hostel._id)}
                className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:bg-white">
                <Eye size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button onClick={() => handleDelete(hostel._id)}
                disabled={loading.delete}
                className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-white">
                <Trash2 size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
            <div className="absolute top-2 left-8 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
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
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-red-100 to-yellow-100 rounded-full text-red-600 font-semibold whitespace-nowrap">
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
                onClick={() => viewHostel(hostel._id)}
                className="text-red-500 hover:text-red-600 font-semibold"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <PageHeader 
        icon={LayoutGrid} 
        title="Hostel Management" 
        subtitle={`${hostels.length} properties • ${getUniqueCategories().length - 1} categories`}
      />

      <StatsCard />
      <ActionBar />
      <FilterBar />
     
      
      {loading.fetch ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 size={20} className="text-red-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : filteredAndSortedHostels().length === 0 ? (
        <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-red-100">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-yellow-100 
            flex items-center justify-center">
            <Building2 size={32} className="text-red-400" />
          </div>
          <p className="text-gray-600 font-bold text-lg mb-2">No hostels found</p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try adjusting your search' : filter !== 'All' ? 'Try a different category' : ''}
          </p>
          {(searchTerm || filter !== 'All') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilter('All'); }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white 
                rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? <GridView /> : <TableView />}
          
          {/* Stats Card */}
          <div className="mt-6 bg-gradient-to-br from-red-50 to-yellow-50 rounded-xl p-4 
            border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 
                flex items-center justify-center text-white font-bold text-lg">
                {filteredAndSortedHostels().length}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">
                  {filter === 'All' ? 'Total Hostels' : `${filter} Hostels`}
                </p>
                <p className="text-xs text-gray-500">
                  {filter === 'All' ? 'Across all categories' : `Filtered by category`}
                  {searchTerm && ` • Search: "${searchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Avg. Rating</p>
                <p className="font-bold text-gray-800">
                  {(filteredAndSortedHostels().reduce((acc, h) => acc + (h.rating || 0), 0) / 
                    filteredAndSortedHostels().length || 0).toFixed(1)}
                </p>
              </div>
              <Sparkles size={20} className="text-yellow-500" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Hostels;