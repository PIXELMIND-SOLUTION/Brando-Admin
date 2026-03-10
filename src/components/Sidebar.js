import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard, Building2, Users, UserCircle,
    MessageSquare, X, Menu, ChevronDown,
    List, PlusCircle, Eye, Star, Briefcase, UserPlus,
    ChevronLeft, ChevronRight,
    ImagesIcon
} from "lucide-react";
import { BsGenderNeuter } from "react-icons/bs";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/category", label: "Category", icon: BsGenderNeuter },
    {
        label: "Hostels",
        icon: Building2,
        children: [
            { to: "/dashboard/create-hostel", label: "Create Hostel", icon: PlusCircle },
            { to: "/dashboard/properties", label: "All Hostels", icon: List },
            { to: "/dashboard/properties/featured", label: "Featured", icon: Star },
            { to: "/dashboard/properties/views", label: "Views & Stats", icon: Eye },
        ],
    },
    {
        label: "Agents",
        icon: UserCircle,
        children: [
            { to: "/dashboard/agents", label: "All Agents", icon: List },
            { to: "/dashboard/agents/add", label: "Add Agent", icon: UserPlus },
            { to: "/dashboard/agents/active", label: "Active", icon: Briefcase },
        ],
    },
    { to: "/dashboard/banners", label: "Banners", icon: ImagesIcon },
    { to: "/dashboard/enquiries", label: "Enquiries", icon: MessageSquare },
];

// ── Dropdown ───────────────────────────────────────────────────────
const DropdownItem = ({ item, setMobileOpen, collapsed }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative group">
            <button
                onClick={() => !collapsed && setOpen(!open)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
          hover:bg-white/20
          ${open && !collapsed ? "bg-white/25" : ""}
          ${collapsed ? "justify-center" : ""}`}
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
                    <div className="bg-gradient-to-br from-red-500 to-yellow-500 rounded-2xl shadow-[0_8px_32px_rgba(255,0,0,0.4)] py-2 w-48 border border-white/20">
                        <p className="px-4 py-2 text-[10px] font-black text-white/70 uppercase tracking-widest border-b border-white/20 mb-1">
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
                  ${isActive ? "bg-white/30 text-white" : "text-white/80 hover:text-white hover:bg-white/20"}`
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
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-white/40 pl-3 pb-1">
                        {item.children.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                  ${isActive
                                        ? "bg-white/30 text-white ring-1 ring-white/40"
                                        : "text-white/80 hover:text-white hover:bg-white/20"
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
        <div className="flex flex-col h-full bg-gradient-to-b from-red-600 to-yellow-600 text-white">

            {/* Logo */}
            <div className={`flex items-center flex-shrink-0 border-b border-white/20
        ${isCollapsed ? "justify-center p-4" : "justify-between px-5 py-[18px]"}`}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                            <Building2 size={18} className="text-red-500" />
                        </div>
                        <div>
                            <span className="text-base font-black tracking-tight text-white">Brando</span>
                            <span className="block text-[10px] text-yellow-200 font-medium -mt-0.5 tracking-widest uppercase">Admin Panel</span>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <Building2 size={18} className="text-red-500" />
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(!isCollapsed)}
                    className="hidden md:flex items-center justify-center w-7 h-7 rounded-full
            bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0 text-white"
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
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
                            end={item.to === "/"}
                            onClick={() => setMobileOpen(false)}
                            title={isCollapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold tracking-wide
                ${isCollapsed ? "justify-center" : ""}
                ${isActive
                                    ? "bg-white/30 text-white shadow-inner ring-1 ring-white/30"
                                    : "text-white/80 hover:text-white hover:bg-white/20"
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
            <div className="flex-shrink-0 border-t border-white/20 p-3">
                <div className={`flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl p-2.5
          ${isCollapsed ? "justify-center" : ""}`}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-red-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white text-sm font-black">A</span>
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold leading-tight truncate text-white">Admin User</p>
                            <p className="text-[11px] text-yellow-200 truncate">Super Admin</p>
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
                className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl text-white bg-gradient-to-r from-red-500 to-yellow-500 shadow-[0_4px_16px_rgba(255,0,0,0.4)]"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div className={`
        fixed top-0 left-0 h-full w-64 z-40 md:hidden
        transform transition-transform duration-300 ease-in-out
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
        </>
    );
};

export default Sidebar;