import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FileText, Download, Edit, Trash2, Plus, Globe, Folder, User, Briefcase, GraduationCap, Plane, Lightbulb, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyNotesPage = () => {
  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Notes');
  const [sortBy, setSortBy] = useState('Sort by: Most Recent'); // Sorting state

  // Backend API se sirf logged-in user ke notes fetch karne ke liye useEffect
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!storedUser || !storedUser.name) {
      setLoading(false);
      return;
    }

    fetch(`https://notenest-klt3.onrender.com/api/notes/mynotes?uploader=${encodeURIComponent(storedUser.name)}`)
      .then((res) => res.json())
      .then((data) => {
        setMyNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching my notes:', err);
        setLoading(false);
      });
  }, []);

  // Delete note function
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`https://notenest-klt3.onrender.com/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMyNotes(myNotes.filter((note) => note._id !== id));
        alert('Note deleted successfully!');
      } else {
        alert('Failed to delete note from server.');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Network error while deleting note.');
    }
  };

  // Sidebar categories list with icons
  const categories = [
    { name: 'All Notes', icon: Folder },
    { name: 'Personal', icon: User },
    { name: 'Work', icon: Briefcase },
    { name: 'Study', icon: GraduationCap },
    { name: 'Travel', icon: Plane },
    { name: 'Ideas', icon: Lightbulb },
    { name: 'Others', icon: MoreHorizontal },
  ];

  // Search term aur Category dono ke basis par notes filter karna
  const filteredNotes = myNotes.filter((note) => {
    const titleMatch = note.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = note.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = note.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch || catMatch;

    if (selectedCategory === 'All Notes') {
      return matchesSearch;
    }
    return matchesSearch && note.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sorting logic for My Notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'Sort by: Most Recent') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === 'Sort by: Title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Navbar with Search Props */}
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Page Heading & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Personal Notes Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage, update, or toggle visibility for your uploaded document collection.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/upload" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition">
              <Plus size={16} />
              <span>Upload New Note</span>
            </Link>
            <Link to="/" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center space-x-1">
              <Globe size={16} />
              <span>Public Feed</span>
            </Link>
          </div>
        </div>

        {/* Content Layout (Interactive Sidebar + Personal Grid) */}
        <div className="flex gap-8">
          
          {/* Left Sidebar with Clickable Categories */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  const isActive = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                Showing <strong>{sortedNotes.length} notes</strong> in {selectedCategory === 'All Notes' ? 'your personal storage' : selectedCategory}
              </span>
              {/* Functional Sorting Dropdown */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
              >
                <option value="Sort by: Most Recent">Sort by: Most Recent</option>
                <option value="Sort by: Title">Sort by: Title</option>
              </select>
            </div>

            {/* Loading / Empty States */}
            {loading ? (
              <div className="text-center py-12 text-gray-500 font-medium">
                Loading your notes from database...
              </div>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-xl border border-gray-200">
                No notes found in this category.
              </div>
            ) : (
              /* Sorted & Filtered Grid Cards from MongoDB */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedNotes.map((note) => (
                  <div key={note._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded backdrop-blur-sm mr-2">
                          {note.fileType || note.category || 'DOC'}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${note.isPublic ? 'bg-emerald-400 text-slate-900' : 'bg-gray-800 text-white'}`}>
                          {note.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <FileText size={24} className="opacity-80" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1">{note.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded by <span className="font-medium text-gray-700">{note.uploaderName || note.uploader || 'Samiullah Bagwan'}</span>
                      </p>

                      {note.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {note.description}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-600">
                        {/* View Button */}
                        <button 
                          onClick={() => window.open(note.fileUrl, '_blank')}
                          className="hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <FileText size={14} /><span>View</span>
                        </button>

                        {/* Download Button */}
                        <a 
                          href={note.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          download
                          className="hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <Download size={14} /><span>Download</span>
                        </a>

                        {/* Edit Button */}
                        <button 
                          onClick={() => alert(`Edit feature for "${note.title}" coming soon!`)}
                          className="text-amber-600 border border-amber-200 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Edit size={14} /><span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(note._id)}
                          className="text-red-600 border border-red-200 px-2 py-1 rounded bg-red-50 hover:bg-red-100 flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Trash2 size={14} /><span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
};

export default MyNotesPage;
