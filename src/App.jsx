import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ToastProvider } from './components/ToastContext';
import { ThemeProvider } from './components/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';

// Seed admin account on first load
import { createUser } from './utils/localStorage';
(function seedAdmin() {
  createUser({ email: 'admin@cardblitz.com', password: 'admin123' });
})();

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ThemeProvider>
            <div className="relative z-[1] min-h-screen font-sans antialiased">
              <Navbar />
              <Routes>
                {/* Public */}
                <Route path="/login"  element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/game"      element={<ProtectedRoute><Game /></ProtectedRoute>} />
                <Route path="/wallet"    element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/admin"     element={<ProtectedRoute><Admin /></ProtectedRoute>} />

                {/* Default */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </ThemeProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
