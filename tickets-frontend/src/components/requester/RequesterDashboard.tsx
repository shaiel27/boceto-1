import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  User,
  Users,
  Bell,
  LogOut,
  ChevronRight,
  Calendar,
  MapPin,
  Settings,
  TrendingUp
} from 'lucide-react';
import './RequesterDashboard.css';

interface Ticket {
  id: string;
  Code: string;
  Subject: string;
  Description: string;
  Direction_Name: string;
  Division_Name: string;
  Coordination_Name: string;
  System_Priority: string;
  Status: string;
  Created_at: string;
  Resolved_at?: string;
  Solution?: string;
  Technicians: Array<{
    Name: string;
    Is_Lead: boolean;
  }>;
  Comments_Count: number;
}

interface RequesterProfile {
  id: string;
  name: string;
  email: string;
  Direction_Name: string;
  Division_Name: string;
  Coordination_Name: string;
}

const RequesterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requesterProfile, setRequesterProfile] = useState<RequesterProfile>({
    id: '1',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@alcaldia.gob',
    Direction_Name: 'Vialidad',
    Division_Name: 'División de Mantenimiento',
    Coordination_Name: 'Coordinación de Equipos'
  });

  const [myTickets, setMyTickets] = useState<Ticket[]>([
    {
      id: '1',
      Code: 'TICK-2024-001',
      Subject: 'Falla en servidor de red',
      Description: 'El servidor principal no responde',
      Direction_Name: 'Vialidad',
      Division_Name: 'División de Mantenimiento',
      Coordination_Name: 'Coordinación de Equipos',
      System_Priority: 'Alta',
      Status: 'En Proceso',
      Created_at: '2024-04-10T09:30:00',
      Technicians: [
        { Name: 'Juan Pérez', Is_Lead: true },
        { Name: 'María González', Is_Lead: false }
      ],
      Comments_Count: 3
    },
    {
      id: '2',
      Code: 'TICK-2024-002',
      Subject: 'Problema con impresoras',
      Description: 'Las impresoras no funcionan correctamente',
      Direction_Name: 'Vialidad',
      Division_Name: 'División de Mantenimiento',
      Coordination_Name: 'Coordinación de Equipos',
      System_Priority: 'Media',
      Status: 'Pendiente',
      Created_at: '2024-04-10T10:15:00',
      Technicians: [],
      Comments_Count: 1
    },
    {
      id: '3',
      Code: 'TICK-2024-003',
      Subject: 'Actualización de software',
      Description: 'Necesito actualizar el sistema operativo',
      Direction_Name: 'Vialidad',
      Division_Name: 'División de Mantenimiento',
      Coordination_Name: 'Coordinación de Equipos',
      System_Priority: 'Baja',
      Status: 'Resuelto',
      Created_at: '2024-04-09T14:00:00',
      Resolved_at: '2024-04-09T16:30:00',
      Solution: 'Se actualizó el sistema operativo a la versión más reciente y se configuraron las actualizaciones automáticas.',
      Technicians: [
        { Name: 'Juan Pérez', Is_Lead: true }
      ],
      Comments_Count: 0
    }
  ]);

  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'priority-high';
      case 'Media':
        return 'priority-medium';
      case 'Baja':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 1;
      case 'Técnicos Asignados':
        return 2;
      case 'En Proceso':
        return 3;
      case 'Resuelto':
        return 4;
      default:
        return 1;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeTickets = myTickets.filter(t => t.Status !== 'Resuelto');
  const resolvedTickets = myTickets.filter(t => t.Status === 'Resuelto');

  return (
    <div className="requester-dashboard">
      {/* Header */}
      <header className="req-header">
        <div className="header-content">
          <div className="header-left">
            <div className="req-avatar">
              <User size={32} />
            </div>
            <div className="req-info">
              <h1 className="req-name">{requesterProfile.name}</h1>
              <p className="req-role">Funcionario Municipal</p>
              <p className="req-dept">{requesterProfile.Direction_Name} - {requesterProfile.Coordination_Name}</p>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-actions">
              <button className="header-btn notification">
                <Bell size={20} />
                <span className="notification-badge">1</span>
              </button>
              <button className="header-btn logout" onClick={() => navigate('/login')}>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="req-main">
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card active">
            <div className="stat-icon">
              <AlertCircle size={28} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{activeTickets.length}</h3>
              <p className="stat-label">Activos</p>
            </div>
          </div>
          
          <div className="stat-card resolved">
            <div className="stat-icon">
              <CheckCircle size={28} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{resolvedTickets.length}</h3>
              <p className="stat-label">Resueltos</p>
            </div>
          </div>
          
          <div className="stat-card comments">
            <div className="stat-icon">
              <MessageSquare size={28} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{myTickets.reduce((acc, t) => acc + t.Comments_Count, 0)}</h3>
              <p className="stat-label">Comentarios</p>
            </div>
          </div>
        </div>

        {/* Nueva Solicitud Button */}
        <div className="new-ticket-section">
          <button 
            className="new-ticket-btn"
            onClick={() => navigate('/new-ticket')}
          >
            <Plus size={24} />
            <span>Nueva Solicitud</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Estado de mis Solicitudes */}
        <section className="tickets-section">
          <div className="section-header">
            <h2 className="section-title">
              <FileText size={24} />
              Estado de Mis Solicitudes
            </h2>
            <span className="ticket-count">{activeTickets.length} activas</span>
          </div>

          <div className="tickets-list">
            {activeTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-code">
                    <span className="code-label">Código:</span>
                    <span className="code-value">{ticket.Code}</span>
                  </div>
                  <div className="ticket-priority">
                    <span className={`priority-badge ${getPriorityColor(ticket.System_Priority)}`}>
                      {ticket.System_Priority}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="ticket-timeline">
                  <div className="timeline-step completed">
                    <div className="step-indicator">
                      <CheckCircle size={16} />
                    </div>
                    <div className="step-label">Pendiente</div>
                  </div>
                  <div className="timeline-connector completed"></div>
                  
                  <div className={`timeline-step ${getStatusStep(ticket.Status) >= 2 ? 'completed' : 'pending'}`}>
                    <div className="step-indicator">
                      {getStatusStep(ticket.Status) >= 2 ? <Users size={16} /> : <div className="step-dot"></div>}
                    </div>
                    <div className="step-label">Técnicos Asignados</div>
                  </div>
                  <div className={`timeline-connector ${getStatusStep(ticket.Status) >= 2 ? 'completed' : ''}`}></div>
                  
                  <div className={`timeline-step ${getStatusStep(ticket.Status) >= 3 ? 'completed' : 'pending'}`}>
                    <div className="step-indicator">
                      {getStatusStep(ticket.Status) >= 3 ? <Settings size={16} /> : <div className="step-dot"></div>}
                    </div>
                    <div className="step-label">En Proceso</div>
                  </div>
                  <div className={`timeline-connector ${getStatusStep(ticket.Status) >= 3 ? 'completed' : ''}`}></div>
                  
                  <div className={`timeline-step ${getStatusStep(ticket.Status) >= 4 ? 'completed' : 'pending'}`}>
                    <div className="step-indicator">
                      {getStatusStep(ticket.Status) >= 4 ? <CheckCircle size={16} /> : <div className="step-dot"></div>}
                    </div>
                    <div className="step-label">Resuelto</div>
                  </div>
                </div>

                <div className="ticket-body">
                  <h3 className="ticket-subject">{ticket.Subject}</h3>
                  <p className="ticket-description">{ticket.Description}</p>
                  
                  <div className="ticket-location">
                    <MapPin size={16} />
                    <div className="location-hierarchy">
                      <span className="location-item">{ticket.Direction_Name}</span>
                      <span className="location-separator">→</span>
                      <span className="location-item">{ticket.Division_Name}</span>
                      <span className="location-separator">→</span>
                      <span className="location-item">{ticket.Coordination_Name}</span>
                    </div>
                  </div>

                  <div className="ticket-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Creado: {formatDate(ticket.Created_at)}</span>
                    </div>
                    {ticket.Comments_Count > 0 && (
                      <div className="meta-item comments-alert">
                        <MessageSquare size={14} />
                        <span>{ticket.Comments_Count} comentarios nuevos</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Equipo Técnico Asignado */}
                <div className="ticket-footer">
                  <div className="technicians-assigned">
                    <h4 className="tech-assigned-title">Equipo Técnico:</h4>
                    {ticket.Technicians.length > 0 ? (
                      <div className="tech-list">
                        {ticket.Technicians.map((tech, index) => (
                          <div key={index} className="tech-item">
                            {tech.Is_Lead && <span className="lead-badge">Principal</span>}
                            <span className="tech-name">{tech.Name}</span>
                            {index < ticket.Technicians.length - 1 && <span className="tech-separator">•</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="no-tech">Sin técnicos asignados</span>
                    )}
                  </div>
                  
                  <button className="view-details-btn">
                    Ver Detalles
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historial de Soluciones */}
        <section className="history-section">
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={24} />
              Historial de Soluciones
            </h2>
            <span className="ticket-count">{resolvedTickets.length} resueltos</span>
          </div>

          <div className="history-list">
            {resolvedTickets.map((ticket) => (
              <div key={ticket.id} className="history-card">
                <div className="history-header">
                  <div className="history-code">
                    <span className="code-value">{ticket.Code}</span>
                  </div>
                  <div className="history-date">
                    <Calendar size={14} />
                    {ticket.Resolved_at && formatDate(ticket.Resolved_at)}
                  </div>
                </div>
                
                <h3 className="history-subject">{ticket.Subject}</h3>
                
                <div className="history-solution">
                  <h4 className="solution-title">Solución Aplicada:</h4>
                  <p className="solution-text">{ticket.Solution || 'Sin descripción de solución'}</p>
                </div>
                
                <div className="history-technicians">
                  <span className="tech-label">Resuelto por:</span>
                  <span className="tech-names">
                    {ticket.Technicians.map(t => t.Name).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RequesterDashboard;
