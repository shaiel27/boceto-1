import React, { useState } from 'react';
import { User, Building, Briefcase, Save, ArrowLeft, Plus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserRegistration.css';

interface FormData {
  firstName: string;
  lastName: string;
  ci: string;
  telephone: string;
  email: string;
  direction: string;
  division: string;
  coordination: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  ci?: string;
  email?: string;
  direction?: string;
}

interface Direction {
  id: number;
  name: string;
}

interface Division {
  id: number;
  directionId: number;
  name: string;
}

interface Coordination {
  id: number;
  divisionId: number;
  name: string;
}

const UserRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    ci: '',
    telephone: '',
    email: '',
    direction: '',
    division: '',
    coordination: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Datos mock de la estructura institucional
  const directions = [
    { id: 1, name: 'Dirección de Tecnología e Información' },
    { id: 2, name: 'Dirección de Administración y Finanzas' }
  ];

  const divisions = [
    { id: 1, directionId: 1, name: 'División de Infraestructura de Redes' },
    { id: 2, directionId: 1, name: 'División de Soporte Técnico' },
    { id: 3, directionId: 1, name: 'División de Desarrollo de Software' },
    { id: 4, directionId: 2, name: 'División de Recursos Humanos' }
  ];

  const coordinations = [
    { id: 1, divisionId: 1, name: 'Coordinación de Redes LAN/WAN' },
    { id: 2, divisionId: 1, name: 'Coordinación de Conectividad Internet' },
    { id: 3, divisionId: 2, name: 'Coordinación de Mesa de Ayuda' },
    { id: 4, divisionId: 2, name: 'Coordinación de Mantenimiento de Equipos' },
    { id: 5, divisionId: 3, name: 'Coordinación de Desarrollo Web' },
    { id: 6, divisionId: 3, name: 'Coordinación de Desarrollo Móvil' },
    { id: 7, divisionId: 4, name: 'Coordinación de Nómina' },
    { id: 8, divisionId: 4, name: 'Coordinación de Beneficios' }
  ];

  // Filtrar divisiones basadas en la dirección seleccionada
  const filteredDivisions = formData.direction 
    ? divisions.filter(d => d.directionId === parseInt(formData.direction))
    : divisions;

  // Filtrar coordinaciones basadas en la división seleccionada
  const filteredCoordinations = formData.division
    ? coordinations.filter(c => c.divisionId === parseInt(formData.division))
    : coordinations;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.ci.trim()) {
      newErrors.ci = 'La cédula es requerida';
    } else if (!/^\d{7,8}$/.test(formData.ci.trim())) {
      newErrors.ci = 'La cédula debe tener 7 u 8 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'El correo no es válido';
    }

    if (!formData.direction) {
      newErrors.direction = 'Debe seleccionar una dirección';
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
          firstName: '',
          lastName: '',
          ci: '',
          telephone: '',
          email: '',
          direction: '',
          division: '',
          coordination: ''
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

  const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      direction: value,
      division: '',
      coordination: ''
    }));
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      division: value,
      coordination: ''
    }));
  };

  return (
    <div className="user-registration-container">
      <div className="registration-header">
        <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        <div className="header-title">
          <User size={32} />
          <h1>Registro de Solicitantes</h1>
        </div>
        <div className="header-subtitle">
          Agregar nuevos usuarios solicitantes al sistema
        </div>
      </div>

      <div className="registration-content">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">
              <Plus size={24} />
            </div>
            <h2>Datos del Solicitante</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Información Personal</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <User size={16} />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="Ingrese el nombre"
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">
                    <User size={16} />
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                    placeholder="Ingrese el apellido"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ci">
                    Cédula de Identidad *
                  </label>
                  <input
                    type="text"
                    id="ci"
                    name="ci"
                    value={formData.ci}
                    onChange={handleInputChange}
                    className={errors.ci ? 'error' : ''}
                    placeholder="Ej: 12345678"
                    maxLength={8}
                  />
                  {errors.ci && <span className="error-message">{errors.ci}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="telephone">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="Ej: +58-414-1234567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">
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
            </div>

            <div className="form-section">
              <h3>Asignación Institucional</h3>
              <div className="form-group">
                <label htmlFor="direction">
                  <Building size={16} />
                  Dirección *
                </label>
                <select
                  id="direction"
                  name="direction"
                  value={formData.direction}
                  onChange={handleDirectionChange}
                  className={errors.direction ? 'error' : ''}
                >
                  <option value="">Seleccione una dirección</option>
                  {directions.map(dir => (
                    <option key={dir.id} value={dir.id}>{dir.name}</option>
                  ))}
                </select>
                {errors.direction && <span className="error-message">{errors.direction}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="division">
                  <Briefcase size={16} />
                  División
                </label>
                <select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleDivisionChange}
                  disabled={!formData.direction}
                >
                  <option value="">Seleccione una división</option>
                  {filteredDivisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="coordination">
                  Coordinación
                </label>
                <select
                  id="coordination"
                  name="coordination"
                  value={formData.coordination}
                  onChange={handleInputChange}
                  disabled={!formData.division}
                >
                  <option value="">Seleccione una coordinación</option>
                  {filteredCoordinations.map(coord => (
                    <option key={coord.id} value={coord.id}>{coord.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                <Save size={18} />
                Registrar Solicitante
              </button>
            </div>
          </form>
        </div>

        {showSuccess && (
          <div className="success-message">
            <Check size={24} />
            <div>
              <h4>¡Registro Exitoso!</h4>
              <p>El solicitante ha sido registrado correctamente.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRegistration;
