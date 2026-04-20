import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter, 
  Plus, 
  Eye, 
  User, 
  UserX,
  Clock, 
  MessageSquare, 
  Paperclip, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  X,
  Send,
  History,
  ArrowLeft,
  MapPin,
  Flag,
  Star
} from 'lucide-react';
import './AdminTicketManagement.css';

interface TicketTechnician {
  ID_Ticket_Technician: string;
  Fk_Technician: string;
  Is_Lead: boolean;
  Assigned_At: string;
  Technician_Name: string;
  Technician_Email: string;
}

interface Ticket {
  ID_Service_Request: string;
  Ticket_Code: string;
  Subject: string;
  Description: string;
  Fk_Direction: string;
  Fk_Division: string;
  Fk_Coordination: string;
  Fk_TI_Service: string;
  System_Priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  Status: 'Pendiente' | 'En Proceso' | 'Cerrado';
  Created_at: string;
  Resolved_at: string | null;
  Direction_Name?: string;
  Division_Name?: string;
  Coordination_Name?: string;
  Service_Name?: string;
  Technicians: TicketTechnician[];
  Attachments_Count?: number;
  Comments_Count?: number;
}

interface Technician {
  ID_Technician: string;
  Name: string;
  Email: string;
  Status: 'Disponible' | 'Ocupado';
  Specialization: string;
  TI_Services: string[];
}

interface TimelineEvent {
  ID_Timeline: string;
  Fk_Service_Request: string;
  Event_Type: 'created' | 'assigned' | 'reassigned' | 'priority_changed' | 'status_changed' | 'commented' | 'resolved';
  Description: string;
  Created_By: string;
  Created_at: string;
}

interface Comment {
  ID_Comment: string;
  Fk_Service_Request: string;
  Comment_Text: string;
  Comment_Type: 'public' | 'internal';
  Created_By: string;
  Created_at: string;
  User_Name?: string;
  User_Role?: 'Admin' | 'Technician' | 'Coordinator';
}

interface Attachment {
  ID_Attachment: string;
  Fk_Service_Request: string;
  File_Name: string;
  File_Path: string;
  File_Type: string;
  File_Size: number;
  Uploaded_By: string;
  Uploaded_At: string;
}

const AdminTicketManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Estados de modales
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  // Estados de asignación
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [technicianSearch, setTechnicianSearch] = useState('');

  // Estados de comentarios y timeline
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'public' | 'internal'>('public');

  // Estado de prioridad
  const [newPriority, setNewPriority] = useState<'Baja' | 'Media' | 'Alta' | 'Crítica'>('Media');

  // Datos mock para demostración
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      const mockTickets: Ticket[] = [
        {
          ID_Service_Request: '1',
          Ticket_Code: 'TK-001',
          Subject: 'Problema con conexión a internet en oficina principal',
          Description: 'Los usuarios reportan pérdida de conectividad intermitente durante el día',
          Fk_Direction: '1',
          Fk_Division: '1',
          Fk_Coordination: '1',
          Fk_TI_Service: '1',
          System_Priority: 'Alta',
          Status: 'En Proceso',
          Created_at: '2024-01-15T09:30:00Z',
          Resolved_at: null,
          Direction_Name: 'Dirección de Educación',
          Division_Name: 'División de Docencia',
          Coordination_Name: 'Coordinación de Semáforos',
          Service_Name: 'Redes',
          Technicians: [
            {
              ID_Ticket_Technician: '1',
              Fk_Technician: '1',
              Is_Lead: true,
              Assigned_At: '2024-01-15T09:30:00Z',
              Technician_Name: 'Carlos Rodríguez',
              Technician_Email: 'carlos.rodriguez@municipio.gob'
            },
            {
              ID_Ticket_Technician: '2',
              Fk_Technician: '2',
              Is_Lead: false,
              Assigned_At: '2024-01-15T10:00:00Z',
              Technician_Name: 'María González',
              Technician_Email: 'maria.gonzalez@municipio.gob'
            }
          ],
          Attachments_Count: 2,
          Comments_Count: 5
        },
        {
          ID_Service_Request: '2',
          Ticket_Code: 'TK-002',
          Subject: 'Actualización de software en computadoras de contabilidad',
          Description: 'Se requiere actualizar el sistema contable a la última versión',
          Fk_Direction: '2',
          Fk_Division: '2',
          Fk_Coordination: '2',
          Fk_TI_Service: '2',
          System_Priority: 'Media',
          Status: 'Pendiente',
          Created_at: '2024-01-15T10:15:00Z',
          Resolved_at: null,
          Direction_Name: 'Dirección de Vialidad',
          Division_Name: 'División de Ingeniería',
          Coordination_Name: 'Coordinación de Catastro Legal',
          Service_Name: 'Soporte Técnico',
          Technicians: [],
          Attachments_Count: 1,
          Comments_Count: 2
        },
        {
          ID_Service_Request: '3',
          Ticket_Code: 'TK-003',
          Subject: 'Impresora no funciona en área de recepción',
          Description: 'La impresora principal no responde y muestra error de papel atascado',
          Fk_Direction: '3',
          Fk_Division: '3',
          Fk_Coordination: '3',
          Fk_TI_Service: '2',
          System_Priority: 'Baja',
          Status: 'Cerrado',
          Created_at: '2024-01-14T14:20:00Z',
          Resolved_at: '2024-01-15T11:45:00Z',
          Direction_Name: 'Dirección de Salud',
          Division_Name: 'División Administrativa',
          Coordination_Name: 'Coordinación de Mantenimiento',
          Service_Name: 'Soporte Técnico',
          Technicians: [
            {
              ID_Ticket_Technician: '3',
              Fk_Technician: '2',
              Is_Lead: true,
              Assigned_At: '2024-01-14T14:20:00Z',
              Technician_Name: 'María González',
              Technician_Email: 'maria.gonzalez@municipio.gob'
            }
          ],
          Attachments_Count: 0,
          Comments_Count: 3
        }
      ];

      const mockTechnicians: Technician[] = [
        {
          ID_Technician: '1',
          Name: 'Carlos Rodríguez',
          Email: 'carlos.rodriguez@municipio.gob',
          Status: 'Disponible',
          Specialization: 'Redes y Conectividad',
          TI_Services: ['1']
        },
        {
          ID_Technician: '2',
          Name: 'María González',
          Email: 'maria.gonzalez@municipio.gob',
          Status: 'Ocupado',
          Specialization: 'Soporte Técnico',
          TI_Services: ['2']
        },
        {
          ID_Technician: '3',
          Name: 'Juan Pérez',
          Email: 'juan.perez@municipio.gob',
          Status: 'Disponible',
          Specialization: 'Hardware y Mantenimiento',
          TI_Services: ['3']
        }
      ];

      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
      setTechnicians(mockTechnicians.filter(t => t.Status === 'Disponible'));
      setLoading(false);
    }, 1000);
  };

  // Filtrar tickets
  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.Ticket_Code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.Status === statusFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.Fk_TI_Service === serviceFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.System_Priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, serviceFilter, priorityFilter]);

  // Cargar detalles del ticket
  const loadTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    
    // Mock de datos adicionales
    const mockComments: Comment[] = [
      {
        ID_Comment: '1',
        Fk_Service_Request: ticket.ID_Service_Request,
        Comment_Text: 'He revisado el problema y parece ser un problema con el router principal.',
        Comment_Type: 'public',
        Created_By: '1',
        Created_at: '2024-01-15T10:00:00Z',
        User_Name: 'Carlos Rodríguez',
        User_Role: 'Technician'
      },
      {
        ID_Comment: '2',
        Fk_Service_Request: ticket.ID_Service_Request,
        Comment_Text: 'Por favor, mantengan informados a los usuarios sobre el progreso.',
        Comment_Type: 'internal',
        Created_By: 'admin',
        Created_at: '2024-01-15T10:30:00Z',
        User_Name: 'Administrador',
        User_Role: 'Admin'
      }
    ];

    const mockTimeline: TimelineEvent[] = [
      {
        ID_Timeline: '1',
        Fk_Service_Request: ticket.ID_Service_Request,
        Event_Type: 'created',
        Description: 'Ticket creado',
        Created_By: 'coordinator',
        Created_at: ticket.Created_at
      },
      {
        ID_Timeline: '2',
        Fk_Service_Request: ticket.ID_Service_Request,
        Event_Type: 'assigned',
        Description: 'Asignado a Carlos Rodríguez',
        Created_By: 'admin',
        Created_at: '2024-01-15T09:45:00Z'
      }
    ];

    const mockAttachments: Attachment[] = [
      {
        ID_Attachment: '1',
        Fk_Service_Request: ticket.ID_Service_Request,
        File_Name: 'screenshot_red.png',
        File_Path: '/uploads/screenshot_red.png',
        File_Type: 'image/png',
        File_Size: 1024000,
        Uploaded_By: 'coordinator',
        Uploaded_At: '2024-01-15T09:35:00Z'
      }
    ];

    setComments(mockComments);
    setTimeline(mockTimeline);
    setAttachments(mockAttachments);
  };

  // Manejar asignación de técnicos
  const handleAssignTechnician = () => {
    if (!selectedTicket || selectedTechnicians.length === 0) return;

    setLoading(true);
    
    // Simular asignación
    setTimeout(() => {
      const updatedTickets = tickets.map(ticket => {
        if (ticket.ID_Service_Request === selectedTicket.ID_Service_Request) {
          // Determinar si hay técnicos asignados
          const hasExistingTechnicians = ticket.Technicians.length > 0;
          
          // Crear nuevos objetos TicketTechnician para los técnicos seleccionados
          const newTechnicians = selectedTechnicians.map((techId, index) => {
            const tech = technicians.find(t => t.ID_Technician === techId);
            return {
              ID_Ticket_Technician: Date.now().toString() + index,
              Fk_Technician: techId,
              Is_Lead: !hasExistingTechnicians && index === 0, // El primero es lead si no hay técnicos existentes
              Assigned_At: new Date().toISOString(),
              Technician_Name: tech?.Name || '',
              Technician_Email: tech?.Email || ''
            };
          });
          
          // Combinar técnicos existentes con nuevos (evitar duplicados)
          const existingTechIds = ticket.Technicians.map(t => t.Fk_Technician);
          const uniqueNewTechnicians = newTechnicians.filter(
            nt => !existingTechIds.includes(nt.Fk_Technician)
          );
          
          return {
            ...ticket,
            Technicians: [...ticket.Technicians, ...uniqueNewTechnicians],
            Status: 'En Proceso' as const
          };
        }
        return ticket;
      });
      
      setTickets(updatedTickets as Ticket[]);
      setShowAssignModal(false);
      setSelectedTechnicians([]);
      setReassignmentReason('');
      setLoading(false);
      
      // Actualizar timeline
      const newEvent: TimelineEvent = {
        ID_Timeline: Date.now().toString(),
        Fk_Service_Request: selectedTicket.ID_Service_Request,
        Event_Type: selectedTicket.Technicians.length > 0 ? 'assigned' : 'reassigned',
        Description: `Asignado${selectedTechnicians.length > 1 ? 's' : ''} técnico${selectedTechnicians.length > 1 ? 's' : ''}: ${selectedTechnicians.map(id => {
          const tech = technicians.find(t => t.ID_Technician === id);
          return tech?.Name || id;
        }).join(', ')}`,
        Created_By: 'admin',
        Created_at: new Date().toISOString()
      };
      
      setTimeline(prev => [...prev, newEvent]);
      alert(`Técnico${selectedTechnicians.length > 1 ? 's' : ''} asignado${selectedTechnicians.length > 1 ? 's' : ''} exitosamente`);
    }, 1000);
  };

  // Manejar cambio de prioridad
  const handlePriorityChange = () => {
    if (!selectedTicket) return;

    setLoading(true);
    
    setTimeout(() => {
      const updatedTickets = tickets.map(ticket =>
        ticket.ID_Service_Request === selectedTicket.ID_Service_Request
          ? { ...ticket, System_Priority: newPriority }
          : ticket
      );
      
      setTickets(updatedTickets as Ticket[]);
      setShowPriorityModal(false);
      setLoading(false);
      
      // Actualizar timeline
      const newEvent: TimelineEvent = {
        ID_Timeline: Date.now().toString(),
        Fk_Service_Request: selectedTicket.ID_Service_Request,
        Event_Type: 'priority_changed',
        Description: `Prioridad cambiada a ${newPriority}`,
        Created_By: 'admin',
        Created_at: new Date().toISOString()
      };
      
      setTimeline([...timeline, newEvent]);
    }, 1000);
  };

  // Manejar envío de comentario
  const handleSendComment = () => {
    if (!selectedTicket || !newComment.trim()) return;

    const comment: Comment = {
      ID_Comment: Date.now().toString(),
      Fk_Service_Request: selectedTicket.ID_Service_Request,
      Comment_Text: newComment,
      Comment_Type: commentType,
      Created_By: 'admin',
      Created_at: new Date().toISOString(),
      User_Name: 'Administrador',
      User_Role: 'Admin'
    };

    setComments([...comments, comment]);
    setNewComment('');

    // Actualizar timeline
    const newEvent: TimelineEvent = {
      ID_Timeline: Date.now().toString(),
      Fk_Service_Request: selectedTicket.ID_Service_Request,
      Event_Type: 'commented',
      Description: `Comentario ${commentType} añadido`,
      Created_By: 'admin',
      Created_at: new Date().toISOString()
    };
    
    setTimeline([...timeline, newEvent]);
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica': return 'priority-critical';
      case 'Alta': return 'priority-high';
      case 'Media': return 'priority-medium';
      case 'Baja': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'status-pending';
      case 'En Proceso': return 'status-progress';
      case 'Cerrado': return 'status-resolved';
      default: return 'status-pending';
    }
  };

  return (
    <div className="admin-ticket-management">
      <div className="management-container">
        {/* Header */}
        <div className="management-header">
          <div className="header-content">
            <h1 className="page-title">
              <FileText size={28} />
              Gestión de Tickets
            </h1>
            <p className="page-subtitle">
              Panel de control para la gestión de solicitudes de soporte técnico
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} />
              Volver al Dashboard
            </button>
            <button className="btn btn-secondary">
              <Download size={18} />
              Exportar
            </button>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Report Cards */}
        <div className="report-cards">
          <div className="report-card">
            <div className="card-icon">
              <Clock size={24} />
            </div>
            <div className="card-content">
              <h3>Pendientes</h3>
              <p className="card-value">{tickets.filter(t => t.Status === 'Pendiente').length}</p>
            </div>
          </div>
          
          <div className="report-card">
            <div className="card-icon">
              <Settings size={24} />
            </div>
            <div className="card-content">
              <h3>En Proceso</h3>
              <p className="card-value">{tickets.filter(t => t.Status === 'En Proceso').length}</p>
            </div>
          </div>
          
          <div className="report-card">
            <div className="card-icon">
              <CheckCircle size={24} />
            </div>
            <div className="card-content">
              <h3>Resueltos</h3>
              <p className="card-value">{tickets.filter(t => t.Status === 'Cerrado').length}</p>
            </div>
          </div>
          
          <div className="report-card">
            <div className="card-icon">
              <AlertCircle size={24} />
            </div>
            <div className="card-content">
              <h3>Críticos</h3>
              <p className="card-value">{tickets.filter(t => t.System_Priority === 'Crítica').length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por código o asunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
            
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los Servicios</option>
              <option value="1">Redes</option>
              <option value="2">Soporte Técnico</option>
              <option value="3">Hardware</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las Prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Tickets Cards */}
        <div className="tickets-cards-container">
          {loading ? (
            <div className="loading-state">
              <RefreshCw className="spinner" size={32} />
              <p>Cargando tickets...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          ) : (
            <div className="tickets-grid">
              {filteredTickets.map((ticket) => (
                <div key={ticket.ID_Service_Request} className="ticket-card">
                  <div className="ticket-card-header">
                    <div className="ticket-code-info">
                      <span className="ticket-code">{ticket.Ticket_Code}</span>
                      <span className={`status-badge ${getStatusColor(ticket.Status)}`}>
                        {ticket.Status}
                      </span>
                    </div>
                    <span className={`priority-badge ${getPriorityColor(ticket.System_Priority)}`}>
                      {ticket.System_Priority}
                    </span>
                  </div>
                  
                  <div className="ticket-card-body">
                    <h4 className="ticket-subject">{ticket.Subject}</h4>
                    
                    <div className="ticket-location">
                      <div className="location-icon">
                        <MapPin size={18} strokeWidth={2} />
                      </div>
                      <div className="location-info">
                        <div className="location-main">{ticket.Coordination_Name}</div>
                        <div className="location-sub">{ticket.Direction_Name}</div>
                      </div>
                    </div>
                    
                    <div className="ticket-service">
                      <div className="service-icon">
                        <Settings size={18} strokeWidth={2} />
                      </div>
                      <span>{ticket.Service_Name}</span>
                    </div>
                    
                    <div className="ticket-description">
                      {ticket.Description.length > 100 
                        ? `${ticket.Description.substring(0, 100)}...`
                        : ticket.Description
                      }
                    </div>
                    
                    <div className="ticket-meta">
                      <div className="meta-item">
                        <Calendar size={16} strokeWidth={2} />
                        <span>{new Date(ticket.Created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={16} strokeWidth={2} />
                        <span>{new Date(ticket.Created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    <div className="ticket-attachments">
                      {(ticket.Attachments_Count || 0) > 0 && (
                        <span className="attachment-badge">
                          <Paperclip size={16} strokeWidth={2} />
                          {ticket.Attachments_Count}
                        </span>
                      )}
                      {(ticket.Comments_Count || 0) > 0 && (
                        <span className="comment-badge">
                          <MessageSquare size={16} strokeWidth={2} />
                          {ticket.Comments_Count}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ticket-card-footer">
                    <div className="technician-info">
                      {ticket.Technicians.length > 0 ? (
                        <div className="technicians-assigned">
                          <Users size={18} strokeWidth={2} />
                          <span>{ticket.Technicians.length} técnico{ticket.Technicians.length > 1 ? 's' : ''}</span>
                          <div className="technicians-list">
                            {ticket.Technicians.map(tech => (
                              <span key={tech.ID_Ticket_Technician} className="technician-tag">
                                {tech.Is_Lead && <Star size={12} />}
                                {tech.Technician_Name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="technician-unassigned">
                          <UserX size={18} strokeWidth={2} />
                          <span>Sin asignar</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ticket-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => {
                          loadTicketDetails(ticket);
                          setShowDetailModal(true);
                        }}
                        title="Ver detalles"
                      >
                        <Eye size={22} strokeWidth={2} />
                      </button>
                      <button
                        className="action-btn assign-btn"
                        onClick={() => {
                          loadTicketDetails(ticket);
                          setShowAssignModal(true);
                        }}
                        title="Asignar técnico"
                      >
                        <User size={22} strokeWidth={2} />
                      </button>
                      <button
                        className="action-btn priority-btn"
                        onClick={() => {
                          loadTicketDetails(ticket);
                          setNewPriority(ticket.System_Priority);
                          setShowPriorityModal(true);
                        }}
                        title="Cambiar prioridad"
                      >
                        <Flag size={22} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Asignación de Técnico */}
      {showAssignModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Asignar Técnicos</h2>
              <button
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="ticket-info">
                <p><strong>Ticket:</strong> {selectedTicket.Ticket_Code}</p>
                <p><strong>Asunto:</strong> {selectedTicket.Subject}</p>
                <p><strong>Técnicos Asignados:</strong> {selectedTicket.Technicians.length > 0 ? selectedTicket.Technicians.map(t => t.Technician_Name).join(', ') : 'Sin asignar'}</p>
              </div>
              
              <div className="form-group">
                <label>Seleccionar Técnicos Disponibles:</label>
                <div className="technician-search-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o especialización..."
                    value={technicianSearch}
                    onChange={(e) => setTechnicianSearch(e.target.value)}
                    className="technician-search-input"
                  />
                </div>
                <div className="technicians-count">
                  {technicians.filter(t => 
                    technicianSearch === '' || 
                    t.Name.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                    t.Email.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                    t.Specialization.toLowerCase().includes(technicianSearch.toLowerCase())
                  ).length} técnicos encontrados
                </div>
                <div className="technicians-checkbox-list">
                  {technicians
                    .filter(t => 
                      technicianSearch === '' || 
                      t.Name.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                      t.Email.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                      t.Specialization.toLowerCase().includes(technicianSearch.toLowerCase())
                    )
                    .map((tech) => (
                    <label key={tech.ID_Technician} className="technician-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedTechnicians.includes(tech.ID_Technician)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTechnicians([...selectedTechnicians, tech.ID_Technician]);
                          } else {
                            setSelectedTechnicians(selectedTechnicians.filter(id => id !== tech.ID_Technician));
                          }
                        }}
                      />
                      <div className="technician-checkbox-info">
                        <span className="technician-name">{tech.Name}</span>
                        <span className="technician-email">{tech.Email}</span>
                        <span className="technician-specialization">{tech.Specialization}</span>
                        <span className={`technician-status ${tech.Status === 'Disponible' ? 'status-available' : 'status-busy'}`}>
                          {tech.Status}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTechnicians([]);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssignTechnician}
                disabled={selectedTechnicians.length === 0}
              >
                <Users size={16} />
                Agregar {selectedTechnicians.length} técnico{selectedTechnicians.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cambio de Prioridad */}
      {showPriorityModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Cambiar Prioridad</h2>
              <button
                className="close-btn"
                onClick={() => setShowPriorityModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="ticket-info">
                <p><strong>Ticket:</strong> {selectedTicket.Ticket_Code}</p>
                <p><strong>Prioridad Actual:</strong> {selectedTicket.System_Priority}</p>
              </div>
              
              <div className="form-group">
                <label>Nueva Prioridad:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="form-select"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPriorityModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePriorityChange}
              >
                Cambiar Prioridad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Ticket */}
      {showDetailModal && selectedTicket && (
        <div className="modal-overlay modal-large">
          <div className="modal-content modal-large-content">
            <div className="modal-header">
              <h2>Detalles del Ticket - {selectedTicket.Ticket_Code}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body modal-large-body">
              <div className="ticket-detail-grid">
                {/* Información Principal */}
                <div className="detail-section">
                  <h3>Información General</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Asunto:</label>
                      <p>{selectedTicket.Subject}</p>
                    </div>
                    <div className="detail-item">
                      <label>Descripción:</label>
                      <p>{selectedTicket.Description}</p>
                    </div>
                    <div className="detail-item">
                      <label>Dirección:</label>
                      <p>{selectedTicket.Direction_Name}</p>
                    </div>
                    <div className="detail-item">
                      <label>División:</label>
                      <p>{selectedTicket.Division_Name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Coordinación:</label>
                      <p>{selectedTicket.Coordination_Name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Servicio:</label>
                      <p>{selectedTicket.Service_Name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Prioridad:</label>
                      <span className={`priority-badge ${getPriorityColor(selectedTicket.System_Priority)}`}>
                        {selectedTicket.System_Priority}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Estado:</label>
                      <span className={`status-badge ${getStatusColor(selectedTicket.Status)}`}>
                        {selectedTicket.Status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Técnicos Asignados:</label>
                      <div className="technicians-detail-list">
                        {selectedTicket.Technicians.length > 0 ? (
                          selectedTicket.Technicians.map(tech => (
                            <div key={tech.ID_Ticket_Technician} className="technician-detail-item">
                              <div className="technician-detail-header">
                                <span className="technician-detail-name">
                                  {tech.Is_Lead && <Star size={14} className="lead-star" />}
                                  {tech.Technician_Name}
                                </span>
                                {tech.Is_Lead && <span className="lead-badge">Principal</span>}
                              </div>
                              <div className="technician-detail-email">{tech.Technician_Email}</div>
                              <div className="technician-detail-date">
                                Asignado: {new Date(tech.Assigned_At).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-technicians">Sin técnicos asignados</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="detail-section">
                  <h3>
                    <History size={20} />
                    Timeline del Ticket
                  </h3>
                  <div className="timeline-container">
                    {timeline.map((event, index) => (
                      <div key={event.ID_Timeline} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-event">{event.Description}</span>
                            <span className="timeline-date">
                              {new Date(event.Created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adjuntos */}
                <div className="detail-section">
                  <h3>
                    <Paperclip size={20} />
                    Archivos Adjuntos
                  </h3>
                  <div className="attachments-container">
                    {attachments.map((attachment) => (
                      <div key={attachment.ID_Attachment} className="attachment-item">
                        <div className="attachment-icon">
                          <FileText size={20} />
                        </div>
                        <div className="attachment-info">
                          <p className="attachment-name">{attachment.File_Name}</p>
                          <p className="attachment-meta">
                            {(attachment.File_Size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button className="attachment-download">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comentarios */}
                <div className="detail-section">
                  <h3>
                    <MessageSquare size={20} />
                    Comentarios
                  </h3>
                  
                  <div className="comments-container">
                    {comments.map((comment) => (
                      <div key={comment.ID_Comment} className={`comment-item ${comment.Comment_Type}`}>
                        <div className="comment-header">
                          <div className="comment-author">
                            <strong>{comment.User_Name}</strong>
                            <span className={`comment-type-badge ${comment.Comment_Type}`}>
                              {comment.Comment_Type === 'internal' ? 'Interno' : 'Público'}
                            </span>
                          </div>
                          <span className="comment-date">
                            {new Date(comment.Created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.Comment_Text}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="comment-form">
                    <div className="comment-type-selector">
                      <label>
                        <input
                          type="radio"
                          value="public"
                          checked={commentType === 'public'}
                          onChange={(e) => setCommentType(e.target.value as any)}
                        />
                        Comentario Público
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="internal"
                          checked={commentType === 'internal'}
                          onChange={(e) => setCommentType(e.target.value as any)}
                        />
                        Comentario Interno
                      </label>
                    </div>
                    
                    <div className="comment-input-group">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe tu comentario..."
                        className="comment-input"
                        rows={3}
                      />
                      <button
                        className="btn btn-primary send-comment-btn"
                        onClick={handleSendComment}
                        disabled={!newComment.trim()}
                      >
                        <Send size={16} />
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketManagement;
