import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  ArrowLeft,
  X,
  Eye,
  Calendar,
  Clock,
  User,
  LogIn,
  LogOut,
  FileText,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  Edit,
  Trash2,
  Users,
  Building,
  Activity,
  RefreshCw,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { ApiService } from '../../services/api';
import './AuditLog.css';

interface AuditEntry {
  id: number;
  eventDate: string;
  eventType: string;
  action: string;
  userName: string;
  userRole: string;
  entityType: string;
  entityId: number | null;
  entityDescription: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'critical';
}

interface AuditStats {
  total: number;
  info: number;
  warning: number;
  critical: number;
  logins: number;
}

const EVENT_TYPES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  login: { label: 'Inicio de Sesión', icon: <LogIn size={14} />, color: '#3b82f6' },
  logout: { label: 'Cierre de Sesión', icon: <LogOut size={14} />, color: '#64748b' },
  create_ticket: { label: 'Ticket Creado', icon: <FileText size={14} />, color: '#10b981' },
  update_ticket: { label: 'Ticket Actualizado', icon: <Edit size={14} />, color: '#d97706' },
  close_ticket: { label: 'Ticket Cerrado', icon: <CheckCircle size={14} />, color: '#16a34a' },
  assign_technician: { label: 'Técnico Asignado', icon: <Users size={14} />, color: '#8b5cf6' },
  unassign_technician: { label: 'Técnico Desasignado', icon: <Users size={14} />, color: '#ef4444' },
  create_user: { label: 'Usuario Creado', icon: <Plus size={14} />, color: '#10b981' },
  update_user: { label: 'Usuario Actualizado', icon: <Edit size={14} />, color: '#d97706' },
  delete_user: { label: 'Usuario Eliminado', icon: <Trash2 size={14} />, color: '#ef4444' },
  create_office: { label: 'Oficina Creada', icon: <Building size={14} />, color: '#10b981' },
  update_office: { label: 'Oficina Actualizada', icon: <Edit size={14} />, color: '#d97706' },
  delete_office: { label: 'Oficina Eliminada', icon: <Trash2 size={14} />, color: '#ef4444' },
  change_password: { label: 'Contraseña Cambiada', icon: <Shield size={14} />, color: '#8b5cf6' },
  system_config: { label: 'Configuración del Sistema', icon: <Settings size={14} />, color: '#06b6d4' },
  create_comment: { label: 'Comentario Agregado', icon: <Activity size={14} />, color: '#3b82f6' },
  technician_status: { label: 'Estado de Técnico', icon: <Users size={14} />, color: '#f97316' }
};

const formatEventType = (row: AuditEntry): { label: string; icon: React.ReactNode; color: string } => {
  const known = EVENT_TYPES[row.eventType];
  if (known) return known;
  return { label: row.eventType, icon: <Activity size={14} />, color: '#94a3b8' };
};

const AuditLog: React.FC = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats>({ total: 0, info: 0, warning: 0, critical: 0, logins: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sequenceInfo, setSequenceInfo] = useState<{ current_number: number; total_tickets: number; generation?: number } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    ApiService.getTicketSequence().then(r => {
      if (r.success && r.data) setSequenceInfo(r.data);
    });
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let from: string | undefined;
      let to: string | undefined;

      if (dateRange === 'today') {
        const s = new Date(now); s.setHours(0, 0, 0, 0);
        from = s.toISOString().slice(0, 19).replace('T', ' ');
        to = now.toISOString().slice(0, 19).replace('T', ' ');
      } else if (dateRange === 'week') {
        const s = new Date(now); s.setDate(s.getDate() - 7);
        from = s.toISOString().slice(0, 19).replace('T', ' ');
        to = now.toISOString().slice(0, 19).replace('T', ' ');
      } else if (dateRange === 'month') {
        const s = new Date(now); s.setMonth(s.getMonth() - 1);
        from = s.toISOString().slice(0, 19).replace('T', ' ');
        to = now.toISOString().slice(0, 19).replace('T', ' ');
      }

      const [listResult, statsResult] = await Promise.all([
        ApiService.getAuditLogs({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          action_type: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          from,
          to,
        }),
        ApiService.getAuditStats(),
      ]);

      if (listResult.success) {
        setAuditLogs(listResult.data || []);
        setTotalCount((listResult as any).pagination?.total ?? 0);
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (err) {
      console.error('Error loading audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, eventTypeFilter, severityFilter, dateRange]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const handleResetSequence = async () => {
    setResetting(true);
    try {
      const r = await ApiService.resetTicketSequence();
      if (r.success) {
        setSequenceInfo(prev => prev ? { ...prev, current_number: 0, generation: (prev.generation || 1) + 1 } : null);
      } else {
        alert(r.message || 'Error al reiniciar');
      }
    } catch {
      alert('Error de conexión');
    }
    setResetting(false);
    setShowResetConfirm(false);
  };

  const handleViewDetail = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  return (
    <div className="audit-page">
      <header className="audit-header">
        <div className="audit-title-group">
          <div className="audit-titles">
            <h1>Auditoría del Sistema</h1>
            <p>Registro de eventos y movimientos del sistema</p>
          </div>
        </div>
        <div className="audit-header-actions">
          <button className="audit-btn audit-btn--sec" onClick={loadData}>
            <RefreshCw size={15} />
            Actualizar
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="audit-stats">
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--total"><Activity /></div>
          <div className="audit-stat-body">
            <span className="audit-stat-num">{stats.total}</span>
            <span className="audit-stat-label">Total Eventos</span>
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--warning"><AlertTriangle /></div>
          <div className="audit-stat-body">
            <span className="audit-stat-num">{stats.warning}</span>
            <span className="audit-stat-label">Advertencias</span>
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--critical"><AlertCircle /></div>
          <div className="audit-stat-body">
            <span className="audit-stat-num">{stats.critical}</span>
            <span className="audit-stat-label">Críticos</span>
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--logins"><LogIn /></div>
          <div className="audit-stat-body">
            <span className="audit-stat-num">{stats.logins}</span>
            <span className="audit-stat-label">Accesos</span>
          </div>
        </div>
      </div>

      {/* Sequence bar */}
      {sequenceInfo && (
        <div className="gvt-seqbar">
          <div className="gvt-seqbar-item">
            <span className="gvt-seqbar-label">Total tickets</span>
            <span className="gvt-seqbar-val">{sequenceInfo.total_tickets.toLocaleString()}</span>
          </div>
          <div className="gvt-seqbar-item">
            <span className="gvt-seqbar-label">Último código</span>
            <span className="gvt-seqbar-code">TICK-{String(sequenceInfo.current_number).padStart(6, '0')}</span>
          </div>
          {sequenceInfo.generation !== undefined && sequenceInfo.generation > 1 && (
            <div className="gvt-seqbar-item">
              <span className="gvt-seqbar-label">Generación</span>
              <span className="gvt-seqbar-val">{sequenceInfo.generation}</span>
            </div>
          )}
          <button
            className="gvt-seqbar-reset"
            onClick={() => setShowResetConfirm(true)}
            title="Reiniciar contador de tickets"
          >
            Reiniciar contador
          </button>
        </div>
      )}

      {showResetConfirm && (
        <div className="gvt-over" onClick={() => setShowResetConfirm(false)}>
          <div className="gvt-mod gvt-mod--sm" onClick={e => e.stopPropagation()}>
            <div className="gvt-mod-h">
              <span className="gvt-mod-t">Reiniciar contador</span>
              <button className="gvt-mod-x" onClick={() => setShowResetConfirm(false)}>×</button>
            </div>
            <div className="gvt-mod-b">
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
                ¿Reiniciar la secuencia de tickets? Los códigos existentes no se modifican.
                El próximo ticket será <strong>TICK-000001</strong>.
              </p>
            </div>
            <div className="gvt-mod-f">
              <button className="gvt-btn" onClick={() => setShowResetConfirm(false)}>Cancelar</button>
              <button className="gvt-btn gvt-btn--danger" onClick={handleResetSequence} disabled={resetting}>
                {resetting ? 'Reiniciando...' : 'Reiniciar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Severity Legend */}
      <div className="audit-legend">
        <span className="audit-legend-item">
          <span className="audit-legend-dot audit-legend-dot--info" />
          Información
        </span>
        <span className="audit-legend-item">
          <span className="audit-legend-dot audit-legend-dot--warning" />
          Advertencia
        </span>
        <span className="audit-legend-item">
          <span className="audit-legend-dot audit-legend-dot--critical" />
          Crítico
        </span>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="audit-search-wrap">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por usuario, descripción, entidad o IP..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          {searchTerm && (
            <button className="audit-search-clear" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="audit-filter-selects">
          <select value={eventTypeFilter} onChange={(e) => { setEventTypeFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Todos los tipos</option>
            {Object.entries(EVENT_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Todas las severidades</option>
            <option value="info">Información</option>
            <option value="warning">Advertencia</option>
            <option value="critical">Crítico</option>
          </select>
          <select value={dateRange} onChange={(e) => { setDateRange(e.target.value as any); setCurrentPage(1); }}>
            <option value="all">Todo el período</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="audit-loading">
          <div className="audit-spinner" />
          <p>Cargando registros de auditoría...</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="audit-empty">
          <Shield className="empty-icon" />
          <h3>Sin resultados</h3>
          <p>No se encontraron eventos con los filtros seleccionados</p>
        </div>
      ) : (
        <>
          <div className="audit-event-list">
            {auditLogs.map(entry => {
              const typeInfo = formatEventType(entry);
              return (
                <div
                  key={entry.id}
                  className={`audit-event-card audit-event-card--${entry.severity}`}
                >
                  <div className="audit-card-top">
                    <div className="audit-card-datetime">
                      <Calendar size={13} />
                      <span className="audit-card-date">{formatDate(entry.eventDate)}</span>
                      <Clock size={13} />
                      <span className="audit-card-time">{formatTime(entry.eventDate)}</span>
                    </div>
                    <div className="audit-card-right">
                      <span className={`audit-severity-badge audit-severity-badge--${entry.severity}`}>
                        {entry.severity === 'critical' ? 'Crítico' : entry.severity === 'warning' ? 'Advertencia' : 'Info'}
                      </span>
                      <button className="audit-view-btn" onClick={() => handleViewDetail(entry)} title="Ver detalle">
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="audit-card-middle">
                    <span className="audit-type-badge" style={{
                      backgroundColor: typeInfo.color + '18',
                      color: typeInfo.color,
                      borderColor: typeInfo.color + '30'
                    }}>
                      {typeInfo.icon}
                      {typeInfo.label}
                    </span>
                    <span className="audit-card-user">
                      <User size={12} />
                      {entry.userName}
                      <span className="audit-card-role">{entry.userRole}</span>
                    </span>
                  </div>

                  <div className="audit-card-body">
                    <span className="audit-card-desc">{entry.description}</span>
                    <div className="audit-card-meta">
                      {entry.entityDescription && (
                        <span className="audit-card-entity">
                          <FileText size={11} />
                          {entry.entityDescription}
                        </span>
                      )}
                      <span className="audit-card-ip">{entry.ipAddress}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="audit-pagination">
              <span className="audit-pag-info">
                {totalCount} registros — Página {currentPage} de {totalPages}
              </span>
              <div className="audit-pag-btns">
                <button
                  className="audit-pag-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      className={`audit-pag-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className="audit-pag-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="audit-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="audit-modal-header">
              <div className="audit-modal-title">
                <Shield />
                <h2>Detalle del Evento</h2>
              </div>
              <button className="audit-modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="audit-modal-body">
              {(() => {
                const typeInfo = formatEventType(selectedEntry);
                return (
                  <>
                    <div className="audit-detail-grid">
                      <div className="audit-detail-section">
                        <h4><Calendar size={14} /> Fecha y Hora</h4>
                        <p>{formatDateTime(selectedEntry.eventDate)}</p>
                      </div>
                      <div className="audit-detail-section">
                        <h4><Activity size={14} /> Tipo de Evento</h4>
                        <span className="audit-type-badge" style={{
                          backgroundColor: typeInfo.color + '18',
                          color: typeInfo.color,
                          borderColor: typeInfo.color + '30'
                        }}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="audit-detail-section">
                        <h4><AlertCircle size={14} /> Severidad</h4>
                        <span className={`audit-severity-badge audit-severity-badge--${selectedEntry.severity}`}>
                          {selectedEntry.severity === 'critical' ? 'Crítico' : selectedEntry.severity === 'warning' ? 'Advertencia' : 'Información'}
                        </span>
                      </div>
                      <div className="audit-detail-section">
                        <h4><User size={14} /> Usuario</h4>
                        <p>{selectedEntry.userName}</p>
                        <small>{selectedEntry.userRole}</small>
                      </div>
                    </div>

                    <div className="audit-detail-divider" />

                    <div className="audit-detail-full">
                      <div className="audit-detail-section">
                        <h4>Descripción</h4>
                        <p className="audit-desc-text">{selectedEntry.description}</p>
                      </div>
                      <div className="audit-detail-section">
                        <h4>Entidad Afectada</h4>
                        <p>{selectedEntry.entityDescription}</p>
                        <small>Tipo: {selectedEntry.entityType} — ID: {selectedEntry.entityId}</small>
                      </div>
                    </div>

                    <div className="audit-detail-divider" />

                    <div className="audit-detail-grid">
                      <div className="audit-detail-section">
                        <h4><Globe size={14} /> Dirección IP</h4>
                        <code className="audit-ip-code">{selectedEntry.ipAddress}</code>
                      </div>
                      <div className="audit-detail-section audit-detail-section--full">
                        <h4>User Agent</h4>
                        <p className="audit-ua">{selectedEntry.userAgent}</p>
                      </div>
                    </div>

                    <div className="audit-detail-divider" />

                    <div className="audit-detail-raw">
                      <h4>Datos Técnicos</h4>
                      <pre>{JSON.stringify({
                        id: selectedEntry.id,
                        eventType: selectedEntry.eventType,
                        action: selectedEntry.action,
                        entityId: selectedEntry.entityId,
                        entityType: selectedEntry.entityType,
                        severity: selectedEntry.severity,
                        timestamp: selectedEntry.eventDate
                      }, null, 2)}</pre>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
