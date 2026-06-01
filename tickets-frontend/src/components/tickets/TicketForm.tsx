import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { sileo } from 'sileo';
import './TicketForm.css';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../layout/Header';

const OTHER_PROBLEM_ID = '-1';

interface TicketFormData {
  subject: string;
  description: string;
  propertyNumber: string;
  fkOffice: string;
  fkTiService: string;
  fkProblemCatalog: string;
  newProblemName: string;
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
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    description: '',
    propertyNumber: '',
    fkOffice: '',
    fkTiService: '',
    fkProblemCatalog: '',
    newProblemName: '',
    fkSoftwareSystem: '',
    attachments: []
  });

  // Load offices from backend
  const [offices, setOffices] = useState<any[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [officeSearchTerm, setOfficeSearchTerm] = useState('');

  // Filter offices based on search term
  const filteredOffices = offices.filter(office =>
    office.name.toLowerCase().includes(officeSearchTerm.toLowerCase()) ||
    office.type.toLowerCase().includes(officeSearchTerm.toLowerCase())
  );

  // Fetch offices on component mount
  useEffect(() => {
    const fetchOffices = async () => {
      setLoadingOffices(true);
      try {
        const response = await ApiService.getOffices();
        if (response.success && response.data) {
          const formattedOffices = response.data.map((office: any) => ({
            id: office.ID_Office?.toString() || office.id?.toString(),
            name: office.Name_Office || office.Office_Name || office.name,
            type: office.Office_Type || office.Office_Type || office.type || 'Direction'
          }));
          setOffices(formattedOffices);
        }
      } catch (error) {
        console.error('Error loading offices:', error);
      } finally {
        setLoadingOffices(false);
      }
    };

    fetchOffices();
  }, []);

  // Auto-fill office based on user role - execute after offices are loaded
  useEffect(() => {
    if (user && user.role !== 1 && user.office_id && offices.length > 0) {
      const officeIdStr = user.office_id.toString();
      setFormData(prev => ({ ...prev, fkOffice: officeIdStr }));
    }
  }, [user, offices]);

  // Catálogo de problemas por tipo de servicio
  const [problemsCatalog, setProblemsCatalog] = useState<ProblemCatalog[]>([]);
  const [softwareSystems, setSoftwareSystems] = useState<SoftwareSystem[]>([]);

  // Cargar problemas según tipo de servicio seleccionado
  useEffect(() => {
    const loadProblemsAndSystems = async () => {
      if (formData.fkTiService) {
        try {
          // Cargar problemas desde la API
          const problemsResponse = await ApiService.getProblems(parseInt(formData.fkTiService));
          if (problemsResponse.success && problemsResponse.data) {
            const problems: ProblemCatalog[] = problemsResponse.data.map((p: any) => ({
              id: p.ID_Problem_Catalog?.toString() || p.id?.toString(),
              name: p.Problem_Name || p.name,
              typicalDescription: p.Typical_Description || p.typicalDescription,
              estimatedSeverity: p.Estimated_Severity || p.estimatedSeverity || 'Media'
            }));
            setProblemsCatalog(problems);
          }

          // Cargar sistemas de software si el tipo de servicio es Programación (ID 3)
          if (formData.fkTiService === '3') {
            const systemsResponse = await ApiService.getSystems();
            if (systemsResponse.success && systemsResponse.data) {
              const systems: SoftwareSystem[] = systemsResponse.data.map((s: any) => ({
                id: s.ID_System?.toString() || s.id?.toString(),
                name: s.System_Name || s.name,
                description: s.Description || s.description
              }));
              setSoftwareSystems(systems);
            }
          } else {
            setSoftwareSystems([]);
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
          // Fallback a datos mock si falla la API
          const mockProblems: ProblemCatalog[] = [
            {
              id: '1',
              name: 'Sin conexión a internet',
              typicalDescription: 'No puedo acceder a internet o la conexión es muy lenta',
              estimatedSeverity: 'Alta'
            }
          ];
          setProblemsCatalog(mockProblems);
        }
      } else {
        setProblemsCatalog([]);
        setSoftwareSystems([]);
      }
    };

    loadProblemsAndSystems();
  }, [formData.fkTiService]);

  const [tiServices] = useState([
    { id: '1', name: 'Redes', description: 'Problemas de conectividad' },
    { id: '2', name: 'Soporte', description: 'Hardware y mantenimiento' },
    { id: '3', name: 'Programación', description: 'Desarrollo de software' }
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
      if (formData.fkTiService === '3' && !formData.fkSoftwareSystem) {
        newErrors.fkSoftwareSystem = 'Debe seleccionar un sistema de software para Programación';
      }
    }

    if (step === 1) {
      // Paso 2: Selección de problema del catálogo
      if (!formData.fkProblemCatalog) {
        newErrors.fkProblemCatalog = 'Debe seleccionar un problema del catálogo';
      } else if (formData.fkProblemCatalog === OTHER_PROBLEM_ID && !formData.newProblemName.trim()) {
        newErrors.newProblemName = 'Describa el problema que está experimentando';
      }
    }

    if (step === 2) {
      // Paso 3: Detalles del problema
      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProblemSelect = (problemId: string) => {
    setFormData(prev => ({
      ...prev,
      fkProblemCatalog: problemId,
      newProblemName: problemId === OTHER_PROBLEM_ID ? prev.newProblemName : ''
    }));
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
      // Calcular prioridad del sistema basada en el problema seleccionado
      const isOther = formData.fkProblemCatalog === OTHER_PROBLEM_ID;
      const selectedProblem = isOther ? null : problemsCatalog.find(p => p.id === formData.fkProblemCatalog);
      const systemPriority = selectedProblem?.estimatedSeverity || 'Media';

      // Preparar datos del ticket para enviar al backend
      const ticketData: Record<string, any> = {
        Subject: formData.subject,
        Description: formData.description,
        Property_Number: formData.propertyNumber,
        Fk_Office: parseInt(formData.fkOffice),
        Fk_TI_Service: parseInt(formData.fkTiService),
        Fk_Software_System: formData.fkSoftwareSystem ? parseInt(formData.fkSoftwareSystem) : null,
        System_Priority: systemPriority
      };

      // Si seleccionó "Otro", envía el nombre personalizado; si no, envía el ID del catálogo
      if (isOther) {
        ticketData.New_Problem_Name = formData.newProblemName.trim();
      } else {
        ticketData.Fk_Problem_Catalog = parseInt(formData.fkProblemCatalog);
      }

      // Enviar ticket al backend
      const response = await ApiService.createTicket(ticketData);

      if (response.success) {
        setSubmitStatus('success');

        const ticketId = response.data?.ticket_id;
        let filesUploaded = 0;

        if (ticketId && formData.attachments.length > 0) {
          const uploadResponse = await ApiService.uploadTicketFiles(ticketId, formData.attachments);
          if (uploadResponse.success) {
            filesUploaded = uploadResponse.data?.files?.length || 0;
          }
        }

        // Guardar datos del ticket creado para mostrar en el resumen
        const officeName = offices.find(o => o.id === formData.fkOffice)?.name || 'No asignado';
        const serviceName = tiServices.find(s => s.id === formData.fkTiService)?.name || 'No asignado';
        const problemName = isOther
          ? formData.newProblemName.trim()
          : (problemsCatalog.find(p => p.id === formData.fkProblemCatalog)?.name || 'No asignado');

        // Get technician info from backend response
        const technicianAssigned = response.data?.technician_assigned || false;
        const technicianName = response.data?.technician_name || null;

        setCreatedTicket({
          subject: formData.subject,
          description: formData.description,
          propertyNumber: formData.propertyNumber,
          officeName: officeName,
          serviceName: serviceName,
          problemName: problemName,
          priority: systemPriority,
          technicianAssigned: technicianAssigned,
          technicianName: technicianName,
          filesUploaded: filesUploaded
        });

        // Show Sileo notification with ticket details including technician
        const notificationDescription = technicianAssigned
          ? `Técnico: ${technicianName}\nServicio: ${serviceName}\nOficina: ${officeName}\nPrioridad: ${systemPriority}${filesUploaded > 0 ? '\nArchivos: ' + filesUploaded : ''}`
          : `Servicio: ${serviceName}\nOficina: ${officeName}\nPrioridad: ${systemPriority}\n\nPendiente de asignación de técnico${filesUploaded > 0 ? '\nArchivos adjuntos: ' + filesUploaded : ''}`;

        sileo.success({
          title: technicianAssigned ? '¡Ticket Creado y Técnico Asignado!' : '¡Ticket Creado Exitosamente!',
          description: notificationDescription,
          duration: 6000,
        });

        setTimeout(() => {
          setFormData({
            subject: '',
            description: '',
            propertyNumber: '',
            fkOffice: '',
            fkTiService: '',
            fkProblemCatalog: '',
            newProblemName: '',
            fkSoftwareSystem: '',
            attachments: []
          });
          setCurrentStep(0);
          setSubmitStatus('idle');
          setCreatedTicket(null);
          setProblemsCatalog([]);
          setSoftwareSystems([]);
        }, 5000);
      } else {
        setSubmitStatus('error');
        console.error('Error al crear ticket:', response.message);
      }

    } catch (error) {
      setSubmitStatus('error');
      console.error('Error al enviar ticket:', error);
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
                {isAdmin() && (
                  <div className="input-with-icon" style={{ marginBottom: '10px' }}>
                    <Building size={18} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Buscar oficina por nombre o tipo..."
                      value={officeSearchTerm}
                      onChange={(e) => setOfficeSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                <div className="input-with-icon">
                  <Building size={18} />
                  {loadingOffices ? (
                    <select className="form-input" disabled>
                      <option>Cargando oficinas...</option>
                    </select>
                  ) : (
                    <select
                      className={`form-input ${errors.fkOffice ? 'error' : ''} ${formData.fkOffice ? 'auto-filled' : ''}`}
                      value={formData.fkOffice}
                      onChange={(e) => setFormData(prev => ({ ...prev, fkOffice: e.target.value }))}
                      disabled={!!(user && user.role !== 1)}
                    >
                      <option value="">Selecciona tu oficina</option>
                      {(isAdmin() ? filteredOffices : offices).map(office => (
                        <option key={office.id} value={office.id}>
                          {office.name} ({office.type})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {formData.fkOffice && user && user.role !== 1 && (
                  <small className="info-message success">✓ Oficina asignada automáticamente: {offices.find(o => o.id === formData.fkOffice)?.name}</small>
                )}
                {user && user.role !== 1 && !formData.fkOffice && (
                  <small className="info-message">Oficina asignada automáticamente según tu rol</small>
                )}
                {isAdmin() && filteredOffices.length === 0 && officeSearchTerm && (
                  <small className="info-message">No se encontraron oficinas con ese criterio</small>
                )}
                {errors.fkOffice && <span className="error-message">{errors.fkOffice}</span>}
              </div>
            </div>

            {formData.fkTiService === '3' && (
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
                        onChange={(e) => handleProblemSelect(e.target.value)}
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
                  {/* Opción "Otro" */}
                  <label
                    className={`problem-card problem-card-other ${formData.fkProblemCatalog === OTHER_PROBLEM_ID ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="problemCatalog"
                      value={OTHER_PROBLEM_ID}
                      checked={formData.fkProblemCatalog === OTHER_PROBLEM_ID}
                      onChange={(e) => handleProblemSelect(e.target.value)}
                    />
                    <div className="problem-content">
                      <div className="problem-header">
                        <span className="problem-name">Otro</span>
                        <span className="severity-badge media">Media</span>
                      </div>
                      <p className="problem-description">El problema no está en la lista. Especifica el problema manualmente.</p>
                    </div>
                  </label>
                  {formData.fkProblemCatalog === OTHER_PROBLEM_ID && (
                    <div className="other-problem-input">
                      <label>
                        Describe el problema *
                      </label>
                      <input
                        type="text"
                        className={`form-input ${errors.newProblemName ? 'error' : ''}`}
                        value={formData.newProblemName}
                        onChange={(e) => setFormData(prev => ({ ...prev, newProblemName: e.target.value }))}
                        placeholder="Escribe el problema que estás experimentando..."
                        maxLength={200}
                        autoFocus
                      />
                      {errors.newProblemName && <span className="error-message">{errors.newProblemName}</span>}
                    </div>
                  )}
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
                  <span>{formData.fkProblemCatalog === OTHER_PROBLEM_ID ? formData.newProblemName.trim() : (problemsCatalog.find(p => p.id === formData.fkProblemCatalog)?.name || '—')}</span>
                </div>
                <div className="confirmation-item">
                  <span>Prioridad del Sistema:</span>
                  <span className={`priority-badge ${formData.fkProblemCatalog === OTHER_PROBLEM_ID ? 'media' : (problemsCatalog.find(p => p.id === formData.fkProblemCatalog)?.estimatedSeverity?.toLowerCase() || 'media')}`}>
                    {formData.fkProblemCatalog === OTHER_PROBLEM_ID ? 'Media' : (problemsCatalog.find(p => p.id === formData.fkProblemCatalog)?.estimatedSeverity || 'Media')}
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

              {formData.fkTiService === '3' && (
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

              {createdTicket && createdTicket.technicianAssigned && (
                <div className="confirmation-card" style={{ border: '2px solid #10b981', backgroundColor: '#f0fdf4' }}>
                  <h4 style={{ color: '#10b981' }}>✓ Técnico Asignado</h4>
                  <div className="confirmation-item">
                    <span>Técnico:</span>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>{createdTicket.technicianName}</span>
                  </div>
                </div>
              )}

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
    <>
      <Header />
      <div className="tkt">
      {submitStatus === 'success' && createdTicket && (
        <div className="tkt-done-overlay">
          <div className="tkt-done-card">
            <div className="tkt-done-icon">
              <CheckCircle size={52} />
            </div>
            <h2 className="tkt-done-title">Ticket Creado</h2>
            <p className="tkt-done-sub">La solicitud fue registrada exitosamente</p>
            <div className="tkt-done-grid">
              <div className="tkt-done-row"><span>Asunto</span><strong>{createdTicket.subject}</strong></div>
              <div className="tkt-done-row"><span>Servicio</span><strong>{createdTicket.serviceName}</strong></div>
              <div className="tkt-done-row"><span>Oficina</span><strong>{createdTicket.officeName}</strong></div>
              <div className="tkt-done-row"><span>Prioridad</span><span className={`tkt-p-badge ${createdTicket.priority.toLowerCase()}`}>{createdTicket.priority}</span></div>
              {createdTicket.technicianAssigned && (
                <div className="tkt-done-row"><span>Técnico</span><strong>{createdTicket.technicianName}</strong></div>
              )}
              {createdTicket.filesUploaded > 0 && (
                <div className="tkt-done-row"><span>Archivos</span><strong>{createdTicket.filesUploaded} adjunto(s)</strong></div>
              )}
            </div>
            <p className="tkt-done-msg">Redirigiendo al dashboard...</p>
            <button className="tkt-btn tkt-btn--pri" onClick={() => navigate('/')}>Ir al Dashboard</button>
          </div>
        </div>
      )}

      <div className="tkt-inner">
        <div className="tkt-top">
          <button className="tkt-top-back" onClick={() => navigate('/')}>
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>
          <div className="tkt-top-mid">
            <h1 className="tkt-top-title">Nuevo Ticket</h1>
            <p className="tkt-top-desc">Solicitud de servicio técnico</p>
          </div>
          <div className="tkt-top-step">Paso {currentStep + 1} / {formSteps.length}</div>
        </div>

        <div className="tkt-body">
          <div className="tkt-side">
            {formSteps.map((step, index) => {
              const done = index < currentStep;
              const cur = index === currentStep;
              return (
                <div key={step.id} className={`tkt-si ${done ? 'done' : ''} ${cur ? 'cur' : ''}`} onClick={() => handleStepClick(step.id)}>
                  <div className="tkt-si-num">{done ? <Check size={12} /> : index + 1}</div>
                  <div className="tkt-si-txt">
                    <span className="tkt-si-title">{step.title}</span>
                    <span className="tkt-si-sub">{step.description}</span>
                  </div>
                  {index < formSteps.length - 1 && <div className={`tkt-si-line ${done ? 'done' : ''}`} />}
                </div>
              );
            })}
          </div>

          <div className="tkt-main">
            {submitStatus === 'success' && createdTicket ? null : (
              <form onSubmit={handleSubmit} className="tkt-form">
                <div className="tkt-step-label">
                  <span className="tkt-step-badge">{currentStep + 1}</span>
                  <span className="tkt-step-name">{formSteps[currentStep].title}</span>
                </div>

                {renderStepContent()}

                <div className="tkt-nav">
                  <div className="tkt-nav-l">
                    {currentStep > 0 && (
                      <button type="button" className="tkt-btn tkt-btn--sec" onClick={handlePrevious} disabled={isSubmitting}>
                        <ArrowLeft size={15} />
                        Anterior
                      </button>
                    )}
                  </div>
                  <div className="tkt-nav-r">
                    {currentStep < formSteps.length - 1 ? (
                      <button type="button" className="tkt-btn tkt-btn--pri" onClick={handleNext} disabled={isSubmitting}>
                        Siguiente
                        <ArrowRight size={15} />
                      </button>
                    ) : (
                      <button type="submit" className="tkt-btn tkt-btn--pri" disabled={isSubmitting || submitStatus === 'success'}>
                        {isSubmitting ? (
                          <><span className="tkt-spin" /> Enviando...</>
                        ) : (
                          <><Send size={15} /> Crear Ticket</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {submitStatus === 'error' && (
                  <div className="tkt-err">
                    <AlertCircle size={18} />
                    <div className="tkt-err-body">
                      <strong>Error al crear ticket</strong>
                      <p>Intenta nuevamente o contacta al administrador.</p>
                    </div>
                    <button type="button" className="tkt-btn tkt-btn--sec" onClick={() => setSubmitStatus('idle')}><X size={14} /></button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default TicketForm;
