import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-screen-2xl mx-auto flex">
        <Sidebar />
        <main className="flex-grow p-8 pt-28">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
