import React from 'react';
import { Folder, User, Briefcase, GraduationCap, Plane, Lightbulb, MoreHorizontal } from 'lucide-react';

const Sidebar = () => {
  const categories = [
    { name: 'All Notes', icon: Folder, active: true },
    { name: 'Personal', icon: User },
    { name: 'Work', icon: Briefcase },
    { name: 'Study', icon: GraduationCap },
    { name: 'Travel', icon: Plane },
    { name: 'Ideas', icon: Lightbulb },
    { name: 'Others', icon: MoreHorizontal },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Categories</h2>
        <ul className="space-y-1 text-sm font-medium">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <li key={idx}>
                <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  cat.active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <Icon size={18} />
                  <span>{cat.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;