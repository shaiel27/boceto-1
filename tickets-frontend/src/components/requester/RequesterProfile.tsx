import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Edit2,
  AtSign,
  MapPin,
  Clock,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import ApiService from '../../services/api';
import { formatEmailPrefix, buildFullEmail, EMAIL_DOMAIN } from '../../utils/emailHelper';
import './RequesterProfile.css';

interface RequesterProfileData {
  id: string;
  name: string;
  email: string;
  username?: string;
  position: string;
  hireDate: string;
  office_name: string;
  supervisor: string;
}

interface RequesterProfileProps {
  profile: RequesterProfileData;
  onUpdate?: (updatedProfile: RequesterProfileData) => void;
}

const RequesterProfile: React.FC<RequesterProfileProps> = ({ profile, onUpdate }) => {
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
    name: profile.name,
    email: profile.email
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: name === 'email' ? formatEmailPrefix(value) : value }));
  };

  const validatePassword = (password: string): boolean =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) { setPasswordError('Debe ingresar la contraseña actual'); return; }
    if (!passwordForm.newPassword) { setPasswordError('Debe ingresar una nueva contraseña'); return; }
    if (!validatePassword(passwordForm.newPassword)) { setPasswordError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError('Las contraseñas nuevas no coinciden'); return; }

    try {
      const response = await ApiService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (response.success) {
        setPasswordSuccess('Contraseña cambiada exitosamente');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(response.message || 'Error al cambiar contraseña');
      }
    } catch {
      setPasswordError('Error de conexión con el servidor');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await ApiService.updateProfile({ Full_Name: editForm.name, Email: buildFullEmail(editForm.email) });
      if (response.success) {
        const updatedProfile = { ...profile, name: editForm.name, email: editForm.email };
        onUpdate?.(updatedProfile);
        setShowEditModal(false);
      } else {
        alert(response.message || 'Error al actualizar perfil');
      }
    } catch {
      alert('Error de conexión con el servidor');
    }
  };

  const yearsOfService = (() => {
    const hire = new Date(profile.hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    return months < 0 || (months === 0 && now.getDate() < hire.getDate()) ? years - 1 : years;
  })();

  return (
    <div className="rp">
      {/* Header */}
      <div className="rp-head">
        <div className="rp-head-l">
          <div className="rp-avatar">
            <User size={26} />
          </div>
          <div className="rp-head-info">
            <h2 className="rp-name">{profile.name}</h2>
            <p className="rp-role">{profile.position}</p>
          </div>
        </div>
        <button className="rp-edit-btn" onClick={() => setShowEditModal(true)}>
          <Edit2 size={15} />
          Editar
        </button>
      </div>

      {/* Cards */}
      <div className="rp-body">
        {/* Personal Info */}
        <div className="rp-card">
          <div className="rp-card-h">
            <ShieldCheck size={16} />
            <span>Información Personal</span>
          </div>
          <div className="rp-grid">
            <div className="rp-item">
              <span className="rp-lbl"><User size={13} />Nombre Completo</span>
              <span className="rp-val">{profile.name}</span>
            </div>
            <div className="rp-item">
              <span className="rp-lbl"><Mail size={13} />Correo Electrónico</span>
              <span className="rp-val">{profile.email}</span>
            </div>
            <div className="rp-item">
              <span className="rp-lbl"><AtSign size={13} />Usuario</span>
              <span className="rp-val rp-val--user">{profile.username ? `@${profile.username}` : '-'}</span>
            </div>
            <div className="rp-item">
              <span className="rp-lbl"><Briefcase size={13} />Cargo</span>
              <span className="rp-val">{profile.position}</span>
            </div>
          </div>
        </div>

        {/* Work Info */}
        <div className="rp-card">
          <div className="rp-card-h">
            <Building size={16} />
            <span>Información Laboral</span>
          </div>
          <div className="rp-grid">
            {profile.office_name && (
              <div className="rp-item">
                <span className="rp-lbl"><MapPin size={13} />Oficina</span>
                <span className="rp-val">{profile.office_name}</span>
              </div>
            )}
            <div className="rp-item">
              <span className="rp-lbl"><User size={13} />Supervisor</span>
              <span className="rp-val">{profile.supervisor}</span>
            </div>
            <div className="rp-item">
              <span className="rp-lbl"><Calendar size={13} />Fecha de Ingreso</span>
              <span className="rp-val">
                {new Date(profile.hireDate).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
            <div className="rp-item">
              <span className="rp-lbl"><Clock size={13} />Antigüedad</span>
              <span className="rp-val">{yearsOfService} años</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rp-card rp-card--sec">
          <div className="rp-card-h">
            <KeyRound size={16} />
            <span>Seguridad</span>
          </div>
          <button className="rp-pw-btn" onClick={() => setShowPasswordModal(true)}>
            <Lock size={15} />
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="rp-overlay" onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-h">
              <h3>Cambiar Contraseña</h3>
              <button className="rp-modal-close" onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="rp-modal-b">
              <div className="rp-fg">
                <label>Contraseña Actual</label>
                <div className="rp-pw">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Ingrese su contraseña actual"
                    required
                  />
                  <button type="button" className="rp-pw-tog" onClick={() => setShowCurrentPassword(p => !p)} tabIndex={-1}>
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="rp-fg">
                <label>Nueva Contraseña</label>
                <div className="rp-pw">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mín. 8 car., mayúscula, minúscula y número"
                    required
                  />
                  <button type="button" className="rp-pw-tog" onClick={() => setShowNewPassword(p => !p)} tabIndex={-1}>
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="rp-fg">
                <label>Confirmar Nueva Contraseña</label>
                <div className="rp-pw">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repita la nueva contraseña"
                    required
                  />
                  <button type="button" className="rp-pw-tog" onClick={() => setShowConfirmPassword(p => !p)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {passwordError && <div className="rp-msg rp-msg--err">{passwordError}</div>}
              {passwordSuccess && <div className="rp-msg rp-msg--ok">{passwordSuccess}</div>}

              <div className="rp-acts">
                <button type="button" className="rp-btn rp-btn--sec" onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }}>
                  Cancelar
                </button>
                <button type="submit" className="rp-btn rp-btn--pri">
                  <Save size={15} />
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="rp-overlay" onClick={() => setShowEditModal(false)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-h">
              <h3>Editar Datos de Contacto</h3>
              <button className="rp-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="rp-modal-b">
              <div className="rp-fg">
                <label>Nombre Completo</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} placeholder="Nombre completo" required />
              </div>
              <div className="rp-fg">
                <label>Correo Electrónico</label>
                <div style={{position:'relative',display:'flex',alignItems:'center'}}>
                  <input type="text" name="email" value={editForm.email} onChange={handleEditChange} placeholder="usuario" required style={{paddingRight:'7rem'}} />
                  <span style={{position:'absolute',right:'.85rem',color:'#a0aec0',fontSize:'13px',pointerEvents:'none'}}>{EMAIL_DOMAIN}</span>
                </div>
              </div>
              <div className="rp-acts">
                <button type="button" className="rp-btn rp-btn--sec" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="rp-btn rp-btn--pri">
                  <Save size={15} />
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

export default RequesterProfile;
