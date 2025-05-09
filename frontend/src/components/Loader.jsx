import React from 'react';

const Loader = ({ size = "md", color = "blue", className = "" }) => {
  // Define size classes
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  // Define color classes
  const colorClasses = {
    blue: "border-blue-600",
    green: "border-green-600",
    red: "border-red-600",
    yellow: "border-yellow-600",
    purple: "border-purple-600",
    gray: "border-gray-600"
  };

  // Get appropriate classes based on props
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClass} border-4 ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default Loader;