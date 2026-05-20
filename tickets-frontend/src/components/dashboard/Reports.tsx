import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import {
  TrendingUp,
  FileText,
  Download,
  Calendar,
  RefreshCw,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building,
  Search,
  Settings,
  Activity,
  X,
  BarChart3,
  FileBarChart,
  UserCheck,
  Timer,
  AlertOctagon,
  Layers
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
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

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [officeData, setOfficeData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshCountRef = useRef(0);
  const [refreshing, setRefreshing] = useState(false);

  const statsData: StatCard[] = useMemo(() => [
    {
      title: 'Total Tickets',
      value: executiveSummary?.kpi_metrics?.total_tickets ?? 0,
      subtitle: `${executiveSummary?.trends?.tickets_this_month ?? 0} este mes`,
      icon: FileText,
      color: 'navy'
    },
    {
      title: 'Tasa de Resolución',
      value: `${executiveSummary?.kpi_metrics?.resolution_rate_percent?.toFixed(1) ?? 0}%`,
      subtitle: `${executiveSummary?.kpi_metrics?.resolved_tickets ?? 0} resueltos`,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Tiempo Promedio',
      value: `${executiveSummary?.kpi_metrics?.avg_resolution_hours ?? 0}h`,
      subtitle: executiveSummary?.trends?.resolution_time_trend_percent < 0
        ? `Mejora ${Math.abs(executiveSummary?.trends?.resolution_time_trend_percent ?? 0)}%`
        : `Aumento ${Math.abs(executiveSummary?.trends?.resolution_time_trend_percent ?? 0)}%`,
      icon: Timer,
      color: 'gold'
    },
    {
      title: 'Tickets Críticos',
      value: executiveSummary?.priority_distribution?.critical ?? 0,
      subtitle: `${executiveSummary?.kpi_metrics?.critical_resolution_rate_percent?.toFixed(1) ?? 0}% resueltos`,
      icon: AlertOctagon,
      color: 'red'
    }
  ], [executiveSummary]);

  const reports: Report[] = [
    {
      id: '1',
      name: 'Reporte General de Tickets',
      type: 'general',
      description: 'Resumen completo de todos los tickets del sistema con estadísticas mensuales',
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
  ];

  const loadExecutiveSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await ApiService.getExecutiveSummary();
      if (response.success && response.data) {
        setExecutiveSummary(response.data);
      }
    } catch (error) {
      console.error('[Reports] Error loading executive summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadOfficeData = async () => {
    try {
      const response = await ApiService.getOffices();
      if (response.success && response.data && Array.isArray(response.data)) {
        const sortedOffices = [...response.data]
          .sort((a: any, b: any) => (b.ticket_count || b.total_tickets || 0) - (a.ticket_count || a.total_tickets || 0))
          .slice(0, 5);
        setOfficeData(sortedOffices);
      }
    } catch (error) {
      console.error('[Reports] Error loading office data:', error);
    }
  };

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingSummary(true);
    try {
      await Promise.all([loadExecutiveSummary(), loadOfficeData()]);
      setLastUpdated(new Date());
    } finally {
      if (showLoading) setLoadingSummary(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    const current = ++refreshCountRef.current;
    try {
      const response = await ApiService.getExecutiveSummary();
      if (current !== refreshCountRef.current) return;
      if (response.success && response.data) {
        setExecutiveSummary(response.data);
      }
      const officeResponse = await ApiService.getOffices();
      if (current !== refreshCountRef.current) return;
      if (officeResponse.success && officeResponse.data && Array.isArray(officeResponse.data)) {
        const sortedOffices = [...officeResponse.data]
          .sort((a: any, b: any) => (b.ticket_count || b.total_tickets || 0) - (a.ticket_count || a.total_tickets || 0))
          .slice(0, 5);
        setOfficeData(sortedOffices);
      }
      setLastUpdated(new Date());
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [loadData, refreshData]);

  useEffect(() => {
    if (lastUpdated) {
      const timer = setInterval(() => setLastUpdated(new Date(lastUpdated)), 1000);
      return () => clearInterval(timer);
    }
  }, [lastUpdated]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 600);
  };

  const getSecondsSinceUpdate = (): number => {
    if (!lastUpdated) return 0;
    return Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
  };

  const handleRunReport = (reportId: string) => {
    setLoading(true);
    if (reportId === '1') {
      handleDownloadGeneralTicketsReportPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '5') {
      handleDownloadProblemReportPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '7') {
      handleDownloadServiceTypeReportPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '10') {
      handleDownloadMonthlyProblemReportPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '11') {
      handleDownloadSystemsReportPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '12') {
      handleDownloadTechnicianShiftsPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '8') {
      handleDownloadTechnicianReportPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '9') {
      handleDownloadTechnicianPerformancePDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else if (reportId === '3') {
      handleDownloadOfficeReportPDF().then(() => setLoading(false)).catch(() => setLoading(false));
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const handleExportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    if (format === 'pdf') {
      if (reportId === '5' || reportId === '7') handleDownloadProblemReportPDF();
      else if (reportId === '10') handleDownloadMonthlyProblemReportPDF();
      else if (reportId === '11') handleDownloadSystemsReportPDF();
      else if (reportId === '8') handleDownloadTechnicianReportPDF();
      else if (reportId === '9') handleDownloadTechnicianPerformancePDF();
      else if (reportId === '3') handleDownloadOfficeReportPDF();
      else if (reportId === '1') handleDownloadGeneralTicketsReportPDF();
      else if (reportId === '12') handleDownloadTechnicianShiftsPDF();
    }
  };

  const handleDownloadTechnicianReportPDF = async (): Promise<void> => {
    try {
      await generateTechnicianReportByService();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadTechnicianPerformancePDF = async (): Promise<void> => {
    try {
      await generateTechnicianPerformanceReport();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadOfficeReportPDF = async (): Promise<void> => {
    try {
      await generateOfficeReportPDF();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadProblemReportPDF = async (): Promise<void> => {
    try {
      await generateProblemReportPDF();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadMonthlyProblemReportPDF = async (): Promise<void> => {
    try {
      await generateMonthlyProblemReportPDF();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadSystemsReportPDF = async (): Promise<void> => {
    try {
      await generateSystemsReportPDF();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadServiceTypeReportPDF = async (): Promise<void> => {
    try {
      await generateServiceTypeReportPDF();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadTechnicianShiftsPDF = async (): Promise<void> => {
    try {
      await generateTechnicianShiftsPDF();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDownloadGeneralTicketsReportPDF = async (): Promise<void> => {
    try {
      await generateGeneralTicketsReportPDF();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const generateTechnicianReportByService = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('es-ES');

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getAllTechniciansGroupedByService();
    const groupedData = response.success && response.data
      ? response.data
      : getMockGroupedTechnicians();

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Técnicos por Servicio', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${currentDate}`, 105, 58, { align: 'center' });

    let yPosition = 70;
    let serviceIndex = 1;

    let servicesData: Record<string, any[]> = {};

    if (Array.isArray(groupedData) && groupedData.length > 0 && groupedData[0].service_name) {
      servicesData = {};
      groupedData.forEach((serviceGroup: any) => {
        const serviceName = serviceGroup.service_name;
        const technicians = serviceGroup.technicians || [];
        const transformedTechnicians = technicians.map((tech: any) => ({
          ...tech,
          technician_name: `${tech.First_Name} ${tech.Last_Name}`,
          technician_status: tech.Status
        }));
        servicesData[serviceName] = transformedTechnicians;
      });
    } else if (Array.isArray(groupedData)) {
      servicesData = groupTechniciansByService(groupedData);
    } else if (typeof groupedData === 'object') {
      servicesData = groupedData;
    } else {
      servicesData = getMockGroupedTechnicians();
    }

    for (const serviceName in servicesData) {
      const technicians = servicesData[serviceName];
      if (!Array.isArray(technicians)) continue;

      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${serviceIndex}. ${serviceName}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre', 20, yPosition);
      doc.text('Estado', 120, yPosition);
      yPosition += 2;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 7;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      technicians.forEach((tech: any) => {
        const name = tech.technician_name ||
          (tech.First_Name && tech.Last_Name ? `${tech.First_Name} ${tech.Last_Name}` : null) ||
          tech.Full_Name || tech.nombre || tech.name ||
          `${tech.First_Name || ''} ${tech.Last_Name || ''}`.trim() || 'N/A';
        const status = tech.technician_status || tech.Status || tech.status || 'Desconocido';
        doc.text(name, 20, yPosition);
        doc.text(status, 120, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
      serviceIndex++;
    }

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-tecnicos-servicio-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const groupTechniciansByService = (techniciansArray: any[]): Record<string, any[]> => {
    const grouped: Record<string, any[]> = {};
    techniciansArray.forEach((tech: any) => {
      const service = tech.primary_service || tech.Type_Service || 'General';
      if (!grouped[service]) grouped[service] = [];
      grouped[service].push(tech);
    });
    return grouped;
  };

  const generateTechnicianPerformanceReport = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getTechnicianPerformanceMetrics();
    let servicesData: Record<string, any[]> = response.success && response.data
      ? response.data
      : ApiService.getMockTechnicianPerformanceMetrics().data;

    if (typeof servicesData !== 'object' || Array.isArray(servicesData)) {
      servicesData = {};
    }

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Desempeño de Técnicos', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });

    yPosition += 20;

    let serviceIndex = 1;
    for (const serviceName in servicesData) {
      const technicians = servicesData[serviceName];
      if (!Array.isArray(technicians)) continue;

      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Desempeño de Técnicos (cont.)', 105, 50, { align: 'center' });
        yPosition += 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${serviceIndex}. ${serviceName}`, 20, yPosition);
      yPosition += 10;

      doc.setFillColor(59, 130, 246);
      doc.setTextColor(255, 255, 255);
      doc.rect(20, yPosition - 2, 170, 10, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre', 25, yPosition + 4);
      doc.text('Resueltos', 90, yPosition + 4);
      doc.text('T. Prom.(h)', 130, yPosition + 4);
      doc.text('Eficiencia', 165, yPosition + 4);
      yPosition += 12;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      let totalResolved = 0;
      technicians.forEach((tech: any) => {
        if (yPosition > 245) {
          doc.addPage();
          yPosition = 20;
          if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
          yPosition += 10;
          doc.setFillColor(59, 130, 246);
          doc.setTextColor(255, 255, 255);
          doc.rect(20, yPosition - 2, 170, 10, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Nombre', 25, yPosition + 4);
          doc.text('Resueltos', 90, yPosition + 4);
          doc.text('T. Prom.(h)', 130, yPosition + 4);
          doc.text('Eficiencia', 165, yPosition + 4);
          yPosition += 12;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
        }

        const name = tech.name || tech.technician_name || tech.nombre || 'N/A';
        const resolved = tech.resolved_tickets || tech.tickets_resueltos || 0;
        const avgTime = tech.avg_resolution_time || tech.tiempo_promedio || 0;
        const efficiency = tech.efficiency || tech.eficiencia || 0;

        totalResolved += resolved;

        doc.setTextColor(0, 0, 0);
        doc.text(name, 25, yPosition + 5);
        doc.text(String(resolved), 90, yPosition + 5, { align: 'center' });
        doc.text(String(avgTime), 130, yPosition + 5, { align: 'center' });
        doc.setTextColor(34, 197, 94);
        doc.text(`${efficiency}%`, 165, yPosition + 5, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(20, yPosition, 170, 10);

        yPosition += 10;
      });

      yPosition += 10;
      serviceIndex++;
    }

    yPosition += 10;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 30, 'FD');

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);
    yPosition += 12;

    const totalTechnicians = Object.values(servicesData).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
    const totalResolvedAll = Object.values(servicesData).reduce((sum: number, arr: any[]) =>
      sum + arr.reduce((s: number, t: any) => s + (t.resolved_tickets || t.tickets_resueltos || 0), 0), 0);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Servicios:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(serviceIndex - 1), 100, yPosition);
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Técnicos:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalTechnicians), 100, yPosition);
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Resueltos:', 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalResolvedAll), 100, yPosition);

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-desempeno-tecnicos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateOfficeReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getOfficeReport();
    const officeData = response.success && response.data
      ? response.data
      : ApiService.getMockOfficeReport().data;

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte por Oficina', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });

    yPosition += 20;

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPosition - 2, 180, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Oficina', 20, yPosition + 4);
    doc.text('Total', 65, yPosition + 4);
    doc.text('Resueltos', 95, yPosition + 4);
    doc.text('Pendientes', 125, yPosition + 4);
    doc.text('T. Prom.(h)', 160, yPosition + 4);
    yPosition += 12;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    (Array.isArray(officeData) ? officeData : []).forEach((office: any, index: number) => {
      if (yPosition > 235) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte por Oficina (cont.)', 105, 50, { align: 'center' });
        yPosition += 20;
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(15, yPosition - 2, 180, 10, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Oficina', 20, yPosition + 4);
        doc.text('Total', 65, yPosition + 4);
        doc.text('Resueltos', 95, yPosition + 4);
        doc.text('Pendientes', 125, yPosition + 4);
        doc.text('T. Prom.(h)', 160, yPosition + 4);
        yPosition += 12;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }

      const name = office.office || office.Name_Office || office.name_office || 'N/A';
      const total = office.total_tickets || office.ticket_count || 0;
      const resolved = office.resolved || office.resolved_tickets || 0;
      const pending = office.pending || office.pending_tickets || 0;
      const avgTime = office.avg_time || office.avg_resolution_hours || 0;

      const truncatedName = name.length > 18 ? name.substring(0, 18) + '...' : name;

      doc.setTextColor(0, 0, 0);
      doc.text(truncatedName, 20, yPosition + 5);
      doc.text(String(total), 65, yPosition + 5, { align: 'center' });
      doc.text(String(resolved), 95, yPosition + 5, { align: 'center' });
      doc.text(String(pending), 125, yPosition + 5, { align: 'center' });
      doc.text(String(avgTime), 160, yPosition + 5, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(15, yPosition, 180, 10);

      yPosition += 10;
    });

    yPosition += 15;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    const totalTickets = (Array.isArray(officeData) ? officeData : []).reduce((sum: number, item: any) => sum + (item.total_tickets || item.ticket_count || 0), 0);
    const totalResolved = (Array.isArray(officeData) ? officeData : []).reduce((sum: number, item: any) => sum + (item.resolved || item.resolved_tickets || 0), 0);

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(15, yPosition - 5, 180, 30, 'FD');

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 25, yPosition + 2);
    yPosition += 12;

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Oficinas:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String((Array.isArray(officeData) ? officeData : []).length), 95, yPosition);
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Tickets:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalTickets), 95, yPosition);

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-oficina-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateProblemReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getProblemReport();
    const problemData = response.success && response.data
      ? response.data
      : ApiService.getMockProblemReport().data;

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Problemas por Servicio', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });

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
    (Array.isArray(problemData) ? problemData : []).forEach((service: any, index: number) => {
      if (yPosition > 235) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Problemas por Servicio (cont.)', 25, 50);
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

      const servicio = service.tipo_servicio || service.Type_Service || 'N/A';
      const total = service.total_tickets_mes || service.count || 0;
      const cerrados = service.cerrados_mes || 0;
      const oficinas = service.oficinas_atendidas_mes || 0;
      const tecnicos = service.tecnicos_involucrados_mes || 0;
      const problemaFrec = service.problematica_mas_frecuente_mes || service.problem || 'N/A';
      const porcentaje = service.porcentaje_mes_actual || 0;

      const truncatedService = servicio.length > 12 ? servicio.substring(0, 12) + '...' : servicio;
      const truncatedProblem = problemaFrec.length > 12 ? problemaFrec.substring(0, 12) + '...' : problemaFrec;

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

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(15, yPosition, 180, 10);
      yPosition += 10;
    });

    yPosition += 15;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    const totalServices = (Array.isArray(problemData) ? problemData : []).length;
    const totalTickets = (Array.isArray(problemData) ? problemData : []).reduce((sum: number, item: any) => sum + (item.total_tickets_mes || item.count || 0), 0);
    const totalResolved = (Array.isArray(problemData) ? problemData : []).reduce((sum: number, item: any) => sum + (item.resueltos_mes || 0), 0);
    const avgTime = totalServices > 0
      ? ((Array.isArray(problemData) ? problemData : []).reduce((sum: number, item: any) => sum + (item.tiempo_promedio_horas_mes || 0), 0) / totalServices).toFixed(2)
      : '0.00';

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(15, yPosition - 5, 180, 40, 'FD');

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

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-problemas-servicio-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateMonthlyProblemReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getMonthlyProblemReport();
    const problemData = response.success && response.data
      ? response.data
      : ApiService.getMockProblemReport().data;

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte por Tipo de Servicio - Mensual', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });

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
    (Array.isArray(problemData) ? problemData : []).forEach((service: any, index: number) => {
      if (yPosition > 235) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
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

      const truncatedService = servicio.length > 12 ? servicio.substring(0, 12) + '...' : servicio;
      const truncatedProblem = problemaFrec.length > 12 ? problemaFrec.substring(0, 12) + '...' : problemaFrec;

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

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(15, yPosition, 180, 10);
      yPosition += 10;
    });

    yPosition += 15;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    const totalServices = (Array.isArray(problemData) ? problemData : []).length;
    const totalTickets = (Array.isArray(problemData) ? problemData : []).reduce((sum: number, item: any) => sum + (item.total_tickets_mes || 0), 0);
    const totalResolved = (Array.isArray(problemData) ? problemData : []).reduce((sum: number, item: any) => sum + (item.resueltos_mes || 0), 0);
    const avgTime = totalServices > 0
      ? ((Array.isArray(problemData) ? problemData : []).reduce((sum: number, item: any) => sum + (item.tiempo_promedio_horas_mes || 0), 0) / totalServices).toFixed(2)
      : '0.00';

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(15, yPosition - 5, 180, 40, 'FD');

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

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-tipo-servicio-mensual-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateSystemsReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getSystemsAndProblems();
    const systemsData = response.success && response.data
      ? response.data
      : [];

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Sistemas y Problemáticas', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Área: Programación', 105, 58, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 64, { align: 'center' });

    yPosition += 25;

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
    (Array.isArray(systemsData) ? systemsData : []).forEach((system: any, index: number) => {
      if (yPosition > 235) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Sistemas y Problemáticas (cont.)', 105, 50, { align: 'center' });
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

      const name = system.system_name || system.System_Name || 'N/A';
      const totalCount = system.total_tickets || 0;
      const commonProblem = system.common_problem || system.problematica_comun || 'N/A';
      const frequency = system.frequency || system.frecuencia || 0;

      const truncatedName = name.length > 12 ? name.substring(0, 12) + '...' : name;
      const truncatedProblem = commonProblem.length > 14 ? commonProblem.substring(0, 14) + '...' : commonProblem;

      doc.setTextColor(0, 0, 0);
      doc.text(truncatedName, 25, yPosition + 5);
      doc.text(String(totalCount), 85, yPosition + 5, { align: 'center' });
      doc.text(truncatedProblem, 120, yPosition + 5);
      doc.text(String(frequency), 170, yPosition + 5, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(20, yPosition, 170, 10);
      yPosition += 10;
    });

    yPosition += 15;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    const totalSystems = (Array.isArray(systemsData) ? systemsData : []).length;
    const grandTotalTickets = (Array.isArray(systemsData) ? systemsData : []).reduce((sum: number, item: any) => sum + (item.total_tickets || 0), 0);

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 25, 'FD');

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', 30, yPosition + 2);
    yPosition += 12;

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
    doc.text(String(grandTotalTickets), 100, yPosition);

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-sistemas-problematicas-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateServiceTypeReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getProblemReport();
    const problemData = response.success && response.data
      ? response.data
      : ApiService.getMockProblemReport().data;

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte por Tipo de Servicio', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });

    yPosition += 20;

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPosition - 2, 180, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Servicio', 20, yPosition + 4);
    doc.text('Total', 65, yPosition + 4);
    doc.text('Cerrados', 100, yPosition + 4);
    doc.text('T. Prom.(h)', 140, yPosition + 4);
    doc.text('%', 180, yPosition + 4);
    yPosition += 12;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    (Array.isArray(problemData) ? problemData : []).forEach((item: any) => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte por Tipo de Servicio (cont.)', 105, 50, { align: 'center' });
        yPosition += 20;
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.rect(15, yPosition - 2, 180, 10, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Servicio', 20, yPosition + 4);
        doc.text('Total', 65, yPosition + 4);
        doc.text('Cerrados', 100, yPosition + 4);
        doc.text('T. Prom.(h)', 140, yPosition + 4);
        doc.text('%', 180, yPosition + 4);
        yPosition += 12;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }

      const name = item.tipo_servicio || item.Type_Service || 'N/A';
      const total = item.total_tickets_mes || item.count || 0;
      const closed = item.cerrados_mes || 0;
      const avgTime = item.tiempo_promedio_horas_mes || 0;
      const pct = item.porcentaje_mes_actual || 0;

      const truncatedName = name.length > 12 ? name.substring(0, 12) + '...' : name;

      doc.setTextColor(0, 0, 0);
      doc.text(truncatedName, 20, yPosition + 5);
      doc.text(String(total), 65, yPosition + 5, { align: 'center' });
      doc.text(String(closed), 100, yPosition + 5, { align: 'center' });
      doc.text(String(avgTime), 140, yPosition + 5, { align: 'center' });
      doc.setTextColor(59, 130, 246);
      doc.text(String(pct) + '%', 180, yPosition + 5, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(15, yPosition, 180, 10);
      yPosition += 10;
    });

    yPosition += 15;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(15, yPosition - 5, 180, 25, 'FD');

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', 25, yPosition + 2);
    yPosition += 12;

    const totalServicesCount = (Array.isArray(problemData) ? problemData : []).length;
    const totalTicketsCount = (Array.isArray(problemData) ? problemData : []).reduce((sum: number, item: any) => sum + (item.total_tickets_mes || item.count || 0), 0);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Servicios:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalServicesCount), 95, yPosition);
    yPosition += 7;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total Tickets:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(String(totalTicketsCount), 95, yPosition);

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-tipo-servicio-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateTechnicianShiftsPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getTechnicianShifts();
    const shiftsData = response.success && response.data
      ? response.data
      : [];

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Turnos de Técnicos', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });
    doc.text('Técnicos que trabajan hasta las 5 PM', 105, 64, { align: 'center' });

    yPosition += 25;

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

    const shiftsByDay: Record<string, any[]> = {};
    shiftsData.forEach((shift: any) => {
      const day = shift['Día'] || shift.day || 'N/A';
      if (!shiftsByDay[day]) shiftsByDay[day] = [];
      shiftsByDay[day].push(shift);
    });

    const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const dayNames: Record<string, string> = {
      'Lunes': 'Lunes', 'Martes': 'Martes', 'Miércoles': 'Miércoles',
      'Jueves': 'Jueves', 'Viernes': 'Viernes'
    };

    const sortedDays = Object.keys(shiftsByDay)
      .filter(day => dayOrder.includes(day))
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    sortedDays.forEach(day => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Turnos de Técnicos (cont.)', 105, 50, { align: 'center' });
        yPosition += 10;
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

      shiftsByDay[day].forEach((shift: any) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
          if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Reporte de Turnos de Técnicos (cont.)', 105, 50, { align: 'center' });
          yPosition += 10;
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

        doc.text('', 30, yPosition + 5);
        doc.text(firstName, 60, yPosition + 5);
        doc.text(lastName, 110, yPosition + 5);
        doc.text(endTime, 155, yPosition + 5);

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.rect(20, yPosition - 2, 170, 10);
        yPosition += 10;
      });
      yPosition += 8;
    });

    yPosition += 15;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(20, yPosition - 5, 170, 30, 'FD');

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(25, yPosition - 3, 60, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 30, yPosition + 2);
    yPosition += 12;

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

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-turnos-tecnicos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const generateGeneralTicketsReportPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 50;

    const headerImage = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
    const footerImage = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');

    const response = await ApiService.getGeneralTicketsReport();
    const reportData = response.success && response.data
      ? response.data
      : [];

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte General de Tickets', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 58, { align: 'center' });
    doc.text('Estadísticas mensuales de tickets', 105, 64, { align: 'center' });

    yPosition += 25;

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

    (Array.isArray(reportData) ? reportData : []).forEach((row: any, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
        if (headerImage) doc.addImage(headerImage, 'JPEG', 10, 10, 190, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte General de Tickets (cont.)', 105, 50, { align: 'center' });
        yPosition += 10;
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

      doc.setTextColor(0, 0, 0);
      doc.text(String(month), 20, yPosition + 5);
      doc.text(String(totalTickets), 60, yPosition + 5);
      doc.setTextColor(255, 0, 0);
      doc.text(String(highPriority), 100, yPosition + 5);
      doc.setTextColor(0, 128, 0);
      doc.text(String(resolved), 145, yPosition + 5);

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.rect(15, yPosition - 2, 180, 10);
      yPosition += 10;
    });

    yPosition += 15;
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(180, 180, 200);
    doc.rect(15, yPosition - 5, 180, 50, 'FD');

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 3, 50, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', 25, yPosition + 2);
    yPosition += 12;

    const totalMonths = (Array.isArray(reportData) ? reportData : []).length;
    const totalTicketsAll = (Array.isArray(reportData) ? reportData : []).reduce((sum: number, row: any) => sum + (row['Total Tickets'] || 0), 0);
    const totalHighPriority = (Array.isArray(reportData) ? reportData : []).reduce((sum: number, row: any) => sum + (row['Alta Prioridad'] || 0), 0);
    const totalResolved = (Array.isArray(reportData) ? reportData : []).reduce((sum: number, row: any) => sum + (row['Resueltos'] || 0), 0);

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

    if (footerImage) {
      doc.addImage(footerImage, 'JPEG', 10, 270, 190, 20);
    }
    const filename = `reporte-general-tickets-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const getMockGroupedTechnicians = (): Record<string, any[]> => {
    return {
      'Redes': [
        { technician_name: 'Carlos Díaz', technician_status: 'Disponible', First_Name: 'Carlos', Last_Name: 'Diaz', Status: 'Disponible', primary_service: 'Redes' },
        { technician_name: 'Amna Verez', technician_status: 'Disponible', First_Name: 'Amna', Last_Name: 'Verez', Status: 'Disponible', primary_service: 'Redes' }
      ],
      'Soporte': [
        { technician_name: 'Carlos Rodríguez', technician_status: 'Activo', First_Name: 'Carlos', Last_Name: 'Rodríguez', Status: 'Activo', primary_service: 'Soporte Técnico' }
      ],
      'Programación': [
        { technician_name: 'María González', technician_status: 'Activo', First_Name: 'María', Last_Name: 'González', Status: 'Activo', primary_service: 'Programación' }
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
    return matchesSearch && matchesCategory;
  });

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'general': return FileBarChart;
      case 'performance': return TrendingUp;
      case 'office': return Building;
      case 'priority': return AlertTriangle;
      case 'service': return Settings;
      case 'technician': return Users;
      case 'shift': return Clock;
      case 'problem': return AlertOctagon;
      default: return FileText;
    }
  };

  const getCategoryLabel = (type: string): string => {
    switch (type) {
      case 'general': return 'General';
      case 'performance': return 'Desempeño';
      case 'office': return 'Oficina';
      case 'priority': return 'Prioridad';
      case 'service': return 'Servicio';
      case 'technician': return 'Técnicos';
      case 'shift': return 'Turnos';
      case 'problem': return 'Problemas';
      default: return 'Otro';
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(reports.map(r => r.type));
    return ['all', ...Array.from(cats)];
  }, []);

  return (
    <div className="reports-page">
      <ModernSidebar />
      <main className="reports-main">
        <div className="reports-header">
          <div className="reports-header-left">
            <TrendingUp size={24} className="reports-header-icon" />
            <div>
              <h1 className="reports-title">Reportes Ejecutivos</h1>
              <p className="reports-subtitle">Generación y descarga de reportes del sistema</p>
            </div>
          </div>
          <div className="reports-header-right">
            {lastUpdated && (
              <span className="reports-updated-badge">
                <Clock size={14} />
                {getSecondsSinceUpdate()}s
              </span>
            )}
            <button
              className={`reports-refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={handleManualRefresh}
              title="Actualizar datos"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="reports-kpi-row">
          {statsData.map((stat, index) => (
            <div key={index} className={`reports-kpi-card reports-kpi-${stat.color}`}>
              <div className="reports-kpi-icon">
                <stat.icon size={22} />
              </div>
              <div className="reports-kpi-info">
                <span className="reports-kpi-value">{stat.value}</span>
                <span className="reports-kpi-title">{stat.title}</span>
                <span className="reports-kpi-subtitle">{stat.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="reports-toolbar">
          <div className="reports-search">
            <Search size={18} className="reports-search-icon" />
            <input
              type="text"
              placeholder="Buscar reportes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="reports-search-input"
            />
            {searchTerm && (
              <button className="reports-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="reports-categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`reports-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'Todos' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {loadingSummary && (
          <div className="reports-loading-bar">
            <div className="reports-loading-bar-inner" />
          </div>
        )}

        <div className="reports-grid">
          {filteredReports.length === 0 ? (
            <div className="reports-empty">
              <FileText size={48} />
              <h3>No se encontraron reportes</h3>
              <p>Intenta con otros términos de búsqueda o categoría</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const Icon = getReportIcon(report.type);
              return (
                <div key={report.id} className="reports-card">
                  <div className="reports-card-top">
                    <div className="reports-card-icon-wrap">
                      <Icon size={28} />
                    </div>
                    <span className="reports-card-badge">{getCategoryLabel(report.type)}</span>
                  </div>
                  <h3 className="reports-card-title">{report.name}</h3>
                  <p className="reports-card-desc">{report.description}</p>
                  <div className="reports-card-meta">
                    <Calendar size={13} />
                    <span>Última ejecución: {new Date(report.lastRun).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="reports-card-actions">
                    <button
                      className="reports-download-btn"
                      onClick={() => handleRunReport(report.id)}
                      disabled={loading}
                    >
                      <Download size={16} />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {loading && (
        <div className="reports-overlay">
          <div className="reports-overlay-spinner" />
          <p>Generando reporte...</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
