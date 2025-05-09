import { useState, useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`
      fixed top-20 right-4 z-50 p-4 rounded-md shadow-md min-w-[300px] 
      ${type === 'success' ? 'bg-green-500 text-white' : ''}
      ${type === 'error' ? 'bg-red-500 text-white' : ''}
      ${type === 'info' ? 'bg-blue-500 text-white' : ''}
      ${type === 'warning' ? 'bg-yellow-500 text-white' : ''}
    `}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {type === 'success' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {type === 'error' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {type === 'info' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'warning' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <p>{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Function to add a notification
  const addNotification = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  // Function to remove a notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Create global event listeners
  useEffect(() => {
    // Define the event handlers
    const handleSuccess = (e) => addNotification(e.detail.message, 'success');
    const handleError = (e) => addNotification(e.detail.message, 'error');
    const handleInfo = (e) => addNotification(e.detail.message, 'info');
    const handleWarning = (e) => addNotification(e.detail.message, 'warning');

    // Add event listeners
    window.addEventListener('notification:success', handleSuccess);
    window.addEventListener('notification:error', handleError);
    window.addEventListener('notification:info', handleInfo);
    window.addEventListener('notification:warning', handleWarning);

    // Clean up
    return () => {
      window.removeEventListener('notification:success', handleSuccess);
      window.removeEventListener('notification:error', handleError);
      window.removeEventListener('notification:info', handleInfo);
      window.removeEventListener('notification:warning', handleWarning);
    };
  }, []);

  // Add to global window for use anywhere in the app
  useEffect(() => {
    window.notify = {
      success: (message) => {
        const event = new CustomEvent('notification:success', { detail: { message } });
        window.dispatchEvent(event);
      },
      error: (message) => {
        const event = new CustomEvent('notification:error', { detail: { message } });
        window.dispatchEvent(event);
      },
      info: (message) => {
        const event = new CustomEvent('notification:info', { detail: { message } });
        window.dispatchEvent(event);
      },
      warning: (message) => {
        const event = new CustomEvent('notification:warning', { detail: { message } });
        window.dispatchEvent(event);
      }
    };
  }, []);

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default Notifications;