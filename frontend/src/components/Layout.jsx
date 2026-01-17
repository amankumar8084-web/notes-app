import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaStickyNote, FaSignOutAlt, FaPlus, FaBars, FaTimes } from 'react-icons/fa';

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
                <span className="text-xl font-semibold text-gray-900">
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
              
              <div className="flex items-center text-gray-700 border-l border-gray-300 pl-4">
                <span className="text-sm">{user?.email || 'User'}</span>
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
            <div className="lg:hidden flex items-center">
              <Link
                to="/notes/new"
                className="inline-flex items-center p-2 rounded-md text-blue-700 hover:text-blue-800 mr-2"
              >
                <FaPlus size={20} />
              </Link>
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
                <div className="px-3 py-2 text-sm text-gray-500">
                  Logged in as: {user?.email || 'User'}
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