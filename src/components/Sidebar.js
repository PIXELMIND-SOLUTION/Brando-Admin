import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard, Building2, Users, UserCircle,
    MessageSquare, X, Menu, ChevronDown,
    List, PlusCircle, Eye, Star, Briefcase, UserPlus,
    ChevronLeft, ChevronRight,
    ImagesIcon,
    BookMarked,
    Bell
} from "lucide-react";
import { BsGenderNeuter } from "react-icons/bs";
import logo from "../assets/logo.png"

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/customers", label: "Customers", icon: Users },
    { to: "/dashboard/category", label: "Category", icon: BsGenderNeuter },
    {
        label: "Hostels",
        icon: Building2,
        children: [
            // { to: "/dashboard/create-hostel", label: "Create Hostel", icon: PlusCircle },
            { to: "/dashboard/hostels", label: "All Hostels", icon: List },
        ],
    },
    {
        label: "Vendors",
        icon: UserCircle,
        children: [
            { to: "/dashboard/vendors", label: "All Vendors", icon: List },
            { to: "/dashboard/vendors/pending", label: "Pending", icon: Eye }
        ],
    },
    {
        label: "Bookings",
        icon: BookMarked,
        children: [
            { to: "/dashboard/bookings", label: "All Bookings", icon: PlusCircle },
        ],
    },
    {
        label: "Banners",
        icon: ImagesIcon,
        children: [
            { to: "/dashboard/banners", label: "User Banners", icon: PlusCircle },
            { to: "/dashboard/vendor-banners", label: "Vendor Banners", icon: PlusCircle },
        ],
    },
    { to: "/dashboard/enquiries", label: "Enquiries", icon: MessageSquare },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

// ── Dropdown ───────────────────────────────────────────────────────
const DropdownItem = ({ item, setMobileOpen, collapsed }) => {
    const [open, setOpen] = useState(false);

    // Check if any child route is active
    const isChildActive = (children) => {
        const currentPath = window.location.pathname;
        return children.some(child => currentPath === child.to);
    };

    const hasActiveChild = isChildActive(item.children);

    return (
        <div className="relative group">
            <button
                onClick={() => !collapsed && setOpen(!open)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
          ${collapsed ? "justify-center" : ""}
          ${open && !collapsed ? "bg-white/20" : ""}
          ${hasActiveChild && !collapsed && !open ? "bg-white/10 ring-1 ring-white/30" : ""}
          hover:bg-white/20`}
            >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                    <>
                        <span className="flex-1 text-left tracking-wide">{item.label}</span>
                        <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 opacity-70 ${open ? "rotate-180" : ""}`}
                        />
                    </>
                )}
            </button>

            {/* Collapsed flyout */}
            {collapsed && (
                <div className="absolute left-full top-0 ml-3 z-50 hidden group-hover:block">
                    <div className="bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 w-48 border border-white/20 backdrop-blur-sm">
                        <p className="px-4 py-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-white/20 mb-1">
                            {item.label}
                        </p>
                        {item.children.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all
                  ${isActive
                                        ? "bg-emerald-500/30 text-white border-l-2 border-emerald-400"
                                        : "text-white/80 hover:text-white hover:bg-white/10"}`
                                }
                            >
                                <Icon size={13} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* Expanded inline */}
            {!collapsed && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out
          ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                >
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-white/20 pl-3 pb-1">
                        {item.children.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                  ${isActive
                                        ? "bg-emerald-500/30 text-white border-l-2 border-emerald-400"
                                        : "text-white/80 hover:text-white hover:bg-white/10"
                                    }`
                                }
                            >
                                <Icon size={13} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Sidebar ───────────────────────────────────────────────────
const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const sidebarContent = (isCollapsed) => (
        <div className="flex flex-col h-full bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white shadow-xl">

            {/* Logo */}
            <div className={`flex items-center flex-shrink-0 border-b border-white/10
        ${isCollapsed ? "justify-center p-4" : "justify-between px-5 py-[18px]"}`}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={logo}
                                alt="Brando Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div>
                            <span className="text-base font-black tracking-tight text-white">
                                Brando
                            </span>
                            <span className="block text-[10px] text-emerald-400 font-medium -mt-0.5 tracking-widest uppercase">
                                Admin Panel
                            </span>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={logo}
                            alt="Brando Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(!isCollapsed)}
                    className="hidden md:flex items-center justify-center w-7 h-7 rounded-full
            bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 text-white hover:scale-110"
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {navItems.map((item) =>
                    item.children ? (
                        <DropdownItem
                            key={item.label}
                            item={item}
                            setMobileOpen={setMobileOpen}
                            collapsed={isCollapsed}
                        />
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/dashboard"}
                            onClick={() => setMobileOpen(false)}
                            title={isCollapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold tracking-wide
                ${isCollapsed ? "justify-center" : ""}
                ${isActive
                                    ? "bg-emerald-500/30 text-white ring-1 ring-emerald-400/50"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                                }`
                            }
                        >
                            <item.icon size={18} className="flex-shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    )
                )}
            </nav>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-white/10 p-3">
                <div className={`flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-2.5
          ${isCollapsed ? "justify-center" : ""} hover:bg-white/10 transition-colors`}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white text-sm font-black">A</span>
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold leading-tight truncate text-white">Admin User</p>
                            <p className="text-[11px] text-emerald-400 truncate">Super Admin</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div className={`
        fixed top-0 left-0 h-full w-64 z-40 md:hidden
        transform transition-transform duration-300 ease-in-out
        shadow-2xl
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                {sidebarContent(false)}
            </div>

            {/* Desktop: fixed panel */}
            <div className={`
        hidden md:flex flex-col fixed top-0 left-0 h-screen z-20
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
      `}>
                {sidebarContent(collapsed)}
            </div>

            {/* Desktop: spacer */}
            <div className={`
        hidden md:block flex-shrink-0 transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `} />

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </>
    );
};

export default Sidebar;