import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building } from 'lucide-react';
import Layout from '../layout/Layout';
import './LoginForm.css';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulación de autenticación
    setTimeout(() => {
      console.log('Login attempt:', formData);
      setIsLoading(false);
      // Aquí iría la lógica real de autenticación
    }, 2000);
  };

  return (
    <Layout showHeader={true} isLogin={true}>
      <div className="login-container">
        <div className="login-card">
          {/* Logo y Header */}
          <div className="login-header">
            <div className="login-logo">
              <Building size={32} color="white" />
            </div>
            <h1 className="login-title">Alcaldía del Municipio</h1>
            <h2 className="login-subtitle">San Cristóbal</h2>
            <p className="login-description">Sistema de Gestión de Tickets</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Campo Email */}
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
                />
              </div>
            </div>

            {/* Campo Password */}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Opciones adicionales */}
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

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
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
      </div>
    </Layout>
  );
};

export default LoginForm;
