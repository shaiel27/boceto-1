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
  History,
  BarChart3,
  AlertTriangle
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
  Resolved_at?: string;
  Resolution_Time?: number;
  Office_Name?: string;
  Type_Service?: string;
  Priority_Level?: number;
}

interface TicketHistory {
  total_tickets: number;
  resolved_this_month: number;
  avg_resolution_time: number;
  success_rate: number;
  priority_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  monthly_trend: Array<{
    month: string;
    resolved: number;
    created: number;
  }>;
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
  
  // PHP-PRO: Enhanced ticket history state
  const [ticketHistory, setTicketHistory] = useState<TicketHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'week' | 'month' | 'year'>('month');

  const [lunchTimeRemaining, setLunchTimeRemaining] = useState<number>(0);
  const [workTimeRemaining, setWorkTimeRemaining] = useState<number>(0);
  const [showProfile, setShowProfile] = useState(false);

  // PHP-PRO: Load ticket history with enhanced analytics
  const loadTicketHistory = async () => {
    try {
      setHistoryLoading(true);
      console.log('🔍 Cargando historial de tickets desde backend PHP-PRO...');
      console.log('📊 Current tickets count:', myTickets.length);
      
      // First, try to calculate from current tickets (fallback)
      if (myTickets.length > 0) {
        console.log('📋 Using current tickets for calculation');
        const calculatedHistory = calculateTicketHistory(myTickets);
        console.log('📊 Calculated history:', calculatedHistory);
        setTicketHistory(calculatedHistory);
      } else {
        console.log('⚠️ No tickets available, setting empty history');
        setTicketHistory({
          total_tickets: 0,
          resolved_this_month: 0,
          avg_resolution_time: 0,
          success_rate: 0,
          priority_breakdown: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          },
          monthly_trend: []
        });
      }
      
      // Try backend API (optional)
      try {
        const response = await fetch('http://localhost:8000/api-technician-history.php?action=ticket-history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Backend history received:', data);
          
          if (data.success && data.data) {
            setTicketHistory(data.data);
          }
        }
      } catch (apiError) {
        console.log('📡 Backend API not available, using fallback calculation');
      }
      
    } catch (error) {
      console.error('❌ Error cargando historial de tickets:', error);
      // Fallback to calculated history
      const calculatedHistory = calculateTicketHistory(myTickets);
      setTicketHistory(calculatedHistory);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // PHP-PRO: Calculate ticket history from current tickets (fallback)
  const calculateTicketHistory = (tickets: Ticket[]): TicketHistory => {
    console.log('📊 Calculating history from tickets:', tickets.length);
    console.log('📋 Sample ticket:', tickets[0]);
    
    const resolvedTickets = tickets.filter(t => t.Status === 'Cerrado');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    console.log('📈 Resolved tickets:', resolvedTickets.length);
    console.log('📅 Current month/year:', currentMonth + 1, currentYear);
    
    const resolvedThisMonth = resolvedTickets.filter(t => {
      const resolvedDate = new Date(t.Resolved_at || t.Created_at);
      const isCurrentMonth = resolvedDate.getMonth() === currentMonth && resolvedDate.getFullYear() === currentYear;
      console.log('🔍 Ticket resolved date:', resolvedDate, 'Is current month:', isCurrentMonth);
      return isCurrentMonth;
    }).length;
    
    const avgResolutionTime = resolvedTickets.reduce((acc, t) => {
      const resolutionTime = t.Resolution_Time || 0;
      console.log('⏱️ Ticket resolution time:', resolutionTime);
      return acc + resolutionTime;
    }, 0) / (resolvedTickets.length || 1);
    
    const priorityBreakdown = {
      critical: tickets.filter(t => t.System_Priority === 'Crítica').length,
      high: tickets.filter(t => t.System_Priority === 'Alta').length,
      medium: tickets.filter(t => t.System_Priority === 'Media').length,
      low: tickets.filter(t => t.System_Priority === 'Baja').length
    };
    
    console.log('🎯 Priority breakdown:', priorityBreakdown);
    
    const monthlyTrend = generateMonthlyTrend(tickets);
    
    const history = {
      total_tickets: tickets.length,
      resolved_this_month: resolvedThisMonth,
      avg_resolution_time: Math.round(avgResolutionTime),
      success_rate: Math.round((resolvedTickets.length / (tickets.length || 1)) * 100),
      priority_breakdown: priorityBreakdown,
      monthly_trend: monthlyTrend
    };
    
    console.log('📊 Final calculated history:', history);
    return history;
  };
  
  // Generate monthly trend data
  const generateMonthlyTrend = (tickets: Ticket[]) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthTickets = tickets.filter(t => {
        const ticketDate = new Date(t.Created_at);
        return ticketDate.getMonth() === index && ticketDate.getFullYear() === currentYear;
      });
      
      const monthResolved = monthTickets.filter(t => t.Status === 'Cerrado').length;
      
      return {
        month,
        resolved: monthResolved,
        created: monthTickets.length
      };
    });
  };
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

        // Cargar tickets del técnico con PHP-PRO integration
        const ticketsResponse = await ApiService.getTechnicianTickets();
        if (ticketsResponse.success && ticketsResponse.data) {
          const formattedTickets = ticketsResponse.data.map((ticket: any) => {
            // PHP-PRO: Enhanced field mapping with proper backend structure
            const createdDate = new Date(ticket.Created_at || new Date().toISOString());
            const resolvedDate = ticket.Resolved_at ? new Date(ticket.Resolved_at) : null;
            const resolutionTime = resolvedDate ? Math.floor((resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60)) : null;
            
            return {
              id: ticket.ID_Service_Request.toString(),
              Code: ticket.Ticket_Code || `TICK-${ticket.ID_Service_Request}`,
              Subject: ticket.Subject || 'Sin asunto',
              Description: ticket.Description || 'Sin descripción',
              Property_Number: ticket.Property_Number || 'No especificado',
              Direction_Name: ticket.Office_Name || ticket.office_name || 'No asignado',
              Division_Name: ticket.Office_Type || ticket.office_type || 'No asignado',
              Coordination_Name: ticket.Type_Service || ticket.service_type_name || 'No asignado',
              System_Priority: ticket.System_Priority || 'Media',
              Status: ticket.Status || 'Pendiente',
              Created_at: ticket.Created_at || new Date().toISOString(),
              Technician_Name: ticket.technicians?.find((t: any) => t.is_lead)?.name || 'No asignado',
              Is_Lead: ticket.is_lead || false,
              Comments_Count: ticket.Comments_Count || 0,
              Resolved_at: ticket.Resolved_at || null,
              Resolution_Time: resolutionTime,
              Office_Name: ticket.Office_Name || ticket.office_name || 'No asignado',
              Type_Service: ticket.Type_Service || ticket.service_type_name || 'No asignado',
              Priority_Level: ticket.Priority_Level || 1
            };
          });
          setMyTickets(formattedTickets);
          
          // PHP-PRO: Load ticket history after tickets are loaded
          await loadTicketHistory();
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

        {/* PHP-PRO: Exclusive Ticket History Section */}
        <section className="tickets-section history-section">
          <div className="section-header">
            <h2 className="section-title">
              <History size={24} />
              Mi Historial de Tickets
            </h2>
            <div className="history-actions">
              <button 
                className="history-btn primary"
                onClick={() => setShowHistoryModal(true)}
                disabled={historyLoading}
              >
                <BarChart3 size={18} />
                {historyLoading ? 'Cargando...' : 'Ver Estadísticas'}
              </button>
              <span className="ticket-count">
                {myTickets.filter(t => t.Status === 'Cerrado').length} resueltos
              </span>
            </div>
          </div>

          {/* History Summary Cards */}
          {ticketHistory && (
            <div className="history-summary-grid">
              <div className="history-card total">
                <div className="history-icon">
                  <Settings size={28} />
                </div>
                <div className="history-info">
                  <h3 className="history-title">Total Tickets</h3>
                  <p className="history-value">{ticketHistory.total_tickets}</p>
                  <p className="history-subtitle">En todo el periodo</p>
                </div>
              </div>
              
              <div className="history-card resolved">
                <div className="history-icon">
                  <CheckCircle size={28} />
                </div>
                <div className="history-info">
                  <h3 className="history-title">Resueltos este Mes</h3>
                  <p className="history-value">{ticketHistory.resolved_this_month}</p>
                  <p className="history-subtitle">Eficiencia: {ticketHistory.success_rate}%</p>
                </div>
              </div>
              
              <div className="history-card time">
                <div className="history-icon">
                  <Clock size={28} />
                </div>
                <div className="history-info">
                  <h3 className="history-title">Tiempo Promedio</h3>
                  <p className="history-value">{ticketHistory.avg_resolution_time}h</p>
                  <p className="history-subtitle">Resolución</p>
                </div>
              </div>
              
              <div className="history-card priority">
                <div className="history-icon">
                  <AlertTriangle size={28} />
                </div>
                <div className="history-info">
                  <h3 className="history-title">Prioridad Crítica</h3>
                  <p className="history-value">{ticketHistory.priority_breakdown.critical}</p>
                  <p className="history-subtitle">Tickets urgentes</p>
                </div>
              </div>
            </div>
          )}

          <div className="tickets-list">
            {myTickets.filter(t => t.Status === 'Cerrado').slice(0, 5).map((ticket) => (
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
                      <span className="meta-label">Resuelto el:</span>
                      <span className="meta-value">
                        {ticket.Resolved_at 
                          ? new Date(ticket.Resolved_at).toLocaleDateString('es-VE')
                          : new Date(ticket.Created_at).toLocaleDateString('es-VE')
                        }
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Tiempo de resolución:</span>
                      <span className="meta-value">
                        {ticket.Resolution_Time ? `${ticket.Resolution_Time} horas` : 'N/A'}
                      </span>
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
                  {selectedTicket.Status === 'Cerrado' ? (
                    <div className="comments-disabled">
                      <div className="disabled-message">
                        <AlertCircle size={20} />
                        <span>Este ticket está cerrado y no permite nuevos comentarios</span>
                      </div>
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
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
