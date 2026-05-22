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
  ChevronDown,
  Activity
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
  update_ticket: { label: 'Ticket Actualizado', icon: <Edit size={14} />, color: '#f59e0b' },
  close_ticket: { label: 'Ticket Cerrado', icon: <CheckCircle size={14} />, color: '#16a34a' },
  assign_technician: { label: 'Técnico Asignado', icon: <Users size={14} />, color: '#8b5cf6' },
  unassign_technician: { label: 'Técnico Desasignado', icon: <Users size={14} />, color: '#ef4444' },
  create_user: { label: 'Usuario Creado', icon: <Plus size={14} />, color: '#10b981' },
  update_user: { label: 'Usuario Actualizado', icon: <Edit size={14} />, color: '#f59e0b' },
  delete_user: { label: 'Usuario Eliminado', icon: <Trash2 size={14} />, color: '#ef4444' },
  create_office: { label: 'Oficina Creada', icon: <Building size={14} />, color: '#10b981' },
  update_office: { label: 'Oficina Actualizada', icon: <Edit size={14} />, color: '#f59e0b' },
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

  const handleViewDetail = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  return (
    <div className="audit-page">
      {/* Header */}
      <header className="audit-header">
        <div className="audit-header-content">
          <div className="audit-title-section">
            <h1 className="audit-title">
              <Shield size={28} />
              Auditoría del Sistema
            </h1>
            <p className="audit-description">Registro detallado de todos los eventos y movimientos del sistema</p>
          </div>
          <div className="audit-header-stats">
            <div className="audit-stat">
              <span className="audit-stat-n">{stats.total}</span>
              <span className="audit-stat-l">Total Eventos</span>
            </div>
            <div className="audit-stat">
              <span className="audit-stat-n">{stats.warning}</span>
              <span className="audit-stat-l">Advertencias</span>
            </div>
            <div className="audit-stat warn">
              <span className="audit-stat-n">{stats.critical}</span>
              <span className="audit-stat-l">Críticos</span>
            </div>
            <div className="audit-stat">
              <span className="audit-stat-n">{stats.logins}</span>
              <span className="audit-stat-l">Accesos</span>
            </div>
          </div>
        </div>
        <div className="audit-header-actions">
          <button className="audit-btn audit-btn--sec" onClick={() => navigate('/')}>
            <ArrowLeft size={15} />
            Panel Admin
          </button>
          <button className="audit-btn audit-btn--sec" onClick={loadData}>
            <Clock size={15} />
            Actualizar
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="audit-filters">
        <div className="audit-search">
          <Search size={16} />
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
        <div className="audit-filter-group">
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
          <Shield size={48} />
          <h3>Sin resultados</h3>
          <p>No se encontraron eventos con los filtros seleccionados</p>
        </div>
      ) : (
        <>
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Tipo</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>IP</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(entry => {
                  const typeInfo = formatEventType(entry);
                  return (
                    <tr key={entry.id} className={`audit-row audit-row--${entry.severity}`}>
                      <td className="audit-cell-datetime">
                        {formatDate(entry.eventDate)}
                        <span className="dt-time"> {formatTime(entry.eventDate)}</span>
                      </td>
                      <td>
                        <span className="audit-type-badge" style={{ backgroundColor: typeInfo.color + '18', color: typeInfo.color, borderColor: typeInfo.color + '30' }}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="audit-cell-user">
                        <User size={12} />
                        {entry.userName}
                        <span className="audit-user-role">{entry.userRole}</span>
                      </td>
                      <td className="audit-cell-desc">{entry.description}</td>
                      <td className="audit-cell-entity">{entry.entityDescription}</td>
                      <td className="audit-cell-ip">{entry.ipAddress}</td>
                      <td>
                        <button className="audit-view-btn" onClick={() => handleViewDetail(entry)} title="Ver detalle">
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`audit-pag-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
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
                <Shield size={22} />
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
                        <span className="audit-type-badge" style={{ backgroundColor: typeInfo.color + '18', color: typeInfo.color, borderColor: typeInfo.color + '30' }}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="audit-detail-section">
                        <h4><AlertCircle size={14} /> Severidad</h4>
                        <span className={`audit-severity audit-severity--${selectedEntry.severity}`}>
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
                        <h4><GlobeIcon size={14} /> Dirección IP</h4>
                        <code className="audit-ip">{selectedEntry.ipAddress}</code>
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

const GlobeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default AuditLog;