// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, useLocation } from 'react-router-dom';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { login, error, loading, user, isAdmin } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // Get the redirect path from location state or default to home page
//   const from = location.state?.from?.pathname || '/';

//   // Redirect already logged-in users
//   React.useEffect(() => {
//     if (user) {
//       // If user is admin, redirect to admin dashboard or intended page
//       if (isAdmin) {
//         // If they were trying to access a specific admin page, send them there
//         navigate(from, { replace: true });
//       } else {
//         navigate('/'); // Regular users go to home
//       }
//     }
//   }, [user, isAdmin, navigate, from]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const userData = await login(email, password);
      
//       // Redirect based on user role
//       if (userData.role === 'admin') {
//         // If they were trying to access a specific admin page, send them there
//         navigate(from, { replace: true });
//       } else {
//         navigate('/');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       // Error is already set in the auth context
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div className="mb-6">
//             <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>
//         <p className="mt-4 text-center">
//           Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
//         </p>
//         <p className="mt-2 text-center">
//           Forgot password? <a href="/forgot-password" className="text-blue-500 hover:underline">Reset Password</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Handle redirection after login
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // The useEffect above will handle the navigation once user state updates
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
        </p>
        <p className="mt-2 text-center">
          Forgot password? <a href="/forgot-password" className="text-blue-500 hover:underline">Reset Password</a>
        </p>
      </div>
    </div>
  );
};

export default Login;