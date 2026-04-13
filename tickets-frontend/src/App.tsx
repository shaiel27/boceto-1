import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import AdminManagementPage from './pages/AdminManagementPage';
import TechnicianManagementPage from './pages/TechnicianManagementPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import RequesterDashboardPage from './pages/RequesterDashboardPage';
import InstitutionalStructurePage from './pages/InstitutionalStructurePage';
import TicketForm from './components/tickets/TicketForm';
import './styles/variables.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminManagementPage />} />
            <Route path="/admin/technicians" element={<TechnicianManagementPage />} />
            <Route path="/admin/structure" element={<InstitutionalStructurePage />} />
            <Route path="/technician" element={<TechnicianDashboardPage />} />
            <Route path="/requester" element={<RequesterDashboardPage />} />
            <Route path="/new-ticket" element={<TicketForm />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
