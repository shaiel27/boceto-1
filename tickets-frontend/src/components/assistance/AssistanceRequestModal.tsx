import React, { useState } from 'react';
import { X, Send, AlertTriangle, Clock, Users } from 'lucide-react';
import ApiService from '../../services/api';
import './AssistanceRequestModal.css';

interface AssistanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  ticketTitle: string;
  onSuccess?: (requestId: string) => void;
}

interface RequestData {
  reason: string;
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  required_skills: string[];
}

const AssistanceRequestModal: React.FC<AssistanceRequestModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketTitle,
  onSuccess
}) => {
  const [requestData, setRequestData] = useState<RequestData>({
    reason: '',
    priority: 'MEDIA',
    required_skills: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const availableSkills = [
    'Redes',
    'Configuración VPN',
    'Base de datos',
    'SQL',
    'Hardware',
    'Software',
    'Impresoras',
    'Migración',
    'Seguridad',
    'Programación',
    'Sistemas operativos',
    'Correo electrónico'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestData.reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await ApiService.createAssistanceRequest(ticketId, requestData);
      
      if (response.success) {
        onSuccess?.(response.data?.request_id);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating assistance request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRequestData({
      reason: '',
      priority: 'MEDIA',
      required_skills: []
    });
    setSkillInput('');
    onClose();
  };

  const addSkill = (skill: string) => {
    if (!requestData.required_skills.includes(skill)) {
      setRequestData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequestData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      addSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRÍTICA': return '#ef4444';
      case 'ALTA': return '#f97316';
      case 'MEDIA': return '#eab308';
      case 'BAJA': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRÍTICA':
      case 'ALTA':
        return <AlertTriangle size={16} />;
      case 'MEDIA':
        return <Clock size={16} />;
      case 'BAJA':
        return <Users size={16} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assistance-modal-overlay">
      <div className="assistance-modal-container">
        <div className="assistance-modal-header">
          <div className="assistance-modal-title">
            <AlertTriangle className="assistance-icon" />
            <h2>Solicitar Asistencia Técnica</h2>
          </div>
          <button 
            className="assistance-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="assistance-modal-body">
          <div className="ticket-info">
            <h3>Ticket Referencia</h3>
            <div className="ticket-details">
              <span className="ticket-id">#{ticketId}</span>
              <span className="ticket-title">{ticketTitle}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="assistance-form">
            <div className="form-group">
              <label htmlFor="reason">
                <AlertTriangle size={16} />
                Motivo de la solicitud *
              </label>
              <textarea
                id="reason"
                value={requestData.reason}
                onChange={(e) => setRequestData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Describe detalladamente por qué necesitas asistencia..."
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>
                <Clock size={16} />
                Prioridad de la asistencia
              </label>
              <div className="priority-options">
                {(['BAJA', 'MEDIA', 'ALTA', 'CRÍTICA'] as const).map(priority => (
                  <button
                    key={priority}
                    type="button"
                    className={`priority-button ${requestData.priority === priority ? 'active' : ''}`}
                    onClick={() => setRequestData(prev => ({ ...prev, priority }))}
                    disabled={isSubmitting}
                    style={{
                      borderColor: getPriorityColor(priority),
                      backgroundColor: requestData.priority === priority ? getPriorityColor(priority) : 'transparent'
                    }}
                  >
                    {getPriorityIcon(priority)}
                    <span>{priority}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <Users size={16} />
                Habilidades requeridas
              </label>
              <div className="skills-input-container">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillInputKeyPress}
                  placeholder="Escribe una habilidad y presiona Enter..."
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="available-skills">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`skill-chip ${requestData.required_skills.includes(skill) ? 'selected' : ''}`}
                    onClick={() => addSkill(skill)}
                    disabled={isSubmitting || requestData.required_skills.includes(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {requestData.required_skills.length > 0 && (
                <div className="selected-skills">
                  <h4>Habilidades seleccionadas:</h4>
                  <div className="skills-list">
                    {requestData.required_skills.map(skill => (
                      <div key={skill} className="selected-skill">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          disabled={isSubmitting}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting || !requestData.reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistanceRequestModal;
