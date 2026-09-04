import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LayoutGrid,
  PlusCircle,
  ClipboardList,
  Users,
  MapPin,
  ShoppingBag,
  DollarSign,
  FileText,
  BarChart3,
  HardHat,
  ShieldCheck,
  Clock,
  Heart,
  Bell,
  User,
  MessageSquare,
  Star,
  Settings,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const menuItems = {
  user: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/user" },
    { name: "My Projects", icon: HardHat, path: "/user/projects" },
    { name: "My Properties", icon: MapPin, path: "/user/properties" },
    { name: "Browse Designs", icon: LayoutGrid, path: "/user/designs" },
    { name: "Engineers", icon: Users, path: "/user/engineers" },
    { name: "My Bookings", icon: ClipboardList, path: "/user/bookings" },
    { name: "Messages", icon: MessageSquare, path: "/user/chat" },
    { name: "Budgets", icon: DollarSign, path: "/user/budgets" },
    { name: "Documents", icon: FileText, path: "/user/documents" },
    { name: "Construction", icon: HardHat, path: "/user/construction" },
    { name: "Marketplace", icon: ShoppingBag, path: "/user/marketplace" },
    { name: "Favorites", icon: Heart, path: "/user/favorites" },
    { name: "Notifications", icon: Bell, path: "/user/notifications" },
    { name: "Profile", icon: User, path: "/user/profile" },
  ],

  engineer: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/engineer/dashboard" },
    { name: "Profile", icon: User, path: "/engineer/profile" },
    {
      name: "Verification",
      icon: ShieldCheck,
      path: "/engineer/verification",
    },
    {
      name: "My Blueprints",
      icon: LayoutGrid,
      path: "/engineer/blueprints",
    },
    {
      name: "Upload Blueprint",
      icon: PlusCircle,
      path: "/engineer/blueprints/new",
    },
    {
      name: "Booking Requests",
      icon: ClipboardList,
      path: "/engineer/requests",
    },
    {
      name: "Consultations",
      icon: Clock,
      path: "/engineer/consultations",
    },
    {
      name: "Availability",
      icon: Clock,
      path: "/engineer/availability",
    },
    {
      name: "My Projects",
      icon: HardHat,
      path: "/engineer/projects",
    },
    {
      name: "Messages",
      icon: MessageSquare,
      path: "/engineer/messages",
    },
    {
      name: "Reviews",
      icon: Star,
      path: "/engineer/reviews",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/engineer/notifications",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/engineer/analytics",
    },
  ],

  admin: [
    {
      name: "Overview",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Manage Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      name: "Manage Engineers",
      icon: Users,
      path: "/admin/engineers",
    },
    {
      name: "Designs",
      icon: LayoutGrid,
      path: "/admin/designs",
    },
    {
      name: "Products",
      icon: ShoppingBag,
      path: "/admin/products",
    },
    {
      name: "Transactions",
      icon: DollarSign,
      path: "/admin/transactions",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      name: "Security",
      icon: ShieldCheck,
      path: "/admin/security",
    },
    {
      name: "Feedback",
      icon: MessageSquare,
      path: "/admin/feedback",
    },
  ],
};

const settingsPaths = {
  user: "/user/settings",
  engineer: "/engineer/settings",
  admin: "/admin/settings",
};

const Sidebar = () => {
  const { user } = useAuth();

  // Normalize role because backend may return USER / ENGINEER / ADMIN
  const role = user?.role?.toLowerCase();

  const currentItems = menuItems[role] || [];
  const settingsPath = settingsPaths[role] || "/settings";

  return (
    <aside
      className="
        w-64
        bg-navy
        text-white
        h-[calc(100vh-80px)]
        sticky
        top-20
        border-r
        border-white/5
        flex
        flex-col
        px-4
        py-6
        overflow-y-auto
      "
    >
      {/* Menu */}
      <div className="flex-1">
        <h4 className="text-white/40 uppercase text-xs font-bold tracking-wider mb-5 px-3">
          Menu
        </h4>

        {currentItems.length > 0 ? (
          <nav className="space-y-1.5">
            {currentItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/${role}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl",
                      "transition-all duration-200",
                      "group",
                      isActive
                        ? "bg-gold text-navy font-semibold shadow-lg shadow-gold/10"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-colors",
                          isActive
                            ? "text-navy"
                            : "text-slate-400 group-hover:text-gold"
                        )}
                      />

                      <span className="text-sm truncate">
                        {item.name}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        ) : (
          <div className="px-3 py-4 text-sm text-slate-500">
            No menu available.
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="pt-5 mt-5 border-t border-white/10">
        <NavLink
          to={settingsPath}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl",
              "transition-all duration-200",
              isActive
                ? "bg-gold text-navy font-semibold"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )
          }
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="text-sm">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;