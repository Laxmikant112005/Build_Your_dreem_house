import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-8 pt-28 max-w-screen-2xl mx-auto ml-0 lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;

