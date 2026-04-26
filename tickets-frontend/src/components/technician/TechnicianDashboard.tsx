import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  MapPin,
  Settings,
  User,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  LogOut,
  Bell,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Crown,
  Users,
  X,
  Send,
  History
} from 'lucide-react';
import './TechnicianDashboard.css';
import TechnicianProfileComponent from './TechnicianProfile';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Ticket {
  id: string;
  Code: string;
  Subject: string;
  Description: string;
  Property_Number: string;
  Direction_Name: string;
  Division_Name: string;
  Coordination_Name: string;
  System_Priority: string;
  Status: string;
  Created_at: string;
  Technician_Name: string;
  Is_Lead: boolean;
  Comments_Count: number;
}

interface TechnicianProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  status: string;
  lunch_block: number | null;
  lunch_block_name: string | null;
  lunch_start_time: string | null;
  lunch_end_time: string | null;
  created_at: string;
  services: any[];
  schedules: any[];
}

const TechnicianDashboard: React.FC = () => {
  console.log('TechnicianDashboard montado');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [technicianProfile, setTechnicianProfile] = useState<TechnicianProfile | null>(null);

  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const [lunchTimeRemaining, setLunchTimeRemaining] = useState<number>(0);
  const [workTimeRemaining, setWorkTimeRemaining] = useState<number>(0);
  const [showProfile, setShowProfile] = useState(false);

  // Cargar comentarios de un ticket
  const loadTicketComments = async (ticketId: string) => {
    try {
      const response = await ApiService.getTicketComments(parseInt(ticketId));
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Enviar comentario
  const handleSendComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    try {
      const response = await ApiService.addTicketComment(parseInt(selectedTicket.id), newComment);
      if (response.success) {
        setNewComment('');
        await loadTicketComments(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  // Cerrar ticket
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const response = await ApiService.updateTicketStatus(parseInt(selectedTicket.id), 'Cerrado');
      if (response.success) {
        setShowDetailModal(false);
        setSelectedTicket(null);
        // Recargar tickets
        const ticketsResponse = await ApiService.getTechnicianTickets();
        if (ticketsResponse.success && ticketsResponse.data) {
          const formattedTickets = ticketsResponse.data.map((ticket: any) => ({
            id: ticket.ID_Service_Request.toString(),
            Code: ticket.Ticket_Code || `TICK-${ticket.ID_Service_Request}`,
            Subject: ticket.Subject || 'Sin asunto',
            Description: ticket.Description || 'Sin descripción',
            Property_Number: ticket.Property_Number || 'No especificado',
            Direction_Name: ticket.office_name || 'No asignado',
            Division_Name: ticket.office_type || 'No asignado',
            Coordination_Name: ticket.service_type_name || 'No asignado',
            System_Priority: ticket.System_Priority || 'Media',
            Status: ticket.Status || 'Pendiente',
            Created_at: ticket.Created_at || new Date().toISOString(),
            Technician_Name: ticket.technicians?.find((t: any) => t.is_lead)?.name || 'No asignado',
            Is_Lead: ticket.is_lead || false,
            Comments_Count: 0
          }));
          setMyTickets(formattedTickets);
        }
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  // Ver detalles del ticket
  const handleViewDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
    await loadTicketComments(ticket.id);
  };

  // Cargar datos del backend
  useEffect(() => {
    const loadData = async () => {
      console.log('Cargando datos del técnico desde backend...');
      if (!user) {
        console.log('No hay usuario autenticado');
        setLoading(false);
        return;
      }

      try {
        // Obtener perfil del técnico
        const profileResponse = await ApiService.getTechnicianProfile();
        console.log('Perfil del técnico:', profileResponse);

        if (profileResponse.success && profileResponse.data) {
          setTechnicianProfile(profileResponse.data);
        }

        // Cargar tickets del técnico
        const ticketsResponse = await ApiService.getTechnicianTickets();
        if (ticketsResponse.success && ticketsResponse.data) {
          const formattedTickets = ticketsResponse.data.map((ticket: any) => ({
            id: ticket.ID_Service_Request.toString(),
            Code: ticket.Ticket_Code || `TICK-${ticket.ID_Service_Request}`,
            Subject: ticket.Subject || 'Sin asunto',
            Description: ticket.Description || 'Sin descripción',
            Property_Number: ticket.Property_Number || 'No especificado',
            Direction_Name: ticket.office_name || 'No asignado',
            Division_Name: ticket.office_type || 'No asignado',
            Coordination_Name: ticket.service_type_name || 'No asignado',
            System_Priority: ticket.System_Priority || 'Media',
            Status: ticket.Status || 'Pendiente',
            Created_at: ticket.Created_at || new Date().toISOString(),
            Technician_Name: ticket.technicians?.find((t: any) => t.is_lead)?.name || 'No asignado',
            Is_Lead: ticket.is_lead || false,
            Comments_Count: 0
          }));
          setMyTickets(formattedTickets);
        }
      } catch (error) {
        console.error('Error cargando datos del técnico:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    // Simular cálculo de tiempo
    const now = new Date();
    const lunchEnd = new Date();
    lunchEnd.setHours(12, 40, 0, 0); // Fin del almuerzo a las 12:40 PM
    
    const workEnd = new Date();
    workEnd.setHours(17, 0, 0, 0); // Fin de jornada a las 5:00 PM
    
    const lunchDiff = lunchEnd.getTime() - now.getTime();
    const workDiff = workEnd.getTime() - now.getTime();
    
    setLunchTimeRemaining(Math.max(0, Math.floor(lunchDiff / 1000 / 60)));
    setWorkTimeRemaining(Math.max(0, Math.floor(workDiff / 1000 / 60)));
  }, []);

  const toggleStatus = () => {
    setTechnicianProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: prev.status === 'available' ? 'busy' : 'available'
      };
    });
  };

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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateTenure = (hireDate: string): string => {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      const remainingMonths = diffMonths - (diffYears * 12);
      return `${diffYears} año${diffYears > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}` : ''}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
    } else {
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="technician-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos del técnico...</p>
        </div>
      </div>
    );
  }

  if (!technicianProfile) {
    return (
      <div className="technician-dashboard">
        <div className="error-state">
          <p>No se encontraron datos del técnico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-dashboard">
      <main className="tech-main">
        {/* Profile Actions */}
        <div className="profile-actions-bar">
          <div className="profile-info-display">
            <User size={20} />
            <span>{technicianProfile?.first_name} {technicianProfile?.last_name}</span>
            <span className={`status-badge ${technicianProfile?.status === 'Activo' || technicianProfile?.status === 'Disponible' ? 'available' : 'busy'}`}>
              {technicianProfile?.status === 'Activo' || technicianProfile?.status === 'Disponible' ? 'Disponible' : technicianProfile?.status === 'Ocupado' ? 'Ocupado' : 'Inactivo'}
            </span>
          </div>
          <div className="action-buttons">
            <button className="action-btn profile" onClick={() => setShowProfile(true)}>
              <User size={18} />
              Mi Perfil
            </button>
            <button className="action-btn logout" onClick={async () => {
              await logout();
              navigate('/login');
            }}>
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Control de Tiempo y Jornada */}
        <div className="time-control-section">
          <div className="time-card lunch">
            <div className="time-icon">
              <Clock size={28} />
            </div>
            <div className="time-info">
              <h3 className="time-title">Bloque de Almuerzo</h3>
              <p className="time-subtitle">
                {technicianProfile?.lunch_block_name || `Bloque ${technicianProfile?.lunch_block || 'N/A'}`}
              </p>
              <div className="time-value">
                {technicianProfile?.lunch_start_time && technicianProfile?.lunch_end_time
                  ? `${technicianProfile.lunch_start_time} - ${technicianProfile.lunch_end_time}`
                  : 'No configurado'
                }
              </div>
            </div>
          </div>
          
          <div className="time-card work">
            <div className="time-icon">
              <LogOut size={28} />
            </div>
            <div className="time-info">
              <h3 className="time-title">Estado</h3>
              <p className="time-subtitle">Disponibilidad</p>
              <div className="time-value">
                {technicianProfile?.status === 'Activo' || technicianProfile?.status === 'Disponible' 
                  ? 'Disponible' 
                  : technicianProfile?.status || 'Desconocido'
                }
              </div>
            </div>
          </div>

          <div className="status-card">
            <h3 className="status-title">Servicios Asignados</h3>
            <div className="services-list">
              {technicianProfile?.services && technicianProfile.services.length > 0 ? (
                technicianProfile.services.map((service: any) => (
                  <span key={service.ID_TI_Service} className="service-tag">
                    {service.Type_Service}
                  </span>
                ))
              ) : (
                <p className="no-services">Sin servicios asignados</p>
              )}
            </div>
          </div>
        </div>

        {/* Mis Tickets Activos */}
        <section className="tickets-section">
          <div className="section-header">
            <h2 className="section-title">
              <Settings size={24} />
              Mis Tickets Activos
            </h2>
            <span className="ticket-count">{myTickets.filter(t => t.Status !== 'Cerrado').length} activos</span>
          </div>

          <div className="tickets-list">
            {myTickets.filter(t => t.Status !== 'Cerrado').map((ticket) => (
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
                      <span className="meta-label">Número de Bien:</span>
                      <span className="meta-value">{ticket.Property_Number}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Estado:</span>
                      <span className={`meta-value status-${ticket.Status.toLowerCase().replace(' ', '-')}`}>
                        {ticket.Status}
                      </span>
                    </div>
                    <div className="meta-item">
                      {ticket.Comments_Count > 0 && (
                        <span className="comments-indicator">
                          <MessageSquare size={14} />
                          {ticket.Comments_Count} comentarios
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="role-badge">
                    {ticket.Is_Lead ? (
                      <span className="role-lead">
                        <Crown size={14} />
                        Técnico Principal
                      </span>
                    ) : (
                      <span className="role-support">
                        <Users size={14} />
                        Téc. de Apoyo
                      </span>
                    )}
                  </div>
                  
                  <div className="ticket-actions">
                    <button className="action-btn secondary" onClick={() => handleViewDetails(ticket)}>
                      <MessageSquare size={18} />
                      Ver Detalles
                    </button>
                    {ticket.Status !== 'Cerrado' && (
                      <button className="action-btn primary" onClick={() => handleViewDetails(ticket)}>
                        <RefreshCw size={18} />
                        Gestionar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historial de Tickets */}
        <section className="tickets-section history-section">
          <div className="section-header">
            <h2 className="section-title">
              <History size={24} />
              Historial de Tickets
            </h2>
            <span className="ticket-count">{myTickets.filter(t => t.Status === 'Cerrado').length} cerrados</span>
          </div>

          <div className="tickets-list">
            {myTickets.filter(t => t.Status === 'Cerrado').map((ticket) => (
              <div key={ticket.id} className="ticket-card closed">
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
                      <span className="meta-label">Cerrado el:</span>
                      <span className="meta-value">{new Date(ticket.Created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Estado:</span>
                      <span className="meta-value status-cerrado">Cerrado</span>
                    </div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="role-badge">
                    {ticket.Is_Lead ? (
                      <span className="role-lead">
                        <Crown size={14} />
                        Técnico Principal
                      </span>
                    ) : (
                      <span className="role-support">
                        <Users size={14} />
                        Téc. de Apoyo
                      </span>
                    )}
                  </div>
                  
                  <div className="ticket-actions">
                    <button className="action-btn secondary" onClick={() => handleViewDetails(ticket)}>
                      <MessageSquare size={18} />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal de Perfil */}
      {showProfile && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Mi Perfil</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <TechnicianProfileComponent
                profile={{
                  id: technicianProfile!.id,
                  firstName: technicianProfile!.first_name,
                  lastName: technicianProfile!.last_name,
                  email: technicianProfile!.email,
                  status: technicianProfile!.status === 'Activo' || technicianProfile!.status === 'Disponible' ? 'Activo' : 'Inactivo',
                  hireDate: technicianProfile!.created_at,
                  lunchBlock: technicianProfile!.lunch_block_name || `Bloque ${technicianProfile!.lunch_block}`,
                  workStartTime: '08:00',
                  workEndTime: '17:00',
                  services: technicianProfile!.services.map((s: any) => s.Type_Service)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Ticket */}
      {showDetailModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalles del Ticket</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="ticket-detail-view">
                <div className="detail-section">
                  <h3>Información General</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Código:</span>
                      <span className="detail-value">{selectedTicket.Code}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Asunto:</span>
                      <span className="detail-value">{selectedTicket.Subject}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Descripción:</span>
                      <span className="detail-value">{selectedTicket.Description}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Número de Bien:</span>
                      <span className="detail-value">{selectedTicket.Property_Number}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Oficina:</span>
                      <span className="detail-value">{selectedTicket.Direction_Name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Prioridad:</span>
                      <span className={`detail-value priority-${selectedTicket.System_Priority.toLowerCase()}`}>
                        {selectedTicket.System_Priority}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Estado:</span>
                      <span className={`detail-value status-${selectedTicket.Status.toLowerCase().replace(' ', '-')}`}>
                        {selectedTicket.Status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Comentarios</h3>
                  <div className="comments-list">
                    {comments.length === 0 ? (
                      <p className="no-comments">No hay comentarios</p>
                    ) : (
                      comments.map((comment: any) => (
                        <div key={comment.ID_Comment} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-user">{comment.user_name}</span>
                            <span className="comment-date">
                              {new Date(comment.Created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="comment-text">{comment.Comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="comment-input-section">
                    <textarea
                      className="comment-input"
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button className="action-btn primary" onClick={handleSendComment}>
                      <Send size={18} />
                      Enviar Comentario
                    </button>
                  </div>
                </div>

                {selectedTicket.Status !== 'Cerrado' && (
                  <div className="detail-section">
                    <h3>Acciones</h3>
                    <button className="action-btn danger" onClick={handleCloseTicket}>
                      <CheckCircle size={18} />
                      Cerrar Ticket
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
