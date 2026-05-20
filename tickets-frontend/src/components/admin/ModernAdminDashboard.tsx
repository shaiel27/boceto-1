import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  MapPin,
  Wrench,
  Bell,
  ChevronRight,
  Search,
  Inbox,
  Shield,
  Timer
} from 'lucide-react';
import './ModernAdminDashboard.css';
import ApiService from '../../services/api';
import AdminAssistanceManagement from '../assistance/AdminAssistanceManagement';
import CenteredNotification, { NotificationData } from '../notifications/CenteredNotification';

interface DashboardStats {
  pending_count: number;
  in_progress_count: number;
  resolved_count: number;
  critical_count: number;
  today_count: number;
  week_count: number;
  avg_resolution_hours: number | null;
  active_offices: number;
  active_technicians: number;
  total_tickets: number;
  resolution_rate: number;
}

interface RecentTicket {
  ID_Service_Request: string;
  Ticket_Code: string;
  Subject: string;
  System_Priority: string;
  Status: string;
  Created_at: string;
  Office_Name: string;
  Service_Name: string;
  Technician_Names: string;
  Time_Ago: string;
}

interface PriorityDistribution {
  System_Priority: string;
  count: number;
  percentage: number;
}

interface OfficeDistribution {
  ID_Office: number;
  Office_Name: string;
  ticket_count: number;
  pending_count: number;
  in_progress_count: number;
  resolved_count: number;
}

interface TechnicianPerformance {
  ID_Technicians: number;
  technician_name: string;
  Email: string;
  assigned_tickets: number;
  resolved_tickets: number;
  avg_resolution_hours: number | null;
  active_tickets: number;
}

interface TrendData {
  date: string;
  created_count: number;
  resolved_count: number;
  high_priority_count: number;
}

const ModernAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([]);
  const [officeDistribution, setOfficeDistribution] = useState<OfficeDistribution[]>([]);
  const [technicianPerformance, setTechnicianPerformance] = useState<TechnicianPerformance[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null);
  const [refreshInterval] = useState(15000);

  const showNotification = (type: NotificationData['type'], title: string, message: string) => {
    setNotification({ type, title, message, duration: 6000, showSound: true });
  };

  const checkNotifications = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://192.168.2.4:8000'}/api/notifications?action=my-notifications`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        const currentCount = data.data.length;
        if (currentCount > lastNotificationCount && lastNotificationCount > 0) {
          data.data.slice(0, currentCount - lastNotificationCount).forEach((notif: any) => {
            if (notif.Type === 'ticket_created_admin') {
              showNotification('info', notif.Title, notif.Message);
            }
          });
        }
        setLastNotificationCount(currentCount);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const hasDashboardChanges = (newStats: DashboardStats, oldStats: DashboardStats | null): boolean => {
    if (!oldStats) return true;
    return (
      newStats.pending_count !== oldStats.pending_count ||
      newStats.in_progress_count !== oldStats.in_progress_count ||
      newStats.resolved_count !== oldStats.resolved_count ||
      newStats.critical_count !== oldStats.critical_count ||
      newStats.total_tickets !== oldStats.total_tickets
    );
  };

  const checkForDashboardUpdates = async () => {
    try {
      const response = await ApiService.getDashboardData();
      if (response.success && response.data) {
        if (hasDashboardChanges(response.data.stats, previousStats)) {
          setPreviousStats(response.data.stats);
          setStats(response.data.stats);
          setRecentTickets(response.data.recent_tickets || []);
          setPriorityDistribution(response.data.priority_distribution || []);
          setOfficeDistribution(response.data.office_distribution || []);
          setTechnicianPerformance(response.data.technician_performance || []);
          setTrends(response.data.trends || []);
        }
      }
    } catch (error) {
      console.error('Error checking for dashboard updates:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getDashboardData();
      if (response.success && response.data) {
        setPreviousStats(response.data.stats);
        setStats(response.data.stats);
        setRecentTickets(response.data.recent_tickets || []);
        setPriorityDistribution(response.data.priority_distribution || []);
        setOfficeDistribution(response.data.office_distribution || []);
        setTechnicianPerformance(response.data.technician_performance || []);
        setTrends(response.data.trends || []);
      } else {
        setError(response.message || 'Error al cargar datos del dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    checkNotifications();
    const interval = setInterval(() => {
      checkForDashboardUpdates();
      checkNotifications();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, lastNotificationCount]);

  const filteredTickets = useMemo(() => {
    if (!searchTerm) return recentTickets;
    return recentTickets.filter(ticket =>
      ticket.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Ticket_Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Office_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentTickets, searchTerm]);

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'Crítica': return '#EF4444';
      case 'Alta': return '#F59E0B';
      case 'Media': return '#2563EB';
      case 'Baja': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pendiente': return '#F59E0B';
      case 'En Proceso': return '#2563EB';
      case 'Cerrado': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatTime = (hours: number | null): string => {
    if (!hours) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${Math.round(hours * 10) / 10} h`;
  };

  if (loading && !stats) {
    return (
      <div className="adm-loading">
        <div className="adm-loading-spinner">
          <RefreshCw size={40} />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="adm-error">
        <AlertCircle size={48} />
        <h2>Error al cargar el dashboard</h2>
        <p>{error}</p>
        <button className="adm-btn adm-btn-primary" onClick={loadDashboardData}>
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="adm-dashboard">
      <header className="adm-header">
        <div className="adm-header-inner">
          <div className="adm-header-left">
            <div className="adm-header-brand">
              <BarChart3 size={28} />
              <div>
                <h1>Panel de Administración</h1>
                <span>Alcaldía de San Cristóbal</span>
              </div>
            </div>
          </div>
          <div className="adm-header-right">
            <div className="adm-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="adm-btn adm-btn-ghost" onClick={loadDashboardData} title="Actualizar">
              <RefreshCw size={18} />
            </button>
            <button className="adm-btn adm-btn-outline">
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>
      </header>

      <main className="adm-main">
        <div className="adm-metrics">
          <div className="adm-metric-card adm-metric-total">
            <div className="adm-metric-icon">
              <Inbox size={22} />
            </div>
            <div className="adm-metric-body">
              <span className="adm-metric-value">{stats?.total_tickets || 0}</span>
              <span className="adm-metric-label">Total Tickets</span>
            </div>
            <span className="adm-metric-trend up">+{stats?.today_count || 0} hoy</span>
          </div>
          <div className="adm-metric-card adm-metric-pending">
            <div className="adm-metric-icon">
              <Clock size={22} />
            </div>
            <div className="adm-metric-body">
              <span className="adm-metric-value">{stats?.pending_count || 0}</span>
              <span className="adm-metric-label">Pendientes</span>
            </div>
            <span className="adm-metric-percent">
              {stats?.total_tickets ? Math.round((stats.pending_count / stats.total_tickets) * 100) : 0}%
            </span>
          </div>
          <div className="adm-metric-card adm-metric-progress">
            <div className="adm-metric-icon">
              <Activity size={22} />
            </div>
            <div className="adm-metric-body">
              <span className="adm-metric-value">{stats?.in_progress_count || 0}</span>
              <span className="adm-metric-label">En Proceso</span>
            </div>
            <span className="adm-metric-percent">
              {stats?.total_tickets ? Math.round((stats.in_progress_count / stats.total_tickets) * 100) : 0}%
            </span>
          </div>
          <div className="adm-metric-card adm-metric-resolved">
            <div className="adm-metric-icon">
              <CheckCircle size={22} />
            </div>
            <div className="adm-metric-body">
              <span className="adm-metric-value">{stats?.resolved_count || 0}</span>
              <span className="adm-metric-label">Resueltos</span>
            </div>
            <span className="adm-metric-percent">{stats?.resolution_rate || 0}%</span>
          </div>
          <div className="adm-metric-card adm-metric-critical">
            <div className="adm-metric-icon">
              <AlertCircle size={22} />
            </div>
            <div className="adm-metric-body">
              <span className="adm-metric-value">{stats?.critical_count || 0}</span>
              <span className="adm-metric-label">Críticos</span>
            </div>
            <span className="adm-metric-percent">
              {stats?.total_tickets ? Math.round((stats.critical_count / stats.total_tickets) * 100) : 0}%
            </span>
          </div>
          <div className="adm-metric-card adm-metric-secondary">
            <div className="adm-metric-icon">
              <Timer size={22} />
            </div>
            <div className="adm-metric-body">
              <span className="adm-metric-value">{stats?.avg_resolution_hours ? formatTime(stats.avg_resolution_hours) : 'N/A'}</span>
              <span className="adm-metric-label">Tiempo Promedio</span>
            </div>
            <span className="adm-metric-trend">{stats?.active_technicians || 0} técnicos</span>
          </div>
        </div>

        <div className="adm-grid">
          <section className="adm-card adm-card-tickets">
            <div className="adm-card-head">
              <h3><FileText size={18} /> Tickets Recientes</h3>
              <button className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => navigate('/admin/tickets')}>
                Ver todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="adm-card-body">
              {filteredTickets.slice(0, 8).map((ticket) => (
                <div key={ticket.ID_Service_Request} className="adm-ticket-row"
                     onClick={() => navigate(`/admin/tickets/${ticket.ID_Service_Request}`)}>
                  <div className="adm-ticket-info">
                    <div className="adm-ticket-top">
                      <span className="adm-ticket-code">{ticket.Ticket_Code}</span>
                      <div className="adm-ticket-tags">
                        <span className="adm-tag" style={{ background: getPriorityColor(ticket.System_Priority) }}>
                          {ticket.System_Priority}
                        </span>
                        <span className="adm-tag" style={{ background: getStatusColor(ticket.Status) }}>
                          {ticket.Status}
                        </span>
                      </div>
                    </div>
                    <p className="adm-ticket-subject">{ticket.Subject}</p>
                    <div className="adm-ticket-meta">
                      <span><MapPin size={13} /> {ticket.Office_Name}</span>
                      <span><Wrench size={13} /> {ticket.Service_Name}</span>
                      <span><Clock size={13} /> {ticket.Time_Ago}</span>
                    </div>
                  </div>
                  <Eye size={16} className="adm-ticket-view" />
                </div>
              ))}
            </div>
          </section>

          <section className="adm-card adm-card-priority">
            <div className="adm-card-head">
              <h3><BarChart3 size={18} /> Prioridad</h3>
            </div>
            <div className="adm-card-body">
              {priorityDistribution.length > 0 ? (
                priorityDistribution.map((p) => (
                  <div key={p.System_Priority} className="adm-bar-row">
                    <div className="adm-bar-info">
                      <span>{p.System_Priority}</span>
                      <span>{p.count} · {p.percentage}%</span>
                    </div>
                    <div className="adm-bar-track">
                      <div className="adm-bar-fill" style={{
                        width: `${p.percentage}%`,
                        background: getPriorityColor(p.System_Priority)
                      }} />
                    </div>
                  </div>
                ))
              ) : (
                [
                  { System_Priority: 'Crítica', count: stats?.critical_count || 0, percentage: stats?.total_tickets ? Math.round((stats.critical_count / stats.total_tickets) * 100) : 0 },
                  { System_Priority: 'Alta', count: 0, percentage: 0 },
                  { System_Priority: 'Media', count: 0, percentage: 0 },
                  { System_Priority: 'Baja', count: 0, percentage: 0 }
                ].map((p) => (
                  <div key={p.System_Priority} className="adm-bar-row">
                    <div className="adm-bar-info">
                      <span>{p.System_Priority}</span>
                      <span>{p.count} · {p.percentage}%</span>
                    </div>
                    <div className="adm-bar-track">
                      <div className="adm-bar-fill" style={{
                        width: `${p.percentage}%`,
                        background: getPriorityColor(p.System_Priority)
                      }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="adm-card adm-card-technicians">
            <div className="adm-card-head">
              <h3><Users size={18} /> Técnicos</h3>
              <button className="adm-btn adm-btn-sm adm-btn-ghost">
                Ver todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="adm-card-body">
              {technicianPerformance.slice(0, 6).map((tech) => (
                <div key={tech.ID_Technicians} className="adm-tech-row">
                  <div className="adm-tech-avatar">{tech.technician_name.charAt(0).toUpperCase()}</div>
                  <div className="adm-tech-info">
                    <span className="adm-tech-name">{tech.technician_name}</span>
                    <span className="adm-tech-email">{tech.Email}</span>
                  </div>
                  <div className="adm-tech-stats">
                    <div className="adm-tech-stat">
                      <strong>{tech.resolved_tickets}</strong>
                      <span>resueltos</span>
                    </div>
                    <div className="adm-tech-stat">
                      <strong>{tech.active_tickets}</strong>
                      <span>activos</span>
                    </div>
                    <div className="adm-tech-stat">
                      <strong>{formatTime(tech.avg_resolution_hours)}</strong>
                      <span>promedio</span>
                    </div>
                  </div>
                  <Shield size={14} className="adm-tech-badge" />
                </div>
              ))}
            </div>
          </section>

          <section className="adm-card adm-card-offices">
            <div className="adm-card-head">
              <h3><MapPin size={18} /> Oficinas</h3>
            </div>
            <div className="adm-card-body">
              {officeDistribution.slice(0, 5).map((office) => (
                <div key={office.ID_Office} className="adm-office-row">
                  <div className="adm-office-head">
                    <span className="adm-office-name">{office.Office_Name}</span>
                    <span className="adm-office-total">{office.ticket_count} tickets</span>
                  </div>
                  <div className="adm-office-breakdown">
                    <div className="adm-office-stat">
                      <span className="adm-dot pending" />
                      {office.pending_count}
                    </div>
                    <div className="adm-office-stat">
                      <span className="adm-dot progress" />
                      {office.in_progress_count}
                    </div>
                    <div className="adm-office-stat">
                      <span className="adm-dot resolved" />
                      {office.resolved_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="adm-card adm-card-assistance">
            <AdminAssistanceManagement onRequestsUpdate={(count) => {
              console.log('Pending assistance requests:', count);
            }} />
          </section>
        </div>
      </main>

      <CenteredNotification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default ModernAdminDashboard;
