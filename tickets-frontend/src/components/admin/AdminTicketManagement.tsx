import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  User,
  UserX,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  History,
  ArrowLeft,
  MapPin,
  Check,
  Flag,
  Star,
  Wrench,
  Lock
} from 'lucide-react';
import './AdminTicketManagement.css';
import ApiService from '../../services/api';

interface TicketTechnician {
  readonly ID_Ticket_Technician: string;
  readonly Fk_Technician: string;
  readonly Is_Lead: boolean;
  readonly Assigned_At: string;
  readonly Technician_Name: string;
  readonly Technician_Email: string;
  readonly assignment_status: string;
}

interface Ticket {
  readonly ID_Service_Request: string;
  readonly Ticket_Code: string;
  readonly Subject: string;
  readonly Description: string;
  readonly Fk_Direction: string;
  readonly Fk_Division: string;
  readonly Fk_Coordination: string;
  readonly Fk_TI_Service: string;
  readonly System_Priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  readonly Status: 'Pendiente' | 'En Proceso' | 'Cerrado';
  readonly Created_at: string;
  readonly Resolved_at: string | null;
  readonly Direction_Name?: string;
  readonly Division_Name?: string;
  readonly Coordination_Name?: string;
  readonly Service_Name?: string;
  readonly Software_System_Name?: string;
  readonly Technicians: readonly TicketTechnician[];
  readonly Attachments_Count?: number;
  readonly Comments_Count?: number;
}

interface Technician {
  readonly ID_Technician: string;
  readonly Name: string;
  readonly Email: string;
  readonly Status: 'Disponible' | 'Ocupado';
  readonly Specialization: string;
  readonly TI_Services: readonly {readonly ID_TI_Service: number; readonly Type_Service: string}[];
  readonly Tickets_Resolved?: number;
  readonly Active_Tickets?: number;
}

interface TimelineEvent {
  readonly ID_Timeline: string;
  readonly Fk_Service_Request: string;
  readonly Fk_User_Actor: string;
  readonly Action_Description: string;
  readonly Old_Status: string | null;
  readonly New_Status: string | null;
  readonly Event_Date: string;
  readonly User_Name?: string;
}

interface Comment {
  readonly ID_Comment: string;
  readonly Fk_Service_Request: string;
  readonly Comment_Text: string;
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
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [groupedTechnicians, setGroupedTechnicians] = useState<any[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [technicianSearch, setTechnicianSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const [comments, setComments] = useState<Comment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'public' | 'internal'>('public');

  const [newPriority, setNewPriority] = useState<'Baja' | 'Media' | 'Alta' | 'Crítica'>('Media');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [previousTickets, setPreviousTickets] = useState<Ticket[]>([]);
  const [refreshInterval] = useState(15000);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

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

  useEffect(() => {
    loadTickets();

    const interval = setInterval(() => {
      checkForUpdates();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const hasTicketChanges = (newTickets: Ticket[], oldTickets: Ticket[]): boolean => {
    if (newTickets.length !== oldTickets.length) return true;

    for (const newTicket of newTickets) {
      const oldTicket = oldTickets.find(t => t.ID_Service_Request === newTicket.ID_Service_Request);
      if (!oldTicket) return true;

      if (
        newTicket.Status !== oldTicket.Status ||
        newTicket.System_Priority !== oldTicket.System_Priority ||
        newTicket.Technicians.length !== oldTicket.Technicians.length ||
        newTicket.Subject !== oldTicket.Subject
      ) {
        return true;
      }
    }

    return false;
  };

  const checkForUpdates = async () => {
    try {
      const response = await ApiService.getTickets();

      if (response.success && response.data) {
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
          Software_System_Name: ticket.software_system_name || null,
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

        if (hasTicketChanges(formattedTickets, previousTickets)) {
          setPreviousTickets([...tickets]);
          setTickets(formattedTickets);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

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
          Software_System_Name: ticket.software_system_name || null,
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
        setPreviousTickets([...formattedTickets]);
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

  useEffect(() => {
    let filtered = [...tickets];

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

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const ticketDate = (dateStr: string) => new Date(dateStr);

      if (dateFilter === 'today') {
        filtered = filtered.filter(ticket => {
          const ticketDateObj = ticketDate(ticket.Created_at);
          return ticketDateObj.toDateString() === today.toDateString();
        });
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(ticket => {
          const ticketDateObj = ticketDate(ticket.Created_at);
          return ticketDateObj >= weekAgo && ticketDateObj <= now;
        });
      } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(ticket => {
          const ticketDateObj = ticketDate(ticket.Created_at);
          return ticketDateObj >= startDate && ticketDateObj <= endDate;
        });
      }
    }

    setFilteredTickets(filtered);
    setCurrentPage(1);
  }, [tickets, searchTerm, statusFilter, serviceFilter, priorityFilter, dateFilter, customStartDate, customEndDate]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const loadAvailableTechnicians = async (serviceId: string) => {
    try {
      console.log('=== LOAD GROUPED TECHNICIANS ===');
      console.log('Ticket Service ID:', serviceId);
      
      const response = await ApiService.getAllTechniciansGroupedByService();
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        console.log('Grouped technicians data:', response.data);
        console.log('Number of service groups:', response.data.length);
        
        const allGroups = response.data;
        
        console.log('All service groups for manual assignment:', allGroups);
        
        allGroups.forEach((group: any) => {
          console.log(`Service: ${group.service_name}, Technicians: ${group.technicians.length}`);
          group.technicians.forEach((tech: any) => {
            console.log(`  - ${tech.First_Name} ${tech.Last_Name} (${tech.Status})`);
          });
        });
        
        setGroupedTechnicians(allGroups);
      } else {
        console.log('No technicians found or error, using mock data:', response.message);
        const mockGroupedTechnicians = [
          { service_id: 1, service_name: 'Redes', service_details: 'Infraestructura de red y conectividad', count: 2, technicians: [
            { ID_Technicians: 1, First_Name: 'Juan', Last_Name: 'Pérez', Status: 'Disponible', Email: 'juan.perez@alcaldia.gob', Tickets_Resolved: 15, Active_Tickets: 0 },
            { ID_Technicians: 2, First_Name: 'María', Last_Name: 'García', Status: 'Disponible', Email: 'maria.garcia@alcaldia.gob', Tickets_Resolved: 23, Active_Tickets: 0 }
          ]},
          { service_id: 2, service_name: 'Soporte', service_details: 'Soporte técnico general', count: 2, technicians: [
            { ID_Technicians: 3, First_Name: 'Carlos', Last_Name: 'Rodríguez', Status: 'Disponible', Email: 'carlos.rodriguez@alcaldia.gob', Tickets_Resolved: 18, Active_Tickets: 0 },
            { ID_Technicians: 4, First_Name: 'Ana', Last_Name: 'Martínez', Status: 'Disponible', Email: 'ana.martinez@alcaldia.gob', Tickets_Resolved: 12, Active_Tickets: 0 }
          ]},
          { service_id: 3, service_name: 'Programación', service_details: 'Desarrollo de software', count: 2, technicians: [
            { ID_Technicians: 5, First_Name: 'Luis', Last_Name: 'López', Status: 'Disponible', Email: 'luis.lopez@alcaldia.gob', Tickets_Resolved: 30, Active_Tickets: 0 },
            { ID_Technicians: 6, First_Name: 'Sofía', Last_Name: 'Sánchez', Status: 'Disponible', Email: 'sofia.sanchez@alcaldia.gob', Tickets_Resolved: 25, Active_Tickets: 0 }
          ]}
        ];
        setGroupedTechnicians(mockGroupedTechnicians);
      }
    } catch (error) {
      console.error('Error loading technicians, using mock data:', error);
      const mockGroupedTechnicians = [
        { service_id: 1, service_name: 'Redes', service_details: 'Infraestructura de red y conectividad', count: 2, technicians: [
          { ID_Technicians: 1, First_Name: 'Juan', Last_Name: 'Pérez', Status: 'Disponible', Email: 'juan.perez@alcaldia.gob', Tickets_Resolved: 15, Active_Tickets: 0 },
          { ID_Technicians: 2, First_Name: 'María', Last_Name: 'García', Status: 'Disponible', Email: 'maria.garcia@alcaldia.gob', Tickets_Resolved: 23, Active_Tickets: 0 }
        ]},
        { service_id: 2, service_name: 'Soporte', service_details: 'Soporte técnico general', count: 2, technicians: [
          { ID_Technicians: 3, First_Name: 'Carlos', Last_Name: 'Rodríguez', Status: 'Disponible', Email: 'carlos.rodriguez@alcaldia.gob', Tickets_Resolved: 18, Active_Tickets: 0 },
          { ID_Technicians: 4, First_Name: 'Ana', Last_Name: 'Martínez', Status: 'Disponible', Email: 'ana.martinez@alcaldia.gob', Tickets_Resolved: 12, Active_Tickets: 0 }
        ]},
        { service_id: 3, service_name: 'Programación', service_details: 'Desarrollo de software', count: 2, technicians: [
          { ID_Technicians: 5, First_Name: 'Luis', Last_Name: 'López', Status: 'Disponible', Email: 'luis.lopez@alcaldia.gob', Tickets_Resolved: 30, Active_Tickets: 0 },
          { ID_Technicians: 6, First_Name: 'Sofía', Last_Name: 'Sánchez', Status: 'Disponible', Email: 'sofia.sanchez@alcaldia.gob', Tickets_Resolved: 25, Active_Tickets: 0 }
        ]}
      ];
      setGroupedTechnicians(mockGroupedTechnicians);
    }
  };

  const loadTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);

    try {
      console.log('=== LOADING COMMENTS ===');
      console.log('Ticket ID:', ticket.ID_Service_Request);
      
      const commentsResponse = await ApiService.getTicketComments(parseInt(ticket.ID_Service_Request));
      console.log('Comments API Response:', commentsResponse);
      
      if (commentsResponse.success && commentsResponse.data) {
        const formattedComments = commentsResponse.data.map((comment: any) => ({
          ID_Comment: comment.ID_Comment,
          Fk_Service_Request: comment.Fk_Service_Request,
          Comment_Text: comment.Comment,
          Comment_Type: comment.Comment_Type || 'public',
          Created_By: comment.Created_By,
          Created_at: comment.Created_at,
          User_Name: comment.User_Name || 'Usuario'
        }));
        setComments(formattedComments);
      } else {
        console.log('No comments or error:', commentsResponse.message);
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }

    try {
      console.log('=== LOADING TIMELINE ===');
      console.log('Ticket ID:', ticket.ID_Service_Request);
      
      const timelineResponse = await ApiService.getTicketTimeline(parseInt(ticket.ID_Service_Request));
      console.log('Timeline API Response:', timelineResponse);
      
      if (timelineResponse.success && timelineResponse.data) {
        const formattedTimeline = timelineResponse.data.map((event: any) => ({
          ID_Timeline: event.ID_Timeline,
          Fk_Service_Request: event.Fk_Service_Request,
          Fk_User_Actor: event.Fk_User_Actor,
          Action_Description: event.Action_Description,
          Old_Status: event.Old_Status,
          New_Status: event.New_Status,
          Event_Date: event.Event_Date,
          User_Name: event.User_Name || 'Usuario'
        }));
        setTimeline(formattedTimeline);
      } else {
        console.log('No timeline or error:', timelineResponse.message);
        setTimeline([]);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
      setTimeline([]);
    }

    setAttachments([]);
  };

  const handleAssignTechnician = async () => {
    if (!selectedTicket || selectedTechnicians.length === 0) return;

    setLoading(true);

    try {
      const response = await ApiService.assignMultipleTechnicians(
        parseInt(selectedTicket.ID_Service_Request),
        selectedTechnicians.map(id => parseInt(id))
      );

      if (response.success) {
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

  const handleSendComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    setLoading(true);

    try {
      const response = await ApiService.addComment(
        parseInt(selectedTicket.ID_Service_Request),
        newComment
      );

      if (response.success) {
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

  const getPriorityClass = (p: string) => {
    switch (p) {
      case 'Crítica': return 'p-crit';
      case 'Alta': return 'p-high';
      case 'Media': return 'p-med';
      case 'Baja': return 'p-low';
      default: return 'p-med';
    }
  };

  const getStatusClass = (s: string) => {
    switch (s) {
      case 'Pendiente': return 's-pend';
      case 'En Proceso': return 's-prog';
      case 'Cerrado': return 's-done';
      default: return 's-pend';
    }
  };

  return (
    <div className="gvt">
      {notification && (
        <div className={`gvt-toast gvt-toast--${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {notification.message}
        </div>
      )}

      <div className="gvt-body">
        <div className="gvt-head">
          <div className="gvt-head-l">
            <div className="gvt-emblem">
              <FileText size={18} />
            </div>
            <div>
              <h1 className="gvt-title">Gestión de Tickets</h1>
              <p className="gvt-sub">Sistema de Solicitudes de Servicio Técnico</p>
            </div>
          </div>
          <div className="gvt-head-r">
            <button className="gvt-btn gvt-btn--outline" onClick={() => navigate('/')}>
              <ArrowLeft size={14} />
              Dashboard
            </button>
            <button className="gvt-btn gvt-btn--primary" onClick={() => loadTickets()} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'gvt-spin' : ''} />
              {loading ? 'Cargando' : 'Actualizar'}
            </button>
          </div>
        </div>

        <div className="gvt-bar">
          <div className="gvt-stat">
            <span className="gvt-stat-n">{tickets.filter(t => t.Status === 'Pendiente').length}</span>
            <span className="gvt-stat-l">Pendientes</span>
          </div>
          <div className="gvt-stat">
            <span className="gvt-stat-n">{tickets.filter(t => t.Status === 'En Proceso').length}</span>
            <span className="gvt-stat-l">En Proceso</span>
          </div>
          <div className="gvt-stat">
            <span className="gvt-stat-n">{tickets.filter(t => t.Status === 'Cerrado').length}</span>
            <span className="gvt-stat-l">Resueltos</span>
          </div>
          <div className="gvt-stat">
            <span className="gvt-stat-n gvt-stat-n--crit">{tickets.filter(t => t.System_Priority === 'Crítica').length}</span>
            <span className="gvt-stat-l">Críticos</span>
          </div>
        </div>

        <div className="gvt-tools">
          <div className="gvt-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por código o asunto..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="gvt-filters">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="gvt-sel">
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="gvt-sel">
              <option value="all">Todas las prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="gvt-sel">
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="custom">Personalizado</option>
            </select>
            {dateFilter === 'custom' && (
              <div className="gvt-dates">
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="gvt-date" />
                <span>–</span>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="gvt-date" />
              </div>
            )}
          </div>
        </div>

        {loading && tickets.length === 0 ? (
          <div className="gvt-cards">
            {[1,2,3,4].map(i => (
              <div key={i} className="gvt-sk">
                <div className="gvt-sk-s" style={{ width: 120 }} />
                <div className="gvt-sk-s" style={{ width: '65%', marginTop: 8 }} />
                <div className="gvt-sk-r"><span className="gvt-sk-b" /><span className="gvt-sk-b" /></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="gvt-empty">
            <div className="gvt-empty-i"><AlertCircle size={22} /></div>
            <p className="gvt-empty-t">{error}</p>
            <button className="gvt-btn gvt-btn--outline" onClick={() => loadTickets()}>Reintentar</button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="gvt-empty">
            <div className="gvt-empty-i"><FileText size={22} /></div>
            <p className="gvt-empty-t">No se encontraron tickets</p>
            <p className="gvt-empty-s">Ajusta los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="gvt-cards">
              {paginatedTickets.map((t, i) => (
                <div key={t.ID_Service_Request} className={`gvt-card gvt-card--${getPriorityClass(t.System_Priority)}`} style={{ animationDelay: `${i * 35}ms` }}>
                  <button className="gvt-card-body" onClick={() => { loadTicketDetails(t); setShowDetailModal(true); }}>
                    <div className="gvt-card-head">
                      <span className="gvt-card-code">
                        <FileText size={11} />
                        {t.Ticket_Code}
                      </span>
                      <div className="gvt-card-tags">
                        <span className={`gvt-tag gvt-tag--${getPriorityClass(t.System_Priority)}`}>{t.System_Priority}</span>
                        <span className={`gvt-tag gvt-tag--${getStatusClass(t.Status)}`}>{t.Status}</span>
                      </div>
                    </div>
                    <h3 className="gvt-card-subject">{t.Subject}</h3>
                    <div className="gvt-card-meta">
                      <span>{t.Direction_Name || 'Sin dirección'}</span>
                      <span>{t.Service_Name || '–'}</span>
                      <span className="gvt-card-date">{new Date(t.Created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                  <div className="gvt-card-acts">
                    <button className="gvt-act" onClick={() => { loadTicketDetails(t); setShowDetailModal(true); }} title="Ver"><Eye size={14} /></button>
                    {t.Status !== 'Cerrado' && (
                      <>
                        <button className="gvt-act" onClick={async () => { await loadTicketDetails(t); await loadAvailableTechnicians(t.Fk_TI_Service); setShowAssignModal(true); }} title="Asignar"><User size={14} /></button>
                        <button className="gvt-act" onClick={() => { loadTicketDetails(t); setNewPriority(t.System_Priority); setShowPriorityModal(true); }} title="Prioridad"><Flag size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredTickets.length > itemsPerPage && (
              <div className="gvt-pag">
                <span className="gvt-pag-info">Página {currentPage} de {totalPages}</span>
                <div className="gvt-pag-b">
                  <button className="gvt-pag-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft size={13} /> Anterior
                  </button>
                  <div className="gvt-pag-n">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                      if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                        return <button key={p} className={`gvt-pag-num ${currentPage === p ? 'active' : ''}`} onClick={() => handlePageChange(p)}>{p}</button>;
                      if (p === currentPage - 2 || p === currentPage + 2)
                        return <span key={p} className="gvt-pag-d">⋯</span>;
                      return null;
                    })}
                  </div>
                  <button className="gvt-pag-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Siguiente <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAssignModal && selectedTicket && (
        <div className="gvt-over" onClick={() => setShowAssignModal(false)}>
          <div className="gvt-mod" onClick={e => e.stopPropagation()}>
            <div className="gvt-mod-h">
              <h2 className="gvt-mod-t">Asignar técnicos</h2>
              <button className="gvt-mod-x" onClick={() => setShowAssignModal(false)}><X size={17} /></button>
            </div>
            <div className="gvt-mod-info">
              <div className="gvt-info-r"><span className="gvt-info-l">Ticket</span><span className="gvt-info-c">{selectedTicket.Ticket_Code}</span></div>
              <div className="gvt-info-r"><span className="gvt-info-l">Asunto</span><span className="gvt-info-v">{selectedTicket.Subject}</span></div>
              <div className="gvt-info-r"><span className="gvt-info-l">Técnicos</span><span className="gvt-info-v">{selectedTicket.Technicians.length > 0 ? selectedTicket.Technicians.map(x => x.Technician_Name).join(', ') : 'Sin asignar'}</span></div>
            </div>
            <div className="gvt-mod-b">
              {groupedTechnicians.length === 0 ? (
                <div className="gvt-empty" style={{ padding: '28px 0' }}>
                  <div className="gvt-empty-i"><Users size={22} /></div>
                  <p className="gvt-empty-t">No hay técnicos disponibles</p>
                </div>
              ) : (
                <>
                  <div className="gvt-grp">
                    <button className={`gvt-grp-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Todos</button>
                    {groupedTechnicians.map(g => {
                      const n = g.technicians.filter((x: any) => x.Status === 'Disponible').length;
                      if (!n) return null;
                      return <button key={g.service_name} className={`gvt-grp-btn ${activeTab === g.service_name ? 'active' : ''}`} onClick={() => setActiveTab(g.service_name)}>{g.service_name}</button>;
                    })}
                  </div>
                  <div className="gvt-ts">
                    <Search size={14} />
                    <input type="text" placeholder="Buscar técnico..." value={technicianSearch} onChange={e => setTechnicianSearch(e.target.value)} />
                  </div>
                  <div className="gvt-tl">
                    {(() => {
                      let list: any[] = [];
                      if (activeTab === 'all') {
                        groupedTechnicians.forEach(g => list = [...list, ...g.technicians.filter((x: any) => x.Status === 'Disponible')]);
                      } else {
                        const g = groupedTechnicians.find((x: any) => x.service_name === activeTab);
                        if (g) list = g.technicians.filter((x: any) => x.Status === 'Disponible');
                      }
                      const f = list.filter((x: any) => !technicianSearch || `${x.First_Name} ${x.Last_Name}`.toLowerCase().includes(technicianSearch.toLowerCase()));
                      if (!f.length) return <div className="gvt-empty" style={{ padding: '20px 0' }}><p className="gvt-empty-t">Sin resultados</p></div>;
                      return f.map((tech: any) => {
                        const id = tech.ID_Technicians?.toString();
                        const is = selectedTechnicians.includes(id);
                        return (
                          <div key={id} className={`gvt-tech ${is ? 'on' : ''}`} onClick={() => setSelectedTechnicians(is ? selectedTechnicians.filter(x => x !== id) : [...selectedTechnicians, id])}>
                            <div className={`gvt-tech-av ${is ? 'on' : ''}`}>{tech.First_Name?.[0]}{tech.Last_Name?.[0]}</div>
                            <div className="gvt-tech-i">
                              <span className="gvt-tech-n">{tech.First_Name} {tech.Last_Name}</span>
                              <span className="gvt-tech-e">{tech.Email}</span>
                              <span className="gvt-tech-s">{tech.Tickets_Resolved || 0} resueltos · {tech.Active_Tickets || 0} activos</span>
                            </div>
                            <div className={`gvt-tech-c ${is ? 'on' : ''}`}>{is && <Check size={10} />}</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </div>
            <div className="gvt-mod-f">
              <button className="gvt-btn gvt-btn--outline" onClick={() => { setShowAssignModal(false); setSelectedTechnicians([]); }}>Cancelar</button>
              <button className="gvt-btn gvt-btn--primary" onClick={handleAssignTechnician} disabled={!selectedTechnicians.length}>
                <Users size={14} />
                Asignar ({selectedTechnicians.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {showPriorityModal && selectedTicket && (
        <div className="gvt-over">
          <div className="gvt-mod gvt-mod--sm">
            <div className="gvt-mod-h">
              <h2 className="gvt-mod-t">Cambiar prioridad</h2>
              <button className="gvt-mod-x" onClick={() => setShowPriorityModal(false)}><X size={17} /></button>
            </div>
            <div className="gvt-mod-b">
              <div className="gvt-prior">
                <span className="gvt-info-l">Ticket</span> <span className="gvt-info-c">{selectedTicket.Ticket_Code}</span>
                <div style={{ marginTop: 6 }}>
                  <span className="gvt-info-l">Actual</span>{' '}
                  <span className={`gvt-tag gvt-tag--${getPriorityClass(selectedTicket.System_Priority)}`}>{selectedTicket.System_Priority}</span>
                </div>
              </div>
              <div className="gvt-field">
                <label className="gvt-label">Nueva prioridad</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)} className="gvt-sel" style={{ width: '100%' }}>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>
            <div className="gvt-mod-f">
              <button className="gvt-btn gvt-btn--outline" onClick={() => setShowPriorityModal(false)}>Cancelar</button>
              <button className="gvt-btn gvt-btn--primary" onClick={handlePriorityChange}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTicket && (
        <div className="gvt-over" onClick={() => setShowDetailModal(false)}>
          <div className="gvt-mod gvt-mod--xl" ref={modalRef} onClick={e => e.stopPropagation()}>
            <div className="gvt-mod-h">
              <div className="gvt-dh">
                <span className="gvt-info-c"><FileText size={12} /> {selectedTicket.Ticket_Code}</span>
                <span className={`gvt-tag gvt-tag--${getPriorityClass(selectedTicket.System_Priority)}`}>{selectedTicket.System_Priority}</span>
                <span className={`gvt-tag gvt-tag--${getStatusClass(selectedTicket.Status)}`}>{selectedTicket.Status}</span>
              </div>
              <button className="gvt-mod-x" onClick={() => setShowDetailModal(false)}><X size={17} /></button>
            </div>

            <div className="gvt-det">
              <div className="gvt-det-p">
                <div className="gvt-det-sec">
                  <h4 className="gvt-det-h"><FileText size={13} /> Información</h4>
                  <div className="gvt-det-f"><label>Asunto</label><p>{selectedTicket.Subject}</p></div>
                  <div className="gvt-det-f"><label>Descripción</label><p>{selectedTicket.Description}</p></div>
                </div>
                <div className="gvt-det-sec">
                  <h4 className="gvt-det-h"><MapPin size={13} /> Ubicación y servicio</h4>
                  <div className="gvt-det-g">
                    <div className="gvt-det-f"><label>Dirección</label><p>{selectedTicket.Direction_Name}</p></div>
                    <div className="gvt-det-f"><label>División</label><p>{selectedTicket.Division_Name}</p></div>
                    <div className="gvt-det-f"><label>Coordinación</label><p>{selectedTicket.Coordination_Name}</p></div>
                    <div className="gvt-det-f"><label>Servicio</label><p>{selectedTicket.Service_Name}</p></div>
                    {selectedTicket.Software_System_Name && (
                      <div className="gvt-det-f"><label>Sistema</label><p><Wrench size={12} /> {selectedTicket.Software_System_Name}</p></div>
                    )}
                    <div className="gvt-det-f"><label>Solicitud</label><p><Calendar size={12} /> {new Date(selectedTicket.Created_at).toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                    {selectedTicket.Status === 'Cerrado' && selectedTicket.Resolved_at && (
                      <div className="gvt-det-f"><label>Cierre</label><p><Clock size={12} /> {new Date(selectedTicket.Resolved_at).toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                    )}
                  </div>
                </div>
                <div className="gvt-det-sec">
                  <h4 className="gvt-det-h"><History size={13} /> Timeline</h4>
                  {timeline.length === 0 ? (
                    <p className="gvt-det-empty">Sin eventos registrados</p>
                  ) : (
                    <div className="gvt-tl">
                      {timeline.filter(e => { const d = (e.Action_Description || '').toLowerCase(); return d.includes('creado') || d.includes('asign') || d.includes('cerrado') || d.includes('closed'); }).map(ev => (
                        <div key={ev.ID_Timeline} className="gvt-tl-i">
                          <div className="gvt-tl-d" />
                          <div>
                            <p className="gvt-tl-a">{ev.Action_Description}</p>
                            <p className="gvt-tl-u">por {ev.User_Name || 'Usuario'}</p>
                            {(ev.Old_Status || ev.New_Status) && (
                              <div className="gvt-tl-s">
                                {ev.Old_Status && <span className="gvt-tl-o">{ev.Old_Status}</span>}
                                {(ev.Old_Status && ev.New_Status) && <span className="gvt-tl-ar">→</span>}
                                {ev.New_Status && <span className="gvt-tl-nw">{ev.New_Status}</span>}
                              </div>
                            )}
                            <span className="gvt-tl-dt">{new Date(ev.Event_Date).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="gvt-det-s">
                <div className="gvt-det-sec">
                  <h4 className="gvt-det-h"><Users size={13} /> Técnicos <span className="gvt-badge-cnt">{selectedTicket.Technicians.length}</span></h4>
                  {selectedTicket.Technicians.length > 0 ? (
                    <div className="gvt-techs">
                      {selectedTicket.Technicians.map(t => (
                        <div key={t.ID_Ticket_Technician} className="gvt-tech-i">
                          <div className="gvt-tech-av sm">{t.Technician_Name.charAt(0)}</div>
                          <div>
                            <span className="gvt-tech-n">{t.Technician_Name} {t.Is_Lead && <Star size={10} className="gvt-star" />}</span>
                            {t.Is_Lead && <span className="gvt-lead">Principal</span>}
                            <span className="gvt-tech-d"><Clock size={9} /> {new Date(t.Assigned_At).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="gvt-det-empty"><UserX size={18} /><p>Sin técnicos</p></div>
                  )}
                </div>
                <div className="gvt-det-sec">
                  <h4 className="gvt-det-h"><MessageSquare size={13} /> Comentarios <span className="gvt-badge-cnt">{comments.length}</span></h4>
                  <div className="gvt-cmts">
                    {comments.length === 0 ? (
                      <div className="gvt-det-empty"><MessageSquare size={18} /><p>Sin comentarios</p></div>
                    ) : (
                      comments.map(c => (
                        <div key={c.ID_Comment} className="gvt-cmt">
                          <div className="gvt-cmt-av">{(c.User_Name || 'U').charAt(0)}</div>
                          <div>
                            <div className="gvt-cmt-h"><span className="gvt-cmt-a">{c.User_Name || 'Usuario'}</span><span className="gvt-cmt-d">{new Date(c.Created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
                            <p className="gvt-cmt-t">{c.Comment_Text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedTicket.Status !== 'Cerrado' ? (
                    <div className="gvt-cmt-f">
                      <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Escribir comentario..." rows={2} />
                      <button className="gvt-btn gvt-btn--primary" onClick={handleSendComment} disabled={!newComment.trim() || loading}><Send size={13} /></button>
                    </div>
                  ) : (
                    <div className="gvt-closed">
                      <Lock size={15} />
                      <div><p className="gvt-closed-t">Ticket cerrado</p><p className="gvt-closed-s">No se pueden agregar comentarios</p></div>
                    </div>
                  )}
                </div>
                {selectedTicket.Status !== 'Cerrado' && (
                  <div className="gvt-det-sec">
                    <button className="gvt-btn gvt-btn--danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCloseTicket} disabled={loading}>
                      <CheckCircle size={14} />
                      {loading ? 'Cerrando...' : 'Cerrar ticket'}
                    </button>
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

export default AdminTicketManagement;
