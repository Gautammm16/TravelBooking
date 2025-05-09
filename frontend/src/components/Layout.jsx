import React from 'react';
import Navbar from './Navbar';
import Notifications from './Notification';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="pt-16"> {/* Add padding top to account for fixed navbar */}
        <Notifications />
        {children}
      </div>
    </>
  );
};

export default Layout;