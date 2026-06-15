import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Shield,
  Briefcase,
  GraduationCap,
  MapPin,
  Search,
  X,
  UserPlus,
  Crown,
  Loader2
} from 'lucide-react';
import { sileo } from 'sileo';
import ModernSidebar from '../layout/ModernSidebar';
import './UserRegistration.css';
import ApiService from '../../services/api';

interface FormData {
  name_boss: string;
  username: string;
  pronoun: string;
  email: string;
  password: string;
  confirmPassword: string;
  fk_role: string;
  fk_office: string;
}

interface FormErrors {
  name_boss?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  fk_role?: string;
  fk_office?: string;
}

interface Role {
  ID_Role: number;
  Role: string;
  Description: string;
}

interface Office {
  ID_Office: number;
  Name_Office: string;
  Fk_Boss_ID: number | null;
}

const ROLES: Role[] = [
  { ID_Role: 1, Role: 'Administrador', Description: 'Acceso completo al sistema' },
  { ID_Role: 3, Role: 'Jefe', Description: 'Creación y seguimiento de tickets' },
];

const PRONOUNS = ['Sr.', 'Sra.', 'Lic.', 'Ing.', 'Dr.', 'Dra.'];

const UserRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name_boss: '',
    username: '',
    pronoun: 'Sr.',
    email: '',
    password: '',
    confirmPassword: '',
    fk_role: '',
    fk_office: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const [offices, setOffices] = useState<Office[]>([]);
  const [officeSearch, setOfficeSearch] = useState('');
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);
  const [officesLoading, setOfficesLoading] = useState(false);

  const isAdmin = formData.fk_role === '1';
  const needsOffice = !isAdmin;
  const passwordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  useEffect(() => {
    setOfficesLoading(true);
    ApiService.getOffices()
      .then(r => {
        if (r.success && r.data) {
          setOffices(r.data);
          setFilteredOffices(r.data);
        }
      })
      .catch(() => sileo.error({ title: 'Error', description: 'Error al cargar oficinas' }))
      .finally(() => setOfficesLoading(false));
  }, []);

  useEffect(() => {
    if (officeSearch.trim()) {
      const q = officeSearch.toLowerCase();
      setFilteredOffices(offices.filter(o =>
        o.Name_Office.toLowerCase().includes(q)
      ));
    } else {
      setFilteredOffices(offices);
    }
  }, [officeSearch, offices]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'fk_role') {
        updated.fk_office = '';
      }
      return updated;
    });
    if (name === 'fk_role') {
      setOfficeSearch('');
      setErrors(prev => ({ ...prev, fk_office: '', fk_role: '' }));
      setTouched(prev => {
        const next = new Set(prev);
        next.delete('fk_office');
        return next;
      });
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched(prev => new Set(prev).add(e.target.name));
  }, []);

  const handleOfficeSelect = useCallback((office: Office) => {
    setFormData(prev => ({ ...prev, fk_office: office.ID_Office.toString() }));
    setOfficeSearch(office.Name_Office);
    setShowOfficeDropdown(false);
    setTouched(prev => new Set(prev).add('fk_office'));
  }, []);

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.name_boss.trim()) errs.name_boss = 'Requerido';
    if (!formData.username.trim()) errs.username = 'Requerido';
    if (!formData.email.trim()) errs.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Email inválido';
    if (!formData.password) errs.password = 'Requerido';
    else if (formData.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) errs.confirmPassword = 'No coinciden';
    if (!formData.fk_role) errs.fk_role = 'Selecciona un rol';
    if (needsOffice && !formData.fk_office) errs.fk_office = 'Requerido para este rol';
    return errs;
  }, [formData, needsOffice]);

  const isValid = Object.keys(validate()).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const response = await ApiService.createUserWithOffice({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: `${formData.pronoun} ${formData.name_boss}`,
        role: parseInt(formData.fk_role),
        name_boss: formData.name_boss,
        pronoun: formData.pronoun,
        office_id: needsOffice ? (formData.fk_office ? parseInt(formData.fk_office) : undefined) : undefined,
      });

      if (response.success) {
        setShowSuccess(true);
        sileo.success({ title: '¡Éxito!', description: 'Usuario creado exitosamente' });
        setTimeout(() => {
          setShowSuccess(false);
          setFormData({
            name_boss: '', username: '', pronoun: 'Sr.',
            email: '', password: '', confirmPassword: '',
            fk_role: '', fk_office: '',
          });
          setOfficeSearch('');
          setErrors({});
          setTouched(new Set());
        }, 2500);
      } else if (response.errors) {
        const serverErrors: FormErrors = {};
        const touchedFields = new Set(touched);
        const knownFields = ['name_boss','username','email','password','confirmPassword','fk_role','fk_office'];
        for (const [field, messages] of Object.entries(response.errors)) {
          if (messages.length > 0 && knownFields.includes(field)) {
            serverErrors[field as keyof FormErrors] = messages[0];
            touchedFields.add(field);
          }
        }
        setErrors(serverErrors);
        setTouched(touchedFields);
        const firstError = Object.values(response.errors).flat()[0];
        sileo.error({ title: 'Error', description: firstError || 'Error en los datos ingresados' });
      } else {
        sileo.error({ title: 'Error', description: response.message || 'Error desconocido' });
      }
    } catch {
      sileo.error({ title: 'Error', description: 'Error de conexión con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.ID_Role.toString() === formData.fk_role);
  const selectedOffice = offices.find(o => o.ID_Office.toString() === formData.fk_office);

  return (
    <div className="ur-container">
      <ModernSidebar />
      <div className="ur-content">
        <button className="ur-back" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft size={18} />
          Volver al panel
        </button>

        <div className="ur-hero">
          <div className="ur-hero-icon">
            <UserPlus size={28} />
          </div>
          <div>
            <h1 className="ur-hero-title">Registro de Usuario</h1>
            <p className="ur-hero-sub">Alcaldía Municipal de San Cristóbal</p>
          </div>
        </div>

        {showSuccess && (
          <div className="ur-success">
            <CheckCircle2 size={20} />
            Usuario creado exitosamente
            <button className="ur-success-close" onClick={() => setShowSuccess(false)}>
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ur-form" noValidate>
          <div className="ur-section">
            <div className="ur-section-head">
              <GraduationCap size={18} />
              <span>Información personal</span>
            </div>
            <div className="ur-grid">
              <div className="ur-field">
                <label htmlFor="name_boss">Nombre completo</label>
                <input
                  id="name_boss" name="name_boss" type="text"
                  value={formData.name_boss} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Juan Pérez" autoComplete="name"
                />
                {touched.has('name_boss') && errors.name_boss && (
                  <span className="ur-err"><AlertCircle size={12} />{errors.name_boss}</span>
                )}
              </div>
              <div className="ur-field">
                <label htmlFor="username">Nombre de usuario</label>
                <input
                  id="username" name="username" type="text"
                  value={formData.username} onChange={handleChange} onBlur={handleBlur}
                  placeholder="juan.perez" autoComplete="username"
                />
                {touched.has('username') && errors.username && (
                  <span className="ur-err"><AlertCircle size={12} />{errors.username}</span>
                )}
              </div>
              <div className="ur-field">
                <label htmlFor="pronoun">Tratamiento</label>
                <select id="pronoun" name="pronoun" value={formData.pronoun} onChange={handleChange}>
                  {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="ur-section">
            <div className="ur-section-head">
              <Mail size={18} />
              <span>Correo electrónico</span>
            </div>
            <div className="ur-field ur-field--wide">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email" name="email" type="email"
                value={formData.email} onChange={handleChange} onBlur={handleBlur}
                placeholder="usuario@alcaldia.gob.ve" autoComplete="email"
              />
              {touched.has('email') && errors.email && (
                <span className="ur-err"><AlertCircle size={12} />{errors.email}</span>
              )}
            </div>
          </div>

          <div className="ur-section">
            <div className="ur-section-head">
              <Lock size={18} />
              <span>Seguridad</span>
            </div>
            <div className="ur-grid">
              <div className="ur-field">
                <label htmlFor="password">Contraseña</label>
                <div className="ur-pw">
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                  />
                  <button type="button" className="ur-pw-toggle" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password && (
                  <div className={`ur-strength ${formData.password.length >= 6 ? 'ok' : 'bad'}`}>
                    <div className="ur-strength-bar"><div style={{ width: formData.password.length >= 6 ? '100%' : '33%' }} /></div>
                    <span>{formData.password.length >= 6 ? 'Contraseña segura' : 'Mínimo 6 caracteres'}</span>
                  </div>
                )}
                {touched.has('password') && errors.password && (
                  <span className="ur-err"><AlertCircle size={12} />{errors.password}</span>
                )}
              </div>
              <div className="ur-field">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="ur-pw">
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Repite la contraseña" autoComplete="new-password"
                  />
                  <button type="button" className="ur-pw-toggle" onClick={() => setShowConfirmPassword(p => !p)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className={`ur-match ${passwordMatch ? 'ok' : 'bad'}`}>
                    {passwordMatch ? <><CheckCircle2 size={12} /> Coinciden</> : <><AlertCircle size={12} /> No coinciden</>}
                  </div>
                )}
                {touched.has('confirmPassword') && errors.confirmPassword && (
                  <span className="ur-err"><AlertCircle size={12} />{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          <div className="ur-section">
            <div className="ur-section-head">
              <Briefcase size={18} />
              <span>Rol y oficina</span>
            </div>
            <div className="ur-grid">
              <div className="ur-field">
                <label htmlFor="fk_role">Rol del usuario</label>
                <select id="fk_role" name="fk_role" value={formData.fk_role} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">Seleccionar rol</option>
                  {ROLES.map(r => (
                    <option key={r.ID_Role} value={r.ID_Role}>{r.Role} — {r.Description}</option>
                  ))}
                </select>
                {touched.has('fk_role') && errors.fk_role && (
                  <span className="ur-err"><AlertCircle size={12} />{errors.fk_role}</span>
                )}
              </div>

              {formData.fk_role && (
                <div className={`ur-field${!needsOffice ? ' ur-field--dim' : ''}`}>
                  <label htmlFor="fk_office_search">
                    <MapPin size={14} />
                    Oficina
                  </label>
                  {!needsOffice ? (
                    <div className="ur-office-dim">
                      <Shield size={16} />
                      <span>Los administradores no requieren oficina</span>
                    </div>
                  ) : (
                    <div className="ur-office-search">
                      <div className="ur-office-input">
                        <Search size={14} className="ur-office-icon" />
                        <input
                          id="fk_office_search"
                          type="text"
                          value={officeSearch}
                          onChange={e => { setOfficeSearch(e.target.value); setShowOfficeDropdown(true); }}
                          onFocus={() => setShowOfficeDropdown(true)}
                          placeholder="Buscar oficina..."
                          autoComplete="off"
                        />
                        {selectedOffice && (
                          <button type="button" className="ur-office-clear" onClick={() => { setFormData(p => ({ ...p, fk_office: '' })); setOfficeSearch(''); setShowOfficeDropdown(false); }} tabIndex={-1}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {showOfficeDropdown && (
                        <div className="ur-office-dropdown">
                          {officesLoading ? (
                            <div className="ur-office-empty">Cargando...</div>
                          ) : filteredOffices.length > 0 ? (
                            filteredOffices.map(o => (
                              <div
                                key={o.ID_Office}
                                className="ur-office-opt"
                                onClick={() => handleOfficeSelect(o)}
                              >
                                <span className="ur-office-name">{o.Name_Office}</span>
                              </div>
                            ))
                          ) : (
                            <div className="ur-office-empty">Sin resultados</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {touched.has('fk_office') && errors.fk_office && (
                    <span className="ur-err"><AlertCircle size={12} />{errors.fk_office}</span>
                  )}
                </div>
              )}
            </div>

            {selectedRole && (
              <div className={`ur-role-badge ${isAdmin ? 'admin' : 'boss'}`}>
                {isAdmin ? <Crown size={14} /> : <User size={14} />}
                {selectedRole.Role}
              </div>
            )}
          </div>

          <div className="ur-actions">
            <button type="submit" className="ur-submit" disabled={loading || !isValid}>
              {loading ? (
                <><Loader2 size={18} className="ur-spin" /> Creando...</>
              ) : (
                <><UserPlus size={18} /> Crear usuario</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
