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
  TrendingUp,
  Building,
  Mail,
  Briefcase,
  Award,
  CalendarDays,
  MapPinned,
  UserCheck,
  Send,
  X,
  ArrowLeft
} from 'lucide-react';
import './RequesterDashboard.css';
import RequesterProfile from './RequesterProfile';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PasswordChangeRequired from '../common/PasswordChangeRequired';

interface Ticket {
  id: string;
  Code: string;
  Subject: string;
  Description: string;
  office_name: string;
  office_type: string;
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
  position: string;
  hireDate: string;
  office_name: string;
  office_type: string;
  supervisor: string;
}

const RequesterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstLogin, setFirstLogin] = useState(false);
  const [requesterProfile, setRequesterProfile] = useState<RequesterProfile>({
    id: '',
    name: '',
    email: '',
    position: '',
    hireDate: '',
    office_name: '',
    office_type: '',
    supervisor: ''
  });

  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showCommentSection, setShowCommentSection] = useState<Record<string, boolean>>({});
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [ticketComments, setTicketComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const userResponse = await ApiService.getMe();
      
      if (userResponse.success && userResponse.data) {
        const userId = userResponse.data.id;

        // Detectar primer inicio de sesión
        if (!userResponse.data.last_login_at) {
          setFirstLogin(true);
          setLoading(false);
          return;
        }
        
        try {
          const profileResponse = await ApiService.getUserProfile(userId);
          
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data;
            
            setRequesterProfile({
              id: userId.toString(),
              name: profileData.Full_Name || userResponse.data.full_name || 'Usuario',
              email: profileData.Email || userResponse.data.email || '',
              position: profileData.role_name || userResponse.data.role_name || 'Solicitante',
              hireDate: new Date().toISOString().split('T')[0],
              office_name: profileData.office_name || '',
              office_type: profileData.office_type || '',
              supervisor: profileData.supervisor || 'No asignado'
            });
          } else {
            console.error('Profile response not successful');
            // Use basic user data as fallback
            setRequesterProfile({
              id: userId.toString(),
              name: userResponse.data.full_name || 'Usuario',
              email: userResponse.data.email || '',
              position: userResponse.data.role_name || 'Solicitante',
              hireDate: new Date().toISOString().split('T')[0],
              office_name: '',
              office_type: '',
              supervisor: 'No asignado'
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // Use basic user data as fallback
          setRequesterProfile({
            id: userId.toString(),
            name: userResponse.data.full_name || 'Usuario',
            email: userResponse.data.email || '',
            position: userResponse.data.role_name || 'Solicitante',
            hireDate: new Date().toISOString().split('T')[0],
            office_name: '',
            office_type: '',
            supervisor: 'No asignado'
          });
        }

        try {
          const ticketsResponse = await ApiService.getMyTickets(userId);
          if (ticketsResponse.success && ticketsResponse.data && ticketsResponse.data.length > 0) {
            const formattedTickets = ticketsResponse.data.map((ticket: any) => ({
              id: ticket.ID_Service_Request.toString(),
              Code: ticket.Ticket_Code || `TICK-${ticket.ID_Service_Request}`,
              Subject: ticket.Subject || 'Sin asunto',
              Description: ticket.Description || 'Sin descripción',
              office_name: ticket.office_name || 'No asignado',
              office_type: ticket.office_type || 'No asignado',
              System_Priority: ticket.System_Priority || 'Media',
              Status: ticket.Status || 'Pendiente',
              Created_at: ticket.Created_at || new Date().toISOString(),
              Resolved_at: ticket.Resolved_at,
              Solution: ticket.Resolution_Notes,
              Technicians: ticket.technicians?.map((tech: any) => ({
                Name: tech.name,
                Is_Lead: tech.is_lead
              })) || [],
              Comments_Count: 0
            }));
            setMyTickets(formattedTickets);
          } else {
            setMyTickets([]);
          }
        } catch (error) {
          console.error('Error loading tickets:', error);
          setMyTickets([]);
        }
      } else {
        console.error('User authentication failed');
        setRequesterProfile({
          id: '',
          name: '',
          email: '',
          position: '',
          hireDate: '',
          office_name: '',
          office_type: '',
          supervisor: ''
        });
        setMyTickets([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setRequesterProfile({
        id: '',
        name: '',
        email: '',
        position: '',
        hireDate: '',
        office_name: '',
        office_type: '',
        supervisor: ''
      });
      setMyTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica':
        return 'critic';
      case 'Alta':
        return 'high';
      case 'Media':
        return 'medium';
      case 'Baja':
        return 'low';
      default:
        return '';
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 1;
      case 'En Proceso':
        return 2;
      case 'Cerrado':
        return 3;
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

  const calculateYearsOfService = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < hire.getDate())) {
      return years - 1;
    }
    return years;
  };

  const activeTickets = myTickets.filter(t => t.Status !== 'Cerrado');
  const resolvedTickets = myTickets.filter(t => t.Status === 'Cerrado');

  const handleAddComment = async (ticketId: string) => {
    await handleAddCommentToTicket(ticketId);
  };

  const toggleCommentSection = (ticketId: string) => {
    setShowCommentSection(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  const handleViewTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
    setLoadingComments(true);
    try {
      const commentsResponse = await ApiService.getTicketComments(parseInt(ticket.id));
      if (commentsResponse.success && commentsResponse.data) {
        setTicketComments(commentsResponse.data);
      } else {
        setTicketComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setTicketComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddCommentToTicket = async (ticketId: string) => {
    const comment = commentInputs[ticketId];
    if (comment && comment.trim()) {
      try {
        const response = await ApiService.addTicketComment(parseInt(ticketId), comment);
        if (response.success) {
          const updatedTickets = myTickets.map(ticket => {
            if (ticket.id === ticketId) {
              return {
                ...ticket,
                Comments_Count: ticket.Comments_Count + 1
              };
            }
            return ticket;
          });
          setMyTickets(updatedTickets);
          
          if (selectedTicket && selectedTicket.id === ticketId) {
            setTicketComments(prev => [...prev, {
              ID_Comment: Date.now(),
              Comment: comment,
              Created_at: new Date().toISOString(),
              User_Name: requesterProfile.name,
              User_Role: requesterProfile.position
            }]);
          }
          
          setCommentInputs(prev => ({ ...prev, [ticketId]: '' }));
          setShowCommentSection(prev => ({ ...prev, [ticketId]: false }));
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  if (firstLogin) {
    return <PasswordChangeRequired onComplete={() => setFirstLogin(false)} />;
  }

  return (
    <div className="requester-dashboard">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos...</p>
        </div>
      ) : (
      <main className="req-main">
        {/* Profile Actions */}
        <div className="profile-actions-bar">
          <div className="profile-info-display">
            <User size={20} />
            <span>{requesterProfile.name}</span>
            {requesterProfile.office_type && <span className="dept-badge">{requesterProfile.office_type}</span>}
          </div>
          <div className="action-buttons">
            <button className="action-btn dashboard-back" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={18} />
              Dashboard
            </button>
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

        {/* Profile Information Card - Minimalist */}
        <section className="profile-info-section">
          <div className="profile-card-minimal">
            <div className="profile-content">
              <div className="profile-avatar">
                <User size={32} />
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{requesterProfile.name}</h2>
                <p className="profile-position">{requesterProfile.position}</p>
                <div className="profile-details">
                  {requesterProfile.office_name && (
                    <span className="profile-detail">
                      <Building size={14} />
                      {requesterProfile.office_type} - {requesterProfile.office_name}
                    </span>
                  )}
                  <span className="profile-detail">
                    <Mail size={14} />
                    {requesterProfile.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                    <div className="step-label">En Proceso</div>
                  </div>
                  <div className={`timeline-connector ${getStatusStep(ticket.Status) >= 2 ? 'completed' : ''}`}></div>

                  <div className={`timeline-step ${getStatusStep(ticket.Status) >= 3 ? 'completed' : 'pending'}`}>
                    <div className="step-indicator">
                      {getStatusStep(ticket.Status) >= 3 ? <CheckCircle size={16} /> : <div className="step-dot"></div>}
                    </div>
                    <div className="step-label">Cerrado</div>
                  </div>
                </div>

                <div className="ticket-body">
                  <h3 className="ticket-subject">{ticket.Subject}</h3>
                  <p className="ticket-description">{ticket.Description}</p>
                  
                  {ticket.office_name && (
                    <div className="ticket-location">
                      <MapPin size={16} />
                      <div className="location-hierarchy">
                        <span className="location-item">{ticket.office_type} - {ticket.office_name}</span>
                      </div>
                    </div>
                  )}

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
                  
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewTicketDetails(ticket)}
                  >
                    Ver Detalles
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Sección de Comentarios - Solo para tickets en proceso */}
                {ticket.Status === 'En Proceso' && (
                  <div className="ticket-comments-section">
                    <div className="comments-header">
                      <h4 className="comments-title">
                        <MessageSquare size={16} />
                        Comentarios ({ticket.Comments_Count})
                      </h4>
                      {!showCommentSection[ticket.id] && (
                        <button 
                          className="add-comment-btn"
                          onClick={() => toggleCommentSection(ticket.id)}
                        >
                          <MessageSquare size={14} />
                          Agregar Comentario
                        </button>
                      )}
                    </div>
                    
                    {showCommentSection[ticket.id] && (
                      <div className="comment-input-container">
                        <textarea
                          className="comment-textarea"
                          placeholder="Escribe tu comentario aquí..."
                          value={commentInputs[ticket.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          rows={3}
                        />
                        <div className="comment-actions">
                          <button 
                            className="cancel-comment-btn"
                            onClick={() => toggleCommentSection(ticket.id)}
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                          <button 
                            className="send-comment-btn"
                            onClick={() => handleAddComment(ticket.id)}
                            disabled={!commentInputs[ticket.id]?.trim()}
                          >
                            <Send size={14} />
                            Enviar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
      )}

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
              <RequesterProfile 
                profile={requesterProfile}
                onUpdate={(updatedProfile) => setRequesterProfile(updatedProfile)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Ticket - PHP-PRO Backend Integrated */}
      {showTicketDetails && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowTicketDetails(false)}>
          <div className="ticket-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-details-header">
              <div className="ticket-details-title">
                <FileText size={24} />
                <div>
                  <h2>{selectedTicket.Code}</h2>
                  <p className="ticket-subject-text">{selectedTicket.Subject}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowTicketDetails(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="ticket-details-body">
              {/* Ticket Info Grid */}
              <div className="ticket-info-grid">
                <div className="ticket-info-item">
                  <span className="ticket-info-label">Estado</span>
                  <span className={`ticket-status-badge status-${selectedTicket.Status.toLowerCase().replace(' ', '-')}`}>
                    {selectedTicket.Status}
                  </span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-info-label">Prioridad</span>
                  <span className={`priority-badge ${getPriorityColor(selectedTicket.System_Priority)}`}>
                    {selectedTicket.System_Priority}
                  </span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-info-label">Oficina</span>
                  <span className="ticket-info-value">{selectedTicket.office_type} - {selectedTicket.office_name}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-info-label">Creado</span>
                  <span className="ticket-info-value">{formatDate(selectedTicket.Created_at)}</span>
                </div>
              </div>

              {/* Description */}
              <div className="ticket-detail-section">
                <h4 className="section-label">Descripción</h4>
                <p className="ticket-description-text">{selectedTicket.Description}</p>
              </div>

              {/* Timeline */}
              <div className="ticket-detail-section">
                <h4 className="section-label">Estado del Ticket</h4>
                <div className="ticket-timeline-modal">
                  <div className="timeline-step completed">
                    <div className="step-indicator">
                      <CheckCircle size={16} />
                    </div>
                    <div className="step-label">Pendiente</div>
                  </div>
                  <div className={`timeline-connector ${getStatusStep(selectedTicket.Status) >= 2 ? 'completed' : ''}`}></div>
                  <div className={`timeline-step ${getStatusStep(selectedTicket.Status) >= 2 ? 'completed' : 'pending'}`}>
                    <div className="step-indicator">
                      {getStatusStep(selectedTicket.Status) >= 2 ? <Users size={16} /> : <div className="step-dot"></div>}
                    </div>
                    <div className="step-label">En Proceso</div>
                  </div>
                  <div className={`timeline-connector ${getStatusStep(selectedTicket.Status) >= 3 ? 'completed' : ''}`}></div>
                  <div className={`timeline-step ${getStatusStep(selectedTicket.Status) >= 3 ? 'completed' : 'pending'}`}>
                    <div className="step-indicator">
                      {getStatusStep(selectedTicket.Status) >= 3 ? <CheckCircle size={16} /> : <div className="step-dot"></div>}
                    </div>
                    <div className="step-label">Cerrado</div>
                  </div>
                </div>
              </div>

              {/* Technicians */}
              {selectedTicket.Technicians.length > 0 && (
                <div className="ticket-detail-section">
                  <h4 className="section-label">Equipo Técnico Asignado</h4>
                  <div className="technicians-list-modal">
                    {selectedTicket.Technicians.map((tech, index) => (
                      <div key={index} className="tech-item-modal">
                        <div className="tech-avatar">
                          <Users size={16} />
                        </div>
                        <span className="tech-name-modal">{tech.Name}</span>
                        {tech.Is_Lead && <span className="lead-badge-modal">Principal</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="ticket-detail-section comments-section-modal">
                <div className="comments-header-modal">
                  <h4 className="section-label">
                    <MessageSquare size={18} />
                    Comentarios ({ticketComments.length})
                  </h4>
                </div>

                {loadingComments ? (
                  <div className="loading-comments">
                    <div className="loading-spinner small"></div>
                    <span>Cargando comentarios...</span>
                  </div>
                ) : ticketComments.length > 0 ? (
                  <div className="comments-list-modal">
                    {ticketComments.map((comment, index) => (
                      <div key={comment.ID_Comment || index} className="comment-item-modal">
                        <div className="comment-avatar">
                          <User size={14} />
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">{comment.User_Name}</span>
                            <span className="comment-role">{comment.User_Role}</span>
                            <span className="comment-date">{formatDate(comment.Created_at)}</span>
                          </div>
                          <p className="comment-text">{comment.Comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-comments">
                    <MessageSquare size={24} />
                    <span>No hay comentarios aún</span>
                  </div>
                )}

                {/* Add Comment Form */}
                {selectedTicket.Status === 'En Proceso' && (
                  <div className="add-comment-modal">
                    <textarea
                      className="comment-textarea-modal"
                      placeholder="Escribe un comentario..."
                      value={commentInputs[selectedTicket.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [selectedTicket.id]: e.target.value }))}
                      rows={3}
                    />
                    <button 
                      className="send-comment-btn-modal"
                      onClick={() => handleAddCommentToTicket(selectedTicket.id)}
                      disabled={!commentInputs[selectedTicket.id]?.trim()}
                    >
                      <Send size={16} />
                      Enviar
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

export default RequesterDashboard;
