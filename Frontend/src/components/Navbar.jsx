import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Menu, X, Compass, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlobalSearchBar from './GlobalSearchBar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-teal-400 to-emerald-400 p-2 rounded-lg shadow-lg">
              <Compass className="w-6 h-6 text-navy" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Plan<span className="text-teal-400">ova</span>
            </span>
          </Link>

          {/* Global Search Bar - Desktop */}
          {user && (
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <GlobalSearchBar />
            </div>
          )}

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-teal-400 transition-colors">Home</Link>
            <Link to="/blueprints" className="text-slate-300 hover:text-teal-400 transition-colors">Blueprints</Link>
            <Link to="/engineers" className="text-slate-300 hover:text-teal-400 transition-colors">Engineers</Link>
            <Link to="/marketplace" className="text-slate-300 hover:text-teal-400 transition-colors">Materials</Link>
            {user ? (
              <>
                <Link to="/user" className="text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-400/20 border border-teal-400/50 flex items-center justify-center">
                      <User className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="text-white font-medium">{user.firstName || user.name}</span>
                  </div>
                  <button onClick={logout} className="text-slate-300 hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white hover:text-teal-400 transition-colors">Login</Link>
                <Link to="/register" className="bg-gradient-to-r from-teal-400 to-emerald-400 text-navy font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all">Sign Up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-navy border-b border-white/10 p-4 space-y-4">
          <Link to="/" className="block text-slate-300 py-2">Home</Link>
          <Link to="/blueprints" className="block text-slate-300 py-2">Blueprints</Link>
          <Link to="/engineers" className="block text-slate-300 py-2">Engineers</Link>
          <Link to="/marketplace" className="block text-slate-300 py-2">Materials</Link>
          {user ? (
            <>
              <Link to="/user" className="block text-slate-300 py-2">Dashboard</Link>
              <button onClick={logout} className="w-full text-left text-red-400 py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-slate-300 py-2">Login</Link>
              <Link to="/register" className="block bg-gradient-to-r from-teal-400 to-emerald-400 text-navy font-bold text-center py-3 rounded-xl">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
