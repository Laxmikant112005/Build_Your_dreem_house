import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Grid, 
  PlusCircle, 
  ClipboardList, 
  Users, 
  MapPin, 
  ShoppingBag,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Clock,
  Heart, 
  Bell, 
  User,
  MessageSquare,
  Star,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = {
    user: [
{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Browse Designs', icon: Grid, path: '/designs' },
{ name: 'Field Mapping', icon: MapPin, path: '/user/field-mapping' },
  { name: 'Profile', icon: User, path: '/user/profile' },
      { name: 'Engineers', icon: Users, path: '/user/engineers' },
      { name: 'My Bookings', icon: ClipboardList, path: '/user/bookings' },
      { name: 'Marketplace', icon: ShoppingBag, path: '/user/marketplace' },
      { name: 'Favorites', icon: Heart, path: '/user/favorites' },
      { name: 'Notifications', icon: Bell, path: '/user/notifications' },
      { name: 'Profile', icon: User, path: '/user/profile' },
    ],
    engineer: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/engineer/dashboard' },
      { name: 'Profile', icon: User, path: '/engineer/profile' },
      { name: 'My Designs', icon: Grid, path: '/engineer/designs' },
      { name: 'Upload New', icon: PlusCircle, path: '/engineer/upload' },
      { name: 'Bookings', icon: ClipboardList, path: '/engineer/requests' },
      { name: 'Availability', icon: Clock, path: '/engineer/availability' },
      { name: 'Messages', icon: MessageSquare, path: '/engineer/messages' },
      { name: 'Reviews', icon: Star, path: '/engineer/reviews' },
    ],
    admin: [
      { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Manage Users', icon: Users, path: '/admin/users' },
      { name: 'Manage Engineers', icon: Users, path: '/admin/engineers' },
      { name: 'Designs', icon: Grid, path: '/admin/designs' },
      { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
      { name: 'Transactions', icon: DollarSign, path: '/admin/transactions' },
      { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
      { name: 'Security', icon: ShieldCheck, path: '/admin/security' },
      { name: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
    ]
  };

  const currentItems = menuItems[user?.role] || [];

  return (
    <aside className="w-64 bg-navy text-white h-[calc(100vh-80px)] sticky top-20 border-r border-white/5 flex flex-col p-6 overflow-y-auto">
      <div className="space-y-2 flex-grow">
        <h4 className="text-white/40 uppercase text-xs font-bold tracking-wider mb-6 pl-4">Menu</h4>
        {currentItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center justify-between p-3 rounded-xl transition-all duration-300 group",
              isActive 
                ? "bg-gold text-navy font-bold shadow-lg shadow-gold/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-navy" : "group-hover:text-gold")} />
                  <span>{item.name}</span>
                </div>
                {/* <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="pt-6 border-t border-white/10">
        <button className="flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors w-full">
          <Settings className="w-5 h-5 group-hover:text-gold" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
