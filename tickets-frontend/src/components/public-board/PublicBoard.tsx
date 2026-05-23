import React, { useEffect, useState } from 'react';
import BoardNotification from './BoardNotification';
import './PublicBoard.css';
import { API_BASE_URL } from '../../services/api';

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

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public-board?action=init`)
      .then(r => r.json())
      .then((payload) => {
        const data = payload.data;
        setActiveTickets(data.active_tickets || []);
        setTechnicians(data.technicians || []);
        setLunchBlocks(data.lunch_blocks || []);
        setServerTime(data.server_time);
      })
      .catch(err => {
        console.error('PublicBoard init failed', err);
      });
  }, []);

  useEffect(() => {
    if (!serverTime) return;
    const streamUrl = `${API_BASE_URL}/api/public-board?action=stream&since=${encodeURIComponent(serverTime)}`;
    const es = new EventSource(streamUrl);
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.addEventListener('new_ticket', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        setActiveTickets(prev => [d, ...prev].slice(0, 50));
        if (soundEnabled) BoardNotification.playSound('new_ticket');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('lunch_started', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        if (soundEnabled) BoardNotification.playSound('lunch');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('assistance_request', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        if (soundEnabled) BoardNotification.playSound('assistance');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('technician_status', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        setTechnicians(prev => {
          const idx = prev.findIndex(p => p.id === d.id);
          if (idx === -1) return [...prev, d];
          const copy = [...prev];
          copy[idx] = {...copy[idx], ...d};
          return copy;
        });
      } catch (err) { console.error(err); }
    });

    return () => {
      es.close();
    };
  }, [serverTime, soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('pb_sound', next ? '1' : '0');
  };

  return (
    <div className="pb-root" data-theme="dark">
      <header className="pb-header">
        <div className="pb-title">SISTEMA DE GESTIÓN DE TICKETS — Tablero Público</div>
        <div className="pb-controls">
          <button onClick={toggleSound}>{soundEnabled ? '🔊' : '🔇'}</button>
          <div className={`pb-connection ${connected ? 'connected' : 'disconnected'}`}>{connected ? 'Conectado' : 'Conexión'}</div>
        </div>
      </header>

      <main className="pb-main">
        <section className="pb-tickets-section">
          <h2>TICKETS EN PROCESO</h2>
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
                <div className="pb-tech-status">{t.status}</div>
              </div>
            ))}
          </section>
        </aside>
      </main>
    </div>
  );
};

export default PublicBoard;
