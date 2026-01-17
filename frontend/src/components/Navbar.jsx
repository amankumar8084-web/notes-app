import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaStickyNote, FaSignOutAlt, FaUser, FaPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ onNewNote }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Navbar rendered. Current path:", location.pathname);
  console.log("onNewNote prop:", onNewNote);

  const handleNewNoteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navbar: New Note button clicked");
    
    if (onNewNote && typeof onNewNote === 'function') {
      onNewNote();
    } else {
      console.error("Navbar: onNewNote is not a function or not provided");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <FaStickyNote className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-semibold text-gray-900">
              <Link to="/" className="hover:text-blue-600">
                My Notes
              </Link>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleNewNoteClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  type="button"
                >
                  <FaPlus className="mr-2" />
                  New Note
                </button>
                
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;