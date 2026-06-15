import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Clock, CheckCircle, AlertCircle, MessageSquare,
  FileText, User, Users, LogOut, ChevronRight, Calendar,
  MapPin, Wrench, Building, Mail, Send, X, ArrowLeft,
  Paperclip, TrendingUp, Search, Shield,
} from 'lucide-react';
import './RequesterDashboard.css';
import RequesterProfile from './RequesterProfile';
import ApiService, { API_BASE_URL } from '../../services/api';
import { findBienByCode } from '../../services/bienesApi';
import { useAuth } from '../../contexts/AuthContext';
import PasswordChangeRequired from '../common/PasswordChangeRequired';

interface Ticket {
  id: string; Code: string; Subject: string; Description: string;
  Property_Number?: string | null; office_name: string;
  System_Priority: string; Status: string; Created_at: string;
  Resolved_at?: string; Solution?: string;
  Technicians: Array<{ Name: string; Is_Lead: boolean }>;
  Comments_Count: number;
}

interface RequesterProfileData {
  id: string; name: string; email: string; username?: string; position: string;
  hireDate: string; office_name: string; supervisor: string;
}

const PrioClass: Record<string, string> = {
  'Crítica': 'rq-pr-c', Alta: 'rq-pr-h', Media: 'rq-pr-m', Baja: 'rq-pr-l',
};

const RequesterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstLogin, setFirstLogin] = useState(false);
  const [profile, setProfile] = useState<RequesterProfileData>({ id: '', name: '', email: '', position: '', hireDate: '', office_name: '', supervisor: '' });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComment, setShowComment] = useState<Record<string, boolean>>({});
  const [selFiles, setSelFiles] = useState<Record<string, File[]>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [showProfile, setShowProfile] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadComments, setLoadComments] = useState(false);

  useEffect(() => { loadData(); }, []);

  const [bienDesc, setBienDesc] = useState<string | null>(null);
  useEffect(() => {
    if (!selected?.Property_Number) { setBienDesc(null); return; }
    setBienDesc(null);
    let c = false;
    findBienByCode(selected.Property_Number).then(b => {
      if (!c) setBienDesc(b ? String((b as any).denact || '') : null);
    });
    return () => { c = true; };
  }, [selected]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) { navigate('/login'); return; }
      const ur = await ApiService.getMe();
      if (ur.success && ur.data) {
        const uid = ur.data.id;
        if (!ur.data.last_login_at) { setFirstLogin(true); setLoading(false); return; }
        try {
          const pr = await ApiService.getUserProfile(uid);
          if (pr.success && pr.data) {
            setProfile({ id: String(uid), name: pr.data.Full_Name || ur.data.full_name || 'Usuario', email: pr.data.Email || ur.data.email || '', username: pr.data.Username || pr.data.username || ur.data.username || '', position: pr.data.role_name || 'Solicitante', hireDate: new Date().toISOString().split('T')[0], office_name: pr.data.office_name || '', supervisor: pr.data.supervisor || 'No asignado' });
          } else {
            setProfile({ id: String(uid), name: ur.data.full_name || 'Usuario', email: ur.data.email || '', username: ur.data.username || '', position: ur.data.role_name || 'Solicitante', hireDate: new Date().toISOString().split('T')[0], office_name: '', supervisor: 'No asignado' });
          }
        } catch {
          setProfile({ id: String(uid), name: ur.data.full_name || 'Usuario', email: ur.data.email || '', username: ur.data.username || '', position: ur.data.role_name || 'Solicitante', hireDate: new Date().toISOString().split('T')[0], office_name: '', supervisor: 'No asignado' });
        }
        try {
          const tr = await ApiService.getMyTickets(uid);
          if (tr.success && tr.data && tr.data.length > 0) {
            setTickets(tr.data.map((t: any) => ({
              id: String(t.ID_Service_Request), Code: t.Ticket_Code || `TICK-${t.ID_Service_Request}`,
              Subject: t.Subject || 'Sin asunto', Description: t.Description || '',
              Property_Number: t.Property_Number || null,
              office_name: t.office_name || '', System_Priority: t.System_Priority || 'Media',
              Status: t.Status || 'Pendiente', Created_at: t.Created_at || new Date().toISOString(),
              Resolved_at: t.Resolved_at, Solution: t.Resolution_Notes,
              Technicians: (t.technicians || []).map((x: any) => ({ Name: x.name, Is_Lead: x.is_lead })),
              Comments_Count: 0,
            })));
          } else setTickets([]);
        } catch { setTickets([]); }
      } else { setTickets([]); }
    } catch { setTickets([]); }
    finally { setLoading(false); }
  };

  const active = tickets.filter(t => t.Status !== 'Cerrado');
  const resolved = tickets.filter(t => t.Status === 'Cerrado');
  const totalComments = tickets.reduce((a, t) => a + t.Comments_Count, 0);

  const fmt = (d: string) => new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getStep = (s: string) => s === 'Pendiente' ? 1 : s === 'En Proceso' ? 2 : 3;

  const handleView = async (t: Ticket) => {
    setSelected(t); setShowDetail(true); setLoadComments(true);
    try {
      const r = await ApiService.getTicketComments(parseInt(t.id));
      if (r.success && r.data) { setComments(r.data); setAttachments(r.ticket_attachments || []); }
      else { setComments([]); setAttachments([]); }
    } catch { setComments([]); setAttachments([]); }
    finally { setLoadComments(false); }
  };

  const handleComment = async (tid: string, files?: File[]) => {
    const txt = commentInputs[tid];
    if (!txt?.trim()) return;
    try {
      const hasFiles = files && files.length > 0;
      const r = await ApiService.addTicketComment(parseInt(tid), txt, hasFiles ? files : undefined);
      if (r.success) {
        setTickets(prev => prev.map(t => t.id === tid ? { ...t, Comments_Count: t.Comments_Count + 1 } : t));
        if (selected && selected.id === tid) {
          setComments(prev => [...prev, { ID_Comment: Date.now(), Comment: txt, Created_at: new Date().toISOString(), User_Name: profile.name, User_Role: profile.position, attachments: hasFiles ? r.data?.files || [] : [] }]);
        }
        setCommentInputs(p => ({ ...p, [tid]: '' }));
        setSelFiles(p => ({ ...p, [tid]: [] }));
        setShowComment(p => ({ ...p, [tid]: false }));
      }
    } catch {}
  };

  const handleFiles = (tid: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files || []).filter(f => f.size <= 10 * 1024 * 1024);
    setSelFiles(p => ({ ...p, [tid]: [...(p[tid] || []), ...fs].slice(0, 5) }));
    e.target.value = '';
  };

  const rmFile = (tid: string, i: number) => setSelFiles(p => ({ ...p, [tid]: (p[tid] || []).filter((_, j) => j !== i) }));

  if (firstLogin) return <PasswordChangeRequired onComplete={() => setFirstLogin(false)} />;

  return (
    <div className="rq">
      {loading ? (
        <div className="rq-load"><div className="rq-spin" /><p>Cargando...</p></div>
      ) : (
        <main className="rq-main">
          {/* Header bar */}
          <header className="rq-hdr">
            <div className="rq-hdr-l">
              <button className="rq-btn-ghost" onClick={() => navigate('/dashboard')}><ArrowLeft size={17} /></button>
              <div className="rq-avatar"><User size={20} /></div>
              <div>
                <h2 className="rq-hdr-name">{profile.name}</h2>
                <p className="rq-hdr-role">{profile.position}</p>
                {profile.username && <p className="rq-hdr-user">@{profile.username}</p>}
              </div>
            </div>
            <div className="rq-hdr-r">
              <button className="rq-btn-ghost" onClick={() => setShowProfile(true)}><User size={17} /><span>Perfil</span></button>
              <button className="rq-btn-ghost rq-btn-out" onClick={async () => { await logout(); navigate('/login'); }}><LogOut size={17} /><span>Salir</span></button>
            </div>
          </header>

          <div className="rq-body">
            {/* Context card */}
            <div className="rq-ctx">
              <div className="rq-ctx-main">
                <div className="rq-ctx-avatar"><User size={28} /></div>
                <div>
                  <h1 className="rq-ctx-name">{profile.name}</h1>
                  <div className="rq-ctx-meta">
                    {profile.username && <span className="rq-ctx-tag">@{profile.username}</span>}
                    {profile.office_name && <span className="rq-ctx-tag"><Building size={12} />{profile.office_name}</span>}
                    <span className="rq-ctx-tag"><Mail size={12} />{profile.email}</span>
                  </div>
                </div>
              </div>
              <button className="rq-cta" onClick={() => navigate('/new-ticket')}>
                <Plus size={20} />
                <span>Nueva solicitud</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="rq-stats">
              <div className="rq-stat"><div className="rq-stat-n">{active.length}</div><div className="rq-stat-l">Activos</div></div>
              <div className="rq-stat"><div className="rq-stat-n">{resolved.length}</div><div className="rq-stat-l">Resueltos</div></div>
              <div className="rq-stat"><div className="rq-stat-n">{totalComments}</div><div className="rq-stat-l">Comentarios</div></div>
            </div>

            {/* Active tickets */}
            <section className="rq-sec">
              <div className="rq-sec-h"><FileText size={18} /><h3>Mis solicitudes activas</h3><span className="rq-badge">{active.length}</span></div>
              <div className="rq-list">
                {active.map(t => (
                  <article key={t.id} className="rq-ticket">
                    <div className="rq-t-top">
                      <span className="rq-t-code">{t.Code}</span>
                      <span className={`rq-t-prio ${PrioClass[t.System_Priority] || ''}`}>{t.System_Priority}</span>
                      <span className={`rq-t-st rq-t-st--${t.Status === 'En Proceso' ? 'prog' : 'pend'}`}>
                        {t.Status === 'En Proceso' ? 'En curso' : t.Status}
                      </span>
                    </div>

                    <div className="rq-t-timeline">
                      {[
                        { label: 'Pendiente', step: 1 },
                        { label: 'En Proceso', step: 2 },
                        { label: 'Cerrado', step: 3 },
                      ].map((s, i) => (
                        <React.Fragment key={s.step}>
                          <div className={`rq-tl-step ${getStep(t.Status) >= s.step ? 'rq-tl-done' : ''}`}>
                            <div className="rq-tl-dot">{getStep(t.Status) >= s.step ? <CheckCircle size={10} /> : null}</div>
                            <span className="rq-tl-lbl">{s.label}</span>
                          </div>
                          {i < 2 && <div className={`rq-tl-line ${getStep(t.Status) > s.step ? 'rq-tl-done' : ''}`} />}
                        </React.Fragment>
                      ))}
                    </div>

                    <h4 className="rq-t-subj">{t.Subject}</h4>
                    {t.Description && <p className="rq-t-desc">{t.Description}</p>}

                    <div className="rq-t-tags">
                      {t.Property_Number && <span className="rq-tag-bien"><Wrench size={11} />Bien {t.Property_Number}</span>}
                      {t.office_name && <span className="rq-tag"><MapPin size={11} />{t.office_name}</span>}
                    </div>

                    <div className="rq-t-meta">
                      <span className="rq-t-date"><Calendar size={12} />{fmt(t.Created_at)}</span>
                      {t.Comments_Count > 0 && <span className="rq-t-cmts"><MessageSquare size={12} />{t.Comments_Count}</span>}
                      {t.Technicians.length > 0 && (
                        <span className="rq-t-techs"><Users size={12} />{t.Technicians.map(x => x.Name).join(', ')}</span>
                      )}
                    </div>

                    <div className="rq-t-foot">
                      {t.Technicians.length > 0 && (
                        <div className="rq-t-tech-list">
                          {t.Technicians.map((tech, i) => (
                            <span key={i} className="rq-tech-chip">
                              {tech.Is_Lead && <Shield size={10} />}
                              {tech.Name}
                            </span>
                          ))}
                        </div>
                      )}
                      <button className="rq-t-detail" onClick={() => handleView(t)}>
                        Ver detalles <ChevronRight size={14} />
                      </button>
                    </div>

                    {t.Status === 'En Proceso' && (
                      <div className="rq-cmt-wrap">
                        {!showComment[t.id] ? (
                          <button className="rq-cmt-trigger" onClick={() => setShowComment(p => ({ ...p, [t.id]: true }))}>
                            <MessageSquare size={13} />Agregar comentario
                          </button>
                        ) : (
                          <div className="rq-cmt-form">
                            <textarea
                              className="rq-cmt-ta" rows={3}
                              placeholder="Escribe tu comentario..."
                              value={commentInputs[t.id] || ''}
                              onChange={e => setCommentInputs(p => ({ ...p, [t.id]: e.target.value }))}
                            />
                            <input
                              ref={el => { fileRefs.current[t.id] = el; }} type="file" multiple
                              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
                              onChange={e => handleFiles(t.id, e)} style={{ display: 'none' }}
                            />
                            {(selFiles[t.id]?.length || 0) > 0 && (
                              <div className="rq-files">
                                {(selFiles[t.id] || []).map((f, i) => (
                                  <div key={i} className="rq-file">
                                    <FileText size={12} /><span>{f.name}</span>
                                    <button onClick={() => rmFile(t.id, i)}><X size={11} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="rq-cmt-acts">
                              <button className="rq-cmt-attach" onClick={() => fileRefs.current[t.id]?.click()}>
                                <Paperclip size={14} />{(selFiles[t.id]?.length || 0) > 0 && <span>{selFiles[t.id].length}</span>}
                              </button>
                              <div className="rq-cmt-acts-r">
                                <button className="rq-btn-ghost rq-btn-sm" onClick={() => { setShowComment(p => ({ ...p, [t.id]: false })); setSelFiles(p => ({ ...p, [t.id]: [] })); }}>
                                  Cancelar
                                </button>
                                <button className="rq-cmt-send" disabled={!commentInputs[t.id]?.trim()} onClick={() => handleComment(t.id, selFiles[t.id])}>
                                  <Send size={13} />Enviar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                ))}
                {active.length === 0 && (
                  <div className="rq-empty">
                    <FileText size={36} strokeWidth={1} />
                    <h4>Sin solicitudes activas</h4>
                    <p>Crea una nueva solicitud para comenzar</p>
                  </div>
                )}
              </div>
            </section>

            {/* History */}
            {resolved.length > 0 && (
              <section className="rq-sec">
                <div className="rq-sec-h"><TrendingUp size={18} /><h3>Historial de soluciones</h3><span className="rq-badge">{resolved.length}</span></div>
                <div className="rq-list">
                  {resolved.map(t => (
                    <article key={t.id} className="rq-ticket rq-ticket--done">
                      <div className="rq-t-top">
                        <span className="rq-t-code">{t.Code}</span>
                        {t.Resolved_at && <span className="rq-t-date"><Calendar size={11} />{fmt(t.Resolved_at)}</span>}
                      </div>
                      <h4 className="rq-t-subj">{t.Subject}</h4>
                      {t.Solution && (
                        <div className="rq-sol">
                          <p className="rq-sol-title">Solución aplicada</p>
                          <p className="rq-sol-text">{t.Solution}</p>
                        </div>
                      )}
                      {t.Technicians.length > 0 && (
                        <div className="rq-t-meta">
                          <span className="rq-t-techs"><Users size={12} />Resuelto por: {t.Technicians.map(x => x.Name).join(', ')}</span>
                        </div>
                      )}
                      <div className="rq-t-foot">
                        <div className="rq-t-tech-list" />
                        <button className="rq-t-detail" onClick={() => handleView(t)}>
                          Ver detalles <ChevronRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      )}

      {/* Profile modal */}
      {showProfile && (
        <div className="rq-overlay" onClick={() => setShowProfile(false)}>
          <div className="rq-modal" onClick={e => e.stopPropagation()}>
            <div className="rq-modal-h"><h3>Mi Perfil</h3><button className="rq-btn-ghost" onClick={() => setShowProfile(false)}><X size={18} /></button></div>
            <div className="rq-modal-b">
              <RequesterProfile profile={profile} onUpdate={setProfile} />
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetail && selected && (
        <div className="rq-overlay" onClick={() => setShowDetail(false)}>
          <div className="rq-modal rq-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="rq-modal-h rq-modal-h--det">
              <div>
                <span className="rq-det-code">{selected.Code}</span>
                <h3 className="rq-det-subj">{selected.Subject}</h3>
              </div>
              <button className="rq-btn-ghost" onClick={() => setShowDetail(false)}><X size={18} /></button>
            </div>
            <div className="rq-modal-b">
              <div className="rq-det-grid">
                <div className="rq-det-item"><span className="rq-det-lbl">Estado</span><span className={`rq-t-st rq-t-st--${selected.Status === 'En Proceso' ? 'prog' : selected.Status === 'Cerrado' ? 'done' : 'pend'}`}>{selected.Status === 'En Proceso' ? 'En curso' : selected.Status}</span></div>
                <div className="rq-det-item"><span className="rq-det-lbl">Prioridad</span><span className={`rq-t-prio ${PrioClass[selected.System_Priority] || ''}`}>{selected.System_Priority}</span></div>
                <div className="rq-det-item"><span className="rq-det-lbl">Oficina</span><span className="rq-det-val">{selected.office_name}</span></div>
                {selected.Property_Number && (
                  <div className="rq-det-item"><span className="rq-det-lbl">N° de Bien</span><span className="rq-det-val rq-det-mono">{selected.Property_Number}</span></div>
                )}
                {bienDesc && (
                  <div className="rq-det-item rq-det-full"><span className="rq-det-lbl">Descripción del Bien</span><span className="rq-det-val rq-det-bien">{bienDesc}</span></div>
                )}
                <div className="rq-det-item"><span className="rq-det-lbl">Creado</span><span className="rq-det-val">{fmt(selected.Created_at)}</span></div>
              </div>

              <div className="rq-det-sec">
                <h4>Descripción</h4>
                <p className="rq-det-desc">{selected.Description || 'Sin descripción'}</p>
              </div>

              {attachments.length > 0 && (
                <div className="rq-det-sec">
                  <h4>Archivos ({attachments.length})</h4>
                  <div className="rq-det-att">
                    {attachments.map((att: any) => (
                      <a key={att.ID_Attachment} href={`${API_BASE_URL}/${att.File_Path}`} target="_blank" rel="noopener noreferrer" className="rq-det-att-link">
                        {att.File_Type?.startsWith('image/') ? (
                          <img src={`${API_BASE_URL}/${att.File_Path}`} alt={att.File_Name} className="rq-det-thumb" />
                        ) : (
                          <><FileText size={14} /><span>{att.File_Name}</span></>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rq-det-sec">
                <h4>Estado del ticket</h4>
                <div className="rq-det-tl">
                  {[
                    { label: 'Pendiente', step: 1 },
                    { label: 'En Proceso', step: 2 },
                    { label: 'Cerrado', step: 3 },
                  ].map((s, i) => (
                    <React.Fragment key={s.step}>
                      <div className={`rq-det-tl-step ${getStep(selected.Status) >= s.step ? 'rq-det-tl-done' : ''}`}>
                        <div className="rq-det-tl-dot">{getStep(selected.Status) >= s.step ? <CheckCircle size={10} /> : null}</div>
                        <span>{s.label}</span>
                      </div>
                      {i < 2 && <div className={`rq-det-tl-line ${getStep(selected.Status) > s.step ? 'rq-det-tl-done' : ''}`} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {selected.Technicians.length > 0 && (
                <div className="rq-det-sec">
                  <h4>Equipo técnico asignado</h4>
                  <div className="rq-det-techs">
                    {selected.Technicians.map((tech, i) => (
                      <div key={i} className="rq-det-tech">
                        <div className="rq-det-tech-avatar"><User size={14} /></div>
                        <span>{tech.Name}</span>
                        {tech.Is_Lead && <span className="rq-det-lead">Principal</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rq-det-sec">
                <h4>Comentarios ({comments.length})</h4>
                {loadComments ? (
                  <div className="rq-det-load"><div className="rq-spin rq-spin-sm" /></div>
                ) : comments.length > 0 ? (
                  <div className="rq-det-cmts">
                    {comments.map((c, i) => (
                      <div key={c.ID_Comment || i} className="rq-det-cmt">
                        <div className="rq-det-cmt-avatar"><User size={12} /></div>
                        <div>
                          <div className="rq-det-cmt-hdr">
                            <strong>{c.User_Name}</strong>
                            <span className="rq-det-cmt-role">{c.User_Role}</span>
                            <time>{fmt(c.Created_at)}</time>
                          </div>
                          <p>{c.Comment}</p>
                          {c.attachments?.length > 0 && (
                            <div className="rq-det-cmt-att">
                              {c.attachments.map((a: any) => (
                                <a key={a.ID_Attachment} href={`${API_BASE_URL}/${a.File_Path}`} target="_blank" rel="noopener noreferrer">
                                  <FileText size={12} />{a.File_Name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rq-det-none">Sin comentarios aún</p>
                )}

                {selected.Status === 'En Proceso' && (
                  <div className="rq-cmt-form" style={{ marginTop: 16 }}>
                    <textarea
                      className="rq-cmt-ta" rows={3}
                      placeholder="Escribe un comentario..."
                      value={commentInputs[selected.id] || ''}
                      onChange={e => setCommentInputs(p => ({ ...p, [selected.id]: e.target.value }))}
                    />
                    <input ref={el => { fileRefs.current[selected.id] = el; }} type="file" multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
                      onChange={e => handleFiles(selected.id, e)} style={{ display: 'none' }}
                    />
                    {(selFiles[selected.id]?.length || 0) > 0 && (
                      <div className="rq-files">
                        {(selFiles[selected.id] || []).map((f, i) => (
                          <div key={i} className="rq-file"><FileText size={12} /><span>{f.name}</span><button onClick={() => rmFile(selected.id, i)}><X size={11} /></button></div>
                        ))}
                      </div>
                    )}
                    <div className="rq-cmt-acts">
                      <button className="rq-cmt-attach" onClick={() => fileRefs.current[selected.id]?.click()}>
                        <Paperclip size={14} />{(selFiles[selected.id]?.length || 0) > 0 && <span>{selFiles[selected.id].length}</span>}
                      </button>
                      <div className="rq-cmt-acts-r">
                        <button className="rq-cmt-send" disabled={!commentInputs[selected.id]?.trim()} onClick={() => handleComment(selected.id, selFiles[selected.id])}>
                          <Send size={13} />Enviar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequesterDashboard;
