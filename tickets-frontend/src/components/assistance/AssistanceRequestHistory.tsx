import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  AlertTriangle, 
  Calendar, 
  Hash, 
  Filter, 
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User
} from 'lucide-react';
import ApiService from '../../services/api';
import './AssistanceRequestHistory.css';

interface AssistanceRequest {
  request_id: string;
  ticket_id: number;
  ticket_title: string;
  reason: string;
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  required_skills: string[];
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ASIGNADA' | 'COMPLETADA';
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
}

interface AssistanceRequestHistoryProps {
  technicianId: number;
  onClose?: () => void;
}

const AssistanceRequestHistory: React.FC<AssistanceRequestHistoryProps> = ({
  technicianId,
  onClose
}) => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, [technicianId]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getMyAssistanceRequests(technicianId);
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setError('No se pudieron cargar las solicitudes de asistencia');
      }
    } catch (error) {
      console.error('Error loading assistance requests:', error);
      setError('Error al cargar las solicitudes de asistencia');
    } finally {
      setLoading(false);
    }
  };

  const toggleRequestExpansion = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRÍTICA': return '#ef4444';
      case 'ALTA': return '#f97316';
      case 'MEDIA': return '#eab308';
      case 'BAJA': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return '#f59e0b';
      case 'APROBADA': return '#10b981';
      case 'RECHAZADA': return '#ef4444';
      case 'ASIGNADA': return '#3b82f6';
      case 'COMPLETADA': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return <Clock size={14} />;
      case 'APROBADA': return <CheckCircle size={14} />;
      case 'RECHAZADA': return <XCircle size={14} />;
      case 'ASIGNADA': return <Users size={14} />;
      case 'COMPLETADA': return <CheckCircle size={14} />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.ticket_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && request.status === 'PENDIENTE') ||
      (filterStatus === 'approved' && request.status === 'APROBADA') ||
      (filterStatus === 'rejected' && request.status === 'RECHAZADA') ||
      (filterStatus === 'completed' && request.status === 'COMPLETADA');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDIENTE').length,
      approved: requests.filter(r => r.status === 'APROBADA').length,
      rejected: requests.filter(r => r.status === 'RECHAZADA').length,
      completed: requests.filter(r => r.status === 'COMPLETADA').length
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="assistance-history-loading">
        <div className="spinner"></div>
        <p>Cargando historial de solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assistance-history-error">
        <AlertTriangle size={48} />
        <h3>Error</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={loadRequests}>
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="assistance-request-history">
      <div className="history-header">
        <div className="header-title">
          <h2>Mis Solicitudes de Asistencia</h2>
          {onClose && (
            <button className="btn-close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        
        <div className="history-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-card approved">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Aprobadas</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Completadas</span>
          </div>
        </div>
      </div>

      <div className="history-filters">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar solicitudes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <Filter size={18} className="filter-icon" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="completed">Completadas</option>
          </select>
        </div>
        
        <button className="btn-refresh" onClick={loadRequests}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="history-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <MessageSquare size={48} />
            <h3>No hay solicitudes</h3>
            <p>
              {searchTerm || filterStatus !== 'all' 
                ? 'No hay solicitudes que coincidan con los filtros seleccionados.'
                : 'No has realizado ninguna solicitud de asistencia.'
              }
            </p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div 
              key={request.request_id} 
              className={`history-request-card ${expandedRequests.has(request.request_id) ? 'expanded' : ''}`}
            >
              <div className="request-header" onClick={() => toggleRequestExpansion(request.request_id)}>
                <div className="request-main-info">
                  <div className="request-id">
                    <Hash size={16} />
                    {request.request_id}
                  </div>
                  <div className="request-title">{request.ticket_title}</div>
                  <div className="request-date">
                    <Calendar size={14} />
                    {formatDate(request.created_at)}
                  </div>
                </div>
                
                <div className="request-meta">
                  <div className="priority-badge" style={{ backgroundColor: getPriorityColor(request.priority) }}>
                    {request.priority}
                  </div>
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(request.status) }}>
                    {getStatusIcon(request.status)}
                    <span>{request.status}</span>
                  </div>
                  <button className="expand-btn">
                    {expandedRequests.has(request.request_id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {expandedRequests.has(request.request_id) && (
                <div className="request-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label><Hash size={16} /> Ticket ID</label>
                      <span>#{request.ticket_id}</span>
                    </div>
                    {request.updated_at && (
                      <div className="detail-item">
                        <label><Calendar size={16} /> Última actualización</label>
                        <span>{formatDate(request.updated_at)}</span>
                      </div>
                    )}
                  </div>

                  <div className="request-reason">
                    <label><MessageSquare size={16} /> Motivo de la solicitud</label>
                    <p>{request.reason}</p>
                  </div>

                  {request.required_skills.length > 0 && (
                    <div className="required-skills">
                      <label><Users size={16} /> Habilidades requeridas</label>
                      <div className="skills-chips">
                        {request.required_skills.map(skill => (
                          <span key={skill} className="skill-chip">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="admin-notes">
                      <label><User size={16} /> Respuesta del administrador</label>
                      <p>{request.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssistanceRequestHistory;
