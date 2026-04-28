import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
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
  Check,
  Flag,
  Star,
  Wrench
} from 'lucide-react';
import './AdminTicketManagement.css';
import ApiService from '../../services/api';

interface TicketTechnician {
  ID_Ticket_Technician: string;
  Fk_Technician: string;
  Is_Lead: boolean;
  Assigned_At: string;
  Technician_Name: string;
  Technician_Email: string;
  assignment_status: string;
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
  TI_Services: Array<{ID_TI_Service: number; Type_Service: string}>;
  Tickets_Resolved?: number;
  Active_Tickets?: number;
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
  const [groupedTechnicians, setGroupedTechnicians] = useState<any[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [technicianSearch, setTechnicianSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Estados de comentarios y timeline
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'public' | 'internal'>('public');

  // Estado de prioridad
  const [newPriority, setNewPriority] = useState<'Baja' | 'Media' | 'Alta' | 'Crítica'>('Media');

  // Estado de notificaciones
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowDetailModal(false);
      }
    };

    if (showDetailModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDetailModal]);

  // Datos mock para demostración
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);

    try {
      console.log('Cargando tickets...');
      const response = await ApiService.getTickets();
      console.log('Respuesta del API:', response);

      if (response.success && response.data) {
        console.log('Tickets recibidos:', response.data);
        const formattedTickets = response.data.map((ticket: any) => ({
          ID_Service_Request: ticket.ID_Service_Request.toString(),
          Ticket_Code: ticket.Ticket_Code || `TICK-${ticket.ID_Service_Request}`,
          Subject: ticket.Subject || 'Sin asunto',
          Description: ticket.Description || 'Sin descripción',
          Fk_Direction: ticket.Fk_Office || '',
          Fk_Division: '',
          Fk_Coordination: '',
          Fk_TI_Service: ticket.Fk_TI_Service?.toString() || '',
          System_Priority: ticket.System_Priority || 'Media',
          Status: ticket.Status || 'Pendiente',
          Created_at: ticket.Created_at || new Date().toISOString(),
          Resolved_at: ticket.Resolved_at || null,
          Direction_Name: ticket.office_name || 'No asignado',
          Division_Name: ticket.office_type || 'No asignado',
          Coordination_Name: ticket.service_type_name || 'No asignado',
          Service_Name: ticket.service_type_name || 'No asignado',
          Technicians: ticket.technicians?.map((t: any) => ({
            ID_Ticket_Technician: t.id?.toString() || '',
            Fk_Technician: t.id?.toString() || '',
            Is_Lead: t.is_lead || false,
            Assigned_At: t.assigned_at || '',
            Technician_Name: t.name || 'No asignado',
            Technician_Email: ''
          })) || [],
          Attachments_Count: 0,
          Comments_Count: 0
        }));
        console.log('Tickets formateados:', formattedTickets);
        setTickets(formattedTickets);
      } else {
        console.error('Error en respuesta:', response.message);
        setError(response.message || 'Error al cargar tickets');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
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

  // Cargar técnicos disponibles cuando se abre el modal de asignación
  const loadAvailableTechnicians = async (serviceId: string) => {
    try {
      console.log('=== LOAD GROUPED TECHNICIANS ===');
      console.log('Service ID:', serviceId);
      
      // Load all technicians grouped by service type
      const response = await ApiService.getAllTechniciansGroupedByService();
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        console.log('Grouped technicians data:', response.data);
        console.log('Number of service groups:', response.data.length);
        
        // Log each service group and its technicians
        response.data.forEach((group: any) => {
          console.log(`Service: ${group.service_name}, Technicians: ${group.technicians.length}`);
          group.technicians.forEach((tech: any) => {
            console.log(`  - ${tech.First_Name} ${tech.Last_Name} (${tech.Status})`);
          });
        });
        
        setGroupedTechnicians(response.data);
      } else {
        console.log('No technicians found or error, using mock data:', response.message);
        // Use mock data as fallback
        const mockGroupedTechnicians = [
          {
            service_id: 1,
            service_name: 'Redes',
            service_details: 'Infraestructura de red y conectividad',
            count: 2,
            technicians: [
              { ID_Technicians: 1, First_Name: 'Juan', Last_Name: 'Pérez', Status: 'Activo', Email: 'juan.perez@alcaldia.gob', Tickets_Resolved: 15, Active_Tickets: 2 },
              { ID_Technicians: 2, First_Name: 'María', Last_Name: 'García', Status: 'Disponible', Email: 'maria.garcia@alcaldia.gob', Tickets_Resolved: 23, Active_Tickets: 0 }
            ]
          },
          {
            service_id: 2,
            service_name: 'Soporte',
            service_details: 'Soporte técnico general',
            count: 2,
            technicians: [
              { ID_Technicians: 3, First_Name: 'Carlos', Last_Name: 'Rodríguez', Status: 'Activo', Email: 'carlos.rodriguez@alcaldia.gob', Tickets_Resolved: 18, Active_Tickets: 3 },
              { ID_Technicians: 4, First_Name: 'Ana', Last_Name: 'Martínez', Status: 'Disponible', Email: 'ana.martinez@alcaldia.gob', Tickets_Resolved: 12, Active_Tickets: 1 }
            ]
          },
          {
            service_id: 3,
            service_name: 'Programación',
            service_details: 'Desarrollo de software y aplicaciones',
            count: 2,
            technicians: [
              { ID_Technicians: 5, First_Name: 'Luis', Last_Name: 'López', Status: 'Activo', Email: 'luis.lopez@alcaldia.gob', Tickets_Resolved: 30, Active_Tickets: 4 },
              { ID_Technicians: 6, First_Name: 'Sofía', Last_Name: 'Sánchez', Status: 'Disponible', Email: 'sofia.sanchez@alcaldia.gob', Tickets_Resolved: 25, Active_Tickets: 0 }
            ]
          }
        ];
        setGroupedTechnicians(mockGroupedTechnicians);
      }
    } catch (error) {
      console.error('Error loading technicians, using mock data:', error);
      // Use mock data as fallback
      const mockGroupedTechnicians = [
        {
          service_id: 1,
          service_name: 'Redes',
          service_details: 'Infraestructura de red y conectividad',
          count: 2,
          technicians: [
            { ID_Technicians: 1, First_Name: 'Juan', Last_Name: 'Pérez', Status: 'Activo', Email: 'juan.perez@alcaldia.gob', Tickets_Resolved: 15, Active_Tickets: 2 },
            { ID_Technicians: 2, First_Name: 'María', Last_Name: 'García', Status: 'Disponible', Email: 'maria.garcia@alcaldia.gob', Tickets_Resolved: 23, Active_Tickets: 0 }
          ]
        },
        {
          service_id: 2,
          service_name: 'Soporte',
          service_details: 'Soporte técnico general',
          count: 2,
          technicians: [
            { ID_Technicians: 3, First_Name: 'Carlos', Last_Name: 'Rodríguez', Status: 'Activo', Email: 'carlos.rodriguez@alcaldia.gob', Tickets_Resolved: 18, Active_Tickets: 3 },
            { ID_Technicians: 4, First_Name: 'Ana', Last_Name: 'Martínez', Status: 'Disponible', Email: 'ana.martinez@alcaldia.gob', Tickets_Resolved: 12, Active_Tickets: 1 }
          ]
        },
        {
          service_id: 3,
          service_name: 'Programación',
          service_details: 'Desarrollo de software y aplicaciones',
          count: 2,
          technicians: [
            { ID_Technicians: 5, First_Name: 'Luis', Last_Name: 'López', Status: 'Activo', Email: 'luis.lopez@alcaldia.gob', Tickets_Resolved: 30, Active_Tickets: 4 },
            { ID_Technicians: 6, First_Name: 'Sofía', Last_Name: 'Sánchez', Status: 'Disponible', Email: 'sofia.sanchez@alcaldia.gob', Tickets_Resolved: 25, Active_Tickets: 0 }
          ]
        }
      ];
      setGroupedTechnicians(mockGroupedTechnicians);
    }
  };

  // Cargar detalles del ticket
  const loadTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);

    // Cargar comentarios reales del backend
    try {
      console.log('=== LOADING COMMENTS ===');
      console.log('Ticket ID:', ticket.ID_Service_Request);
      
      const commentsResponse = await ApiService.getTicketComments(parseInt(ticket.ID_Service_Request));
      console.log('Comments API Response:', commentsResponse);
      
      if (commentsResponse.success && commentsResponse.data) {
        const formattedComments = commentsResponse.data.map((c: any) => ({
          ID_Comment: c.ID_Comment?.toString() || '',
          Fk_Service_Request: c.Fk_Service_Request?.toString() || ticket.ID_Service_Request,
          Comment_Text: c.Comment || '',
          Created_at: c.Created_at || new Date().toISOString(),
          User_Name: c.user_name || 'Usuario',
          User_Role: c.user_role || 'User'
        }));
        console.log('Formatted comments:', formattedComments);
        setComments(formattedComments);
      } else {
        console.log('No comments or error:', commentsResponse.message);
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }

    // Timeline mock (por ahora, ya que no hay endpoint real)
    const mockTimeline: TimelineEvent[] = [
      {
        ID_Timeline: '1',
        Fk_Service_Request: ticket.ID_Service_Request,
        Event_Type: 'created',
        Description: 'Ticket creado',
        Created_By: 'coordinator',
        Created_at: ticket.Created_at
      }
    ];
    setTimeline(mockTimeline);

    // Attachments mock (por ahora)
    setAttachments([]);
  };

  // Manejar asignación de técnicos
  const handleAssignTechnician = async () => {
    if (!selectedTicket || selectedTechnicians.length === 0) return;

    setLoading(true);

    try {
      const response = await ApiService.assignMultipleTechnicians(
        parseInt(selectedTicket.ID_Service_Request),
        selectedTechnicians.map(id => parseInt(id))
      );

      if (response.success) {
        // Recargar tickets para reflejar cambios
        await loadTickets();

        setShowAssignModal(false);
        setSelectedTechnicians([]);
        setReassignmentReason('');
        showNotification('success', `Técnico${selectedTechnicians.length > 1 ? 's' : ''} asignado${selectedTechnicians.length > 1 ? 's' : ''} exitosamente`);
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      console.error('Error assigning technicians:', error);
      showNotification('error', 'Error al asignar técnicos');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de prioridad
  const handlePriorityChange = async () => {
    if (!selectedTicket) return;

    setLoading(true);

    try {
      const response = await ApiService.updateTicketPriority(
        parseInt(selectedTicket.ID_Service_Request),
        newPriority
      );

      if (response.success) {
        await loadTickets();
        setShowPriorityModal(false);
        showNotification('success', 'Prioridad actualizada exitosamente');
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      showNotification('error', 'Error al actualizar prioridad');
    } finally {
      setLoading(false);
    }
  };

  // Manejar envío de comentario
  const handleSendComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    setLoading(true);

    try {
      const response = await ApiService.addComment(
        parseInt(selectedTicket.ID_Service_Request),
        newComment
      );

      if (response.success) {
        // Recargar comentarios
        await loadTicketDetails(selectedTicket);
        setNewComment('');
        showNotification('success', 'Comentario agregado exitosamente');
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      showNotification('error', 'Error al agregar comentario');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre de ticket
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    setLoading(true);

    try {
      const response = await ApiService.updateTicketStatus(
        parseInt(selectedTicket.ID_Service_Request),
        'Cerrado'
      );

      if (response.success) {
        setShowDetailModal(false);
        setSelectedTicket(null);
        await loadTickets();
        showNotification('success', 'Ticket cerrado exitosamente');
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      showNotification('error', 'Error al cerrar ticket');
    } finally {
      setLoading(false);
    }
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
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle2 size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

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
              <option value="2">Soporte</option>
              <option value="3">Programación</option>
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

        {/* Tickets Cards - New Design */}
        <div className="tickets-container">
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
            <div className="tickets-grid-new">
              {filteredTickets.map((ticket) => (
                <div key={ticket.ID_Service_Request} className="ticket-card-new">
                  {/* Card Header with Status and Priority */}
                  <div className="ticket-header-new">
                    <div className="ticket-identity">
                      <div className="ticket-code-new">
                        <FileText size={14} />
                        {ticket.Ticket_Code}
                      </div>
                      <div className="ticket-badges">
                        <span className={`status-indicator ${getStatusColor(ticket.Status)}`}>
                          <div className="status-dot"></div>
                          {ticket.Status}
                        </span>
                        <span className={`priority-indicator ${getPriorityColor(ticket.System_Priority)}`}>
                          <Flag size={12} />
                          {ticket.System_Priority}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-time">
                      <Clock size={14} />
                      {new Date(ticket.Created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="ticket-content-new">
                    <h3 className="ticket-title">{ticket.Subject}</h3>
                    
                    <div className="ticket-description-new">
                      {ticket.Description.length > 80 
                        ? `${ticket.Description.substring(0, 80)}...`
                        : ticket.Description
                      }
                    </div>

                    {/* Metadata Grid */}
                    <div className="ticket-metadata">
                      <div className="metadata-item">
                        <MapPin size={14} />
                        <div className="metadata-text">
                          <span className="metadata-label">Ubicación</span>
                          <span className="metadata-value">{ticket.Coordination_Name}</span>
                        </div>
                      </div>
                      
                      <div className="metadata-item">
                        <Settings size={14} />
                        <div className="metadata-text">
                          <span className="metadata-label">Servicio</span>
                          <span className="metadata-value">{ticket.Service_Name}</span>
                        </div>
                      </div>
                      
                      <div className="metadata-item">
                        <Calendar size={14} />
                        <div className="metadata-text">
                          <span className="metadata-label">Fecha</span>
                          <span className="metadata-value">{new Date(ticket.Created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Technicians and Actions */}
                  <div className="ticket-footer-new">
                    <div className="technician-section">
                      {ticket.Technicians.length > 0 ? (
                        <div className="technician-info-new">
                          <div className="technician-avatars">
                            {ticket.Technicians.slice(0, 3).map((tech, index) => (
                              <div 
                                key={tech.ID_Ticket_Technician} 
                                className="technician-avatar-small"
                                title={tech.Technician_Name}
                              >
                                {tech.Technician_Name.charAt(0).toUpperCase()}
                                {tech.Is_Lead && <Star size={8} className="lead-indicator" />}
                              </div>
                            ))}
                            {ticket.Technicians.length > 3 && (
                              <div className="technician-more">
                                +{ticket.Technicians.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="technician-count">
                            {ticket.Technicians.length} técnico{ticket.Technicians.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="technician-unassigned-new">
                          <UserX size={14} />
                          <span>Sin asignar</span>
                        </div>
                      )}
                    </div>

                    <div className="ticket-actions-new">
                      {(ticket.Attachments_Count || 0) > 0 && (
                        <span className="attachment-indicator">
                          <Paperclip size={14} />
                          {ticket.Attachments_Count}
                        </span>
                      )}
                      {(ticket.Comments_Count || 0) > 0 && (
                        <span className="comment-indicator">
                          <MessageSquare size={14} />
                          {ticket.Comments_Count}
                        </span>
                      )}
                      
                      <div className="action-buttons">
                        <button
                          className="action-btn-new view-btn-new"
                          onClick={() => {
                            loadTicketDetails(ticket);
                            setShowDetailModal(true);
                          }}
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn-new assign-btn-new"
                          onClick={async () => {
                            await loadTicketDetails(ticket);
                            await loadAvailableTechnicians(ticket.Fk_TI_Service);
                            setShowAssignModal(true);
                          }}
                          title="Asignar técnico"
                        >
                          <User size={16} />
                        </button>
                        <button
                          className="action-btn-new priority-btn-new"
                          onClick={() => {
                            loadTicketDetails(ticket);
                            setNewPriority(ticket.System_Priority);
                            setShowPriorityModal(true);
                          }}
                          title="Cambiar prioridad"
                        >
                          <Flag size={16} />
                        </button>
                      </div>
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
          <div className="modal-content modal-wide">
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
                <label className="form-label">Seleccionar Técnicos</label>
                
                {groupedTechnicians.length === 0 ? (
                  <div className="empty-state-professional">
                    <div className="empty-icon">
                      <Users size={40} />
                    </div>
                    <p className="empty-title">No hay técnicos disponibles</p>
                    <p className="empty-subtitle">Verifica que los técnicos estén asignados en el módulo de Gestión de Técnicos</p>
                  </div>
                ) : (
                  <div className="tabbed-assignment-container">
                    <div className="tabs-header">
                      <button 
                        className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        Todos
                        <span className="tab-count">
                          {groupedTechnicians.reduce((acc: number, group: any) => 
                            acc + group.technicians.filter((t: any) => t.Status === 'Activo' || t.Status === 'Disponible').length, 0)}
                        </span>
                      </button>
                      {groupedTechnicians.map((serviceGroup) => {
                        const availableCount = serviceGroup.technicians.filter((t: any) => 
                          t.Status === 'Activo' || t.Status === 'Disponible'
                        ).length;
                        
                        if (availableCount === 0) return null;
                        
                        const getTabIcon = (serviceName: string) => {
                          switch (serviceName.toLowerCase()) {
                            case 'redes': return '🌐';
                            case 'soporte': return '🔧';
                            case 'programación': return '💻';
                            default: return '⚙️';
                          }
                        };

                        return (
                          <button
                            key={serviceGroup.service_id}
                            className={`tab-button ${activeTab === serviceGroup.service_name ? 'active' : ''}`}
                            onClick={() => setActiveTab(serviceGroup.service_name)}
                          >
                            <span className="tab-icon">{getTabIcon(serviceGroup.service_name)}</span>
                            {serviceGroup.service_name}
                            <span className="tab-count">{availableCount}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="tab-content">
                      <div className="tab-search">
                        <Search size={16} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Buscar técnico..."
                          value={technicianSearch}
                          onChange={(e) => setTechnicianSearch(e.target.value)}
                          className="tab-search-input"
                        />
                      </div>
                      
                      <div className="technicians-grid-new">
                        {(() => {
                          let techniciansToShow: any[] = [];
                          
                          if (activeTab === 'all') {
                            groupedTechnicians.forEach((group: any) => {
                              const availableTechs = group.technicians.filter((t: any) => 
                                t.Status === 'Activo' || t.Status === 'Disponible'
                              );
                              techniciansToShow = [...techniciansToShow, ...availableTechs];
                            });
                          } else {
                            const activeGroup = groupedTechnicians.find((g: any) => g.service_name === activeTab);
                            if (activeGroup) {
                              techniciansToShow = activeGroup.technicians.filter((t: any) => 
                                t.Status === 'Activo' || t.Status === 'Disponible'
                              );
                            }
                          }
                          
                          const filteredTechs = techniciansToShow.filter((t: any) =>
                            technicianSearch === '' ||
                            `${t.First_Name} ${t.Last_Name}`.toLowerCase().includes(technicianSearch.toLowerCase())
                          );

                          if (filteredTechs.length === 0) {
                            return (
                              <div className="no-results">
                                <p>No se encontraron técnicos</p>
                              </div>
                            );
                          }

                          return filteredTechs.map((tech: any) => {
                            const techId = tech.ID_Technicians?.toString();
                            const isSelected = selectedTechnicians.includes(techId);
                            
                            return (
                              <div 
                                key={techId} 
                                className={`tech-card-new ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTechnicians(selectedTechnicians.filter(id => id !== techId));
                                  } else {
                                    setSelectedTechnicians([...selectedTechnicians, techId]);
                                  }
                                }}
                              >
                                <div className="tech-card-header">
                                  <div className="tech-avatar-new">
                                    {tech.First_Name?.charAt(0)}{tech.Last_Name?.charAt(0)}
                                  </div>
                                  <div className="tech-card-info">
                                    <div className="tech-name-new">
                                      {tech.First_Name} {tech.Last_Name}
                                    </div>
                                    <div className="tech-email-new">
                                      {tech.Email}
                                    </div>
                                  </div>
                                  <div className={`tech-check ${isSelected ? 'checked' : ''}`}>
                                    <Check size={16} />
                                  </div>
                                </div>
                                <div className="tech-card-stats-new">
                                  <div className="stat-item-new">
                                    <span className="stat-value-new">{tech.Tickets_Resolved || 0}</span>
                                    <span className="stat-label-new">Resueltos</span>
                                  </div>
                                  <div className="stat-item-new">
                                    <span className="stat-value-new">{tech.Active_Tickets || 0}</span>
                                    <span className="stat-label-new">Activos</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                )}
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
          <div className="modal-large-content" ref={modalRef}>
            <div className="detail-modal-header">
              <div className="detail-modal-title-section">
                <div className="ticket-code-badge">
                  <FileText size={16} />
                  {selectedTicket.Ticket_Code}
                </div>
                <div className="detail-modal-badges">
                  <span className={`priority-badge ${getPriorityColor(selectedTicket.System_Priority)}`}>
                    {selectedTicket.System_Priority}
                  </span>
                  <span className={`status-badge ${getStatusColor(selectedTicket.Status)}`}>
                    {selectedTicket.Status}
                  </span>
                </div>
              </div>
              <button
                className="close-btn detail-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-large-body">
              <div className="detail-modal-layout">
                {/* Left Column - Main Info */}
                <div className="detail-modal-left">
                  {/* Subject & Description Card */}
                  <div className="detail-card">
                    <div className="detail-card-header">
                      <h3 className="detail-card-title">
                        <FileText size={18} />
                        Información del Ticket
                      </h3>
                    </div>
                    <div className="detail-card-content">
                      <div className="ticket-subject-section">
                        <label>Asunto</label>
                        <p className="ticket-subject-text">{selectedTicket.Subject}</p>
                      </div>
                      <div className="ticket-description-section">
                        <label>Descripción</label>
                        <p className="ticket-description-text">{selectedTicket.Description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Service Card */}
                  <div className="detail-card">
                    <div className="detail-card-header">
                      <h3 className="detail-card-title">
                        <MapPin size={18} />
                        Ubicación y Servicio
                      </h3>
                    </div>
                    <div className="detail-card-content">
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Dirección</label>
                          <p>{selectedTicket.Direction_Name}</p>
                        </div>
                        <div className="info-item">
                          <label>División</label>
                          <p>{selectedTicket.Division_Name}</p>
                        </div>
                        <div className="info-item">
                          <label>Coordinación</label>
                          <p>{selectedTicket.Coordination_Name}</p>
                        </div>
                        <div className="info-item">
                          <label>Servicio</label>
                          <p>{selectedTicket.Service_Name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Card */}
                  <div className="detail-card">
                    <div className="detail-card-header">
                      <h3 className="detail-card-title">
                        <History size={18} />
                        Timeline
                      </h3>
                    </div>
                    <div className="detail-card-content">
                      <div className="timeline-container">
                        {timeline.map((event) => (
                          <div key={event.ID_Timeline} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <span className="timeline-event">{event.Description}</span>
                              <span className="timeline-date">
                                {new Date(event.Created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Technicians, Comments, Actions */}
                <div className="detail-modal-right">
                  {/* Technicians Card */}
                  <div className="detail-card">
                    <div className="detail-card-header">
                      <h3 className="detail-card-title">
                        <Users size={18} />
                        Técnicos Asignados
                        <span className="badge-count">{selectedTicket.Technicians.length}</span>
                      </h3>
                    </div>
                    <div className="detail-card-content">
                      {selectedTicket.Technicians.length > 0 ? (
                        <div className="technicians-list">
                          {selectedTicket.Technicians.map(tech => (
                            <div key={tech.ID_Ticket_Technician} className="technician-card">
                              <div className="technician-card-header">
                                <div className="technician-avatar">
                                  {tech.Technician_Name.charAt(0).toUpperCase()}
                                </div>
                                <div className="technician-info">
                                  <span className="technician-name">
                                    {tech.Technician_Name}
                                    {tech.Is_Lead && <Star size={12} className="lead-star" />}
                                  </span>
                                  {tech.Is_Lead && <span className="lead-badge">Principal</span>}
                                </div>
                              </div>
                              <div className="technician-meta">
                                <Clock size={12} />
                                {new Date(tech.Assigned_At).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <UserX size={32} />
                          <p>Sin técnicos asignados</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments Card */}
                  <div className="detail-card comments-card">
                    <div className="detail-card-header">
                      <h3 className="detail-card-title">
                        <MessageSquare size={18} />
                        Comentarios
                        <span className="badge-count">{comments.length}</span>
                      </h3>
                    </div>
                    <div className="detail-card-content">
                      <div className="comments-list">
                        {comments.length === 0 ? (
                          <div className="empty-state">
                            <MessageSquare size={32} />
                            <p>No hay comentarios</p>
                          </div>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.ID_Comment} className="comment-card">
                              <div className="comment-avatar">
                                {(comment.User_Name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="comment-content">
                                <div className="comment-header">
                                  <span className="comment-author">{comment.User_Name || 'Usuario'}</span>
                                  <span className="comment-date">
                                    {new Date(comment.Created_at).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="comment-text">{comment.Comment_Text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="comment-form-wrapper">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Escribe un comentario..."
                          className="comment-textarea"
                          rows={2}
                        />
                        <button
                          className="btn btn-primary comment-send-btn"
                          onClick={handleSendComment}
                          disabled={!newComment.trim() || loading}
                        >
                          <Send size={14} />
                          {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Card */}
                  {selectedTicket.Status !== 'Cerrado' && (
                    <div className="detail-card actions-card">
                      <div className="detail-card-content">
                        <button
                          className="btn btn-danger close-ticket-btn"
                          onClick={handleCloseTicket}
                          disabled={loading}
                        >
                          <CheckCircle size={16} />
                          {loading ? 'Cerrando...' : 'Cerrar Ticket'}
                        </button>
                      </div>
                    </div>
                  )}
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
