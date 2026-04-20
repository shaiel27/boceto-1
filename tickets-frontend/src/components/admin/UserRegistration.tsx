import React, { useState } from 'react';
import { User, Building, Save, ArrowLeft, Plus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserRegistration.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fk_role: string;
  name_boss: string;
  pronoun: string;
  fk_office: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fk_role?: string;
  name_boss?: string;
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
  Office_Type: string;
}

const UserRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fk_role: '4',
    name_boss: '',
    pronoun: 'Sr.',
    fk_office: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Datos mock de roles
  const roles: Role[] = [
    { ID_Role: 4, Role: 'Solicitante', Description: 'Usuario solicitante de servicios técnicos' }
  ];

  // Datos mock de oficinas
  const offices: Office[] = [
    { ID_Office: 1, Name_Office: 'Dirección de Educación', Office_Type: 'Direction' },
    { ID_Office: 2, Name_Office: 'Dirección de Vialidad', Office_Type: 'Direction' },
    { ID_Office: 3, Name_Office: 'Dirección de Salud', Office_Type: 'Direction' },
    { ID_Office: 4, Name_Office: 'Dirección de Obras Públicas', Office_Type: 'Direction' },
    { ID_Office: 5, Name_Office: 'División de Docencia', Office_Type: 'Division' },
    { ID_Office: 6, Name_Office: 'División de Administración', Office_Type: 'Division' },
    { ID_Office: 7, Name_Office: 'División de Ingeniería', Office_Type: 'Division' },
    { ID_Office: 8, Name_Office: 'Coordinación de Servicios Tecnológicos', Office_Type: 'Coordination' },
    { ID_Office: 9, Name_Office: 'Coordinación de Recursos Educativos', Office_Type: 'Coordination' }
  ];

  const pronouns = ['Sr.', 'Sra.', 'Lic.', 'Ing.', 'Dr.', 'Dra.'];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'El correo no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }


    if (!formData.name_boss.trim()) {
      newErrors.name_boss = 'El nombre es requerido';
    }

    if (!formData.fk_office) {
      newErrors.fk_office = 'Debe seleccionar una oficina';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Aquí iría la llamada a la API para guardar el usuario
      console.log('Datos del formulario:', formData);

      setShowSuccess(true);

      // Resetear el formulario después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fk_role: '',
          name_boss: '',
          pronoun: 'Sr.',
          fk_office: ''
        });
        setErrors({});
      }, 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores al escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="user-registration-container">
      <div className="registration-header">
        <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        <div className="header-title">
          <div className="header-icon-wrapper">
            <User size={32} />
          </div>
          <div>
            <h1>Registro de Solicitantes</h1>
            <p className="header-subtitle">Registrar nuevos solicitantes de servicios técnicos</p>
          </div>
        </div>
      </div>

      <div className="registration-content">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon-wrapper">
              <Plus size={24} />
            </div>
            <div>
              <h2>Registro de Nuevo Solicitante</h2>
              <p className="form-subtitle">Bienvenido al sistema. Complete la información para registrar un nuevo solicitante de servicios técnicos.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="section-badge">
                <User size={16} />
                <h3>Información de Cuenta</h3>
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">
                    <User size={16} />
                  </span>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Ej: usuario@alcaldia.gob.ve"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Repita la contraseña"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>


            <div className="form-section">
              <div className="section-badge personal">
                <User size={16} />
                <h3>Información Personal</h3>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pronoun">
                    <span className="label-icon">
                      <User size={16} />
                    </span>
                    Tratamiento
                  </label>
                  <select
                    id="pronoun"
                    name="pronoun"
                    value={formData.pronoun}
                    onChange={handleInputChange}
                  >
                    {pronouns.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name_boss">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name_boss"
                    name="name_boss"
                    value={formData.name_boss}
                    onChange={handleInputChange}
                    className={errors.name_boss ? 'error' : ''}
                    placeholder="Ej: Carlos Rodríguez"
                  />
                  {errors.name_boss && <span className="error-message">{errors.name_boss}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-badge institutional">
                <Building size={16} />
                <h3>Asignación Institucional</h3>
              </div>
              <div className="form-group">
                <label htmlFor="fk_office">
                  <span className="label-icon">
                    <Building size={16} />
                  </span>
                  Oficina de Asignación *
                </label>
                <select
                  id="fk_office"
                  name="fk_office"
                  value={formData.fk_office}
                  onChange={handleInputChange}
                  className={errors.fk_office ? 'error' : ''}
                >
                  <option value="">Seleccione una oficina</option>
                  {offices.map(office => (
                    <option key={office.ID_Office} value={office.ID_Office}>
                      {office.Office_Type === 'Direction' && '📍 '}
                      {office.Office_Type === 'Division' && '📁 '}
                      {office.Office_Type === 'Coordination' && '📍 '}
                      {office.Name_Office} ({office.Office_Type})
                    </option>
                  ))}
                </select>
                {errors.fk_office && <span className="error-message">{errors.fk_office}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                <Save size={18} />
                <span>Registrar Usuario</span>
              </button>
            </div>
          </form>
        </div>

        {showSuccess && (
          <div className="success-message">
            <div className="success-icon">
              <Check size={24} />
            </div>
            <div className="success-content">
              <h4>¡Excelente! Registro Completado</h4>
              <p>El nuevo solicitante ha sido registrado exitosamente. Ya puede comenzar a usar el sistema.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRegistration;
