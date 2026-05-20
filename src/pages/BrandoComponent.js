// src/pages/BrandoComponent.js

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    UserCircle,
    ShoppingBag,
    Receipt,
    ArrowUpRight,
    Sparkles,
    TrendingUp,
    Package,
} from "lucide-react";

const BrandoComponent = () => {
    const navigate = useNavigate();

    const cards = [
        {
            title: "Today's Users",
            value: "128",
            route: "/dashboard/customers",
            icon: Users,
            gradient: "from-cyan-500 to-blue-600",
            bg: "from-cyan-500/10 to-blue-500/10",
            border: "border-cyan-500/20",
        },

        {
            title: "Total Users",
            value: "12,540",
            route: "/dashboard/customers",
            icon: Users,
            gradient: "from-emerald-500 to-green-600",
            bg: "from-emerald-500/10 to-green-500/10",
            border: "border-emerald-500/20",
        },

        {
            title: "Today's Vendors",
            value: "42",
            route: "/dashboard/vendors/pending",
            icon: UserCircle,
            gradient: "from-purple-500 to-pink-600",
            bg: "from-purple-500/10 to-pink-500/10",
            border: "border-purple-500/20",
        },

        {
            title: "Total Vendors",
            value: "1,240",
            route: "/dashboard/vendors",
            icon: UserCircle,
            gradient: "from-orange-500 to-red-500",
            bg: "from-orange-500/10 to-red-500/10",
            border: "border-orange-500/20",
        },

        {
            title: "Create Products",
            value: "245",
            route: "/dashboard/create-product",
            icon: Package,
            gradient: "from-lime-500 to-green-600",
            bg: "from-lime-500/10 to-green-500/10",
            border: "border-lime-500/20",
        },

        {
            title: "Total Products",
            value: "8,540",
            route: "/dashboard/products",
            icon: Package,
            gradient: "from-sky-500 to-cyan-600",
            bg: "from-sky-500/10 to-cyan-500/10",
            border: "border-sky-500/20",
        },

        {
            title: "Today's User Orders",
            value: "64",
            route: "/dashboard/todays-user-orders",
            icon: Receipt,
            gradient: "from-teal-500 to-cyan-600",
            bg: "from-teal-500/10 to-cyan-500/10",
            border: "border-teal-500/20",
        },

        {
            title: "Total User Orders",
            value: "8,920",
            route: "/dashboard/user-orders",
            icon: Receipt,
            gradient: "from-pink-500 to-rose-600",
            bg: "from-pink-500/10 to-rose-500/10",
            border: "border-pink-500/20",
        },

        {
            title: "Today's Vendor Orders",
            value: "89",
            route: "/dashboard/todays-vendor-orders",
            icon: ShoppingBag,
            gradient: "from-indigo-500 to-violet-600",
            bg: "from-indigo-500/10 to-violet-500/10",
            border: "border-indigo-500/20",
        },

        {
            title: "Total Vendor Orders",
            value: "5,820",
            route: "/dashboard/vendor-orders",
            icon: ShoppingBag,
            gradient: "from-yellow-500 to-orange-500",
            bg: "from-yellow-500/10 to-orange-500/10",
            border: "border-yellow-500/20",
        },

        {
            title: "Today's Hostel Bookings",
            value: "42",
            route: "/dashboard/bookings",
            icon: ShoppingBag,
            gradient: "from-purple-500 to-pink-600",
            bg: "from-purple-500/10 to-pink-500/10",
            border: "border-purple-500/20",
        },

        {
            title: "Total Hostel Bookings",
            value: "1,240",
            route: "/dashboard/bookings",
            icon: ShoppingBag,
            gradient: "from-orange-500 to-red-500",
            bg: "from-orange-500/10 to-red-500/10",
            border: "border-orange-500/20",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] p-3 sm:p-5 lg:p-6">

            {/* Header */}
            <div className="mb-6 sm:mb-8 flex items-center justify-between flex-wrap gap-4">

                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2 sm:gap-3">
                        Brando Overview
                        <Sparkles size={22} className="text-cyan-400" />
                    </h1>

                    <p className="text-gray-400 mt-1 text-xs sm:text-sm">
                        Analytics overview and platform statistics
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                    <TrendingUp size={16} className="text-emerald-400" />

                    <span className="text-sm font-semibold text-white">
                        Live Dashboard
                    </span>

                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6">

                {cards.map((card, index) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={index}
                            onClick={() => navigate(card.route)}
                            className={`
                relative overflow-hidden cursor-pointer
                rounded-2xl sm:rounded-3xl
                p-3 sm:p-5 lg:p-6
                border ${card.border}
                bg-gradient-to-br ${card.bg}
                backdrop-blur-xl
                hover:-translate-y-1
                hover:shadow-2xl
                transition-all duration-300
                group
              `}
                        >

                            {/* Glow */}
                            <div
                                className={`
                  absolute -top-16 -right-16
                  w-32 sm:w-40 h-32 sm:h-40
                  rounded-full blur-3xl opacity-20
                  bg-gradient-to-br ${card.gradient}
                `}
                            />

                            {/* Top */}
                            <div className="relative flex items-start justify-between gap-2">

                                <div className="min-w-0">

                                    <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-400 uppercase tracking-wider leading-tight">
                                        {card.title}
                                    </p>

                                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white mt-2 tracking-tight truncate">
                                        {card.value}
                                    </h2>

                                </div>

                                <div
                                    className={`
                    p-2.5 sm:p-3 lg:p-4
                    rounded-xl sm:rounded-2xl
                    text-white
                    bg-gradient-to-br ${card.gradient}
                    shadow-lg
                    group-hover:scale-110
                    transition-transform duration-300
                    flex-shrink-0
                  `}
                                >
                                    <Icon
                                        size={18}
                                        className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                                    />
                                </div>
                            </div>

                            {/* Bottom */}
                            <div className="relative mt-5 sm:mt-8 flex items-center justify-between gap-2">



                                <div className="flex items-center gap-1 text-white/70 text-[10px] sm:text-xs lg:text-sm font-semibold group-hover:text-white transition-colors whitespace-nowrap">
                                    View
                                    <ArrowUpRight
                                        size={14}
                                        className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                    />
                                </div>

                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BrandoComponent;