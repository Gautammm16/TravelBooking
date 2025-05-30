// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Header = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const token = localStorage.getItem("token");
//       if (!token && user) logout();
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [user, logout]);

//   const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
//   const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

//   const handleLogout = async () => {
//     await logout();
//     setIsDropdownOpen(false);
//     navigate("/");
//   };

//   const handleLinkClick = () => {
//     setIsDropdownOpen(false);
//     setIsMobileMenuOpen(false);
//   };

//   return (
//     <header className="bg-blue-600 text-white shadow-md">
//       <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
//         {/* Logo */}
//         <Link to="/" className="text-2xl font-bold">
//           Travel Agency
//         </Link>

//         {/* Mobile Menu Button */}
//         <button className="md:hidden text-white" onClick={toggleMobileMenu}>
//           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
//           </svg>
//         </button>

//         {/* Menu Items */}
//         <div className={`w-full md:flex md:items-center md:justify-between md:w-auto ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
//           <ul className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-0">
//             <li><Link to="/" className="block px-2 py-1 hover:text-gray-200">Home</Link></li>
//             <li><Link to="/gallery" className="block px-2 py-1 hover:text-gray-200">Gallery</Link></li>
//             <li><Link to="/about" className="block px-2 py-1 hover:text-gray-200">About</Link></li>
//             <li><Link to="/contact" className="block px-2 py-1 hover:text-gray-200">Contact Us</Link></li>

//             {/* Custom Tour - Only for logged-in users */}
//             {user && (
//               <>
//                 <li>
//                   <Link to="/custom-tour-request" className="block px-2 py-1 hover:text-gray-200">
//                     Custom Tour
//                   </Link>
//                 </li>
//                 {/* My Custom Tours in Mobile Menu */}
//                 <li className="md:hidden">
//                   <Link
//                     to="/my-custom-tours"
//                     className="block py-2 text-gray-700 hover:text-blue-600"
//                     onClick={handleLinkClick}
//                   >
//                     My Custom Tours
//                   </Link>
//                 </li>
//               </>
//             )}

//             {/* Dropdown in Mobile View */}
//             <li className="md:hidden">
//               <button onClick={toggleDropdown} className="w-full text-left flex items-center px-2 py-1 space-x-2 hover:text-gray-200">
//                 <span>{user ? user.firstName : "Login / Register"}</span>
//                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                 </svg>
//               </button>
//               {isDropdownOpen && (
//                 <ul className="bg-white text-black mt-1 shadow-md rounded-md w-full z-10">
//                   {user ? (
//                     <>
//                       <li>
//                         <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
//                           Profile
//                         </Link>
//                       </li>
//                       <li>
//                         <Link to="/bookings" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
//                           My Bookings
//                         </Link>
//                       </li>
//                       <li>
//                         <Link
//                           to="/favorites"
//                           className="block px-4 py-2 hover:bg-gray-100"
//                           onClick={handleLinkClick}
//                         >
//                           Favorites
//                         </Link>
//                       </li>
//                       <li>
//                         <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
//                           Logout
//                         </button>
//                       </li>
//                     </>
//                   ) : (
//                     <>
//                       <li><Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>Login</Link></li>
//                       <li><Link to="/register" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>Register</Link></li>
//                     </>
//                   )}
//                 </ul>
//               )}
//             </li>
//           </ul>
//         </div>

//         {/* Dropdown in Desktop View */}
//         <div className="relative hidden md:block ml-4">
//           <button onClick={toggleDropdown} className="flex items-center space-x-2 hover:text-gray-200">
//             <span>{user ? user.firstName : "Login / Register"}</span>
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>
//           {isDropdownOpen && (
//             <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md w-40 z-10">
//               {user ? (
//                 <>
//                   <li>
//                     <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="/my-bookings" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
//                       My Bookings
//                     </Link>
//                   </li>
//                   <li>
//                     <Link
//                       to="/my-custom-tours"
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={handleLinkClick}
//                     >
//                       My Custom Tours
//                     </Link>
//                   </li>
//                   <li>
//                     <Link
//                       to="/favorites"
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={handleLinkClick}
//                     >
//                       Favorites
//                     </Link>
//                   </li>
//                   <li>
//                     <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
//                       Logout
//                     </button>
//                   </li>
//                 </>
//               ) : (
//                 <>
//                   <li>
//                     <Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
//                       Login
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="/register" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
//                       Register
//                     </Link>
//                   </li>
//                 </>
//               )}
//             </ul>
//           )}
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Header;



import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token && user) logout();
    }, 1000);
    return () => clearInterval(interval);
  }, [user, logout]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Travel Agency
        </Link>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={toggleMobileMenu}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Menu Items */}
        <div className={`w-full md:flex md:items-center md:justify-between md:w-auto ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <ul className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-0">
            <li><Link to="/" className="block px-2 py-1 hover:text-gray-200">Home</Link></li>
            <li><Link to="/gallery" className="block px-2 py-1 hover:text-gray-200">Gallery</Link></li>
            <li><Link to="/about" className="block px-2 py-1 hover:text-gray-200">About</Link></li>
            <li><Link to="/contact" className="block px-2 py-1 hover:text-gray-200">Contact Us</Link></li>

            {/* Admin Dashboard Link - Only for admin users */}
            {user?.role === 'admin' && (
              <li>
                <Link to="/admin/dashboard" className="block px-2 py-1 hover:text-gray-200">
                  Dashboard
                </Link>
              </li>
            )}

            {/* Custom Tour - Only for logged-in users */}
            {user && (
              <>
                <li>
                  <Link to="/custom-tour-request" className="block px-2 py-1 hover:text-gray-200">
                    Custom Tour
                  </Link>
                </li>
                {/* My Custom Tours in Mobile Menu */}
                <li className="md:hidden">
                  <Link
                    to="/my-custom-tours"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={handleLinkClick}
                  >
                    My Custom Tours
                  </Link>
                </li>
              </>
            )}

            {/* Dropdown in Mobile View */}
            <li className="md:hidden">
              <button onClick={toggleDropdown} className="w-full text-left flex items-center px-2 py-1 space-x-2 hover:text-gray-200">
                <span>{user ? user.firstName : "Login / Register"}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <ul className="bg-white text-black mt-1 shadow-md rounded-md w-full z-10">
                  {user ? (
                    <>
                      <li>
                        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link to="/bookings" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
                          My Bookings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/favorites"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={handleLinkClick}
                        >
                          Favorites
                        </Link>
                      </li>
                      {/* Admin Dashboard in mobile dropdown */}
                      {user.role === 'admin' && (
                        <li>
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={handleLinkClick}
                          >
                            Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>Login</Link></li>
                      <li><Link to="/register" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>Register</Link></li>
                    </>
                  )}
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Dropdown in Desktop View */}
        <div className="relative hidden md:block ml-4">
          <button onClick={toggleDropdown} className="flex items-center space-x-2 hover:text-gray-200">
            <span>{user ? user.firstName : "Login / Register"}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md w-40 z-10">
              {user ? (
                <>
                  <li>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-bookings" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/my-custom-tours"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLinkClick}
                    >
                      My Custom Tours
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLinkClick}
                    >
                      Favorites
                    </Link>
                  </li>
                  {/* Admin Dashboard in desktop dropdown */}
                  {user.role === 'admin' && (
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLinkClick}
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLinkClick}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;