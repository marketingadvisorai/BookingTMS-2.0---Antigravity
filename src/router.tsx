import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import VenueProfile from './pages/VenueProfile';
import OwnerAdminLogin from './pages/OwnerAdminLogin';
import WaiverForm from './pages/WaiverForm';
import { ThemeProvider } from './components/layout/ThemeContext';

// Main router configuration
export const router = createBrowserRouter([
  // System Admin & Main App Routes
  {
    path: '/admin/*',
    element: <App />, // Your existing admin app
  },
  {
    path: '/system-admin/*',
    element: <App />, // System admin routes
  },
  {
    path: '/waiver-form/:id',
    element: (
      <ThemeProvider>
        <WaiverForm />
      </ThemeProvider>
    ),
  },
  
  // Slug-based Public Venue Profile Routes
  {
    path: '/:slug',
    element: (
      <HelmetProvider>
        <ThemeProvider>
          <VenueProfile />
        </ThemeProvider>
      </HelmetProvider>
    ),
  },
  
  // Slug-based Owner Admin Login
  {
    path: '/:slug/admin',
    element: (
      <HelmetProvider>
        <ThemeProvider>
          <OwnerAdminLogin />
        </ThemeProvider>
      </HelmetProvider>
    ),
  },
  
  // Slug-based Owner Admin Dashboard (after login)
  {
    path: '/:slug/admin/dashboard',
    element: <App />, // Reuse existing app with owner context
  },
  
  // Fallback to main app
  {
    path: '/',
    element: <App />,
  },
  
  // 404 catch-all
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    ),
  },
]);
