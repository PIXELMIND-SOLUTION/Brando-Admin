import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Settings, LogOut, User, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";

const API = "http://187.127.146.52:2003/api/admin";

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const { data } = await axios.get(`${API}/allnotifications`);
      setNotifications(data.data || []);
      setUnreadCount(data.data?.filter(n => !n.isRead).length || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
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

    if (result.isConfirmed) {
      // Clear any auth tokens/storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      showAlert('success', 'Logged Out!', 'You have been logged out successfully', 1500);
      
      // Navigate to login page after short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  const handleSettings = () => {
    navigate('/dashboard/settings');
    setOpen(false);
  };

  const handleProfile = () => {
    navigate('/dashboard/profile');
    setOpen(false);
  };

  const handleNotificationClick = (notification) => {
    // Handle notification click - navigate to relevant page
    if (notification.type === 'hostel' && notification.relatedId) {
      navigate(`/dashboard/hostels/${notification.relatedId}`);
    } else if (notification.type === 'booking' && notification.relatedId) {
      navigate(`/dashboard/bookings/${notification.relatedId}`);
    }
    setNotificationsOpen(false);
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/updatenotification/${id}`, { isRead: true });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      for (const notification of notifications) {
        if (!notification.isRead) {
          await axios.put(`${API}/updatenotification/${notification._id}`, { isRead: true });
        }
      }
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const showAlert = (icon, title, text, timer) => Swal.fire({
    icon, title, text, timer,
    background: '#0f172a',
    color: '#fff',
    showConfirmButton: false,
    customClass: {
      popup: 'rounded-2xl',
    }
  });

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'hostel': return '🏨';
      case 'booking': return '📅';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'hostel': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'booking': return 'border-blue-500/30 bg-blue-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="bg-[#0f172a]/90 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] px-4 md:px-6 py-3 flex items-center justify-between gap-4 border-b border-white/10 sticky top-0 z-50">
        
        {/* Left section - Mobile Menu Button + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg">HostelAdmin</h1>
              <p className="text-[10px] text-emerald-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">

          {/* Settings Button */}
          <button 
            onClick={handleSettings}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Notifications Dropdown */}
          <div ref={notificationRef} className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-[#0f172a]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Menu */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 md:w-96 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[1000]"
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell size={14} className="text-emerald-400" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="text-xs text-emerald-400">({unreadCount} unread)</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button 
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => {
                            handleNotificationClick(notification);
                            if (!notification.isRead) markAsRead(notification._id);
                          }}
                          className={`p-4 hover:bg-white/5 transition-colors duration-200 cursor-pointer border-b border-white/5 last:border-0 ${
                            !notification.isRead ? 'bg-emerald-500/5' : ''
                          } ${getNotificationColor(notification.type)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-white truncate">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </p>
                              {notification.vendorId && (
                                <p className="text-xs text-emerald-400 mt-1">
                                  Vendor: {notification.vendorId.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bell size={32} className="text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No notifications</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 10 && (
                    <div className="p-3 border-t border-white/10 bg-white/5">
                      <button 
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/dashboard/notifications');
                        }}
                        className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-white/10 rounded-xl px-2.5 py-1.5 transition-colors duration-200"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-black overflow-hidden">
                <img src={logo} alt="Admin" className="w-full h-full object-cover" />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-white">Admin User</p>
                <p className="text-[11px] text-emerald-400">Super Admin</p>
              </div>

              <ChevronDown 
                size={14} 
                className={`text-gray-400 hidden sm:block transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[1000]"
                >
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold overflow-hidden">
                        <img src={logo} alt="Admin" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Admin User</p>
                        <p className="text-xs text-gray-400">admin@hostelbooking.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button 
                    onClick={handleProfile}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors duration-200"
                  >
                    <User size={16} /> 
                    Profile
                  </button>

                  <button 
                    onClick={handleSettings}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors duration-200"
                  >
                    <Settings size={16} /> 
                    Settings
                  </button>

                  <div className="border-t border-white/10" />

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    <LogOut size={16} /> 
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;