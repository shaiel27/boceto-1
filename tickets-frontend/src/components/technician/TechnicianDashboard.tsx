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
import AssistanceRequestModal from '../assistance/AssistanceRequestModal';
import ApiService, { API_BASE_URL } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// PHP-PRO: Strict typing with readonly properties and proper interfaces
interface Ticket {
  readonly id: string;
  readonly Code: string;
  readonly Subject: string;
  readonly Description: string;
  readonly Property_Number: string;
  readonly Direction_Name: string;
  readonly Division_Name: string;
  readonly Coordination_Name: string;
  readonly System_Priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  readonly Status: 'Pendiente' | 'En Progreso' | 'Cerrado';
  readonly Created_at: string;
  readonly Technician_Name: string;
  readonly Is_Lead: boolean;
  readonly Comments_Count: number;
  readonly Resolved_at: string | null;
  readonly Resolution_Time: number | null;
  readonly Office_Name: string;
  readonly Type_Service: string;
  readonly Priority_Level: number;
}

// PHP-PRO: Enhanced history interface with comprehensive analytics
interface TicketHistory {
  readonly total_tickets: number;
  readonly resolved_this_month: number;
  readonly avg_resolution_time: number;
  readonly success_rate: number;
  readonly priority_breakdown: {
    readonly critical: number;
    readonly high: number;
    readonly medium: number;
    readonly low: number;
  };
  readonly monthly_trend: readonly {
    readonly month: string;
    readonly resolved: number;
    readonly created: number;
  }[];
  readonly performance_metrics: {
    readonly fastest_resolution: number;
    readonly slowest_resolution: number;
    readonly tickets_by_service: readonly {
      readonly service: string;
      readonly count: number;
      readonly avg_time: number;
    }[];
    readonly weekly_performance: readonly {
      readonly week: string;
      readonly resolved: number;
      readonly avg_time: number;
    }[];
  };
}

interface TechnicianProfile {
  readonly id: string;
  readonly user_id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly username: string;
  readonly status: string;
  readonly lunch_block: number | null;
  readonly lunch_block_name: string | null;
  readonly lunch_start_time: string | null;
  readonly lunch_end_time: string | null;
  readonly created_at: string;
  readonly services: readonly {
    readonly ID_TI_Service: number;
    readonly Type_Service: string;
  }[];
  readonly schedules: readonly unknown[];
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
  
  // Assistance request state
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [selectedTicketForAssistance, setSelectedTicketForAssistance] = useState<Ticket | null>(null);

  // PHP-PRO: Pagination state (5 tickets per page)
  const [activeTicketsPage, setActiveTicketsPage] = useState(1);
  const [closedTicketsPage, setClosedTicketsPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // PHP-PRO: Filter state
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
          monthly_trend: [],
          performance_metrics: {
            fastest_resolution: 0,
            slowest_resolution: 0,
            tickets_by_service: [],
            weekly_performance: []
          }
        });
      }
      
      // Try backend API (optional)
      try {
        const response = await fetch(`${API_BASE_URL}/api-technician-history.php?action=ticket-history`, {
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
  
  // PHP-PRO: Enhanced ticket history calculation with comprehensive analytics
  const calculateTicketHistory = (tickets: readonly Ticket[]): TicketHistory => {
    const resolvedTickets = tickets.filter((t): t is Ticket & { Resolved_at: string; Resolution_Time: number } => 
      t.Status === 'Cerrado' && t.Resolved_at !== null && t.Resolution_Time !== null
    );
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const resolvedThisMonth = resolvedTickets.filter(t => {
      const resolvedDate = new Date(t.Resolved_at);
      return resolvedDate.getMonth() === currentMonth && resolvedDate.getFullYear() === currentYear;
    }).length;
    
    const resolutionTimes = resolvedTickets.map(t => t.Resolution_Time).filter((time): time is number => time !== null);
    const avgResolutionTime = resolutionTimes.length > 0 
      ? Math.round(resolutionTimes.reduce((acc, time) => acc + time, 0) / resolutionTimes.length)
      : 0;
    
    const priorityBreakdown = {
      critical: tickets.filter(t => t.System_Priority === 'Crítica').length,
      high: tickets.filter(t => t.System_Priority === 'Alta').length,
      medium: tickets.filter(t => t.System_Priority === 'Media').length,
      low: tickets.filter(t => t.System_Priority === 'Baja').length
    };
    
    // PHP-PRO: Enhanced performance metrics
    const fastestResolution = resolutionTimes.length > 0 ? Math.min(...resolutionTimes) : 0;
    const slowestResolution = resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : 0;
    
    // Group by service type
    const serviceGroups = new Map<string, { count: number; totalTime: number }>();
    resolvedTickets.forEach(ticket => {
      const service = ticket.Type_Service;
      const current = serviceGroups.get(service) || { count: 0, totalTime: 0 };
      serviceGroups.set(service, {
        count: current.count + 1,
        totalTime: current.totalTime + (ticket.Resolution_Time || 0)
      });
    });
    
    const ticketsByService = Array.from(serviceGroups.entries()).map(([service, data]) => ({
      service,
      count: data.count,
      avg_time: Math.round(data.totalTime / data.count)
    })).sort((a, b) => b.count - a.count);
    
    // Weekly performance calculation
    const weeklyPerformance = calculateWeeklyPerformance(resolvedTickets);
    
    return {
      total_tickets: tickets.length,
      resolved_this_month: resolvedThisMonth,
      avg_resolution_time: avgResolutionTime,
      success_rate: Math.round((resolvedTickets.length / (tickets.length || 1)) * 100),
      priority_breakdown: priorityBreakdown,
      monthly_trend: generateMonthlyTrend(tickets),
      performance_metrics: {
        fastest_resolution: fastestResolution,
        slowest_resolution: slowestResolution,
        tickets_by_service: ticketsByService,
        weekly_performance: weeklyPerformance
      }
    };
  };
  
  // PHP-PRO: Calculate weekly performance metrics
  const calculateWeeklyPerformance = (tickets: readonly Ticket[]): readonly {
    readonly week: string;
    readonly resolved: number;
    readonly avg_time: number;
  }[] => {
    const weeks = new Map<string, { count: number; totalTime: number }>();
    
    tickets.forEach(ticket => {
      if (!ticket.Resolved_at) return;
      
      const date = new Date(ticket.Resolved_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString('es-VE', { month: 'short', day: 'numeric' });
      
      const current = weeks.get(weekKey) || { count: 0, totalTime: 0 };
      weeks.set(weekKey, {
        count: current.count + 1,
        totalTime: current.totalTime + (ticket.Resolution_Time || 0)
      });
    });
    
    return Array.from(weeks.entries())
      .map(([week, data]) => ({
        week,
        resolved: data.count,
        avg_time: Math.round(data.totalTime / data.count)
      }))
      .slice(-4); // Last 4 weeks
  };
  
  // Generate monthly trend data
  const generateMonthlyTrend = (tickets: readonly Ticket[]) => {
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

  const handleAssistanceRequest = (ticket: Ticket) => {
    setSelectedTicketForAssistance(ticket);
    setShowAssistanceModal(true);
  };

  const handleAssistanceSuccess = (requestId: string) => {
    console.log('Assistance request created:', requestId);
    // Optionally refresh tickets or show success message
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'available';
      case 'Ocupado':
        return 'busy';
      case 'Inactivo':
        return 'inactive';
      default:
        return 'inactive';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'Disponible';
      case 'Ocupado':
        return 'Ocupado';
      case 'Inactivo':
        return 'Fuera de horario';
      default:
        return status;
    }
  };

  const getStatusReason = (): string => {
    const status = technicianProfile?.status;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const lunchStart = technicianProfile?.lunch_start_time ? 
      parseInt(technicianProfile.lunch_start_time.split(':')[0]) * 60 + parseInt(technicianProfile.lunch_start_time.split(':')[1]) : 0;
    const lunchEnd = technicianProfile?.lunch_end_time ? 
      parseInt(technicianProfile.lunch_end_time.split(':')[0]) * 60 + parseInt(technicianProfile.lunch_end_time.split(':')[1]) : 0;

    if (status === 'Inactivo') {
      return 'Fuera de horario laboral';
    } else if (status === 'Ocupado' && currentTimeMinutes >= lunchStart && currentTimeMinutes <= lunchEnd) {
      return 'En bloque de almuerzo';
    } else if (status === 'Ocupado') {
      return 'Atendiendo ticket(s) activo(s)';
    }
    return 'Disponible para atender';
  };

  // PHP-PRO: Filter and pagination logic
  const filteredActiveTickets = myTickets.filter(ticket => {
    const matchesPriority = priorityFilter === 'all' || ticket.System_Priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.Status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      ticket.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch && ticket.Status !== 'Cerrado';
  });

  const filteredClosedTickets = myTickets.filter(ticket => ticket.Status === 'Cerrado');

  const paginatedActiveTickets = filteredActiveTickets.slice(
    (activeTicketsPage - 1) * ITEMS_PER_PAGE,
    activeTicketsPage * ITEMS_PER_PAGE
  );

  const paginatedClosedTickets = filteredClosedTickets.slice(
    (closedTicketsPage - 1) * ITEMS_PER_PAGE,
    closedTicketsPage * ITEMS_PER_PAGE
  );

  const totalActivePages = Math.ceil(filteredActiveTickets.length / ITEMS_PER_PAGE);
  const totalClosedPages = Math.ceil(filteredClosedTickets.length / ITEMS_PER_PAGE);

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

        {/* Control de Tiempo y Jornada - Estado Automático */}
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
          
          <div className="time-card work status-auto">
            <div className="time-icon">
              <Settings size={28} />
            </div>
            <div className="time-info">
              <h3 className="time-title">Estado del Sistema</h3>
              <p className="time-subtitle">Calculado automáticamente</p>
              <div className="time-value auto-status">
                <span className={`status-badge ${getStatusColor(technicianProfile?.status || '')}`}>
                  {getStatusLabel(technicianProfile?.status || '')}
                </span>
              </div>
              <p className="status-reason">{getStatusReason()}</p>
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
            <span className="ticket-count">{filteredActiveTickets.length} activos</span>
          </div>

          {/* PHP-PRO: Filters */}
          <div className="tickets-filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Buscar por código o asunto..."
                className="filter-input search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveTicketsPage(1);
                }}
              />
            </div>
            <div className="filter-group">
              <select
                className="filter-select"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setActiveTicketsPage(1);
                }}
              >
                <option value="all">Todas las prioridades</option>
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setActiveTicketsPage(1);
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
              </select>
            </div>
          </div>

          <div className="tickets-list">
            {paginatedActiveTickets.length === 0 ? (
              <div className="empty-state">
                <Settings size={48} />
                <p>No hay tickets activos que coincidan con los filtros</p>
              </div>
            ) : (
              paginatedActiveTickets.map((ticket) => (
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
                      <>
                        <button 
                          className="action-btn assistance" 
                          onClick={() => handleAssistanceRequest(ticket)}
                          title="Solicitar asistencia técnica"
                        >
                          <AlertTriangle size={18} />
                          Solicitar Asistencia
                        </button>
                        <button className="action-btn primary" onClick={() => handleViewDetails(ticket)}>
                          <RefreshCw size={18} />
                          Gestionar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
            )}
          </div>

          {/* PHP-PRO: Pagination */}
          {totalActivePages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setActiveTicketsPage(p => Math.max(1, p - 1))}
                disabled={activeTicketsPage === 1}
              >
                <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
                Anterior
              </button>
              <span className="pagination-info">
                Página {activeTicketsPage} de {totalActivePages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setActiveTicketsPage(p => Math.min(totalActivePages, p + 1))}
                disabled={activeTicketsPage === totalActivePages}
              >
                Siguiente
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          )}
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
                {filteredClosedTickets.length} resueltos
              </span>
            </div>
          </div>

          {/* PHP-PRO: History Summary Cards with system colors */}
          {ticketHistory && (
            <div className="history-summary-grid">
              <div className="history-card total">
                <div className="history-icon" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
                  <Settings size={28} />
                </div>
                <div className="history-info">
                  <h3 className="history-title">Total Tickets</h3>
                  <p className="history-value">{ticketHistory.total_tickets}</p>
                  <p className="history-subtitle">En todo el periodo</p>
                </div>
              </div>
              
              <div className="history-card resolved">
                <div className="history-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <CheckCircle size={28} />
                </div>
                <div className="history-info">
                  <h3 className="history-title">Resueltos este Mes</h3>
                  <p className="history-value">{ticketHistory.resolved_this_month}</p>
                  <p className="history-subtitle">Eficiencia: {ticketHistory.success_rate}%</p>
                </div>
              </div>
              
              <div className="history-card time">
                <div className="history-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <Clock size={28} />
                </div>
                <div className="history-info">
                  <h3 className="history-title">Tiempo Promedio</h3>
                  <p className="history-value">{ticketHistory.avg_resolution_time}h</p>
                  <p className="history-subtitle">Resolución</p>
                </div>
              </div>
              
              <div className="history-card priority">
                <div className="history-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
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
            {paginatedClosedTickets.length === 0 ? (
              <div className="empty-state">
                <History size={48} />
                <p>No hay tickets resueltos</p>
              </div>
            ) : (
              paginatedClosedTickets.map((ticket) => (
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
            ))
            )}
          </div>

          {/* PHP-PRO: Closed tickets pagination */}
          {totalClosedPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setClosedTicketsPage(p => Math.max(1, p - 1))}
                disabled={closedTicketsPage === 1}
              >
                <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
                Anterior
              </button>
              <span className="pagination-info">
                Página {closedTicketsPage} de {totalClosedPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setClosedTicketsPage(p => Math.min(totalClosedPages, p + 1))}
                disabled={closedTicketsPage === totalClosedPages}
              >
                Siguiente
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          )}
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

      {/* PHP-PRO: Comprehensive Statistics Modal */}
      {showHistoryModal && ticketHistory && (
        <div className="modal-overlay">
          <div className="modal-content extra-large">
            <div className="modal-header">
              <h2>
                <BarChart3 size={24} />
                Estadísticas de Historial
              </h2>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body statistics-modal">
              {/* Performance Overview */}
              <div className="stats-overview-section">
                <h3 className="stats-section-title">Rendimiento General</h3>
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">
                      <CheckCircle size={32} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Tasa de Éxito</p>
                      <p className="stat-value">{ticketHistory.success_rate}%</p>
                      <p className="stat-trend positive">
                        {ticketHistory.success_rate >= 80 ? 'Excelente' : ticketHistory.success_rate >= 60 ? 'Bueno' : 'Mejorable'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="stat-card success">
                    <div className="stat-icon">
                      <Clock size={32} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Tiempo Promedio</p>
                      <p className="stat-value">{ticketHistory.avg_resolution_time}h</p>
                      <p className="stat-trend">
                        Rango: {ticketHistory.performance_metrics.fastest_resolution}h - {ticketHistory.performance_metrics.slowest_resolution}h
                      </p>
                    </div>
                  </div>
                  
                  <div className="stat-card warning">
                    <div className="stat-icon">
                      <AlertTriangle size={32} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Prioridad Crítica</p>
                      <p className="stat-value">{ticketHistory.priority_breakdown.critical}</p>
                      <p className="stat-trend">
                        {ticketHistory.priority_breakdown.critical > 0 ? 'Requieren atención' : 'Sin tickets críticos'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="stat-card info">
                    <div className="stat-icon">
                      <Settings size={32} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Total Tickets</p>
                      <p className="stat-value">{ticketHistory.total_tickets}</p>
                      <p className="stat-trend">
                        {ticketHistory.resolved_this_month} resueltos este mes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown Chart */}
              <div className="stats-chart-section">
                <h3 className="stats-section-title">Distribución por Prioridad</h3>
                <div className="priority-chart">
                  <div className="priority-bar critical">
                    <div className="bar-label">Crítica</div>
                    <div className="bar-fill" style={{ width: `${(ticketHistory.priority_breakdown.critical / ticketHistory.total_tickets) * 100}%` }}>
                      <span className="bar-value">{ticketHistory.priority_breakdown.critical}</span>
                    </div>
                  </div>
                  <div className="priority-bar high">
                    <div className="bar-label">Alta</div>
                    <div className="bar-fill" style={{ width: `${(ticketHistory.priority_breakdown.high / ticketHistory.total_tickets) * 100}%` }}>
                      <span className="bar-value">{ticketHistory.priority_breakdown.high}</span>
                    </div>
                  </div>
                  <div className="priority-bar medium">
                    <div className="bar-label">Media</div>
                    <div className="bar-fill" style={{ width: `${(ticketHistory.priority_breakdown.medium / ticketHistory.total_tickets) * 100}%` }}>
                      <span className="bar-value">{ticketHistory.priority_breakdown.medium}</span>
                    </div>
                  </div>
                  <div className="priority-bar low">
                    <div className="bar-label">Baja</div>
                    <div className="bar-fill" style={{ width: `${(ticketHistory.priority_breakdown.low / ticketHistory.total_tickets) * 100}%` }}>
                      <span className="bar-value">{ticketHistory.priority_breakdown.low}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Performance */}
              <div className="stats-chart-section">
                <h3 className="stats-section-title">Rendimiento Semanal</h3>
                <div className="weekly-performance-grid">
                  {ticketHistory.performance_metrics.weekly_performance.map((week, index) => (
                    <div key={index} className="week-card">
                      <p className="week-label">{week.week}</p>
                      <div className="week-metrics">
                        <div className="week-metric">
                          <span className="metric-label">Resueltos</span>
                          <span className="metric-value">{week.resolved}</span>
                        </div>
                        <div className="week-metric">
                          <span className="metric-label">Promedio</span>
                          <span className="metric-value">{week.avg_time}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tickets by Service */}
              <div className="stats-service-section">
                <h3 className="stats-section-title">Tickets por Tipo de Servicio</h3>
                <div className="service-list">
                  {ticketHistory.performance_metrics.tickets_by_service.map((service, index) => (
                    <div key={index} className="service-stat-item">
                      <div className="service-info">
                        <span className="service-name">{service.service}</span>
                        <span className="service-count">{service.count} tickets</span>
                      </div>
                      <div className="service-metrics">
                        <span className="service-avg-time">Promedio: {service.avg_time}h</span>
                        <div className="service-progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${(service.count / ticketHistory.total_tickets) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="stats-trend-section">
                <h3 className="stats-section-title">Tendencia Mensual</h3>
                <div className="trend-chart">
                  {ticketHistory.monthly_trend.map((month, index) => (
                    <div key={index} className="trend-bar-group">
                      <div className="trend-bars">
                        <div 
                          className="trend-bar created" 
                          style={{ height: `${(month.created / Math.max(...ticketHistory.monthly_trend.map(m => m.created))) * 100}%` }}
                          title={`Creados: ${month.created}`}
                        />
                        <div 
                          className="trend-bar resolved" 
                          style={{ height: `${(month.resolved / Math.max(...ticketHistory.monthly_trend.map(m => m.resolved))) * 100}%` }}
                          title={`Resueltos: ${month.resolved}`}
                        />
                      </div>
                      <span className="trend-label">{month.month}</span>
                    </div>
                  ))}
                </div>
                <div className="trend-legend">
                  <div className="legend-item">
                    <div className="legend-color created" />
                    <span>Creados</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color resolved" />
                    <span>Resueltos</span>
                  </div>
                </div>
              </div>
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

      {/* Assistance Request Modal */}
      {showAssistanceModal && selectedTicketForAssistance && (
        <AssistanceRequestModal
          isOpen={showAssistanceModal}
          onClose={() => {
            setShowAssistanceModal(false);
            setSelectedTicketForAssistance(null);
          }}
          ticketId={parseInt(selectedTicketForAssistance.id)}
          ticketTitle={selectedTicketForAssistance.Subject}
          onSuccess={handleAssistanceSuccess}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;
