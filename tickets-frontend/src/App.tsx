import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
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
              <Route path="/admin" element={<AdminManagementPage />} />
              <Route path="/admin/tickets" element={<AdminTicketManagementPage />} />
              <Route path="/admin/technicians" element={<TechnicianManagementPage />} />
              <Route path="/admin/structure" element={<InstitutionalStructurePage />} />
              <Route path="/admin/offices" element={<OfficeManagementPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/register-user" element={<UserRegistrationPage />} />
              <Route path="/technician" element={<TechnicianDashboardPage />} />
              <Route path="/requester" element={<RequesterDashboardPage />} />
              <Route path="/new-ticket" element={<TicketForm />} />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
