import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
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
  Edit,
  Filter,
  MoreVertical,
  Activity,
  Target,
  BarChart,
  Grid,
  List,
  X,
  Star
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import './Dashboard.css';
import './Reports.css';

interface Report {
  id: string;
  name: string;
  type: 'general' | 'performance' | 'office' | 'timeline' | 'priority' | 'service' | 'technician' | 'problem' | 'shift';
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

interface TechnicianReportItem {
  id: number;
  nombre: string;
  estado: string;
  servicio: string;
  tickets_asignados: number;
  tickets_resueltos: number;
  en_progreso: number;
  pendientes: number;
  tiempo_promedio: string;
  tasa_resolucion: string;
  eficiencia: string;
}

interface TechnicianReport {
  overview: {
    total_tecnicos: number;
    tasa_resolucion: string;
    tiempo_promedio: string;
  };
  technicians: TechnicianReportItem[];
}

interface APITechnicianData {
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
  efficiency_score: number;
}

interface APIResponse {
  success: boolean;
  message?: string;
  data?: {
    overview: {
      total_technicians: number;
      resolution_rate: number;
      avg_resolution_time: number;
    };
    technicians: APITechnicianData[];
  };
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
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
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

  // PHP-PRO: Executive summary state from backend
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [officeData, setOfficeData] = useState<ChartData[]>([]);

  // Real data for statistics from backend - Key metrics for ticket system
  const statsData: StatCard[] = [
    {
      title: 'Tickets Totales',
      value: executiveSummary?.kpi_metrics?.total_tickets ?? '0',
      trend: `${executiveSummary?.trends?.tickets_trend_percent > 0 ? '+' : ''}${executiveSummary?.trends?.tickets_trend_percent ?? 0}%`,
      trendUp: (executiveSummary?.trends?.tickets_trend_percent ?? 0) >= 0,
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Resolución Promedio',
      value: `${executiveSummary?.kpi_metrics?.avg_resolution_hours ?? 0}h`,
      trend: `${executiveSummary?.trends?.resolution_time_trend_percent < 0 ? 'Mejora' : 'Aumento'} ${Math.abs(executiveSummary?.trends?.resolution_time_trend_percent ?? 0)}%`,
      trendUp: (executiveSummary?.trends?.resolution_time_trend_percent ?? 0) <= 0,
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Tasa de Resolución',
      value: `${((executiveSummary?.kpi_metrics?.resolved_tickets / Math.max(executiveSummary?.kpi_metrics?.total_tickets, 1)) * 100 || 0).toFixed(1)}%`,
      trend: `${executiveSummary?.kpi_metrics?.resolved_tickets ?? 0} resueltos`,
      trendUp: true,
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'Tickets Críticos',
      value: executiveSummary?.priority_distribution?.critical ?? '0',
      trend: `Requieren atención`,
      trendUp: false,
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  // Real Priority data from backend
  const priorityData: ChartData[] = executiveSummary?.priority_distribution ? [
    { label: 'Crítica', value: executiveSummary.priority_distribution.critical || 0, color: '#dc2626' },
    { label: 'Alta', value: executiveSummary.priority_distribution.high || 0, color: '#f59e0b' },
    { label: 'Media', value: executiveSummary.priority_distribution.medium || 0, color: '#22c55e' },
    { label: 'Baja', value: executiveSummary.priority_distribution.low || 0, color: '#3b82f6' }
  ] : [];

  // Real Status data from backend
  const statusData: ChartData[] = executiveSummary?.status_distribution ? [
    { label: 'Pendientes', value: executiveSummary.status_distribution.pending || 0, color: '#ef4444' },
    { label: 'En Proceso', value: executiveSummary.status_distribution.in_progress || 0, color: '#f59e0b' },
    { label: 'Resueltos', value: executiveSummary.status_distribution.resolved || 0, color: '#22c55e' }
  ] : [];

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
      id: '5',
      name: 'Reporte de Problemas por Servicio',
      type: 'problem',
      description: 'Problemas más frecuentes por servicio (Redes, Soporte, Programación)',
      createdAt: '2024-03-15T11:00:00',
      lastRun: '2024-04-13T10:00:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Fecha Inicio', type: 'date', value: '2024-01-01' },
        { id: 'p2', name: 'Fecha Fin', type: 'date', value: '2024-04-13' }
      ]
    },
    {
      id: '7',
      name: 'Reporte por Tipo de Servicio',
      type: 'service',
      description: 'Distribución de tickets por categoría de servicio',
      createdAt: '2024-03-20T15:45:00',
      lastRun: '2024-04-08T16:30:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Servicio', type: 'multiselect', value: ['hardware', 'software'], options: ['hardware', 'software', 'network', 'printer'] }
      ]
    },
    {
      id: '8',
      name: 'Lista de Técnicos por Servicio',
      type: 'technician',
      description: 'Listado completo de técnicos agrupados por tipo de servicio con su estado actual',
      createdAt: '2024-03-25T11:00:00',
      lastRun: '2024-04-13T10:15:00',
      status: 'active',
      parameters: []
    },
    {
      id: '9',
      name: 'Reporte de Desempeño de Técnicos',
      type: 'performance',
      description: 'Análisis de rendimiento y métricas de técnicos',
      createdAt: '2024-03-28T14:00:00',
      lastRun: '2024-04-13T09:45:00',
      status: 'active',
      parameters: []
    },
    {
      id: '10',
      name: 'Reporte de Problemas Mensuales',
      type: 'problem',
      description: 'Problemas que solicitaron ticket agrupados por mes',
      createdAt: '2024-04-01T10:00:00',
      lastRun: '2024-04-13T10:00:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Fecha Inicio', type: 'date', value: '2024-01-01' },
        { id: 'p2', name: 'Fecha Fin', type: 'date', value: '2024-04-13' }
      ]
    },
    {
      id: '11',
      name: 'Reporte de Sistemas y Problemáticas',
      type: 'problem',
      description: 'Sistemas de programación y sus problemáticas más comunes',
      createdAt: '2024-04-01T11:00:00',
      lastRun: '2024-04-13T11:00:00',
      status: 'active',
      parameters: [
        { id: 'p1', name: 'Fecha Inicio', type: 'date', value: '2024-01-01' },
        { id: 'p2', name: 'Fecha Fin', type: 'date', value: '2024-04-13' }
      ]
    },
    {
      id: '12',
      name: 'Reporte de Turnos de Técnicos',
      type: 'shift',
      description: 'Técnicos que trabajan por día hasta las 5 PM',
      createdAt: '2024-05-07T10:00:00',
      lastRun: '2024-05-07T10:00:00',
      status: 'active',
      parameters: []
    }
  ]);

  // PHP-PRO: Load executive summary from backend
  const loadExecutiveSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await ApiService.getExecutiveSummary();
      if (response.success && response.data) {
        setExecutiveSummary(response.data);
        console.log('[v0] Executive summary loaded from backend:', response.data);
      } else {
        console.error('[v0] Error loading executive summary:', response.message);
      }
    } catch (error) {
      console.error('[v0] Error loading executive summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Load office data from backend - Limited to top 5 offices with most tickets
  const loadOfficeData = async () => {
    try {
      const response = await ApiService.getOffices();
      if (response.success && response.data && Array.isArray(response.data)) {
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
        // Sort by ticket count and take top 5
        const sortedOffices = [...response.data]
          .sort((a: any, b: any) => {
            const aTickets = a.ticket_count || a.total_tickets || 0;
            const bTickets = b.ticket_count || b.total_tickets || 0;
            return bTickets - aTickets;
          })
          .slice(0, 5);
        
        const mappedData = sortedOffices.map((office: any, index: number) => ({
          label: office.Name_Office || office.name_office || 'Sin nombre',
          value: office.ticket_count || office.total_tickets || 0,
          color: colors[index % colors.length]
        }));
        setOfficeData(mappedData);
        console.log('[v0] Office data loaded from backend (top 5):', mappedData);
      }
    } catch (error) {
      console.error('[v0] Error loading office data:', error);
    }
  };

  // Load executive summary and office data on component mount and tab change
  React.useEffect(() => {
    if (activeTab === 'overview') {
      loadExecutiveSummary();
      loadOfficeData();
    }
  }, [activeTab]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRunReport = (reportId: string) => {
    setLoading(true);

    // Handle specific reports
    if (reportId === '1') {
      // Reporte General de Tickets
      handleDownloadGeneralTicketsReportPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '5') {
      // Reporte de Problemas por Servicio
      handleDownloadProblemReportPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '7') {
      // Reporte por Tipo de Servicio
      handleDownloadServiceTypeReportPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '10') {
      // Reporte de Problemas Mensuales
      handleDownloadMonthlyProblemReportPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '11') {
      // Reporte de Sistemas y Problemáticas
      handleDownloadSystemsReportPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '12') {
      // Reporte de Turnos de Técnicos
      handleDownloadTechnicianShiftsPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '8') {
      handleDownloadTechnicianReportPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '9') {
      handleDownloadTechnicianPerformancePDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (reportId === '3') {
      handleDownloadOfficeReportPDF().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      // Simulate running other reports
      setTimeout(() => {
        setLoading(false);
        console.log('Running report:', reportId);
      }, 1500);
    }
  };

  const handleExportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report ${reportId} as ${format}`);
    
    // Handle specific reports for PDF export
    if (format === 'pdf') {
      if (reportId === '5') {
        // Reporte de Problemas por Servicio
        handleDownloadProblemReportPDF();
      } else if (reportId === '7') {
        // Reporte por Tipo de Servicio
        handleDownloadProblemReportPDF();
      } else if (reportId === '10') {
        // Reporte de Problemas Mensuales
        handleDownloadMonthlyProblemReportPDF();
      } else if (reportId === '11') {
        // Reporte de Sistemas y Problemáticas
        handleDownloadSystemsReportPDF();
      } else if (reportId === '8') {
        // Reporte de Técnicos por Servicio
        handleDownloadTechnicianReportPDF();
      } else if (reportId === '9') {
        // Reporte de Desempeño de Técnicos
        handleDownloadTechnicianPerformancePDF();
      } else if (reportId === '3') {
        // Reporte por Oficina
        handleDownloadOfficeReportPDF();
      } else {
        // Simulate export for other reports
        alert(`Exportando reporte ${reportId} como PDF (simulado)`);
      }
    } else {
      // Simulate Excel/CSV export
      alert(`Exportando reporte ${reportId} como ${format} (simulado)`);
    }
  };

  const handleDownloadTechnicianReportPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte de técnicos agrupados por servicio...');
      
      // Generate PDF grouped by service using direct jsPDF
      await generateTechnicianReportByService();
      
      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadTechnicianPerformancePDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte de desempeño de técnicos...');
      
      // Generate PDF of technician performance metrics using direct jsPDF
      await generateTechnicianPerformanceReport();
      
      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadOfficeReportPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte por oficina...');
      
      // Generate PDF of office distribution using direct jsPDF
      await generateOfficeReportPDF();
      
      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadProblemReportPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte de problemas por servicio...');
      
      // Generate PDF of problem report using direct jsPDF - PHP-PRO
      await generateProblemReportPDF();
      
      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadMonthlyProblemReportPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte de problemas mensuales...');
      
      // Generate PDF of monthly problem report using direct jsPDF - PHP-PRO
      await generateMonthlyProblemReportPDF();
      
      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadSystemsReportPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte de sistemas y problemáticas...');

      // Generate PDF of systems and problems report using direct jsPDF - PHP-PRO
      await generateSystemsReportPDF();

      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadServiceTypeReportPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte por tipo de servicio...');

      // Generate PDF of service type distribution report using direct jsPDF - PHP-PRO
      await generateServiceTypeReportPDF();

      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadTechnicianShiftsPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte de turnos de técnicos...');

      // Generate PDF of technician shifts report using direct jsPDF - PHP-PRO
      await generateTechnicianShiftsPDF();

      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadGeneralTicketsReportPDF = async (): Promise<void> => {
    try {
      console.log('Generando reporte general de tickets...');

      // Generate PDF of general tickets report using direct jsPDF - PHP-PRO
      await generateGeneralTicketsReportPDF();

      console.log('PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const generateTechnicianReportByService = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');
    
    // Fetch all technicians grouped by service from API - PHP-PRO
    const response = await ApiService.getAllTechniciansGroupedByService();
    console.log('API Response:', response);
    console.log('API Data structure:', JSON.stringify(response.data, null, 2));
    
    // Use real data or fallback to mock data - PHP-PRO
    const groupedData = response.success && response.data 
      ? response.data 
      : getMockGroupedTechnicians();
    
    console.log('GroupedData structure:', JSON.stringify(groupedData, null, 2));
    
    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Técnicos por Servicio', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${currentDate}`, 105, 58, { align: 'center' });
    
    let yPosition = 70;
    let serviceIndex = 1;
    
    // Handle the real backend data structure
    let servicesData: Record<string, any[]> = {};
    
    if (Array.isArray(groupedData) && groupedData.length > 0 && groupedData[0].service_name) {
      // Backend returns array of service objects with nested technicians
      console.log('Backend data structure detected, processing...');
      servicesData = {};
      
      groupedData.forEach((serviceGroup: any) => {
        const serviceName = serviceGroup.service_name;
        const technicians = serviceGroup.technicians || [];
        
        console.log(`Processing service: ${serviceName}, technicians:`, technicians);
        
        // Transform technician data to match expected format
        const transformedTechnicians = technicians.map((tech: any) => ({
          ...tech,
          technician_name: `${tech.First_Name} ${tech.Last_Name}`,
          technician_status: tech.Status
        }));
        
        servicesData[serviceName] = transformedTechnicians;
      });
      
      console.log('Transformed services data:', servicesData);
      
    } else if (Array.isArray(groupedData)) {
      // If API returns flat array, group by service
      console.log('Data is flat array, grouping by service...');
      servicesData = groupTechniciansByService(groupedData);
    } else if (typeof groupedData === 'object') {
      // If API returns object, use directly
      console.log('Data is object, using directly...');
      servicesData = groupedData;
    } else {
      console.error('Unexpected data structure:', groupedData);
      servicesData = getMockGroupedTechnicians();
    }
    
    // Generate sections for each service - pdf-best-practices
    for (const serviceName in servicesData) {
      const technicians = servicesData[serviceName];
      
      console.log(`Service: ${serviceName}, Technicians:`, technicians);
      
      // Validate technicians is an array - PHP-PRO
      if (!Array.isArray(technicians)) {
        console.error(`Technicians for ${serviceName} is not an array:`, technicians);
        continue;
      }
      
      // Check for page break
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Service section header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${serviceIndex}. ${serviceName}`, 20, yPosition);
      yPosition += 10;
      
      // Table header for this service (NO ID column)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre', 20, yPosition);
      doc.text('Estado', 120, yPosition);
      yPosition += 2;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 7;
      
      // Technicians for this service
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      technicians.forEach((tech: any) => {
        // Corregir extracción de nombre - revisar múltiples campos posibles
        const name = tech.technician_name || 
                   (tech.First_Name && tech.Last_Name ? `${tech.First_Name} ${tech.Last_Name}` : null) ||
                   tech.Full_Name || 
                   tech.nombre || 
                   tech.name || 
                   `${tech.First_Name || ''} ${tech.Last_Name || ''}`.trim() ||
                   'N/A';
        
        const status = tech.technician_status || tech.Status || tech.status || 'Desconocido';
        
        console.log('Processing technician:', {
          tech,
          extractedName: name,
          extractedStatus: status
        });
        
        doc.text(name, 20, yPosition);
        doc.text(status, 120, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      serviceIndex++;
    }
    
    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    
    // Save PDF
    const filename = `reporte-tecnicos-por-servicio-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateTechnicianPerformanceReport = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');
    
    // Fetch technician performance metrics from API - PHP-PRO
    const response = await ApiService.getTechnicianPerformanceMetrics();
    console.log('Performance API Response:', response);
    console.log('Performance Data structure:', JSON.stringify(response.data, null, 2));
    
    // Use real data or fallback to mock data
    const performanceData = response.success && response.data 
      ? response.data 
      : ApiService.getMockTechnicianPerformanceMetrics().data;
    
    console.log('Performance data:', performanceData);
    
    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Desempeño de Técnicos', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${currentDate}`, 105, 58, { align: 'center' });
    
    let yPosition = 70;
    let serviceIndex = 1;
    
    // Handle grouped data structure (backend returns grouped by service)
    if (typeof performanceData === 'object' && !Array.isArray(performanceData)) {
      // Backend returns grouped data: { "Redes": [...], "Soporte": [...] }
      console.log('Processing grouped performance data...');
      
      for (const serviceName in performanceData) {
        const technicians = performanceData[serviceName];
        
        console.log(`Processing service: ${serviceName}, technicians:`, technicians);
        
        // Check for page break
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Service section header with background
        doc.setFillColor(59, 130, 246); // Blue background
        doc.setTextColor(255, 255, 255); // White text
        doc.rect(20, yPosition - 8, 170, 12, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${serviceIndex}. ${serviceName}`, 25, yPosition);
        yPosition += 12;
        
        // Table header with background
        doc.setFillColor(240, 240, 240); // Light gray background
        doc.setTextColor(0, 0, 0); // Black text
        doc.rect(20, yPosition - 2, 170, 10, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Nombre del Técnico', 25, yPosition + 4);
        doc.text('Tickets', 110, yPosition + 4, { align: 'center' });
        doc.text('Tiempo Promedio', 145, yPosition + 4, { align: 'center' });
        doc.text('Rendimiento', 175, yPosition + 4, { align: 'center' });
        yPosition += 12;
        
        // Table border
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, yPosition - 14, 170, technicians.length * 10 + 2);
        
        // Calculate performance metrics for comparison within service
        const serviceMetrics = technicians.map((tech: any) => ({
          name: tech.name,
          resolvedTickets: tech.resolved_tickets || 0,
          avgTime: tech.avg_resolution_time || 0
        }));
        
        // Calculate percentiles for fair comparison
        const sortedByTime = [...serviceMetrics].sort((a, b) => a.avgTime - b.avgTime);
        const sortedByTickets = [...serviceMetrics].sort((a, b) => b.resolvedTickets - a.resolvedTickets);
        
        // Technicians for this service
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        technicians.forEach((tech: any, index: number) => {
          // Check for page break
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
            
            // Repeat service header and table header on new page
            doc.setFillColor(59, 130, 246);
            doc.setTextColor(255, 255, 255);
            doc.rect(20, yPosition - 8, 170, 12, 'F');
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${serviceIndex}. ${serviceName} (cont.)`, 25, yPosition);
            yPosition += 12;
            
            doc.setFillColor(240, 240, 240);
            doc.setTextColor(0, 0, 0);
            doc.rect(20, yPosition - 2, 170, 10, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Nombre del Técnico', 25, yPosition + 4);
            doc.text('Tickets', 110, yPosition + 4, { align: 'center' });
            doc.text('Tiempo Promedio', 145, yPosition + 4, { align: 'center' });
            doc.text('Rendimiento', 175, yPosition + 4, { align: 'center' });
            yPosition += 12;
            
            doc.setDrawColor(200, 200, 200);
            doc.rect(20, yPosition - 14, 170, (technicians.length - index) * 10 + 2);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
          }
          
          const name = tech.name || 'N/A';
          const resolvedTickets = tech.resolved_tickets || 0;
          const avgTime = tech.avg_resolution_time || 0;
          
          // Calculate comparative performance rating
          let performance = 'Promedio';
          let performanceColor = [255, 255, 0]; // Yellow
          
          // Find percentiles
          const timePercentile = sortedByTime.findIndex(t => t.name === name) / sortedByTime.length;
          const ticketsPercentile = sortedByTickets.findIndex(t => t.name === name) / sortedByTickets.length;
          
          // Calculate combined performance score (0-100)
          const timeScore = (1 - timePercentile) * 50; // Lower time = higher score
          const ticketsScore = ticketsPercentile * 50; // Higher tickets = higher score
          const totalScore = timeScore + ticketsScore;
          
          // Determine performance based on percentile ranking
          if (totalScore >= 80) {
            performance = 'Excelente';
            performanceColor = [0, 128, 0]; // Green
          } else if (totalScore >= 60) {
            performance = 'Bueno';
            performanceColor = [255, 165, 0]; // Orange
          } else if (totalScore >= 40) {
            performance = 'Regular';
            performanceColor = [255, 255, 0]; // Yellow
          } else {
            performance = 'Bajo';
            performanceColor = [255, 0, 0]; // Red
          }
          
          // Add performance score for reference
          const performanceScore = Math.round(totalScore);
          
          // Alternate row colors
          if (index % 2 === 0) {
            doc.setFillColor(248, 248, 248);
            doc.rect(20, yPosition - 1, 170, 8, 'F');
          }
          
          console.log('Processing technician performance:', {
            tech,
            extractedName: name,
            extractedTickets: resolvedTickets,
            extractedTime: avgTime,
            timePercentile: (timePercentile * 100).toFixed(1) + '%',
            ticketsPercentile: (ticketsPercentile * 100).toFixed(1) + '%',
            totalScore: performanceScore,
            performance
          });
          
          doc.setTextColor(0, 0, 0);
          doc.text(name, 25, yPosition + 4);
          doc.text(String(resolvedTickets), 110, yPosition + 4, { align: 'center' });
          doc.text(`${avgTime}h`, 145, yPosition + 4, { align: 'center' });
          
          // Performance indicator with color and score
          doc.setTextColor(performanceColor[0], performanceColor[1], performanceColor[2]);
          doc.text(`${performance} (${performanceScore})`, 175, yPosition + 4, { align: 'center' });
          doc.setTextColor(0, 0, 0);
          
          yPosition += 8;
        });
        
        yPosition += 8;
        
        yPosition += 10;
        serviceIndex++;
      }
      
    } else {
      // Fallback for flat array structure
      console.log('Processing flat performance data...');
      
      // Table header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre del Técnico', 20, yPosition);
      doc.text('Servicio', 80, yPosition);
      doc.text('Tickets Resueltos', 130, yPosition);
      doc.text('Tiempo Promedio (hrs)', 160, yPosition);
      yPosition += 5;
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Performance data rows
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      performanceData.forEach((tech: any) => {
        // Check for page break
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
          
          // Repeat table header on new page
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Nombre del Técnico', 20, yPosition);
          doc.text('Servicio', 80, yPosition);
          doc.text('Tickets Resueltos', 130, yPosition);
          doc.text('Tiempo Promedio (hrs)', 160, yPosition);
          yPosition += 5;
          doc.setLineWidth(0.5);
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 10;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
        }
        
        const name = tech.name || 'N/A';
        const service = tech.service || 'N/A';
        const resolvedTickets = tech.resolved_tickets || 0;
        const avgTime = tech.avg_resolution_time || 0;
        
        doc.text(name, 20, yPosition);
        doc.text(service, 80, yPosition);
        doc.text(String(resolvedTickets), 130, yPosition, { align: 'center' });
        doc.text(String(avgTime), 160, yPosition, { align: 'center' });
        yPosition += 8;
      });
    }
    
    // Summary statistics with improved design
    yPosition += 15;
    
    // Check if we need a new page for summary
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Summary box with background - adjusted size to fit within bounds
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 45, 'FD');
    
    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);
    
    yPosition += 12;
    
    // Calculate totals from grouped data
    let totalTechnicians = 0;
    let totalResolved = 0;
    let totalAvgTime = 0;
    let excellentCount = 0;
    let goodCount = 0;
    let regularCount = 0;
    let lowCount = 0;
    
    if (typeof performanceData === 'object' && !Array.isArray(performanceData)) {
      // Calculate from grouped data
      for (const serviceName in performanceData) {
        const technicians = performanceData[serviceName];
        totalTechnicians += technicians.length;
        totalResolved += technicians.reduce((sum: number, tech: any) => sum + (tech.resolved_tickets || 0), 0);
        totalAvgTime += technicians.reduce((sum: number, tech: any) => sum + (tech.avg_resolution_time || 0), 0);
        
        // Count performance levels based on comparative scores
        technicians.forEach((tech: any) => {
          // Recalculate performance score for summary
          const serviceMetrics = technicians.map((t: any) => ({
            name: t.name,
            resolvedTickets: t.resolved_tickets || 0,
            avgTime: t.avg_resolution_time || 0
          }));
          
          const sortedByTime = [...serviceMetrics].sort((a, b) => a.avgTime - b.avgTime);
          const sortedByTickets = [...serviceMetrics].sort((a, b) => b.resolvedTickets - a.resolvedTickets);
          
          const timePercentile = sortedByTime.findIndex((t: any) => t.name === tech.name) / sortedByTime.length;
          const ticketsPercentile = sortedByTickets.findIndex((t: any) => t.name === tech.name) / sortedByTickets.length;
          
          const timeScore = (1 - timePercentile) * 50;
          const ticketsScore = ticketsPercentile * 50;
          const totalScore = timeScore + ticketsScore;
          
          if (totalScore >= 80) excellentCount++;
          else if (totalScore >= 60) goodCount++;
          else if (totalScore >= 40) regularCount++;
          else lowCount++;
        });
      }
    } else {
      // Calculate from flat array
      totalTechnicians = performanceData.length;
      totalResolved = performanceData.reduce((sum: number, tech: any) => sum + (tech.resolved_tickets || 0), 0);
      totalAvgTime = performanceData.reduce((sum: number, tech: any) => sum + (tech.avg_resolution_time || 0), 0);
    }
    
    const avgResolutionTime = totalTechnicians > 0 ? totalAvgTime / totalTechnicians : 0;
    
    // Summary statistics in columns with better contrast
    doc.setTextColor(50, 50, 50); // Dark gray for better contrast
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Left column
    doc.text('• Total de Técnicos:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue for contrast
    doc.text(String(totalTechnicians), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50); // Reset to dark gray
    doc.setFont('helvetica', 'normal');
    doc.text('• Tickets Resueltos:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue for contrast
    doc.text(String(totalResolved), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50); // Reset to dark gray
    doc.setFont('helvetica', 'normal');
    doc.text('• Tiempo Promedio:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue for contrast
    doc.text(`${avgResolutionTime.toFixed(2)} horas`, 100, yPosition);
    
    // Right column - Performance distribution with better colors
    if (excellentCount > 0 || goodCount > 0 || regularCount > 0 || lowCount > 0) {
      yPosition -= 21; // Go back to align with first row (moved up more)
      doc.setTextColor(50, 50, 50); // Dark gray
      doc.setFont('helvetica', 'normal');
      doc.text('Distribución Rendimiento:', 120, yPosition);
      
      yPosition += 7;
      // Excelente - Green with dark text
      doc.setFillColor(0, 200, 0); // Bright green
      doc.setTextColor(0, 0, 0); // Black text on green
      doc.rect(120, yPosition - 3, 65, 6, 'F');
      doc.text(`Excelente: ${excellentCount}`, 123, yPosition + 1);
      
      yPosition += 7;
      // Bueno - Orange with dark text
      doc.setFillColor(255, 140, 0); // Bright orange
      doc.setTextColor(0, 0, 0); // Black text on orange
      doc.rect(120, yPosition - 3, 65, 6, 'F');
      doc.text(`Bueno: ${goodCount}`, 123, yPosition + 1);
      
      yPosition += 7;
      // Regular - Yellow with dark text
      doc.setFillColor(255, 200, 0); // Bright yellow
      doc.setTextColor(0, 0, 0); // Black text on yellow (changed from yellow to black)
      doc.rect(120, yPosition - 3, 65, 6, 'F');
      doc.text(`Regular: ${regularCount}`, 123, yPosition + 1);
      
      yPosition += 7;
      // Bajo - Red with white text
      doc.setFillColor(220, 0, 0); // Bright red
      doc.setTextColor(255, 255, 255); // White text on red
      doc.rect(120, yPosition - 3, 65, 6, 'F');
      doc.text(`Bajo: ${lowCount}`, 123, yPosition + 1);
    }
    
    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    
    // Save PDF
    const filename = `reporte-desempeno-tecnicos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const groupTechniciansByService = (technicians: any[]): Record<string, any[]> => {
    const grouped: Record<string, any[]> = {};
    
    technicians.forEach((tech: any) => {
      console.log('Grouping technician:', tech);
      
      const service = tech.Type_Service || 
                    tech.primary_service || 
                    tech.service || 
                    'Soporte';
      
      if (!grouped[service]) {
        grouped[service] = [];
      }
      
      // Ensure technician has proper name fields
      const processedTech = {
        ...tech,
        technician_name: `${tech.First_Name || ''} ${tech.Last_Name || ''}`.trim() || tech.technician_name || 'N/A',
        technician_status: tech.Status || tech.technician_status || 'Desconocido'
      };
      
      grouped[service].push(processedTech);
    });
    
    console.log('Grouped technicians:', grouped);
    return grouped;
  };

  const generateOfficeReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');
    
    // Fetch office report data from API - PHP-PRO
    const response = await ApiService.getOfficeReport();
    console.log('Office Report API Response:', response);
    console.log('Office Report Data structure:', JSON.stringify(response.data, null, 2));
    
    // Use real data or fallback to mock data
    const officeData = response.success && response.data 
      ? response.data 
      : ApiService.getMockOfficeReport().data;
    
    console.log('Office data:', officeData);
    
    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Tickets por Oficina', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${currentDate}`, 105, 58, { align: 'center' });
    
    let yPosition = 70;
    let officeIndex = 1;
    
    // Process office data - PHP-PRO simplified
    if (Array.isArray(officeData)) {
      // Table header
      doc.setFillColor(59, 130, 246); // Blue background
      doc.setTextColor(255, 255, 255); // White text
      doc.rect(20, yPosition - 8, 170, 12, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTES POR OFICINA', 25, yPosition);
      yPosition += 12;
      
      // Table header with background - simplified columns
      doc.setFillColor(240, 240, 240); // Light gray background
      doc.setTextColor(0, 0, 0); // Black text
      doc.rect(20, yPosition - 2, 170, 10, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre de Oficina', 25, yPosition + 4);
      doc.text('Tickets Resueltos', 100, yPosition + 4, { align: 'center' });
      doc.text('Tiempo Promedio (hrs)', 140, yPosition + 4, { align: 'center' });
      yPosition += 12;
      
      // Table border
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, yPosition - 14, 170, officeData.length * 10 + 2);
      
      // Office data rows
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      officeData.forEach((office: any, index: number) => {
        // Check for page break
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
          
          // Repeat table header on new page
          doc.setFillColor(59, 130, 246);
          doc.setTextColor(255, 255, 255);
          doc.rect(20, yPosition - 8, 170, 12, 'F');
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('REPORTES POR OFICINA (cont.)', 25, yPosition);
          yPosition += 12;
          
          doc.setFillColor(240, 240, 240);
          doc.setTextColor(0, 0, 0);
          doc.rect(20, yPosition - 2, 170, 10, 'F');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Nombre de Oficina', 25, yPosition + 4);
          doc.text('Tickets Resueltos', 100, yPosition + 4, { align: 'center' });
          doc.text('Tiempo Promedio (hrs)', 140, yPosition + 4, { align: 'center' });
          yPosition += 12;
          
          doc.setDrawColor(200, 200, 200);
          doc.rect(20, yPosition - 14, 170, (officeData.length - index) * 10 + 2);
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
        }
        
        const name = office.display_name || office.name || 'N/A';
        const resolvedCount = office.resolved_count || 0;
        const avgTime = office.avg_resolution_time || 0;
        
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(20, yPosition - 1, 170, 8, 'F');
        }
        
        console.log('Processing office data:', {
          office,
          extractedName: name,
          extractedResolved: resolvedCount,
          extractedAvgTime: avgTime
        });
        
        doc.setTextColor(0, 0, 0);
        doc.text(name, 25, yPosition + 4);
        doc.text(String(resolvedCount), 100, yPosition + 4, { align: 'center' });
        doc.text(String(avgTime), 140, yPosition + 4, { align: 'center' });
        yPosition += 8;
      });
      
      yPosition += 10;
    }
    
    // Summary statistics
    yPosition += 15;
    
    // Check if we need a new page for summary
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Summary box with background
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 40, 'FD');
    
    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);
    
    yPosition += 12;
    
    // Calculate totals - PHP-PRO simplified
    let totalOffices = 0;
    let totalResolved = 0;
    let totalAvgTime = 0;
    
    if (Array.isArray(officeData)) {
      totalOffices = officeData.length;
      totalResolved = officeData.reduce((sum: number, office: any) => sum + (office.resolved_count || 0), 0);
      totalAvgTime = officeData.reduce((sum: number, office: any) => sum + (office.avg_resolution_time || 0), 0);
    }
    
    const avgResolutionTime = totalAvgTime > 0 && totalOffices > 0 ? totalAvgTime / totalOffices : 0;
    
    // Summary statistics with better contrast
    doc.setTextColor(50, 50, 50); // Dark gray for better contrast
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Left column
    doc.text('• Total de Oficinas:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue for contrast
    doc.text(String(totalOffices), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50); // Reset to dark gray
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Tickets Resueltos:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue for contrast
    doc.text(String(totalResolved), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50); // Reset to dark gray
    doc.setFont('helvetica', 'normal');
    doc.text('• Tiempo Promedio:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue for contrast
    doc.text(`${avgResolutionTime.toFixed(2)} horas`, 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50); // Reset to dark gray
    doc.setFont('helvetica', 'normal');
    doc.text('• Eficiencia General:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue for contrast
    const efficiency = avgResolutionTime > 0 && avgResolutionTime <= 4 ? 'Excelente' : 
                      avgResolutionTime <= 6 ? 'Buena' : 
                      avgResolutionTime <= 8 ? 'Regular' : 'Mejorable';
    doc.text(efficiency, 100, yPosition);
    
    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    
    // Save PDF
    const filename = `reporte-por-oficina-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateProblemReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');
    
    // Fetch problem report data from API - PHP-PRO
    const response = await ApiService.getProblemReport();
    console.log('Problem Report API Response:', response);
    console.log('Problem Report Data structure:', JSON.stringify(response.data, null, 2));
    
    // Use real data or fallback to mock data
    const problemData = response.success && response.data 
      ? response.data 
      : [];
    
    console.log('Problem data:', problemData);
    
    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte por Tipo de Servicio - Mensual', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });
    
    yPosition += 20;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPosition - 2, 180, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Servicio', 20, yPosition + 4);
    doc.text('Total', 50, yPosition + 4);
    doc.text('Cerr', 80, yPosition + 4);
    doc.text('Oficinas', 105, yPosition + 4);
    doc.text('Técnicos', 130, yPosition + 4);
    doc.text('Prob. Frec', 155, yPosition + 4);
    doc.text('%', 185, yPosition + 4);
    yPosition += 12;
    
    // Data rows
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    problemData.forEach((service: any, index: number) => {
      // Check for page break
      if (yPosition > 235) {
        doc.addPage();
        yPosition = 20;
        
        // Repeat header on new page
        if (headerImage) {
          doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte por Tipo de Servicio - Mensual (cont.)', 25, 50);
        yPosition += 20;
        
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(15, yPosition - 2, 180, 10, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Servicio', 20, yPosition + 4);
        doc.text('Total', 50, yPosition + 4);
        doc.text('Cerr', 80, yPosition + 4);
        doc.text('Oficinas', 105, yPosition + 4);
        doc.text('Técnicos', 130, yPosition + 4);
        doc.text('Prob. Frec', 155, yPosition + 4);
        doc.text('%', 185, yPosition + 4);
        yPosition += 12;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }
      
      const servicio = service.tipo_servicio || 'N/A';
      const total = service.total_tickets_mes || 0;
      const cerrados = service.cerrados_mes || 0;
      const oficinas = service.oficinas_atendidas_mes || 0;
      const tecnicos = service.tecnicos_involucrados_mes || 0;
      const problemaFrec = service.problematica_mas_frecuente_mes || 'N/A';
      const porcentaje = service.porcentaje_mes_actual || 0;
      
      // Truncate service name if too long
      const maxServiceNameLength = 12;
      const truncatedService = servicio.length > maxServiceNameLength 
        ? servicio.substring(0, maxServiceNameLength) + '...' 
        : servicio;
      
      // Truncate problem name if too long
      const maxProblemNameLength = 12;
      const truncatedProblem = problemaFrec.length > maxProblemNameLength 
        ? problemaFrec.substring(0, maxProblemNameLength) + '...' 
        : problemaFrec;
      
      // Draw content
      doc.setTextColor(0, 0, 0);
      doc.text(truncatedService, 20, yPosition + 5);
      doc.text(String(total), 50, yPosition + 5, { align: 'center' });
      doc.text(String(cerrados), 80, yPosition + 5, { align: 'center' });
      doc.text(String(oficinas), 105, yPosition + 5, { align: 'center' });
      doc.text(String(tecnicos), 130, yPosition + 5, { align: 'center' });
      doc.text(truncatedProblem, 155, yPosition + 5);
      doc.setTextColor(59, 130, 246);
      doc.text(String(porcentaje) + '%', 185, yPosition + 5, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      
      // Draw border around each row
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(15, yPosition, 180, 10);
      
      yPosition += 10;
    });
    
    yPosition += 15;
    
    // Summary statistics
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Calculate totals
    const totalServices = problemData.length;
    const totalTickets = problemData.reduce((sum: number, item: any) => sum + (item.total_tickets_mes || 0), 0);
    const totalResolved = problemData.reduce((sum: number, item: any) => sum + (item.resueltos_mes || 0), 0);
    const avgTime = problemData.length > 0 
      ? (problemData.reduce((sum: number, item: any) => sum + (item.tiempo_promedio_horas_mes || 0), 0) / problemData.length).toFixed(2)
      : '0.00';
    
    // Summary box with background
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(15, yPosition - 5, 180, 40, 'FD');
    
    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 25, yPosition + 2);
    
    yPosition += 12;
    
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Servicios:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalServices), 95, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Tickets:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalTickets), 95, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Resueltos:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalResolved), 95, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Tiempo Promedio (hrs):', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(avgTime), 95, yPosition);
    
    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    
    // Save PDF
    const filename = `reporte-tipo-servicio-mensual-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateMonthlyProblemReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');
    
    // Fetch monthly problem report data from API - PHP-PRO
    const response = await ApiService.getMonthlyProblemReport();
    console.log('Monthly Problem Report API Response:', response);
    
    // Use real data or fallback to mock data
    const problemData = response.success && response.data 
      ? response.data 
      : ApiService.getMockProblemReport().data;
    
    console.log('Problem data:', problemData);
    
    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Problemas Mensuales', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });
    
    yPosition += 20;
    
    // Group by month using month_name from backend
    const groupedData = problemData.reduce((acc: any, item: any) => {
      const monthKey = item.month_name || item.month_key || 'Sin clasificar';
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(item);
      return acc;
    }, {});
    
    // Iterate through months
    for (const [monthName, problems] of Object.entries(groupedData)) {
      const monthProblems = problems as any[];
      
      // Check for page break
      if (yPosition > 235) {
        doc.addPage();
        yPosition = 20;
        
        // Repeat header on new page
        if (headerImage) {
          doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Problemas Mensuales (cont.)', 25, 50);
        yPosition += 20;
        
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(20, yPosition - 8, 170, 12, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`MES: ${monthName} (cont.)`, 25, yPosition);
        yPosition += 15;
        
        doc.setFillColor(240, 240, 240);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(20, yPosition - 2, 170, 10, 'FD');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Problema', 25, yPosition + 4);
        doc.text('Tickets', 140, yPosition + 4, { align: 'center' });
        doc.text('Severidad', 170, yPosition + 4, { align: 'center' });
        yPosition += 12;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
      }
      
      // Month header with background
      doc.setFillColor(59, 130, 246);
      doc.setTextColor(255, 255, 255);
      doc.rect(20, yPosition - 2, 170, 10, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`MES: ${monthName}`, 25, yPosition + 4);
      yPosition += 15;
      
      // Table header with border
      doc.setFillColor(240, 240, 240);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(20, yPosition - 2, 170, 10, 'FD');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Problema', 25, yPosition + 4);
      doc.text('Tickets', 140, yPosition + 4, { align: 'center' });
      doc.text('Severidad', 170, yPosition + 4, { align: 'center' });
      yPosition += 12;
      
      // Problem data rows
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      monthProblems.forEach((problem: any, index: number) => {
        // Check for page break
        if (yPosition > 235) {
          doc.addPage();
          yPosition = 20;
          
          // Repeat table header on new page
          doc.setFillColor(59, 130, 246);
          doc.setTextColor(255, 255, 255);
          doc.rect(20, yPosition - 8, 170, 12, 'F');
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`MES: ${monthName} (cont.)`, 25, yPosition);
          yPosition += 15;
          
          doc.setFillColor(240, 240, 240);
          doc.setTextColor(0, 0, 0);
          doc.rect(20, yPosition - 2, 170, 10, 'F');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Problema', 25, yPosition + 4);
          doc.text('Tickets', 140, yPosition + 4, { align: 'center' });
          doc.text('Severidad', 170, yPosition + 4, { align: 'center' });
          yPosition += 12;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
        }
        
        const problemName = problem.problem_name || 'N/A';
        const ticketCount = problem.ticket_count || 0;
        const severity = problem.severity || 'N/A';
        
        // Truncate problem name if too long to fit in column
        const maxProblemNameLength = 45;
        const truncatedName = problemName.length > maxProblemNameLength 
          ? problemName.substring(0, maxProblemNameLength) + '...' 
          : problemName;
        
        // Draw content
        doc.setTextColor(0, 0, 0);
        doc.text(truncatedName, 25, yPosition + 5);
        doc.text(String(ticketCount), 140, yPosition + 5, { align: 'center' });
        
        // Color based on severity
        if (severity === 'Alta') {
          doc.setTextColor(239, 68, 68);
        } else if (severity === 'Media') {
          doc.setTextColor(245, 158, 11);
        } else {
          doc.setTextColor(34, 197, 94);
        }
        doc.text(severity, 170, yPosition + 5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        
        // Draw border around each row
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(20, yPosition, 170, 10);
        
        yPosition += 10;
      });
      
      yPosition += 15;
    }
    
    // Summary statistics
    yPosition += 15;
    
    // Check if we need a new page for summary
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Summary box with background
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 40, 'FD');
    
    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);
    
    yPosition += 12;
    
    // Calculate totals
    const totalMonths = Object.keys(groupedData).length;
    const totalProblems = problemData.length;
    const totalTickets = problemData.reduce((sum: number, item: any) => sum + (item.ticket_count || 0), 0);
    
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Meses:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalMonths), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Problemas:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalProblems), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Tickets:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalTickets), 100, yPosition);
    
    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    
    // Save PDF
    const filename = `reporte-problemas-mensuales-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateSystemsReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');
    
    // Fetch systems and problems data from API - PHP-PRO
    const response = await ApiService.getSystemsAndProblems();
    console.log('Systems and Problems API Response:', response);
    
    // Use real data or fallback to mock data
    const systemsData = response.success && response.data 
      ? response.data 
      : [];
    
    console.log('Systems data:', systemsData);
    
    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Sistemas y Problemáticas', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Área: Programación`, 105, 58, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 64, { align: 'center' });
    
    yPosition += 25;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 2, 170, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Sistema', 25, yPosition + 4);
    doc.text('Total Tickets', 85, yPosition + 4);
    doc.text('Problemática Común', 120, yPosition + 4);
    doc.text('Frecuencia', 170, yPosition + 4);
    yPosition += 12;
    
    // Data rows
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    systemsData.forEach((system: any, index: number) => {
      // Check for page break
      if (yPosition > 235) {
        doc.addPage();
        yPosition = 20;
        
        // Repeat header on new page
        if (headerImage) {
          doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Sistemas y Problemáticas (cont.)', 25, 50);
        yPosition += 20;
        
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(20, yPosition - 2, 170, 10, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Sistema', 25, yPosition + 4);
        doc.text('Total Tickets', 85, yPosition + 4);
        doc.text('Problemática Común', 120, yPosition + 4);
        doc.text('Frecuencia', 170, yPosition + 4);
        yPosition += 12;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }
      
      const sistema = system.sistema || 'N/A';
      const totalTickets = system.total_tickets || 0;
      const problematica = system.problematica_mas_comun || 'N/A';
      const frecuencia = system.frecuencia_problematica || 0;
      
      // Truncate system name if too long
      const maxSystemNameLength = 20;
      const truncatedSystem = sistema.length > maxSystemNameLength 
        ? sistema.substring(0, maxSystemNameLength) + '...' 
        : sistema;
      
      // Truncate problem name if too long
      const maxProblemNameLength = 25;
      const truncatedProblem = problematica.length > maxProblemNameLength 
        ? problematica.substring(0, maxProblemNameLength) + '...' 
        : problematica;
      
      // Draw content
      doc.setTextColor(0, 0, 0);
      doc.text(truncatedSystem, 25, yPosition + 5);
      doc.text(String(totalTickets), 85, yPosition + 5, { align: 'center' });
      doc.text(truncatedProblem, 120, yPosition + 5);
      doc.setTextColor(0, 0, 0);
      doc.text(String(frecuencia), 170, yPosition + 5, { align: 'center' });
      
      // Draw border around each row
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(20, yPosition, 170, 10);
      
      yPosition += 10;
    });
    
    yPosition += 15;
    
    // Summary statistics
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Summary box with background
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 35, 'FD');
    
    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);
    
    yPosition += 12;
    
    // Calculate totals
    const totalSystems = systemsData.length;
    const totalTickets = systemsData.reduce((sum: number, item: any) => sum + (item.total_tickets || 0), 0);
    const mostProblematicSystem = systemsData.length > 0 
      ? systemsData.reduce((max: any, system: any) => 
          (system.total_tickets || 0) > (max.total_tickets || 0) ? system : max, systemsData[0])
      : null;
    
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Sistemas:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalSystems), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Tickets:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalTickets), 100, yPosition);
    
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Sistema más problemático:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    const mostProblematicName = mostProblematicSystem ? mostProblematicSystem.sistema : 'N/A';
    const truncatedMostProblematic = mostProblematicName.length > 25 
      ? mostProblematicName.substring(0, 25) + '...' 
      : mostProblematicName;
    doc.text(truncatedMostProblematic, 100, yPosition);
    
    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    
    // Save PDF
    const filename = `reporte-sistemas-problematicas-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateServiceTypeReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    // Fetch problem report data from API - PHP-PRO
    const response = await ApiService.getProblemReport();
    console.log('Problem Report API Response:', response);

    // Use real data or fallback to mock data
    const serviceData = response.success && response.data
      ? response.data
      : [];

    console.log('Service data:', serviceData);

    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte por Tipo de Servicio', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });

    yPosition += 20;

    // Table header
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 2, 170, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Servicio', 25, yPosition + 4);
    doc.text('Total Problemas', 100, yPosition + 4);
    doc.text('Problema Principal', 140, yPosition + 4);
    yPosition += 12;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Add service data rows
    serviceData.forEach((service: any, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;

        // Add header image on new page
        if (headerImage) {
          doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte por Tipo de Servicio (cont.)', 105, 50, { align: 'center' });
        yPosition += 10;

        // Table header on new page
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(20, yPosition - 2, 170, 10, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Servicio', 25, yPosition + 4);
        doc.text('Total Problemas', 100, yPosition + 4);
        doc.text('Problema Principal', 140, yPosition + 4);
        yPosition += 12;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }

      const serviceName = service.service || 'N/A';
      const problems = service.problems || [];
      const totalProblems = problems.reduce((sum: number, p: any) => sum + (p.count || 0), 0);
      const mainProblem = problems.length > 0 ? problems[0].name : 'N/A';

      // Truncate service name if too long
      const maxServiceNameLength = 20;
      const truncatedService = serviceName.length > maxServiceNameLength
        ? serviceName.substring(0, maxServiceNameLength) + '...'
        : serviceName;

      // Truncate problem name if too long
      const maxProblemNameLength = 25;
      const truncatedProblem = mainProblem.length > maxProblemNameLength
        ? mainProblem.substring(0, maxProblemNameLength) + '...'
        : mainProblem;

      // Draw content
      doc.setTextColor(0, 0, 0);
      doc.text(truncatedService, 25, yPosition + 5);
      doc.text(String(totalProblems), 100, yPosition + 5, { align: 'center' });
      doc.text(truncatedProblem, 140, yPosition + 5);

      // Draw border around each row
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(20, yPosition, 170, 10);

      yPosition += 10;
    });

    yPosition += 15;

    // Summary statistics
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    // Summary box with background
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 30, 'FD');

    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);

    yPosition += 12;

    // Calculate totals
    const totalServices = serviceData.length;
    const totalProblems = serviceData.reduce((sum: number, service: any) => {
      const problems = service.problems || [];
      return sum + problems.reduce((s: number, p: any) => s + (p.count || 0), 0);
    }, 0);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Servicios:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalServices), 100, yPosition);

    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Problemas:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalProblems), 100, yPosition);

    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }

    // Save PDF
    const filename = `reporte-tipo-servicio-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateTechnicianShiftsPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    // Fetch technician shifts data from API - PHP-PRO
    const response = await ApiService.getTechnicianShifts();
    console.log('Technician Shifts API Response:', response);

    // Use real data or fallback to empty array
    const shiftsData = response.success && response.data
      ? response.data
      : [];

    console.log('Shifts data:', shiftsData);

    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Turnos de Técnicos', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });
    doc.text('Técnicos que trabajan hasta las 5 PM', 105, 64, { align: 'center' });

    yPosition += 25;

    // Table header with improved design
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 2, 170, 12, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Día', 30, yPosition + 5);
    doc.text('Nombre', 60, yPosition + 5);
    doc.text('Apellido', 110, yPosition + 5);
    doc.text('Hora Salida', 155, yPosition + 5);
    yPosition += 14;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Group shifts by day
    const shiftsByDay: Record<string, any[]> = {};
    shiftsData.forEach((shift: any) => {
      const day = shift['Día'] || shift.day || 'N/A';
      if (!shiftsByDay[day]) {
        shiftsByDay[day] = [];
      }
      shiftsByDay[day].push(shift);
    });

    // Day order mapping - Monday to Friday only (both English and Spanish)
    const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const dayNames: Record<string, string> = {
      'Lunes': 'Lunes',
      'Martes': 'Martes',
      'Miércoles': 'Miércoles',
      'Jueves': 'Jueves',
      'Viernes': 'Viernes'
    };

    // Filter and sort days - only Monday to Friday
    const sortedDays = Object.keys(shiftsByDay)
      .filter(day => dayOrder.includes(day))
      .sort((a, b) => {
        const orderA = dayOrder.indexOf(a);
        const orderB = dayOrder.indexOf(b);
        return orderA - orderB;
      });

    sortedDays.forEach(day => {
      // Add day header with improved design
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;

        // Add header image on new page
        if (headerImage) {
          doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Turnos de Técnicos (cont.)', 105, 50, { align: 'center' });
        yPosition += 10;

        // Table header on new page with improved design
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(20, yPosition - 2, 170, 12, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Día', 30, yPosition + 5);
        doc.text('Nombre', 60, yPosition + 5);
        doc.text('Apellido', 110, yPosition + 5);
        doc.text('Hora Salida', 155, yPosition + 5);
        yPosition += 14;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
      }

      // Day header with background
      const dayName = dayNames[day] || day;
      doc.setFillColor(230, 240, 255);
      doc.setTextColor(0, 0, 139);
      doc.rect(20, yPosition - 2, 170, 10, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(dayName, 30, yPosition + 4);
      yPosition += 12;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      // Add technicians for this day
      shiftsByDay[day].forEach((shift: any) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;

          // Add header image on new page
          if (headerImage) {
            doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
          }

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Reporte de Turnos de Técnicos (cont.)', 105, 50, { align: 'center' });
          yPosition += 10;

          // Table header on new page with improved design
          doc.setFillColor(59, 130, 246);
          doc.setTextColor(255, 255, 255);
          doc.rect(20, yPosition - 2, 170, 12, 'F');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Día', 30, yPosition + 5);
          doc.text('Nombre', 60, yPosition + 5);
          doc.text('Apellido', 110, yPosition + 5);
          doc.text('Hora Salida', 155, yPosition + 5);
          yPosition += 14;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
        }

        const firstName = shift['Nombre'] || shift.name || 'N/A';
        const lastName = shift['Apellido'] || shift.apellido || 'N/A';
        const endTime = shift['Hora Salida'] || shift.work_end_time || 'N/A';

        // Draw content with improved spacing
        doc.text('', 30, yPosition + 5); // Empty day column
        doc.text(firstName, 60, yPosition + 5);
        doc.text(lastName, 110, yPosition + 5);
        doc.text(endTime, 155, yPosition + 5);

        // Draw border around each row with improved styling
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.rect(20, yPosition - 2, 170, 10);

        yPosition += 10;
      });

      yPosition += 8;
    });

    yPosition += 15;

    // Summary statistics
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    // Summary box with background
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 30, 'FD');

    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);

    yPosition += 12;

    // Calculate totals
    const totalShifts = shiftsData.length;
    const totalDays = Object.keys(shiftsByDay).length;

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Turnos:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalShifts), 100, yPosition);

    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Días con turnos:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalDays), 100, yPosition);

    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }

    // Save PDF
    const filename = `reporte-turnos-tecnicos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateGeneralTicketsReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    // Load header and footer images
    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    // Fetch general tickets report data from API - PHP-PRO
    const response = await ApiService.getGeneralTicketsReport();
    console.log('General Tickets Report API Response:', response);

    // Use real data or fallback to empty array
    const reportData = response.success && response.data
      ? response.data
      : [];

    console.log('General tickets data:', reportData);

    // Add header image
    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte General de Tickets', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });
    doc.text('Estadísticas mensuales de tickets', 105, 64, { align: 'center' });

    yPosition += 25;

    // Table header with improved design - wider table to prevent overflow
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPosition - 2, 180, 12, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Mes', 20, yPosition + 5);
    doc.text('Total', 60, yPosition + 5);
    doc.text('Alta Prio.', 100, yPosition + 5);
    doc.text('Resueltos', 145, yPosition + 5);
    yPosition += 14;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Add report data rows
    reportData.forEach((row: any, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;

        // Add header image on new page
        if (headerImage) {
          doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte General de Tickets (cont.)', 105, 50, { align: 'center' });
        yPosition += 10;

        // Table header on new page - wider table
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(15, yPosition - 2, 180, 12, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Mes', 20, yPosition + 5);
        doc.text('Total', 60, yPosition + 5);
        doc.text('Alta Prio.', 100, yPosition + 5);
        doc.text('Resueltos', 145, yPosition + 5);
        yPosition += 14;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }

      const month = row['Mes'] || row.mes || 'N/A';
      const totalTickets = row['Total Tickets'] || row.total_tickets || 0;
      const highPriority = row['Alta Prioridad'] || row.alta_prioridad || 0;
      const resolved = row['Resueltos'] || row.resueltos || 0;

      // Draw content with improved spacing
      doc.setTextColor(0, 0, 0);
      doc.text(String(month), 20, yPosition + 5);
      doc.text(String(totalTickets), 60, yPosition + 5);
      doc.setTextColor(255, 0, 0);
      doc.text(String(highPriority), 100, yPosition + 5);
      doc.setTextColor(0, 128, 0);
      doc.text(String(resolved), 145, yPosition + 5);

      // Draw border around each row with improved styling
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.rect(15, yPosition - 2, 180, 10);

      yPosition += 10;
    });

    yPosition += 15;

    // Summary statistics
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    // Summary box with background - wider to prevent overflow
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(15, yPosition - 5, 180, 50, 'FD');

    // Summary title background
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 3, 50, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', 25, yPosition + 2);

    yPosition += 12;

    // Calculate totals
    const totalMonths = reportData.length;
    const totalTicketsAll = reportData.reduce((sum: number, row: any) => sum + (row['Total Tickets'] || 0), 0);
    const totalHighPriority = reportData.reduce((sum: number, row: any) => sum + (row['Alta Prioridad'] || 0), 0);
    const totalResolved = reportData.reduce((sum: number, row: any) => sum + (row['Resueltos'] || 0), 0);

    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Meses:', 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalMonths), 75, yPosition);

    yPosition += 6;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Tickets:', 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalTicketsAll), 75, yPosition);

    yPosition += 6;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Alta Prioridad:', 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.text(String(totalHighPriority), 75, yPosition);

    yPosition += 6;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Resueltos:', 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text(String(totalResolved), 75, yPosition);

    // Add footer image
    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }

    // Save PDF
    const filename = `reporte-general-tickets-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const getMockGroupedTechnicians = (): Record<string, any[]> => {
    return {
      'Redes': [
        { 
          technician_name: 'Carlos Díaz', 
          technician_status: 'Disponible',
          First_Name: 'Carlos', 
          Last_Name: 'Diaz', 
          Status: 'Disponible',
          primary_service: 'Redes'
        },
        { 
          technician_name: 'Amna Verez', 
          technician_status: 'Disponible',
          First_Name: 'Amna', 
          Last_Name: 'Verez', 
          Status: 'Disponible',
          primary_service: 'Redes'
        }
      ],
      'Soporte': [
        { 
          technician_name: 'Carlos Rodríguez', 
          technician_status: 'Activo',
          First_Name: 'Carlos', 
          Last_Name: 'Rodríguez', 
          Status: 'Activo',
          primary_service: 'Soporte Técnico'
        }
      ],
      'Programación': [
        { 
          technician_name: 'María González', 
          technician_status: 'Activo',
          First_Name: 'María', 
          Last_Name: 'González', 
          Status: 'Activo',
          primary_service: 'Programación'
        }
      ]
    };
  };

  const loadImageAsBase64PDF = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return '';
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
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
      case 'technician': return Users;
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
      case 'technician': return 'indigo';
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
      case 'technician': return 'Técnicos';
      default: return 'Otro';
    }
  };

  return (
    <div className="dashboard-container reports-enterprise">
      {/* Modern Sidebar */}
      <ModernSidebar />

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
            {/* No actions needed here */}
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

        </div>

        {/* Content */}
        <div className="reports-content enterprise-content">
        {activeTab === 'overview' && (
          <div className="overview-view">
            {/* PHP-PRO: KPI Hero Section - Backend Integrated */}
            <div className="kpi-hero-section">
              <div className="kpi-intro">
                <h2 className="kpi-hero-title">Dashboard Operacional</h2>
                <p className="kpi-hero-subtitle">Indicadores clave de rendimiento en tiempo real</p>
              </div>
              
              {/* PHP-PRO: Dynamic Stats from Backend */}
              <div className="enterprise-stats-grid">
                {statsData.map((stat, index) => (
                  <div key={index} className={`enterprise-stat-card stat-${stat.color}`}>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                {/* Priority Chart - PHP-PRO Backend Integration */}
                <div className="enterprise-chart-card">
                  <div className="chart-header">
                    <div className="chart-title-wrapper">
                      <div className="chart-icon">
                        <AlertTriangle size={20} />
                      </div>
                      <h4 className="chart-title">Distribución por Prioridad</h4>
                    </div>
                    <div className="chart-badge">
                      Total: {priorityData.reduce((sum, item) => sum + item.value, 0)}
                    </div>
                  </div>
                  <div className="chart-content">
                    {priorityData.map((item, index) => {
                      const total = priorityData.reduce((sum, i) => sum + i.value, 0);
                      return (
                        <div key={index} className="chart-bar-container">
                          <div className="chart-bar-label-row">
                            <span className="chart-bar-label">{item.label}</span>
                            <span className="chart-bar-percentage">
                              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                            </span>
                          </div>
                          <div className="chart-bar-wrapper">
                            <div
                              className="chart-bar"
                              style={{
                                width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                                backgroundColor: item.color
                              }}
                            ></div>
                            <span className="chart-bar-value">{item.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Office Chart - PHP-PRO Backend Integration */}
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
                    {(() => {
                      const maxValue = Math.max(...officeData.map(o => o.value), 1);
                      return officeData.map((item, index) => (
                        <div key={index} className="chart-bar-container">
                          <div className="chart-bar-label-row">
                            <span className="chart-bar-label">{item.label}</span>
                            <span className="chart-bar-percentage">
                              {maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0}%
                            </span>
                          </div>
                          <div className="chart-bar-wrapper">
                            <div
                              className="chart-bar"
                              style={{
                                width: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: item.color
                              }}
                            ></div>
                            <span className="chart-bar-value">{item.value}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Status Chart - PHP-PRO Backend Integration */}
                <div className="enterprise-chart-card">
                  <div className="chart-header">
                    <div className="chart-title-wrapper">
                      <div className="chart-icon">
                        <CheckCircle size={20} />
                      </div>
                      <h4 className="chart-title">Estado de Tickets</h4>
                    </div>
                    <div className="chart-badge">
                      Tasa: {executiveSummary?.kpi_metrics?.resolution_rate_percent?.toFixed(1) ?? 0}%
                    </div>
                  </div>
                  <div className="chart-content">
                    {statusData.map((item, index) => {
                      const total = statusData.reduce((sum, i) => sum + i.value, 0);
                      return (
                        <div key={index} className="chart-bar-container">
                          <div className="chart-bar-label-row">
                            <span className="chart-bar-label">{item.label}</span>
                            <span className="chart-bar-percentage">
                              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                            </span>
                          </div>
                          <div className="chart-bar-wrapper">
                            <div
                              className="chart-bar"
                              style={{
                                width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                                backgroundColor: item.color
                              }}
                            ></div>
                            <span className="chart-bar-value">{item.value}</span>
                          </div>
                        </div>
                      );
                    })}
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
                        <button
                          className="download-btn primary"
                          onClick={() => handleExportReport(report.id, 'pdf')}
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                          <span>Descargar PDF</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
