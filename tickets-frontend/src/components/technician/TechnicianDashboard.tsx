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
  AlertTriangle,
  ArrowLeft,
  Inbox,
  FileText,
  Filter,
  Activity,
  Paperclip
} from 'lucide-react';
import './TechnicianDashboard.css';
import TechnicianProfileComponent from './TechnicianProfile';
import AssistanceRequestModal from '../assistance/AssistanceRequestModal';
import ApiService, { API_BASE_URL } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PasswordChangeRequired from '../common/PasswordChangeRequired';

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstLogin, setFirstLogin] = useState(false);
  const [technicianProfile, setTechnicianProfile] = useState<TechnicianProfile | null>(null);

  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [ticketHistory, setTicketHistory] = useState<TicketHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'week' | 'month' | 'year'>('month');

  const [lunchTimeRemaining, setLunchTimeRemaining] = useState<number>(0);
  const [workTimeRemaining, setWorkTimeRemaining] = useState<number>(0);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [selectedTicketForAssistance, setSelectedTicketForAssistance] = useState<Ticket | null>(null);

  const [activeTicketsPage, setActiveTicketsPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Toast notification system
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadInitialData = async () => {
    setLoading(true);
    let hasError = false;
    try {
      const profileResponse = await ApiService.getTechnicianProfile();
      if (profileResponse.success && profileResponse.data) {
        setTechnicianProfile(profileResponse.data);
      } else {
        showToast('error', profileResponse.message || 'Error al cargar perfil');
        hasError = true;
      }
      const ticketsResponse = await ApiService.getTechnicianTickets();
      if (ticketsResponse.success && ticketsResponse.data) {
        const formattedTickets = ticketsResponse.data.map((ticket: any) => {
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
        await loadTicketHistory();
      } else {
        showToast('error', ticketsResponse.message || 'Error al cargar tickets');
        hasError = true;
      }
    } catch (error) {
      showToast('error', 'Error de conexión al cargar datos');
      hasError = true;
    } finally {
      setLoading(false);
      if (!hasError && myTickets.length === 0) {
        showToast('success', 'Datos cargados correctamente');
      }
    }
  };

  const loadTicketHistory = async () => {
    try {
      setHistoryLoading(true);
      if (myTickets.length > 0) {
        const calculatedHistory = calculateTicketHistory(myTickets);
        setTicketHistory(calculatedHistory);
      } else {
        setTicketHistory({
          total_tickets: 0,
          resolved_this_month: 0,
          avg_resolution_time: 0,
          success_rate: 0,
          priority_breakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          monthly_trend: [],
          performance_metrics: {
            fastest_resolution: 0,
            slowest_resolution: 0,
            tickets_by_service: [],
            weekly_performance: []
          }
        });
      }
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
          if (data.success && data.data) {
            setTicketHistory(data.data);
          }
        }
      } catch (apiError) {
      }
    } catch (error) {
      console.error('❌ Error cargando historial de tickets:', error);
      const calculatedHistory = calculateTicketHistory(myTickets);
      setTicketHistory(calculatedHistory);
    } finally {
      setHistoryLoading(false);
    }
  };

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
    const fastestResolution = resolutionTimes.length > 0 ? Math.min(...resolutionTimes) : 0;
    const slowestResolution = resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : 0;
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
      .map(([week, data]) => ({ week, resolved: data.count, avg_time: Math.round(data.totalTime / data.count) }))
      .slice(-4);
  };

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
      return { month, resolved: monthResolved, created: monthTickets.length };
    });
  };

  const loadTicketComments = async (ticketId: string) => {
    try {
      const response = await ApiService.getTicketComments(parseInt(ticketId));
      if (response.success && response.data) {
        setComments(response.data);
      } else {
        showToast('error', response.message || 'Error al cargar comentarios');
      }
    } catch (error) {
      showToast('error', 'Error de conexión al cargar comentarios');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter(f => f.size <= maxSize);
    if (validFiles.length !== files.length) {
      showToast('error', 'Algunos archivos exceden el límite de 10MB');
    }
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5));
    if (e.target) e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    try {
      const hasFiles = selectedFiles.length > 0;
      const response = await ApiService.addTicketComment(
        parseInt(selectedTicket.id),
        newComment,
        hasFiles ? selectedFiles : undefined
      );
      if (response.success) {
        setNewComment('');
        setSelectedFiles([]);
        showToast('success', `Comentario enviado${hasFiles ? ' con archivos' : ''}`);
        await loadTicketComments(selectedTicket.id);
      } else {
        showToast('error', response.message || 'Error al enviar comentario');
      }
    } catch (error) {
      showToast('error', 'Error de conexión al enviar comentario');
    }
  };

  const refreshTickets = async () => {
    try {
      const ticketsResponse = await ApiService.getTechnicianTickets();
      if (ticketsResponse.success && ticketsResponse.data) {
        const formattedTickets = ticketsResponse.data.map((ticket: any) => {
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
        await loadTicketHistory();
      }
    } catch (error) {
      showToast('error', 'Error al refrescar tickets');
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      const response = await ApiService.updateTicketStatus(parseInt(selectedTicket.id), 'Cerrado');
      if (response.success) {
        showToast('success', 'Ticket cerrado exitosamente');
        setSelectedTicket(null);
        await refreshTickets();
      } else {
        showToast('error', response.message || 'Error al cerrar ticket');
      }
    } catch (error) {
      showToast('error', 'Error de conexión al cerrar ticket');
    }
  };

  const handleViewDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    await loadTicketComments(ticket.id);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!user.last_login_at) {
      setFirstLogin(true);
      setLoading(false);
      return;
    }
    loadInitialData();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const lunchEnd = new Date();
    lunchEnd.setHours(12, 40, 0, 0);
    const workEnd = new Date();
    workEnd.setHours(17, 0, 0, 0);
    const lunchDiff = lunchEnd.getTime() - now.getTime();
    const workDiff = workEnd.getTime() - now.getTime();
    setLunchTimeRemaining(Math.max(0, Math.floor(lunchDiff / 1000 / 60)));
    setWorkTimeRemaining(Math.max(0, Math.floor(workDiff / 1000 / 60)));
  }, []);

  const handleAssistanceRequest = (ticket: Ticket) => {
    setSelectedTicketForAssistance(ticket);
    setShowAssistanceModal(true);
  };

  const handleAssistanceSuccess = (requestId: string) => {};

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica': return 'critic';
      case 'Alta': return 'high';
      case 'Media': return 'medium';
      case 'Baja': return 'low';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'available';
      case 'Ocupado': return 'busy';
      case 'Inactivo': return 'inactive';
      default: return 'inactive';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Disponible': return 'Disponible';
      case 'Ocupado': return 'Ocupado';
      case 'Inactivo': return 'Fuera de horario';
      default: return status;
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
    if (status === 'Inactivo') return 'Fuera de horario laboral';
    else if (status === 'Ocupado' && currentTimeMinutes >= lunchStart && currentTimeMinutes <= lunchEnd) return 'En bloque de almuerzo';
    else if (status === 'Ocupado') return 'Atendiendo ticket(s) activo(s)';
    return 'Disponible para atender';
  };

  const filteredActiveTickets = myTickets.filter(ticket => {
    const matchesPriority = priorityFilter === 'all' || ticket.System_Priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.Status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      ticket.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredActiveTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredActiveTickets.slice(
    (activeTicketsPage - 1) * ITEMS_PER_PAGE,
    activeTicketsPage * ITEMS_PER_PAGE
  );

  const activeCount = myTickets.filter(t => t.Status !== 'Cerrado').length;
  const resolvedCount = myTickets.filter(t => t.Status === 'Cerrado').length;
  const criticalCount = myTickets.filter(t => t.System_Priority === 'Crítica').length;

  if (loading) {
    return (
      <div className="technician-dashboard">
        <div className="tech-loading">
          <div className="spinner" />
          <p>Cargando datos del técnico...</p>
        </div>
      </div>
    );
  }

  if (firstLogin) {
    return <PasswordChangeRequired onComplete={() => {
      setFirstLogin(false);
      loadInitialData();
    }} />;
  }

  if (!technicianProfile) {
    return (
      <div className="technician-dashboard">
        <div className="tech-error">
          <p>No se encontraron datos del técnico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-dashboard">
      {/* TOP BAR */}
      <div className="tech-topbar">
        <div className="tech-topbar-left">
          <div className="tech-avatar">
            {technicianProfile.first_name.charAt(0)}{technicianProfile.last_name.charAt(0)}
          </div>
          <div>
            <div className="tech-name">
              {technicianProfile.first_name} {technicianProfile.last_name}
              <span className={`status-dot ${getStatusColor(technicianProfile?.status || '')}`} style={{ marginLeft: 8, verticalAlign: 'middle' }} />
            </div>
            <div className="tech-role">Técnico de Soporte</div>
          </div>
        </div>
        <div className="tech-topbar-right">
          <button className="action-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <button className="action-btn profile" onClick={() => setShowProfileDrawer(true)}>
            <User size={15} />
            Perfil
          </button>
          <button className="action-btn" onClick={refreshTickets} title="Refrescar tickets">
            <RefreshCw size={15} />
          </button>
          <button className="action-btn" onClick={() => setShowHistoryModal(true)} disabled={historyLoading}>
            <BarChart3 size={15} />
            Estadísticas
          </button>
          <button className="action-btn logout" onClick={async () => { await logout(); navigate('/login'); }}>
            <LogOut size={15} />
            Salir
          </button>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="tech-workspace">
        {/* LEFT PANEL — INBOX */}
        <div className="tech-inbox">
          <div className="tech-inbox-header">
            <h2>
              <Inbox size={16} />
              Tickets
              <span>{filteredActiveTickets.length}</span>
            </h2>
            <div className="tech-inbox-stats">
              <div className="tech-inbox-stat highlight">
                <div className="stat-num">{activeCount}</div>
                <div className="stat-label">Activos</div>
              </div>
              <div className="tech-inbox-stat">
                <div className="stat-num">{resolvedCount}</div>
                <div className="stat-label">Resueltos</div>
              </div>
              <div className="tech-inbox-stat">
                <div className="stat-num">
                  {ticketHistory ? ticketHistory.avg_resolution_time : '-'}
                </div>
                <div className="stat-label">Prom. horas</div>
              </div>
              <div className="tech-inbox-stat">
                <div className="stat-num">{criticalCount}</div>
                <div className="stat-label">Críticos</div>
              </div>
            </div>
            <div className="tech-inbox-filters">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActiveTicketsPage(1); }}
              />
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setActiveTicketsPage(1); }}
              >
                <option value="all">Prioridad</option>
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setActiveTicketsPage(1); }}
              >
                <option value="all">Estado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
          </div>

          <div className="tech-inbox-list">
            {paginatedTickets.length === 0 ? (
              <div className="tech-inbox-empty">
                <Inbox size={36} />
                <p>No hay tickets que coincidan</p>
              </div>
            ) : (
              paginatedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`inbox-ticket ${getPriorityColor(ticket.System_Priority)}${ticket.Status === 'Cerrado' ? ' closed' : ''}${selectedTicket?.id === ticket.id ? ' active' : ''}`}
                  onClick={() => handleViewDetails(ticket)}
                >
                  <div className="tkt-top">
                    <span className="tkt-code">{ticket.Code}</span>
                    <span className={`tkt-priority ${getPriorityColor(ticket.System_Priority)}`}>
                      {ticket.System_Priority}
                    </span>
                  </div>
                  <div className="tkt-subject">{ticket.Subject}</div>
                  <div className="tkt-meta">
                    <span><MapPin size={10} />{ticket.Direction_Name}</span>
                    <span>
                      {ticket.Status === 'Cerrado' ? '✓ Cerrado' : ticket.Status === 'En Progreso' ? '▶ En Progreso' : '○ Pendiente'}
                    </span>
                    {ticket.Comments_Count > 0 && <span><MessageSquare size={10} />{ticket.Comments_Count}</span>}
                  </div>
                  {ticket.Is_Lead ? (
                    <span className="tkt-badge lead">Principal</span>
                  ) : (
                    <span className="tkt-badge support">Apoyo</span>
                  )}
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="tech-inbox-pagination">
              <button onClick={() => setActiveTicketsPage(p => Math.max(1, p - 1))} disabled={activeTicketsPage === 1}>
                <ChevronDown size={12} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <span>{activeTicketsPage} / {totalPages}</span>
              <button onClick={() => setActiveTicketsPage(p => Math.min(totalPages, p + 1))} disabled={activeTicketsPage === totalPages}>
                <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — DETAIL */}
        <div className="tech-detail">
          {selectedTicket ? (
            <div className="tech-detail-view">
              <div className="tech-detail-top">
                <div>
                  <div className="dd-code">{selectedTicket.Code}</div>
                  <h2 className="dd-title">{selectedTicket.Subject}</h2>
                  <div className="dd-meta">
                    <span className={`priority-badge ${getPriorityColor(selectedTicket.System_Priority)}`}>
                      {selectedTicket.System_Priority}
                    </span>
                    <span className={`meta-value status-${selectedTicket.Status.toLowerCase().replace(' ', '-')}`}>
                      {selectedTicket.Status}
                    </span>
                    {selectedTicket.Is_Lead ? (
                      <span className="role-lead"><Crown size={12} /> Principal</span>
                    ) : (
                      <span className="role-support"><Users size={12} /> Apoyo</span>
                    )}
                  </div>
                </div>
                <div className="dd-actions">
                  {selectedTicket.Status !== 'Cerrado' && (
                    <>
                      <button className="action-btn assistance" onClick={() => handleAssistanceRequest(selectedTicket)}>
                        <AlertTriangle size={15} />
                        Asistencia
                      </button>
                      <button
                        className="action-btn primary"
                        onClick={handleCloseTicket}
                        style={{ background: 'var(--navy)', color: '#fff', border: 'none' }}
                      >
                        <CheckCircle size={15} />
                        Cerrar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="tech-detail-body">
                <div className="tech-detail-section">
                  <h3>Descripción</h3>
                  <p className="dd-desc">{selectedTicket.Description}</p>
                </div>
                <div className="tech-detail-section">
                  <h3>Información</h3>
                  <div className="tech-detail-grid">
                    <div className="dd-row">
                      <span className="dd-label">Ubicación</span>
                      <span className="dd-val">{selectedTicket.Direction_Name} → {selectedTicket.Division_Name}</span>
                    </div>
                    <div className="dd-row">
                      <span className="dd-label">Número de Bien</span>
                      <span className="dd-val">{selectedTicket.Property_Number}</span>
                    </div>
                    <div className="dd-row">
                      <span className="dd-label">Servicio</span>
                      <span className="dd-val">{selectedTicket.Type_Service}</span>
                    </div>
                    <div className="dd-row">
                      <span className="dd-label">Creado</span>
                      <span className="dd-val">{new Date(selectedTicket.Created_at).toLocaleDateString('es-VE')}</span>
                    </div>
                    {selectedTicket.Resolved_at && (
                      <div className="dd-row">
                        <span className="dd-label">Resuelto</span>
                        <span className="dd-val">{new Date(selectedTicket.Resolved_at).toLocaleDateString('es-VE')}</span>
                      </div>
                    )}
                    {selectedTicket.Resolution_Time && (
                      <div className="dd-row">
                        <span className="dd-label">Tiempo</span>
                        <span className="dd-val">{selectedTicket.Resolution_Time} horas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="tech-detail-comments">
                <h3><MessageSquare size={14} /> Comentarios ({comments.length})</h3>
                {selectedTicket.Status === 'Cerrado' ? (
                  <div className="dd-closed-msg">
                    <AlertCircle size={16} />
                    Ticket cerrado — no se permiten nuevos comentarios
                  </div>
                ) : null}
                {comments.length === 0 ? (
                  <div className="dd-no-comments">Sin comentarios</div>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.ID_Comment} className="dd-comment">
                      <div className="dd-comment-head">
                        <span className="user">{comment.user_name}</span>
                        <span className="date">{new Date(comment.Created_at).toLocaleString()}</span>
                      </div>
                      <p className="dd-comment-text">{comment.Comment}</p>
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="dd-comment-attachments">
                          {comment.attachments.map((att: any) => {
                            const isImage = att.File_Type?.startsWith('image/');
                            return isImage ? (
                              <div key={att.ID_Attachment} className="att-item">
                                <a href={`${API_BASE_URL}/${att.File_Path}`} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={`${API_BASE_URL}/${att.File_Path}`}
                                    alt={att.File_Name}
                                    className="att-thumb"
                                  />
                                </a>
                              </div>
                            ) : (
                              <div key={att.ID_Attachment} className="att-item att-file">
                                <a href={`${API_BASE_URL}/${att.File_Path}`} target="_blank" rel="noopener noreferrer">
                                  <FileText size={14} />
                                  <span className="att-name">{att.File_Name}</span>
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {selectedTicket.Status !== 'Cerrado' && (
                  <div className="dd-comment-form">
                    <div className="dd-comment-input-row">
                      <textarea
                        placeholder="Escribir comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <div className="dd-comment-actions">
                        <button
                          className="action-btn attach"
                          onClick={() => fileInputRef.current?.click()}
                          title="Adjuntar archivos"
                          style={{ background: selectedFiles.length > 0 ? 'var(--navy-s, #e8edf5)' : 'transparent', color: selectedFiles.length > 0 ? 'var(--navy)' : 'var(--text-muted, #6b7280)' }}
                        >
                          <Paperclip size={15} />
                          {selectedFiles.length > 0 && <span className="attach-count">{selectedFiles.length}</span>}
                        </button>
                        <button className="action-btn primary" onClick={handleSendComment}
                          style={{ background: 'var(--navy)', color: '#fff', border: 'none' }}>
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="dd-file-previews">
                        {selectedFiles.map((file, i) => (
                          <div key={i} className="dd-file-preview">
                            {file.type.startsWith('image/') ? (
                              <img src={URL.createObjectURL(file)} alt={file.name} className="fp-thumb" />
                            ) : (
                              <FileText size={16} />
                            )}
                            <span className="fp-name">{file.name}</span>
                            <button className="fp-remove" onClick={() => removeFile(i)}>
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedTicket.Status !== 'Cerrado' && (
                <div className="tech-detail-close-action">
                  <button className="action-btn danger" onClick={handleCloseTicket}>
                    <CheckCircle size={16} />
                    Cerrar Ticket
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* WELCOME VIEW */
            <div className="tech-detail-welcome">
              <Activity size={48} />
              <h2>Panel de Control</h2>
              <p>Selecciona un ticket de la lista para ver sus detalles, comentarios y acciones.</p>
              <div className="tech-welcome-grid">
                <div className="tech-welcome-card">
                  <div className="wc-icon" style={{ background: 'var(--navy-s)', color: 'var(--navy)' }}>
                    <FileText size={20} />
                  </div>
                  <div className="wc-num">{myTickets.length}</div>
                  <div className="wc-label">Total Tickets</div>
                </div>
                <div className="tech-welcome-card">
                  <div className="wc-icon" style={{ background: 'var(--done-s)', color: 'var(--done)' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div className="wc-num">{resolvedCount}</div>
                  <div className="wc-label">Resueltos</div>
                </div>
                <div className="tech-welcome-card">
                  <div className="wc-icon" style={{ background: 'var(--gold-s)', color: 'var(--med)' }}>
                    <Clock size={20} />
                  </div>
                  <div className="wc-num">{ticketHistory ? ticketHistory.avg_resolution_time : '-'}h</div>
                  <div className="wc-label">Prom. horas</div>
                </div>
                <div className="tech-welcome-card">
                  <div className="wc-icon" style={{ background: 'var(--crt-s)', color: 'var(--crt)' }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div className="wc-num">{criticalCount}</div>
                  <div className="wc-label">Críticos</div>
                </div>
                {ticketHistory && (
                  <>
                    <div className="tech-welcome-card">
                      <div className="wc-icon" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                        <BarChart3 size={20} />
                      </div>
                      <div className="wc-num">{ticketHistory.success_rate}%</div>
                      <div className="wc-label">Efectividad</div>
                    </div>
                    <div className="tech-welcome-card">
                      <div className="wc-icon" style={{ background: 'var(--prog-s)', color: 'var(--prog)' }}>
                        <Activity size={20} />
                      </div>
                      <div className="wc-num">{ticketHistory.resolved_this_month}</div>
                      <div className="wc-label">Este mes</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROFILE DRAWER */}
      {showProfileDrawer && (
        <>
          <div className="tech-drawer-overlay" onClick={() => setShowProfileDrawer(false)} />
          <div className="tech-drawer">
            <div className="tech-drawer-header">
              <h2><User size={18} /> Mi Perfil</h2>
              <button className="close-btn" onClick={() => setShowProfileDrawer(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="tech-drawer-body">
              <TechnicianProfileComponent
                profile={{
                  id: technicianProfile!.id,
                  firstName: technicianProfile!.first_name,
                  lastName: technicianProfile!.last_name,
                  email: technicianProfile!.email,
                  status: technicianProfile!.status === 'Activo' || technicianProfile!.status === 'Disponible' ? 'Activo' : 'Inactivo',
                  hireDate: technicianProfile!.created_at,
                  lunchBlock: technicianProfile!.lunch_block_name || `Bloque ${technicianProfile!.lunch_block}`,
                  workStartTime: technicianProfile!.lunch_start_time
                    ? `${technicianProfile!.lunch_start_time.split(':')[0]}:00`
                    : '08:00',
                  workEndTime: technicianProfile!.lunch_end_time
                    ? `${(parseInt(technicianProfile!.lunch_end_time.split(':')[0]) + 5).toString().padStart(2, '0')}:00`
                    : '17:00',
                  services: technicianProfile!.services.map((s: any) => s.Type_Service)
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && ticketHistory && (
        <div className="modal-overlay">
          <div className="modal-content extra-large">
            <div className="modal-header">
              <h2><BarChart3 size={20} /> Estadísticas de Historial</h2>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body statistics-modal">
              <div className="stats-overview-section">
                <h3 className="stats-section-title">Rendimiento General</h3>
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon"><CheckCircle size={22} /></div>
                    <div className="stat-content">
                      <p className="stat-label">Tasa de Éxito</p>
                      <p className="stat-value">{ticketHistory.success_rate}%</p>
                      <p className={`stat-trend ${ticketHistory.success_rate >= 80 ? 'positive' : ''}`}>
                        {ticketHistory.success_rate >= 80 ? 'Excelente' : ticketHistory.success_rate >= 60 ? 'Bueno' : 'Mejorable'}
                      </p>
                    </div>
                  </div>
                  <div className="stat-card success">
                    <div className="stat-icon"><Clock size={22} /></div>
                    <div className="stat-content">
                      <p className="stat-label">Tiempo Promedio</p>
                      <p className="stat-value">{ticketHistory.avg_resolution_time}h</p>
                      <p className="stat-trend">
                        Rango: {ticketHistory.performance_metrics.fastest_resolution}h - {ticketHistory.performance_metrics.slowest_resolution}h
                      </p>
                    </div>
                  </div>
                  <div className="stat-card warning">
                    <div className="stat-icon"><AlertTriangle size={22} /></div>
                    <div className="stat-content">
                      <p className="stat-label">Prioridad Crítica</p>
                      <p className="stat-value">{ticketHistory.priority_breakdown.critical}</p>
                      <p className="stat-trend">
                        {ticketHistory.priority_breakdown.critical > 0 ? 'Requieren atención' : 'Sin tickets críticos'}
                      </p>
                    </div>
                  </div>
                  <div className="stat-card info">
                    <div className="stat-icon"><Settings size={22} /></div>
                    <div className="stat-content">
                      <p className="stat-label">Total Tickets</p>
                      <p className="stat-value">{ticketHistory.total_tickets}</p>
                      <p className="stat-trend">{ticketHistory.resolved_this_month} resueltos este mes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-chart-section" style={{ marginBottom: 20 }}>
                <h3 className="stats-section-title">Distribución por Prioridad</h3>
                <div className="priority-chart">
                  {(['Crítica', 'Alta', 'Media', 'Baja'] as const).map((p, i) => {
                    const key = p === 'Crítica' ? 'critical' : p.toLowerCase() as 'high' | 'medium' | 'low';
                    const count = ticketHistory.priority_breakdown[key];
                    const cls = key === 'critical' ? 'critical' : key;
                    return (
                      <div key={i} className={`priority-bar ${cls}`}>
                        <div className="bar-label">{p}</div>
                        <div className="bar-fill" style={{ width: `${(count / ticketHistory.total_tickets) * 100}%` }}>
                          <span className="bar-value">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {ticketHistory.performance_metrics.weekly_performance.length > 0 && (
                <div className="stats-chart-section" style={{ marginBottom: 20 }}>
                  <h3 className="stats-section-title">Rendimiento Semanal</h3>
                  <div className="weekly-performance-grid">
                    {ticketHistory.performance_metrics.weekly_performance.map((week, i) => (
                      <div key={i} className="week-card">
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
              )}

              {ticketHistory.performance_metrics.tickets_by_service.length > 0 && (
                <div className="stats-service-section" style={{ marginBottom: 20 }}>
                  <h3 className="stats-section-title">Tickets por Tipo de Servicio</h3>
                  <div className="service-list">
                    {ticketHistory.performance_metrics.tickets_by_service.map((service, i) => (
                      <div key={i} className="service-stat-item">
                        <div className="service-info">
                          <span className="service-name">{service.service}</span>
                          <span className="service-count">{service.count} tickets</span>
                        </div>
                        <div className="service-metrics">
                          <span className="service-avg-time">Promedio: {service.avg_time}h</span>
                          <div className="service-progress">
                            <div className="progress-bar" style={{ width: `${(service.count / ticketHistory.total_tickets) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ticketHistory.monthly_trend.length > 0 && (
                <div className="stats-trend-section">
                  <h3 className="stats-section-title">Tendencia Mensual</h3>
                  <div className="trend-chart">
                    {ticketHistory.monthly_trend.map((month, i) => (
                      <div key={i} className="trend-bar-group">
                        <div className="trend-bars">
                          <div className="trend-bar created"
                            style={{ height: `${(month.created / Math.max(...ticketHistory.monthly_trend.map(m => m.created))) * 100}%` }} />
                          <div className="trend-bar resolved"
                            style={{ height: `${(month.resolved / Math.max(...ticketHistory.monthly_trend.map(m => m.resolved))) * 100}%` }} />
                        </div>
                        <span className="trend-label">{month.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="trend-legend">
                    <div className="legend-item"><div className="legend-color created" />Creados</div>
                    <div className="legend-item"><div className="legend-color resolved" />Resueltos</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSISTANCE MODAL */}
      {showAssistanceModal && selectedTicketForAssistance && (
        <AssistanceRequestModal
          isOpen={showAssistanceModal}
          onClose={() => { setShowAssistanceModal(false); setSelectedTicketForAssistance(null); }}
          ticketId={parseInt(selectedTicketForAssistance.id)}
          ticketTitle={selectedTicketForAssistance.Subject}
          onSuccess={handleAssistanceSuccess}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className={`tech-toast tech-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
