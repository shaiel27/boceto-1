import React, { useState, useEffect } from 'react';
import { User, Building, Save, ArrowLeft, Plus, Check, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernSidebar from '../layout/ModernSidebar';
import '../layout/ModernSidebar.css';
import './UserRegistration.css';
import ApiService from '../../services/api';

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
    fk_role: '3',
    name_boss: '',
    pronoun: 'Sr.',
    fk_office: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [officeSearch, setOfficeSearch] = useState('');
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);

  // Cargar roles y oficinas desde el backend
  useEffect(() => {
    loadOffices();
  }, []);

  const loadOffices = async () => {
    try {
      const response = await ApiService.getOffices();
      if (response.success && response.data) {
        setOffices(response.data);
        setFilteredOffices(response.data);
      }
    } catch (error) {
      console.error('Error al cargar oficinas:', error);
    }
  };

  // Filtrar oficinas basado en búsqueda
  useEffect(() => {
    if (officeSearch.trim() === '') {
      setFilteredOffices(offices);
    } else {
      const searchLower = officeSearch.toLowerCase();
      const filtered = offices.filter(office =>
        office.Name_Office.toLowerCase().includes(searchLower) ||
        office.Office_Type.toLowerCase().includes(searchLower)
      );
      setFilteredOffices(filtered);
    }
  }, [officeSearch, offices]);

  const handleOfficeSelect = (office: Office) => {
    setFormData({ ...formData, fk_office: office.ID_Office.toString() });
    setOfficeSearch(office.Name_Office);
    setShowOfficeDropdown(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      try {
        const response = await ApiService.createUserWithOffice({
          email: formData.email,
          password: formData.password,
          username: formData.email.split('@')[0],
          full_name: `${formData.pronoun} ${formData.name_boss}`,
          role: parseInt(formData.fk_role),
          name_boss: formData.name_boss,
          pronoun: formData.pronoun,
          office_id: formData.fk_office ? parseInt(formData.fk_office) : undefined
        });

        if (response.success) {
          setShowSuccess(true);

          setTimeout(() => {
            setShowSuccess(false);
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              fk_role: '3',
              name_boss: '',
              pronoun: 'Sr.',
              fk_office: ''
            });
            setErrors({});
          }, 3000);
        } else {
          alert('Error al crear usuario: ' + (response.message || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error al crear usuario:', error);
        alert('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
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
      <ModernSidebar />
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
                <div className="office-search-container">
                  <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      id="office-search"
                      value={officeSearch}
                      onChange={(e) => {
                        setOfficeSearch(e.target.value);
                        setShowOfficeDropdown(true);
                      }}
                      onFocus={() => setShowOfficeDropdown(true)}
                      placeholder="Buscar oficina..."
                      className={errors.fk_office ? 'error' : ''}
                    />
                    {officeSearch && (
                      <X
                        size={16}
                        className="clear-icon"
                        onClick={() => {
                          setOfficeSearch('');
                          setFormData({ ...formData, fk_office: '' });
                        }}
                      />
                    )}
                  </div>
                  {showOfficeDropdown && (
                    <div className="office-dropdown">
                      {filteredOffices.length === 0 ? (
                        <div className="no-results">No se encontraron oficinas</div>
                      ) : (
                        filteredOffices.slice(0, 20).map(office => (
                          <div
                            key={office.ID_Office}
                            className="office-option"
                            onClick={() => handleOfficeSelect(office)}
                          >
                            <span className="office-icon">
                              {office.Office_Type === 'Direction' && '📍'}
                              {office.Office_Type === 'Division' && '📁'}
                              {office.Office_Type === 'Coordination' && '🎯'}
                            </span>
                            <span className="office-name">{office.Name_Office}</span>
                            <span className="office-type">{office.Office_Type}</span>
                          </div>
                        ))
                      )}
                      {filteredOffices.length > 20 && (
                        <div className="show-more">
                          Mostrando 20 de {filteredOffices.length} resultados
                        </div>
                      )}
                    </div>
                  )}
                  <input
                    type="hidden"
                    id="fk_office"
                    name="fk_office"
                    value={formData.fk_office}
                  />
                </div>
                {errors.fk_office && <span className="error-message">{errors.fk_office}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/admin')} className="btn-secondary">
                <ArrowLeft size={16} />
                Volver
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Registrar Solicitante
                  </>
                )}
              </button>
            </div>
          </form>

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
    </div>
  );
};

export default UserRegistration;
