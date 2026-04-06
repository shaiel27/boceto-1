import React from 'react';
import { 
  Building, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  Clock,
  UserCheck,
  User
} from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Building size={20} color="white" />
        </div>
        <div className="sidebar-title">Alcaldía del Municipio San Cristóbal</div>
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#" className="nav-link active">
                <BarChart3 size={18} />
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <FileText size={18} />
                Gestión de Tickets
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <Users size={18} />
                Personal Técnico
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <TrendingUp size={18} />
                Reportes
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <Settings size={18} />
                Usuarios
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content-area">
        {/* Stats Cards */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
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

        {/* Tickets Table */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Listado Maestro de Tickets</h2>
            <div className="filter-group">
              <select className="filter-select">
                <option>Filtrar por Oficina</option>
                <option>Catastro</option>
                <option>Obras</option>
                <option>Bienestar</option>
              </select>
              <select className="filter-select">
                <option>Filtrar por Técnico</option>
                <option>Amna Verez</option>
                <option>Carlos Diaz</option>
                <option>Usuario Municipal</option>
              </select>
              <select className="filter-select">
                <option>Filtrar por Prioridad</option>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
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
                {ticketsData.map((ticket, index) => (
                  <tr key={index}>
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
                      <button className="action-button">Asignar Técnico</button>
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
    </div>
  );
};

export default Dashboard;
