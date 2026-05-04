import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Download,
  Calendar,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Target,
  Zap,
  Award,
  Timer,
  Star,
  UserCheck,
  UserX,
  Briefcase,
  FileText,
  Settings
} from 'lucide-react';
import { ApiService } from '../../services/api';
import ModernSidebar from '../layout/ModernSidebar';
import '../layout/ModernSidebar.css';
import './Dashboard.css';
import './Reports.css';

interface TechnicianData {
  technician_id: number;
  technician_name: string;
  technician_status: string;
  primary_service: string;
  total_tickets_assigned: number;
  tickets_resolved: number;
  tickets_in_progress: number;
  pending_tickets: number;
  avg_resolution_time: number;
  resolution_rate: number;
  high_priority_resolved: number;
  total_assignments: number;
  efficiency_score: number;
}

interface ReportOverview {
  total_technicians: number;
  active_technicians: number;
  inactive_technicians: number;
  total_tickets: number;
  resolved_tickets: number;
  resolution_rate: number;
  avg_resolution_time: number;
  report_period_days: number;
  generated_at: string;
}

interface ServiceData {
  service_name: string;
  technician_count: number;
  ticket_count: number;
  avg_resolution_time: number;
}

interface TechnicianReport {
  overview: ReportOverview;
  technicians: TechnicianData[];
  service_distribution: ServiceData[];
}

const TechnicianReport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<TechnicianReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    technicians: true,
    services: true
  });

  useEffect(() => {
    fetchTechnicianReport();
  }, [dateRange, selectedTechnician]);

  const fetchTechnicianReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getWeeklyTechnicianReport('', selectedTechnician || undefined);
      
      if (response.success && response.data) {
        setReportData(response.data);
      } else {
        setError(response.message || 'Error al cargar el reporte');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting technician report as ${format}`);
    // Implement export functionality
  };

  const filteredTechnicians = reportData?.technicians.filter(tech =>
    tech.technician_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.primary_service.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo': return UserCheck;
      case 'inactivo': return UserX;
      default: return Users;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo': return 'green';
      case 'inactivo': return 'red';
      default: return 'gray';
    }
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getWorkloadLevel = (pending: number, inProgress: number) => {
    const total = pending + inProgress;
    if (total >= 10) return { level: 'Crítico', color: 'red' };
    if (total >= 7) return { level: 'Alto', color: 'orange' };
    if (total >= 4) return { level: 'Medio', color: 'yellow' };
    if (total >= 1) return { level: 'Bajo', color: 'blue' };
    return { level: 'Sin carga', color: 'green' };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <ModernSidebar />
        <main className="main-content-area">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando reporte de técnicos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ModernSidebar />
        <main className="main-content-area">
          <div className="error-container">
            <AlertTriangle size={48} />
            <h3>Error al cargar el reporte</h3>
            <p>{error}</p>
            <button className="enterprise-btn primary" onClick={fetchTechnicianReport}>
              <RefreshCw size={18} />
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container reports-enterprise">
      <ModernSidebar />
      
      <main className="main-content-area">
        {/* Header */}
        <div className="reports-header">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => navigate('/admin/reports')}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="header-icon-wrapper">
              <Users size={32} className="header-icon" />
            </div>
            <div className="header-text">
              <h1 className="header-title">Reporte de Técnicos</h1>
              <p className="header-subtitle">Análisis detallado del rendimiento y carga de trabajo</p>
            </div>
          </div>
          <div className="header-right">
            <div className="date-range-selector">
              <label>Período:</label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="form-input"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 90 días</option>
                <option value={365}>Último año</option>
              </select>
            </div>
            <button 
              className="enterprise-btn secondary"
              onClick={() => handleExportReport('pdf')}
            >
              <Download size={18} />
              Exportar PDF
            </button>
            <button 
              className="enterprise-btn primary"
              onClick={fetchTechnicianReport}
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Overview Section */}
        <div className="enterprise-section">
          <div className="section-header-wrapper">
            <div className="section-header-content">
              <div className="section-icon">
                <Target size={24} />
              </div>
              <div>
                <h3 className="section-title">Resumen General</h3>
                <p className="section-description">Métricas clave del equipo técnico</p>
              </div>
            </div>
            <button 
              className="collapse-btn"
              onClick={() => toggleSection('overview')}
            >
              {expandedSections.overview ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        {expandedSections.overview && reportData && (
          <div className="enterprise-stats-grid">
            <div className="enterprise-stat-card stat-blue">
              <div className="stat-background-icon">
                <Users size={80} />
              </div>
              <div className="stat-content">
                <div className="stat-icon-wrapper">
                  <Users size={28} />
                </div>
                <div className="stat-info">
                  <h4 className="stat-title">Total Técnicos</h4>
                  <p className="stat-value">{reportData.overview.total_technicians}</p>
                </div>
                <div className="stat-trend trend-up">
                  <Activity size={14} />
                  <span>{reportData.overview.active_technicians} activos</span>
                </div>
              </div>
            </div>

            <div className="enterprise-stat-card stat-green">
              <div className="stat-background-icon">
                <CheckCircle size={80} />
              </div>
              <div className="stat-content">
                <div className="stat-icon-wrapper">
                  <CheckCircle size={28} />
                </div>
                <div className="stat-info">
                  <h4 className="stat-title">Tickets Resueltos</h4>
                  <p className="stat-value">{reportData.overview.resolved_tickets}</p>
                </div>
                <div className="stat-trend trend-up">
                  <TrendingUp size={14} />
                  <span>{reportData.overview.resolution_rate}% tasa</span>
                </div>
              </div>
            </div>

            <div className="enterprise-stat-card stat-purple">
              <div className="stat-background-icon">
                <Clock size={80} />
              </div>
              <div className="stat-content">
                <div className="stat-icon-wrapper">
                  <Clock size={28} />
                </div>
                <div className="stat-info">
                  <h4 className="stat-title">Tiempo Promedio</h4>
                  <p className="stat-value">{reportData.overview.avg_resolution_time}h</p>
                </div>
                <div className="stat-trend trend-up">
                  <Timer size={14} />
                  <span>Resolución</span>
                </div>
              </div>
            </div>

            <div className="enterprise-stat-card stat-orange">
              <div className="stat-background-icon">
                <Award size={80} />
              </div>
              <div className="stat-content">
                <div className="stat-icon-wrapper">
                  <Award size={28} />
                </div>
                <div className="stat-info">
                  <h4 className="stat-title">Eficiencia Promedio</h4>
                  <p className="stat-value">
                    {reportData.technicians.length > 0 
                      ? Math.round(reportData.technicians.reduce((sum, tech) => sum + tech.efficiency_score, 0) / reportData.technicians.length)
                      : 0}%
                  </p>
                </div>
                <div className="stat-trend trend-up">
                  <Star size={14} />
                  <span>Del equipo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="library-search-bar">
          <div className="search-input-wrapper">
            <Search size={24} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar técnicos por nombre o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="library-search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <RefreshCw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Technicians Section */}
        <div className="enterprise-section">
          <div className="section-header-wrapper">
            <div className="section-header-content">
              <div className="section-icon">
                <Users size={24} />
              </div>
              <div>
                <h3 className="section-title">Detalle por Técnico</h3>
                <p className="section-description">Rendimiento individual y métricas clave</p>
              </div>
            </div>
            <button 
              className="collapse-btn"
              onClick={() => toggleSection('technicians')}
            >
              {expandedSections.technicians ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        {expandedSections.technicians && (
          <div className="technicians-grid">
            {filteredTechnicians.map((technician) => {
              const StatusIcon = getStatusIcon(technician.technician_status);
              const statusColor = getStatusColor(technician.technician_status);
              const efficiencyColor = getEfficiencyColor(technician.efficiency_score);
              const workload = getWorkloadLevel(technician.pending_tickets, technician.tickets_in_progress);
              
              return (
                <div key={technician.technician_id} className="technician-card">
                  <div className="technician-header">
                    <div className="technician-info">
                      <div className="technician-avatar">
                        <Users size={32} />
                      </div>
                      <div>
                        <h4 className="technician-name">{technician.technician_name}</h4>
                        <div className="technician-meta">
                          <span className={`status-badge status-${statusColor}`}>
                            <StatusIcon size={14} />
                            {technician.technician_status}
                          </span>
                          <span className="service-badge">
                            <Briefcase size={14} />
                            {technician.primary_service}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="efficiency-score">
                      <div className={`score-circle score-${efficiencyColor}`}>
                        <span>{technician.efficiency_score}</span>
                      </div>
                      <small>Eficiencia</small>
                    </div>
                  </div>

                  <div className="technician-metrics">
                    <div className="metric-row">
                      <div className="metric">
                        <FileText size={16} />
                        <div>
                          <span className="metric-value">{technician.total_tickets_assigned}</span>
                          <span className="metric-label">Total Tickets</span>
                        </div>
                      </div>
                      <div className="metric">
                        <CheckCircle size={16} />
                        <div>
                          <span className="metric-value">{technician.tickets_resolved}</span>
                          <span className="metric-label">Resueltos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="metric-row">
                      <div className="metric">
                        <Clock size={16} />
                        <div>
                          <span className="metric-value">{technician.avg_resolution_time}h</span>
                          <span className="metric-label">Tiempo Promedio</span>
                        </div>
                      </div>
                      <div className="metric">
                        <Target size={16} />
                        <div>
                          <span className="metric-value">{technician.resolution_rate}%</span>
                          <span className="metric-label">Tasa Resolución</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="technician-workload">
                    <div className="workload-header">
                      <span className="workload-title">Carga Actual</span>
                      <span className={`workload-badge workload-${workload.color}`}>
                        {workload.level}
                      </span>
                    </div>
                    <div className="workload-breakdown">
                      <div className="workload-item">
                        <span className="workload-count">{technician.pending_tickets}</span>
                        <span className="workload-label">Pendientes</span>
                      </div>
                      <div className="workload-item">
                        <span className="workload-count">{technician.tickets_in_progress}</span>
                        <span className="workload-label">En Proceso</span>
                      </div>
                      <div className="workload-item">
                        <span className="workload-count">{technician.high_priority_resolved}</span>
                        <span className="workload-label">Prioridad Alta</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Service Distribution Section */}
        <div className="enterprise-section">
          <div className="section-header-wrapper">
            <div className="section-header-content">
              <div className="section-icon">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="section-title">Distribución por Servicio</h3>
                <p className="section-description">Tickets y técnicos por tipo de servicio</p>
              </div>
            </div>
            <button 
              className="collapse-btn"
              onClick={() => toggleSection('services')}
            >
              {expandedSections.services ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        {expandedSections.services && reportData && (
          <div className="service-distribution-grid">
            {reportData.service_distribution.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-header">
                  <h4 className="service-name">{service.service_name}</h4>
                  <div className="service-badge">
                    <Briefcase size={16} />
                    {service.technician_count} técnicos
                  </div>
                </div>
                <div className="service-metrics">
                  <div className="service-metric">
                    <span className="metric-value">{service.ticket_count}</span>
                    <span className="metric-label">Tickets Totales</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-value">{service.avg_resolution_time}h</span>
                    <span className="metric-label">Tiempo Promedio</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TechnicianReport;
