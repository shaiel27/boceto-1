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
    criticalTickets: 0
  });
  
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  
  // PHP-PRO Data fetching from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from PHP backend
        const [ticketsResponse, techniciansResponse] = await Promise.all([
          ApiService.getTickets({ limit: 10 }),
          ApiService.getTechnicians()
        ]);

        // Update tickets with PHP-PRO structure
        if (ticketsResponse.success && ticketsResponse.data) {
          const transformedTickets = transformTicketData(ticketsResponse.data);
          setRecentTickets(transformedTickets);
          calculateStats(transformedTickets);
        }

        // Update technicians with PHP-PRO structure  
        if (techniciansResponse.success && techniciansResponse.data) {
          setTechnicians(transformTechnicianData(techniciansResponse.data));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
      id: `#T-${String(ticket.id || index + 1).padStart(5, '0')}`,
      subject: ticket.subject || ticket.title || `Ticket ${index + 1}`,
      office: ticket.office_name || ticket.office || 'General',
      priority: ticket.priority || 'Media',
      status: ticket.status || 'Pendiente',
      assignedTo: ticket.technician_name || ticket.assigned_to || 'Sin asignar',
      date: new Date(ticket.created_at || Date.now()).toLocaleDateString('es-VE')
    }));
  };

  const transformTechnicianData = (backendData: any[]): Technician[] => {
    return backendData.map((tech, index) => ({
      id: tech.id || index + 1,
      name: tech.name || tech.full_name || `Técnico ${index + 1}`,
      status: tech.status || 'available',
      currentTickets: tech.current_tickets || 0
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
      criticalTickets
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

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card main">
            <div className="kpi-icon">
              <Ticket size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Total Tickets</p>
              <h2 className="kpi-value">{stats.totalTickets}</h2>
            </div>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-icon">
              <AlertTriangle size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Críticos</p>
              <h2 className="kpi-value">{stats.criticalTickets}</h2>
            </div>
          </div>

          <div className="kpi-card info">
            <div className="kpi-icon">
              <Users size={32} />
            </div>
            <div className="kpi-content">
              <p className="kpi-label">Técnicos Activos</p>
              <h2 className="kpi-value">{stats.activeTechnicians}</h2>
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
                  <div className="bar-value">{stats.pendingTickets}</div>
                </div>
                <div className="bar-item">
                  <div className="bar-label">En Proceso</div>
                  <div className="bar-container">
                    <div className="bar-fill progress" style={{ width: `${inProgressPercent}%` }}></div>
                  </div>
                  <div className="bar-value">{stats.inProgressTickets}</div>
                </div>
                <div className="bar-item">
                  <div className="bar-label">Completados</div>
                  <div className="bar-container">
                    <div className="bar-fill completed" style={{ width: `${completedPercent}%` }}></div>
                  </div>
                  <div className="bar-value">{stats.completedTickets}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="chart-card">
            <h3>Tickets por Prioridad</h3>
            <div className="chart-content">
              <div className="priority-stats">
                <div className="priority-stat high">
                  <div className="priority-icon">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="priority-info">
                    <span className="priority-label">Alta</span>
                    <span className="priority-count">{recentTickets.filter(t => t.priority === 'Alta').length}</span>
                  </div>
                </div>
                <div className="priority-stat medium">
                  <div className="priority-icon">
                    <Clock size={24} />
                  </div>
                  <div className="priority-info">
                    <span className="priority-label">Media</span>
                    <span className="priority-count">{recentTickets.filter(t => t.priority === 'Media').length}</span>
                  </div>
                </div>
                <div className="priority-stat low">
                  <div className="priority-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="priority-info">
                    <span className="priority-label">Baja</span>
                    <span className="priority-count">{recentTickets.filter(t => t.priority === 'Baja').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technicians Performance */}
        <div className="chart-card full-width">
          <h3>Estado del Equipo Técnico</h3>
          <div className="chart-content">
            <div className="technicians-grid-visual">
              {technicians.slice(0, 6).map((tech) => (
                <div key={tech.id} className="technician-visual-card">
                  <div className="tech-visual-avatar">
                    <span>{tech.name.charAt(0)}</span>
                    <div className={`tech-status-indicator ${tech.status}`}></div>
                  </div>
                  <div className="tech-visual-info">
                    <span className="tech-visual-name">{tech.name.split(' ')[0]}</span>
                    <div className="tech-visual-metrics">
                      <span className="tech-ticket-count">{tech.currentTickets}</span>
                      <span className="tech-ticket-label">tickets</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Stats */}
            <div className="tech-quick-stats">
              <div className="tech-stat-item">
                <div className="tech-stat-icon available">
                  <CheckCircle size={20} />
                </div>
                <div className="tech-stat-info">
                  <span className="tech-stat-number">{technicians.filter(t => t.status === 'available').length}</span>
                  <span className="tech-stat-label">Disponibles</span>
                </div>
              </div>
              <div className="tech-stat-item">
                <div className="tech-stat-icon busy">
                  <Clock size={20} />
                </div>
                <div className="tech-stat-info">
                  <span className="tech-stat-number">{technicians.filter(t => t.status === 'busy').length}</span>
                  <span className="tech-stat-label">Ocupados</span>
                </div>
              </div>
              <div className="tech-stat-item">
                <div className="tech-stat-icon total">
                  <Users size={20} />
                </div>
                <div className="tech-stat-info">
                  <span className="tech-stat-number">{technicians.reduce((sum, t) => sum + t.currentTickets, 0)}</span>
                  <span className="tech-stat-label">Tickets Activos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="chart-card full-width">
          <h3>Resumen de Actividad Reciente</h3>
          <div className="chart-content">
            <div className="activity-summary">
              <div className="activity-item">
                <div className="activity-icon pending">
                  <Clock size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">Tickets Pendientes</span>
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
                  <span className="activity-label">Completados Hoy</span>
                  <span className="activity-value">{stats.completedTickets}</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon critical">
                  <AlertTriangle size={20} />
                </div>
                <div className="activity-info">
                  <span className="activity-label">Requieren Atención</span>
                  <span className="activity-value">{stats.criticalTickets}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
