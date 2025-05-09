import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Home,
  TourDetails,
  Login,
  Register,
  Dashboard,
  Profile,
  Admin,
  ForgotPassword,
  ResetPassword,
  NotFound
} from './pages';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Bookings from './pages/Bookings.jsx';
import Wishlist from './pages/Wishlist.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import Loader from "./components/Loader.jsx";
import Layout from './components/Layout.jsx';

// Admin components
import UserManagement from './pages/Admin/UserManagement.jsx';
import Statistics from './pages/Admin/Statistics.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* All routes wrapped with Layout via parent route and Outlet */}
          <Route element={<Layout><Outlet /></Layout>}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/tours/:id" element={<TourDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/stats" element={<AdminRoute><Statistics /></AdminRoute>} />
            
            {/* 404 Handling */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default App;