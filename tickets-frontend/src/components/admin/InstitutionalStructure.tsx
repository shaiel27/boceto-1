import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Search, Edit, Trash2, Eye, ArrowLeft,
  User, X, ChevronRight, ChevronDown, Users, Shield, Mail, Phone,
  MapPin, Building, Layers, TreePine, RefreshCw, AlertCircle,
  CheckCircle, Clock, Hash, BadgeCheck
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import ApiService from '../../services/api';
import './InstitutionalStructure.css';

interface OfficeNode {
  ID_Office: number;
  Name_Office: string;
  coduniadm: string | null;
  created_at: string;
  ID_Boss: number | null;
  boss_name: string | null;
  boss_pronoun: string | null;
  boss_user_id: number | null;
  boss_email: string | null;
  boss_full_name: string | null;
  technician_count: number;
  has_boss: boolean;
}

interface StructureGroup {
  label: string;
  icon: React.ReactNode;
  prefix: string;
  offices: OfficeNode[];
}

const PREFIX_MAP = [
  { prefix: 'Dirección', label: 'Direcciones', icon: <Building2 size={18} />, color: 'var(--institution-navy)' },
  { prefix: 'División', label: 'Divisiones', icon: <Layers size={18} />, color: 'var(--institutional-primary)' },
  { prefix: 'Coordinación', label: 'Coordinaciones', icon: <MapPin size={18} />, color: 'var(--institutional-accent)' },
];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getGroupColor(name: string): { bg: string; text: string; border: string } {
  const lower = name.toLowerCase();
  if (lower.startsWith('dirección')) return { bg: '#eef2ff', text: '#1e3a8a', border: '#c7d2fe' };
  if (lower.startsWith('división')) return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
  if (lower.startsWith('coordinación')) return { bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
  return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
}

function getRoleBadge(officeName: string): { label: string; color: string } {
  const lower = officeName.toLowerCase();
  if (lower.startsWith('dirección')) return { label: 'Director', color: '#1e3a8a' };
  if (lower.startsWith('división')) return { label: 'Jefe', color: '#166534' };
  if (lower.startsWith('coordinación')) return { label: 'Coordinador', color: '#92400e' };
  return { label: 'Responsable', color: '#475569' };
}

const InstitutionalStructure: React.FC = () => {
  const navigate = useNavigate();

  const [offices, setOffices] = useState<OfficeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Dirección');
  const [expandedOffice, setExpandedOffice] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStructure = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getStructure();
      if (res.success && res.data) {
        setOffices(res.data);
      } else {
        setError(res.message || 'Error al cargar la estructura');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      await fetch(`http://localhost:8000/api/office?action=sync`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchStructure();
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<string, OfficeNode[]> = {};
    const other: OfficeNode[] = [];

    for (const office of offices) {
      let matched = false;
      for (const { prefix } of PREFIX_MAP) {
        if (office.Name_Office.toLowerCase().startsWith(prefix.toLowerCase())) {
          if (!groups[prefix]) groups[prefix] = [];
          groups[prefix].push(office);
          matched = true;
          break;
        }
      }
      if (!matched) {
        other.push(office);
      }
    }

    if (other.length > 0) {
      groups['Otras'] = other;
    }

    return PREFIX_MAP
      .filter(({ prefix }) => groups[prefix])
      .map(({ prefix, label, icon }) => ({
        label,
        icon,
        prefix,
        offices: groups[prefix],
      }))
      .concat(
        groups['Otras']
          ? [{ label: 'Otras Dependencias', icon: <Building size={18} />, prefix: 'Otras', offices: groups['Otras'] }]
          : []
      );
  }, [offices]);

  const totalStats = useMemo(() => ({
    total: offices.length,
    withBoss: offices.filter(o => o.has_boss).length,
    withoutBoss: offices.filter(o => !o.has_boss).length,
    totalTechnicians: offices.reduce((acc, o) => acc + o.technician_count, 0),
  }), [offices]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return grouped;
    const q = searchTerm.toLowerCase();
    return grouped
      .map(g => ({
        ...g,
        offices: g.offices.filter(o =>
          o.Name_Office.toLowerCase().includes(q) ||
          (o.boss_full_name && o.boss_full_name.toLowerCase().includes(q)) ||
          (o.boss_email && o.boss_email.toLowerCase().includes(q))
        ),
      }))
      .filter(g => g.offices.length > 0);
  }, [grouped, searchTerm]);

  return (
    <div className="is-root">
      <ModernSidebar />
      <div className="is-page">

        {/* Hero Header */}
        <header className="is-hero">
          <div className="is-hero-bg" />
          <div className="is-hero-content">
            <div className="is-hero-top">
              <button className="is-back-btn" onClick={() => navigate('/admin')}>
                <ArrowLeft size={16} />
                <span>Panel</span>
              </button>
              <button
                className="is-sync-btn"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw size={14} className={syncing ? 'is-spin' : ''} />
                <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            </div>
            <div className="is-hero-title-group">
              <div className="is-hero-icon">
                <TreePine size={28} />
              </div>
              <div>
                <h1 className="is-hero-title">Organización Municipal</h1>
                <p className="is-hero-sub">Estructura administrativa de la Alcaldía de San Cristóbal</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="is-stats-bar">
            <div className="is-stat">
              <span className="is-stat-value">{totalStats.total}</span>
              <span className="is-stat-label">Dependencias</span>
            </div>
            <div className="is-stat-divider" />
            <div className="is-stat">
              <span className="is-stat-value">{totalStats.withBoss}</span>
              <span className="is-stat-label">Con Responsable</span>
            </div>
            <div className="is-stat-divider" />
            <div className="is-stat">
              <span className="is-stat-value">{totalStats.withoutBoss}</span>
              <span className="is-stat-label">Sin Asignar</span>
            </div>
            <div className="is-stat-divider" />
            <div className="is-stat">
              <span className="is-stat-value">{totalStats.totalTechnicians}</span>
              <span className="is-stat-label">Técnicos Asignados</span>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="is-search-section">
          <div className="is-search-wrapper">
            <Search size={16} className="is-search-icon" />
            <input
              type="text"
              className="is-search-input"
              placeholder="Buscar dependencia, responsable o email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="is-search-clear" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="is-content">
          {loading ? (
            <div className="is-loading">
              <div className="is-spinner" />
              <p>Cargando estructura organizativa...</p>
            </div>
          ) : error ? (
            <div className="is-error">
              <AlertCircle size={32} />
              <p>{error}</p>
              <button className="is-retry-btn" onClick={fetchStructure}>Reintentar</button>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="is-empty">
              <Building2 size={48} />
              <h3>Sin resultados</h3>
              <p>No se encontraron dependencias con el criterio de búsqueda</p>
            </div>
          ) : (
            <div className="is-groups">
              {filteredGroups.map((group) => (
                <div key={group.prefix} className="is-group">
                  <button
                    className="is-group-header"
                    onClick={() => setExpandedGroup(expandedGroup === group.prefix ? null : group.prefix)}
                  >
                    <div className="is-group-header-left">
                      <div className="is-group-icon">{group.icon}</div>
                      <h2 className="is-group-title">{group.label}</h2>
                      <span className="is-group-count">{group.offices.length}</span>
                    </div>
                    <div className="is-group-header-right">
                      {expandedGroup === group.prefix ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </button>

                  {expandedGroup === group.prefix && (
                    <div className="is-group-body">
                      {group.offices.map((office) => {
                        const colors = getGroupColor(office.Name_Office);
                        const roleBadge = getRoleBadge(office.Name_Office);
                        const isExpanded = expandedOffice === office.ID_Office;

                        return (
                          <div key={office.ID_Office} className="is-office-card">
                            <div
                              className="is-office-main"
                              onClick={() => setExpandedOffice(isExpanded ? null : office.ID_Office)}
                            >
                              <div className="is-office-avatar" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                {office.Name_Office.charAt(0)}
                              </div>
                              <div className="is-office-info">
                                <h3 className="is-office-name">{office.Name_Office}</h3>
                                <div className="is-office-meta">
                                  {office.has_boss ? (
                                    <span className="is-office-boss">
                                      <BadgeCheck size={12} />
                                      {office.boss_full_name || office.boss_name}
                                    </span>
                                  ) : (
                                    <span className="is-office-boss is-office-boss-empty">
                                      <AlertCircle size={12} />
                                      Sin responsable asignado
                                    </span>
                                  )}
                                  {office.technician_count > 0 && (
                                    <span className="is-office-techs">
                                      <Users size={12} />
                                      {office.technician_count} técnicos
                                    </span>
                                  )}
                                  {office.coduniadm && (
                                    <span className="is-office-code">
                                      <Hash size={12} />
                                      {office.coduniadm}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="is-office-chevron">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="is-office-detail">
                                <div className="is-detail-grid">
                                  {office.has_boss && (
                                    <>
                                      <div className="is-detail-item">
                                        <div className="is-detail-label">
                                          <Shield size={13} />
                                          {roleBadge.label}
                                        </div>
                                        <div className="is-detail-value">
                                          <div className="is-detail-boss-avatar" style={{ backgroundColor: roleBadge.color }}>
                                            {getInitials(office.boss_full_name || office.boss_name || '')}
                                          </div>
                                          <div>
                                            <strong>{office.boss_full_name || office.boss_name}</strong>
                                            {office.boss_email && (
                                              <span className="is-detail-email">
                                                <Mail size={11} />
                                                {office.boss_email}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  {!office.has_boss && (
                                    <div className="is-detail-item is-detail-empty">
                                      <AlertCircle size={16} />
                                      <span>Esta dependencia no tiene un responsable asignado. Puede asignarlo desde la gestión de usuarios.</span>
                                    </div>
                                  )}
                                  <div className="is-detail-item">
                                    <div className="is-detail-label">
                                      <MapPin size={13} />
                                      Código SIFA
                                    </div>
                                    <div className="is-detail-value">
                                      <code className="is-code">{office.coduniadm || '—'}</code>
                                    </div>
                                  </div>
                                  <div className="is-detail-item">
                                    <div className="is-detail-label">
                                      <Clock size={13} />
                                      Creada
                                    </div>
                                    <div className="is-detail-value">
                                      {new Date(office.created_at).toLocaleDateString('es-ES', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionalStructure;
