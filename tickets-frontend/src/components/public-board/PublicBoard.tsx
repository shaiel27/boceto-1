import React, { useEffect, useState, useRef } from 'react';
import BoardNotification from './BoardNotification';
import Clock from './Clock';
import './PublicBoard.css';
import { API_BASE_URL, SSE_BASE_URL } from '../../services/api';

interface ActiveTicket {
  id: number;
  ticket_code: string;
  subject?: string;
  office_name: string;
  technician_name?: string;
  technician_id?: number;
  has_technician?: number | boolean;
  priority?: string;
  status?: string;
  created_at: string;
  elapsed_minutes?: number;
}

interface Technician {
  id: number;
  name: string;
  status: string;
  status_reason?: string;
  active_tickets_count: number;
}

interface LunchBlock {
  id: number;
  block_name: string;
  start_time: string;
  end_time: string;
}

interface Stats {
  pending: number;
  in_progress: number;
  today_created: number;
  unassigned: number;
}

const PublicBoard: React.FC = () => {
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [lunchBlocks, setLunchBlocks] = useState<LunchBlock[]>([]);
  const [serverTime, setServerTime] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem('pb_sound') === '1');
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({ pending: 0, in_progress: 0, today_created: 0, unassigned: 0 });
  const [banner, setBanner] = useState<{ type: string; text: string } | null>(null);

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const showBanner = (type: string, text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 6000);
  };

  // ── Sound unlock on first user click ──────────────────────────────────
  const toggleSound = () => {
    if (!audioUnlocked) {
      const ok = BoardNotification.unlock();
      setAudioUnlocked(ok);
    }
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('pb_sound', next ? '1' : '0');
  };

  // ── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const initUrl = `${API_BASE_URL}/api/public-board?action=init`;
    console.log('[PublicBoard] Fetching init from:', initUrl);
    fetch(initUrl)
      .then(r => r.json())
      .then((payload) => {
        const data = payload.data;
        console.log('[PublicBoard] Init received:', {
          tickets: data.active_tickets?.length,
          techs: data.technicians?.length,
          stats: data.stats,
        });
        setActiveTickets(data.active_tickets || []);
        setTechnicians(data.technicians || []);
        setLunchBlocks(data.lunch_blocks || []);
        setStats(data.stats || { pending: 0, in_progress: 0, today_created: 0, unassigned: 0 });
        setServerTime(data.server_time);
      })
      .catch(err => {
        console.error('[PublicBoard] Init failed:', err);
      });
  }, []);

  // ── SSE stream ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!serverTime) return;

    const streamUrl = `${SSE_BASE_URL}/api/public-board?action=stream&since=${encodeURIComponent(serverTime)}`;
    console.log('[PublicBoard] Opening SSE:', streamUrl);
    const es = new EventSource(streamUrl);

    es.onopen = () => {
      console.log('[PublicBoard] SSE connected');
      setConnected(true);
    };

    es.onerror = () => {
      console.warn('[PublicBoard] SSE error/closed. ReadyState:', es.readyState);
      setConnected(es.readyState === EventSource.OPEN);
    };

    es.addEventListener('new_ticket', (e: MessageEvent) => {
      try {
        const d: ActiveTicket = JSON.parse(e.data);
        console.log('[PublicBoard] SSE new_ticket:', d.ticket_code);
        setActiveTickets(prev => [d, ...prev].slice(0, 50));
        const tag = d.has_technician ? d.ticket_code : `⚠ SIN TÉCNICO: ${d.ticket_code}`;
        showBanner('new_ticket', `Nuevo ticket: ${tag} — ${d.office_name || ''}`);
        if (soundRef.current) BoardNotification.playSound('new_ticket');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('ticket_closed', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        console.log('[PublicBoard] SSE ticket_closed:', d.ticket_code);
        showBanner('ticket_closed', `Ticket cerrado: ${d.ticket_code}`);
        if (soundRef.current) BoardNotification.playSound('closed');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('lunch_started', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        showBanner('lunch_started', `Almuerzo iniciado: ${d.block_name}`);
        if (soundRef.current) BoardNotification.playSound('lunch');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('lunch_ended', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        showBanner('lunch_ended', `Almuerzo finalizado: ${d.block_name}`);
      } catch (err) { console.error(err); }
    });

    es.addEventListener('assistance_request', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        showBanner('assistance', `¡ASISTENCIA SOLICITADA! ${d.technician_name} — ${d.office_name || ''}`);
        if (soundRef.current) BoardNotification.playSound('assistance');
      } catch (err) { console.error(err); }
    });

    es.addEventListener('technician_status', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        setTechnicians(prev => {
          const idx = prev.findIndex(p => p.id === d.id);
          if (idx === -1) return [...prev, d];
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...d };
          return copy;
        });
      } catch (err) { console.error(err); }
    });

    es.addEventListener('stats_updated', (e: MessageEvent) => {
      try {
        const d: Stats = JSON.parse(e.data);
        console.log('[PublicBoard] SSE stats_updated:', d);
        setStats(d);
      } catch (err) { console.error(err); }
    });

    es.addEventListener('keepalive', () => { /* silent */ });

    return () => {
      console.log('[PublicBoard] Closing SSE');
      es.close();
    };
  }, [serverTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────
  const statusLabel = (status: string): string => {
    const s = status?.toLowerCase() ?? '';
    if (s === 'disponible' || s === 'available') return 'Disponible';
    if (s === 'ocupado' || s === 'busy') return 'Ocupado';
    if (s === 'almuerzo' || s === 'lunch') return 'Almuerzo';
    return status || 'Inactivo';
  };

  const hasTech = (t: ActiveTicket): boolean =>
    !!(t.has_technician ?? t.technician_name ?? t.technician_id);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="pb-root">
      {banner && (
        <div className={`pb-banner pb-banner-${banner.type}`}>
          <span className="pb-banner-text">{banner.text}</span>
        </div>
      )}

      <header className="pb-header">
        <div className="pb-title">TABLERO <span>PÚBLICO</span></div>
        <div className="pb-header-right">
          <Clock />
          <div className="pb-controls">
            <button
              onClick={toggleSound}
              title={
                !audioUnlocked
                  ? 'Click para activar audio'
                  : soundEnabled
                  ? 'Silenciar'
                  : 'Activar sonido'
              }
              className={!audioUnlocked ? 'pb-btn-unlock' : ''}
            >
              {!audioUnlocked ? '🔇' : soundEnabled ? '🔊' : '🔇'}
            </button>
            <div className={`pb-connection ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <div className="pb-stats-bar">
        <div className={`pb-stat ${stats.unassigned > 0 ? 'pb-stat-alert' : ''}`}>
          <span className="pb-stat-num">{stats.unassigned}</span>
          <span className="pb-stat-label">Sin técnico</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-num">{stats.in_progress}</span>
          <span className="pb-stat-label">En proceso</span>
        </div>
        <div className={`pb-stat ${stats.pending > 0 ? 'pb-stat-warn' : ''}`}>
          <span className="pb-stat-num">{stats.pending}</span>
          <span className="pb-stat-label">Pendientes</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-num">{stats.today_created}</span>
          <span className="pb-stat-label">Hoy</span>
        </div>
      </div>

      <main className="pb-main">
        <section className="pb-tickets-section">
          <h2>TICKETS EN PROCESO</h2>
          {activeTickets.length === 0 && (
            <p className="pb-empty">No hay tickets activos en este momento.</p>
          )}
          {activeTickets.map(t => (
            <article
              key={t.id}
              className={`pb-ticket-card priority-${(t.priority || 'baja').toLowerCase()}${!hasTech(t) ? ' pb-no-tech' : ''}`}
            >
              <div className="pb-ticket-header">
                <strong>
                  {!hasTech(t) && <span className="pb-no-tech-badge" title="Sin técnico asignado">⚠</span>}
                  {t.ticket_code}
                </strong>
                <span className="pb-priority">{t.priority || 'Baja'}</span>
              </div>
              <div>{t.office_name}</div>
              <div>Técnico: {t.technician_name || <span className="pb-no-tech-text">(sin asignar)</span>}</div>
              <div className="pb-elapsed">
                ⏱ {Math.floor((t.elapsed_minutes || 0) / 60)}h {(t.elapsed_minutes || 0) % 60}m
              </div>
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
