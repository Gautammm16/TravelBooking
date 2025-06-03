// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Display from './pages/Display';
// import ViewDetailedTour from './pages/ViewDetailedTour';
// import AdminRoute from './components/AdminRoute';
// import AdminDashboard from './pages/Admin/AdminDashboard';
// import AdminCreateTour from './pages/Admin/AdminCreateTour';
// import AdminManageTours from './pages/Admin/AdminManageTours';
// import AdminManageUsers from './pages/Admin/AdminManageUsers';
// import AdminManageBookings from './pages/Admin/AdminManageBookings';
// import AdminUpdateTour from './pages/Admin/AdminUpdateTour';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import Forgetpassword from './components/Forgetpassword';
// import Gallery from './pages/Gallery';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import UserBookings from './pages/UserBookings';
// import VerifyOTP from './pages/VerifyOTP';
// import UserProfile from './pages/Profile';
// import ProtectedRoute from './components/ProtectedRoute';
// import CustomTourRequestForm from './pages/CustomTourRequestForm';
// import UserCustomTours from './pages/UserCustomTour';
// import AdminCustomTourRequests from './pages/Admin/AdminCustomTourRequests';
// import Favorites from './pages/Favorite';
// import Payment from './pages/Payment';
// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Header />
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Display />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/tour/:id" element={<ViewDetailedTour />} />
//           <Route path="/forget-password" element={<Forgetpassword />} />
//           <Route path="/gallery" element={<Gallery />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/my-bookings" element={<UserBookings />} />
//           <Route path="/verify-otp" element={<VerifyOTP />} />
//           <Route path="/favorites" element={<Favorites />} />
          
//           {/* Protected Custom Tour Request Route - Only for logged in users */}
//           <Route
//             path="/custom-tour-request"
//             element={
//               <ProtectedRoute>
//                 <CustomTourRequestForm />
//               </ProtectedRoute>
//             }
//           />

//           {/* Protected Profile Route */}
//           <Route
//             path="/profile"
//             element={
//               <ProtectedRoute>
//                 <UserProfile />
//               </ProtectedRoute>
//             }
//           />

//           <Route 
//             path="/my-custom-tours" 
//             element={
//               <ProtectedRoute>
//                 <UserCustomTours />
//               </ProtectedRoute>
//             } 
//           />
//                   <Route path="/payment" element={<Payment />} />

//           {/* Protected Admin Routes */}
//           <Route path="/admin" element={<AdminRoute />}>
//             <Route path="dashboard" element={<AdminDashboard />} />
//             <Route path="create-tour" element={<AdminCreateTour />} />
//             <Route path="manage-tours" element={<AdminManageTours />} />
//             <Route path="manage-users" element={<AdminManageUsers />} />
//             <Route path="manage-bookings" element={<AdminManageBookings />} />
//             <Route path="custom-tour-requests" element={<AdminCustomTourRequests />} />
//             <Route path="update-tour/:id" element={<AdminUpdateTour />} />
//           </Route>

//           {/* 404 */}
//           <Route path="*" element={<h1>404 - Page Not Found</h1>} />
//         </Routes>
//         <Footer />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;


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
import VerifyOTP from './pages/VerifyOTP';
import UserProfile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import CustomTourRequestForm from './pages/CustomTourRequestForm';
import UserCustomTours from './pages/UserCustomTour';
import AdminCustomTourRequests from './pages/Admin/AdminCustomTourRequests';
import Favorites from './pages/Favorite';
import Payment from './pages/Payment';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Display />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tour/:id" element={<ViewDetailedTour />} />
              <Route path="/forget-password" element={<Forgetpassword />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/my-bookings" element={<UserBookings />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/payment" element={<Payment />} />

              {/* Protected Custom Tour Request Route */}
              <Route
                path="/custom-tour-request"
                element={
                  <ProtectedRoute>
                    <CustomTourRequestForm />
                  </ProtectedRoute>
                }
              />

              {/* Protected Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-custom-tours"
                element={
                  <ProtectedRoute>
                    <UserCustomTours />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="create-tour" element={<AdminCreateTour />} />
                <Route path="manage-tours" element={<AdminManageTours />} />
                <Route path="manage-users" element={<AdminManageUsers />} />
                <Route path="manage-bookings" element={<AdminManageBookings />} />
                <Route path="custom-tour-requests" element={<AdminCustomTourRequests />} />
                <Route path="update-tour/:id" element={<AdminUpdateTour />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<h1 className="text-center py-20 text-2xl">404 - Page Not Found</h1>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
