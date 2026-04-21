import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Shield,
  Edit2,
  Clock,
  Calendar,
  Briefcase,
  Settings,
  Award
} from 'lucide-react';
import './TechnicianProfile.css';

interface TechnicianProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'Activo' | 'Inactivo';
  specialization: string;
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

const TechnicianProfile: React.FC<TechnicianProfileProps> = ({ profile, onUpdate }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [editForm, setEditForm] = useState({
    phone: profile.phone,
    specialization: profile.specialization
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      setPasswordError('Debe ingresar la contraseña actual');
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError('Debe ingresar una nueva contraseña');
      return;
    }

    if (!validatePassword(passwordForm.newPassword)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    console.log('Cambiando contraseña para técnico:', profile.id);
    setPasswordSuccess('Contraseña cambiada exitosamente');
    
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess('');
    }, 2000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile = {
      ...profile,
      phone: editForm.phone,
      specialization: editForm.specialization
    };

    if (onUpdate) {
      onUpdate(updatedProfile);
    }

    setShowEditModal(false);
  };

  const calculateYearsOfService = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < hire.getDate())) {
      return years - 1;
    }
    return years;
  };

  return (
    <div className="technician-profile">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-circle">
            <User size={32} />
          </div>
          <div className="profile-identity">
            <h2 className="profile-title">{profile.firstName} {profile.lastName}</h2>
            <p className="profile-subtitle">{profile.specialization}</p>
          </div>
        </div>
        <button 
          className="edit-profile-btn"
          onClick={() => setShowEditModal(true)}
        >
          <Edit2 size={16} />
          Editar Datos
        </button>
      </div>

      <div className="profile-content">
        {/* Información Personal */}
        <div className="profile-card">
          <div className="card-header">
            <div className="card-icon personal">
              <Shield size={20} />
            </div>
            <h3 className="card-title">Información Personal</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label className="info-label">
                <User size={14} />
                Nombre Completo
              </label>
              <p className="info-value">{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Mail size={14} />
                Correo Electrónico
              </label>
              <p className="info-value">{profile.email}</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Phone size={14} />
                Teléfono
              </label>
              <p className="info-value">{profile.phone}</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Award size={14} />
                Especialización
              </label>
              <p className="info-value">{profile.specialization}</p>
            </div>
          </div>
        </div>

        {/* Información Laboral */}
        <div className="profile-card">
          <div className="card-header">
            <div className="card-icon work">
              <Briefcase size={20} />
            </div>
            <h3 className="card-title">Información Laboral</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label className="info-label">
                <Settings size={14} />
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
                <Calendar size={14} />
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
                <Calendar size={14} />
                Antigüedad
              </label>
              <p className="info-value">{calculateYearsOfService(profile.hireDate)} años</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Clock size={14} />
                Horario de Trabajo
              </label>
              <p className="info-value">{profile.workStartTime} - {profile.workEndTime}</p>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Clock size={14} />
                Bloque de Almuerzo
              </label>
              <p className="info-value">{profile.lunchBlock}</p>
            </div>
            <div className="info-item full-width">
              <label className="info-label">
                <Settings size={14} />
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

        {/* Seguridad */}
        <div className="profile-card security-card">
          <div className="card-header">
            <div className="card-icon security">
              <Lock size={20} />
            </div>
            <h3 className="card-title">Seguridad</h3>
          </div>
          <button 
            className="change-password-btn"
            onClick={() => setShowPasswordModal(true)}
          >
            <Lock size={16} />
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Modal de Cambio de Contraseña */}
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
                    placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="error-message">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="success-message">
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
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición de Datos */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Datos de Contacto</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  placeholder="+58 412 123 4567"
                  required
                />
              </div>

              <div className="form-group">
                <label>Especialización</label>
                <input
                  type="text"
                  name="specialization"
                  value={editForm.specialization}
                  onChange={handleEditChange}
                  placeholder="Ej: Redes y Conectividad"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  Guardar Cambios
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
