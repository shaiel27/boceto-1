import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Building, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, isAdmin, isTechnician, isBoss, isAuditor } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) navigate('/');
      else if (isTechnician()) navigate('/technician');
      else if (isBoss()) navigate('/requester');
      else if (isAuditor()) navigate('/admin/audit');
      else navigate('/');
    }
  }, [isAuthenticated, isAdmin, isTechnician, isBoss, isAuditor, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(formData.email, formData.password); }
    catch { /* handled by auth context */ }
  };

  return (
    <div className="lgn-root">
      <div className="lgn-left" style={{backgroundImage: 'url(/Gemini_Generated_Image_3gq6dw3gq6dw3gq6.png)'}}>
        <div className="lgn-left-mesh" />
        <div className="lgn-left-content">
          <div className="lgn-crest">
            <div className="lgn-crest-ring">
              <Building size={38} strokeWidth={1.5} />
            </div>
          </div>
          <div className="lgn-brand-text">
            <p className="lgn-brand-eyebrow">Alcaldía del Municipio</p>
            <h1 className="lgn-brand-name">San Cristóbal</h1>
            <div className="lgn-brand-rule" />
            <p className="lgn-brand-desc">Sistema de Gestión de Tickets</p>
          </div>
          <div className="lgn-left-pattern" />
        </div>
      </div>

      <div className="lgn-right">
        <div className="lgn-card">
          <div className="lgn-card-inner">
            <p className="lgn-card-eyebrow">Acceso institucional</p>
            <h2 className="lgn-card-title">Iniciar sesión</h2>
            <p className="lgn-card-sub">Ingrese sus credenciales para continuar</p>

            {error && (
              <div className="lgn-err">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="lgn-form">
              <div className={`lgn-field ${focused === 'email' ? 'lgn-field--focus' : ''}`}>
                <label className="lgn-label" htmlFor="email">Correo electrónico</label>
                <div className="lgn-input-w">
                  <Mail size={17} className="lgn-input-icon" />
                  <input
                    id="email" name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="correo@alcaldia.gob.ve"
                    autoComplete="email" className="lgn-input"
                  />
                </div>
              </div>

              <div className={`lgn-field ${focused === 'password' ? 'lgn-field--focus' : ''}`}>
                <label className="lgn-label" htmlFor="password">Contraseña</label>
                <div className="lgn-input-w">
                  <Lock size={17} className="lgn-input-icon" />
                  <input
                    id="password" name="password" required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password} onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    autoComplete="current-password" className="lgn-input"
                  />
                  <button type="button" className="lgn-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="lgn-submit">
                <span>{isLoading ? 'Verificando...' : 'Ingresar'}</span>
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
        <p className="lgn-footer">Alcaldía de San Cristóbal &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default LoginForm;
