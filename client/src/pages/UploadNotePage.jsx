import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, FileText, BookOpen, Tag, Lock, Globe, Folder, CloudUpload } from 'lucide-react';

const UploadNotePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Study',
    isPublic: 'true',
    file: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please login first to upload notes!');
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData({ ...formData, file: selectedFile });
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('You must be logged in to upload notes.');
      navigate('/login');
      return;
    }

    if (!formData.file) {
      alert('Please select a document file to upload!');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('isPublic', formData.isPublic);
    data.append('file', formData.file);
    data.append('uploader', currentUser.name); // 👈 Backend limit check ke liye zaroori

    try {
      const response = await fetch('https://notenest-klt3.onrender.com/api/notes', {
        method: 'POST',
        body: data,
      });

      const resData = await response.json();

      if (response.ok) {
        alert('Note uploaded successfully!');
        navigate('/my-notes');
      } else {
        alert(resData.error || 'Failed to upload note.');
        
        // ✨ Agar free limit khatam ho gayi ho (403 Forbidden), toh subscription page par redirect karein
        if (response.status === 403) {
          navigate('/subscription');
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Network error during upload.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const categoriesList = ['Personal', 'Work', 'Study', 'Travel', 'Ideas', 'Others'];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Upload Note</h1>
          <p className="text-sm text-gray-500 mt-1">Share your study materials or work documents with the community or keep them private.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Categories */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">CATEGORIES</h3>
            <ul className="space-y-1">
              {['All Notes', ...categoriesList].map((cat, idx) => (
                <li key={idx}>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat === 'All Notes' ? 'Study' : cat })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      (cat === 'All Notes' && formData.category === 'Study') || formData.category === cat 
                        ? 'bg-blue-50 text-blue-600 font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Folder size={17} />
                    <span>{cat}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Main Upload Form */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Drag and Drop File Upload Area */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Select Document File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition relative bg-gray-50/50">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex justify-center gap-2 mb-3">
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-red-100">PDF</span>
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-100">PPT</span>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-100">DOCX</span>
                  </div>
                  <div className="flex justify-center text-blue-600 mb-2">
                    <CloudUpload size={36} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {fileName ? <span className="text-blue-600 font-semibold">Selected: {fileName}</span> : <>Drag and drop your file here, or <span className="text-blue-600 underline cursor-pointer">click to browse</span></>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports PDF, DOCX, PPT up to 25MB</p>
                </div>
              </div>

              {/* Note Title */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Note Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Advanced Calculus Chapter 4 Guide"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description / Summary */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Description / Summary <span className="text-gray-400 font-normal">(Optional)</span></label>
                <textarea 
                  rows="3"
                  placeholder="Briefly describe what's inside this note (e.g. Covers formulas, examples, and practice problems)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Visibility State (Public / Private) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Visibility State</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${formData.isPublic === 'true' ? 'border-blue-600 bg-blue-50/40' : 'border-gray-200 bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="visibility" 
                      checked={formData.isPublic === 'true'}
                      onChange={() => setFormData({ ...formData, isPublic: 'true' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Public</p>
                      <p className="text-[11px] text-gray-500">Visible to everyone on explore feed</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${formData.isPublic === 'false' ? 'border-blue-600 bg-blue-50/40' : 'border-gray-200 bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="visibility" 
                      checked={formData.isPublic === 'false'}
                      onChange={() => setFormData({ ...formData, isPublic: 'false' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Private</p>
                      <p className="text-[11px] text-gray-500">Only visible in your dashboard</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => navigate('/my-notes')}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'SUBMIT'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UploadNotePage;