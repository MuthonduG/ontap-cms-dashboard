import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNavComponent from '../../components/sidenav/SideNavComponent';

const DashboardPage = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50/30 to-teal-50/30">
      {/* Side Navigation */}
      <SideNavComponent />
      
      {/* Main Content Area - Outlet renders the active page */}
      <main className="flex-1 transition-all duration-300 ml-0 lg:ml-64 p-4 sm:p-6">
        <Outlet /> {/* This is where child routes will render */}
      </main>
    </div>
  );
};

export default DashboardPage;