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
  request_id: string;
  comment_id: number;
  technician_id: number;
  technician_name: string;
  ticket_id: number;
  ticket_title: string;
  reason: string;
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  required_skills: string[];
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ASIGNADA';
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
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
  const [filterPriority, setFilterPriority] = useState<'all' | 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA'>('all');
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
          const statusMap = {
            pending: 'PENDIENTE',
            approved: 'APROBADA',
            rejected: 'RECHAZADA'
          };
          filteredRequests = filteredRequests.filter((req: AssistanceRequest) => req.status === statusMap[filterStatus as keyof typeof statusMap]);
        }
        
        if (filterPriority !== 'all') {
          filteredRequests = filteredRequests.filter((req: AssistanceRequest) => req.priority === filterPriority);
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
    
    // Load available technicians when opening modal
    await loadTechnicians();
    setShowActionModal(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest) return;

    setActionLoading(selectedRequest.request_id);
    
    try {
      const response = await ApiService.manageAssistanceRequest(
        selectedRequest.request_id,
        actionForm
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
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return <Clock size={14} />;
      case 'APROBADA': return <CheckCircle size={14} />;
      case 'RECHAZADA': return <XCircle size={14} />;
      case 'ASIGNADA': return <Users size={14} />;
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
        
        <div className="filter-group">
          <label>
            <AlertTriangle size={16} />
            Prioridad
          </label>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value as any)}
          >
            <option value="all">Todas</option>
            <option value="CRÍTICA">Crítica</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
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
              key={request.request_id} 
              className={`assistance-request-card ${expandedRequests.has(request.request_id) ? 'expanded' : ''}`}
            >
              <div className="request-header" onClick={() => toggleRequestExpansion(request.request_id)}>
                <div className="request-main-info">
                  <div className="request-id">
                    <Hash size={16} />
                    {request.request_id}
                  </div>
                  <div className="request-title">{request.ticket_title}</div>
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
                      <label><User size={16} /> Técnico solicitante</label>
                      <span>{request.technician_name}</span>
                    </div>
                    <div className="detail-item">
                      <label><Calendar size={16} /> Fecha de solicitud</label>
                      <span>{formatDate(request.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <label><Hash size={16} /> Ticket ID</label>
                      <span>#{request.ticket_id}</span>
                    </div>
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
                      <label><MessageSquare size={16} /> Notas del administrador</label>
                      <p>{request.admin_notes}</p>
                    </div>
                  )}

                  {request.status === 'PENDIENTE' && (
                    <div className="request-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleActionClick(request)}
                        disabled={actionLoading === request.request_id}
                      >
                        {actionLoading === request.request_id ? (
                          <>
                            <div className="spinner-small"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Aprobar
                          </>
                        )}
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleActionClick(request)}
                        disabled={actionLoading === request.request_id}
                      >
                        {actionLoading === request.request_id ? (
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
        <div className="action-modal-overlay">
          <div className="action-modal-container">
            <div className="action-modal-header">
              <h3>
                {actionForm.action === 'approve' ? 'Aprobar' : 'Rechazar'} Solicitud de Asistencia
              </h3>
              <button className="modal-close" onClick={() => setShowActionModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="action-modal-body">
              <div className="request-summary">
                <h4>Solicitud: {selectedRequest.request_id}</h4>
                <p><strong>Técnico:</strong> {selectedRequest.technician_name}</p>
                <p><strong>Ticket:</strong> #{selectedRequest.ticket_id} - {selectedRequest.ticket_title}</p>
                <p><strong>Motivo:</strong> {selectedRequest.reason}</p>
                <p><strong>Prioridad:</strong> <span className="priority-badge" style={{ backgroundColor: getPriorityColor(selectedRequest.priority) }}>{selectedRequest.priority}</span></p>
              </div>

              <div className="action-form">
                <div className="form-group">
                  <label>Acción</label>
                  <div className="action-options">
                    <button 
                      className={`action-option ${actionForm.action === 'approve' ? 'active' : ''}`}
                      onClick={() => setActionForm(prev => ({ ...prev, action: 'approve' }))}
                    >
                      <CheckCircle size={16} />
                      Aprobar solicitud
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

                <div className="form-group">
                  <label htmlFor="admin_notes">Notas del administrador (opcional)</label>
                  <textarea
                    id="admin_notes"
                    value={actionForm.admin_notes}
                    onChange={(e) => setActionForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                    placeholder="Añade observaciones sobre esta decisión..."
                    rows={4}
                  />
                </div>

                {actionForm.action === 'approve' && (
                  <div className="form-group">
                    <label>Asignar Técnicos Adicionales</label>
                    {loadingTechnicians ? (
                      <div className="loading-technicians">
                        <div className="spinner-small"></div>
                        <span>Cargando técnicos disponibles...</span>
                      </div>
                    ) : (
                      <>
                        <div className="technicians-selection">
                          <div className="required-skills-info">
                            <strong>Habilidades requeridas:</strong>
                            <div className="skill-chips">
                              {selectedRequest.required_skills.map(skill => (
                                <span key={skill} className="skill-chip">{skill}</span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="technicians-list">
                            {availableTechnicians.map(technician => (
                              <div 
                                key={technician.id} 
                                className={`technician-option ${actionForm.assigned_technicians.includes(technician.id) ? 'selected' : ''}`}
                                onClick={() => {
                                  setActionForm(prev => ({
                                    ...prev,
                                    assigned_technicians: prev.assigned_technicians.includes(technician.id)
                                      ? prev.assigned_technicians.filter(id => id !== technician.id)
                                      : [...prev.assigned_technicians, technician.id]
                                  }));
                                }}
                              >
                                <div className="technician-info">
                                  <div className="technician-name">{technician.name}</div>
                                  <div className="technician-email">{technician.email}</div>
                                  <div className="technician-skills">
                                    {technician.services?.map((service: string) => (
                                      <span key={service} className="service-tag">{service}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="technician-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={actionForm.assigned_technicians.includes(technician.id)}
                                    onChange={() => {}}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {actionForm.assigned_technicians.length > 0 && (
                            <div className="selected-technicians-summary">
                              <strong>Técnicos seleccionados ({actionForm.assigned_technicians.length}):</strong>
                              <div className="selected-tech-list">
                                {actionForm.assigned_technicians.map(techId => {
                                  const tech = availableTechnicians.find(t => t.id === techId);
                                  return tech ? (
                                    <span key={techId} className="selected-tech-chip">
                                      {tech.name}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActionForm(prev => ({
                                            ...prev,
                                            assigned_technicians: prev.assigned_technicians.filter(id => id !== techId)
                                          }));
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="action-modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowActionModal(false)}
                disabled={actionLoading !== null}
              >
                Cancelar
              </button>
              <button 
                className={`btn-submit ${actionForm.action === 'approve' ? 'approve' : 'reject'}`}
                onClick={handleActionSubmit}
                disabled={actionLoading !== null}
              >
                {actionLoading === selectedRequest.request_id ? (
                  <>
                    <div className="spinner-small"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {actionForm.action === 'approve' ? 'Aprobar' : 'Rechazar'} Solicitud
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
