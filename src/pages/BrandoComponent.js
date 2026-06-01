import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, UserCircle, ShoppingBag, Receipt,
    ArrowUpRight, Sparkles, TrendingUp, Package,
    CalendarDays, UserPlus, PlusCircle, Box,
    Image, Tag, MessageCircle, LayoutTemplate,
} from "lucide-react";
import { FaPercentage } from "react-icons/fa";

const tabs = [
    { key: "users", label: "Users", icon: Users },
    { key: "vendors", label: "Vendors", icon: UserCircle },
];

const data = {
    users: {
        sections: [
            {
                label: "Users",
                cards: [
                    { title: "Today's users", value: "0", route: "/dashboard/customers", icon: UserPlus, ic: "blue" },
                    { title: "Total users", value: "12,540", route: "/dashboard/customers", icon: Users, ic: "teal" },
                ],
            },
            {
                label: "Shopping Orders",
                cards: [
                    { title: "Today's orders", value: "0", route: "/dashboard/todays-user-orders", icon: ShoppingBag, ic: "coral" },
                    { title: "Total orders", value: "8,920", route: "/dashboard/user-orders", icon: Receipt, ic: "pink" },
                ],
            },
            {
                label: "Hostel Bookings",
                cards: [
                    { title: "Today's bookings", value: "42", route: "/dashboard/bookings", icon: CalendarDays, ic: "purple" },
                    { title: "Total bookings", value: "1,240", route: "/dashboard/bookings", icon: CalendarDays, ic: "amber" },
                ],
            },
        ],
        quickLinks: [
            { label: "Banners", icon: Image, route: "/dashboard/banners", ic: "purple" },
            { label: "Offers", icon: Tag, route: "/dashboard/offers", ic: "coral" },
            { label: "Shopping", icon: ShoppingBag, route: "/dashboard/create-product", ic: "teal" },
            // { label: "Messages", icon: MessageCircle, route: "/dashboard/messages", ic: "blue" },
            { label: "Shopping banners", icon: LayoutTemplate, route: "/dashboard/product-banners", ic: "amber" },
        ],
    },
    vendors: {
        sections: [
            {
                label: "Vendors",
                cards: [
                    { title: "Today's vendors", value: "42", route: "/dashboard/vendors/pending", icon: UserCircle, ic: "purple" },
                    { title: "Total vendors", value: "1,240", route: "/dashboard/vendors", icon: UserCircle, ic: "teal" },
                ],
            },
            {
                label: "Vendor Shopping orders",
                cards: [
                    { title: "Today's orders", value: "89", route: "/dashboard/todays-vendor-orders", icon: ShoppingBag, ic: "amber" },
                    { title: "Total orders", value: "5,820", route: "/dashboard/vendor-orders", icon: Package, ic: "coral" },
                ],
            },
        ],
        quickLinks: [
            { label: "Banners", icon: Image, route: "/dashboard/vendor-banners", ic: "purple" },
            { label: "Shopping", icon: ShoppingBag, route: "/dashboard/create-product", ic: "teal" },
            // { label: "Messages", icon: MessageCircle, route: "/dashboard/vendor-messages", ic: "blue" },
            { label: "Discount", icon: FaPercentage, route: "/dashboard/vendor-discount", ic: "blue" },
        ],
    },
};

const iconColors = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    teal: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    coral: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    pink: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
    green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
};

const StatCard = ({ card, navigate }) => {
    const Icon = card.icon;
    const c = iconColors[card.ic];
    return (
        <div
            onClick={() => navigate(card.route)}
            className={`relative cursor-pointer rounded-2xl p-4 border ${c.border} ${c.bg} hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 group`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        {card.title}
                    </p>

                    <div className="flex items-end gap-2 mt-1.5 flex-wrap">
                        {/* unread value */}
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate leading-none">
                            {card.value}
                        </h2>

                        {/* light gray count total value*/}
                        <span className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                            100
                        </span>
                    </div>
                </div>
                {/* <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                    <Icon size={20} className={c.text} />
                </div> */}
            </div>
            <div className="mt-4 flex items-center gap-1 text-white/40 text-xs font-semibold group-hover:text-white/70 transition-colors">
                View <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
            className={`cursor-pointer rounded-2xl p-4 border ${c.border} ${c.bg} hover:-translate-y-0.5 transition-all duration-200 group flex flex-col items-center justify-center gap-2 text-center`}
        >
            <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={20} className={c.text} />
            </div>
            <p className="text-[11px] font-semibold text-gray-400 group-hover:text-white transition-colors leading-tight">
                {item.label}
            </p>
        </div>
    );
};

const BrandoComponent = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("users");
    const current = data[activeTab];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] p-4 sm:p-6">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        Brando Overview <Sparkles size={18} className="text-cyan-400" />
                    </h1>
                    <p className="text-gray-400 mt-0.5 text-xs sm:text-sm">
                        Analytics overview and platform statistics
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Live Dashboard</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border
              ${activeTab === key
                                ? "bg-white text-gray-900 border-white"
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
                {current.sections.map((section) => (
                    <div key={section.label}>
                        <p className="text-[11px] font-semibold text-white uppercase tracking-widest mb-3">
                            {section.label}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {section.cards.map((card, i) => (
                                <StatCard key={i} card={card} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                ))}

                {current.quickLinks.length > 0 && (
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
                            Quick links
                        </p>
                        <div className={`grid gap-3 ${current.quickLinks.length === 5 ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3"}`}>
                            {current.quickLinks.map((item, i) => (
                                <QuickLinkCard key={i} item={item} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandoComponent;