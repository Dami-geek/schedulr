import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { CanvasProvider } from './contexts/CanvasContext';
import { CalendarProvider } from './contexts/CalendarContext';
import { GoogleCalendarProvider } from './contexts/GoogleCalendarContext';

const Profile = React.lazy(() => import('./pages/Profile'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <CanvasProvider>
          <GoogleCalendarProvider>
            <CalendarProvider>
              <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Suspense>
            </CalendarProvider>
          </GoogleCalendarProvider>
        </CanvasProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;
