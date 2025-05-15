import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Display from './pages/Display';
import ViewDetailedTour from './pages/ViewDetailedTour';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminCreateTour from './pages/Admin/AdminCreateTour';
import AdminManageTours from './pages/Admin/AdminManageTours';
import AdminManageUsers from './pages/Admin/AdminManageUsers';
import AdminManageBookings from './pages/Admin/AdminManageBookings';
import AdminUpdateTour from './pages/Admin/AdminUpdateTour';
import Header from './components/Header';
import Footer from './components/Footer';
import Forgetpassword from './components/Forgetpassword';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import UserBookings from './pages/UserBookings';

function App() {
  return (
    
    <AuthProvider>
      <Router>
        {/* Header will be displayed on all pages */}
        <Header />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Display />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tour/:id" element={<ViewDetailedTour />} />
          <Route path = "/forget-password" element = {<Forgetpassword/>} />
          <Route path="/gallery" element={<Gallery/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/my-bookings" element={<UserBookings/>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="create-tour" element={<AdminCreateTour />} />
            <Route path="manage-tours" element={<AdminManageTours />} />
            <Route path="manage-users" element={<AdminManageUsers />} />
            <Route path="manage-bookings" element={<AdminManageBookings />} />
            <Route path="update-tour/:id" element={<AdminUpdateTour />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
        <Footer/>
      </Router>
    </AuthProvider>
  );
}

export default App;
