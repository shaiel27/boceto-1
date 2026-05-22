import { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Shield,
  Clock,
  Calendar,
  Briefcase,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './TechnicianProfile.css';
import ApiService from '../../services/api';

interface TechnicianProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'Activo' | 'Inactivo';
  hireDate: string;
  lunchBlock: string;
  workStartTime: string;
  workEndTime: string;
  services: string[];
}

interface TechnicianProfileProps {
  profile: TechnicianProfileData;
  onUpdate?: (updatedProfile: TechnicianProfileData) => void;
}

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Una minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un número', test: (p: string) => /[0-9]/.test(p) },
] as const;

const TechnicianProfile: React.FC<TechnicianProfileProps> = ({ profile, onUpdate }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const passwordChecks = useMemo(() =>
    PASSWORD_RULES.map(rule => ({
      ...rule,
      passed: rule.test(passwordForm.newPassword)
    })),
    [passwordForm.newPassword]
  );

  const allPassed = passwordChecks.every(c => c.passed);

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos un número' };
    }
    return { valid: true };
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      setPasswordError('Debe ingresar la contraseña actual');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('Debe ingresar una nueva contraseña');
      return;
    }
    const validation = validatePassword(passwordForm.newPassword);
    if (!validation.valid) {
      setPasswordError(validation.message || 'Contraseña inválida');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      const response = await ApiService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (response.success) {
        setPasswordSuccess(response.message || 'Contraseña cambiada exitosamente');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(response.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      setPasswordError('Error de conexión con el servidor');
    }
  };

  const calculateTenure = (hireDate: string): string => {
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < hire.getDate())) {
      return `${years - 1} año${years - 1 !== 1 ? 's' : ''}`;
    }
    return `${years} año${years !== 1 ? 's' : ''}`;
  };

  return (
    <div className="technician-profile">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-circle">
            <User size={28} />
          </div>
          <div className="profile-identity">
            <h2 className="profile-title">{profile.firstName} {profile.lastName}</h2>
            <p className="profile-subtitle">Técnico de Soporte</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <div className="card-icon personal">
              <Shield size={18} />
            </div>
            <h3 className="card-title">Información Personal</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label className="info-label">
                <User size={13} />
                Nombre Completo
              </label>
              <p className="info-value">{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Mail size={13} />
                Correo Electrónico
              </label>
              <p className="info-value">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <div className="card-icon work">
              <Briefcase size={18} />
            </div>
            <h3 className="card-title">Información Laboral</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label className="info-label">
                <Settings size={13} />
                Estado
              </label>
              <p className="info-value">
                <span className={`status-badge ${profile.status === 'Activo' ? 'active' : 'inactive'}`}>
                  {profile.status}
                </span>
              </p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Calendar size={13} />
                Fecha de Ingreso
              </label>
              <p className="info-value">
                {new Date(profile.hireDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Calendar size={13} />
                Antigüedad
              </label>
              <p className="info-value">{calculateTenure(profile.hireDate)}</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Clock size={13} />
                Horario de Trabajo
              </label>
              <p className="info-value">{profile.workStartTime} - {profile.workEndTime}</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Clock size={13} />
                Bloque de Almuerzo
              </label>
              <p className="info-value">{profile.lunchBlock}</p>
            </div>
            <div className="info-item full-width">
              <label className="info-label">
                <Settings size={13} />
                Servicios Asignados
              </label>
              <div className="services-list">
                {profile.services.map((service, index) => (
                  <span key={index} className="service-tag">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card security-card">
          <div className="card-header">
            <div className="card-icon security">
              <Lock size={18} />
            </div>
            <h3 className="card-title">Seguridad</h3>
          </div>
          <button
            className="change-password-btn"
            onClick={() => setShowPasswordModal(true)}
          >
            <Lock size={15} />
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cambiar Contraseña</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label>Contraseña Actual</label>
                <div className="password-input">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Ingrese su contraseña actual"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div className="password-input">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="password-requirements" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {passwordChecks.map((check, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          color: check.passed ? '#16a34a' : '#9ca3af',
                          transition: 'color 0.15s'
                        }}
                      >
                        {check.passed
                          ? <CheckCircle size={12} />
                          : <AlertCircle size={12} />
                        }
                        {check.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirme su nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                    <AlertCircle size={12} />
                    Las contraseñas no coinciden
                  </span>
                )}
              </div>

              {passwordError && (
                <div className="error-message">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="success-message" style={{ animation: 'pfFadeIn 0.2s ease' }}>
                  <CheckCircle size={16} />
                  {passwordSuccess}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!allPassed && !!passwordForm.newPassword}
                  style={!allPassed && passwordForm.newPassword ? { opacity: 0.5, cursor: 'default' } : {}}
                >
                  <Save size={15} />
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianProfile;
