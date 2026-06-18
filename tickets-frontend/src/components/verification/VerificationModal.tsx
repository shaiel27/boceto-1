import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, MessageSquare, ChevronRight, Lock } from 'lucide-react';
import ApiService from '../../services/api';
import './VerificationModal.css';

interface VerificationTicket {
  id: number;
  ticket_code: string;
  subject: string;
  technician_names?: string;
  resolved_at?: string;
}

interface Props {
  tickets: VerificationTicket[];
  onAllResolved: () => void;
}

const VerificationModal: React.FC<Props> = ({ tickets, onAllResolved }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<'select' | 'inconforme' | 'done'>('select');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());

  // Reset resolved IDs when tickets change (new verification session)
  const ticketIdsKey = tickets.map((t) => `${t.id}:${t.ticket_code}`).join('|');
  useEffect(() => {
    setResolvedIds(new Set());
    setCurrentIndex(0);
    setStep('select');
    setComment('');
    setError(null);
  }, [ticketIdsKey]);

  // Guard: prevent duplicate onAllResolved calls
  const calledRef = React.useRef(false);
  const doOnAllResolved = () => {
    if (!calledRef.current) {
      calledRef.current = true;
      onAllResolved();
    }
  };
  useEffect(() => {
    calledRef.current = false;
  }, [ticketIdsKey]);

  const current = tickets[currentIndex];
  if (!current) {
    if (tickets.length > 0 && tickets.every((t) => resolvedIds.has(t.id))) {
      doOnAllResolved();
    }
    return null;
  }

  const remaining = tickets.length - resolvedIds.size;

  const handleConforme = async () => {
    setSending(true);
    setError(null);
    try {
      const r = await ApiService.verifyTicket(current.id, 'conforme');
      if (r.success) {
        const next = new Set(resolvedIds);
        next.add(current.id);
        setResolvedIds(next);
        setStep('select');
        setComment('');
        const nextIndex = tickets.findIndex((t, i) => i > currentIndex && !next.has(t.id));
        if (nextIndex >= 0) {
          setCurrentIndex(nextIndex);
        } else if (next.size >= tickets.length) {
          doOnAllResolved();
        }
      } else {
        setError(r.message || 'Error al verificar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  const handleInconforme = async () => {
    if (!comment.trim()) return;
    setSending(true);
    setError(null);
    try {
      const r = await ApiService.verifyTicket(current.id, 'inconforme', comment.trim());
      if (r.success) {
        const next = new Set(resolvedIds);
        next.add(current.id);
        setResolvedIds(next);
        setStep('select');
        setComment('');
        const nextIndex = tickets.findIndex((t, i) => i > currentIndex && !next.has(t.id));
        if (nextIndex >= 0) {
          setCurrentIndex(nextIndex);
        } else if (next.size >= tickets.length) {
          doOnAllResolved();
        }
      } else {
        setError(r.message || 'Error al procesar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  if (resolvedIds.has(current.id)) {
    const nextIndex = tickets.findIndex((t, i) => i > currentIndex && !resolvedIds.has(t.id));
    if (nextIndex >= 0) setCurrentIndex(nextIndex);
    return null;
  }

  return (
    <div className="vrf-overlay">
      <div className="vrf-card">
        <div className="vrf-header">
          <div className="vrf-header-icon">
            <Lock size={16} />
          </div>
          <div>
            <h2 className="vrf-title">Verificación de Ticket</h2>
            <p className="vrf-sub">
              {remaining} {remaining === 1 ? 'ticket pendiente' : 'tickets pendientes'} de verificación
            </p>
          </div>
          <span className="vrf-counter">
            {tickets.length - remaining + 1} / {tickets.length}
          </span>
        </div>

        <div className="vrf-ticket-info">
          <div className="vrf-ticket-code">{current.ticket_code}</div>
          <div className="vrf-ticket-subject">{current.subject}</div>
          <div className="vrf-ticket-meta">
            {current.technician_names && (
              <span className="vrf-meta-item">Resuelto por: {current.technician_names}</span>
            )}
            {current.resolved_at && (
              <span className="vrf-meta-item">
                Fecha: {new Date(current.resolved_at).toLocaleDateString('es-VE', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="vrf-error">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        {step === 'select' ? (
          <div className="vrf-actions">
            <button
              className="vrf-btn vrf-btn--conforme"
              onClick={handleConforme}
              disabled={sending}
            >
              <CheckCircle size={20} />
              <span>Sí, está resuelto</span>
              {sending && <span className="vrf-spinner" />}
            </button>
            <button
              className="vrf-btn vrf-btn--inconforme"
              onClick={() => setStep('inconforme')}
              disabled={sending}
            >
              <XCircle size={20} />
              <span>No, sigue el problema</span>
            </button>
          </div>
        ) : (
          <div className="vrf-inconforme">
            <p className="vrf-inconforme-label">
              Explica qué sucedió para que el ticket sea reasignado:
            </p>
            <textarea
              className="vrf-textarea"
              placeholder="Describe el problema que persiste..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              autoFocus
              rows={3}
            />
            <div className="vrf-inconforme-actions">
              <button
                className="vrf-btn vrf-btn--back"
                onClick={() => { setStep('select'); setError(null); }}
                disabled={sending}
              >
                Volver
              </button>
              <button
                className="vrf-btn vrf-btn--send"
                onClick={handleInconforme}
                disabled={!comment.trim() || sending}
              >
                <MessageSquare size={16} />
                <span>Enviar y reasignar</span>
                {sending && <span className="vrf-spinner" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;
