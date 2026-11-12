import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MyNotesPage from './pages/MyNotesPage';
import UploadNotePage from './pages/UploadNotePage';
import SignupPage from './pages/SignupPage'; // <--- Import Signup
import LoginPage from './pages/LoginPage';   // <--- Import Login
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-notes" element={<MyNotesPage />} />
        <Route path="/upload" element={<UploadNotePage />} />
        <Route path="/signup" element={<SignupPage />} /> {/* <--- Signup Route */}
        <Route path="/login" element={<LoginPage />} />     {/* <--- Login Route */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
      </Routes>
    </Router>
  );
}

export default App;