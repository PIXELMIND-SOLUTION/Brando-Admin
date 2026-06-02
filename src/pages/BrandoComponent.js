import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Users,
    UserCircle,
    ShoppingBag,
    Receipt,
    ArrowUpRight,
    Sparkles,
    TrendingUp,
    Package,
    CalendarDays,
    UserPlus,
    Image,
    Tag,
    LayoutTemplate,
    RefreshCw,
    Play,
    Pause,
    Clock,
    CheckCircle,
} from "lucide-react";
import { FaPercentage } from "react-icons/fa";

const tabs = [
    { key: "users", label: "Users", icon: Users },
    { key: "vendors", label: "Vendors", icon: UserCircle },
];

const iconColors = {
    blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
        hover: "hover:border-blue-500/40",
    },
    teal: {
        bg: "bg-teal-500/10",
        text: "text-teal-400",
        border: "border-teal-500/20",
        hover: "hover:border-teal-500/40",
    },
    purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
        hover: "hover:border-purple-500/40",
    },
    amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        hover: "hover:border-amber-500/40",
    },
    coral: {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
        hover: "hover:border-orange-500/40",
    },
    pink: {
        bg: "bg-pink-500/10",
        text: "text-pink-400",
        border: "border-pink-500/20",
        hover: "hover:border-pink-500/40",
    },
};

const showAlert = (icon, title, text) => {
    Swal.fire({
        icon,
        title,
        text,
        background: '#0f172a',
        color: '#fff',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
            popup: 'rounded-xl text-sm',
        },
    });
};

const StatCard = ({ card, navigate }) => {
    const c = iconColors[card.ic];
    const percentage = card.total > 0 ? (card.value / card.total) * 100 : 0;

    return (
        <div
            onClick={() => navigate(card.route)}
            className={`relative cursor-pointer rounded-2xl p-4 border ${c.border} ${c.bg} ${c.hover} hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 group overflow-hidden`}
        >
            {/* Progress bar background */}
            <div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        {card.title}
                    </p>

                    <div className="flex items-end gap-2 mt-1.5 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate leading-none">
                            {card.value?.toLocaleString() || 0}
                        </h2>                      
                    </div>
                </div>

                <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                    <card.icon size={18} className={c.text} />
                </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-white/40 text-xs font-semibold group-hover:text-white/70 transition-colors">
                View Details
                <ArrowUpRight
                    size={12}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
            </div>
        </div>
    );
};

const QuickLinkCard = ({ item, navigate }) => {
    const Icon = item.icon;
    const c = iconColors[item.ic];

    return (
        <div
            onClick={() => navigate(item.route)}
            className={`cursor-pointer rounded-2xl p-3 sm:p-4 border ${c.border} ${c.bg} ${c.hover} hover:-translate-y-0.5 transition-all duration-200 group flex flex-col items-center justify-center gap-2 text-center`}
        >
            <div
                className={`p-2 sm:p-2.5 rounded-xl ${c.bg} border ${c.border} group-hover:scale-110 transition-transform duration-200`}
            >
                <Icon size={18} className={c.text} />
            </div>

            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 group-hover:text-white transition-colors leading-tight">
                {item.label}
            </p>
        </div>
    );
};

const BrandoComponent = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("users");
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const intervalRef = useRef(null);

    const [stats, setStats] = useState({
        usersToday: 0,
        usersTotal: 0,
        vendorsToday: 0,
        vendorsTotal: 0,
        userOrdersToday: 0,
        userOrdersTotal: 0,
        vendorOrdersToday: 0,
        vendorOrdersTotal: 0,
        hostelToday: 0,
        hostelTotal: 0,
    });

    const fetchStats = useCallback(async (showNotification = false) => {
        try {
            setIsLoading(true);
            const [
                usersRes,
                vendorsRes,
                userOrdersRes,
                vendorOrdersRes,
                hostelRes,
            ] = await Promise.all([
                axios.get("https://api.brando.org.in/api/admin/stats/users"),
                axios.get("https://api.brando.org.in/api/admin/stats/vendors"),
                axios.get("https://api.brando.org.in/api/admin/stats/user-orders"),
                axios.get("https://api.brando.org.in/api/admin/stats/vendor-orders"),
                axios.get("https://api.brando.org.in/api/admin/stats/hostel-bookings"),
            ]);

            const newStats = {
                usersToday: usersRes.data?.data?.today?.count || 0,
                usersTotal: usersRes.data?.data?.total?.count || 0,
                vendorsToday: vendorsRes.data?.data?.today?.count || 0,
                vendorsTotal: vendorsRes.data?.data?.total?.count || 0,
                userOrdersToday: userOrdersRes.data?.data?.today?.count || 0,
                userOrdersTotal: userOrdersRes.data?.data?.total?.count || 0,
                vendorOrdersToday: vendorOrdersRes.data?.data?.today?.count || 0,
                vendorOrdersTotal: vendorOrdersRes.data?.data?.total?.count || 0,
                hostelToday: hostelRes.data?.data?.today?.count || 0,
                hostelTotal: hostelRes.data?.data?.total?.count || 0,
            };

            setStats(newStats);
            setLastUpdated(new Date());
            setRefreshCount(prev => prev + 1);

            if (showNotification) {
                showAlert('success', 'Data Updated', 'Statistics refreshed successfully');
            }
        } catch (error) {
            console.error("Stats Fetch Error:", error);
            if (showNotification) {
                showAlert('error', 'Fetch Failed', 'Could not update statistics');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-refresh logic
    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchStats(false);
            }, 2000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, fetchStats]);

    // Initial fetch
    useEffect(() => {
        fetchStats(false);
    }, [fetchStats]);

    const toggleAutoRefresh = () => {
        const newState = !autoRefresh;
        setAutoRefresh(newState);
        showAlert(
            'info',
            newState ? 'Auto-Refresh Enabled' : 'Auto-Refresh Disabled',
            newState ? 'Stats will update every 2 seconds' : 'Manual refresh only'
        );
    };

    const handleManualRefresh = () => {
        fetchStats(true);
    };

    const data = {
        users: {
            sections: [
                {
                    label: "Users",
                    cards: [
                        {
                            title: "Today's users",
                            value: stats.usersToday,
                            total: stats.usersTotal,
                            route: "/dashboard/customers?filter=today",
                            icon: UserPlus,
                            ic: "blue",
                        },
                        {
                            title: "Total users",
                            value: stats.usersTotal,
                            total: stats.usersTotal,
                            route: "/dashboard/customers",
                            icon: Users,
                            ic: "teal",
                        },
                    ],
                },
                {
                    label: "Shopping Orders",
                    cards: [
                        {
                            title: "Today's orders",
                            value: stats.userOrdersToday,
                            total: stats.userOrdersTotal,
                            route: "/dashboard/product-bookings?filter=today&orderType=user",
                            icon: ShoppingBag,
                            ic: "coral",
                        },
                        {
                            title: "Total orders",
                            value: stats.userOrdersTotal,
                            total: stats.userOrdersTotal,
                            route: "/dashboard/product-bookings?orderType=user",
                            icon: Receipt,
                            ic: "pink",
                        },
                    ],
                },
                {
                    label: "Hostel Bookings",
                    cards: [
                        {
                            title: "Today's bookings",
                            value: stats.hostelToday,
                            total: stats.hostelTotal,
                            route: "/dashboard/bookings?filter=today",
                            icon: CalendarDays,
                            ic: "purple",
                        },
                        {
                            title: "Total bookings",
                            value: stats.hostelTotal,
                            total: stats.hostelTotal,
                            route: "/dashboard/bookings",
                            icon: CalendarDays,
                            ic: "amber",
                        },
                    ],
                },
            ],
            quickLinks: [
                {
                    label: "Banners",
                    icon: Image,
                    route: "/dashboard/banners",
                    ic: "purple",
                },
                {
                    label: "Offers",
                    icon: Tag,
                    route: "/dashboard/offers",
                    ic: "coral",
                },
                {
                    label: "Shopping",
                    icon: ShoppingBag,
                    route: "/dashboard/create-product",
                    ic: "teal",
                },
                {
                    label: "Shopping banners",
                    icon: LayoutTemplate,
                    route: "/dashboard/product-banners",
                    ic: "amber",
                },
            ],
        },

        vendors: {
            sections: [
                {
                    label: "Vendors",
                    cards: [
                        {
                            title: "Today's vendors",
                            value: stats.vendorsToday,
                            total: stats.vendorsTotal,
                            route: "/dashboard/vendors?filter=today",
                            icon: UserCircle,
                            ic: "purple",
                        },
                        {
                            title: "Total vendors",
                            value: stats.vendorsTotal,
                            total: stats.vendorsTotal,
                            route: "/dashboard/vendors",
                            icon: UserCircle,
                            ic: "teal",
                        },
                    ],
                },
                {
                    label: "Vendor Shopping Orders",
                    cards: [
                        {
                            title: "Today's orders",
                            value: stats.vendorOrdersToday,
                            total: stats.vendorOrdersTotal,
                            route: "/dashboard/product-bookings?filter=today&orderType=vendor",
                            icon: ShoppingBag,
                            ic: "amber",
                        },
                        {
                            title: "Total orders",
                            value: stats.vendorOrdersTotal,
                            total: stats.vendorOrdersTotal,
                            route: "/dashboard/product-bookings?orderType=vendor",
                            icon: Package,
                            ic: "coral",
                        },
                    ],
                },
            ],

            quickLinks: [
                {
                    label: "Banners",
                    icon: Image,
                    route: "/dashboard/vendor-banners",
                    ic: "purple",
                },
                {
                    label: "Shopping",
                    icon: ShoppingBag,
                    route: "/dashboard/create-product",
                    ic: "teal",
                },
                {
                    label: "Discount",
                    icon: FaPercentage,
                    route: "/dashboard/vendor-discount",
                    ic: "blue",
                },
            ],
        },
    };

    const current = data[activeTab];

    // Calculate summary stats
    const getSummaryStats = () => {
        if (activeTab === 'users') {
            const todayTotal = stats.usersToday + stats.userOrdersToday + stats.hostelToday;
            const overallTotal = stats.usersTotal + stats.userOrdersTotal + stats.hostelTotal;
            return { todayTotal, overallTotal };
        } else {
            const todayTotal = stats.vendorsToday + stats.vendorOrdersToday;
            const overallTotal = stats.vendorsTotal + stats.vendorOrdersTotal;
            return { todayTotal, overallTotal };
        }
    };

    const summary = getSummaryStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        Brando Overview <Sparkles size={18} className="text-cyan-400" />
                    </h1>
                    <p className="text-gray-400 mt-0.5 text-xs sm:text-sm">
                        Real-time analytics and platform statistics
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Auto-refresh toggle */}
                    <button
                        onClick={toggleAutoRefresh}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border
              ${autoRefresh
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30'
                            }`}
                    >
                        {autoRefresh ? <Pause size={14} /> : <Play size={14} />}
                        {autoRefresh ? 'Auto ON' : 'Auto OFF'}
                    </button>

                    {/* Manual refresh button */}
                    <button
                        onClick={handleManualRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all border border-white/10 text-xs font-semibold disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {/* Live indicator */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        {autoRefresh ? (
                            <>
                                <div className="relative">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </div>
                                <span className="text-xs font-semibold text-white">Live</span>
                            </>
                        ) : (
                            <>
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-xs font-semibold text-gray-400">Paused</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Last updated info */}
            {lastUpdated && (
                <div className="flex items-center justify-end gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-lg">
                        <Clock size={10} />
                        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        {autoRefresh && (
                            <span className="text-emerald-400 ml-1">
                                • Auto-refreshing
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border whitespace-nowrap
              ${activeTab === key
                                ? "bg-white text-gray-900 border-white shadow-lg"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Sections */}
            <div className="space-y-6">
                {current.sections.map((section, sectionIdx) => (
                    <div key={section.label}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] sm:text-[11px] font-semibold text-white uppercase tracking-widest">
                                {section.label}
                            </p>
                            {sectionIdx === 0 && autoRefresh && (
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[9px] text-gray-500">Live</span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {section.cards.map((card, i) => (
                                <StatCard key={i} card={card} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                ))}

                {current.quickLinks.length > 0 && (
                    <div>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
                            Quick Links
                        </p>
                        <div className={`grid gap-3 ${current.quickLinks.length === 5
                                ? "grid-cols-3 sm:grid-cols-5"
                                : current.quickLinks.length === 4
                                    ? "grid-cols-2 sm:grid-cols-4"
                                    : "grid-cols-3"
                            }`}>
                            {current.quickLinks.map((item, i) => (
                                <QuickLinkCard key={i} item={item} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 text-center">
                <p className="text-[9px] sm:text-[10px] text-gray-500">
                    {autoRefresh
                        ? `Auto-refreshing every 2 seconds • ${refreshCount} updates performed`
                        : `Auto-refresh paused • Click play to enable live updates`}
                </p>
            </div>
        </div>
    );
};

export default BrandoComponent;