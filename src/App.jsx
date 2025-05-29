import { EventProvider } from './contexts/EventContext';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from "./pages/Dashboard";
import CalendarApp from "./pages/CalendarApp";
import Settings from './Settings';

/* import Navigation from './Navigation'; */

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = sessionStorage.getItem('user') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/*
          EventProvider must wrap any component that uses `useEvents` from EventContext.
          Since Dashboard uses it, and Dashboard is rendered via a Route,
          the EventProvider should wrap the Routes component itself to ensure
          all relevant routes have access to the context.
        */}
        <EventProvider> {/* <-- EventProvider starts here */}
          <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Other Routes */}
            {/* Dashboard needs EventContext, so it must be within EventProvider's scope */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* If CalendarApp also uses useEvents, it benefits from being here too */}
            <Route path="/calendar" element={<CalendarApp />} />
            <Route path="/settings" element={<Settings/>} />
            {/* Catch-all route - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventProvider> {/* <-- EventProvider ends here */}
      </div>
    </Router>
  );
}

export default App;
