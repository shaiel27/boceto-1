import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import ApiService from '../../services/api';
import './AssistanceRequestModal.css';

interface AssistanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  ticketTitle: string;
  onSuccess?: (requestId: string) => void;
}

const AssistanceRequestModal: React.FC<AssistanceRequestModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketTitle,
  onSuccess
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const response = await ApiService.createAssistanceRequest(ticketId);
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Solicitud enviada correctamente');
        onSuccess?.(response.data?.request_id?.toString() || '');
        setTimeout(() => onClose(), 2000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Error al enviar solicitud');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión al solicitar asistencia');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assistance-modal-overlay" onClick={status === 'loading' ? undefined : onClose}>
      <div className="assistance-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="assistance-modal-header">
          <div className="assistance-modal-title">
            <AlertTriangle size={20} />
            <h2>Solicitar Asistencia</h2>
          </div>
          <button className="assistance-modal-close" onClick={onClose} disabled={status === 'loading'}>
            <X size={20} />
          </button>
        </div>

        <div className="assistance-modal-body">
          <div className="ticket-info">
            <h3>Ticket #{ticketId}</h3>
            <p className="ticket-title">{ticketTitle}</p>
          </div>

          {status === 'success' ? (
            <div className="assistance-success">
              <CheckCircle size={32} />
              <p>{message}</p>
            </div>
          ) : (
            <>
              <p className="assistance-desc">
                Se notificará a los administradores para que asignen un técnico de apoyo a este ticket.
              </p>

              {status === 'error' && <div className="assistance-error">{message}</div>}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onClose} disabled={status === 'loading'}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-submit urgent"
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <><div className="spinner" /> Enviando...</>
                  ) : (
                    <><Send size={16} /> Solicitar Asistencia Urgente</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistanceRequestModal;
