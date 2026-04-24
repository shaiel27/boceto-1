import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Ticket,
  Calendar,
  ArrowLeft,
  Download,
  Filter,
  Award,
  Target,
  Zap,
  Shield,
  Coffee
} from 'lucide-react';
import './TechnicianAnalytics.css';

interface AnalyticsData {
  overview: {
    total_technicians: number;
    available: number;
    busy: number;
    inactive: number;
    total_tickets: number;
    resolved_tickets: number;
    pending_tickets: number;
    avg_resolution_time: number;
  };
  by_service: {
    service_name: string;
    technician_count: number;
    ticket_count: number;
    resolution_rate: number;
  }[];
  performance: {
    technician_id: number;
    name: string;
    tickets_resolved: number;
    avg_resolution_time: number;
    efficiency: number;
  }[];
  schedule_analysis: {
    day: string;
    active_technicians: number;
    peak_hours: string;
  }[];
}

const TechnicianAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getTechnicianAnalytics(dateRange);
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Export functionality
    console.log('Exporting report...');
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-page">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>Error al cargar los datos de análisis</p>
          <button onClick={loadAnalytics} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { overview, by_service, performance, schedule_analysis } = analyticsData;

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-left">
            <button onClick={() => navigate('/admin/technicians')} className="back-btn">
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className="header-title">
              <h1>Análisis de Técnicos</h1>
              <p>Dashboard de métricas y rendimiento del equipo técnico</p>
            </div>
          </div>
          <div className="header-actions">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="date-select"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
            <button onClick={exportReport} className="btn btn-secondary">
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-section">
          <div className="section-header">
            <BarChart3 size={24} />
            <h2>Resumen General</h2>
          </div>
          <div className="overview-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-content">
                <h3>{overview.total_technicians}</h3>
                <p>Total Técnicos</p>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">
                <CheckCircle size={32} />
              </div>
              <div className="stat-content">
                <h3>{overview.available}</h3>
                <p>Disponibles</p>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">
                <Activity size={32} />
              </div>
              <div className="stat-content">
                <h3>{overview.busy}</h3>
                <p>Ocupados</p>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">
                <AlertCircle size={32} />
              </div>
              <div className="stat-content">
                <h3>{overview.inactive}</h3>
                <p>Inactivos</p>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">
                <Ticket size={32} />
              </div>
              <div className="stat-content">
                <h3>{overview.total_tickets}</h3>
                <p>Tickets Totales</p>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">
                <CheckCircle size={32} />
              </div>
              <div className="stat-content">
                <h3>{overview.resolved_tickets}</h3>
                <p>Resueltos</p>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">
                <Clock size={32} />
              </div>
              <div className="stat-content">
                <h3>{overview.avg_resolution_time}h</h3>
                <p>Tiempo Promedio</p>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">
                <Target size={32} />
              </div>
              <div className="stat-content">
                <h3>{((overview.resolved_tickets / overview.total_tickets) * 100).toFixed(1)}%</h3>
                <p>Tasa de Resolución</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Distribution */}
        <div className="analytics-section">
          <div className="section-header">
            <Wrench size={24} />
            <h2>Distribución por Servicio</h2>
          </div>
          <div className="service-distribution">
            {by_service.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-header">
                  <h3>{service.service_name}</h3>
                  <span className="service-badge">{service.technician_count} técnicos</span>
                </div>
                <div className="service-metrics">
                  <div className="metric">
                    <span className="metric-label">Tickets</span>
                    <span className="metric-value">{service.ticket_count}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Tasa Resolución</span>
                    <span className="metric-value">{service.resolution_rate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${service.resolution_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="analytics-section">
          <div className="section-header">
            <Award size={24} />
            <h2>Mejor Rendimiento</h2>
          </div>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>Técnico</th>
                  <th>Tickets Resueltos</th>
                  <th>Tiempo Promedio</th>
                  <th>Eficiencia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {performance.slice(0, 10).map((tech, index) => (
                  <tr key={tech.technician_id}>
                    <td>
                      <div className="technician-cell">
                        <div className="rank-badge">{index + 1}</div>
                        <span>{tech.name}</span>
                      </div>
                    </td>
                    <td>{tech.tickets_resolved}</td>
                    <td>{tech.avg_resolution_time.toFixed(1)}h</td>
                    <td>
                      <div className="efficiency-badge">
                        <Zap size={14} />
                        {tech.efficiency.toFixed(1)}%
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${tech.efficiency >= 80 ? 'high' : tech.efficiency >= 60 ? 'medium' : 'low'}`}>
                        {tech.efficiency >= 80 ? 'Excelente' : tech.efficiency >= 60 ? 'Bueno' : 'Mejorable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Analysis */}
        <div className="analytics-section">
          <div className="section-header">
            <Calendar size={24} />
            <h2>Análisis de Horarios</h2>
          </div>
          <div className="schedule-grid">
            {schedule_analysis.map((day, index) => (
              <div key={index} className="schedule-card">
                <div className="schedule-header">
                  <h3>{day.day}</h3>
                  <Shield size={20} />
                </div>
                <div className="schedule-metrics">
                  <div className="metric">
                    <span className="metric-label">Técnicos Activos</span>
                    <span className="metric-value">{day.active_technicians}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Hora Pico</span>
                    <span className="metric-value">{day.peak_hours}</span>
                  </div>
                </div>
                <div className="schedule-visual">
                  <div
                    className="schedule-bar"
                    style={{ width: `${(day.active_technicians / overview.total_technicians) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="analytics-section">
          <div className="section-header">
            <TrendingUp size={24} />
            <h2>Insights y Recomendaciones</h2>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon success">
                <CheckCircle size={24} />
              </div>
              <div className="insight-content">
                <h3>Alta Disponibilidad</h3>
                <p>
                  El {((overview.available / overview.total_technicians) * 100).toFixed(1)}% de técnicos están disponibles actualmente.
                </p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon warning">
                <Coffee size={24} />
              </div>
              <div className="insight-content">
                <h3>Optimización de Horarios</h3>
                <p>
                  Considere redistribuir técnicos en horarios de baja actividad para mejorar la cobertura.
                </p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon info">
                <Target size={24} />
              </div>
              <div className="insight-content">
                <h3>Mejora Continua</h3>
                <p>
                  La tasa de resolución del {((overview.resolved_tickets / overview.total_tickets) * 100).toFixed(1)}% indica un buen rendimiento general.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianAnalytics;
