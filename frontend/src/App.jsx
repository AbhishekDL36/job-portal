import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import NotificationBar from './components/NotificationBar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import Applications from './pages/Applications';
import SavedJobs from './pages/SavedJobs';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumePreview from './pages/ResumePreview';
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';
import EmployerApplications from './pages/EmployerApplications';

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Navbar />
      <NotificationBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Job Seeker Routes */}
        <Route
          path="/jobs"
          element={
            <PrivateRoute requiredRole="job_seeker">
              <JobsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <PrivateRoute requiredRole="job_seeker">
              <JobDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <PrivateRoute requiredRole="job_seeker">
              <Applications />
            </PrivateRoute>
          }
        />
        <Route
          path="/saved-jobs"
          element={
            <PrivateRoute requiredRole="job_seeker">
              <SavedJobs />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={
            <PrivateRoute requiredRole="job_seeker">
              <ResumeBuilder />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-preview"
          element={
            <PrivateRoute requiredRole="job_seeker">
              <ResumePreview />
            </PrivateRoute>
          }
        />

        {/* Employer Routes */}
        <Route
          path="/employer/jobs"
          element={
            <PrivateRoute requiredRole="employer">
              <EmployerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/employer/post-job"
          element={
            <PrivateRoute requiredRole="employer">
              <PostJob />
            </PrivateRoute>
          }
        />
        <Route
          path="/employer/applications/:jobId"
          element={
            <PrivateRoute requiredRole="employer">
              <EmployerApplications />
            </PrivateRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
