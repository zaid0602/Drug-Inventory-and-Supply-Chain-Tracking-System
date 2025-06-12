import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Sidebar from "./Components/Sidebar/Sidebar.jsx";
import Home from "./Components/Home/Home.jsx";
import Inventory from "./Components/Inventory/Inventory.jsx";
import Upload from "./Components/Upload/Upload.jsx";
import Sales from "./Components/Sales/Sales.jsx";
import Tracking from "./Components/Tracking/Tracking.jsx";
import Help from "./Components/Help/Help.jsx";
import Auth from "./Components/Auth/Auth.jsx";
import Predict from "./Components/Predict/Predict.jsx";
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Protected Route wrapper component
  const ProtectedRoute = ({ children }) => {
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const handleAuthentication = (status) => {
    console.log('Setting authentication status:', status);
    setIsAuthenticated(status);
    if (!status) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const handleLogout = () => {
    handleAuthentication(false);
    window.location.href = '/';
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Sidebar />}
        <div className={`main-content ${!isAuthenticated ? 'full-width' : ''}`}>
          {isAuthenticated && <Navbar onLogout={handleLogout} />}
          <Routes>
            <Route 
              path="/" 
              element={
                !isAuthenticated ? (
                  <Auth setIsAuthenticated={handleAuthentication} />
                ) : (
                  <Navigate to="/home" replace />
                )
              } 
            />
            
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/sales" 
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tracking" 
              element={
                <ProtectedRoute>
                  <Tracking />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/predict" 
              element={
                <ProtectedRoute>
                  <Predict />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/help" 
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route for unmatched paths */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
