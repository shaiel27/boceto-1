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
  Edit,
  Filter,
  MoreVertical,
  Sparkles,
  Activity,
  Zap,
  Target,
  BarChart,
  Grid,
  List,
  X,
  Star,
  Play
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.type === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  const getReportTypeColor = (type: string): string => {
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

  const getCategoryLabel = (type: string): string => {
    switch (type) {
      case 'general': return 'General';
      case 'performance': return 'Desempeño';
      case 'office': return 'Oficina';
      case 'timeline': return 'Timeline';
      case 'priority': return 'Prioridad';
      case 'service': return 'Servicio';
      default: return 'Otro';
    }
  };

  return (
    <div className="dashboard-container reports-enterprise">
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
        {/* Header */}
        <div className="reports-header">
          <div className="header-left">
            <div className="header-icon-wrapper">
              <TrendingUp size={32} className="header-icon" />
            </div>
            <div className="header-text">
              <h1 className="header-title">Centro de Reportes</h1>
              <p className="header-subtitle">Análisis avanzado y métricas de tickets</p>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="enterprise-btn primary"
              onClick={handleCreateReport}
            >
              <Plus size={18} />
              Crear Reporte
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="enterprise-tabs">
          <button
            className={`enterprise-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} />
            <span>Resumen Ejecutivo</span>
          </button>
          <button
            className={`enterprise-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={18} />
            <span>Biblioteca de Reportes</span>
          </button>
          <button
            className={`enterprise-tab ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <Sparkles size={18} />
            <span>Generador Avanzado</span>
          </button>
          <button
            className={`enterprise-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={18} />
            <span>Historial de Ejecuciones</span>
          </button>
        </div>

        {/* Content */}
        <div className="reports-content enterprise-content">
        {activeTab === 'overview' && (
          <div className="overview-view">
            {/* Statistics Cards */}
            <div className="enterprise-section">
              <div className="section-header-wrapper">
                <div className="section-header-content">
                  <div className="section-icon">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="section-title">KPIs Estratégicos</h3>
                    <p className="section-description">Métricas clave de rendimiento en tiempo real</p>
                  </div>
                </div>
                <button 
                  className="collapse-btn"
                  onClick={() => toggleSection('stats')}
                >
                  {expandedSections.stats ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>
            </div>
            {expandedSections.stats && (
              <div className="enterprise-stats-grid">
                {statsData.map((stat, index) => (
                  <div key={index} className={`enterprise-stat-card stat-${stat.color}`}>
                    <div className="stat-background-icon">
                      <stat.icon size={80} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-icon-wrapper">
                        <stat.icon size={28} />
                      </div>
                      <div className="stat-info">
                        <h4 className="stat-title">{stat.title}</h4>
                        <p className="stat-value">{stat.value}</p>
                      </div>
                      <div className={`stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                        <TrendingUp size={14} />
                        <span>{stat.trend}</span>
                        <span className="trend-label">vs mes anterior</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts Section */}
            <div className="enterprise-section">
              <div className="section-header-wrapper">
                <div className="section-header-content">
                  <div className="section-icon">
                    <BarChart size={24} />
                  </div>
                  <div>
                    <h3 className="section-title">Visualizaciones de Datos</h3>
                    <p className="section-description">Análisis gráfico de tendencias y patrones</p>
                  </div>
                </div>
                <button 
                  className="collapse-btn"
                  onClick={() => toggleSection('charts')}
                >
                  {expandedSections.charts ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>
            </div>
            {expandedSections.charts && (
              <div className="enterprise-charts-grid">
                {/* Priority Chart */}
                <div className="enterprise-chart-card">
                  <div className="chart-header">
                    <div className="chart-title-wrapper">
                      <div className="chart-icon">
                        <AlertTriangle size={20} />
                      </div>
                      <h4 className="chart-title">Distribución por Prioridad</h4>
                    </div>
                    <div className="chart-badge">Total: 1,250</div>
                  </div>
                  <div className="chart-content">
                    {priorityData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-label-row">
                          <span className="chart-bar-label">{item.label}</span>
                          <span className="chart-bar-percentage">{Math.round((item.value / 1250) * 100)}%</span>
                        </div>
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
                <div className="enterprise-chart-card">
                  <div className="chart-header">
                    <div className="chart-title-wrapper">
                      <div className="chart-icon">
                        <Building size={20} />
                      </div>
                      <h4 className="chart-title">Tickets por Oficina</h4>
                    </div>
                    <div className="chart-badge">Top 5</div>
                  </div>
                  <div className="chart-content">
                    {officeData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-label-row">
                          <span className="chart-bar-label">{item.label}</span>
                          <span className="chart-bar-percentage">{Math.round((item.value / 1250) * 100)}%</span>
                        </div>
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
                <div className="enterprise-chart-card">
                  <div className="chart-header">
                    <div className="chart-title-wrapper">
                      <div className="chart-icon">
                        <CheckCircle size={20} />
                      </div>
                      <h4 className="chart-title">Estado de Tickets</h4>
                    </div>
                    <div className="chart-badge">Tasa de resolución: 80%</div>
                  </div>
                  <div className="chart-content">
                    {statusData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-label-row">
                          <span className="chart-bar-label">{item.label}</span>
                          <span className="chart-bar-percentage">{Math.round((item.value / 1250) * 100)}%</span>
                        </div>
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
          <div className="library-view">
            {/* Hero Section */}
            <div className="library-hero">
              <div className="hero-content">
                <div className="hero-icon">
                  <FileText size={64} />
                </div>
                <h2 className="hero-title">Biblioteca de Reportes</h2>
                <p className="hero-subtitle">Explora y gestiona todos tus reportes en un solo lugar</p>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-number">{reports.length}</span>
                  <span className="stat-label">Total Reportes</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">{reports.filter((r: Report) => r.status === 'active').length}</span>
                  <span className="stat-label">Activos</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Categorías</span>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="category-filters">
              <button
                className={`category-filter ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <Grid size={20} />
                <span>Todos</span>
                <span className="category-count">{reports.length}</span>
              </button>
              <button
                className={`category-filter ${selectedCategory === 'general' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('general')}
              >
                <BarChart3 size={20} />
                <span>Generales</span>
                <span className="category-count">{reports.filter((r: Report) => r.type === 'general').length}</span>
              </button>
              <button
                className={`category-filter ${selectedCategory === 'performance' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('performance')}
              >
                <TrendingUp size={20} />
                <span>Desempeño</span>
                <span className="category-count">{reports.filter((r: Report) => r.type === 'performance').length}</span>
              </button>
              <button
                className={`category-filter ${selectedCategory === 'office' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('office')}
              >
                <Building size={20} />
                <span>Oficinas</span>
                <span className="category-count">{reports.filter((r: Report) => r.type === 'office').length}</span>
              </button>
              <button
                className={`category-filter ${selectedCategory === 'timeline' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('timeline')}
              >
                <Clock size={20} />
                <span>Timeline</span>
                <span className="category-count">{reports.filter((r: Report) => r.type === 'timeline').length}</span>
              </button>
              <button
                className={`category-filter ${selectedCategory === 'priority' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('priority')}
              >
                <AlertTriangle size={20} />
                <span>Prioridad</span>
                <span className="category-count">{reports.filter((r: Report) => r.type === 'priority').length}</span>
              </button>
            </div>

            {/* Advanced Search Bar */}
            <div className="library-search-bar">
              <div className="search-input-wrapper">
                <Search size={24} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar reportes por nombre, descripción o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="library-search-input"
                />
                {searchTerm && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="view-toggles">
                <button
                  className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista de cuadrícula"
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Reports Display */}
            {filteredReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={80} />
                </div>
                <h3 className="empty-title">No se encontraron reportes</h3>
                <p className="empty-description">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay reportes disponibles en esta categoría'}
                </p>
                {searchTerm && (
                  <button
                    className="clear-filter-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    <RefreshCw size={18} />
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className={`reports-container ${viewMode}`}>
                {filteredReports.map((report, index) => {
                  const ReportIcon = getReportTypeIcon(report.type);
                  const colorClass = getReportTypeColor(report.type);
                  return (
                    <div 
                      key={report.id} 
                      className={`library-report-card report-${colorClass}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="report-visual-header">
                        <div className="report-visual-icon">
                          <div className="icon-glow"></div>
                          <ReportIcon size={48} />
                        </div>
                        <div className="report-quick-actions">
                          <button
                            className="quick-action-btn favorite"
                            title="Agregar a favoritos"
                          >
                            <Star size={18} />
                          </button>
                          <button
                            className="quick-action-btn more"
                            title="Más opciones"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="report-content">
                        <div className="report-category-badge">
                          {getCategoryLabel(report.type)}
                        </div>
                        <h3 className="report-title">{report.name}</h3>
                        <p className="report-excerpt">{report.description}</p>
                        
                        <div className="report-metrics">
                          <div className="metric">
                            <Calendar size={14} />
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="metric">
                            <Clock size={14} />
                            <span>{new Date(report.lastRun).toLocaleDateString()}</span>
                          </div>
                          <div className="metric">
                            <Activity size={14} />
                            <span>{report.status === 'active' ? 'Activo' : report.status === 'scheduled' ? 'Programado' : 'Archivado'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="report-footer">
                        <div className="report-actions">
                          <button
                            className="action-btn primary"
                            onClick={() => handleRunReport(report.id)}
                          >
                            <Play size={16} />
                            <span>Ejecutar</span>
                          </button>
                          <button
                            className="action-btn secondary"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye size={16} />
                            <span>Ver</span>
                          </button>
                        </div>
                        <div className="export-quick">
                          <button
                            className="export-quick-btn"
                            onClick={() => handleExportReport(report.id, 'pdf')}
                            title="Exportar PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="export-quick-btn"
                            onClick={() => handleExportReport(report.id, 'excel')}
                            title="Exportar Excel"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="export-quick-btn"
                            onClick={() => handleExportReport(report.id, 'csv')}
                            title="Exportar CSV"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="generator-view">
            <div className="generator-header">
              <div className="generator-icon-wrapper">
                <Sparkles size={48} />
              </div>
              <h2 className="generator-title">Generador de Reportes Personalizados</h2>
              <p className="generator-subtitle">Crea reportes a medida con filtros avanzados y parámetros dinámicos</p>
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
                <button className="enterprise-btn secondary" onClick={() => setActiveTab('reports')}>
                  Cancelar
                </button>
                <button className="enterprise-btn primary">
                  <Zap size={18} />
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-view">
            <div className="history-header">
              <div className="history-icon-wrapper">
                <Clock size={48} />
              </div>
              <h2 className="history-title">Historial de Ejecuciones</h2>
              <p className="history-subtitle">Registro completo de todas las ejecuciones de reportes con métricas de rendimiento</p>
            </div>
            <div className="enterprise-history-table">
              <div className="table-header">
                <div className="table-cell">Reporte</div>
                <div className="table-cell">Fecha de Ejecución</div>
                <div className="table-cell">Duración</div>
                <div className="table-cell">Registros</div>
                <div className="table-cell">Estado</div>
                <div className="table-cell">Acciones</div>
              </div>
              <div className="table-body">
                <div className="table-row">
                  <div className="table-cell">
                    <div className="report-name-cell">
                      <FileText size={16} className="cell-icon" />
                      <span>Reporte General de Tickets</span>
                    </div>
                  </div>
                  <div className="table-cell">13/04/2024 09:30</div>
                  <div className="table-cell">2.5s</div>
                  <div className="table-cell">1,250</div>
                  <div className="table-cell">
                    <span className="status-badge status-success">
                      <CheckCircle size={14} />
                      Completado
                    </span>
                  </div>
                  <div className="table-cell">
                    <button className="table-action-btn">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="table-row">
                  <div className="table-cell">
                    <div className="report-name-cell">
                      <TrendingUp size={16} className="cell-icon" />
                      <span>Reporte de Desempeño</span>
                    </div>
                  </div>
                  <div className="table-cell">12/04/2024 16:45</div>
                  <div className="table-cell">3.1s</div>
                  <div className="table-cell">890</div>
                  <div className="table-cell">
                    <span className="status-badge status-success">
                      <CheckCircle size={14} />
                      Completado
                    </span>
                  </div>
                  <div className="table-cell">
                    <button className="table-action-btn">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="table-row">
                  <div className="table-cell">
                    <div className="report-name-cell">
                      <Building size={16} className="cell-icon" />
                      <span>Reporte por Oficina</span>
                    </div>
                  </div>
                  <div className="table-cell">11/04/2024 11:20</div>
                  <div className="table-cell">1.8s</div>
                  <div className="table-cell">540</div>
                  <div className="table-cell">
                    <span className="status-badge status-success">
                      <CheckCircle size={14} />
                      Completado
                    </span>
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
        <div className="enterprise-loading-overlay">
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner"></div>
            <div className="loading-spinner-ring"></div>
          </div>
          <p className="loading-text">Generando reporte...</p>
          <p className="loading-subtext">Por favor espere mientras procesamos los datos</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
