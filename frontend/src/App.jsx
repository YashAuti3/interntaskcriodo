import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { Layout } from './components/Layout';

// New Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Game from './pages/Game';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Admins go to /admin by default, users to /game */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } />
              
              <Route path="/game" element={
                <ProtectedRoute excludeAdmin>
                  <Game />
                </ProtectedRoute>
              } />
              
              {/* Legacy /dashboard redirection */}
              <Route path="/dashboard" element={<Navigate to="/game" replace />} />
              
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/game" replace />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/game" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
