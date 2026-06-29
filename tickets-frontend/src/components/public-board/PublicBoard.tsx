import React, { useEffect, useState, useRef, useCallback } from 'react';
import BoardNotification from './BoardNotification';
import Clock from './Clock';
import './PublicBoard.css';
import { API_BASE_URL } from '../../services/api';
import { CheckCircle, Ticket, Coffee, XCircle, AlertCircle, Clock as ClockIcon, UserX } from 'lucide-react';

interface ActiveTicket {
  id: number;
  ticket_code: string;
  subject?: string;
  office_name: string;
  service_id?: number;
  service_name?: string;
  problem_name?: string;
  technician_names?: string;
  has_technician?: number | boolean;
  is_returned?: number | boolean;
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
  Fk_Lunch_Block?: number;
  Block_Name?: string;
  Start_Time?: string;
  End_Time?: string;
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
  returned: number;
  unassigned: number;
  pending_assistance?: number;
}

interface AssistanceRequest {
  id: number;
  ticket_code: string;
  technician_name: string;
  office_name: string;
  requested_at: string;
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
  const [stats, setStats] = useState<Stats>({ pending: 0, in_progress: 0, today_created: 0, closed_today: 0, returned: 0, unassigned: 0, pending_assistance: 0 });
  const [pendingAssistance, setPendingAssistance] = useState<AssistanceRequest[]>([]);
  const [banner, setBanner] = useState<{ type: string; text: string } | null>(null);

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const prevTicketIdsRef = useRef<Set<number>>(new Set());
  const prevClosedIdsRef = useRef<Set<number>>(new Set());
  const prevAssistanceIdsRef = useRef<Set<number>>(new Set());
  const prevReturnedIdsRef = useRef<Set<number>>(new Set());
  const prevStatsRef = useRef<Stats>({ pending: 0, in_progress: 0, today_created: 0, closed_today: 0, returned: 0, unassigned: 0 });
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
            .filter((t: ActiveTicket) => !(t.has_technician || t.technician_names))
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
        setStats(data.stats || { pending: 0, in_progress: 0, today_created: 0, closed_today: 0, returned: 0, unassigned: 0, pending_assistance: 0 });
        prevStatsRef.current = data.stats || { pending: 0, in_progress: 0, today_created: 0, closed_today: 0, returned: 0, unassigned: 0, pending_assistance: 0 };
        setPendingAssistance(data.pending_assistance || []);
        prevAssistanceIdsRef.current = new Set((data.pending_assistance || []).map((a: AssistanceRequest) => a.id));
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
                if (!(t.has_technician || t.technician_names)) {
                  unassignedTicketsRef.current.add(t.id);
                } else if (t.technician_names) {
                  techNamesRef.current.set(t.id, t.technician_names);
                }
                const tag = t.has_technician ? t.ticket_code : `⚠ SIN TÉCNICO: ${t.ticket_code}`;
                showBanner('new_ticket', `Nuevo: ${tag} — ${t.office_name || ''}`);
                if (soundRef.current) BoardNotification.playSound('new_ticket');
              }
              if ((t.is_returned === 1 || t.is_returned === true) && !prevReturnedIdsRef.current.has(t.id)) {
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
              const nowHasTech = !!(t.has_technician || t.technician_names);
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

              if ((t.is_returned === 1 || t.is_returned === true) && !prevReturnedIdsRef.current.has(t.id)) {
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
          const closedIds = new Set<number>();
          if (closed.length > 0) {
            for (const c of closed) {
              closedIds.add(c.ticket_id);
              if (!prevClosedIdsRef.current.has(c.ticket_id)) {
                prevClosedIdsRef.current.add(c.ticket_id);
                techNamesRef.current.delete(c.ticket_id);
                showBanner('ticket_closed', `Cerrado: ${c.ticket_code}`);
                if (soundRef.current) BoardNotification.playSound('closed');
              }
            }
            setActiveTickets(prev => prev.filter(t => !closedIds.has(t.id)));
          }

          // Clean up refs from closed/removed tickets
          Array.from(unassignedTicketsRef.current).forEach(id => {
            if (closedIds.has(id)) unassignedTicketsRef.current.delete(id);
          });

          if (data.technicians_grouped) setTechniciansGrouped(data.technicians_grouped);

          if (data.current_lunch) setCurrentLunch(data.current_lunch);

          const newAssistance = (data.new_assistance || []) as AssistanceRequest[];
          if (newAssistance.length > 0) {
            for (const a of newAssistance) {
              if (!prevAssistanceIdsRef.current.has(a.id)) {
                prevAssistanceIdsRef.current.add(a.id);
                showBanner('assistance', `🚨 ${a.technician_name} solicita ayuda — ${a.ticket_code}`);
                if (soundRef.current) BoardNotification.playSound('new_ticket');
              }
            }
            setPendingAssistance(prev => {
              const existingMap = new Map(prev.map(a => [a.id, a]));
              for (const a of newAssistance) existingMap.set(a.id, a);
              return Array.from(existingMap.values());
            });
          }

          if (data.stats) {
            const newStats = data.stats as Stats;
            const prev = prevStatsRef.current;
            if (newStats.unassigned > prev.unassigned) {
              showBanner('stats', `¡Sin técnico: ${newStats.unassigned}`);
            }
            if ((newStats.pending_assistance ?? 0) > (prev.pending_assistance ?? 0)) {
              showBanner('assistance', `🚨 Nueva solicitud de asistencia — ${newStats.pending_assistance} pendiente(s)`);
              if (soundRef.current) BoardNotification.playSound('new_ticket');
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

  const priorityClass = (p: string | undefined): string => {
    const s = (p || '').toLowerCase();
    if (s === 'crítica' || s === 'critica') return 'critica';
    if (s === 'alta') return 'alta';
    if (s === 'media') return 'media';
    return 'baja';
  };

  const serviceClass = (sid: number): string => {
    if (sid === 1) return 'redes';
    if (sid === 2) return 'soporte';
    return 'prog';
  };

  return (
    <div className="pb-root" onClick={handleFirstClick}>
      {banner && (
        <div className={`pb-banner pb-banner-${banner.type}`}>
          <span className="pb-banner-text">{banner.text}</span>
        </div>
      )}

      <header className="pb-topbar">
        <div className="pb-topbar-brand">
          <img className="pb-logo" src="/SC-1-Photoroom.png" alt="Alcaldía de San Cristóbal" />
          <div className="pb-brand-text">
            <span className="pb-brand-name">Alcaldía de San Cristóbal</span>
            <span className="pb-brand-sub">Sistema de Tickets</span>
          </div>
          <div className={`pb-dot ${connected ? 'pb-dot-live' : 'pb-dot-dead'}`} />
        </div>
        <div className="pb-stats">
          <div className="pb-stat"><span className="pb-stat-num">{stats.in_progress}</span><span className="pb-stat-lbl">En proceso</span></div>
          <div className={`pb-stat ${stats.pending > 0 ? 'pb-stat-warn' : ''}`}><span className="pb-stat-num">{stats.pending}</span><span className="pb-stat-lbl">Pendientes</span></div>
          <div className="pb-stat"><span className="pb-stat-num">{stats.today_created}</span><span className="pb-stat-lbl">Creados</span></div>
          <div className="pb-stat"><span className="pb-stat-num">{stats.closed_today}</span><span className="pb-stat-lbl">Cerrados</span></div>
          {stats.returned > 0 && <div className="pb-stat pb-stat-ret"><span className="pb-stat-num">{stats.returned}</span><span className="pb-stat-lbl">Devueltos</span></div>}
        </div>
        <div className="pb-topbar-right"><Clock /></div>
      </header>

      <div className="pb-body">
        {techniciansGrouped.map(group => {
          const serviceTickets = activeTickets.filter(
            t => t.service_id === group.service_id || (!t.service_id && t.service_name === group.service_name)
          );
          const returnedCount = serviceTickets.filter(t => t.is_returned).length;
          const availableTechs = group.technicians.filter(t => {
            const isInAlmuerzo = currentLunch.active && currentLunch.block && (t.Fk_Lunch_Block === currentLunch.block.id);
            return t.status === 'Disponible' && !isInAlmuerzo;
          });
          return (
            <div key={group.service_id} className={`pb-col ${serviceClass(group.service_id)}`}>

              <div className="pb-col-hd">
                <span className="pb-col-name">{group.service_name}</span>
                <span className="pb-col-hd-meta">
                  <strong>{serviceTickets.length}</strong> tickets · <strong>{availableTechs.length}</strong> disp
                  {returnedCount > 0 && <span className="pb-col-hd-meta-return">⚠{returnedCount}</span>}
                </span>
              </div>

              <div className="pb-col-tickets">
                {serviceTickets.length === 0 && <span className="pb-empty">Sin tickets</span>}
                {serviceTickets.map(t => (
                  <div key={t.id} className={`pb-ticket ${priorityClass(t.priority)}${t.is_returned ? ' returned' : ''}${!t.is_returned && !(t.has_technician || t.technician_names) ? ' unassigned' : ''}`}>
                    <div className="pb-ticket-row1">
                      <span className="pb-ticket-code">{t.ticket_code || `#${t.id}`}</span>
                      <span className="pb-ticket-office">{t.office_name}</span>
                    </div>
                    <div className="pb-ticket-row2">{t.problem_name}{t.problem_name && t.technician_names ? ' · ' : ''}{t.technician_names}</div>
                  </div>
                ))}
              </div>

              <div className="pb-col-techs">
                {group.technicians.map(t => {
                  const isInAlmuerzo = currentLunch.active && currentLunch.block && (t.Fk_Lunch_Block === currentLunch.block.id);
                  const hasTickets = t.active_tickets_count > 0;
                  const status = t.status || 'Inactivo';
                  let Icon: React.ElementType;
                  let orbClass: string;
                  if (isInAlmuerzo) { Icon = Coffee; orbClass = 'almuerzo'; }
                  else if (status === 'Disponible') { Icon = CheckCircle; orbClass = 'disponible'; }
                  else if (status === 'Ocupado' && hasTickets) { Icon = Ticket; orbClass = 'ocupado'; }
                  else if (status === 'Ocupado') { Icon = AlertCircle; orbClass = 'ocupado'; }
                  else if (status === 'Inactivo') { Icon = XCircle; orbClass = 'inactivo'; }
                  else if (status === 'Fuera de Servicio') { Icon = UserX; orbClass = 'out'; }
                  else { Icon = XCircle; orbClass = 'inactivo'; }
                  return (
                    <div key={t.id} className={`pb-tech ${orbClass}`} title={`${isInAlmuerzo ? 'Almuerzo' : status}${hasTickets ? ` · ${t.active_tickets_count} ticket(s)` : ''}`}>
                      <span className={`pb-tech-orb ${orbClass}`}><Icon size={14} /></span>
                      <span className="pb-tech-name">{t.name}</span>
                      {hasTickets && <span className="pb-tech-cnt">{t.active_tickets_count}</span>}
                    </div>
                  );
                })}
                {group.technicians.length === 0 && <span className="pb-empty">Sin técnicos</span>}
              </div>

            </div>
          );
        })}
      </div>

      {currentLunch.active && currentLunch.block && (
        <footer className="pb-footer">
          <span className="pb-footer-dot" />
          <span>Almuerzo activo: <strong>{currentLunch.block.block_name}</strong> ({currentLunch.block.start_time} – {currentLunch.block.end_time})</span>
        </footer>
      )}
    </div>
  );
};

export default PublicBoard;
