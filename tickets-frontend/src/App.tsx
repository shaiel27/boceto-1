import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import AdminManagementPage from './pages/AdminManagementPage';
import TechnicianManagementPage from './pages/TechnicianManagementPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import RequesterDashboardPage from './pages/RequesterDashboardPage';
import InstitutionalStructurePage from './pages/InstitutionalStructurePage';
import ReportsPage from './pages/ReportsPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import OfficeManagementPage from './pages/OfficeManagementPage';
import AdminTicketManagementPage from './pages/AdminTicketManagementPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketForm from './components/tickets/TicketForm';
import './styles/variables.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Router>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={[1]}><AdminManagementPage /></ProtectedRoute>} />
              <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={[1]}><AdminTicketManagementPage /></ProtectedRoute>} />
              <Route path="/admin/technicians" element={<ProtectedRoute allowedRoles={[1]}><TechnicianManagementPage /></ProtectedRoute>} />
              <Route path="/admin/structure" element={<ProtectedRoute allowedRoles={[1]}><InstitutionalStructurePage /></ProtectedRoute>} />
              <Route path="/admin/offices" element={<ProtectedRoute allowedRoles={[1]}><OfficeManagementPage /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[1]}><ReportsPage /></ProtectedRoute>} />
              <Route path="/admin/register-user" element={<ProtectedRoute allowedRoles={[1]}><UserRegistrationPage /></ProtectedRoute>} />
              <Route path="/technician" element={<ProtectedRoute allowedRoles={[2]}><TechnicianDashboardPage /></ProtectedRoute>} />
              <Route path="/requester" element={<ProtectedRoute allowedRoles={[3]}><RequesterDashboardPage /></ProtectedRoute>} />
              <Route path="/new-ticket" element={<ProtectedRoute allowedRoles={[3]}><TicketForm /></ProtectedRoute>} />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
