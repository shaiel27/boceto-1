import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Plus,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Search,
  MapPin,
  Wrench,
  Eye,
  ChevronRight,
  X
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import { API_BASE_URL } from '../../services/api';
import './Dashboard.css';

interface DashboardStats {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  activeTechnicians: number;
  criticalTickets: number;
  todayCount: number;
  weekCount: number;
  avgResolutionHours: number | null;
  activeOffices: number;
  resolutionRate: number;
}

interface OfficeDistribution {
  office_name?: string;
  Office_Name?: string;
  name?: string;
  count: number;
  percentage: number;
}

interface ServiceDistribution {
  type_service?: string;
  Type_Service?: string;
  service?: string;
  count: number;
  percentage: number;
}

interface PriorityDistribution {
  system_priority?: string;
  priority?: string;
  count: number;
  percentage: number;
}

interface TrendData {
  date: string;
  count: number;
}

interface Ticket {
  id: string;
  subject: string;
  office: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En Proceso' | 'Cerrado';
  assignedTo: string;
  date: string;
  service?: string;
  timeAgo?: string;
  rawCreatedAt?: string;
}

interface Technician {
  id: number;
  name: string;
  status: 'available' | 'busy';
  currentTickets: number;
  totalCompleted?: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    activeTechnicians: 0,
    criticalTickets: 0,
    todayCount: 0,
    weekCount: 0,
    avgResolutionHours: null,
    activeOffices: 0,
    resolutionRate: 0
  });

  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [officeDistribution, setOfficeDistribution] = useState<OfficeDistribution[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<ServiceDistribution[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);

  const refreshCountRef = useRef(0);

  // ── Helper transforms (defined before useCallback that reference them) ──
  const transformTicketData = (backendData: any[]): Ticket[] => {
    return backendData.map((ticket, index) => ({
      id: ticket.Ticket_Code || `#T-${String(ticket.ID_Service_Request || index + 1).padStart(5, '0')}`,
      subject: ticket.Subject || ticket.subject || `Ticket ${index + 1}`,
      office: ticket.Office_Name || ticket.office_name || ticket.Name_Office || 'General',
      priority: ticket.System_Priority || ticket.priority || 'Media',
      status: ticket.Status || ticket.status || 'Pendiente',
      assignedTo: ticket.Technician_Names || ticket.technician_name || ticket.assigned_to || 'Sin asignar',
      date: new Date(ticket.Created_at || ticket.created_at || Date.now()).toLocaleDateString('es-VE'),
      service: ticket.Service_Name || ticket.Type_Service || ticket.type_service || ticket.service_name || ticket.service || '',
      timeAgo: ticket.Time_Ago || '',
      rawCreatedAt: ticket.Created_at || ticket.created_at || ''
    }));
  };

  const transformTechnicianData = (backendData: any[]): Technician[] => {
    return backendData.map((tech, index) => ({
      id: tech.ID_Technicians || tech.id || index + 1,
      name: tech.technician_name || tech.name || tech.full_name || `Técnico ${index + 1}`,
      status: tech.Status === 'Disponible' || tech.status === 'available' ? 'available' : 'busy',
      currentTickets: tech.active_tickets || tech.current_tickets || tech.assigned_tickets || 0,
      totalCompleted: tech.resolved_tickets || tech.totalCompleted || 0
    }));
  };

  // ── Data handling ──
  const applyResponseData = useCallback((data: any) => {
    setError(null);
    // 1. Backend stats as authoritative source
    if (data.stats) {
      const s = data.stats;
      setStats({
        totalTickets: s.total_tickets ?? 0,
        pendingTickets: s.pending_count ?? 0,
        inProgressTickets: s.in_progress_count ?? 0,
        completedTickets: s.resolved_count ?? 0,
        activeTechnicians: s.active_technicians ?? 0,
        criticalTickets: s.critical_count ?? 0,
        todayCount: s.today_count ?? 0,
        weekCount: s.week_count ?? 0,
        avgResolutionHours: s.avg_resolution_hours ?? null,
        activeOffices: s.active_offices ?? 0,
        resolutionRate: s.resolution_rate ?? 0
      });
    }
    // 2. Recent tickets
    if (data.recent_tickets) {
      const transformedTickets = transformTicketData(data.recent_tickets);
      setRecentTickets(transformedTickets);
      if (!data.stats) {
        const total = transformedTickets.length;
        const pending = transformedTickets.filter(t => t.status === 'Pendiente').length;
        const inProgress = transformedTickets.filter(t => t.status === 'En Proceso').length;
        const completed = transformedTickets.filter(t => t.status === 'Cerrado').length;
        const critical = transformedTickets.filter(t => t.priority === 'Alta' && t.status !== 'Cerrado').length;
        setStats(prev => ({
          ...prev,
          totalTickets: total,
          pendingTickets: pending,
          inProgressTickets: inProgress,
          completedTickets: completed,
          criticalTickets: critical,
          resolutionRate: total > 0 ? (completed / total) * 100 : 0
        }));
      }
    }
    if (data.technician_performance) {
      setTechnicians(transformTechnicianData(data.technician_performance));
    }
    if (data.office_distribution) {
      const base = data.stats?.total_tickets || 1;
      const mapped = data.office_distribution.map((o: any) => ({
        office_name: o.Name_Office || o.office_name || o.name,
        count: o.ticket_count || o.count || 0,
        percentage: Math.round(((o.ticket_count || o.count || 0) * 100) / base)
      }));
      setOfficeDistribution(mapped);
    }
    if (data.service_distribution) {
      const base = data.stats?.total_tickets || 1;
      const mapped = data.service_distribution.map((s: any) => ({
        type_service: s.Type_Service || s.type_service || s.service,
        count: s.ticket_count || s.count || 0,
        percentage: Math.round(((s.ticket_count || s.count || 0) * 100) / base)
      }));
      setServiceDistribution(mapped);
    }
    if (data.priority_distribution) {
      const mapped = data.priority_distribution.map((p: any) => ({
        system_priority: p.System_Priority || p.system_priority || p.priority,
        count: p.count || 0,
        percentage: p.percentage || 0
      }));
      setPriorityDistribution(mapped);
    }
    if (data.trends) {
      setTrends(data.trends);
    }
    setLastUpdated(new Date());
  }, []);

  const fetchDashboardData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard-public?action=full`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || body.message || `HTTP ${response.status}`);
      }
      return body;
    }
    throw new Error(`HTTP ${response.status} — ${response.statusText}`);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await fetchDashboardData();
      if (json.success && json.data) {
        applyResponseData(json.data);
      } else {
        throw new Error(json.message || 'Respuesta inválida del servidor');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión al servidor';
      console.error('[Dashboard] Error en carga inicial:', msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    refreshCountRef.current += 1;
    const mark = refreshCountRef.current;
    try {
      const json = await fetchDashboardData();
      if (mark !== refreshCountRef.current) return;
      if (json.success && json.data) {
        applyResponseData(json.data);
      }
    } catch (err) {
      if (mark === refreshCountRef.current) {
        const msg = err instanceof Error ? err.message : 'Error de conexión';
        console.warn('[Dashboard] Error en actualización:', msg);
        setError(msg);
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await refreshDashboardData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(refreshDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (): string => {
    if (!lastUpdated) return '';
    const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (secs < 5) return 'Ahora';
    if (secs < 60) return `Actualizado hace ${secs}s`;
    const mins = Math.floor(secs / 60);
    return `Actualizado hace ${mins}min`;
  };

  const handleCreateTicket = () => navigate('/new-ticket');
  const handleViewTicket = (ticket: Ticket) => setSelectedTicket(ticket);
  const handleCloseModal = () => setSelectedTicket(null);
  const handleGoToTicket = (id: string) => navigate(`/admin/tickets?search=${encodeURIComponent(id)}`);

  const filteredTickets = recentTickets.filter(t =>
    !searchTerm || t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.office.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="dash-layout">
        <ModernSidebar />
        <main className="dash-main">
          <div className="dash-loading">
            <RefreshCw size={24} />
            <p>Cargando datos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !lastUpdated) {
    return (
      <div className="dash-layout">
        <ModernSidebar />
        <main className="dash-main">
          <div className="dash-error">
            <AlertTriangle size={48} />
            <h2>Error al cargar el dashboard</h2>
            <p>{error}</p>
            <button className="dash-btn dash-btn-primary" onClick={loadDashboardData}>
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  const totalForPercentage = stats.totalTickets || 1;
  const pendingPercent = Math.round((stats.pendingTickets / totalForPercentage) * 100);
  const inProgressPercent = Math.round((stats.inProgressTickets / totalForPercentage) * 100);
  const completedPercent = Math.round((stats.completedTickets / totalForPercentage) * 100);

  return (
    <div className="dash-layout">
      <ModernSidebar />
      <main className="dash-main">
        {error && (
          <div className="dash-error-banner">
            <AlertTriangle size={14} />
            <span>{error}</span>
            <button className="dash-btn dash-btn-sm dash-btn-ghost" onClick={handleManualRefresh}>
              Reintentar
            </button>
          </div>
        )}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h1>Dashboard</h1>
            <span className="dash-subtitle">Sistema de Gestión de Tickets</span>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {lastUpdated && <span className="dash-last-updated">{formatLastUpdated()}</span>}
            <button
              className={`dash-btn dash-btn-ghost ${isRefreshing ? 'dash-btn-spinning' : ''}`}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Actualizar datos"
            >
              <RefreshCw size={18} />
            </button>
            <button className="dash-btn dash-btn-primary" onClick={handleCreateTicket}>
              <Plus size={18} />
              Nuevo Ticket
            </button>
          </div>
        </header>

        <div className="dash-kpi-grid">
          <div className="dash-kpi dash-kpi-total">
            <div className="dash-kpi-top">
              <div className="dash-kpi-icon"><Ticket size={22} /></div>
              <span className="dash-kpi-value">{stats.totalTickets}</span>
            </div>
            <span className="dash-kpi-label">Total Tickets</span>
            <span className="dash-kpi-sub">Últimos 30 días</span>
          </div>
          <div className="dash-kpi dash-kpi-pending">
            <div className="dash-kpi-top">
              <div className="dash-kpi-icon"><Clock size={22} /></div>
              <span className="dash-kpi-value">{stats.pendingTickets}</span>
            </div>
            <span className="dash-kpi-label">Pendientes</span>
            <span className="dash-kpi-sub">{pendingPercent}% del total</span>
          </div>
          <div className="dash-kpi dash-kpi-progress">
            <div className="dash-kpi-top">
              <div className="dash-kpi-icon"><Activity size={22} /></div>
              <span className="dash-kpi-value">{stats.inProgressTickets}</span>
            </div>
            <span className="dash-kpi-label">En Proceso</span>
            <span className="dash-kpi-sub">{inProgressPercent}% del total</span>
          </div>
          <div className="dash-kpi dash-kpi-resolved">
            <div className="dash-kpi-top">
              <div className="dash-kpi-icon"><CheckCircle size={22} /></div>
              <span className="dash-kpi-value">{stats.completedTickets}</span>
            </div>
            <span className="dash-kpi-label">Completados</span>
            <span className="dash-kpi-sub">{stats.resolutionRate.toFixed(1)}% tasa</span>
          </div>
          <div className="dash-kpi dash-kpi-critical">
            <div className="dash-kpi-top">
              <div className="dash-kpi-icon"><AlertTriangle size={22} /></div>
              <span className="dash-kpi-value">{stats.criticalTickets}</span>
            </div>
            <span className="dash-kpi-label">Críticos</span>
            <span className="dash-kpi-sub">Requieren atención</span>
          </div>
          <div className="dash-kpi dash-kpi-technicians">
            <div className="dash-kpi-top">
              <div className="dash-kpi-icon"><Users size={22} /></div>
              <span className="dash-kpi-value">{stats.activeTechnicians}</span>
            </div>
            <span className="dash-kpi-label">Técnicos Activos</span>
            <span className="dash-kpi-sub">{stats.avgResolutionHours ? `${stats.avgResolutionHours.toFixed(1)}h promedio` : 'Disponibles'}</span>
          </div>
        </div>

        <div className="dash-grid">
          <section className="dash-card dash-card-tickets">
            <div className="dash-card-head">
              <h3><BarChart3 size={18} /> Actividad Reciente</h3>
            </div>
            <div className="dash-card-body">
              <div className="dash-activity-grid">
                <div className="dash-activity-item">
                  <Clock size={20} />
                  <div>
                    <strong>{stats.todayCount}</strong>
                    <span>Hoy</span>
                  </div>
                </div>
                <div className="dash-activity-item">
                  <TrendingUp size={20} />
                  <div>
                    <strong>{stats.weekCount}</strong>
                    <span>Esta semana</span>
                  </div>
                </div>
                <div className="dash-activity-item">
                  <BarChart3 size={20} />
                  <div>
                    <strong>{stats.activeOffices}</strong>
                    <span>Oficinas activas</span>
                  </div>
                </div>
                <div className="dash-activity-item">
                  <Clock size={20} />
                  <div>
                    <strong>{stats.avgResolutionHours ? `${stats.avgResolutionHours.toFixed(1)}h` : 'N/A'}</strong>
                    <span>Tiempo promedio</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="dash-card dash-card-chart">
            <div className="dash-card-head">
              <h3><BarChart3 size={18} /> Distribución por Estado</h3>
            </div>
            <div className="dash-card-body">
              <div className="dash-bar-list">
                <div className="dash-bar-item">
                  <div className="dash-bar-label">
                    <span>Pendientes</span>
                    <span>{stats.pendingTickets} ({pendingPercent}%)</span>
                  </div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill dash-bar-pending" style={{ width: `${pendingPercent}%` }} />
                  </div>
                </div>
                <div className="dash-bar-item">
                  <div className="dash-bar-label">
                    <span>En Proceso</span>
                    <span>{stats.inProgressTickets} ({inProgressPercent}%)</span>
                  </div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill dash-bar-progress" style={{ width: `${inProgressPercent}%` }} />
                  </div>
                </div>
                <div className="dash-bar-item">
                  <div className="dash-bar-label">
                    <span>Completados</span>
                    <span>{stats.completedTickets} ({completedPercent}%)</span>
                  </div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill dash-bar-completed" style={{ width: `${completedPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {priorityDistribution.length > 0 && (
            <section className="dash-card dash-card-priority">
              <div className="dash-card-head">
                <h3><AlertTriangle size={18} /> Tickets por Prioridad</h3>
              </div>
              <div className="dash-card-body">
                {priorityDistribution.map((p, i) => {
                  const name = p.system_priority || p.priority || 'Media';
                  const color = name === 'Crítica' ? '#EF4444' : name === 'Alta' ? '#F59E0B' : name === 'Media' ? '#2563EB' : '#10B981';
                  return (
                    <div key={i} className="dash-bar-item">
                      <div className="dash-bar-label">
                        <span>{name}</span>
                        <span>{p.count} ({p.percentage}%)</span>
                      </div>
                      <div className="dash-bar-track">
                        <div className="dash-bar-fill" style={{ width: `${p.percentage}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {officeDistribution.length > 0 && (
            <section className="dash-card dash-card-offices">
              <div className="dash-card-head">
                <h3><MapPin size={18} /> Tickets por Oficina</h3>
              </div>
              <div className="dash-card-body">
                {officeDistribution.slice(0, 6).map((office, idx) => (
                  <div key={idx} className="dash-dist-row">
                    <div className="dash-dist-info">
                      <span className="dash-dist-name">{office.office_name || office.Office_Name || office.name || `Oficina ${idx + 1}`}</span>
                      <span className="dash-dist-count">{office.count} tickets</span>
                    </div>
                    <div className="dash-dist-bar">
                      <div className="dash-dist-fill" style={{ width: `${office.percentage}%` }} />
                    </div>
                    <span className="dash-dist-pct">{office.percentage}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {serviceDistribution.length > 0 && (
            <section className="dash-card dash-card-services">
              <div className="dash-card-head">
                <h3><Wrench size={18} /> Tickets por Servicio</h3>
              </div>
              <div className="dash-card-body">
                {serviceDistribution.slice(0, 6).map((service, idx) => (
                  <div key={idx} className="dash-dist-row">
                    <div className="dash-dist-info">
                      <span className="dash-dist-name">{service.type_service || service.Type_Service || service.service || `Servicio ${idx + 1}`}</span>
                      <span className="dash-dist-count">{service.count} tickets</span>
                    </div>
                    <div className="dash-dist-bar">
                      <div className="dash-dist-fill dash-dist-service" style={{ width: `${service.percentage}%` }} />
                    </div>
                    <span className="dash-dist-pct">{service.percentage}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <section className="dash-card dash-card-table">
          <div className="dash-card-head">
            <h3><Ticket size={18} /> Tickets Recientes</h3>
            <button className="dash-btn dash-btn-sm dash-btn-ghost" onClick={() => navigate('/admin/tickets')}>
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="dash-card-body dash-card-body-nopad">
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Asunto</th>
                    <th>Oficina</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Asignado a</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.slice(0, 10).map((ticket) => (
                    <tr key={ticket.id} onClick={() => handleViewTicket(ticket)} className="dash-table-row">
                      <td><span className="dash-code">{ticket.id}</span></td>
                      <td className="dash-subject-cell">{ticket.subject}</td>
                      <td>{ticket.office}</td>
                      <td>
                        <span className={`dash-badge ${(ticket.priority || 'baja').toLowerCase() === 'alta' ? 'dash-badge-high' : (ticket.priority || 'baja').toLowerCase() === 'crítica' ? 'dash-badge-critical' : (ticket.priority || 'baja').toLowerCase() === 'media' ? 'dash-badge-medium' : 'dash-badge-low'}`}>
                          {ticket.priority || 'Sin prioridad'}
                        </span>
                      </td>
                      <td>
                        <span className={`dash-badge ${ticket.status === 'Pendiente' ? 'dash-badge-pending' : ticket.status === 'En Proceso' ? 'dash-badge-progress' : 'dash-badge-done'}`}>
                          {ticket.status || 'Sin estado'}
                        </span>
                      </td>
                      <td>{ticket.assignedTo}</td>
                      <td className="dash-date-cell">{ticket.date}</td>
                      <td><Eye size={15} className="dash-view-icon" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {technicians.length > 0 && (
          <section className="dash-card dash-card-table">
            <div className="dash-card-head">
              <h3><Users size={18} /> Rendimiento del Equipo Técnico</h3>
            </div>
            <div className="dash-card-body">
              <div className="dash-tech-chart">
                {technicians.slice(0, 5).map((tech, idx) => {
                  const maxTickets = Math.max(...technicians.map(t => t.currentTickets + (t.totalCompleted || 0)), 1);
                  const total = tech.currentTickets + (tech.totalCompleted || 0);
                  const resolvedPct = tech.totalCompleted ? Math.round((tech.totalCompleted / Math.max(total, 1)) * 100) : 0;
                  const activePct = total > 0 ? Math.round((tech.currentTickets / total) * 100) : 0;
                  const barWidth = Math.round((total / maxTickets) * 100);
                  return (
                    <div key={tech.id} className="dash-tech-bar-row" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <div className="dash-tech-bar-info">
                        <span className="dash-tech-bar-avatar">{tech.name.charAt(0)}</span>
                        <div className="dash-tech-bar-meta">
                          <span className="dash-tech-bar-name">{tech.name}</span>
                          <span className="dash-tech-bar-badge">
                            <span className={`dash-tech-dot ${tech.status === 'available' ? 'dash-tech-dot-avail' : 'dash-tech-dot-busy'}`} />
                            {tech.status === 'available' ? 'Disponible' : 'Ocupado'}
                          </span>
                        </div>
                      </div>
                      <div className="dash-tech-bar-track-wrap">
                        <div className="dash-tech-bar-track">
                          <div
                            className="dash-tech-bar-resolved"
                            style={{ width: `${resolvedPct}%` }}
                            title={`Resueltos: ${tech.totalCompleted || 0}`}
                          />
                          <div
                            className="dash-tech-bar-active"
                            style={{ width: `${activePct}%` }}
                            title={`Activos: ${tech.currentTickets}`}
                          />
                        </div>
                        <span className="dash-tech-bar-total">{total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="dash-tech-chart-legend">
                <span><span className="dash-tech-dot-lg dash-tech-dot-lg-resolved" />Resueltos</span>
                <span><span className="dash-tech-dot-lg dash-tech-dot-lg-active" />Activos</span>
                <span>Total de tickets asignados (últimos 30 días)</span>
              </div>
            </div>
          </section>
        )}

        {selectedTicket && (
          <div className="dash-modal-overlay" onClick={handleCloseModal}>
            <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
              <div className="dash-modal-head">
                <div>
                  <span className="dash-modal-code">{selectedTicket.id}</span>
                  <h2 className="dash-modal-title">{selectedTicket.subject}</h2>
                </div>
                <button className="dash-modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="dash-modal-body">
                <div className="dash-modal-grid">
                  <div className="dash-modal-field">
                    <span className="dash-modal-label">Estado</span>
                    <span className={`dash-badge ${selectedTicket.status === 'Pendiente' ? 'dash-badge-pending' : selectedTicket.status === 'En Proceso' ? 'dash-badge-progress' : 'dash-badge-done'}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div className="dash-modal-field">
                    <span className="dash-modal-label">Prioridad</span>
                    <span className={`dash-badge ${(selectedTicket.priority || 'baja').toLowerCase() === 'alta' ? 'dash-badge-high' : (selectedTicket.priority || 'baja').toLowerCase() === 'crítica' ? 'dash-badge-critical' : (selectedTicket.priority || 'baja').toLowerCase() === 'media' ? 'dash-badge-medium' : 'dash-badge-low'}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div className="dash-modal-field">
                    <span className="dash-modal-label">Oficina</span>
                    <span className="dash-modal-value"><MapPin size={14} /> {selectedTicket.office}</span>
                  </div>
                  <div className="dash-modal-field">
                    <span className="dash-modal-label">Servicio</span>
                    <span className="dash-modal-value"><Wrench size={14} /> {selectedTicket.service && selectedTicket.service !== 'No asignado' ? selectedTicket.service : 'Sin asignar'}</span>
                  </div>
                  <div className="dash-modal-field">
                    <span className="dash-modal-label">Asignado a</span>
                    <span className="dash-modal-value"><Users size={14} /> {selectedTicket.assignedTo}</span>
                  </div>
                  <div className="dash-modal-field">
                    <span className="dash-modal-label">Fecha</span>
                    <span className="dash-modal-value"><Clock size={14} /> {selectedTicket.date} {selectedTicket.timeAgo && `(${selectedTicket.timeAgo})`}</span>
                  </div>
                </div>
              </div>
              <div className="dash-modal-foot">
                <button className="dash-btn dash-btn-ghost" onClick={handleCloseModal}>
                  Cerrar
                </button>
                <button className="dash-btn dash-btn-primary" onClick={() => handleGoToTicket(selectedTicket.id)}>
                  <Eye size={16} />
                  Ver ticket completo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
