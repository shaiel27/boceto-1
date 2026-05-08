import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Settings,
  CheckCircle,
  AlertCircle,
  Activity,
  FileText,
  Download,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  Wrench,
  Star,
  Filter,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Zap,
  Target,
  Award
} from 'lucide-react';
import './ModernAdminDashboard.css';
import ApiService from '../../services/api';
import AdminAssistanceManagement from '../assistance/AdminAssistanceManagement';

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
  
  // State management
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([]);
  const [officeDistribution, setOfficeDistribution] = useState<OfficeDistribution[]>([]);
  const [technicianPerformance, setTechnicianPerformance] = useState<TechnicianPerformance[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getDashboardData();
      
      if (response.success && response.data) {
        setStats(response.data.stats);
        setRecentTickets(response.data.recent_tickets || []);
        setPriorityDistribution(response.data.priority_distribution || []);
        setOfficeDistribution(response.data.office_distribution || []);
        setTechnicianPerformance(response.data.technician_performance || []);
        setTrends(response.data.trends || []);
        setLastUpdated(response.data.last_updated || new Date().toISOString());
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

  // Auto-refresh effect
  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filtered data based on search
  const filteredTickets = useMemo(() => {
    if (!searchTerm) return recentTickets;
    
    return recentTickets.filter(ticket =>
      ticket.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Ticket_Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Office_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentTickets, searchTerm]);

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'Crítica': return '#EF4444';
      case 'Alta': return '#F59E0B';
      case 'Media': return '#3B82F6';
      case 'Baja': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pendiente': return '#F59E0B';
      case 'En Proceso': return '#3B82F6';
      case 'Cerrado': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Format time
  const formatTime = (hours: number | null): string => {
    if (!hours) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${Math.round(hours * 10) / 10} h`;
  };

  if (loading && !stats) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <RefreshCw className="animate-spin" size={48} />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h2>Error al cargar el dashboard</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="modern-admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="header-title">
              <h1>
                <BarChart3 size={32} />
                Dashboard Administrativo
              </h1>
              <p>
                Gestión eficiente de tickets y métricas en tiempo real
                {lastUpdated && (
                  <span className="last-updated">
                    Actualizado: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button 
              className={`btn ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Desactivar auto-refresh' : 'Activar auto-refresh'}
            >
              <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
              Auto-refresh
            </button>
            
            <button className="btn btn-secondary" onClick={loadDashboardData}>
              <RefreshCw size={18} />
            </button>
            
            <button className="btn btn-primary">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card pending">
              <div className="stat-icon">
                <Clock size={28} />
              </div>
              <div className="stat-content">
                <h3>{stats?.pending_count || 0}</h3>
                <p>Pendientes</p>
                <span className="stat-percentage">
                  {stats?.total_tickets ? Math.round((stats.pending_count / stats.total_tickets) * 100) : 0}%
                </span>
              </div>
              <div className="stat-trend">
                <ArrowUp size={16} />
                <span>+12%</span>
              </div>
            </div>

            <div className="stat-card in-progress">
              <div className="stat-icon">
                <Settings size={28} />
              </div>
              <div className="stat-content">
                <h3>{stats?.in_progress_count || 0}</h3>
                <p>En Proceso</p>
                <span className="stat-percentage">
                  {stats?.total_tickets ? Math.round((stats.in_progress_count / stats.total_tickets) * 100) : 0}%
                </span>
              </div>
              <div className="stat-trend">
                <ArrowDown size={16} />
                <span>-5%</span>
              </div>
            </div>

            <div className="stat-card resolved">
              <div className="stat-icon">
                <CheckCircle size={28} />
              </div>
              <div className="stat-content">
                <h3>{stats?.resolved_count || 0}</h3>
                <p>Resueltos</p>
                <span className="stat-percentage">
                  {stats?.resolution_rate || 0}%
                </span>
              </div>
              <div className="stat-trend">
                <ArrowUp size={16} />
                <span>+18%</span>
              </div>
            </div>

            <div className="stat-card critical">
              <div className="stat-icon">
                <AlertCircle size={28} />
              </div>
              <div className="stat-content">
                <h3>{stats?.critical_count || 0}</h3>
                <p>Críticos</p>
                <span className="stat-percentage">
                  {stats?.total_tickets ? Math.round((stats.critical_count / stats.total_tickets) * 100) : 0}%
                </span>
              </div>
              <div className="stat-trend">
                <ArrowDown size={16} />
                <span>-3%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts and Data Grid */}
        <div className="dashboard-grid">
          {/* Recent Tickets */}
          <section className="card recent-tickets">
            <div className="card-header">
              <h3>
                <FileText size={20} />
                Tickets Recientes
              </h3>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => navigate('/admin/tickets')}
              >
                Ver todos
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="card-content">
              <div className="tickets-list">
                {filteredTickets.slice(0, 8).map((ticket) => (
                  <div key={ticket.ID_Service_Request} className="ticket-item">
                    <div className="ticket-info">
                      <div className="ticket-header">
                        <span className="ticket-code">{ticket.Ticket_Code}</span>
                        <div className="ticket-badges">
                          <span 
                            className="priority-badge"
                            style={{ backgroundColor: getPriorityColor(ticket.System_Priority) }}
                          >
                            {ticket.System_Priority}
                          </span>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(ticket.Status) }}
                          >
                            {ticket.Status}
                          </span>
                        </div>
                      </div>
                      <h4 className="ticket-title">{ticket.Subject}</h4>
                      <div className="ticket-meta">
                        <span className="meta-item">
                          <MapPin size={14} />
                          {ticket.Office_Name}
                        </span>
                        <span className="meta-item">
                          <Wrench size={14} />
                          {ticket.Service_Name}
                        </span>
                        <span className="meta-item">
                          <Clock size={14} />
                          {ticket.Time_Ago}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-actions">
                      <button 
                        className="action-btn"
                        onClick={() => navigate(`/admin/tickets/${ticket.ID_Service_Request}`)}
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Priority Distribution */}
          <section className="card priority-distribution">
            <div className="card-header">
              <h3>
                <Target size={20} />
                Distribución por Prioridad
              </h3>
            </div>
            <div className="card-content">
              <div className="priority-chart">
                {priorityDistribution.map((priority) => (
                  <div key={priority.System_Priority} className="priority-item">
                    <div className="priority-bar">
                      <div 
                        className="priority-fill"
                        style={{ 
                          width: `${priority.percentage}%`,
                          backgroundColor: getPriorityColor(priority.System_Priority)
                        }}
                      />
                    </div>
                    <div className="priority-info">
                      <span className="priority-label">{priority.System_Priority}</span>
                      <span className="priority-count">{priority.count}</span>
                      <span className="priority-percentage">{priority.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Technician Performance */}
          <section className="card technician-performance">
            <div className="card-header">
              <h3>
                <Users size={20} />
                Rendimiento de Técnicos
              </h3>
              <button className="btn btn-sm btn-outline">
                Ver todos
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="card-content">
              <div className="technicians-list">
                {technicianPerformance.slice(0, 6).map((technician) => (
                  <div key={technician.ID_Technicians} className="technician-item">
                    <div className="technician-avatar">
                      {technician.technician_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="technician-info">
                      <h4>{technician.technician_name}</h4>
                      <p className="technician-email">{technician.Email}</p>
                      <div className="technician-stats">
                        <span className="stat">
                          <strong>{technician.resolved_tickets}</strong> resueltos
                        </span>
                        <span className="stat">
                          <strong>{technician.active_tickets}</strong> activos
                        </span>
                        <span className="stat">
                          <strong>{formatTime(technician.avg_resolution_hours)}</strong> promedio
                        </span>
                      </div>
                    </div>
                    <div className="technician-rating">
                      <Star size={16} className="filled" />
                      <span>4.8</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Assistance Requests Management */}
          <section className="card assistance-requests">
            <AdminAssistanceManagement onRequestsUpdate={(count) => {
              // Optionally update stats or show notification
              console.log('Pending assistance requests:', count);
            }} />
          </section>

          {/* Office Distribution */}
          <section className="card office-distribution">
            <div className="card-header">
              <h3>
                <MapPin size={20} />
                Tickets por Oficina
              </h3>
            </div>
            <div className="card-content">
              <div className="office-chart">
                {officeDistribution.slice(0, 5).map((office) => (
                  <div key={office.ID_Office} className="office-item">
                    <div className="office-info">
                      <h4>{office.Office_Name}</h4>
                      <p className="office-total">{office.ticket_count} tickets</p>
                    </div>
                    <div className="office-breakdown">
                      <div className="breakdown-item">
                        <span className="breakdown-label">Pendientes</span>
                        <span className="breakdown-count">{office.pending_count}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">En Proceso</span>
                        <span className="breakdown-count">{office.in_progress_count}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Resueltos</span>
                        <span className="breakdown-count">{office.resolved_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ModernAdminDashboard;
