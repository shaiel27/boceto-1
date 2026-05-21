import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, LogOut } from 'lucide-react';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PasswordChangeRequired.css';

interface PasswordChangeRequiredProps {
  onComplete: () => void;
}

const PasswordChangeRequired: React.FC<PasswordChangeRequiredProps> = ({ onComplete }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula';
    if (!/[a-z]/.test(password)) return 'Debe contener al menos una minúscula';
    if (!/[0-9]/.test(password)) return 'Debe contener al menos un número';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Ingresa tu contraseña actual');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword === currentPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ApiService.changePassword(currentPassword, newPassword);
      if (response.success) {
        setStep('success');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setError(response.message || 'Error al cambiar contraseña');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (step === 'success') {
    return (
      <div className="pcr-container">
        <div className="pcr-card">
          <div className="pcr-success-icon">
            <CheckCircle size={52} />
          </div>
          <h2 className="pcr-success-title">Contraseña Cambiada</h2>
          <p className="pcr-success-desc">Tu contraseña ha sido actualizada exitosamente</p>
          <p className="pcr-success-redir">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pcr-container">
      <div className="pcr-card">
        <div className="pcr-header-icon">
          <Lock size={32} />
        </div>
        <h2 className="pcr-title">Cambio de Contraseña Requerido</h2>
        <p className="pcr-desc">
          Es tu primer inicio de sesión. Por seguridad, debes cambiar tu contraseña antes de continuar.
        </p>

        <form onSubmit={handleSubmit} className="pcr-form">
          <div className="pcr-field">
            <label>Contraseña Actual</label>
            <div className="pcr-input-wrapper">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                disabled={isSubmitting}
              />
              <button type="button" className="pcr-toggle" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pcr-field">
            <label>Nueva Contraseña</label>
            <div className="pcr-input-wrapper">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mín. 8 caracteres, mayúscula, minúscula, número"
                disabled={isSubmitting}
              />
              <button type="button" className="pcr-toggle" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pcr-field">
            <label>Confirmar Nueva Contraseña</label>
            <div className="pcr-input-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                disabled={isSubmitting}
              />
              <button type="button" className="pcr-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="pcr-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="pcr-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="pcr-spin" /> Cambiando...</>
            ) : (
              <><Lock size={16} /> Cambiar Contraseña</>
            )}
          </button>
        </form>

        <div className="pcr-footer">
          <span className="pcr-user">{user?.full_name || user?.email}</span>
          <button type="button" className="pcr-logout" onClick={handleLogout}>
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>

        <div className="pcr-requirements">
          <p>La contraseña debe cumplir:</p>
          <ul>
            <li className={newPassword.length >= 8 ? 'met' : ''}>Mínimo 8 caracteres</li>
            <li className={/[A-Z]/.test(newPassword) ? 'met' : ''}>Al menos una mayúscula</li>
            <li className={/[a-z]/.test(newPassword) ? 'met' : ''}>Al menos una minúscula</li>
            <li className={/[0-9]/.test(newPassword) ? 'met' : ''}>Al menos un número</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeRequired;