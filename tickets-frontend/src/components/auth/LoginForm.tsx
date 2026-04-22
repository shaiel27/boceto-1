import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Building, AlertCircle } from 'lucide-react';
import Layout from '../layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, isAdmin, isTechnician, isBoss } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated based on role
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) {
        navigate('/');
      } else if (isTechnician()) {
        navigate('/technician');
      } else if (isBoss()) {
        navigate('/requester');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, isTechnician, isBoss, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-logo">
            <Building size={48} color="white" />
          </div>
          <h1 className="branding-title">Alcaldía del Municipio</h1>
          <h2 className="branding-subtitle">San Cristóbal</h2>
          <p className="branding-description">Sistema de Gestión de Tickets</p>
          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <span>Gestión Eficiente</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <span>Respuesta Rápida</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <span>Seguridad Garantizada</span>
            </div>
          </div>
        </div>
        <div className="branding-overlay"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-container">
        <div className="login-card">
          {/* Logo and Header */}
          <div className="login-header">
            <div className="login-logo">
              <Building size={32} color="white" />
            </div>
            <h1 className="login-title">Bienvenido de nuevo</h1>
            <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="correo@alcaldia.gob.ve"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="form-options">
              <div className="checkbox-wrapper">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="checkbox-input"
                />
                <label htmlFor="remember" className="checkbox-label">
                  Recordarme
                </label>
              </div>
              <a href="#" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <span className="button-content">
                  <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="button-content">Iniciar Sesión</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p className="register-link">
              ¿No tienes cuenta?{' '}
              <a href="#">Regístrate aquí</a>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="login-page-footer">
          <p>© 2024 Alcaldía de San Cristóbal. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
