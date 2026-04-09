import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  TrendingUp,
  BarChart3,
  Clock,
  ChevronDown,
  Search,
  ArrowLeft
} from 'lucide-react';
import './TicketReports.css';

interface TicketReport {
  id: string;
  title: string;
  description: string;
  sqlQuery: string;
  parameters: string[];
  format: 'PDF' | 'Excel' | 'CSV';
  category: 'general' | 'performance' | 'analytics';
}

const TicketReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<TicketReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'month',
    status: 'all',
    office: 'all',
    priority: 'all'
  });

  // Reportes específicos para tickets basados en la estructura de la DB
  const ticketReports: TicketReport[] = [
    {
      id: '1',
      title: 'Resumen General de Tickets',
      description: 'Reporte completo con estadísticas generales de todos los tickets',
      sqlQuery: `
        SELECT 
          COUNT(*) as total_tickets,
          SUM(CASE WHEN Status = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN Status = 'En Proceso' THEN 1 ELSE 0 END) as en_proceso,
          SUM(CASE WHEN Status = 'Resuelto' THEN 1 ELSE 0 END) as resueltos,
          SUM(CASE WHEN Status = 'Cerrado' THEN 1 ELSE 0 END) as cerrados,
          AVG(DATEDIFF(COALESCE(Resolved_at, CURRENT_TIMESTAMP), Created_at)) as tiempo_promedio
        FROM Service_Request 
        WHERE Created_at BETWEEN ? AND ?
      `,
      parameters: ['fecha_inicio', 'fecha_fin'],
      format: 'PDF',
      category: 'general'
    },
    {
      id: '2',
      title: 'Tickets por Oficina',
      description: 'Distribución de tickets por cada oficina con indicadores clave',
      sqlQuery: `
        SELECT 
          o.Name_Office,
          COUNT(sr.ID_Service_Request) as total_tickets,
          SUM(CASE WHEN sr.Status = 'Resuelto' THEN 1 ELSE 0 END) as resueltos,
          AVG(DATEDIFF(COALESCE(sr.Resolved_at, CURRENT_TIMESTAMP), sr.Created_at)) as tiempo_promedio
        FROM Service_Request sr
        JOIN Office o ON sr.FK_Office = o.ID_Office
        WHERE sr.Created_at BETWEEN ? AND ?
        GROUP BY o.Name_Office
        ORDER BY total_tickets DESC
      `,
      parameters: ['fecha_inicio', 'fecha_fin'],
      format: 'Excel',
      category: 'general'
    },
    {
      id: '3',
      title: 'Tiempos de Respuesta',
      description: 'Análisis detallado de tiempos de respuesta por tipo de servicio',
      sqlQuery: `
        SELECT 
          ts.Type_Service,
          COUNT(*) as total_tickets,
          AVG(DATEDIFF(Resolved_at, Created_at)) as tiempo_promedio_dias,
          MIN(DATEDIFF(Resolved_at, Created_at)) as tiempo_minimo,
          MAX(DATEDIFF(Resolved_at, Created_at)) as tiempo_maximo
        FROM Service_Request sr
        JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
        WHERE sr.Resolved_at IS NOT NULL
          AND sr.Created_at BETWEEN ? AND ?
        GROUP BY ts.Type_Service
        ORDER BY tiempo_promedio_dias DESC
      `,
      parameters: ['fecha_inicio', 'fecha_fin'],
      format: 'Excel',
      category: 'performance'
    },
    {
      id: '4',
      title: 'Tickets de Alta Prioridad',
      description: 'Reporte de tickets críticos y su estado actual',
      sqlQuery: `
        SELECT 
          sr.Ticket_Code,
          sr.Subject,
          sr.User_Priority,
          sr.System_Priority,
          sr.Status,
          sr.Created_at,
          o.Name_Office,
          ts.Type_Service,
          DATEDIFF(CURRENT_TIMESTAMP, sr.Created_at) as dias_abierto
        FROM Service_Request sr
        JOIN Office o ON sr.FK_Office = o.ID_Office
        JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
        WHERE (sr.User_Priority = 'Alta' OR sr.System_Priority = 'Alta')
          AND sr.Status != 'Cerrado'
        ORDER BY sr.Created_at DESC
      `,
      parameters: [],
      format: 'PDF',
      category: 'analytics'
    },
    {
      id: '5',
      title: 'Evolución Mensual',
      description: 'Tendencia de tickets creados y resueltos por mes',
      sqlQuery: `
        SELECT 
          DATE_FORMAT(Created_at, '%Y-%m') as mes,
          COUNT(*) as tickets_creados,
          SUM(CASE WHEN Status = 'Resuelto' THEN 1 ELSE 0 END) as tickets_resueltos,
          AVG(DATEDIFF(COALESCE(Resolved_at, CURRENT_TIMESTAMP), Created_at)) as tiempo_promedio
        FROM Service_Request
        WHERE Created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(Created_at, '%Y-%m')
        ORDER BY mes DESC
      `,
      parameters: [],
      format: 'CSV',
      category: 'analytics'
    },
    {
      id: '6',
      title: 'Tickets por Tipo de Servicio',
      description: 'Análisis de tickets agrupados por tipo de servicio técnico',
      sqlQuery: `
        SELECT 
          ts.Type_Service,
          COUNT(*) as total_tickets,
          SUM(CASE WHEN sr.Status = 'Resuelto' THEN 1 ELSE 0 END) as resueltos,
          ROUND(AVG(DATEDIFF(COALESCE(sr.Resolved_at, CURRENT_TIMESTAMP), sr.Created_at)), 1) as tiempo_promedio_dias,
          COUNT(DISTINCT sr.Fk_Technician_Current) as tecnicos_asignados
        FROM Service_Request sr
        JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
        WHERE sr.Created_at BETWEEN ? AND ?
        GROUP BY ts.Type_Service
        ORDER BY total_tickets DESC
      `,
      parameters: ['fecha_inicio', 'fecha_fin'],
      format: 'Excel',
      category: 'general'
    }
  ];

  const statsData = [
    {
      title: 'Total Tickets',
      value: '1,247',
      change: '+12.5%',
      positive: true,
      icon: FileText
    },
    {
      title: 'Tiempo Promedio',
      value: '4.2 días',
      change: '-18.3%',
      positive: true,
      icon: Clock
    },
    {
      title: 'Tickets Resueltos',
      value: '1,089',
      change: '+8.7%',
      positive: true,
      icon: TrendingUp
    },
    {
      title: 'Tickets Críticos',
      value: '23',
      change: '-7.8%',
      positive: true,
      icon: BarChart3
    }
  ];

  const filteredReports = ticketReports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateReport = async (report: TicketReport) => {
    setSelectedReport(report);
    setIsGenerating(true);

    try {
      // Simulación de generación
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generar datos de ejemplo
      const reportData = generateMockData(report);
      downloadReport(report, reportData);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
      setSelectedReport(null);
    }
  };

  const generateMockData = (report: TicketReport) => {
    const mockData: Record<string, { headers: string[]; data: string[][] }> = {
      '1': {
        headers: ['Métrica', 'Valor'],
        data: [
          ['Total Tickets', '1247'],
          ['Pendientes', '89'],
          ['En Proceso', '156'],
          ['Resueltos', '1002'],
          ['Cerrados', '1089'],
          ['Tiempo Promedio (días)', '4.2']
        ]
      },
      '2': {
        headers: ['Oficina', 'Total Tickets', 'Resueltos', 'Tiempo Promedio (días)'],
        data: [
          ['Catastro', '345', '312', '3.8'],
          ['Obras', '423', '389', '4.5'],
          ['Bienestar', '289', '267', '3.2'],
          ['Tesorería', '190', '178', '4.1']
        ]
      },
      '3': {
        headers: ['Tipo Servicio', 'Total Tickets', 'Tiempo Promedio (días)', 'Mínimo', 'Máximo'],
        data: [
          ['Redes', '234', '2.1', '0.5', '5.2'],
          ['Programación', '189', '3.4', '1.2', '7.8'],
          ['Servicio Técnico', '445', '5.2', '0.8', '12.3'],
          ['Hardware', '379', '4.8', '1.5', '9.6']
        ]
      }
    };

    return mockData[report.id] || { headers: ['Dato', 'Valor'], data: [['Ejemplo', 'Valor']] };
  };

  const downloadReport = (report: TicketReport, data: any) => {
    const content = convertToCSV(data);
    const filename = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any) => {
    if (!data.headers || !data.data) return '';
    
    const csvContent = [
      data.headers.join(','),
      ...data.data.map((row: string[]) => 
        row.map(cell => `"${cell}"`).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return '#667eea';
      case 'performance': return '#28a745';
      case 'analytics': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general': return 'General';
      case 'performance': return 'Rendimiento';
      case 'analytics': return 'Analítico';
      default: return 'Otro';
    }
  };

  return (
    <div className="ticket-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <div className="header-title">
            <FileText size={24} />
            <div>
              <h1>Reportes de Tickets</h1>
              <p>Informes especializados sobre la gestión de tickets</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
              Filtros
              <ChevronDown size={16} className={`chevron ${showFilters ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                <stat.icon size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
                <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filtros de Reportes</h3>
          </div>
          <div className="filters-content">
            <div className="filter-group">
              <label>Rango de Fechas</label>
              <select 
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="today">Hoy</option>
                <option value="week">Última Semana</option>
                <option value="month">Último Mes</option>
                <option value="quarter">Último Trimestre</option>
                <option value="year">Último Año</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Estado</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Oficina</label>
              <select 
                value={filters.office}
                onChange={(e) => setFilters(prev => ({ ...prev, office: e.target.value }))}
              >
                <option value="all">Todas</option>
                <option value="Catastro">Catastro</option>
                <option value="Obras">Obras</option>
                <option value="Bienestar">Bienestar</option>
                <option value="Tesorería">Tesorería</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Prioridad</label>
              <select 
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="all">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar reportes de tickets..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-icon" style={{ background: getCategoryColor(report.category) }}>
                <FileText size={20} />
              </div>
              <div className="report-meta">
                <div className="report-format">{report.format}</div>
                <div className="report-category" style={{ color: getCategoryColor(report.category) }}>
                  {getCategoryLabel(report.category)}
                </div>
              </div>
            </div>
            
            <div className="report-content">
              <h3>{report.title}</h3>
              <p>{report.description}</p>
              
              <div className="report-info">
                <div className="info-item">
                  <Calendar size={14} />
                  <span>Parámetros: {report.parameters.length}</span>
                </div>
              </div>
            </div>

            <div className="report-actions">
              <button 
                className="btn-generate"
                onClick={() => handleGenerateReport(report)}
                disabled={isGenerating && selectedReport?.id === report.id}
              >
                {isGenerating && selectedReport?.id === report.id ? (
                  <>
                    <div className="spinner" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Generar Reporte
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner-large" />
            <h3>Generando Reporte...</h3>
            <p>Preparando tu informe de tickets, por favor espera</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketReports;
