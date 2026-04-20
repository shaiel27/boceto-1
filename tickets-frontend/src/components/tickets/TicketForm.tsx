import React, { useState, useEffect } from 'react';
import {
  Send,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  Building,
  User,
  Settings,
  Upload,
  ArrowRight,
  ChevronDown,
  MapPin,
  Clock,
  Shield,
  Layers,
  AlertTriangle
} from 'lucide-react';
import './TicketForm.css';

interface TicketFormData {
  subject: string;
  description: string;
  propertyNumber: string;
  fkOffice: string;
  fkTiService: string;
  fkProblemCatalog: string;
  fkSoftwareSystem: string;
  attachments: File[];
}

interface ProblemCatalog {
  id: string;
  name: string;
  typicalDescription: string;
  estimatedSeverity: string;
}

interface SoftwareSystem {
  id: string;
  name: string;
  description: string;
}

const TicketForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    description: '',
    propertyNumber: '',
    fkOffice: '',
    fkTiService: '',
    fkProblemCatalog: '',
    fkSoftwareSystem: '',
    attachments: []
  });

  // Catálogo de problemas por tipo de servicio
  const [problemsCatalog, setProblemsCatalog] = useState<ProblemCatalog[]>([]);
  const [softwareSystems, setSoftwareSystems] = useState<SoftwareSystem[]>([]);

  // Cargar problemas según tipo de servicio seleccionado
  useEffect(() => {
    if (formData.fkTiService) {
      const mockProblems: ProblemCatalog[] = [
        {
          id: '1',
          name: 'Sin conexión a internet',
          typicalDescription: 'No puedo acceder a internet o la conexión es muy lenta',
          estimatedSeverity: 'Alta'
        },
        {
          id: '2',
          name: 'Problemas de red interna',
          typicalDescription: 'No puedo acceder a recursos compartidos o impresoras en red',
          estimatedSeverity: 'Media'
        },
        {
          id: '3',
          name: 'VPN no conecta',
          typicalDescription: 'No puedo conectarme a la VPN corporativa',
          estimatedSeverity: 'Alta'
        }
      ];

      if (formData.fkTiService === '2') {
        mockProblems.length = 0;
        mockProblems.push(
          {
            id: '4',
            name: 'Sistema no responde',
            typicalDescription: 'El sistema está lento o no responde',
            estimatedSeverity: 'Alta'
          },
          {
            id: '5',
            name: 'Error en funcionalidad',
            typicalDescription: 'Algún módulo del sistema presenta errores',
            estimatedSeverity: 'Media'
          },
          {
            id: '6',
            name: 'Nueva funcionalidad requerida',
            typicalDescription: 'Necesito una nueva función o reporte',
            estimatedSeverity: 'Baja'
          }
        );

        // Cargar sistemas de software para Programación
        const mockSoftwareSystems: SoftwareSystem[] = [
          { id: '1', name: 'Sistema de Recursos Humanos', description: 'Módulo de nómina y personal' },
          { id: '2', name: 'Sistema de Finanzas', description: 'Contabilidad y presupuesto' },
          { id: '3', name: 'Sistema de Catastro', description: 'Gestión de impuestos inmobiliarios' },
          { id: '4', name: 'Sistema de Trámites', description: 'Gestión de solicitudes ciudadanas' }
        ];
        setSoftwareSystems(mockSoftwareSystems);
      } else {
        setSoftwareSystems([]);
      }

      if (formData.fkTiService === '3') {
        mockProblems.length = 0;
        mockProblems.push(
          {
            id: '7',
            name: 'Equipo no enciende',
            typicalDescription: 'El equipo no prende o se apaga solo',
            estimatedSeverity: 'Alta'
          },
          {
            id: '8',
            name: 'Pantalla dañada',
            typicalDescription: 'La pantalla está rota o no muestra imagen',
            estimatedSeverity: 'Alta'
          },
          {
            id: '9',
            name: 'Teclado/mouse no funciona',
            typicalDescription: 'El teclado o mouse no responde',
            estimatedSeverity: 'Media'
          },
          {
            id: '10',
            name: 'Impresora atascada',
            typicalDescription: 'La impresora tiene papel atascado o no imprime',
            estimatedSeverity: 'Media'
          }
        );
      }

      setProblemsCatalog(mockProblems);
    } else {
      setProblemsCatalog([]);
      setSoftwareSystems([]);
    }
  }, [formData.fkTiService]);

  // Mock data para oficinas unificadas según estructura de DB
  const [offices] = useState([
    { id: '1', name: 'Dirección de Educación', type: 'Direction' },
    { id: '2', name: 'Dirección de Vialidad', type: 'Direction' },
    { id: '3', name: 'Dirección de Salud', type: 'Direction' },
    { id: '4', name: 'Dirección de Obras Públicas', type: 'Direction' },
    { id: '5', name: 'Dirección de Recursos Humanos', type: 'Direction' },
    { id: '6', name: 'Dirección de Finanzas', type: 'Direction' },
    { id: '7', name: 'División de Docencia', type: 'Division', parentOfficeId: '1' },
    { id: '8', name: 'División de Ingeniería', type: 'Division', parentOfficeId: '2' },
    { id: '9', name: 'División Administrativa', type: 'Division', parentOfficeId: '3' },
    { id: '10', name: 'Coordinación de Semáforos', type: 'Coordination', parentOfficeId: '7' },
    { id: '11', name: 'Coordinación de Catastro Legal', type: 'Coordination', parentOfficeId: '8' },
    { id: '12', name: 'Coordinación de Mantenimiento', type: 'Coordination', parentOfficeId: '9' }
  ]);

  const [tiServices] = useState([
    { id: '1', name: 'Redes', description: 'Problemas de conectividad' },
    { id: '2', name: 'Programación', description: 'Desarrollo de software' },
    { id: '3', name: 'Soporte Técnico', description: 'Hardware y mantenimiento' }
  ]);

  const formSteps = [
    { id: 1, title: 'Información', icon: <FileText size={20} />, description: 'Datos principales' },
    { id: 2, title: 'Problema', icon: <AlertTriangle size={20} />, description: 'Catálogo de problemas' },
    { id: 3, title: 'Detalles', icon: <Settings size={20} />, description: 'Descripción del problema' },
    { id: 4, title: 'Archivos', icon: <Upload size={20} />, description: 'Documentos adjuntos' },
    { id: 5, title: 'Confirmar', icon: <CheckCircle size={20} />, description: 'Revisión final' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Paso 1: Información básica del ticket
      if (!formData.subject.trim()) {
        newErrors.subject = 'El asunto es requerido';
      } else if (formData.subject.length < 5) {
        newErrors.subject = 'El asunto debe tener al menos 5 caracteres';
      }

      if (!formData.fkOffice) {
        newErrors.fkOffice = 'La oficina es requerida';
      }

      if (!formData.fkTiService) {
        newErrors.fkTiService = 'El tipo de servicio es requerido';
      }

      // Validar sistema de software si es Programación
      if (formData.fkTiService === '2' && !formData.fkSoftwareSystem) {
        newErrors.fkSoftwareSystem = 'Debe seleccionar un sistema de software para Programación';
      }
    }

    if (step === 1) {
      // Paso 2: Selección de problema del catálogo
      if (!formData.fkProblemCatalog) {
        newErrors.fkProblemCatalog = 'Debe seleccionar un problema del catálogo';
      }
    }

    if (step === 2) {
      // Paso 3: Detalles del problema
      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
      } else if (formData.description.length < 20) {
        newErrors.description = 'La descripción debe tener al menos 20 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    const stepIndex = stepId - 1;
    if (stepIndex < currentStep || validateStep(currentStep)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calcular prioridad del sistema basada en el problema seleccionado
      const selectedProblem = problemsCatalog.find(p => p.id === formData.fkProblemCatalog);
      const systemPriority = selectedProblem?.estimatedSeverity || 'Media';

      const ticketCode = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      console.log('Ticket creado:', {
        ...formData,
        ticketCode,
        systemPriority
      });

      setSubmitStatus('success');

      setTimeout(() => {
        setFormData({
          subject: '',
          description: '',
          propertyNumber: '',
          fkOffice: '',
          fkTiService: '',
          fkProblemCatalog: '',
          fkSoftwareSystem: '',
          attachments: []
        });
        setCurrentStep(0);
        setSubmitStatus('idle');
        setProblemsCatalog([]);
        setSoftwareSystems([]);
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-step">
            <div className="step-header">
              <h3>Información del Ticket</h3>
              <p>Completa los datos principales para tu solicitud</p>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <FileText size={18} />
                Información Básica
              </div>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>
                    Asunto del Ticket *
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.subject ? 'error' : ''}`}
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Describe brevemente el problema"
                    maxLength={100}
                  />
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>

                <div className="form-field">
                  <label>
                    Número de Bien
                  </label>
                  <div className="input-with-icon">
                    <Settings size={18} />
                    <input
                      type="text"
                      className="form-input"
                      value={formData.propertyNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, propertyNumber: e.target.value }))}
                      placeholder="PC-001, EQ-002..."
                      maxLength={10}
                    />
                  </div>
                  <small>Opcional - Identificación del equipo</small>
                </div>

                <div className="form-field">
                  <label>
                    Tipo de Servicio *
                  </label>
                  <div className="input-with-icon">
                    <Layers size={18} />
                    <select
                      className={`form-input ${errors.fkTiService ? 'error' : ''}`}
                      value={formData.fkTiService}
                      onChange={(e) => setFormData(prev => ({ ...prev, fkTiService: e.target.value }))}
                    >
                      <option value="">Selecciona un servicio</option>
                      {tiServices.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.fkTiService && <span className="error-message">{errors.fkTiService}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <Building size={18} />
                Oficina de Origen
              </div>
              <div className="form-field full-width">
                <label>
                  Selecciona tu Oficina *
                </label>
                <div className="input-with-icon">
                  <Building size={18} />
                  <select
                    className={`form-input ${errors.fkOffice ? 'error' : ''}`}
                    value={formData.fkOffice}
                    onChange={(e) => setFormData(prev => ({ ...prev, fkOffice: e.target.value }))}
                  >
                    <option value="">Selecciona tu oficina</option>
                    {offices.map(office => (
                      <option key={office.id} value={office.id}>
                        {office.name} ({office.type})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.fkOffice && <span className="error-message">{errors.fkOffice}</span>}
              </div>
            </div>

            {formData.fkTiService === '2' && (
              <div className="form-section">
                <div className="form-section-title">
                  <Settings size={18} />
                  Sistema de Software
                </div>
                <div className="form-field full-width">
                  <label>
                    Sistema Afectado *
                  </label>
                  <div className="input-with-icon">
                    <Settings size={18} />
                    <select
                      className={`form-input ${errors.fkSoftwareSystem ? 'error' : ''}`}
                      value={formData.fkSoftwareSystem}
                      onChange={(e) => setFormData(prev => ({ ...prev, fkSoftwareSystem: e.target.value }))}
                    >
                      <option value="">Selecciona el sistema</option>
                      {softwareSystems.map(system => (
                        <option key={system.id} value={system.id}>
                          {system.name} - {system.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.fkSoftwareSystem && <span className="error-message">{errors.fkSoftwareSystem}</span>}
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="form-step">
            <div className="step-header">
              <h3>Catálogo de Problemas</h3>
              <p>Selecciona el problema que estás experimentando según el tipo de servicio</p>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <AlertTriangle size={18} />
                Selección de Problema
              </div>

              {!formData.fkTiService ? (
                <div className="service-required-message">
                  <AlertTriangle size={48} />
                  <h4>Primero selecciona un tipo de servicio</h4>
                  <p>El catálogo de problemas se cargará según el área seleccionada</p>
                </div>
              ) : problemsCatalog.length === 0 ? (
                <div className="no-problems-message">
                  <AlertTriangle size={48} />
                  <h4>No hay problemas disponibles</h4>
                  <p>No se encontraron problemas para este tipo de servicio</p>
                </div>
              ) : (
                <div className="problems-grid">
                  {problemsCatalog.map(problem => (
                    <label
                      key={problem.id}
                      className={`problem-card ${formData.fkProblemCatalog === problem.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="problemCatalog"
                        value={problem.id}
                        checked={formData.fkProblemCatalog === problem.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, fkProblemCatalog: e.target.value }))}
                      />
                      <div className="problem-content">
                        <div className="problem-header">
                          <span className="problem-name">{problem.name}</span>
                          <span className={`severity-badge ${problem.estimatedSeverity.toLowerCase()}`}>
                            {problem.estimatedSeverity}
                          </span>
                        </div>
                        <p className="problem-description">{problem.typicalDescription}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {errors.fkProblemCatalog && <span className="error-message">{errors.fkProblemCatalog}</span>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <div className="step-header">
              <h3>Detalles del Problema</h3>
              <p>Describe la incidencia con el mayor detalle posible</p>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <FileText size={18} />
                Descripción Detallada
              </div>
              <div className="form-field full-width">
                <label>
                  Descripción del Problema *
                </label>
                <textarea
                  className={`form-input ${errors.description ? 'error' : ''}`}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el problema, cuándo ocurrió, qué intentaste hacer, impacto en tu trabajo..."
                  rows={6}
                />
                <div className="char-count">
                  {formData.description.length} / 500 caracteres
                </div>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <div className="step-header">
              <h3>Archivos Adjuntos</h3>
              <p>Añade capturas de pantalla o documentos relevantes (opcional)</p>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <Upload size={18} />
                Documentos de Soporte
              </div>

              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
                }}
                style={{ display: 'none' }}
              />

              <label htmlFor="file-upload" className="upload-area">
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <div className="upload-text">
                  <h4>Arrastra archivos aquí</h4>
                  <p>o haz clic para seleccionar</p>
                  <small>Máximo 5MB por archivo • Formatos: JPG, PNG, PDF, DOC</small>
                </div>
              </label>

              {formData.attachments.length > 0 && (
                <div className="files-list">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <FileText size={20} />
                        <div>
                          <div className="file-name">{file.name}</div>
                          <div className="file-size">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="remove-file"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          attachments: prev.attachments.filter((_, i) => i !== index)
                        }))}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <div className="step-header">
              <h3>Confirmación</h3>
              <p>Revisa toda la información antes de enviar</p>
            </div>

            <div className="confirmation-section">
              <div className="confirmation-card">
                <h4>Información del Ticket</h4>
                <div className="confirmation-item">
                  <span>Asunto:</span>
                  <span>{formData.subject}</span>
                </div>
                <div className="confirmation-item">
                  <span>Número de Bien:</span>
                  <span>{formData.propertyNumber || 'No especificado'}</span>
                </div>
                <div className="confirmation-item">
                  <span>Servicio:</span>
                  <span>{tiServices.find(s => s.id === formData.fkTiService)?.name}</span>
                </div>
                <div className="confirmation-item">
                  <span>Problema:</span>
                  <span>{problemsCatalog.find(p => p.id === formData.fkProblemCatalog)?.name}</span>
                </div>
                <div className="confirmation-item">
                  <span>Prioridad del Sistema:</span>
                  <span className={`priority-badge ${problemsCatalog.find(p => p.id === formData.fkProblemCatalog)?.estimatedSeverity?.toLowerCase() || 'media'}`}>
                    {problemsCatalog.find(p => p.id === formData.fkProblemCatalog)?.estimatedSeverity || 'Media'}
                  </span>
                </div>
              </div>

              <div className="confirmation-card">
                <h4>Oficina de Origen</h4>
                <div className="confirmation-item">
                  <span>Oficina:</span>
                  <span>{offices.find(o => o.id === formData.fkOffice)?.name}</span>
                </div>
                <div className="confirmation-item">
                  <span>Tipo:</span>
                  <span>{offices.find(o => o.id === formData.fkOffice)?.type}</span>
                </div>
              </div>

              {formData.fkTiService === '2' && (
                <div className="confirmation-card">
                  <h4>Sistema de Software</h4>
                  <div className="confirmation-item">
                    <span>Sistema:</span>
                    <span>{softwareSystems.find(s => s.id === formData.fkSoftwareSystem)?.name}</span>
                  </div>
                  <div className="confirmation-item">
                    <span>Descripción:</span>
                    <span>{softwareSystems.find(s => s.id === formData.fkSoftwareSystem)?.description}</span>
                  </div>
                </div>
              )}

              <div className="confirmation-card">
                <h4>Detalles</h4>
                <p className="description-preview">{formData.description}</p>
              </div>

              {formData.attachments.length > 0 && (
                <div className="confirmation-card">
                  <h4>Archivos Adjuntos</h4>
                  <div className="files-summary">
                    {formData.attachments.length} archivo(s) • {(formData.attachments.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ticket-form">
      <div className="form-header">
        <h1>Crear Nuevo Ticket</h1>
        <p>Completa el formulario para generar una solicitud de soporte</p>
      </div>

      <div className="stepper">
        {formSteps.map((step, index) => (
          <div
            key={step.id}
            className={`step-item ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
            onClick={() => handleStepClick(step.id)}
          >
            <div className="step-icon">
              {step.icon}
            </div>
            <div className="step-text">
              <div className="step-title">{step.title}</div>
              <div className="step-subtitle">Paso {index + 1} de {formSteps.length}</div>
            </div>
            {index < formSteps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {renderStepContent()}

        <div className="form-actions">
          {currentStep > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              <ArrowRight size={20} className="rotate-180" />
              Anterior
            </button>
          )}

          {currentStep < formSteps.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Siguiente
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting || submitStatus === 'success'}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Crear Ticket
                </>
              )}
            </button>
          )}
        </div>

        {submitStatus === 'success' && (
          <div className="success-message">
            <CheckCircle size={48} />
            <h3>¡Ticket Creado Exitosamente!</h3>
            <p>Tu solicitud ha sido registrada y será procesada pronto.</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="error-message">
            <AlertCircle size={48} />
            <h3>Error al Crear Ticket</h3>
            <p>Por favor, intenta nuevamente o contacta al administrador.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default TicketForm;
