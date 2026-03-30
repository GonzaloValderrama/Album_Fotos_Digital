import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Pages
import Home from './pages/Home';
import AlbumView from './pages/AlbumView';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminAlbumView from './pages/AdminAlbumView';
import Settings from './pages/Settings';

// Styles
import './styles/global.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, isOwner, loading } = useAuth();
  
  if (loading) return <div className="full-center loader"></div>;
  if (!user || !isOwner) return <Navigate to="/admin/login" replace />;
  
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/album/:id" element={<AlbumView />} />
            
            {/* Admin Auth Route */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/album/:id" element={
              <ProtectedRoute>
                <AdminAlbumView />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
