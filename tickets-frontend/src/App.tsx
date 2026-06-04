import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sileo';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import AdminManagementPage from './pages/AdminManagementPage';
import TechnicianManagementPage from './pages/TechnicianManagementPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import RequesterDashboardPage from './pages/RequesterDashboardPage';
import InstitutionalStructurePage from './pages/InstitutionalStructurePage';
import ReportsPage from './pages/ReportsPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import { PDFTestReport } from './components/reports/PDFTestReport';
import OfficeManagementPage from './pages/OfficeManagementPage';
import AdminTicketManagementPage from './pages/AdminTicketManagementPage';
import AuditPage from './pages/AuditPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicBoardPage from './pages/PublicBoardPage';
import BienesPage from './pages/BienesPage';
import BienesTest from './components/bienes/BienesTest';
import TicketForm from './components/tickets/TicketForm';
import './styles/variables.css';

const router = createBrowserRouter([
  { path: '/', element: <ProtectedRoute allowedRoles={[1]}><DashboardPage /></ProtectedRoute> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/admin', element: <ProtectedRoute allowedRoles={[1]}><AdminManagementPage /></ProtectedRoute> },
  { path: '/admin/tickets', element: <ProtectedRoute allowedRoles={[1]}><AdminTicketManagementPage /></ProtectedRoute> },
  { path: '/admin/technicians', element: <ProtectedRoute allowedRoles={[1]}><TechnicianManagementPage /></ProtectedRoute> },
  { path: '/admin/structure', element: <ProtectedRoute allowedRoles={[1]}><InstitutionalStructurePage /></ProtectedRoute> },
  { path: '/admin/offices', element: <ProtectedRoute allowedRoles={[1]}><OfficeManagementPage /></ProtectedRoute> },
  { path: '/admin/reports', element: <ProtectedRoute allowedRoles={[1]}><ReportsPage /></ProtectedRoute> },
  { path: '/admin/register-user', element: <ProtectedRoute allowedRoles={[1]}><UserRegistrationPage /></ProtectedRoute> },
  { path: '/admin/audit', element: <ProtectedRoute allowedRoles={[4]}><AuditPage /></ProtectedRoute> },
  { path: '/technician', element: <ProtectedRoute allowedRoles={[2]}><TechnicianDashboardPage /></ProtectedRoute> },
  { path: '/requester', element: <ProtectedRoute allowedRoles={[3]}><RequesterDashboardPage /></ProtectedRoute> },
  { path: '/new-ticket', element: <ProtectedRoute allowedRoles={[1, 3]}><TicketForm /></ProtectedRoute> },
  { path: '/pdf-test', element: <PDFTestReport /> },
  { path: '/public-board', element: <PublicBoardPage /> },
  { path: '/bienes', element: <ProtectedRoute allowedRoles={[1, 2, 3, 4]}><BienesPage /></ProtectedRoute> },
  { path: '/bienes-test', element: <BienesTest /> },
]);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Toaster position="top-right" />
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
