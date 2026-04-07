import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import './TicketForm.css';

interface TicketFormData {
  subject: string;
  description: string;
  propertyNumber: string;
  requestType: string;
  userPriority: string;
  fkOffice: string;
  fkAreaOffice: string;
  fkTiService: string;
  attachments: File[];
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
    requestType: 'Digital',
    userPriority: '',
    fkOffice: '',
    fkAreaOffice: '',
    fkTiService: '',
    attachments: []
  });

  const [offices] = useState([
    { id: '1', name: 'Oficina de Recursos Humanos' },
    { id: '2', name: 'Departamento de Tecnología' },
    { id: '3', name: 'Secretaría General' },
    { id: '4', name: 'Tesorería Municipal' },
    { id: '5', name: 'Oficina de Obras Públicas' }
  ]);

  const [tiServices] = useState([
    { id: '1', name: 'Redes', description: 'Problemas de conectividad' },
    { id: '2', name: 'Programación', description: 'Desarrollo de software' },
    { id: '3', name: 'Servicio Técnico', description: 'Hardware y mantenimiento' }
  ]);

  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);

  React.useEffect(() => {
    if (formData.fkOffice) {
      const mockAreas = [
        { id: '1', name: 'Administración' },
        { id: '2', name: 'Soporte Técnico' },
        { id: '3', name: 'Secretaría' },
        { id: '4', name: 'Finanzas' }
      ];
      setAreas(mockAreas);
    } else {
      setAreas([]);
    }
  }, [formData.fkOffice]);

  const formSteps = [
    { id: 1, title: 'Información', icon: <FileText size={20} /> },
    { id: 2, title: 'Detalles', icon: <Settings size={20} /> },
    { id: 3, title: 'Archivos', icon: <Upload size={20} /> },
    { id: 4, title: 'Confirmar', icon: <CheckCircle size={20} /> }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
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
      
      if (!formData.userPriority) {
        newErrors.userPriority = 'La prioridad es requerida';
      }
    }

    if (step === 1) {
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
      
      const ticketCode = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      console.log('Ticket creado:', { ...formData, ticketCode });
      
      setSubmitStatus('success');
      
      setTimeout(() => {
        setFormData({
          subject: '',
          description: '',
          propertyNumber: '',
          requestType: 'Digital',
          userPriority: '',
          fkOffice: '',
          fkAreaOffice: '',
          fkTiService: '',
          attachments: []
        });
        setCurrentStep(0);
        setSubmitStatus('idle');
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
                <div className="form-field">
                  <label>
                    Asunto del Ticket
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
                  <input
                    type="text"
                    className="form-input"
                    value={formData.propertyNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyNumber: e.target.value }))}
                    placeholder="PC-001, EQ-002..."
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <Building size={18} />
                Ubicación y Servicio
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label>
                    Oficina *
                  </label>
                  <select
                    className={`form-input ${errors.fkOffice ? 'error' : ''}`}
                    value={formData.fkOffice}
                    onChange={(e) => setFormData(prev => ({ ...prev, fkOffice: e.target.value }))}
                  >
                    <option value="">Selecciona una oficina</option>
                    {offices.map(office => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </select>
                  {errors.fkOffice && <span className="error-message">{errors.fkOffice}</span>}
                </div>

                <div className="form-field">
                  <label>
                    Área
                  </label>
                  <select
                    className="form-input"
                    value={formData.fkAreaOffice}
                    onChange={(e) => setFormData(prev => ({ ...prev, fkAreaOffice: e.target.value }))}
                    disabled={!formData.fkOffice}
                  >
                    <option value="">Selecciona un área</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>
                    Tipo de Servicio *
                  </label>
                  <select
                    className={`form-input ${errors.fkTiService ? 'error' : ''}`}
                    value={formData.fkTiService}
                    onChange={(e) => setFormData(prev => ({ ...prev, fkTiService: e.target.value }))}
                  >
                    <option value="">Selecciona un servicio</option>
                    {tiServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  {errors.fkTiService && <span className="error-message">{errors.fkTiService}</span>}
                </div>

                <div className="form-field">
                  <label>
                    Prioridad *
                  </label>
                  <select
                    className={`form-input ${errors.userPriority ? 'error' : ''}`}
                    value={formData.userPriority}
                    onChange={(e) => setFormData(prev => ({ ...prev, userPriority: e.target.value }))}
                  >
                    <option value="">Selecciona una prioridad</option>
                    <option value="Baja">🟢 Baja</option>
                    <option value="Media">🟡 Media</option>
                    <option value="Alta">🔴 Alta</option>
                  </select>
                  {errors.userPriority && <span className="error-message">{errors.userPriority}</span>}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
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
                  placeholder="Describe el problema, cuándo ocurrió, qué intentaste hacer..."
                  rows={6}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <Settings size={18} />
                Tipo de Solicitud
              </div>
              <div className="form-field">
                <label>
                  Modalidad de Atención
                </label>
                <select
                  className="form-input"
                  value={formData.requestType}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestType: e.target.value }))}
                >
                  <option value="Digital">💻 Digital</option>
                  <option value="Presencial">🏢 Presencial</option>
                  <option value="Híbrido">🔄 Híbrido</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <div className="step-header">
              <h3>Archivos Adjuntos</h3>
              <p>Añade capturas de pantalla o documentos relevantes</p>
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
                accept="image/*,.pdf,.txt"
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
                  <small>Máximo 5MB por archivo</small>
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

      case 3:
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
                  <span>Oficina:</span>
                  <span>{offices.find(o => o.id === formData.fkOffice)?.name}</span>
                </div>
                <div className="confirmation-item">
                  <span>Área:</span>
                  <span>{areas.find(a => a.id === formData.fkAreaOffice)?.name || 'No especificada'}</span>
                </div>
                <div className="confirmation-item">
                  <span>Servicio:</span>
                  <span>{tiServices.find(s => s.id === formData.fkTiService)?.name}</span>
                </div>
                <div className="confirmation-item">
                  <span>Prioridad:</span>
                  <span className={`priority-badge ${formData.userPriority.toLowerCase()}`}>
                    {formData.userPriority}
                  </span>
                </div>
              </div>
              
              <div className="confirmation-card">
                <h4>Descripción</h4>
                <p className="description-preview">{formData.description}</p>
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="confirmation-card">
                  <h4>Archivos Adjuntos</h4>
                  <div className="files-summary">
                    {formData.attachments.length} archivo(s) • {formData.attachments.reduce((total, file) => total + file.size, 0) / 1024 / 1024} MB
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
