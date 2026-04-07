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
  ArrowLeft
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
                  <button className="nav-link">
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

        {/* Enhanced Stats Cards */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card enhanced">
              <div className="stat-header">
                <div className="stat-icon">
                  <stat.icon size={20} />
                </div>
                <div className="stat-title">{stat.title}</div>
              </div>
              <div className="stat-value">{stat.value}</div>
              {stat.trend && (
                <div className={`stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                  <TrendingUp size={16} />
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

        
        {/* Enhanced Tickets Table */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Listado Maestro de Tickets</h2>
            <div className="table-controls">
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <button className="filter-button">
                  <Filter size={16} />
                  Filtros
                  <ChevronDown size={14} />
                </button>
                <select 
                  className="filter-select"
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
          <div className="table-container">
            <table className="data-table enhanced">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asunto</th>
                  <th>Oficina</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Asignado a</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => (
                  <tr 
                    key={index} 
                    className={`table-row ${selectedTicket === index ? 'selected' : ''}`}
                    onClick={() => setSelectedTicket(index)}
                  >
                    <td>
                      <span className="ticket-id">{ticket.id}</span>
                    </td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.office}</td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                        <div className={`status-dot ${getStatusClass(ticket.priority === 'Alta' ? 'Pendiente' : ticket.priority === 'Media' ? 'En Proceso' : 'Cerrado')}`}></div>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className={`status-dot ${getStatusClass(ticket.status)}`}></div>
                        {ticket.status}
                      </div>
                    </td>
                    <td>{ticket.assignedTo}</td>
                    <td>{ticket.date}</td>
                    <td>
                      <button className="action-button enhanced">Ver Detalles</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Staff */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Personal Técnico</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {techniciansData.map((tech, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: '#e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={16} color="#6c757d" />
                </div>
                <span style={{ flex: 1, fontSize: '0.875rem' }}>{tech.name}</span>
                <div className={`status-dot ${tech.status === 'available' ? 'status-resolved' : 'status-pending'}`}></div>
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
