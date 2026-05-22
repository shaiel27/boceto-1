import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Send, 
  X, 
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Hash,
  Filter,
  RefreshCw
} from 'lucide-react';
import ApiService from '../../services/api';
import './AdminAssistanceManagement.css';

interface AssistanceRequest {
  ID_Request: number;
  request_id: string;
  Fk_Ticket: number;
  Fk_Requesting_Technician: number;
  technician_name: string;
  ticket_subject: string;
  Ticket_Code: string;
  status: string;
  Requested_At: string;
  Updated_At?: string;
  Notification_Count: number;
  Last_Notified_At?: string;
}

interface AdminAssistanceManagementProps {
  onRequestsUpdate?: (count: number) => void;
}

const AdminAssistanceManagement: React.FC<AdminAssistanceManagementProps> = ({
  onRequestsUpdate
}) => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [filterPriority, _setFilterPriority] = useState<'all' | string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionForm, setActionForm] = useState({
    action: 'approve' as 'approve' | 'reject',
    admin_notes: '',
    assigned_technicians: [] as number[]
  });
  
  const [availableTechnicians, setAvailableTechnicians] = useState<any[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filterStatus, filterPriority]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getPendingAssistanceRequests();
      if (response.success && response.data) {
        let filteredRequests = response.data;
        
        // Apply filters
        if (filterStatus !== 'all') {
          const statusMap: Record<string, string> = {
            pending: 'PENDIENTE',
            approved: 'ASIGNADO',
            rejected: 'RECHAZADO'
          };
          filteredRequests = filteredRequests.filter((req: AssistanceRequest) => req.status === statusMap[filterStatus]);
        }
        
        setRequests(filteredRequests);
        onRequestsUpdate?.(filteredRequests.filter((req: AssistanceRequest) => req.status === 'PENDIENTE').length);
      }
    } catch (error) {
      console.error('Error loading assistance requests:', error);
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

  const loadTechnicians = async () => {
    setLoadingTechnicians(true);
    try {
      const response = await ApiService.getTechnicians();
      if (response.success && response.data) {
        setAvailableTechnicians(response.data);
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
      // Fallback mock data
      setAvailableTechnicians([
        { id: 1, name: 'Juan Pérez', email: 'juan@ejemplo.com', services: ['Redes', 'Hardware'] },
        { id: 2, name: 'María González', email: 'maria@ejemplo.com', services: ['Software', 'Base de datos'] },
        { id: 3, name: 'Carlos Rodríguez', email: 'carlos@ejemplo.com', services: ['Redes', 'Seguridad'] },
        { id: 4, name: 'Ana Martínez', email: 'ana@ejemplo.com', services: ['Hardware', 'Impresoras'] },
        { id: 5, name: 'Pedro Sánchez', email: 'pedro@ejemplo.com', services: ['Software', 'Programación'] }
      ]);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleActionClick = async (request: AssistanceRequest) => {
    setSelectedRequest(request);
    setActionForm({
      action: 'approve',
      admin_notes: '',
      assigned_technicians: []
    });
    setShowActionModal(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest) return;

    setActionLoading(selectedRequest.request_id);
    
    try {
      const response = await ApiService.respondAssistanceRequest(
        selectedRequest.ID_Request,
        actionForm.action === 'approve' ? 'accept' : 'reject'
      );
      
      if (response.success) {
        await loadRequests();
        setShowActionModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error managing assistance request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return '#f59e0b';
      case 'ASIGNADO': return '#10b981';
      case 'RECHAZADO': return '#ef4444';
      case 'CANCELADO': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return <Clock size={14} />;
      case 'ASIGNADO': return <CheckCircle size={14} />;
      case 'RECHAZADO': return <XCircle size={14} />;
      case 'CANCELADO': return <AlertTriangle size={14} />;
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

  if (loading) {
    return (
      <div className="admin-assistance-loading">
        <div className="spinner"></div>
        <p>Cargando solicitudes de asistencia...</p>
      </div>
    );
  }

  return (
    <div className="admin-assistance-management">
      <div className="admin-assistance-header">
        <div className="header-title">
          <AlertTriangle className="header-icon" />
          <h2>Gestión de Solicitudes de Asistencia</h2>
        </div>
        <button className="refresh-btn" onClick={loadRequests}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="admin-assistance-filters">
        <div className="filter-group">
          <label>
            <Filter size={16} />
            Estado
          </label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      <div className="assistance-requests-list">
        {requests.length === 0 ? (
          <div className="no-requests">
            <AlertTriangle className="no-requests-icon" />
            <h3>No hay solicitudes de asistencia</h3>
            <p>
              {filterStatus === 'pending' 
                ? 'No hay solicitudes pendientes de revisión.'
                : 'No hay solicitudes que coincidan con los filtros seleccionados.'
              }
            </p>
          </div>
        ) : (
          requests.map(request => (
            <div 
              key={request.ID_Request} 
              className={`assistance-request-card ${expandedRequests.has(String(request.ID_Request)) ? 'expanded' : ''}`}
            >
              <div className="request-header" onClick={() => toggleRequestExpansion(String(request.ID_Request))}>
                <div className="request-main-info">
                  <div className="request-id">
                    <Hash size={16} />
                    #{request.ID_Request}
                  </div>
                  <div className="request-title">{request.ticket_subject || request.Ticket_Code || `Ticket #${request.Fk_Ticket}`}</div>
                </div>
                
                <div className="request-meta">
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(request.status) }}>
                    {getStatusIcon(request.status)}
                    <span>{request.status}</span>
                  </div>
                  <button className="expand-btn">
                    {expandedRequests.has(String(request.ID_Request)) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {expandedRequests.has(String(request.ID_Request)) && (
                <div className="request-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label><User size={16} /> Técnico solicitante</label>
                      <span>{request.technician_name}</span>
                    </div>
                    <div className="detail-item">
                      <label><Calendar size={16} /> Fecha de solicitud</label>
                      <span>{formatDate(request.Requested_At)}</span>
                    </div>
                    <div className="detail-item">
                      <label><Hash size={16} /> Ticket</label>
                      <span>#{request.Fk_Ticket}</span>
                    </div>
                    <div className="detail-item">
                      <label><AlertTriangle size={16} /> Notificaciones</label>
                      <span>{request.Notification_Count > 0 ? `${request.Notification_Count}x` : 'Inicial'}</span>
                    </div>
                  </div>

                  {request.status === 'PENDIENTE' && (
                    <div className="request-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleActionClick(request)}
                        disabled={actionLoading === String(request.ID_Request)}
                      >
                        {actionLoading === String(request.ID_Request) ? (
                          <>
                            <div className="spinner-small"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Aceptar
                          </>
                        )}
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleActionClick(request)}
                        disabled={actionLoading === String(request.ID_Request)}
                      >
                        {actionLoading === String(request.ID_Request) ? (
                          <>
                            <div className="spinner-small"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <XCircle size={16} />
                            Rechazar
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>          
          ))
        )}
      </div>

      {showActionModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => {if (!actionLoading) {setShowActionModal(false); setSelectedRequest(null);}}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Responder Solicitud de Asistencia</h3>
              <button 
                className="close-btn"
                onClick={() => {setShowActionModal(false); setSelectedRequest(null);}}
                disabled={!!actionLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-summary">
                <p><strong>Técnico:</strong> {selectedRequest.technician_name}</p>
                <p><strong>Ticket:</strong> #{selectedRequest.Fk_Ticket} - {selectedRequest.ticket_subject}</p>
              </div>

              <div className="action-form">
                <div className="form-group">
                  <label>¿Qué deseas hacer?</label>
                  <div className="action-options">
                    <button 
                      className={`action-option ${actionForm.action === 'approve' ? 'active' : ''}`}
                      onClick={() => setActionForm(prev => ({ ...prev, action: 'approve' }))}
                    >
                      <CheckCircle size={16} />
                      Aceptar solicitud
                    </button>
                    <button 
                      className={`action-option ${actionForm.action === 'reject' ? 'active' : ''}`}
                      onClick={() => setActionForm(prev => ({ ...prev, action: 'reject' }))}
                    >
                      <XCircle size={16} />
                      Rechazar solicitud
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {setShowActionModal(false); setSelectedRequest(null);}}
                disabled={!!actionLoading}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleActionSubmit}
                disabled={actionLoading === String(selectedRequest.ID_Request)}
              >
                {actionLoading === String(selectedRequest.ID_Request) ? (
                  <>
                    <div className="spinner-small"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {actionForm.action === 'approve' ? 'Aceptar' : 'Rechazar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssistanceManagement;
