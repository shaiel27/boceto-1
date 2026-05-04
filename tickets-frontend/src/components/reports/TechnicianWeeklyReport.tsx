import React, { useState, useEffect } from 'react';
import { PDFReportGenerator } from './PDFReportGenerator';
import { PDFReportData } from '../../services/pdfService';
import { ApiService } from '../../services/api';
import { Users, Calendar, CheckCircle, TrendingUp, Filter, Download, AlertCircle } from 'lucide-react';
import './TechnicianWeeklyReport.css';

interface TechnicianData {
  id: number;
  nombre: string;
  tickets_resueltos: number;
  semana: string;
  eficiencia: number;
  tiempo_promedio: number;
}

interface WeeklyStats {
  week: string;
  period_start: string;
  period_end: string;
  total_tickets: number;
  total_resolved: number;
  active_technicians: number;
  resolution_rate: number;
}

export const TechnicianWeeklyReport: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    return `${year}-W${week}`;
  });
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicianData, setTechnicianData] = useState<TechnicianData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

  // Helper function to get ISO week number
  function getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  }

  // Generate available weeks (last 10 weeks)
  const generateWeeks = (): string[] => {
    const weeks: string[] = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      weeks.push(`${year}-W${week}`);
    }
    return weeks;
  };

  const weeks = generateWeeks();

  // Fetch data from backend
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const techId = selectedTechnician === 'all' ? undefined : parseInt(selectedTechnician);
      const response = await ApiService.getWeeklyTechnicianReport(selectedWeek, techId);
      
      if (response.success && response.data) {
        const data = response.data;
        setWeeklyStats(data.stats);
        setTechnicianData(data.technicians || []);
      } else {
        setError(response.message || 'Error al obtener datos del reporte');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error fetching weekly report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when week or technician changes
  useEffect(() => {
    fetchData();
  }, [selectedWeek, selectedTechnician]);

  const technicians = [
    { id: 'all', name: 'Todos los técnicos' },
    ...technicianData.map(t => ({ id: t.id.toString(), name: t.nombre }))
  ];

  const getFilteredData = () => {
    let data = technicianData;
    
    if (selectedTechnician !== 'all') {
      data = data.filter(d => d.id.toString() === selectedTechnician);
    }
    
    return data;
  };

  const generatePDFReport = (): PDFReportData => {
    const filteredData = getFilteredData();
    const stats = weeklyStats || {
      total_resolved: 0,
      resolution_rate: 0
    };
    
    return {
      title: 'Reporte de Técnicos y Tickets Resueltos',
      subtitle: `Semana: ${selectedWeek} (Lunes-Viernes) - Tasa de resolución: ${stats.resolution_rate}%`,
      data: filteredData.map(tech => ({
        nombre: tech.nombre,
        tickets_resueltos: tech.tickets_resueltos,
        eficiencia: `${tech.eficiencia}%`,
        tiempo_promedio: `${tech.tiempo_promedio}h`,
        semana: tech.semana
      })),
      columns: ['nombre', 'tickets_resueltos', 'eficiencia', 'tiempo_promedio'],
      generatedBy: 'Sistema de Reportes',
      generatedDate: new Date()
    };
  };

  const handleGenerateComplete = (success: boolean) => {
    setIsGenerating(false);
    if (success) {
      console.log('Reporte PDF generado exitosamente');
    } else {
      console.error('Error al generar reporte PDF');
    }
  };

  const filteredData = getFilteredData();

  if (isLoading) {
    return (
      <div className="technician-weekly-report">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando datos del reporte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="technician-weekly-report">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Error al cargar datos</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-weekly-report">
      <div className="report-header">
        <div className="header-content">
          <div className="header-icon">
            <Users size={32} />
          </div>
          <div className="header-text">
            <h1>Reporte de Técnicos y Tickets Resueltos</h1>
            <p>Análisis semanal del desempeño del equipo técnico (Lunes-Viernes)</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="export-btn">
            <Download size={16} />
            Exportar Datos
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="week-select">Semana</label>
            <select 
              id="week-select"
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="filter-select"
            >
              {weeks.map(week => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="tech-select">Técnico</label>
            <select 
              id="tech-select"
              value={selectedTechnician} 
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="filter-select"
            >
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {weeklyStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{weeklyStats.total_resolved}</h3>
              <p>Tickets Resueltos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{weeklyStats.resolution_rate}%</h3>
              <p>Tasa de Resolución</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{weeklyStats.active_technicians}</h3>
              <p>Técnicos Activos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>{weeklyStats.total_tickets}</h3>
              <p>Tickets del Período</p>
            </div>
          </div>
        </div>
      )}

      <div className="data-table-section">
        <h2>Detalles por Técnico</h2>
        <div className="table-wrapper">
          <table className="technician-table">
            <thead>
              <tr>
                <th>Técnico</th>
                <th>Tickets Resueltos</th>
                <th>Eficiencia</th>
                <th>Tiempo Promedio</th>
                <th>Semana</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((tech, index) => (
                <tr key={tech.id}>
                  <td className="tech-name">{tech.nombre}</td>
                  <td className="tickets-count">{tech.tickets_resueltos}</td>
                  <td className="efficiency">
                    <div className="efficiency-bar">
                      <div 
                        className="efficiency-fill" 
                        style={{ width: `${tech.eficiencia}%` }}
                      ></div>
                      <span>{tech.eficiencia}%</span>
                    </div>
                  </td>
                  <td className="avg-time">{tech.tiempo_promedio}h</td>
                  <td className="week">{tech.semana}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pdf-generation-section">
        <PDFReportGenerator 
          reportData={generatePDFReport()}
          onGenerateComplete={handleGenerateComplete}
        />
      </div>
    </div>
  );
};
