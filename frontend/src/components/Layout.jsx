import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaStickyNote, FaSignOutAlt, FaPlus, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-700 mr-2"
              >
                {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              
              <Link to="/" className="flex items-center">
                <FaStickyNote className="h-8 w-8 text-blue-700 mr-2" />
                <span className="text-xl font-semibold text-gray-900 hidden sm:block">
                  NotesApp
                </span>
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/notes/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800"
              >
                <FaPlus className="mr-2" />
                New Note
              </Link>
              
              {/* User profile section */}
              <div className="flex items-center text-gray-700 border-l border-gray-300 pl-4">
                <FaUserCircle className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {user?.username || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">
                    {user?.email}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              <Link
                to="/notes/new"
                className="inline-flex items-center p-2 rounded-md text-blue-700 hover:text-blue-800"
              >
                <FaPlus size={20} />
              </Link>
              
              <div className="flex items-center">
                <FaUserCircle className="h-5 w-5 text-blue-600 mr-1" />
                <span className="text-sm font-medium">
                  {user?.username || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 pt-4 pb-3">
              <div className="px-2 space-y-1">
                <Link
                  to="/notes/new"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  New Note
                </Link>
                
                <div className="px-3 py-2">
                  <div className="flex items-center">
                    <FaUserCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user?.username || user?.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;