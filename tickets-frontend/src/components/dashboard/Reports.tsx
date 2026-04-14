import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  RefreshCw,
  ArrowLeft,
  PieChart,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building,
  Search,
  ChevronDown,
  ChevronRight,
  Settings,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import './Dashboard.css';
import './Reports.css';

interface Report {
  id: string;
  name: string;
  type: 'general' | 'performance' | 'office' | 'timeline' | 'priority' | 'service';
  description: string;
  createdAt: string;
  lastRun: string;
  status: 'active' | 'scheduled' | 'archived';
  parameters: ReportParameter[];
}

interface ReportParameter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'text' | 'number';
  value: any;
  options?: string[];
}

interface StatCard {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: any;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'generator' | 'history'>('overview');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    stats: true,
    charts: true,
    reports: true
  });

  // Mock data for statistics
  const statsData: StatCard[] = [
    {
      title: 'Total Tickets',
      value: '1,250',
      trend: '+30%',
      trendUp: true,
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Tiempo Promedio',
      value: '4.5h',
      trend: '-15%',
      trendUp: true,
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Tickets Resueltos',
      value: '1,180',
      trend: '+25%',
      trendUp: true,
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'Oficinas Activas',
      value: '12',
      trend: '+2',
      trendUp: true,
      icon: Building,
      color: 'orange'
    }
  ];

  // Mock data for charts
  const priorityData: ChartData[] = [
    { label: 'Alta', value: 150, color: '#ef4444' },
    { label: 'Media', value: 450, color: '#f59e0b' },
    { label: 'Baja', value: 650, color: '#22c55e' }
  ];

  const officeData: ChartData[] = [
    { label: 'Catastro', value: 320, color: '#3b82f6' },
    { label: 'Obras', value: 280, color: '#8b5cf6' },
    { label: 'Bienestar', value: 250, color: '#ec4899' },
    { label: 'Hacienda', value: 200, color: '#14b8a6' },
    { label: 'Educación', value: 200, color: '#f97316' }
  ];

  const statusData: ChartData[] = [
    { label: 'Pendientes', value: 70, color: '#ef4444' },
    { label: 'En Proceso', value: 180, color: '#f59e0b' },
    { label: 'Resueltos', value: 1000, color: '#22c55e' }
  ];

  // Mock reports data
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Reporte General de Tickets',
      type: 'general',
      description: 'Resumen completo de todos los tickets del sistema',
      createdAt: '2024-01-15T10:00:00',
      lastRun: '2024-04-13T09:30:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Fecha Inicio', type: 'date', value: '2024-01-01' },
        { id: 'p2', name: 'Fecha Fin', type: 'date', value: '2024-04-13' },
        { id: 'p3', name: 'Estado', type: 'select', value: 'all', options: ['all', 'active', 'closed'] }
      ]
    },
    {
      id: '2',
      name: 'Reporte de Desempeño',
      type: 'performance',
      description: 'Análisis de rendimiento de técnicos y tiempos de respuesta',
      createdAt: '2024-02-01T14:30:00',
      lastRun: '2024-04-12T16:45:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Período', type: 'select', value: 'monthly', options: ['daily', 'weekly', 'monthly'] }
      ]
    },
    {
      id: '3',
      name: 'Reporte por Oficina',
      type: 'office',
      description: 'Distribución de tickets por oficina municipal',
      createdAt: '2024-02-15T09:00:00',
      lastRun: '2024-04-11T11:20:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Oficina', type: 'select', value: 'all', options: ['all', 'catastro', 'obras', 'bienestar'] }
      ]
    },
    {
      id: '4',
      name: 'Timeline de Tickets',
      type: 'timeline',
      description: 'Evolución temporal de tickets por mes',
      createdAt: '2024-03-01T10:15:00',
      lastRun: '2024-04-10T14:00:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Meses', type: 'number', value: 6 }
      ]
    },
    {
      id: '5',
      name: 'Reporte de Prioridades',
      type: 'priority',
      description: 'Análisis de tickets por nivel de prioridad',
      createdAt: '2024-03-10T11:30:00',
      lastRun: '2024-04-09T09:15:00',
      status: 'active',
      parameters: []
    },
    {
      id: '6',
      name: 'Reporte por Tipo de Servicio',
      type: 'service',
      description: 'Distribución de tickets por categoría de servicio',
      createdAt: '2024-03-20T15:45:00',
      lastRun: '2024-04-08T16:30:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Servicio', type: 'multiselect', value: ['hardware', 'software'], options: ['hardware', 'software', 'network', 'printer'] }
      ]
    }
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRunReport = (reportId: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate running report
      console.log('Running report:', reportId);
    }, 1500);
  };

  const handleExportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report ${reportId} as ${format}`);
    // Simulate export
  };

  const handleCreateReport = () => {
    setActiveTab('generator');
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'general': return BarChart3;
      case 'performance': return TrendingUp;
      case 'office': return Building;
      case 'timeline': return Calendar;
      case 'priority': return AlertTriangle;
      case 'service': return Settings;
      default: return FileText;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'blue';
      case 'performance': return 'green';
      case 'office': return 'purple';
      case 'timeline': return 'orange';
      case 'priority': return 'red';
      case 'service': return 'cyan';
      default: return 'gray';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Building size={20} color="white" />
        </div>
        <div className="sidebar-title">Alcaldía del Municipio San Cristóbal</div>
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className="nav-link"
                onClick={() => navigate('/')}
              >
                <BarChart3 size={18} />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link"
                onClick={() => navigate('/admin')}
              >
                <FileText size={18} />
                Gestión de Tickets
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link"
                onClick={() => navigate('/admin/technicians')}
              >
                <Users size={18} />
                Personal Técnico
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link active">
                <TrendingUp size={18} />
                Reportes
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link"
                onClick={() => navigate('/admin/structure')}
              >
                <Building size={18} />
                Estructura Institucional
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <Settings size={18} />
                Usuarios
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content-area">
        {/* Header Actions */}
        <div className="dashboard-actions">
          <button 
            className="new-ticket-btn"
            onClick={handleCreateReport}
          >
            <Plus size={18} />
            Crear Reporte
          </button>
        </div>

        {/* Tabs */}
        <div className="reports-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} />
            <span>Resumen</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={18} />
            <span>Reportes</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <Settings size={18} />
            <span>Generador</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={18} />
            <span>Historial</span>
          </button>
        </div>

        {/* Content */}
        <div className="reports-content">
        {activeTab === 'overview' && (
          <div className="overview-view">
            {/* Statistics Cards */}
            <div className="section-header" onClick={() => toggleSection('stats')}>
              <h3 className="section-title">
                {expandedSections.stats ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                Estadísticas Generales
              </h3>
            </div>
            {expandedSections.stats && (
              <div className="stats-grid">
                {statsData.map((stat, index) => (
                  <div key={index} className={`stat-card stat-${stat.color}`}>
                    <div className="stat-header">
                      <div className="stat-icon">
                        <stat.icon size={32} />
                      </div>
                      <div className="stat-info">
                        <h4 className="stat-title">{stat.title}</h4>
                        <p className="stat-value">{stat.value}</p>
                      </div>
                    </div>
                    <div className={`stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                      <TrendingUp size={16} />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts Section */}
            <div className="section-header" onClick={() => toggleSection('charts')}>
              <h3 className="section-title">
                {expandedSections.charts ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                Visualizaciones
              </h3>
            </div>
            {expandedSections.charts && (
              <div className="charts-grid">
                {/* Priority Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h4 className="chart-title">
                      <PieChart size={20} />
                      Distribución por Prioridad
                    </h4>
                  </div>
                  <div className="chart-content">
                    {priorityData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-label">{item.label}</div>
                        <div className="chart-bar-wrapper">
                          <div
                            className="chart-bar"
                            style={{
                              width: `${(item.value / 650) * 100}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                          <span className="chart-bar-value">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Office Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h4 className="chart-title">
                      <Building size={20} />
                      Tickets por Oficina
                    </h4>
                  </div>
                  <div className="chart-content">
                    {officeData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-label">{item.label}</div>
                        <div className="chart-bar-wrapper">
                          <div
                            className="chart-bar"
                            style={{
                              width: `${(item.value / 320) * 100}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                          <span className="chart-bar-value">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h4 className="chart-title">
                      <CheckCircle size={20} />
                      Estado de Tickets
                    </h4>
                  </div>
                  <div className="chart-content">
                    {statusData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-label">{item.label}</div>
                        <div className="chart-bar-wrapper">
                          <div
                            className="chart-bar"
                            style={{
                              width: `${(item.value / 1000) * 100}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                          <span className="chart-bar-value">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-view">
            {/* Filters */}
            <div className="reports-filters">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-controls">
                <select
                  className="filter-select"
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                >
                  <option value="all">Todas las Oficinas</option>
                  <option value="catastro">Catastro</option>
                  <option value="obras">Obras</option>
                  <option value="bienestar">Bienestar</option>
                </select>
                <select
                  className="filter-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Activos</option>
                  <option value="scheduled">Programados</option>
                  <option value="archived">Archivados</option>
                </select>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="reports-grid">
              {filteredReports.map((report) => {
                const ReportIcon = getReportTypeIcon(report.type);
                const colorClass = getReportTypeColor(report.type);
                return (
                  <div key={report.id} className={`report-card report-${colorClass}`}>
                    <div className="report-header">
                      <div className="report-icon">
                        <ReportIcon size={28} />
                      </div>
                      <div className="report-status">
                        <span className={`status-badge status-${report.status}`}>
                          {report.status === 'active' ? 'Activo' : report.status === 'scheduled' ? 'Programado' : 'Archivado'}
                        </span>
                      </div>
                    </div>
                    <div className="report-body">
                      <h3 className="report-name">{report.name}</h3>
                      <p className="report-description">{report.description}</p>
                      <div className="report-meta">
                        <span className="meta-item">
                          <Calendar size={14} />
                          Última ejecución: {new Date(report.lastRun).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button
                        className="report-action-btn run"
                        onClick={() => handleRunReport(report.id)}
                        title="Ejecutar reporte"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        className="report-action-btn view"
                        onClick={() => setSelectedReport(report)}
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="report-action-btn edit"
                        onClick={() => console.log('Edit report:', report.id)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <div className="dropdown">
                        <button className="report-action-btn more">
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="report-exports">
                      <button
                        className="export-btn"
                        onClick={() => handleExportReport(report.id, 'pdf')}
                      >
                        <Download size={14} />
                        PDF
                      </button>
                      <button
                        className="export-btn"
                        onClick={() => handleExportReport(report.id, 'excel')}
                      >
                        <Download size={14} />
                        Excel
                      </button>
                      <button
                        className="export-btn"
                        onClick={() => handleExportReport(report.id, 'csv')}
                      >
                        <Download size={14} />
                        CSV
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="generator-view">
            <div className="generator-header">
              <h2 className="generator-title">
                <Settings size={24} />
                Generador de Reportes Personalizados
              </h2>
              <p className="generator-subtitle">Crea reportes a medida con filtros y parámetros personalizados</p>
            </div>

            <div className="generator-form">
              <div className="form-section">
                <h3 className="form-section-title">Información del Reporte</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre del Reporte</label>
                    <input type="text" className="form-input" placeholder="Ej: Reporte Mensual de Tickets" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo de Reporte</label>
                    <select className="form-input">
                      <option value="general">General</option>
                      <option value="performance">Desempeño</option>
                      <option value="office">Por Oficina</option>
                      <option value="timeline">Timeline</option>
                      <option value="priority">Prioridades</option>
                      <option value="service">Tipo de Servicio</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-textarea" placeholder="Describe el propósito de este reporte..." rows={3} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Parámetros del Reporte</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Fecha Inicio</label>
                    <input type="date" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha Fin</label>
                    <input type="date" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Oficina</label>
                    <select className="form-input">
                      <option value="all">Todas las oficinas</option>
                      <option value="catastro">Catastro</option>
                      <option value="obras">Obras</option>
                      <option value="bienestar">Bienestar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select className="form-input">
                      <option value="all">Todos los estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="in_progress">En Proceso</option>
                      <option value="resolved">Resueltos</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prioridad</label>
                    <select className="form-input">
                      <option value="all">Todas las prioridades</option>
                      <option value="high">Alta</option>
                      <option value="medium">Media</option>
                      <option value="low">Baja</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Técnico</label>
                    <select className="form-input">
                      <option value="all">Todos los técnicos</option>
                      <option value="tech1">Amna Verez</option>
                      <option value="tech2">Carlos Diaz</option>
                      <option value="tech3">Lavila Kavrvn</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Formato de Exportación</h3>
                <div className="format-options">
                  <label className="format-option">
                    <input type="checkbox" defaultChecked />
                    <span>PDF</span>
                  </label>
                  <label className="format-option">
                    <input type="checkbox" defaultChecked />
                    <span>Excel</span>
                  </label>
                  <label className="format-option">
                    <input type="checkbox" />
                    <span>CSV</span>
                  </label>
                </div>
              </div>

              <div className="generator-actions">
                <button className="action-btn secondary" onClick={() => setActiveTab('reports')}>
                  Cancelar
                </button>
                <button className="action-btn primary">
                  <Plus size={18} />
                  Crear Reporte
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-view">
            <div className="history-header">
              <h2 className="history-title">
                <Clock size={24} />
                Historial de Ejecuciones
              </h2>
              <p className="history-subtitle">Registro de todas las ejecuciones de reportes</p>
            </div>
            <div className="history-table">
              <div className="table-header">
                <div className="table-cell">Reporte</div>
                <div className="table-cell">Fecha</div>
                <div className="table-cell">Duración</div>
                <div className="table-cell">Estado</div>
                <div className="table-cell">Acciones</div>
              </div>
              <div className="table-body">
                <div className="table-row">
                  <div className="table-cell">Reporte General de Tickets</div>
                  <div className="table-cell">13/04/2024 09:30</div>
                  <div className="table-cell">2.5s</div>
                  <div className="table-cell">
                    <span className="status-badge status-success">Completado</span>
                  </div>
                  <div className="table-cell">
                    <button className="table-action-btn">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="table-row">
                  <div className="table-cell">Reporte de Desempeño</div>
                  <div className="table-cell">12/04/2024 16:45</div>
                  <div className="table-cell">3.1s</div>
                  <div className="table-cell">
                    <span className="status-badge status-success">Completado</span>
                  </div>
                  <div className="table-cell">
                    <button className="table-action-btn">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="table-row">
                  <div className="table-cell">Reporte por Oficina</div>
                  <div className="table-cell">11/04/2024 11:20</div>
                  <div className="table-cell">1.8s</div>
                  <div className="table-cell">
                    <span className="status-badge status-success">Completado</span>
                  </div>
                  <div className="table-cell">
                    <button className="table-action-btn">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Generando reporte...</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
