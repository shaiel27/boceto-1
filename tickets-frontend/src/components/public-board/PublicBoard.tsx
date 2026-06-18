import React, { useEffect, useState, useRef, useCallback } from 'react';
import BoardNotification from './BoardNotification';
import Clock from './Clock';
import './PublicBoard.css';
import { API_BASE_URL } from '../../services/api';
import { CheckCircle, Ticket, Coffee, XCircle, AlertCircle } from 'lucide-react';

interface ActiveTicket {
  id: number;
  ticket_code: string;
  subject?: string;
  office_name: string;
  service_name?: string;
  problem_name?: string;
  technician_names?: string;
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

interface CurrentLunch {
  active: boolean;
  block: LunchBlock | null;
}

interface Stats {
  pending: number;
  in_progress: number;
  today_created: number;
  closed_today: number;
  unassigned: number;
}

interface TechnicianGroup {
  service_id: number;
  service_name: string;
  technicians: Technician[];
}

const POLL_INTERVAL_MS = 3000;

const PublicBoard: React.FC = () => {
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([]);
  const [techniciansGrouped, setTechniciansGrouped] = useState<TechnicianGroup[]>([]);
  const [lunchBlocks, setLunchBlocks] = useState<LunchBlock[]>([]);
  const [currentLunch, setCurrentLunch] = useState<CurrentLunch>({ active: false, block: null });
  const [serverTime, setServerTime] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [soundEnabled] = useState<boolean>(true);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats>({ pending: 0, in_progress: 0, today_created: 0, closed_today: 0, unassigned: 0 });
  const [banner, setBanner] = useState<{ type: string; text: string } | null>(null);

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const prevTicketIdsRef = useRef<Set<number>>(new Set());
  const prevClosedIdsRef = useRef<Set<number>>(new Set());
  const prevAssistanceIdsRef = useRef<Set<number>>(new Set());
  const prevReturnedIdsRef = useRef<Set<number>>(new Set());
  const prevStatsRef = useRef<Stats>({ pending: 0, in_progress: 0, today_created: 0, closed_today: 0, unassigned: 0 });
  /** Track which tickets are unassigned to detect when they get a tech */
  const unassignedTicketsRef = useRef<Set<number>>(new Set());
  /** Track technician names per ticket to detect additional assignments */
  const techNamesRef = useRef<Map<number, string>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showBanner = useCallback((type: string, text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 6000);
  }, []);

  // Auto-unlock audio on first user interaction
  const handleFirstClick = () => {
    BoardNotification.unlock();
  };

  useEffect(() => {
    const initUrl = `${API_BASE_URL}/api/public-board?action=init`;
    fetch(initUrl)
      .then(r => r.json())
      .then((payload) => {
        const data = payload.data;
        setActiveTickets(data.active_tickets || []);
        prevTicketIdsRef.current = new Set((data.active_tickets || []).map((t: ActiveTicket) => t.id));
        unassignedTicketsRef.current = new Set(
          (data.active_tickets || [])
            .filter((t: ActiveTicket) => !(t.has_technician ?? t.technician_names))
            .map((t: ActiveTicket) => t.id)
        );
        const namesMap = new Map<number, string>();
        (data.active_tickets || []).forEach((t: ActiveTicket) => {
          if (t.technician_names) namesMap.set(t.id, t.technician_names);
        });
        techNamesRef.current = namesMap;
        setTechniciansGrouped(data.technicians_grouped || []);
        setLunchBlocks(data.lunch_blocks || []);
        setCurrentLunch(data.current_lunch || { active: false, block: null });
        setStats(data.stats || { pending: 0, in_progress: 0, today_created: 0, closed_today: 0, unassigned: 0 });
        prevStatsRef.current = data.stats || { pending: 0, in_progress: 0, today_created: 0, closed_today: 0, unassigned: 0 };
        setServerTime(data.server_time);
        setConnected(true);
      })
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    if (!serverTime) return;

    const poll = () => {
      const pollUrl = `${API_BASE_URL}/api/public-board?action=poll&since=${encodeURIComponent(serverTime)}`;
      fetch(pollUrl)
        .then(r => r.json())
        .then((payload) => {
          if (!payload.success) return;
          const data = payload.data;
          if (!data) return;

          setConnected(true);

          const newServerTime = data.server_time;
          if (newServerTime) setServerTime(newServerTime);

          const incoming = (data.new_tickets || []) as ActiveTicket[];
          if (incoming.length > 0) {
            for (const t of incoming) {
              if (!prevTicketIdsRef.current.has(t.id)) {
                prevTicketIdsRef.current.add(t.id);
                if (!(t.has_technician ?? t.technician_names)) {
                  unassignedTicketsRef.current.add(t.id);
                } else if (t.technician_names) {
                  techNamesRef.current.set(t.id, t.technician_names);
                }
                const tag = t.has_technician ? t.ticket_code : `⚠ SIN TÉCNICO: ${t.ticket_code}`;
                showBanner('new_ticket', `Nuevo: ${tag} — ${t.office_name || ''}`);
                if (soundRef.current) BoardNotification.playSound('new_ticket');
              }
            }
            setActiveTickets(prev => {
              const existingMap = new Map(prev.map(t => [t.id, t]));
              for (const t of incoming) existingMap.set(t.id, t);
              return Array.from(existingMap.values())
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 50);
            });
          }

          const updated = (data.updated_tickets || []) as ActiveTicket[];
          if (updated.length > 0) {
            for (const t of updated) {
              const wasUnassigned = unassignedTicketsRef.current.has(t.id);
              const nowHasTech = !!(t.has_technician ?? t.technician_names);
              const prevNames = techNamesRef.current.get(t.id) || '';
              const newNames = t.technician_names || '';
              if (wasUnassigned && nowHasTech) {
                unassignedTicketsRef.current.delete(t.id);
                showBanner(
                  'new_ticket',
                  `Asignado: ${t.ticket_code || '#' + t.id} → ${newNames}`
                );
                if (soundRef.current) BoardNotification.playSound('new_ticket');
              } else if (nowHasTech && prevNames !== newNames && prevNames !== '') {
                showBanner(
                  'new_ticket',
                  `Más técnicos: ${t.ticket_code || '#' + t.id} — ${newNames}`
                );
                if (soundRef.current) BoardNotification.playSound('new_ticket');
              }
              if (newNames) techNamesRef.current.set(t.id, newNames);

              // Detect returned tickets (inconformity)
              const isReturned = (t as any).is_returned === 1 || (t as any).is_returned === '1';
              if (isReturned && !prevReturnedIdsRef.current.has(t.id)) {
                prevReturnedIdsRef.current.add(t.id);
                showBanner('returned', `INCONFORMIDAD: ${t.ticket_code || '#' + t.id} — ${t.office_name || ''}`);
                if (soundRef.current) {
                  BoardNotification.playSound('returned');
                  setTimeout(() => BoardNotification.playSound('returned'), 1200);
                }
              }
            }
            setActiveTickets(prev => {
              const existingMap = new Map(prev.map(t => [t.id, t]));
              for (const t of updated) existingMap.set(t.id, t);
              return Array.from(existingMap.values())
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 50);
            });
          }

          const closed = (data.closed_tickets || []) as any[];
          if (closed.length > 0) {
            for (const c of closed) {
              if (!prevClosedIdsRef.current.has(c.ticket_id)) {
                prevClosedIdsRef.current.add(c.ticket_id);
                techNamesRef.current.delete(c.ticket_id);
                showBanner('ticket_closed', `Cerrado: ${c.ticket_code}`);
                if (soundRef.current) BoardNotification.playSound('closed');
              }
            }
            const closedIds = new Set(closed.map((c: any) => c.ticket_id));
            setActiveTickets(prev => prev.filter(t => !closedIds.has(t.id)));
          }

          const assistances = (data.new_assistance || []) as any[];
          if (assistances.length > 0) {
            for (const a of assistances) {
              if (!prevAssistanceIdsRef.current.has(a.id)) {
                prevAssistanceIdsRef.current.add(a.id);
                showBanner('assistance', `¡ASISTENCIA! ${a.technician_name} — ${a.office_name || ''}`);
                if (soundRef.current) BoardNotification.playSound('assistance');
              }
            }
          }

          if (data.technicians_grouped) setTechniciansGrouped(data.technicians_grouped);

          if (data.current_lunch) setCurrentLunch(data.current_lunch);

          if (data.stats) {
            const newStats = data.stats as Stats;
            const prev = prevStatsRef.current;
            if (newStats.unassigned > prev.unassigned) {
              showBanner('stats', `¡Sin técnico: ${newStats.unassigned}`);
            }
            prevStatsRef.current = newStats;
            setStats(newStats);
          }
        })
        .catch(() => setConnected(false));
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    }, [serverTime, showBanner]);

  const hasTech = (t: ActiveTicket): boolean =>
    !!(t.has_technician ?? t.technician_names);

  const formatCreatedAt = (createdAt: string | undefined): string => {
    if (!createdAt) return '--:--';
    try {
      const d = new Date(createdAt.replace(' ', 'T'));
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return '--:--'; }
  };

  const priorityClass = (p: string | undefined): string => {
    const s = (p || '').toLowerCase();
    if (s === 'crítica' || s === 'critica') return 'critica';
    if (s === 'alta') return 'alta';
    if (s === 'media') return 'media';
    return 'baja';
  };

  const shortPriority = (p: string | undefined): string => {
    const s = (p || '').toLowerCase();
    if (s === 'crítica' || s === 'critica') return 'CRT';
    if (s === 'alta') return 'ALT';
    if (s === 'media') return 'MED';
    return 'BAJ';
  };

  return (
    <div className="pb-root" onClick={handleFirstClick}>
      {banner && (
        <div className={`pb-banner pb-banner-${banner.type}`}>
          <span className="pb-banner-text">{banner.text}</span>
        </div>
      )}

      <header className="pb-topbar">
        <div className="pb-topbar-left">
          <img
            className="pb-logo"
            src="/SC-1-Photoroom.png"
            alt="Alcaldía de San Cristóbal"
          />
          <div className={`pb-dot ${connected ? 'pb-dot-live' : 'pb-dot-dead'}`} />
        </div>

        <div className="pb-stats-strip">
          <div className="pb-stat-chip">
            <span className="pb-chip-num">{stats.in_progress}</span>
            <span className="pb-chip-lbl">En proceso</span>
          </div>
          <div className={`pb-stat-chip ${stats.pending > 0 ? 'pb-chip-warn' : ''}`}>
            <span className="pb-chip-num">{stats.pending}</span>
            <span className="pb-chip-lbl">Pendientes</span>
          </div>
          <div className="pb-stat-chip">
            <span className="pb-chip-num">{stats.today_created}</span>
            <span className="pb-chip-lbl">Creados hoy</span>
          </div>
          <div className="pb-stat-chip">
            <span className="pb-chip-num">{stats.closed_today}</span>
            <span className="pb-chip-lbl">Cerrados hoy</span>
          </div>
        </div>

        <div className="pb-topbar-right">
          <Clock />
        </div>
      </header>

      <div className="pb-body">
        <section className="pb-tickets-grid">
          {activeTickets.length === 0 && (
            <p className="pb-empty">No hay tickets activos en este momento</p>
          )}
          {activeTickets.map(t => (
            <article
              key={t.id}
              className={`pb-ticket priority-${priorityClass(t.priority)}${!hasTech(t) ? ' no-tech' : ''}${(t as any).is_returned ? ' returned' : ''}`}
            >
              <div className="pb-ticket-left">
                <span className="pb-ticket-code">
                  {!hasTech(t) && <span className="pb-no-tech-dot" />}
                  {t.ticket_code || `#${t.id}`}
                </span>
                {t.service_name && (
                  <span className="pb-ticket-service">{t.service_name}</span>
                )}
              </div>
              <div className="pb-ticket-mid">
                <span className="pb-ticket-office">{t.office_name}</span>
                {t.problem_name && (
                  <span className="pb-ticket-problem">{t.problem_name}</span>
                )}
                {t.technician_names && (
                  <span className="pb-ticket-tech">{t.technician_names}</span>
                )}
              </div>
              <div className="pb-ticket-right">
                <span className={`pb-pill ${priorityClass(t.priority)}`}>
                  {shortPriority(t.priority)}
                </span>
                <span className="pb-ticket-time">{formatCreatedAt(t.created_at)}</span>
              </div>
            </article>
          ))}
        </section>

        <aside className="pb-tech-panel">
          <div className="pb-tech-header">
            <span>TÉCNICOS</span>
            <span className="pb-tech-count">{techniciansGrouped.reduce((s, g) => s + g.technicians.length, 0)}</span>
          </div>
          <div className="pb-tech-list">
            {techniciansGrouped.map(group => (
              <div key={group.service_id} className="pb-tech-group">
                <div className="pb-tech-group-name">{group.service_name}</div>
                {group.technicians.map(t => {
                  const isOcupado = t.status?.toLowerCase() === 'ocupado' || t.status?.toLowerCase() === 'busy';
                  const isAlmuerzo = t.status?.toLowerCase() === 'almuerzo' || t.status?.toLowerCase() === 'lunch';
                  const isDisponible = t.status?.toLowerCase() === 'disponible' || t.status?.toLowerCase() === 'available';
                  const isInactivo = !isOcupado && !isAlmuerzo && !isDisponible;
                  const hasTickets = t.active_tickets_count > 0;

                  let StatusIcon: React.ElementType;
                  let orbClass: string;
                  if (isDisponible) { StatusIcon = CheckCircle; orbClass = 'disponible'; }
                  else if (isAlmuerzo) { StatusIcon = Coffee; orbClass = 'almuerzo'; }
                  else if (isOcupado && hasTickets) { StatusIcon = Ticket; orbClass = 'ocupado'; }
                  else if (isOcupado) { StatusIcon = AlertCircle; orbClass = 'ocupado'; }
                  else { StatusIcon = XCircle; orbClass = 'inactivo'; }

                  return (
                  <div
                    key={t.id}
                    className={`pb-tech-row ${orbClass}`}
                  >
                    <span className={`pb-tech-orb ${orbClass}`}>
                      <StatusIcon size={14} strokeWidth={2.5} />
                    </span>
                    <span className="pb-tech-name">
                      {t.name}
                    </span>
                    {hasTickets && isOcupado && (
                      <span className="pb-tech-badge">{t.active_tickets_count}</span>
                    )}
                  </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {currentLunch.active && currentLunch.block && (
        <footer className="pb-footer">
          <span className="pb-footer-dot" />
          <span className="pb-footer-text">
            Almuerzo activo: <strong>{currentLunch.block.block_name}</strong>
            {' '}({currentLunch.block.start_time} – {currentLunch.block.end_time})
          </span>
        </footer>
      )}
    </div>
  );
};

export default PublicBoard;
