import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// 15 Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import OfficerDashboard from './pages/OfficerDashboard';
import AssignedComplaintsPage from './pages/AssignedComplaintsPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersPage from './pages/ManageUsersPage';
import ManageDepartmentsPage from './pages/ManageDepartmentsPage';
import ComplaintAssignmentPage from './pages/ComplaintAssignmentPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/track/:id" element={<ComplaintDetailsPage />} />

          {/* Citizen Protected Routes */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/submit-complaint"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <SubmitComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/my-complaints"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyComplaintsPage />
              </ProtectedRoute>
            }
          />

          {/* Officer Protected Routes */}
          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/assigned-complaints"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <AssignedComplaintsPage />
              </ProtectedRoute>
            }
          />

          {/* Administrator Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageDepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ComplaintAssignmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Common Authenticated Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'officer', 'admin']}>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
