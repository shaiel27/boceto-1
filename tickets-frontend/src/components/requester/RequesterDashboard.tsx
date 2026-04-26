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
  X
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import '../layout/ModernSidebar.css';
import './RequesterDashboard.css';
import RequesterProfile from './RequesterProfile';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
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

      console.log('Loading dashboard data...');
      const userResponse = await ApiService.getMe();
      console.log('getMe response:', userResponse);
      
      if (userResponse.success && userResponse.data) {
        const userId = userResponse.data.id;
        console.log('User ID:', userId);
        
        try {
          const profileResponse = await ApiService.getUserProfile(userId);
          console.log('getUserProfile response:', profileResponse);
          
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data;
            console.log('Profile data:', profileData);
            
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
            console.error('Profile response not successful:', profileResponse);
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
        console.error('User authentication failed:', userResponse);
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

  const activeTickets = myTickets.filter(t => t.Status !== 'Resuelto');
  const resolvedTickets = myTickets.filter(t => t.Status === 'Resuelto');

  const handleAddComment = async (ticketId: string) => {
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
          setCommentInputs(prev => ({ ...prev, [ticketId]: '' }));
          setShowCommentSection(prev => ({ ...prev, [ticketId]: false }));
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const toggleCommentSection = (ticketId: string) => {
    setShowCommentSection(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

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
                  
                  <button className="view-details-btn">
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
    </div>
  );
};

export default RequesterDashboard;
