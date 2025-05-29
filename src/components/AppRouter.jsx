import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import App from "../App";
import Signup from "./signUp";
import Login from "./Login";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Auth Route Component (for login/signup pages)
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" />;
  }
  return children;
};

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <AuthRoute>
              <Signup />
            </AuthRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default AppRouter;
