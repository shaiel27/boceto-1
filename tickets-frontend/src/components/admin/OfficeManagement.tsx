import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, RefreshCw, Search, Users,
  ArrowLeft, X, Mail, Shield, Hash, ChevronRight,
  AlertCircle, BadgeCheck, Building, MapPin, Clock
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import { ApiService, API_BASE_URL } from '../../services/api';
import './OfficeManagement.css';

interface Office {
  ID_Office: number;
  Name_Office: string;
  coduniadm: string | null;
  Fk_Boss_ID: number | null;
  created_at: string;
  boss_name: string | null;
  boss_email: string | null;
  boss_user_id: number | null;
  boss_full_name: string | null;
  has_boss: boolean;
  technician_count: number;
}

function getGroup(name: string): string {
  const l = name.toLowerCase();
  if (l.startsWith('direcci')) return 'direccion';
  if (l.startsWith('divisi')) return 'division';
  if (l.startsWith('coordina')) return 'coordinacion';
  return 'other';
}

const GROUP_META: Record<string, { label: string; icon: React.ReactNode }> = {
  direccion: { label: 'Direcciones', icon: <Building size={15} /> },
  division: { label: 'Divisiones', icon: <MapPin size={15} /> },
  coordinacion: { label: 'Coordinaciones', icon: <Users size={15} /> },
  other: { label: 'Otras Dependencias', icon: <Building2 size={15} /> },
};

const GROUP_ORDER = ['direccion', 'division', 'coordinacion', 'other'];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const POOL = [
  'Educación', 'Salud', 'Seguridad', 'Tecnología', 'Cultura',
  'Deporte', 'Ambiente', 'Vialidad', 'Tributaria', 'Registro Civil',
  'Despacho', 'Contratación', 'Talento Humano', 'Servicios Públicos',
  'Mercado', 'Planificación', 'Protección Civil', 'Obras',
  'Justicia', 'Administración', 'Informática', 'Transporte',
  'Catastro', 'Vivienda', 'Hacienda', 'Turismo', 'Comunicación',
];

function getEmoji(name: string): string {
  const l = name.toLowerCase();
  if (l.includes('educacion') || l.includes('docencia') || l.includes('escuela')) return '\u{1F393}';
  if (l.includes('salud') || l.includes('hospital') || l.includes('medica')) return '\u{1F3E5}';
  if (l.includes('seguridad') || l.includes('policia') || l.includes('bombero')) return '\u{1F6A8}';
  if (l.includes('informatica') || l.includes('tecnologia') || l.includes('sistemas')) return '\u{1F4BB}';
  if (l.includes('cultura') || l.includes('banda') || l.includes('arte')) return '\u{1F3AD}';
  if (l.includes('deporte') || l.includes('recreacion')) return '\u26BD';
  if (l.includes('ambiente') || l.includes('vivero')) return '\u{1F33F}';
  if (l.includes('catastro') || l.includes('urbano') || l.includes('vivienda')) return '\u{1F3D7}';
  if (l.includes('transito') || l.includes('vialidad') || l.includes('transporte')) return '\u{1F6E3}';
  if (l.includes('tributaria') || l.includes('tesoreria') || l.includes('renta') || l.includes('hacienda')) return '\u{1F4B0}';
  if (l.includes('registro civil')) return '\u{1F4DC}';
  if (l.includes('despacho') || l.includes('alcalde')) return '\u{1F3DB}';
  if (l.includes('contratacion') || l.includes('compras')) return '\u{1F4CB}';
  if (l.includes('talento humano') || l.includes('personal')) return '\u{1F465}';
  if (l.includes('servicios publicos') || l.includes('aseo')) return '\u{1F6E0}';
  if (l.includes('mercado')) return '\u{1F6CD}';
  if (l.includes('planificacion') || l.includes('presupuesto')) return '\u{1F4CA}';
  if (l.includes('proteccion civil') || l.includes('riesgo')) return '\u26A8';
  if (l.includes('obras') || l.includes('construccion')) return '\u{1F3D7}';
  if (l.includes('justicia') || l.includes('legal') || l.includes('sindicatura')) return '\u2696';
  if (l.includes('administracion') || l.includes('general')) return '\u{1F3E2}';
  if (l.includes('comunicacion') || l.includes('prensa')) return '\u{1F4F0}';
  if (l.includes('turismo')) return '\u{1F30D}';
  return '\u{1F3E2}';
}

const OfficeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<number | null>(null);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getStructure();
      if (res.success && res.data) {
        setOffices(res.data);
      }
    } catch (err) {
      console.error('Error loading offices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/office?action=sync`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setSyncMessage({ type: 'success', text: data.message || 'Oficinas sincronizadas correctamente.' });
        await fetchOffices();
      } else {
        setSyncMessage({ type: 'error', text: data.message || 'Error al sincronizar.' });
      }
    } catch {
      setSyncMessage({ type: 'error', text: 'Error de conexión al sincronizar.' });
    } finally {
      setSyncing(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<string, Office[]> = {};
    for (const office of offices) {
      const g = getGroup(office.Name_Office);
      if (!groups[g]) groups[g] = [];
      groups[g].push(office);
    }
    return GROUP_ORDER.filter(g => groups[g]).map(g => ({
      key: g,
      ...GROUP_META[g],
      offices: groups[g],
    }));
  }, [offices]);

  const filtered = useMemo(() => {
    let result = grouped;
    if (filterGroup) {
      result = result.filter(g => g.key === filterGroup);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result
        .map(g => ({
          ...g,
          offices: g.offices.filter(o =>
            o.Name_Office.toLowerCase().includes(q) ||
            (o.boss_full_name && o.boss_full_name.toLowerCase().includes(q)) ||
            (o.boss_email && o.boss_email.toLowerCase().includes(q)) ||
            (o.coduniadm && o.coduniadm.toLowerCase().includes(q))
          ),
        }))
        .filter(g => g.offices.length > 0);
    }
    return result;
  }, [grouped, filterGroup, searchTerm]);

  const stats = useMemo(() => ({
    total: offices.length,
    withBoss: offices.filter(o => o.has_boss).length,
    withoutBoss: offices.filter(o => !o.has_boss).length,
    totalTechs: offices.reduce((a, o) => a + (o.technician_count || 0), 0),
  }), [offices]);

  const handleViewDetails = (id: number) => {
    setSelectedOffice(selectedOffice === id ? null : id);
  };

  if (loading) {
    return (
      <div className="page-container">
        <ModernSidebar />
        <div className="om-body">
          <div className="om-loading">
            <div className="om-spinner" />
            <p>Cargando estructura municipal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ModernSidebar />
      <div className="om-body">

        {/* Top Bar */}
        <header className="om-topbar">
          <div className="om-topbar-left">
            <div className="om-topbar-icon">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="om-title">Organización Municipal</h1>
              <p className="om-subtitle">{stats.total} dependencias registradas</p>
            </div>
          </div>
          <div className="om-topbar-right">
            <button
              className="om-btn om-btn-primary"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw size={15} className={syncing ? 'om-spin' : ''} />
              <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          </div>
        </header>

        {/* Sync Banner */}
        {syncMessage && (
          <div className={`om-banner om-banner--${syncMessage.type}`}>
            <span className="om-banner-glyph">
              {syncMessage.type === 'success' ? '\u2713' : '\u26A0'}
            </span>
            <span>{syncMessage.text}</span>
            <button className="om-banner-close" onClick={() => setSyncMessage(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Search + Filters */}
        <div className="om-toolbar">
          <div className="om-search">
            <Search size={15} className="om-search-icon" />
            <input
              type="text"
              className="om-search-input"
              placeholder="Buscar dependencia, responsable o código..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="om-search-clear" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="om-filters">
            {GROUP_ORDER.map(g => {
              const meta = GROUP_META[g];
              const active = filterGroup === g;
              return (
                <button
                  key={g}
                  className={`om-chip ${active ? 'om-chip--active' : ''}`}
                  onClick={() => setFilterGroup(active ? null : g)}
                >
                  {meta.icon}
                  <span>{meta.label}</span>
                </button>
              );
            })}
            <button className="om-chip om-chip--stat"><Users size={13} />{stats.totalTechs} técnicos</button>
            <span className="om-chip om-chip--stat om-chip--muted">
              {stats.withoutBoss} sin responsable
            </span>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="om-empty">
            <Building2 size={36} />
            <h3>Sin resultados</h3>
            <p>No se encontraron dependencias con ese criterio de búsqueda</p>
          </div>
        ) : (
          <div className="om-sections">
            {filtered.map(group => (
              <section key={group.key} className="om-section">
                <header className="om-section-hd">
                  <div className="om-section-hd-left">
                    <span className="om-section-icon">{group.icon}</span>
                    <h2 className="om-section-title">{group.label}</h2>
                    <span className="om-section-count">{group.offices.length}</span>
                  </div>
                </header>
                <div className="om-grid">
                  {group.offices.map((office, i) => {
                    const isOpen = selectedOffice === office.ID_Office;
                    return (
                      <article
                        key={office.ID_Office}
                        className={`om-office ${isOpen ? 'om-office--open' : ''}`}
                        style={{ animationDelay: `${i * 0.03}s` }}
                      >
                        <div className="om-office-main" onClick={() => handleViewDetails(office.ID_Office)}>
                          <span className="om-office-emoji">{getEmoji(office.Name_Office)}</span>
                          <div className="om-office-info">
                            <h3 className="om-office-name">{office.Name_Office}</h3>
                            <div className="om-office-tags">
                              {office.coduniadm && (
                                <span className="om-tag om-tag--code">#{office.coduniadm}</span>
                              )}
                              {office.has_boss ? (
                                <span className="om-tag om-tag--boss">
                                  <BadgeCheck size={10} />
                                  {office.boss_full_name || office.boss_name}
                                </span>
                              ) : (
                                <span className="om-tag om-tag--empty">Sin responsable</span>
                              )}
                              {office.technician_count > 0 && (
                                <span className="om-tag om-tag--tech">
                                  <Users size={10} />
                                  {office.technician_count} téc.
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            className={`om-chevron ${isOpen ? 'om-chevron--open' : ''}`}
                          />
                        </div>

                        {isOpen && (
                          <div className="om-detail">
                            <div className="om-detail-grid">
                              {office.has_boss ? (
                                <div className="om-detail-block">
                                  <div className="om-detail-lbl">
                                    <Shield size={11} />
                                    Responsable
                                  </div>
                                  <div className="om-detail-val">
                                    <span className="om-detail-avatar">
                                      {getInitials(office.boss_full_name || office.boss_name || '')}
                                    </span>
                                    <div>
                                      <strong>{office.boss_full_name || office.boss_name}</strong>
                                      {office.boss_email && (
                                        <span className="om-detail-email">
                                          <Mail size={10} />
                                          {office.boss_email}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="om-detail-block om-detail-block--empty">
                                  <AlertCircle size={13} />
                                  <span>Sin responsable asignado</span>
                                </div>
                              )}
                              <div className="om-detail-block">
                                <div className="om-detail-lbl">
                                  <Hash size={11} />
                                  Código SIFA
                                </div>
                                <div className="om-detail-val">
                                  <code className="om-code">{office.coduniadm || '—'}</code>
                                </div>
                              </div>
                              <div className="om-detail-block">
                                <div className="om-detail-lbl">
                                  <Users size={11} />
                                  Técnicos
                                </div>
                                <div className="om-detail-val">
                                  {office.technician_count || 0} asignados
                                </div>
                              </div>
                              <div className="om-detail-block">
                                <div className="om-detail-lbl">
                                  <Clock size={11} />
                                  Registro
                                </div>
                                <div className="om-detail-val">
                                  {new Date(office.created_at).toLocaleDateString('es-ES', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeManagement;
