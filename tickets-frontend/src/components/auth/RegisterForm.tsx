import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building, Phone } from 'lucide-react';
import './RegisterForm.css';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  office: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    office: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const offices = [
    'Oficina de Recursos Humanos',
    'Departamento de Tecnología',
    'Secretaría General',
    'Tesorería Municipal',
    'Oficina de Obras Públicas',
    'Departamento de Salud',
    'Oficina de Educación',
    'Secretaría de Transporte',
    'Departamento de Ambiente',
    'Oficina de Cultura'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);
    
    // Simulación de registro
    setTimeout(() => {
      console.log('Register attempt:', formData);
      setIsLoading(false);
      // Aquí iría la lógica real de registro
    }, 2000);
  };

  return (
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid">
            {/* Campo Nombre */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Nombre
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Juan"
                />
              </div>
            </div>

            {/* Campo Apellido */}
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Apellido
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Pérez"
                />
              </div>
            </div>

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

            {/* Campo Teléfono */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Teléfono
              </label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={20} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0251-1234567"
                />
              </div>
            </div>

            {/* Campo Oficina */}
            <div className="form-group">
              <label htmlFor="office" className="form-label">
                Oficina
              </label>
              <div className="input-wrapper">
                <Building className="input-icon" size={20} />
                <select
                  id="office"
                  name="office"
                  required
                  value={formData.office}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Selecciona tu oficina</option>
                  {offices.map((office) => (
                    <option key={office} value={office}>
                      {office}
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
            <a href="#">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
