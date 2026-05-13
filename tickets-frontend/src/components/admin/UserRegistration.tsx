import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Save, 
  ArrowLeft, 
  Plus, 
  Check, 
  X, 
  Search,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sileo } from 'sileo';
import ModernSidebar from '../layout/ModernSidebar';
import './UserRegistration.css';
import ApiService from '../../services/api';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fk_role: string;
  name_boss: string;
  username: string;
  pronoun: string;
  fk_office: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fk_role?: string;
  name_boss?: string;
  username?: string;
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
    username: '',
    pronoun: 'Sr.',
    fk_office: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  const [roles] = useState<Role[]>([
    { ID_Role: 1, Role: 'Administrador', Description: 'Acceso completo al sistema' },
    { ID_Role: 2, Role: 'Técnico', Description: 'Gestión de tickets asignados' },
    { ID_Role: 3, Role: 'Jefe', Description: 'Creación y seguimiento de tickets' }
  ]);
  
  const [offices, setOffices] = useState<Office[]>([]);
  const [officeSearch, setOfficeSearch] = useState('');
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);

  // Validate form
  useEffect(() => {
    const isValid = Boolean(
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.name_boss &&
      formData.username &&
      formData.fk_office &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
    
    setIsFormValid(isValid);
  }, [formData]);

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
      sileo.error({
        title: 'Error',
        description: 'Error al cargar las oficinas desde el servidor'
      });
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.name_boss && formData.username && formData.pronoun);
      case 2:
        return Boolean(formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email));
      case 3:
        return formData.password.length >= 6 && formData.password === formData.confirmPassword;
      case 4:
        return Boolean(formData.fk_role && formData.fk_office);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      sileo.error({
        title: 'Validación',
        description: 'Por favor completa todos los campos requeridos correctamente'
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      sileo.error({
        title: 'Validación',
        description: 'Por favor completa todos los campos requeridos correctamente'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await ApiService.createUserWithOffice({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: `${formData.pronoun} ${formData.name_boss}`,
        role: parseInt(formData.fk_role),
        name_boss: formData.name_boss,
        pronoun: formData.pronoun,
        office_id: formData.fk_office ? parseInt(formData.fk_office) : undefined
      });

      if (response.success) {
        sileo.success({
          title: '¡Éxito!',
          description: 'Usuario creado exitosamente'
        });
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fk_role: '3',
            name_boss: '',
            username: '',
            pronoun: 'Sr.',
            fk_office: ''
          });
          setErrors({});
          setCurrentStep(1);
        }, 3000);
      } else {
        sileo.error({
          title: 'Error',
          description: 'Error al crear usuario: ' + (response.message || 'Error desconocido')
        });
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      sileo.error({
        title: 'Error',
        description: 'Error de conexión con el servidor'
      });
    } finally {
      setLoading(false);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <div className="step-number">1</div>
              <div className="step-info">
                <h3>Información Personal</h3>
                <p>Datos básicos del usuario</p>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name_boss" className="form-label">
                  <User size={16} />
                  Nombre Completo
                </label>
                <input
                  id="name_boss"
                  name="name_boss"
                  type="text"
                  required
                  value={formData.name_boss}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Juan Pérez"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <User size={16} />
                  Nombre de Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="juan.perez"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pronoun" className="form-label">
                  <GraduationCap size={16} />
                  Tratamiento
                </label>
                <select
                  id="pronoun"
                  name="pronoun"
                  value={formData.pronoun}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Sr.">Sr.</option>
                  <option value="Sra.">Sra.</option>
                  <option value="Lic.">Lic.</option>
                  <option value="Ing.">Ing.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Dra.">Dra.</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <div className="step-number">2</div>
              <div className="step-info">
                <h3>Información de Contacto</h3>
                <p>Correo electrónico del usuario</p>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="usuario@alcaldia.gob.ve"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <div className="step-number">3</div>
              <div className="step-info">
                <h3>Seguridad</h3>
                <p>Configuración de acceso</p>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={16} />
                Contraseña
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="password-strength">
                <div className={`strength-bar ${formData.password.length >= 6 ? 'strong' : 'weak'}`}></div>
                <span className="strength-text">
                  {formData.password.length >= 6 ? 'Contraseña segura' : 'Mínimo 6 caracteres'}
                </span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} />
                Confirmar Contraseña
              </label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                  {formData.password === formData.confirmPassword ? (
                    <><CheckCircle2 size={14} /> Las contraseñas coinciden</>
                  ) : (
                    <><AlertCircle size={14} /> Las contraseñas no coinciden</>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <div className="step-number">4</div>
              <div className="step-info">
                <h3>Rol y Ubicación</h3>
                <p>Asignación de permisos y oficina</p>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="fk_role" className="form-label">
                <Briefcase size={16} />
                Rol del Usuario
              </label>
              <select
                id="fk_role"
                name="fk_role"
                value={formData.fk_role}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Seleccionar rol</option>
                {roles.map((role) => (
                  <option key={role.ID_Role} value={role.ID_Role}>
                    {role.Role} - {role.Description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Oficina
              </label>
              <div className="office-search-container">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={officeSearch}
                    onChange={(e) => {
                      setOfficeSearch(e.target.value);
                      setShowOfficeDropdown(true);
                    }}
                    onFocus={() => setShowOfficeDropdown(true)}
                    className="form-input"
                    placeholder="Buscar oficina..."
                  />
                </div>
                
                {showOfficeDropdown && (
                  <div className="office-dropdown">
                    {filteredOffices.length > 0 ? (
                      filteredOffices.map(office => (
                        <div
                          key={office.ID_Office}
                          className="office-option"
                          onClick={() => handleOfficeSelect(office)}
                        >
                          <div className="office-info">
                            <span className="office-name">{office.Name_Office}</span>
                            <span className="office-type">{office.Office_Type}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">No se encontraron oficinas</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="user-registration-container">
      <ModernSidebar />
      
      <div className="user-registration-content">
        <div className="registration-header">
          <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={20} />
            Volver al Panel
          </button>
          
          <div className="header-info">
            <div className="institutional-logo">
              <Building size={32} />
              <div className="logo-badge">
                <Shield size={16} />
              </div>
            </div>
            <div className="header-text">
              <h1 className="page-title">Registro de Usuario</h1>
              <p className="page-description">Alcaldía Municipal de San Cristóbal</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="progress-steps">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`progress-step ${currentStep >= step ? 'completed' : ''} ${currentStep === step ? 'active' : ''}`}
              >
                <div className="step-dot">{step}</div>
                <span className="step-label">
                  {step === 1 && 'Datos'}
                  {step === 2 && 'Contacto'}
                  {step === 3 && 'Seguridad'}
                  {step === 4 && 'Rol'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="registration-form-container">
          {showSuccess && (
            <div className="success-message">
              <CheckCircle2 size={20} />
              Usuario creado exitosamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="registration-form">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="nav-btn secondary"
                  disabled={loading}
                >
                  Anterior
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="nav-btn primary"
                  disabled={!validateStep(currentStep)}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  className="nav-btn primary submit-btn"
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Creando usuario...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Crear Usuario
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
