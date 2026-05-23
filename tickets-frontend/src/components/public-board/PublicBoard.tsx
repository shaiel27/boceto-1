import React, { useEffect, useState } from 'react';
import BoardNotification from './BoardNotification';
import Clock from './Clock';
import './PublicBoard.css';
import { API_BASE_URL, SSE_BASE_URL } from '../../services/api';

interface ActiveTicket { id:number; ticket_code:string; office_name:string; technician_name?:string; priority?:string; created_at:string; elapsed_minutes?:number; }
interface Technician { id:number; name:string; status:string; status_reason?:string; active_tickets_count:number; }
interface LunchBlock { id:number; block_name:string; start_time:string; end_time:string; }

const PublicBoard: React.FC = () => {
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [lunchBlocks, setLunchBlocks] = useState<LunchBlock[]>([]);
  const [serverTime, setServerTime] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem('pb_sound') === '1');

  // Visual notification banner
  const [banner, setBanner] = useState<{ type: string; text: string } | null>(null);

  const showBanner = (type: string, text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  useEffect(() => {
    const initUrl = `${API_BASE_URL}/api/public-board?action=init`;
    console.log('[PublicBoard] Fetching init from:', initUrl);
    fetch(initUrl)
      .then(r => r.json())
      .then((payload) => {
        const data = payload.data;
        console.log('[PublicBoard] Init received:', { tickets: data.active_tickets?.length, techs: data.technicians?.length, serverTime: data.server_time });
        setActiveTickets(data.active_tickets || []);
        setTechnicians(data.technicians || []);
        setLunchBlocks(data.lunch_blocks || []);
        setServerTime(data.server_time);
      })
      .catch(err => {
        console.error('[PublicBoard] Init failed:', err);
      });
  }, []);

  useEffect(() => {
    if (!serverTime) return;

    const streamUrl = `${SSE_BASE_URL}/api/public-board?action=stream&since=${encodeURIComponent(serverTime)}`;
    console.log('[PublicBoard] Opening SSE:', streamUrl);
    const es = new EventSource(streamUrl);

    es.onopen = () => {
      console.log('[PublicBoard] SSE connected');
      setConnected(true);
    };

    es.onerror = (e) => {
      console.warn('[PublicBoard] SSE error/closed. ReadyState:', es.readyState);
      setConnected(es.readyState === EventSource.OPEN);
    };

    es.addEventListener('new_ticket', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE new_ticket:', d);
        setActiveTickets(prev => [d, ...prev].slice(0, 50));
        showBanner('new_ticket', `Nuevo ticket: ${d.ticket_code} — ${d.office_name || ''}`);
        if (soundEnabled) BoardNotification.playSound('new_ticket');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('ticket_closed', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE ticket_closed:', d);
        showBanner('ticket_closed', `Ticket cerrado: ${d.ticket_code}`);
        if (soundEnabled) BoardNotification.playSound('closed');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('lunch_started', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE lunch_started:', d);
        showBanner('lunch_started', `Almuerzo iniciado: ${d.block_name}`);
        if (soundEnabled) BoardNotification.playSound('lunch');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('lunch_ended', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE lunch_ended:', d);
        showBanner('lunch_ended', `Almuerzo finalizado: ${d.block_name}`);
      } catch (err) { console.error(err); }
    });

    es.addEventListener('assistance_request', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE assistance_request:', d);
        showBanner('assistance', `¡ASISTENCIA SOLICITADA! ${d.technician_name} — ${d.office_name || ''}`);
        if (soundEnabled) BoardNotification.playSound('assistance');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('technician_status', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE technician_status:', d);
        setTechnicians(prev => {
          const idx = prev.findIndex(p => p.id === d.id);
          if (idx === -1) return [...prev, d];
          const copy = [...prev];
          copy[idx] = {...copy[idx], ...d};
          return copy;
        });
      } catch (err) { console.error(err); }
    });

    es.addEventListener('keepalive', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE keepalive:', d.timestamp);
      } catch (err) { /* silent */ }
    });

    return () => {
      console.log('[PublicBoard] Closing SSE');
      es.close();
    };
  }, [serverTime, soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('pb_sound', next ? '1' : '0');
  };

  const statusLabel = (status: string): string => {
    const s = status?.toLowerCase() ?? '';
    if (s === 'disponible' || s === 'available') return 'Disponible';
    if (s === 'ocupado' || s === 'busy') return 'Ocupado';
    if (s === 'almuerzo' || s === 'lunch') return 'Almuerzo';
    return status || 'Desconocido';
  };

  return (
    <div className="pb-root">
      {banner && (
        <div className={`pb-banner pb-banner-${banner.type}`} key={banner.text}>
          <span className="pb-banner-text">{banner.text}</span>
        </div>
      )}
      <header className="pb-header">
        <div className="pb-title">TABLERO <span>PÚBLICO</span></div>
        <div className="pb-header-right">
          <Clock />
          <div className="pb-controls">
            <button onClick={toggleSound} title={soundEnabled ? 'Silenciar' : 'Activar sonido'}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <div className={`pb-connection ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
        </div>
      </header>

      <main className="pb-main">
        <section className="pb-tickets-section">
          <h2>TICKETS EN PROCESO</h2>
          {activeTickets.length === 0 && (
            <p className="pb-empty">No hay tickets activos en este momento.</p>
          )}
          {activeTickets.map(t => (
            <article key={t.id} className={`pb-ticket-card priority-${(t.priority||'baja').toLowerCase()}`}>
              <div className="pb-ticket-header">
                <strong>{t.ticket_code}</strong> <span className="pb-priority">{t.priority}</span>
              </div>
              <div>{t.office_name}</div>
              <div>Técnico: {t.technician_name || '(sin asignar)'}</div>
              <div>⏱ {Math.floor((t.elapsed_minutes||0)/60)}h {(t.elapsed_minutes||0)%60}m</div>
            </article>
          ))}
        </section>

        <aside className="pb-right">
          <section className="pb-technicians-section">
            <h3>TÉCNICOS</h3>
            {technicians.map(t => (
              <div key={t.id} className={`pb-technician-item pb-status-${t.status?.toLowerCase() || 'inactive'}`}>
                <div className="pb-tech-name">{t.name}</div>
                <div className="pb-tech-status">{statusLabel(t.status)}</div>
              </div>
            ))}
          </section>
        </aside>
      </main>
    </div>
  );
};

export default PublicBoard;
