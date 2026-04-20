import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Building, AlertCircle, User } from 'lucide-react';
import Layout from '../layout/Layout';
import ApiService, { RegisterResponse } from '../../services/api';
import './RegisterForm.css';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    roleId: 3 // Default to Jefe role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { id: 1, name: 'Administrador', description: 'Acceso completo al sistema' },
    { id: 2, name: 'Técnico', description: 'Gestión de tickets asignados' },
    { id: 3, name: 'Jefe', description: 'Creación y seguimiento de tickets' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roleId' ? parseInt(value) : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.register(
        formData.email,
        formData.password,
        formData.roleId
      );
      
      if (response.success) {
        // Registration successful, redirect to login
        navigate('/login', { 
          state: { 
            message: 'Usuario registrado exitosamente. Por favor inicia sesión.' 
          } 
        });
      } else {
        const errorMessage = response.errors 
          ? Object.values(response.errors).flat().join(', ')
          : response.message || 'Error al registrar usuario';
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showHeader={true} isLogin={true}>
      <div className="register-container">
        <div className="register-card">
        {/* Logo y Header */}
        <div className="register-header">
          <div className="register-logo">
            <Building size={32} color="white" />
          </div>
          <h1 className="register-title">Registro de Usuario</h1>
          <h2 className="register-subtitle">Alcaldía San Cristóbal</h2>
          <p className="register-description">Sistema de Gestión de Tickets</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid">
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
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Campo Rol */}
            <div className="form-group">
              <label htmlFor="roleId" className="form-label">
                Rol
              </label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <select
                  id="roleId"
                  name="roleId"
                  required
                  value={formData.roleId}
                  onChange={handleChange}
                  className="form-select"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
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

            {/* Campo Confirmar Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
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
                Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <p className="login-link">
            ¿Ya tienes cuenta?{' '}
            <a href="/login">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default RegisterForm;
