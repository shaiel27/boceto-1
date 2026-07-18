import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import {
  TrendingUp,
  FileText,
  Download,
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
import { formatDate } from './DateRangePicker';
import './Reports.css';

function downloadCSV(filename: string, columns: string[], rows: Record<string, any>[]): void {
  const BOM = '\uFEFF';
  const header = columns.join(';');
  const body = rows.map(row => columns.map(c => {
    const val = row[c] ?? '';
    return typeof val === 'string' && (val.includes(';') || val.includes('"') || val.includes('\n'))
      ? `"${val.replace(/"/g, '""')}"`
      : String(val);
  }).join(';')).join('\n');
  const blob = new Blob([BOM + header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

const MONTHS_ES: Record<string, string> = {
  January: 'Enero', February: 'Febrero', March: 'Marzo', April: 'Abril',
  May: 'Mayo', June: 'Junio', July: 'Julio', August: 'Agosto',
  September: 'Septiembre', October: 'Octubre', November: 'Noviembre', December: 'Diciembre',
};

function translateMonth(text: string): string {
  let r = text;
  for (const [en, es] of Object.entries(MONTHS_ES)) {
    r = r.replace(new RegExp(en, 'g'), es);
  }
  return r;
}

let cachedHeaderImg: string | null = null;
let cachedFooterImg: string | null = null;

async function loadImageAsBase64PDF(url: string): Promise<string> {
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
  } catch {
    return '';
  }
}

async function ensureImages(): Promise<{ header: string; footer: string }> {
  if (!cachedHeaderImg) cachedHeaderImg = await loadImageAsBase64PDF('/pdf-reports/header/cabecera.jpg');
  if (!cachedFooterImg) cachedFooterImg = await loadImageAsBase64PDF('/pdf-reports/footer/pie.jpg');
  return { header: cachedHeaderImg, footer: cachedFooterImg };
}

function renderPDFHeader(
  doc: any, title: string, subtitle: string, headerImg: string, y: number
): number {
  if (headerImg) {
    doc.addImage(headerImg, 'JPEG', 10, 8, 190, 26);
    y += 5;
  }
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 105, y + 6, { align: 'center' });

  doc.setDrawColor(26, 54, 93);
  doc.setLineWidth(0.8);
  doc.line(50, y + 11, 160, y + 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 105, y + 18, { align: 'center' });
  return y + 24;
}

function renderPDFContinuationHeader(
  doc: any, title: string, headerImg: string
): number {
  if (headerImg) doc.addImage(headerImg, 'JPEG', 10, 8, 190, 26);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${title} (cont.)`, 105, 48, { align: 'center' });
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.4);
  doc.line(30, 52, 180, 52);
  return 58;
}

function addPDFFooterToAllPages(doc: any, footerImg: string): void {
  const total = doc.internal.pages.length - 1;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    if (footerImg) doc.addImage(footerImg, 'JPEG', 10, ph - 25, pw - 20, 18);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(15, ph - 28, pw - 15, ph - 28);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Sistema de Gestion de Tickets — Alcaldia de San Cristobal', pw / 2, ph - 10, { align: 'center' });
    doc.text(`Pagina ${i} de ${total}`, pw - 20, ph - 10, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
}

function renderTableBlock(
  doc: any,
  columns: { label: string; x: number; align?: string; key: string }[],
  rows: any[],
  y: number,
  headerColor: [number, number, number],
  title: string,
  headerImg: string,
  pageBreakY: number,
): number {
  const headerHeight = 12;
  const rowHeight = 10;
  const tableLeft = 15;
  const tableRight = 195;

  doc.setFillColor(...headerColor);
  doc.setTextColor(255, 255, 255);
  doc.roundedRect(tableLeft, y - 2, tableRight - tableLeft, headerHeight, 1.5, 1.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  columns.forEach((col) => doc.text(col.label, col.x, y + 5, { align: col.align || 'left' }));
  y += headerHeight + 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  rows.forEach((row: any, idx: number) => {
    if (y > pageBreakY) {
      doc.addPage();
      y = renderPDFContinuationHeader(doc, title, headerImg);
      doc.setFillColor(...headerColor);
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(tableLeft, y - 2, tableRight - tableLeft, headerHeight, 1.5, 1.5, 'F');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      columns.forEach((col) => doc.text(col.label, col.x, y + 5, { align: col.align || 'left' }));
      y += headerHeight + 4;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(tableLeft, y, tableRight - tableLeft, rowHeight, 'F');
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(tableLeft, y, tableRight - tableLeft, rowHeight, 'F');
    }

    columns.forEach((col) => {
      const raw = row[col.key] ?? '';
      const val = String(raw);
      let color: [number, number, number] = [30, 41, 59];
      if (raw === 'N/A' || raw === '') color = [148, 163, 184];
      doc.setTextColor(...color);
      doc.text(val, col.x, y + 6, { align: col.align || 'left' });
    });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(tableLeft, y + rowHeight, tableRight, y + rowHeight);
    y += rowHeight;
  });
  return y + 6;
}

function renderSummaryBlock(
  doc: any, title: string, items: { label: string; value: string; color?: string }[],
  y: number, headerImg: string
): number {
  const DEFAULT_COLOR = '#1a365d';
  const cols = Math.min(items.length, 4);
  const cardW = 170 / cols;
  const cardH = 18;
  const gap = 4;

  if (y + cardH + 16 > 275) {
    doc.addPage();
    y = renderPDFContinuationHeader(doc, title, headerImg);
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y - 2, 180, 8, 1.5, 1.5, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('RESUMEN', 20, y + 3);
  y += 12;

  items.forEach((item, i) => {
    const cx = 15 + (i % cols) * (cardW + gap);
    if (i > 0 && i % cols === 0) y += cardH + gap;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');

    const hexColor = item.color || DEFAULT_COLOR;
    doc.setFillColor(hexColor);
    doc.rect(cx, y, 3, cardH, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(hexColor);
    doc.text(item.value, cx + 7, y + 9);

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, cx + 7, y + 14);
  });

  const totalRows = Math.ceil(items.length / cols);
  return y + totalRows * (cardH + gap) + 8;
}

function drawNoDataMessage(doc: any, y: number): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Sin datos para el periodo seleccionado.', 105, y + 10, { align: 'center' });
  return y + 20;
}

interface Report {
  id: string;
  name: string;
  type: 'general' | 'performance' | 'office' | 'timeline' | 'priority' | 'service' | 'technician' | 'problem' | 'shift';
  description: string;
  createdAt: string;
  lastRun: string | null;
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

  const [reportDates, setReportDates] = useState<Record<string, { start: string; end: string }>>({});

  const getReportDates = (reportId: string) => {
    return reportDates[reportId] || { start: daysAgo(30), end: formatDate(new Date()) };
  };

  const setReportDatesFor = (reportId: string, start: string, end: string) => {
    setReportDates(prev => ({ ...prev, [reportId]: { start, end } }));
  };

  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [officeData, setOfficeData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    const d = getReportDates(reportId);
    setLoading(true);
    setErrorMsg(null);
    const done = () => setLoading(false);
    const fail = (e: any) => { setErrorMsg(e?.message || 'Error al generar reporte'); setLoading(false); };
    if (reportId === '1') {
      generateGeneralTicketsReportPDF(d.start, d.end).then(done).catch(fail);
    } else if (reportId === '5') {
      generateProblemReportPDF(d.start, d.end).then(done).catch(fail);
    } else if (reportId === '10') {
      generateMonthlyProblemReportPDF(d.start, d.end).then(done).catch(fail);
    } else if (reportId === '11') {
      const base = process.env.REACT_APP_API_BASE || `http://${window.location.hostname}:8000`;
      const token = sessionStorage.getItem('auth_token');
      window.open(`${base}/api/problem-report?action=systems&start_date=${d.start}&end_date=${d.end}&format=pdf&token=${token}`, '_blank');
      done();
    } else if (reportId === '12') {
      generateTechnicianShiftsPDF().then(done).catch(fail);
    } else if (reportId === '8') {
      generateTechnicianReportByService().then(done).catch(fail);
    } else if (reportId === '9') {
      generateTechnicianPerformanceReport().then(done).catch(fail);
    } else if (reportId === '3') {
      generateOfficeReportPDF(d.start, d.end).then(done).catch(fail);
    } else {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const handleExportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    if (format === 'pdf') {
      handleRunReport(reportId);
    } else if (format === 'csv') {
      handleCSVExport(reportId);
    }
  };

  const handlePrintReport = (reportId: string): void => {
    const token = sessionStorage.getItem('auth_token');
    const host = window.location.hostname;
    const base = process.env.REACT_APP_API_BASE || `http://${host}:8000`;
    const d = getReportDates(reportId);

    const reportMap: Record<string, string> = {
      '1': 'general',
      '3': 'office',
      '5': 'problem',
      '10': 'monthly',
      '11': 'systems',
    };

    const action = reportMap[reportId];
    if (!action) {
      handleRunReport(reportId);
      return;
    }

    let url: string;
    if (action === 'problem' || action === 'monthly' || action === 'systems') {
      url = `${base}/api/problem-report?action=${action === 'problem' ? 'all' : action === 'monthly' ? 'monthly' : 'systems'}&start_date=${d.start}&end_date=${d.end}&format=html&token=${token}`;
    } else {
      url = `${base}/api/reports?action=${action}&start_date=${d.start}&end_date=${d.end}&format=html&token=${token}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCSVExport = async (reportId: string): Promise<void> => {
    setLoading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const d = getReportDates(reportId);
      if (reportId === '1') {
        const r = await ApiService.getGeneralReport(d.start, d.end);
        const data = (r.success && r.data) ? ((r.data as any).monthly || (Array.isArray(r.data) ? r.data : [])) : [];
        downloadCSV(`reporte-general-${date}.csv`, ['month', 'total', 'pending', 'in_progress', 'resolved', 'alta_count', 'avg_hours'], data);
      } else if (reportId === '3') {
        const r = await ApiService.getOfficeReport(d.start, d.end);
        const data = (r.success && Array.isArray(r.data)) ? r.data : (r.success && r.data?.data ? r.data.data : []);
        const rows = (Array.isArray(data) ? data : []).map((o: any) => ({
          office: o.office || o.Name_Office || 'N/A',
          total: o.total ?? o.total_tickets ?? 0,
          in_progress: o.in_progress ?? o.en_proceso ?? 0,
          resolved: o.resolved ?? o.resolved_tickets ?? 0,
          pending: o.pending ?? o.pending_tickets ?? 0,
          avg_hours: o.avg_hours ?? 'N/A',
        }));
        downloadCSV(`reporte-oficina-${date}.csv`, ['office', 'total', 'in_progress', 'resolved', 'pending', 'avg_hours'], rows);
      } else if (reportId === '5') {
        const r = await ApiService.getProblemReport(d.start, d.end);
        const data = r.success && r.data ? r.data : [];
        downloadCSV(`reporte-problemas-${date}.csv`, ['tipo_servicio', 'total_tickets_mes', 'cerrados_mes', 'oficinas_atendidas_mes', 'tecnicos_involucrados_mes', 'problematica_mas_frecuente_mes', 'porcentaje_mes_actual'], data);
      } else if (reportId === '8') {
        const r = await ApiService.getAllTechniciansGroupedByService();
        const rows: any[] = [];
        if (r.success && r.data) {
          const d = Array.isArray(r.data) ? r.data : [];
          d.forEach((sg: any) => {
            (sg.technicians || (Array.isArray(sg) ? sg : [sg])).forEach((t: any) => {
              rows.push({ service: sg.service_name || t.primary_service || '', name: `${t.First_Name || ''} ${t.Last_Name || ''}`.trim(), status: t.Status || t.status || '' });
            });
          });
        }
        downloadCSV(`reporte-tecnicos-${date}.csv`, ['service', 'name', 'status'], rows);
      } else if (reportId === '9') {
        const r = await ApiService.getTechnicianPerformanceMetrics();
        const rows: any[] = [];
        if (r.success && r.data) {
          const sd = r.data as Record<string, any[]>;
          for (const svc in sd) {
            (sd[svc] || []).forEach((t: any) => rows.push({ service: svc, name: t.name || t.technician_name || '', resolved: t.resolved_tickets || 0, avg_time: t.avg_resolution_time || 0 }));
          }
        }
        downloadCSV(`reporte-desempeno-${date}.csv`, ['service', 'name', 'resolved', 'avg_time'], rows);
      } else if (reportId === '10') {
        const r = await ApiService.getMonthlyProblemReport(d.start, d.end);
        const data = r.success && r.data ? r.data : [];
        downloadCSV(`reporte-mensual-${date}.csv`, ['month_name', 'problem_name', 'severity', 'ticket_count'], data);
      } else if (reportId === '11') {
        const r = await ApiService.getSystemsAndProblems(d.start, d.end);
        const data = r.success && r.data ? r.data : [];
        downloadCSV(`reporte-sistemas-${date}.csv`, ['sistema', 'total_tickets', 'problematica_mas_comun', 'frecuencia_problematica'], data);
      } else if (reportId === '12') {
        const r = await ApiService.getTechnicianShifts();
        const data = r.success && r.data ? r.data : [];
        const rows = (Array.isArray(data) ? data : []).map((s: any) => ({
          Dia: s['Dia'] || s['Día'] || s.day || '',
          Nombre: s['Nombre'] || s.name || '',
          Apellido: s['Apellido'] || s.apellido || '',
          Hora_Salida: s['Hora Salida'] || s.work_end_time || '',
        }));
        downloadCSV(`reporte-turnos-${date}.csv`, ['Dia', 'Nombre', 'Apellido', 'Hora_Salida'], rows);
      }
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar CSV');
    } finally {
      setLoading(false);
    }
  };

  const generateTechnicianReportByService = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getAllTechniciansGroupedByService();
    const groupedData = response.success && response.data ? response.data : getMockGroupedTechnicians();

    let servicesData: Record<string, any[]> = {};
    if (Array.isArray(groupedData) && groupedData.length > 0 && groupedData[0].service_name) {
      groupedData.forEach((sg: any) => {
        const techs = (sg.technicians || []).map((t: any) => ({
          ...t, technician_name: `${t.First_Name} ${t.Last_Name}`, technician_status: t.Status
        }));
        servicesData[sg.service_name] = techs;
      });
    } else if (Array.isArray(groupedData)) {
      groupedData.forEach((tech: any) => {
        const svc = tech.primary_service || tech.Type_Service || 'General';
        if (!servicesData[svc]) servicesData[svc] = [];
        servicesData[svc].push(tech);
      });
    } else if (typeof groupedData === 'object') {
      servicesData = groupedData;
    }

    let y = renderPDFHeader(doc, 'Reporte de Tecnicos por Servicio', `Fecha: ${new Date().toLocaleDateString('es-ES')}`, header, 50);
    y += 5;
    let si = 1;

    for (const svc in servicesData) {
      const techs = servicesData[svc];
      if (!Array.isArray(techs)) continue;
      if (y > 240) { doc.addPage(); y = renderPDFContinuationHeader(doc, 'Reporte de Tecnicos por Servicio', header); }

      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text(`${si}. ${svc}`, 20, y); y += 10;

      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('Nombre', 20, y); doc.text('Estado', 120, y); y += 2;
      doc.setLineWidth(0.3); doc.line(20, y, 190, y); y += 7;

      doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      techs.forEach((t: any) => {
        const name = t.technician_name || `${t.First_Name || ''} ${t.Last_Name || ''}`.trim() || 'N/A';
        const status = t.technician_status || t.Status || 'Desconocido';
        doc.text(name, 20, y); doc.text(status, 120, y); y += 6;
      });
      y += 10; si++;
    }

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-tecnicos-servicio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateTechnicianPerformanceReport = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getTechnicianPerformanceMetrics();
    let servicesData: Record<string, any[]> = response.success && response.data ? response.data : {};
    if (typeof servicesData !== 'object' || Array.isArray(servicesData)) servicesData = {};

    if (Object.keys(servicesData).length === 0) {
      servicesData = {
        'Redes': [{ name: 'Sin datos', resolved_tickets: 0, avg_resolution_time: 0 }],
        'Soporte': [{ name: 'Sin datos', resolved_tickets: 0, avg_resolution_time: 0 }],
        'Programación': [{ name: 'Sin datos', resolved_tickets: 0, avg_resolution_time: 0 }],
      };
    }

    const dateStr = `Generado: ${new Date().toLocaleDateString('es-ES')}`;
    let y = renderPDFHeader(doc, 'Reporte de Desempeño de Técnicos', dateStr, header, 50);
    const title = 'Reporte de Desempeño de Técnicos';
    let si = 1;
    let totalTechs = 0;
    let totalResolved = 0;

    for (const svc in servicesData) {
      const techs = servicesData[svc];
      if (!Array.isArray(techs)) continue;
      totalTechs += techs.length;
      if (y > 240) { doc.addPage(); y = renderPDFContinuationHeader(doc, title, header); }

      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text(`${si}. ${svc}`, 20, y); y += 10;

      doc.setFillColor(59, 130, 246); doc.setTextColor(255, 255, 255);
      doc.rect(20, y - 2, 170, 10, 'F');
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('Nombre', 25, y + 4); doc.text('Resueltos', 100, y + 4);
      doc.text('T. Prom.(min)', 145, y + 4);
      y += 12;
      doc.setFontSize(8); doc.setFont('helvetica', 'normal');

      techs.forEach((tech: any) => {
        if (y > 245) { doc.addPage(); y = renderPDFContinuationHeader(doc, title, header);
          doc.setFillColor(59, 130, 246); doc.setTextColor(255, 255, 255);
          doc.rect(20, y - 2, 170, 10, 'F');
          doc.setFontSize(9); doc.setFont('helvetica', 'bold');
          doc.text('Nombre', 25, y + 4); doc.text('Resueltos', 100, y + 4);
          doc.text('T. Prom.(min)', 145, y + 4);
          y += 12; doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        }
        const resolved = Number(tech.resolved_tickets || 0);
        totalResolved += resolved;
        const avgTime = tech.avg_resolution_time || tech.avg_resolution_hours || 0;
        doc.setTextColor(0, 0, 0);
        doc.text(tech.name || tech.technician_name || 'N/A', 25, y + 5);
        doc.text(String(resolved), 100, y + 5, { align: 'center' });
        doc.text(Number(avgTime) > 0 ? String(Number(avgTime).toFixed(1)) : '—', 145, y + 5, { align: 'center' });
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
        doc.rect(20, y, 170, 10); y += 10;
      });
      y += 10; si++;
    }

    y = renderSummaryBlock(doc, title, [
      { label: 'Total Servicios', value: String(si - 1) },
      { label: 'Total Técnicos', value: String(totalTechs) },
      { label: 'Total Resueltos', value: String(totalResolved) },
    ], y, header);

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-desempeno-tecnicos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateOfficeReportPDF = async (startDate: string, endDate: string): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getOfficeReport(startDate, endDate);
    const officeData = (response.success && Array.isArray(response.data))
      ? response.data : (response.success && response.data?.data ? response.data.data : []);
    const pStr = response.dates?.start_date
      ? `${response.dates.start_date} — ${response.dates.end_date}`
      : `${startDate} — ${endDate}`;

    let y = renderPDFHeader(doc, 'Reporte por Oficina', pStr, header, 50);

    const cols = [
      { label: 'Oficina', x: 20, key: 'office' },
      { label: 'Total', x: 70, key: 'total', align: 'center' },
      { label: 'En curso', x: 90, key: 'in_progress', align: 'center' },
      { label: 'Res.', x: 120, key: 'resolved', align: 'center' },
      { label: 'Pend.', x: 140, key: 'pending', align: 'center' },
      { label: 'Prom.(h)', x: 165, key: 'avg_hours', align: 'center' },
    ];
    const rows = (Array.isArray(officeData) ? officeData : []).map((o: any) => {
      const raw = o.office || o.Name_Office || 'N/A';
      const cleanName = raw.replace(/^(DIRECCI[OÓ]N|DIVISI[OÓ]N|COORDINACI[OÓ]N)\s+DE[L]?\s+/i, '').trim() || raw;
      return {
        office: cleanName.length > 22 ? cleanName.substring(0, 21) + '…' : cleanName,
        total: String(Number(o.total ?? o.total_tickets ?? o.ticket_count ?? 0)),
        in_progress: String(Number(o.in_progress ?? o.en_proceso ?? 0)),
        resolved: String(Number(o.resolved ?? o.resolved_tickets ?? 0)),
        pending: String(Number(o.pending ?? o.pending_tickets ?? 0)),
        avg_hours: String(o.avg_hours ?? o.avg_time ?? 'N/A'),
      };
    });
    y = renderTableBlock(doc, cols, rows, y, [26, 54, 93], 'Reporte por Oficina', header, 258);

    const arr = Array.isArray(officeData) ? officeData : [];
    y = renderSummaryBlock(doc, 'Reporte por Oficina', [
      { label: 'Total Oficinas', value: String(arr.length) },
      { label: 'Total Tickets', value: String(arr.reduce((s, o) => s + Number(o.total ?? o.total_tickets ?? o.ticket_count ?? 0), 0)) },
      { label: 'Resueltos', value: String(arr.reduce((s, o) => s + Number(o.resolved ?? o.resolved_tickets ?? 0), 0)), color: '#10b981' },
      { label: 'En Proceso', value: String(arr.reduce((s, o) => s + Number(o.in_progress ?? o.en_proceso ?? 0), 0)), color: '#3b82f6' },
    ], y, header);

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-oficina-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateProblemReportPDF = async (startDate: string, endDate: string): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getProblemReport(startDate, endDate);
    let problemData = response.success && response.data ? response.data : [];

    if (!Array.isArray(problemData) || problemData.length === 0) {
      problemData = [
        { tipo_servicio: 'Redes', total_tickets_mes: 0, cerrados_mes: 0, oficinas_atendidas_mes: 0, tecnicos_involucrados_mes: 0, problematica_mas_frecuente_mes: 'Sin datos', porcentaje_mes_actual: 0, tiempo_promedio_horas_mes: 0 },
        { tipo_servicio: 'Soporte', total_tickets_mes: 0, cerrados_mes: 0, oficinas_atendidas_mes: 0, tecnicos_involucrados_mes: 0, problematica_mas_frecuente_mes: 'Sin datos', porcentaje_mes_actual: 0, tiempo_promedio_horas_mes: 0 },
        { tipo_servicio: 'Programación', total_tickets_mes: 0, cerrados_mes: 0, oficinas_atendidas_mes: 0, tecnicos_involucrados_mes: 0, problematica_mas_frecuente_mes: 'Sin datos', porcentaje_mes_actual: 0, tiempo_promedio_horas_mes: 0 },
      ];
    }

    let y = renderPDFHeader(doc, 'Reporte de Problemas por Servicio', `Periodo: ${startDate} — ${endDate}`, header, 50);

    const cols = [
      { label: 'Servicio', x: 20, key: 'service' },
      { label: 'Total', x: 50, key: 'total', align: 'center' },
      { label: 'Cerr', x: 80, key: 'closed', align: 'center' },
      { label: 'Oficinas', x: 105, key: 'offices', align: 'center' },
      { label: 'Tecnicos', x: 130, key: 'technicians', align: 'center' },
      { label: 'Prob. Frec', x: 155, key: 'problem' },
      { label: '%', x: 185, key: 'pct', align: 'center' },
    ];
    const rows = (Array.isArray(problemData) ? problemData : []).map((s: any) => ({
      service: (s.tipo_servicio || s.Type_Service || 'N/A').substring(0, 12),
      total: String(s.total_tickets_mes || s.count || 0),
      closed: String(s.cerrados_mes || 0),
      offices: String(s.oficinas_atendidas_mes || 0),
      technicians: String(s.tecnicos_involucrados_mes || 0),
      problem: (s.problematica_mas_frecuente_mes || s.problem || 'N/A').substring(0, 14),
      pct: `${s.porcentaje_mes_actual || 0}%`,
    }));
    y = renderTableBlock(doc, cols, rows, y, [59, 130, 246], 'Reporte de Problemas por Servicio', header, 235);

    const pd = Array.isArray(problemData) ? problemData : [];
    y = renderSummaryBlock(doc, 'Reporte de Problemas por Servicio', [
      { label: 'Total Servicios', value: String(pd.length) },
      { label: 'Total Tickets', value: String(pd.reduce((s, i) => s + Number(i.total_tickets_mes || i.count || 0), 0)) },
      { label: 'Total Resueltos', value: String(pd.reduce((s, i) => s + Number(i.resueltos_mes || 0), 0)) },
      { label: 'Tiempo Promedio (hrs)', value: pd.length > 0 ? (pd.reduce((s, i) => s + Number(i.tiempo_promedio_horas_mes || 0), 0) / pd.length).toFixed(2) : '0.00' },
    ], y, header);

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-problemas-servicio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateMonthlyProblemReportPDF = async (startDate: string, endDate: string): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getMonthlyProblemReport(startDate, endDate);
    let problemData = response.success && response.data ? response.data : [];

    if (!Array.isArray(problemData)) problemData = [];
    problemData = problemData.map((r: any) => ({
      ...r,
      month_name: translateMonth(r.month_name || r.month_key || ''),
      month_key: r.month_key,
    }));

    if (problemData.length === 0) {
      problemData = [
        { month_name: 'Sin datos', problem_name: '—', severity: '—', ticket_count: 0 },
      ];
    }

    let y = renderPDFHeader(doc, 'Reporte Mensual por Tipo de Servicio', `Periodo: ${startDate} — ${endDate}`, header, 50);

    const groupedByMonth: Record<string, any[]> = {};
    problemData.forEach((r: any) => {
      const mk = r.month_name || r.month_key || 'General';
      if (!groupedByMonth[mk]) groupedByMonth[mk] = [];
      groupedByMonth[mk].push(r);
    });

    const monthKeys = Object.keys(groupedByMonth);
    let totalTickets = 0;

    monthKeys.forEach((month) => {
      const items = groupedByMonth[month];
      const monthTotal = items.reduce((s, i) => s + Number(i.ticket_count || 0), 0);
      totalTickets += monthTotal;

      if (y > 230) { doc.addPage(); y = renderPDFContinuationHeader(doc, 'Reporte Mensual por Tipo de Servicio', header); }

      doc.setFillColor(26, 54, 93); doc.setTextColor(255, 255, 255);
      doc.rect(15, y - 2, 180, 10, 'F');
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(`${month} — Total: ${monthTotal} tickets`, 20, y + 5);
      y += 13;

      doc.setFillColor(241, 245, 249); doc.setTextColor(30, 41, 59);
      doc.rect(15, y - 2, 180, 8, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      doc.text('Problema', 20, y + 4);
      doc.text('Severidad', 120, y + 4);
      doc.text('Tickets', 175, y + 4, { align: 'center' });
      y += 10;

      doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      items.forEach((row: any) => {
        if (y > 250) { doc.addPage(); y = renderPDFContinuationHeader(doc, 'Reporte Mensual por Tipo de Servicio', header); }
        doc.text((row.problem_name || 'N/A').substring(0, 30), 20, y + 4);
        doc.text(row.severity || 'N/A', 120, y + 4);
        doc.text(String(row.ticket_count || 0), 175, y + 4, { align: 'center' });
        doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.2);
        doc.line(15, y + 6, 195, y + 6);
        y += 9;
      });
      y += 6;
    });

    y = renderSummaryBlock(doc, 'Reporte Mensual por Tipo de Servicio', [
      { label: 'Meses Reportados', value: String(monthKeys.length) },
      { label: 'Total Tickets', value: String(totalTickets) },
    ], y, header);

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-mensual-problemas-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateSystemsReportPDF = async (startDate: string, endDate: string): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getSystemsAndProblems(startDate, endDate);
    let systemsData = response.success && response.data ? response.data : [];

    if (!Array.isArray(systemsData) || systemsData.length === 0) {
      systemsData = [
        { sistema: 'Sin datos', total_tickets: 0, problematica_mas_comun: '—', frecuencia_problematica: 0 },
      ];
    }

    let y = renderPDFHeader(doc, 'Reporte de Sistemas y Problemáticas', `Periodo: ${startDate} — ${endDate}`, header, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Sistemas de Programación con más tickets y su problemática más común', 105, y, { align: 'center' });
    y += 8;

    const cols = [
      { label: 'Sistema', x: 25, key: 'system' },
      { label: 'Total Tickets', x: 85, key: 'total', align: 'center' },
      { label: 'Problemática Común', x: 120, key: 'problem' },
      { label: 'Frecuencia', x: 170, key: 'freq', align: 'center' },
    ];
    const rows = (Array.isArray(systemsData) ? systemsData : []).map((s: any) => ({
      system: (s.system_name || s.System_Name || s.sistema || 'N/A').substring(0, 16),
      total: String(s.total_tickets || 0),
      problem: (s.common_problem || s.problematica_mas_comun || 'N/A').substring(0, 18),
      freq: String(s.frequency || s.frecuencia_problematica || 0),
    }));
    y = renderTableBlock(doc, cols, rows, y, [59, 130, 246], 'Reporte de Sistemas y Problemáticas', header, 235);

    const sd = Array.isArray(systemsData) ? systemsData : [];
    y = renderSummaryBlock(doc, 'Reporte de Sistemas y Problemáticas', [
      { label: 'Total Sistemas', value: String(sd.length) },
      { label: 'Total Tickets', value: String(sd.reduce((s, i) => s + Number(i.total_tickets || 0), 0)) },
    ], y, header);

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-sistemas-problematicas-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateTechnicianShiftsPDF = async (): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getTechnicianShifts();
    const shiftsData = response.success && response.data ? response.data : [];

    let y = renderPDFHeader(doc, 'Reporte de Turnos de Tecnicos', `Fecha: ${new Date().toLocaleDateString('es-ES')}`, header, 50);
    doc.text('Tecnicos que trabajan hasta las 5 PM', 105, y, { align: 'center' });
    y += 5;

    const shiftsByDay: Record<string, any[]> = {};
    shiftsData.forEach((shift: any) => {
      const day = shift['Dia'] || shift['Día'] || shift.day || 'N/A';
      if (!shiftsByDay[day]) shiftsByDay[day] = [];
      shiftsByDay[day].push(shift);
    });

    const dayOrder = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
    const sortedDays = Object.keys(shiftsByDay)
      .filter(day => dayOrder.includes(day))
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    sortedDays.forEach(day => {
      if (y > 250) { doc.addPage(); y = renderPDFContinuationHeader(doc, 'Reporte de Turnos de Tecnicos', header); }

      doc.setFillColor(230, 240, 255); doc.setTextColor(0, 0, 139);
      doc.rect(20, y - 2, 170, 10, 'F');
      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text(day, 30, y + 4); y += 12;

      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
      shiftsByDay[day].forEach((shift: any) => {
        if (y > 250) { doc.addPage(); y = renderPDFContinuationHeader(doc, 'Reporte de Turnos de Tecnicos', header); }
        doc.text(shift['Nombre'] || shift.name || 'N/A', 60, y + 5);
        doc.text(shift['Apellido'] || shift.apellido || 'N/A', 110, y + 5);
        doc.text(shift['Hora Salida'] || shift.work_end_time || 'N/A', 155, y + 5);
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.5);
        doc.rect(20, y - 2, 170, 10); y += 10;
      });
      y += 8;
    });

    y = renderSummaryBlock(doc, 'Reporte de Turnos de Tecnicos', [
      { label: 'Total Turnos', value: String(shiftsData.length) },
      { label: 'Dias con turnos', value: String(Object.keys(shiftsByDay).length) },
    ], y, header);

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-turnos-tecnicos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateGeneralTicketsReportPDF = async (startDate: string, endDate: string): Promise<void> => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const { header, footer } = await ensureImages();

    const response = await ApiService.getGeneralReport(startDate, endDate);
    const reportData = (response.success && response.data)
      ? ((response.data as any).monthly || (response.data as any).data?.monthly || (Array.isArray(response.data) ? response.data : []))
      : [];
    const pStr = response.dates?.start_date
      ? `${response.dates.start_date} — ${response.dates.end_date}`
      : `${startDate} — ${endDate}`;

    let y = renderPDFHeader(doc, 'Reporte General de Tickets', `Periodo: ${pStr}`, header, 50);

    const cols = [
      { label: 'Mes', x: 20, key: 'month' },
      { label: 'Total', x: 55, key: 'total', align: 'center' },
      { label: 'Pend.', x: 80, key: 'pending', align: 'center' },
      { label: 'Proc.', x: 105, key: 'in_progress', align: 'center' },
      { label: 'Res.', x: 130, key: 'resolved', align: 'center' },
      { label: 'Alta', x: 155, key: 'alta', align: 'center' },
      { label: 'Prom.(h)', x: 175, key: 'avg_hours', align: 'center' },
    ];
    const rows = (Array.isArray(reportData) ? reportData : []).map((row: any) => ({
      month: row.month || row['Mes'] || 'N/A',
      total: String(row.total ?? 0),
      pending: String(row.pending ?? 0),
      in_progress: String(row.in_progress ?? 0),
      resolved: String(row.resolved ?? 0),
      alta: String(row.alta_count ?? row['Alta Prioridad'] ?? row.high_priority ?? 0),
      avg_hours: String(row.avg_hours ?? 'N/A'),
    }));
    y = renderTableBlock(doc, cols, rows, y, [26, 54, 93], 'Reporte General de Tickets', header, 258);

    addPDFFooterToAllPages(doc, footer);
    doc.save(`reporte-general-tickets-${new Date().toISOString().split('T')[0]}.pdf`);
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

        {errorMsg && (
          <div className="reports-error-banner">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="reports-error-close">&times;</button>
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
              const dates = getReportDates(report.id);
              return (
                <div key={report.id} className="reports-card">
                  <div className="reports-card-top">
                    <div className="reports-card-icon-wrap">
                      <Icon size={26} />
                    </div>
                    <span className="reports-card-badge">{getCategoryLabel(report.type)}</span>
                  </div>
                  <h3 className="reports-card-title">{report.name}</h3>
                  <p className="reports-card-desc">{report.description}</p>
                  <div className="reports-card-dates">
                    <div className="reports-card-date-field">
                      <label>Desde</label>
                      <input
                        type="date"
                        value={dates.start}
                        max={dates.end}
                        onChange={(e) => setReportDatesFor(report.id, e.target.value, dates.end)}
                      />
                    </div>
                    <span className="reports-card-dates-sep">&mdash;</span>
                    <div className="reports-card-date-field">
                      <label>Hasta</label>
                      <input
                        type="date"
                        value={dates.end}
                        min={dates.start}
                        max={formatDate(new Date())}
                        onChange={(e) => setReportDatesFor(report.id, dates.start, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="reports-card-actions">
                    <button
                      className="reports-download-btn"
                      onClick={() => handleRunReport(report.id)}
                      disabled={loading}
                    >
                      <Download size={15} />
                      <span>PDF</span>
                    </button>
                    <button
                      className="reports-print-btn"
                      onClick={() => handlePrintReport(report.id)}
                      title="Vista previa para imprimir"
                    >
                      Imprimir
                    </button>
                    <button
                      className="reports-csv-btn"
                      onClick={() => handleExportReport(report.id, 'csv')}
                      disabled={loading}
                    >
                      CSV
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
