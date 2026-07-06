import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, RefreshCw, Search, Users,
  ArrowLeft, X, Mail, Shield, Hash,
  AlertCircle, BadgeCheck, Building, Clock, Plus
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import { ApiService } from '../../services/api';
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

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

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
  if (l.includes('proteccion civil') || l.includes('riesgo')) return '\u26A8}';
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
  const [selectedOffice, setSelectedOffice] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name_office: '',
    name_boss: '',
    pronoun: 'Sr.',
    email: '',
    password: '',
    username: '',
    full_name: '',
  });

  const pronounOptions = ['Sr.', 'Sra.', 'Lic.', 'Licda.', 'Ing.', 'Dr.', 'Dra.', 'Abg.', 'Abog.', 'Prof.', 'MSc', 'LCDO.', 'LCDA.', 'Arq.'];

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name_office') {
      const normalized = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-záéíóúñ_]/g, '');
      setFormData(prev => ({ ...prev, username: normalized }));
    }
  };

  const resetForm = () => {
    setFormData({
      name_office: '',
      name_boss: '',
      pronoun: 'Sr.',
      email: '',
      password: '',
      username: '',
      full_name: '',
    });
    setFormError(null);
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name_office.trim() || !formData.name_boss.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Complete todos los campos obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ApiService.createOfficeWithBoss({
        name_office: formData.name_office.trim(),
        name_boss: formData.name_boss.trim(),
        pronoun: formData.pronoun,
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim() || formData.name_office.toLowerCase().replace(/\s+/g, '_').replace(/[^a-záéíóúñ_]/g, ''),
        full_name: formData.full_name.trim() || formData.name_boss.trim(),
      });

      if (res.success) {
        setShowModal(false);
        resetForm();
        await fetchOffices();
      } else {
        setFormError(res.message || 'Error al crear oficina');
      }
    } catch {
      setFormError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

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
      const response = await fetch('/api/office?action=sync', {
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

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return offices;
    const q = searchTerm.toLowerCase();
    return offices.filter(o =>
      o.Name_Office.toLowerCase().includes(q) ||
      (o.boss_full_name && o.boss_full_name.toLowerCase().includes(q)) ||
      (o.boss_email && o.boss_email.toLowerCase().includes(q)) ||
      (o.coduniadm && o.coduniadm.toLowerCase().includes(q))
    );
  }, [offices, searchTerm]);

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
              className="om-btn om-btn-secondary"
              onClick={() => { resetForm(); setShowModal(true); }}
            >
              <Plus size={15} />
              <span>Nueva Oficina</span>
            </button>
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

        {/* Search + Stats */}
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
            <span className="om-chip om-chip--stat"><Building2 size={13} />{stats.total} dependencias</span>
            <span className="om-chip om-chip--stat"><Users size={13} />{stats.totalTechs} técnicos</span>
            <span className="om-chip om-chip--stat om-chip--muted">
              {stats.withoutBoss} sin responsable
            </span>
          </div>
        </div>

        {/* Flat Grid */}
        {filtered.length === 0 ? (
          <div className="om-empty">
            <Building2 size={36} />
            <h3>Sin resultados</h3>
            <p>No se encontraron dependencias con ese criterio de búsqueda</p>
          </div>
        ) : (
          <div className="om-grid">
            {filtered.map((office, i) => {
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
        )}

        {/* Modal */}
        {showModal && (
          <div className="om-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="om-modal" onClick={e => e.stopPropagation()}>
              <div className="om-modal-header">
                <h2>Crear Oficina</h2>
                <button className="om-modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateOffice}>
                <div className="om-modal-body">
                  {formError && (
                    <div className="om-modal-error">
                      <AlertCircle size={14} />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="om-fieldset">
                    <legend>Datos de la Oficina</legend>
                    <div className="om-form-row">
                      <label className="om-form-label">
                        Nombre de la Oficina <span className="om-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="om-form-input"
                        placeholder="Ej: DIRECCIÓN DE PLANIFICACIÓN"
                        value={formData.name_office}
                        onChange={e => handleFormChange('name_office', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="om-fieldset">
                    <legend>Datos del Jefe / Responsable</legend>
                    <div className="om-form-row">
                      <label className="om-form-label">
                        Nombre Completo <span className="om-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="om-form-input"
                        placeholder="Ej: Juan Pérez"
                        value={formData.name_boss}
                        onChange={e => handleFormChange('name_boss', e.target.value)}
                      />
                    </div>
                    <div className="om-form-row">
                      <label className="om-form-label">Nombre de usuario</label>
                      <input
                        type="text"
                        className="om-form-input"
                        placeholder="Se genera automáticamente"
                        value={formData.username}
                        onChange={e => handleFormChange('username', e.target.value)}
                      />
                    </div>
                    <div className="om-form-row">
                      <label className="om-form-label">
                        Correo Electrónico <span className="om-required">*</span>
                      </label>
                      <div className="om-email-group">
                        <input
                          type="text"
                          className="om-form-input om-email-prefix"
                          placeholder="ej: jefe.oficina"
                          value={formData.email.replace(/@.*$/, '')}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value.replace(/@.*$/, '') + '@tickets.gob' }))}
                        />
                        <span className="om-email-domain">@tickets.gob</span>
                      </div>
                    </div>
                    <div className="om-form-row">
                      <label className="om-form-label">
                        Contraseña <span className="om-required">*</span>
                      </label>
                      <input
                        type="password"
                        className="om-form-input"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => handleFormChange('password', e.target.value)}
                      />
                    </div>
                    <div className="om-form-row">
                      <label className="om-form-label">Tratamiento</label>
                      <select
                        className="om-form-input"
                        value={formData.pronoun}
                        onChange={e => handleFormChange('pronoun', e.target.value)}
                      >
                        {pronounOptions.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="om-modal-footer">
                  <button
                    type="button"
                    className="om-btn om-btn-ghost"
                    onClick={() => { setShowModal(false); resetForm(); }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="om-btn om-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Creando...' : 'Crear Oficina'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeManagement;
