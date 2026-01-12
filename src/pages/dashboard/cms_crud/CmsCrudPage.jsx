import React from 'react';
import { Outlet } from 'react-router-dom';

const CmsCrudPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50/30">
      {/* Main Content Area */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-xl p-6 border border-emerald-100">
          <Outlet /> {/* This will render nested routes: create-blog, update-blog, view-blog */}
        </div>
      </div>
    </div>
  );
};

export default CmsCrudPage;