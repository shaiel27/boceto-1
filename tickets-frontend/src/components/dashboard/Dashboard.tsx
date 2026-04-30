import React, { useState, useEffect } from 'react';
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
  TrendingUp
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import ApiService from '../../services/api';
import '../layout/ModernSidebar.css';
import './Dashboard.css';

// Types for PHP-PRO integration
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
  office_name: string;
  count: number;
  percentage: number;
}

interface ServiceDistribution {
  type_service: string;
  count: number;
  percentage: number;
}

interface PriorityDistribution {
  system_priority: string;
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
  
  // PHP-PRO state management
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
  
  // PHP-PRO Data fetching from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const token = sessionStorage.getItem('auth_token');
        console.log('🔍 Dashboard: Fetching data from backend');
        console.log('🔍 Dashboard: Token exists:', !!token);
        console.log('🔍 Dashboard: Token value:', token ? token.substring(0, 20) + '...' : 'none');
        
        // Fetch optimized dashboard data from PHP-PRO AdminDashboardController
        const response = await fetch('http://localhost:8000/api/dashboard-public-temp?action=full', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('🔍 Dashboard: Response status:', response.status);
        console.log('🔍 Dashboard: Response ok:', response.ok);

        const data = await response.json();
        console.log('🔍 Dashboard: Response data:', data);

        if (data.success && data.data) {
          console.log('✅ Dashboard: Data received successfully');
          console.log('📊 Dashboard: Stats:', data.data.stats);
          console.log('📊 Dashboard: Recent tickets count:', data.data.recent_tickets?.length);
          console.log('📊 Dashboard: Technicians count:', data.data.technician_performance?.length);
          
          // Update tickets with PHP-PRO structure
          if (data.data.recent_tickets) {
            const transformedTickets = transformTicketData(data.data.recent_tickets);
            setRecentTickets(transformedTickets);
            calculateStats(transformedTickets);
          }

          // Update technicians with PHP-PRO structure
          if (data.data.technician_performance) {
            setTechnicians(transformTechnicianData(data.data.technician_performance));
          }

          // Update stats from backend if available
          if (data.data.stats) {
            setStats({
              totalTickets: data.data.stats.total_tickets || 0,
              pendingTickets: data.data.stats.pending_count || 0,
              inProgressTickets: data.data.stats.in_progress_count || 0,
              completedTickets: data.data.stats.resolved_count || 0,
              activeTechnicians: data.data.stats.active_technicians || 0,
              criticalTickets: data.data.stats.critical_count || 0,
              todayCount: data.data.stats.today_count || 0,
              weekCount: data.data.stats.week_count || 0,
              avgResolutionHours: data.data.stats.avg_resolution_hours || null,
              activeOffices: data.data.stats.active_offices || 0,
              resolutionRate: data.data.stats.resolution_rate || 0
            });
          }

          // Update distributions
          if (data.data.office_distribution) {
            setOfficeDistribution(data.data.office_distribution);
          }
          if (data.data.service_distribution) {
            setServiceDistribution(data.data.service_distribution);
          }
          if (data.data.priority_distribution) {
            setPriorityDistribution(data.data.priority_distribution);
          }
          if (data.data.trends) {
            setTrends(data.data.trends);
          }
        } else {
          console.warn('⚠️ Dashboard: Backend returned success=false or no data');
          console.warn('⚠️ Dashboard: Response:', data);
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching dashboard data from backend:', error);
        console.warn('⚠️ Dashboard: Backend server not available. Please start PHP server with: cd tickets-backend && php -S localhost:8000 -t public');
        
        // Fallback to mock data when backend is not available
        const mockTickets: Ticket[] = [
          {
            id: '#T-00001',
            subject: 'Error de conexión a base de datos',
            office: 'Sistemas',
            priority: 'Alta',
            status: 'Pendiente',
            assignedTo: 'Sin asignar',
            date: new Date().toLocaleDateString('es-VE')
          }
        ];
        
        const mockTechnicians: Technician[] = [
          {
            id: 1,
            name: 'Servidor no disponible',
            status: 'busy',
            currentTickets: 0
          }
        ];
        
        setRecentTickets(mockTickets);
        setTechnicians(mockTechnicians);
        setStats({
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Transform backend data to frontend format (PHP-PRO pattern)
  const transformTicketData = (backendData: any[]): Ticket[] => {
    return backendData.map((ticket, index) => ({
      id: ticket.Ticket_Code || `#T-${String(ticket.ID_Service_Request || index + 1).padStart(5, '0')}`,
      subject: ticket.Subject || ticket.subject || `Ticket ${index + 1}`,
      office: ticket.Office_Name || ticket.office_name || ticket.Name_Office || 'General',
      priority: ticket.System_Priority || ticket.priority || 'Media',
      status: ticket.Status || ticket.status || 'Pendiente',
      assignedTo: ticket.Technician_Names || ticket.technician_name || ticket.assigned_to || 'Sin asignar',
      date: new Date(ticket.Created_at || ticket.created_at || Date.now()).toLocaleDateString('es-VE')
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

  const calculateStats = (tickets: Ticket[]) => {
    const totalTickets = tickets.length;
    const pendingTickets = tickets.filter(t => t.status === 'Pendiente').length;
    const inProgressTickets = tickets.filter(t => t.status === 'En Proceso').length;
    const completedTickets = tickets.filter(t => t.status === 'Cerrado').length;
    const criticalTickets = tickets.filter(t => t.priority === 'Alta' && t.status !== 'Cerrado').length;
    const activeTechnicians = technicians.filter(t => t.status === 'available').length;

    setStats({
      totalTickets,
      pendingTickets,
      inProgressTickets,
      completedTickets,
      activeTechnicians,
      criticalTickets,
      todayCount: 0,
      weekCount: 0,
      avgResolutionHours: null,
      activeOffices: 0,
      resolutionRate: totalTickets > 0 ? (completedTickets / totalTickets) * 100 : 0
    });
  };

  const handleCreateTicket = () => navigate('/new-ticket');
  const handleViewTicket = (id: string) => navigate(`/tickets/${id}`);

  if (isLoading) {
    return (
      <div className="minimal-dashboard">
        <ModernSidebar />
        <main className="minimal-main">
          <div className="loading-state">
            <RefreshCw className="spinner" size={24} />
            <p>Cargando datos...</p>
          </div>
        </main>
      </div>
    );
  }

  // Calculate percentages for charts
  const totalForPercentage = stats.totalTickets || 1;
  const pendingPercent = Math.round((stats.pendingTickets / totalForPercentage) * 100);
  const inProgressPercent = Math.round((stats.inProgressTickets / totalForPercentage) * 100);
  const completedPercent = Math.round((stats.completedTickets / totalForPercentage) * 100);

  const maxTickets = Math.max(...technicians.map(t => t.currentTickets), 1);

  return (
    <div className="minimal-dashboard">
      <ModernSidebar />
      <main className="minimal-main">
        <header className="minimal-header">
          <div>
            <h1>Dashboard Administrativo</h1>
            <p>Sistema de Gestión de Tickets - Alcaldía de San Cristóbal</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={18} />
              Actualizar
            </button>
            <button className="btn-primary" onClick={handleCreateTicket}>
              <Plus size={18} />
              Nuevo Ticket
            </button>
          </div>
        </header>

        {/* Extended KPI Cards */}
        <div className="kpi-grid-extended">
          <div className="kpi-card main">
            <div className="kpi-icon">
              <Ticket size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Total Tickets</p>
              <h2 className="kpi-value">{stats.totalTickets}</h2>
              <p className="kpi-sublabel">Últimos 30 días</p>
            </div>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-icon">
              <AlertTriangle size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Críticos</p>
              <h2 className="kpi-value">{stats.criticalTickets}</h2>
              <p className="kpi-sublabel">Requieren atención</p>
            </div>
          </div>

          <div className="kpi-card info">
            <div className="kpi-icon">
              <Users size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Técnicos Activos</p>
              <h2 className="kpi-value">{stats.activeTechnicians}</h2>
              <p className="kpi-sublabel">Disponibles</p>
            </div>
          </div>

          <div className="kpi-card success">
            <div className="kpi-icon">
              <CheckCircle size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Tasa de Resolución</p>
              <h2 className="kpi-value">{stats.resolutionRate.toFixed(1)}%</h2>
              <p className="kpi-sublabel">Completados</p>
            </div>
          </div>

          <div className="kpi-card info">
            <div className="kpi-icon">
              <Clock size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Tiempo Promedio</p>
              <h2 className="kpi-value">{stats.avgResolutionHours ? `${stats.avgResolutionHours.toFixed(1)}h` : 'N/A'}</h2>
              <p className="kpi-sublabel">Resolución</p>
            </div>
          </div>

          <div className="kpi-card info">
            <div className="kpi-icon">
              <BarChart3 size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Oficinas Activas</p>
              <h2 className="kpi-value">{stats.activeOffices}</h2>
              <p className="kpi-sublabel">Con tickets</p>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="chart-card full-width">
          <h3>Resumen de Actividad</h3>
          <div className="chart-content">
            <div className="activity-summary-extended">
              <div className="activity-item">
                <div className="activity-icon today">
                  <Clock size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">Hoy</span>
                  <span className="activity-value">{stats.todayCount}</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon week">
                  <TrendingUp size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">Esta Semana</span>
                  <span className="activity-value">{stats.weekCount}</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon pending">
                  <Clock size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">Pendientes</span>
                  <span className="activity-value">{stats.pendingTickets}</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon progress">
                  <Activity size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">En Proceso</span>
                  <span className="activity-value">{stats.inProgressTickets}</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon completed">
                  <CheckCircle size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">Completados</span>
                  <span className="activity-value">{stats.completedTickets}</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon critical">
                  <AlertTriangle size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">Críticos</span>
                  <span className="activity-value">{stats.criticalTickets}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Status Distribution Chart */}
          <div className="chart-card">
            <h3>Distribución por Estado</h3>
            <div className="chart-content">
              <div className="bar-chart">
                <div className="bar-item">
                  <div className="bar-label">Pendientes</div>
                  <div className="bar-container">
                    <div className="bar-fill pending" style={{ width: `${pendingPercent}%` }}></div>
                  </div>
                  <div className="bar-value">{stats.pendingTickets} ({pendingPercent}%)</div>
                </div>
                <div className="bar-item">
                  <div className="bar-label">En Proceso</div>
                  <div className="bar-container">
                    <div className="bar-fill progress" style={{ width: `${inProgressPercent}%` }}></div>
                  </div>
                  <div className="bar-value">{stats.inProgressTickets} ({inProgressPercent}%)</div>
                </div>
                <div className="bar-item">
                  <div className="bar-label">Completados</div>
                  <div className="bar-container">
                    <div className="bar-fill completed" style={{ width: `${completedPercent}%` }}></div>
                  </div>
                  <div className="bar-value">{stats.completedTickets} ({completedPercent}%)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="chart-card">
            <h3>Tickets por Prioridad</h3>
            <div className="chart-content">
              <div className="priority-stats">
                {priorityDistribution.map((p, idx) => {
                  const priority = p.system_priority || 'Media';
                  const priorityLower = priority.toLowerCase();
                  return (
                    <div key={idx} className={`priority-stat ${priorityLower}`}>
                      <div className="priority-icon">
                        {priority === 'Crítica' || priority === 'Alta' ? <AlertTriangle size={24} /> :
                         priority === 'Media' ? <Clock size={24} /> : <CheckCircle size={24} />}
                      </div>
                      <div className="priority-info">
                        <span className="priority-label">{priority}</span>
                        <span className="priority-count">{p.count} ({p.percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Office and Service Distribution */}
        <div className="charts-row">
          {/* Office Distribution */}
          <div className="chart-card">
            <h3>Tickets por Oficina</h3>
            <div className="chart-content">
              <div className="distribution-list">
                {officeDistribution.slice(0, 5).map((office, idx) => (
                  <div key={idx} className="distribution-item">
                    <div className="distribution-label">{office.office_name || 'Sin nombre'}</div>
                    <div className="distribution-bar">
                      <div className="distribution-fill" style={{ width: `${office.percentage}%` }}></div>
                    </div>
                    <div className="distribution-value">{office.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="chart-card">
            <h3>Tickets por Servicio</h3>
            <div className="chart-content">
              <div className="distribution-list">
                {serviceDistribution.slice(0, 5).map((service, idx) => (
                  <div key={idx} className="distribution-item">
                    <div className="distribution-label">{service.type_service || 'Sin servicio'}</div>
                    <div className="distribution-bar">
                      <div className="distribution-fill service" style={{ width: `${service.percentage}%` }}></div>
                    </div>
                    <div className="distribution-value">{service.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technicians Performance */}
        <div className="chart-card full-width">
          <h3>Rendimiento del Equipo Técnico</h3>
          <div className="chart-content">
            <div className="technicians-table">
              <table>
                <thead>
                  <tr>
                    <th>Técnico</th>
                    <th>Estado</th>
                    <th>Tickets Activos</th>
                    <th>Resueltos</th>
                    <th>Tiempo Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {technicians.slice(0, 8).map((tech) => (
                    <tr key={tech.id}>
                      <td>{tech.name}</td>
                      <td>
                        <span className={`status-badge ${tech.status}`}>
                          {tech.status === 'available' ? 'Disponible' : 'Ocupado'}
                        </span>
                      </td>
                      <td>{tech.currentTickets}</td>
                      <td>{tech.totalCompleted || 0}</td>
                      <td>-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Tickets Table */}
        <div className="chart-card full-width">
          <h3>Tickets Recientes</h3>
          <div className="chart-content">
            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Asunto</th>
                    <th>Oficina</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Asignado a</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.slice(0, 10).map((ticket) => (
                    <tr key={ticket.id} onClick={() => handleViewTicket(ticket.id)} className="clickable-row">
                      <td>{ticket.id}</td>
                      <td>{ticket.subject}</td>
                      <td>{ticket.office}</td>
                      <td>
                        <span className={`priority-badge ${(ticket.priority || 'baja').toLowerCase()}`}>
                          {ticket.priority || 'Sin prioridad'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${ticket.status === 'Pendiente' ? 'pending' : ticket.status === 'En Proceso' ? 'progress' : 'completed'}`}>
                          {ticket.status || 'Sin estado'}
                        </span>
                      </td>
                      <td>{ticket.assignedTo}</td>
                      <td>{ticket.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
