import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Mail, Globe, Users, ShieldCheck, LogOut, FileText } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myNotesCount, setMyNotesCount] = useState(0);

  useEffect(() => {
    // LocalStorage se logged-in user ki details nikalna
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please login first to view your profile.');
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // User ke uploaded notes fetch karke count dikhane ke liye
    fetch('https://notenest-klt3.onrender.com/api/notes')
      .then((res) => res.json())
      .then((data) => {
        // Agar uploader name match karta hai toh count badhayein
        const userNotes = data.filter(
          (note) => note.uploaderName === parsedUser.name || note.uploader === parsedUser.name
        );
        setMyNotesCount(userNotes.length);
      })
      .catch((err) => console.error('Error fetching notes count:', err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    alert('Logged out successfully!');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Profile Card Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail size={14} /> {user.email}
              </p>
              <div className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2">
                <ShieldCheck size= {14} />
                <span>Active Account</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer border border-red-200"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Detailed Information & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Personal Info Box */}
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Personal Information</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-2"><User size={16} /> Full Name</span>
                <span className="font-semibold text-gray-900">{user.name}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-2"><Mail size={16} /> Email Address</span>
                <span className="font-semibold text-gray-900">{user.email}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-2"><Users size={16} /> Gender</span>
                <span className="font-semibold text-gray-900">{user.gender || 'Not Specified'}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 flex items-center gap-2"><Globe size={16} /> Country</span>
                <span className="font-semibold text-gray-900">{user.country || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Activity Stats</h2>
              <div className="flex items-center space-x-4 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <div className="p-3 bg-blue-600 text-white rounded-xl">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Uploaded Notes</p>
                  <p className="text-xl font-extrabold text-blue-700">{myNotesCount}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                to="/my-notes" 
                className="w-full block text-center bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm py-2.5 rounded-xl transition shadow-sm"
              >
                Manage My Notes
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
