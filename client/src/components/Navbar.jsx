import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';

const Navbar = ({ searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user session', err);
      }
    }
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
            <BookOpen size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">NoteNest</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">Public Notes</Link>
          <Link to="/my-notes" className="hover:text-blue-600 transition">My Notes</Link>
          <Link to="/upload" className="hover:text-blue-600 transition">Upload Note</Link>
          {/* === Yahin par Profile link add kar sakte hain === */}
          <Link to="/profile" className="hover:text-blue-600 transition">Profile</Link>
        </div>

        {/* Search & Profile / Sign Up */}
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          {onSearchChange && (
            <input 
              type="text" 
              placeholder="Search notes, subjects..." 
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="hidden lg:block bg-gray-50 border border-gray-200 rounded-xl px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          )}

          {/* Conditional Rendering: Profile Icon agar logged in hai, warna Sign Up button */}
          {currentUser ? (
            <Link 
              to="/profile" 
              className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
              title="View Profile"
            >
              <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              <span className="text-sm font-semibold text-blue-700 hidden sm:inline">
                {currentUser.name ? currentUser.name.split(' ')[0] : 'Profile'}
              </span>
            </Link>
          ) : (
            <Link 
              to="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
            >
              Sign Up
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;