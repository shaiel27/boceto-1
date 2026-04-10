import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  Clock,
  UserCheck,
  User,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowLeft,
  UserPlus,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Stepper from '../common/Stepper';
import TicketForm from '../tickets/TicketForm';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  
  // Ticket workflow steps
  const ticketSteps = [
    {
      id: 1,
      title: 'Solicitud',
      description: 'Usuario crea el ticket',
      status: 'completed' as const
    },
    {
      id: 2,
      title: 'Asignación',
      description: 'Asignado a técnico',
      status: 'active' as const
    },
    {
      id: 3,
      title: 'En Progreso',
      description: 'Técnico trabajando',
      status: 'pending' as const
    },
    {
      id: 4,
      title: 'Resuelto',
      description: 'Ticket cerrado',
      status: 'pending' as const
    }
  ];

  const statsData = [
    {
      title: 'Total de Tickets',
      value: '1250',
      trend: '+30%',
      trendUp: true,
      icon: FileText
    },
    {
      title: 'Técnicos Disponibles',
      value: '9/15',
      status: 'Disponible',
      icon: UserCheck
    },
    {
      title: 'Oficinas con Más Incidencias',
      value: 'Catastro, Obras, Bienestar',
      icon: Building
    },
    {
      title: 'Tiempo Promedio de Cierre',
      value: '4.5 horas',
      trend: '+15%',
      trendUp: true,
      icon: Clock
    }
  ];

  const ticketsData = [
    {
      id: '#T-00123',
      subject: 'Alcaldía SC inici...',
      office: 'Catastro',
      priority: 'Alta',
      status: 'Pendiente',
      assignedTo: 'Usuario M...',
      date: '15/03/2024'
    },
    {
      id: '#T-00124',
      subject: 'Alcaldía SC ave...',
      office: 'Obras',
      priority: 'Alta',
      status: 'Pendiente',
      assignedTo: 'Amna Verez',
      date: '15/03/2024'
    },
    {
      id: '#T-00125',
      subject: 'Asunto de nailia...',
      office: 'Obras',
      priority: 'Media',
      status: 'En Proceso',
      assignedTo: 'Usuario M...',
      date: '15/03/2024'
    },
    {
      id: '#T-00126',
      subject: 'Alcaldía SC aver...',
      office: 'Bienestar',
      priority: 'Baja',
      status: 'En Proceso',
      assignedTo: 'Usuario M...',
      date: '15/03/2024'
    },
    {
      id: '#T-00127',
      subject: 'Reparación equipo...',
      office: 'Obras',
      priority: 'Baja',
      status: 'Cerrado',
      assignedTo: 'Usuario M...',
      date: '15/03/2024'
    }
  ];

  const techniciansData = [
    { name: 'Amna Verez', status: 'available' },
    { name: 'Carlos Diaz', status: 'unavailable' },
    { name: 'Lavila Kavrvn', status: 'available' },
    { name: 'Usuario Municipal', status: 'available' }
  ];

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baja': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'status-pending';
      case 'en proceso': return 'status-progress';
      case 'cerrado': return 'status-resolved';
      default: return '';
    }
  };

  const handleStepClick = (stepId: number) => {
    console.log(`Step ${stepId} clicked`);
  };

  const filteredTickets = ticketsData.filter(ticket => {
    const matchesFilter = activeFilter === 'all' || ticket.status === activeFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard-container">
      {showTicketForm ? (
        <div className="ticket-form-view">
          <div className="form-header-actions">
            <button 
              className="back-btn" 
              onClick={() => setShowTicketForm(false)}
            >
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
          </div>
          <TicketForm />
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-logo">
              <Building size={20} color="white" />
            </div>
            <div className="sidebar-title">Alcaldía del Municipio San Cristóbal</div>
            <nav>
              <ul className="nav-menu">
                <li className="nav-item">
                  <button className="nav-link active">
                    <BarChart3 size={18} />
                    Dashboard
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link"
                    onClick={() => navigate('/admin')}
                  >
                    <FileText size={18} />
                    Gestión de Tickets
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link"
                    onClick={() => navigate('/admin/technicians')}
                  >
                    <Users size={18} />
                    Personal Técnico
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link">
                    <TrendingUp size={18} />
                    Reportes
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link">
                    <Settings size={18} />
                    Usuarios
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content-area">
        {/* Ticket Workflow Stepper */}
       
          {/* Action Button */}
        <div className="dashboard-actions">
          <button 
            className="new-ticket-btn"
            onClick={() => setShowTicketForm(true)}
          >
            <Plus size={18} />
            Nuevo Ticket
          </button>
        </div>

        {/* Enhanced Stats Cards - Iconos más visibles */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card enhanced">
              <div className="stat-header">
                <div className="stat-icon">
                  <stat.icon size={32} strokeWidth={2} />
                </div>
                <div className="stat-title">{stat.title}</div>
              </div>
              <div className="stat-value">{stat.value}</div>
              {stat.trend && (
                <div className={`stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                  <TrendingUp size={18} strokeWidth={2.5} />
                  {stat.trend}
                </div>
              )}
              {stat.status && (
                <div className="stat-trend trend-up">
                  <div className="status-dot status-resolved"></div>
                  {stat.status}
                </div>
              )}
            </div>
          ))}
        </div>

        
        {/* Enhanced Tickets Section */}
        <div className="content-card tickets-section">
          <div className="section-header">
            <div className="section-title-area">
              <h2 className="section-title">
                <FileText size={24} />
                Gestión de Tickets
              </h2>
              <p className="section-subtitle">Administra y monitorea todas las solicitudes</p>
            </div>
            <div className="section-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-controls">
                <select 
                  className="status-filter"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Cerrado">Cerrados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Stats Overview */}
          <div className="tickets-overview">
            <div className="overview-card">
              <div className="overview-icon pending">
                <AlertCircle size={20} />
              </div>
              <div className="overview-info">
                <div className="overview-number">{filteredTickets.filter(t => t.status === 'Pendiente').length}</div>
                <div className="overview-label">Pendientes</div>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon progress">
                <Clock size={20} />
              </div>
              <div className="overview-info">
                <div className="overview-number">{filteredTickets.filter(t => t.status === 'En Proceso').length}</div>
                <div className="overview-label">En Proceso</div>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon resolved">
                <CheckCircle size={20} />
              </div>
              <div className="overview-info">
                <div className="overview-number">{filteredTickets.filter(t => t.status === 'Cerrado').length}</div>
                <div className="overview-label">Resueltos</div>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon total">
                <FileText size={20} />
              </div>
              <div className="overview-info">
                <div className="overview-number">{filteredTickets.length}</div>
                <div className="overview-label">Total</div>
              </div>
            </div>
          </div>

          {/* Modern Tickets Grid */}
          <div className="tickets-modern-grid">
            {filteredTickets.map((ticket, index) => (
              <div 
                key={index} 
                className={`ticket-modern-card ${selectedTicket === index ? 'selected' : ''} ${ticket.status.toLowerCase().replace(' ', '-')}`}
                onClick={() => setSelectedTicket(index)}
              >
                <div className="ticket-header">
                  <div className="ticket-id-section">
                    <span className="ticket-id-modern">{ticket.id}</span>
                    <span className={`priority-indicator ${getPriorityClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="ticket-status">
                    {ticket.status === 'Pendiente' && <AlertCircle size={16} className="status-icon pending" />}
                    {ticket.status === 'En Proceso' && <Clock size={16} className="status-icon progress" />}
                    {ticket.status === 'Cerrado' && <CheckCircle size={16} className="status-icon resolved" />}
                  </div>
                </div>

                <div className="ticket-content">
                  <h3 className="ticket-subject">{ticket.subject}</h3>
                  <div className="ticket-meta">
                    <div className="meta-item">
                      <Building size={14} />
                      <span>{ticket.office}</span>
                    </div>
                    <div className="meta-item">
                      <User size={14} />
                      <span>{ticket.assignedTo}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{ticket.date}</span>
                    </div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="status-badge">
                    <div className={`status-dot ${getStatusClass(ticket.status)}`}></div>
                    <span>{ticket.status}</span>
                  </div>
                  <button className="ticket-action-btn">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="empty-state">
              <FileText size={48} className="empty-icon" />
              <h3>No se encontraron tickets</h3>
              <p>No hay tickets que coincidan con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        {/* Enhanced Technical Staff - Rediseñado */}
        <div className="content-card technical-staff-card">
          <div className="card-header">
            <div className="header-title-section">
              <div className="header-icon">
                <Users size={28} />
              </div>
              <h2 className="card-title">Equipo Técnico</h2>
            </div>
            <div className="staff-stats">
              <span className="stat-badge available">
                <div className="status-dot status-resolved"></div>
                <span className="stat-number">{techniciansData.filter(t => t.status === 'available').length}</span>
                <span className="stat-label">Disponibles</span>
              </span>
              <span className="stat-badge busy">
                <div className="status-dot status-pending"></div>
                <span className="stat-number">{techniciansData.filter(t => t.status === 'unavailable').length}</span>
                <span className="stat-label">Ocupados</span>
              </span>
            </div>
          </div>
          
          {/* Nueva tabla de técnicos */}
          <div className="technicians-table-container">
            <div className="technicians-table-header">
              <div className="table-cell tech-cell">Técnico</div>
              <div className="table-cell status-cell">Estado</div>
              <div className="table-cell actions-cell">Acciones</div>
            </div>
            {techniciansData.map((tech, index) => (
              <div key={index} className="technician-row-table">
                <div className="table-cell tech-cell">
                  <div className="tech-profile">
                    <div className="tech-avatar">
                      <User size={22} />
                      <div className={`status-indicator ${tech.status}`}></div>
                    </div>
                    <div className="tech-info">
                      <span className="tech-name">{tech.name}</span>
                    </div>
                  </div>
                </div>
                <div className="table-cell status-cell">
                  <div className={`status-badge-large ${tech.status}`}>
                    <div className={`status-dot ${tech.status === 'available' ? 'status-resolved' : 'status-pending'}`}></div>
                    <span>{tech.status === 'available' ? 'Disponible' : 'Ocupado'}</span>
                  </div>
                </div>
                <div className="table-cell actions-cell">
                  <div className="tech-actions">
                    <button className="tech-action-btn assign" title="Asignar ticket">
                      <UserPlus size={20} />
                    </button>
                    <button className="tech-action-btn settings" title="Configuración">
                      <Settings size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          </main>
        </>
      )}
    </div>
  );
};

export default Dashboard;
