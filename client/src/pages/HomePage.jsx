import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FileText, Download, Bookmark, Share2, ArrowRight, Sparkles, Folder, User, Briefcase, GraduationCap, Plane, Lightbulb, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Notes');
  const [sortBy, setSortBy] = useState('Most Recent'); // Sorting state add ki gayi

  // Backend API se notes fetch karne ke liye useEffect
  useEffect(() => {
    fetch('http://localhost:5000/api/notes')
      .then((res) => res.json())
      .then((data) => {
        setPublicNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching notes:', err);
        setLoading(false);
      });
  }, []);

  // Category ke hisaab se badge color select karne ke liye helper function
  const getBadgeBg = (category) => {
    switch (category?.toLowerCase()) {
      case 'finance':
        return 'bg-blue-600';
      case 'communication':
        return 'bg-indigo-600';
      case 'marketing':
        return 'bg-purple-600';
      case 'management':
        return 'bg-emerald-600';
      case 'study':
        return 'bg-blue-600';
      case 'personal':
        return 'bg-violet-600';
      case 'work':
        return 'bg-amber-600';
      case 'travel':
        return 'bg-cyan-600';
      case 'ideas':
        return 'bg-rose-600';
      default:
        return 'bg-blue-600';
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
  const filteredNotes = publicNotes.filter((note) => {
    const titleMatch = note.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = note.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = note.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch || catMatch;

    if (selectedCategory === 'All Notes') {
      return matchesSearch;
    }
    return matchesSearch && note.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sorting logic (Most Recent / Most Popular)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'Most Recent') {
      // Newest first based on MongoDB createdAt timestamp
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === 'Most Popular') {
      // Fallback sorting or alphabetical/title length for popularity simulation
      return (b.title || '').localeCompare(a.title || '');
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Navbar with Search Props */}
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Hero Banner Section */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-400 rounded-2xl p-8 md:p-12 text-white shadow-lg mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-2xl z-10">
            <div className="inline-flex items-center space-x-2 bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <Sparkles size={14} />
              <span>Welcome to NoteNest Platform</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Your Platform to Save, Share & Discover Notes
            </h1>
            <p className="mt-3 text-blue-100 text-sm md:text-base leading-relaxed">
              Collaborate, organize, and access study materials, work documents, and creative ideas anywhere.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/upload" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-2.5 rounded-xl shadow transition text-sm flex items-center space-x-2">
                <span>Start Uploading Notes</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/my-notes" className="bg-blue-800/60 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl border border-blue-400/30 transition text-sm">
                Explore Notes
              </Link>
            </div>
          </div>
        </div>

        {/* Content Layout (Interactive Sidebar + Notes Grid) */}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategory === 'All Notes' ? (searchTerm ? `Search Results for "${searchTerm}"` : 'Trending & Recent Notes') : `${selectedCategory} Notes`}
              </h2>
              {/* Functional Sorting Dropdown */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
              >
                <option value="Most Recent">Most Recent</option>
                <option value="Most Popular">Most Popular</option>
              </select>
            </div>

            {/* Loading / Empty States */}
            {loading ? (
              <div className="text-center py-12 text-gray-500 font-medium">
                Loading notes from database...
              </div>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-xl border border-gray-200">
                No notes found in this category.
              </div>
            ) : (
              /* Sorted & Filtered Dynamic Notes Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedNotes.map((note) => (
                  <div key={note._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className={`${getBadgeBg(note.category)} p-4 text-white flex justify-between items-start`}>
                      <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded backdrop-blur-sm">
                        {note.fileType || note.category || 'DOC'}
                      </span>
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

                        {/* Save Button */}
                        <button 
                          onClick={() => alert(`"${note.title}" has been saved to your bookmarks!`)}
                          className="hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <Bookmark size={14} /><span>Save</span>
                        </button>

                        {/* Share Button */}
                        <button 
                          onClick={async () => {
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: note.title,
                                  text: `Check out this note: ${note.title}`,
                                  url: note.fileUrl,
                                });
                              } catch (err) {
                                console.log('Sharing cancelled or failed', err);
                              }
                            } else {
                              navigator.clipboard.writeText(note.fileUrl);
                              alert(`Link copied to clipboard for: ${note.title}`);
                            }
                          }}
                          className="hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <Share2 size={14} /><span>Share</span>
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

export default HomePage;