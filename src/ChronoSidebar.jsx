import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import logo from './assets/logout.png';
import setting from './assets/settings.png';
import calendar from './assets/calendar logo.png';
import db from './assets/dashboard.png';
import homePurple from './assets/Purple Home icon.png';


function ChronoSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location object

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  // Helper function to determine if a link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-gray-50 h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-950 mb-1">Chrono</h1>
        <p className="text-sm text-gray-500">Your Time, Organized and Empowered</p>
      </div>
      
      <nav className="flex-1 space-y-3">
        {/* Home Link */}
        <div
          onClick={() => handleNavigation('/home')}
          className={`
            rounded-lg px-4 py-3 flex items-center gap-2 cursor-pointer transition-colors
            ${isActiveLink('/home') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}
          `}
        >
          <img src={homePurple} alt="Home icon" className="w-7 h-7" />
          <span className="font-medium">Home</span>
        </div>

        {/* Dashboard Link */}
        <div
          onClick={() => handleNavigation('/dashboard')}
          className={`
            rounded-lg px-4 py-3 flex items-center gap-2 cursor-pointer transition-colors
            ${isActiveLink('/dashboard') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}
          `}
        >
          <img src={db} alt="dashboard" className="w-7 h-7" />
          <span className="font-medium">Dashboard</span>
        </div>

        {/* Calendar Link */}
        <div
          onClick={() => handleNavigation('/calendar')}
          className={`
            rounded-lg px-4 py-3 flex items-center gap-2 cursor-pointer transition-colors
            ${isActiveLink('/calendar') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}
          `}
        >
          <img src={calendar} alt="calendar" className="w-7 h-7" />
          <span className="font-medium">Calendar</span>
        </div>

        {/* Settings Link */}
        <div
          onClick={() => handleNavigation('/settings')}
          className={`
            rounded-lg px-4 py-3 flex items-center gap-2 cursor-pointer transition-colors
            ${isActiveLink('/settings') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}
          `}
        >
          <img src={setting} alt="setting" className="w-7 h-7" />
          <span className="font-medium">Settings</span>
        </div>
      </nav>

      <div className="mt-auto">
        <div
          onClick={handleLogout}
          className="text-gray-600 hover:bg-purple-100 rounded-lg px-4 py-3 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <img src={logo} alt="logout" className="w-7 h-7" />
          <span className="font-medium">Log Out</span>
        </div>
      </div>
    </div>
  );
}

export default ChronoSidebar;