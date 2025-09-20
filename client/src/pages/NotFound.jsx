import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center border border-green-100 rounded-lg p-8 shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
        <p className="text-lg text-green-700 mb-6">Oops! Page not found.</p>
        <Link
          to="/"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
