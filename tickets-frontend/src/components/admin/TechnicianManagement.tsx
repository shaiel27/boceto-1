import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { sileo } from 'sileo';
import TechnicianAnalytics from './TechnicianAnalytics';
import {
  BadgeCheck,
  Users,
  ArrowLeft,
  UserPlus,
  Search,
  Edit,
  Trash2,
  BarChart3,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Calendar,
  Mail,
  Wrench,
  Plus,
  Ticket,
  Network,
  Headphones,
  Code,
  TrendingUp,
  UserCheck,
  Coffee,
  User,
  Lock,
  Briefcase,
  UserX
} from 'lucide-react';
import './TechnicianManagement.css';

interface Technician {
  ID_Technicians: number;
  Fk_Users: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Status: 'Disponible' | 'Ocupado' | 'Inactivo';
  Status_Reason?: 'ticket' | 'lunch' | 'schedule' | null;
  Fk_Lunch_Block?: number;
  Lunch_Block?: {
    name: string;
    hours: string;
  } | null;
  Lunch_Block_Hours?: string;
  TI_Services: TI_Service[];
  Schedules?: Technician_Schedule[];
  created_at: string;
  Avatar?: string;
  Tickets_Assigned?: number;
  Tickets_Resolved?: number;
  AssignedTickets?: AssignedTicket[];
}

interface AssignedTicket {
  ID_Service_Request: string;
  Ticket_Code: string;
  Subject: string;
  Status: string;
  System_Priority: string;
  Coordination_Name: string;
  Assigned_At: string;
}

interface TI_Service {
  ID_TI_Service: number;
  Type_Service: string;
  Details: string;
}

interface Technician_Schedule {
  ID_Schedule: number;
  Fk_Technician: number;
  Day_Of_Week: string;
  Work_Start_Time: string;
  Work_End_Time: string;
}

interface Coordination {
  ID_Coordination: string;
  Name: string;
  Direction_Name: string;
  Division_Name: string;
  Technician_Count: number;
}

const TechnicianManagement: React.FC = () => {
  console.log('TechnicianManagement montado');
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician } = useAuth();

  // Estados principales
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [currentUserTechnician, setCurrentUserTechnician] = useState<Technician | null>(null);
  const [tiServices, setTiServices] = useState<TI_Service[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [technicianSchedules, setTechnicianSchedules] = useState<Technician_Schedule[]>([]);
  const [lunchBlocks, setLunchBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Estados de modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados de formulario
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'Activo',
    fk_lunch_block: '',
    ti_services: [] as number[],
    schedules: {
      Lunes: { start: '08:00', end: '14:00' },
      Martes: { start: '08:00', end: '14:00' },
      Miercoles: { start: '08:00', end: '14:00' },
      Jueves: { start: '08:00', end: '14:00' },
      Viernes: { start: '08:00', end: '14:00' },
      Sabado: { start: '', end: '' },
      Domingo: { start: '', end: '' }
    }
  });

  // Vista actual
  const [currentView, setCurrentView] = useState<'list' | 'analytics'>('list');

  // Cargar datos del API
  useEffect(() => {
    loadData(true);

    const interval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async (showLoading: boolean = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      console.log('Cargando técnicos...');
      const techResponse = await ApiService.getTechnicians();
      console.log('Respuesta del API:', techResponse);

      if (techResponse.success && techResponse.data) {
        console.log('Datos recibidos:', techResponse.data);
        console.log('Número de técnicos:', techResponse.data.length);

        const mappedTechnicians = techResponse.data.map((tech: any) => {
          const mappedTechnician = {
            ID_Technicians: parseInt(tech.ID_Technicians),
            Fk_Users: parseInt(tech.Fk_Users),
            First_Name: tech.First_Name,
            Last_Name: tech.Last_Name,
            Email: tech.Email,
            Status: tech.Status,
            Status_Reason: tech.Status_Reason as 'ticket' | 'lunch' | 'schedule' | null,
            Fk_Lunch_Block: tech.Fk_Lunch_Block ? parseInt(tech.Fk_Lunch_Block) : undefined,
            Lunch_Block: tech.Lunch_Block || null,
            Lunch_Block_Hours: tech.Lunch_Block?.hours || null,
            TI_Services: tech.TI_Services || [],
            Schedules: tech.Schedules || [],
            created_at: tech.created_at,
            Avatar: `${tech.First_Name[0]}${tech.Last_Name[0]}`.toUpperCase(),
            Tickets_Assigned: tech.Tickets_Assigned || 0,
            Tickets_Resolved: tech.Tickets_Resolved || 0,
            AssignedTickets: []
          };

          console.log(`Técnico mapeado: ${tech.First_Name} ${tech.Last_Name} - Estado: ${tech.Status} - Motivo: ${tech.Status_Reason}`);

          return mappedTechnician;
        });

        const hasChanges = JSON.stringify(mappedTechnicians) !== JSON.stringify(technicians);

        if (hasChanges || technicians.length === 0) {
          console.log('Datos han cambiado, actualizando estado...');

          if (isTechnician() && user) {
            const ownProfile = mappedTechnicians.find((t: Technician) => t.Fk_Users === user.id);

            if (ownProfile) {
              setCurrentUserTechnician(ownProfile);
              setTechnicians([ownProfile]);
            } else {
              setError('No se encontró tu perfil de técnico');
              setTechnicians([]);
            }
          } else {
            setTechnicians(mappedTechnicians);
          }
        } else {
          console.log('Datos sin cambios, omitiendo actualización de estado');
        }
      } else {
        setError(techResponse.message || 'Error al cargar técnicos');
      }

      const lunchBlocksResponse = await ApiService.getLunchBlocks();
      if (lunchBlocksResponse.success && lunchBlocksResponse.data) {
        setLunchBlocks(lunchBlocksResponse.data);
      } else {
        setLunchBlocks([
          { ID_Lunch_Block: 1, Block_Name: 'Bloque 1', Start_Time: '11:30', End_Time: '12:10' },
          { ID_Lunch_Block: 2, Block_Name: 'Bloque 2', Start_Time: '12:10', End_Time: '12:50' },
          { ID_Lunch_Block: 3, Block_Name: 'Bloque 3', Start_Time: '12:50', End_Time: '13:30' },
          { ID_Lunch_Block: 4, Block_Name: 'Bloque 4', Start_Time: '13:20', End_Time: '14:00' }
        ]);
      }

      setTiServices([
        { ID_TI_Service: 1, Type_Service: 'Redes', Details: 'Configuración y mantenimiento de redes' },
        { ID_TI_Service: 2, Type_Service: 'Soporte', Details: 'Soporte técnico general' },
        { ID_TI_Service: 3, Type_Service: 'Programación', Details: 'Desarrollo de software y aplicaciones' }
      ]);
    } catch (err) {
      setError('Error de conexión al cargar técnicos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar técnicos
  const filteredTechnicians = useMemo(() => {
    return technicians.filter(technician => {
      const fullName = `${technician.First_Name} ${technician.Last_Name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                           technician.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (technician.TI_Services && technician.TI_Services.length > 0 &&
                            technician.TI_Services.some(s => s.Type_Service.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesStatus = statusFilter === 'all' || technician.Status === statusFilter;
      const matchesService = serviceFilter === 'all' ||
                           (technician.TI_Services && technician.TI_Services.length > 0 &&
                            technician.TI_Services.some(s => s.ID_TI_Service.toString() === serviceFilter));

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [technicians, searchTerm, statusFilter, serviceFilter]);

  // Agrupar técnicos por servicio TI
  const groupedTechnicians = useMemo(() => {
    const groups: Record<string, Technician[]> = {};

    filteredTechnicians.forEach((tech: Technician) => {
      if (tech.TI_Services && tech.TI_Services.length > 0) {
        const primaryService = tech.TI_Services[0].Type_Service;
        if (!groups[primaryService]) {
          groups[primaryService] = [];
        }
        groups[primaryService].push(tech);
      } else {
        if (!groups['Sin Asignar']) {
          groups['Sin Asignar'] = [];
        }
        groups['Sin Asignar'].push(tech);
      }
    });

    return groups;
  }, [filteredTechnicians]);

  // Calcular estadísticas de técnicos
  const stats = useMemo(() => {
    return {
      total: technicians.length,
      available: technicians.filter(t => t.Status === 'Disponible').length,
      busy: technicians.filter(t => t.Status === 'Ocupado').length,
      inactive: technicians.filter(t => t.Status === 'Inactivo').length,
      totalTickets: technicians.reduce((acc, t) => acc + (t.Tickets_Assigned || 0), 0),
      totalResolved: technicians.reduce((acc, t) => acc + (t.Tickets_Resolved || 0), 0)
    };
  }, [technicians]);

  // Manejo de formulario
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const handleScheduleChange = (day: string, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: {
          ...prev.schedules[day as keyof typeof prev.schedules],
          [field]: value
        }
      }
    }));
  };

  const handleServiceToggle = (serviceId: number) => {
    setFormData(prev => ({
      ...prev,
      ti_services: prev.ti_services.includes(serviceId)
        ? prev.ti_services.filter(id => id !== serviceId)
        : [...prev.ti_services, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      sileo.error({ title: 'Error de validación', description: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      sileo.error({ title: 'Error de validación', description: 'Las contraseñas no coinciden' });
      return;
    }

    if (formData.ti_services.length === 0) {
      sileo.error({ title: 'Error de validación', description: 'Debe seleccionar al menos un servicio TI' });
      return;
    }

    const username = `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}`;
    const full_name = `${formData.first_name} ${formData.last_name}`;

    const schedulesObject: Record<string, { start: string; end: string }> = {};
    Object.entries(formData.schedules).forEach(([day, times]) => {
      if (times.start && times.end) {
        schedulesObject[day] = {
          start: times.start + ':00',
          end: times.end + ':00'
        };
      }
    });

    console.log('Creating technician with data:', {
      user: {
        Fk_Role: 2,
        Email: formData.email,
        Password: formData.password,
        Username: username,
        Full_Name: full_name
      },
      technician: {
        First_Name: formData.first_name,
        Last_Name: formData.last_name,
        Fk_Lunch_Block: formData.fk_lunch_block ? parseInt(formData.fk_lunch_block) : null,
        Status: formData.status
      },
      services: formData.ti_services.map(serviceId => ({
        Fk_TI_Service: serviceId,
        Status: 'Activo'
      })),
      schedules: schedulesObject
    });

    try {
      const response = await ApiService.createTechnician({
        username: username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: full_name,
        role_id: 2,
        lunch_block: formData.fk_lunch_block ? parseInt(formData.fk_lunch_block) : null,
        status: formData.status,
        services: formData.ti_services,
        schedules: schedulesObject
      });

      if (response.success) {
        sileo.success({ title: 'Técnico creado', description: `${formData.first_name} ${formData.last_name} se ha registrado exitosamente` });
        loadData();
        setShowAddModal(false);
        resetForm();
      } else {
        sileo.error({ title: 'Error al crear', description: response.message || 'No se pudo crear el técnico' });
      }
    } catch (error) {
      console.error('Error al crear técnico:', error);
      sileo.error({ title: 'Error de conexión', description: 'No se pudo conectar con el servidor al crear el técnico' });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      status: 'Activo',
      fk_lunch_block: '',
      ti_services: [] as number[],
      schedules: {
        Lunes: { start: '08:00', end: '14:00' },
        Martes: { start: '08:00', end: '14:00' },
        Miercoles: { start: '08:00', end: '14:00' },
        Jueves: { start: '08:00', end: '14:00' },
        Viernes: { start: '08:00', end: '14:00' },
        Sabado: { start: '', end: '' },
        Domingo: { start: '', end: '' }
      }
    });
  };

  const handleDelete = async () => {
    if (selectedTechnician) {
      try {
        const response = await ApiService.deleteTechnician(selectedTechnician.ID_Technicians);
        if (response.success) {
          sileo.success({ title: 'Técnico eliminado', description: `${selectedTechnician.First_Name} ${selectedTechnician.Last_Name} ha sido eliminado del sistema` });
          loadData();
          setShowDeleteModal(false);
          setSelectedTechnician(null);
        } else {
          sileo.error({ title: 'Error al eliminar', description: response.message || 'No se pudo eliminar el técnico' });
        }
      } catch (error) {
        sileo.error({ title: 'Error de conexión', description: 'No se pudo conectar con el servidor al eliminar el técnico' });
      }
    }
  };

  const handleEdit = async (technician: Technician) => {
    setSelectedTechnician(technician);

    const schedules = {
      Lunes: { start: '', end: '' },
      Martes: { start: '', end: '' },
      Miercoles: { start: '', end: '' },
      Jueves: { start: '', end: '' },
      Viernes: { start: '', end: '' },
      Sabado: { start: '', end: '' },
      Domingo: { start: '', end: '' }
    };

    if (technician.Schedules && Array.isArray(technician.Schedules)) {
      technician.Schedules.forEach((schedule: any) => {
        const dayKey = schedule.Day_Of_Week;
        if (schedules.hasOwnProperty(dayKey)) {
          schedules[dayKey as keyof typeof schedules] = {
            start: schedule.Work_Start_Time || '',
            end: schedule.Work_End_Time || ''
          };
        }
      });
    }

    const currentServices = technician.TI_Services && Array.isArray(technician.TI_Services)
      ? technician.TI_Services.map((s: any) => Number(s.ID_TI_Service))
      : [];

    setFormData({
      first_name: technician.First_Name || '',
      last_name: technician.Last_Name || '',
      email: technician.Email || '',
      password: '',
      confirmPassword: '',
      status: technician.Status || 'Activo',
      fk_lunch_block: technician.Fk_Lunch_Block ? String(technician.Fk_Lunch_Block) : '',
      ti_services: currentServices,
      schedules
    });

    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTechnician) return;

    if (formData.password && formData.password.length < 6) {
      sileo.error({ title: 'Error de validación', description: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      sileo.error({ title: 'Error de validación', description: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        lunch_block: formData.fk_lunch_block || null,
        services: Array.from(new Set(formData.ti_services.map(Number))),
        schedules: formData.schedules
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log('Enviando datos de actualización:', updateData);
      console.log('Servicios finales:', updateData.services);

      const response = await ApiService.updateTechnician(selectedTechnician.ID_Technicians, updateData);

      if (response.success) {
        sileo.success({ title: 'Técnico actualizado', description: `Los datos de ${selectedTechnician.First_Name} ${selectedTechnician.Last_Name} se han actualizado correctamente` });
        loadData();
        setShowEditModal(false);
        setSelectedTechnician(null);
        resetForm();
      } else {
        sileo.error({ title: 'Error al actualizar', description: response.message || 'No se pudo actualizar el técnico' });
      }
    } catch (error) {
      console.error('Error al actualizar técnico:', error);
      sileo.error({ title: 'Error de conexión', description: 'No se pudo conectar con el servidor al actualizar el técnico' });
    }
  };

  const generatePDFReport = () => {
    sileo.success({ title: 'Reporte PDF', description: 'Generando reporte PDF... (Función se implementará con el backend)' });
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'redes':
        return <Network size={20} />;
      case 'soporte':
        return <Headphones size={20} />;
      case 'programación':
        return <Code size={20} />;
      default:
        return <Wrench size={20} />;
    }
  };

  const getServiceColor = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'redes':
        return '#2563eb';
      case 'soporte':
        return '#059669';
      case 'programación':
        return '#7c3aed';
      default:
        return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'success';
      case 'Ocupado': return 'warning';
      case 'Inactivo': return 'danger';
      default: return 'secondary';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    return 'poor';
  };

  const normalizeText = (text: string): string => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const getCurrentDayName = (): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return days[new Date().getDay()];
  };

  const getTodaySchedule = (schedules: Technician_Schedule[] | undefined) => {
    if (!schedules || schedules.length === 0) {
      return null;
    }
    const currentDay = getCurrentDayName();
    const normalizedCurrentDay = normalizeText(currentDay);

    const todaySchedule = schedules.find(s =>
      s.Day_Of_Week === currentDay ||
      normalizeText(s.Day_Of_Week) === normalizedCurrentDay
    );

    return todaySchedule;
  };

  const getVenezuelaTime = (): Date => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const venezuelaOffset = -4;
    return new Date(utc + (venezuelaOffset * 3600000));
  };

  const isTimeInRange = (currentTime: string, startTime: string, endTime: string): boolean => {
    const current = currentTime.split(':').map(Number);
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);

    const currentMinutes = current[0] * 60 + current[1];
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const getStatusReasonLabel = (reason: 'ticket' | 'lunch' | 'schedule' | null): string => {
    switch (reason) {
      case 'ticket':
        return 'Con tickets activos';
      case 'lunch':
        return 'En bloque de almuerzo';
      case 'schedule':
        return 'Fuera de horario laboral';
      case null:
        return 'Disponible';
      default:
        return '';
    }
  };

  const selectedServiceIds = formData.ti_services;

  return (
    <div className="tm-page">
      <div className="tm-container">
        {/* ─── Header ─── */}
        <header className="tm-header">
          <div className="tm-header-row">
            <div className="tm-header-left">
              <button className="tm-back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={16} />
                <span>Dashboard</span>
              </button>
              <div className="tm-header-icon-wrap">
                <BadgeCheck size={22} />
              </div>
              <div className="tm-header-info">
                <h1 className="tm-header-title">
                  {isTechnician() ? 'Mi Perfil Técnico' : 'Equipo Técnico Municipal'}
                </h1>
                <p className="tm-header-subtitle">
                  {isTechnician() ? 'Gestiona tu información personal y horarios' : 'Conoce y gestiona a los profesionales que mantienen nuestra ciudad funcionando'}
                </p>
              </div>
            </div>

            <div className="tm-header-pills">
              {isTechnician() && currentUserTechnician ? (
                <>
                  <div className="tm-pill">
                    <div className="tm-pill-icon assigned">
                      <Ticket size={14} />
                    </div>
                    <div className="tm-pill-info">
                      <span className="tm-pill-value">{currentUserTechnician.Tickets_Assigned || 0}</span>
                      <span className="tm-pill-label">Asignados</span>
                    </div>
                  </div>
                  <div className="tm-pill">
                    <div className="tm-pill-icon resolved">
                      <CheckCircle size={14} />
                    </div>
                    <div className="tm-pill-info">
                      <span className="tm-pill-value">{currentUserTechnician.Tickets_Resolved || 0}</span>
                      <span className="tm-pill-label">Resueltos</span>
                    </div>
                  </div>
                  <div className="tm-pill">
                    <div className="tm-pill-icon schedule">
                      <Calendar size={14} />
                    </div>
                    <div className="tm-pill-info">
                      <span className="tm-pill-value">{currentUserTechnician.Schedules?.length || 0}</span>
                      <span className="tm-pill-label">Días</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="tm-pill">
                    <div className="tm-pill-icon total">
                      <Users size={14} />
                    </div>
                    <div className="tm-pill-info">
                      <span className="tm-pill-value">{stats.total}</span>
                      <span className="tm-pill-label">Total</span>
                    </div>
                  </div>
                  <div className="tm-pill">
                    <div className="tm-pill-icon available">
                      <CheckCircle size={14} />
                    </div>
                    <div className="tm-pill-info">
                      <span className="tm-pill-value">{stats.available}</span>
                      <span className="tm-pill-label">Disponibles</span>
                    </div>
                  </div>
                  <div className="tm-pill">
                    <div className="tm-pill-icon busy">
                      <Clock size={14} />
                    </div>
                    <div className="tm-pill-info">
                      <span className="tm-pill-value">{stats.busy}</span>
                      <span className="tm-pill-label">Ocupados</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ─── Stats Bar ─── */}
        <div className="tm-stats">
          <div className="tm-stat">
            <span className="tm-stat-label">Total Técnicos</span>
            <span className="tm-stat-value">{stats.total}</span>
          </div>
          <div className="tm-stat-sep" />
          <div className="tm-stat success">
            <span className="tm-stat-label">Disponibles</span>
            <span className="tm-stat-value">{stats.available}</span>
          </div>
          <div className="tm-stat-sep" />
          <div className="tm-stat warning">
            <span className="tm-stat-label">Ocupados</span>
            <span className="tm-stat-value">{stats.busy}</span>
          </div>
          <div className="tm-stat-sep" />
          <div className="tm-stat danger">
            <span className="tm-stat-label">Inactivos</span>
            <span className="tm-stat-value">{stats.inactive}</span>
          </div>
          <div className="tm-stat-sep" />
          <div className="tm-stat info">
            <span className="tm-stat-label">Tickets Asignados</span>
            <span className="tm-stat-value">{stats.totalTickets}</span>
          </div>
        </div>

        {/* ─── Toolbar ─── */}
        <div className="tm-toolbar">
          <div className="tm-toolbar-search">
            <Search size={16} className="tm-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, especialidad o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tm-search-input"
            />
          </div>
          <div className="tm-toolbar-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="tm-filter-select"
            >
              <option value="all">Todos los estados</option>
              <option value="Disponible">Disponibles</option>
              <option value="Ocupado">Ocupados</option>
              <option value="Inactivo">Inactivos</option>
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="tm-filter-select"
            >
              <option value="all">Todos los servicios</option>
              {tiServices.map(service => (
                <option key={service.ID_TI_Service} value={service.ID_TI_Service.toString()}>
                  {service.Type_Service}
                </option>
              ))}
            </select>
          </div>
          <div className="tm-toolbar-actions">
            {!isTechnician() && (
              <button className="tm-btn tm-btn-primary" onClick={() => setShowAddModal(true)}>
                <UserPlus size={16} />
                Nuevo Técnico
              </button>
            )}
          </div>
        </div>

        {/* ─── View Tabs ─── */}
        <div className="tm-view-bar">
          <div className="tm-view-tabs">
            <button
              className={`tm-tab-btn ${currentView === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentView('list')}
            >
              <BarChart3 size={14} />
              <span>Lista Agrupada</span>
            </button>
            <button
              className={`tm-tab-btn ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={() => setCurrentView('analytics')}
            >
              <TrendingUp size={14} />
              <span>Análisis</span>
            </button>
          </div>
          <span className="tm-results-count">{filteredTechnicians.length} profesionales encontrados</span>
        </div>

        {/* ─── Content ─── */}
        <div className="tm-content">
          {loading ? (
            <div className="tm-loading">
              <div className="tm-spinner" />
              <p>Cargando técnicos...</p>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="tm-empty">
              <BadgeCheck size={40} className="tm-empty-icon" />
              <h3>No se encontraron técnicos</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : currentView === 'list' ? (
            <div className="tm-groups">
              {Object.entries(groupedTechnicians).map(([serviceName, techs]: [string, Technician[]]) => (
                <div key={serviceName} className="tm-group">
                  <div className="tm-group-header">
                    <div className="tm-group-info">
                      <div className="tm-group-icon" style={{ background: getServiceColor(serviceName) }}>
                        {getServiceIcon(serviceName)}
                      </div>
                      <h3 className="tm-group-title">{serviceName}</h3>
                      <span className="tm-group-count">{techs.length} técnicos</span>
                    </div>
                    <div className="tm-group-stats">
                      <span className="tm-group-stat">
                        <UserCheck size={13} />
                        {techs.filter((t: Technician) => t.Status === 'Disponible').length} disponibles
                      </span>
                      <span className="tm-group-stat">
                        <Clock size={13} />
                        {techs.reduce((acc: number, t: Technician) => acc + (t.Tickets_Assigned || 0), 0)} tickets
                      </span>
                    </div>
                  </div>
                  <div className="tm-table-wrap">
                    <table className="tm-table">
                      <thead>
                        <tr>
                          <th>Técnico</th>
                          <th>Bloque Almuerzo</th>
                          <th>Horario Hoy</th>
                          <th>Estado</th>
                          <th>Tickets</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {techs.map((technician: Technician) => {
                          const todaySchedule = getTodaySchedule(technician.Schedules);
                          const todayScheduleText = todaySchedule
                            ? `${todaySchedule.Work_Start_Time} - ${todaySchedule.Work_End_Time}`
                            : 'No trabaja';

                          return (
                            <tr key={technician.ID_Technicians}>
                              <td className="tm-cell-name">
                                <div className="tm-profile">
                                  <div className="tm-avatar">
                                    {technician.Avatar || `${technician.First_Name[0]}${technician.Last_Name[0]}`}
                                  </div>
                                  <div className="tm-name-info">
                                    <div className="tm-name">
                                      {technician.First_Name} {technician.Last_Name}
                                    </div>
                                    <div className="tm-id">ID: {technician.ID_Technicians}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="tm-cell-lunch">
                                {technician.Lunch_Block ? (
                                  <div className="tm-lunch-info">
                                    <span className="tm-lunch-name">
                                      <Coffee size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle', color: '#f59e0b' }} />
                                      {technician.Lunch_Block.name}
                                    </span>
                                    <span className="tm-lunch-hours">{technician.Lunch_Block.hours}</span>
                                  </div>
                                ) : (
                                  <span className="tm-lunch-none">Sin asignar</span>
                                )}
                              </td>
                              <td className="tm-cell-schedule">
                                <div className="tm-schedule-info">
                                  <Clock size={13} className="tm-schedule-icon" />
                                  <span>{todayScheduleText}</span>
                                </div>
                              </td>
                              <td className="tm-cell-status">
                                <div className={`tm-status-orb ${technician.Status.toLowerCase()}`} title={technician.Status}>
                                  <span className="tm-status-orb-icon">
                                    {technician.Status === 'Disponible' && <CheckCircle size={16} />}
                                    {technician.Status === 'Ocupado' && !technician.Status_Reason && <AlertCircle size={16} />}
                                    {technician.Status === 'Ocupado' && technician.Status_Reason === 'ticket' && <Ticket size={16} />}
                                    {technician.Status === 'Ocupado' && technician.Status_Reason === 'lunch' && <Coffee size={16} />}
                                    {technician.Status === 'Ocupado' && technician.Status_Reason === 'schedule' && <Clock size={16} />}
                                    {technician.Status === 'Inactivo' && <XCircle size={16} />}
                                  </span>
                                  <span className="tm-orb-tooltip">
                                    {technician.Status}
                                    {technician.Status_Reason ? ` — ${getStatusReasonLabel(technician.Status_Reason)}` : ''}
                                  </span>
                                </div>
                              </td>
                              <td className="tm-cell-tickets">
                                <div className="tm-tickets-info">
                                  <span className="tm-tickets-val">{technician.Tickets_Assigned || 0}</span>
                                  <span className="tm-tickets-label">{technician.Tickets_Resolved || 0} resueltos</span>
                                </div>
                              </td>
                              <td className="tm-cell-actions">
                                <div className="tm-actions">
                                  <button
                                    className="tm-action-btn"
                                    onClick={() => {
                                      setSelectedTechnician(technician);
                                      setShowDetailModal(true);
                                    }}
                                    title="Ver detalles"
                                  >
                                    <Eye size={15} />
                                  </button>
                                  {!isTechnician() || technician.Fk_Users === user?.id ? (
                                    <>
                                      <button
                                        className="tm-action-btn"
                                        onClick={() => handleEdit(technician)}
                                        title="Editar"
                                      >
                                        <Edit size={15} />
                                      </button>
                                      {!isTechnician() && (
                                        <button
                                          className="tm-action-btn danger"
                                          onClick={() => {
                                            setSelectedTechnician(technician);
                                            setShowDeleteModal(true);
                                          }}
                                          title="Eliminar"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      )}
                                    </>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TechnicianAnalytics />
          )}
        </div>
      </div>

      {/* ─── Modal: Agregar Técnico ─── */}
      {showAddModal && (
        <div className="tm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="tm-panel">
            <div className="tm-panel-header">
              <div className="tm-panel-title">
                <h2>Agregar Nuevo Técnico</h2>
                <p className="tm-panel-subtitle">Complete la información para registrar un nuevo profesional en el sistema</p>
              </div>
              <button className="tm-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="tm-form">
              <div className="tm-form-sections">
                {/* Información Personal */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <User size={16} />
                    <span>Información Personal</span>
                  </div>
                  <div className="tm-form-grid">
                    <div className="tm-field">
                      <label>Primer Nombre</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        maxLength={25}
                        placeholder="Ej: Juan"
                      />
                    </div>
                    <div className="tm-field">
                      <label>Apellido</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        maxLength={25}
                        placeholder="Ej: Pérez"
                      />
                    </div>
                    <div className="tm-field">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div className="tm-field">
                      <label>Nombre de Usuario</label>
                      <input
                        type="text"
                        value={`${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}`}
                        disabled
                        placeholder="Se genera automáticamente"
                      />
                    </div>
                  </div>
                </div>

                {/* Credenciales de Acceso */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Lock size={16} />
                    <span>Credenciales de Acceso</span>
                  </div>
                  <div className="tm-form-grid">
                    <div className="tm-field">
                      <label>Contraseña</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div className="tm-field">
                      <label>Confirmar Contraseña</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="Repita la contraseña"
                      />
                    </div>
                  </div>
                </div>

                {/* Información del Técnico */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Briefcase size={16} />
                    <span>Información del Técnico</span>
                  </div>
                  <div className="tm-form-grid">
                    <div className="tm-field">
                      <label>Estado Inicial</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} required>
                        <option value="Disponible">Disponible</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                    <div className="tm-field">
                      <label>Bloque de Almuerzo (Opcional)</label>
                      <select name="fk_lunch_block" value={formData.fk_lunch_block} onChange={handleInputChange}>
                        <option value="">Sin bloque de almuerzo</option>
                        {lunchBlocks.map(block => (
                          <option key={block.ID_Lunch_Block} value={block.ID_Lunch_Block}>
                            {block.Block_Name} ({block.Start_Time} - {block.End_Time})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Servicios TI */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Wrench size={16} />
                    <span>Servicios TI</span>
                    <span className="tm-service-count">{selectedServiceIds.length} seleccionados</span>
                  </div>
                  <div className="tm-services-grid">
                    {tiServices.map(service => (
                      <label
                        key={service.ID_TI_Service}
                        className={`tm-service-card ${selectedServiceIds.includes(service.ID_TI_Service) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(service.ID_TI_Service)}
                          onChange={() => handleServiceToggle(service.ID_TI_Service)}
                        />
                        <div className="tm-service-icon">{getServiceIcon(service.Type_Service)}</div>
                        <div className="tm-service-text">
                          <span className="tm-service-name">{service.Type_Service}</span>
                          <span className="tm-service-desc">{service.Details}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horario de Trabajo */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Calendar size={16} />
                    <span>Horario de Trabajo</span>
                  </div>
                  <div className="tm-schedule-grid">
                    {Object.keys(formData.schedules).map(day => (
                      <div key={day} className="tm-schedule-row">
                        <div className="tm-schedule-day">{day}</div>
                        <div className="tm-schedule-times">
                          <input
                            type="time"
                            value={formData.schedules[day as keyof typeof formData.schedules].start}
                            onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                          />
                          <span className="tm-schedule-sep">-</span>
                          <input
                            type="time"
                            value={formData.schedules[day as keyof typeof formData.schedules].end}
                            onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="tm-form-actions">
                <button type="button" className="tm-btn tm-btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="tm-btn tm-btn-primary">
                  <Plus size={16} />
                  Crear Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Editar Técnico ─── */}
      {showEditModal && selectedTechnician && (
        <div className="tm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="tm-panel">
            <div className="tm-panel-header">
              <div className="tm-panel-title">
                <h2>Editar Técnico</h2>
                <p className="tm-panel-subtitle">Modifica la información del técnico seleccionado</p>
              </div>
              <button className="tm-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="tm-form">
              <div className="tm-form-sections">
                {/* Información Personal */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <User size={16} />
                    <span>Información Personal</span>
                  </div>
                  <div className="tm-form-grid">
                    <div className="tm-field">
                      <label>Primer Nombre</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        maxLength={25}
                        placeholder="Ej: Juan"
                      />
                    </div>
                    <div className="tm-field">
                      <label>Apellido</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        maxLength={25}
                        placeholder="Ej: Pérez"
                      />
                    </div>
                    <div className="tm-field">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div className="tm-field">
                      <label>Nombre de Usuario</label>
                      <input
                        type="text"
                        value={`${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}`}
                        disabled
                        placeholder="Se genera automáticamente"
                      />
                    </div>
                  </div>
                </div>

                {/* Credenciales de Acceso */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Lock size={16} />
                    <span>Credenciales de Acceso</span>
                  </div>
                  <div className="tm-form-grid">
                    <div className="tm-field">
                      <label>Nueva Contraseña (Opcional)</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Dejar vacío para mantener la actual"
                        minLength={6}
                      />
                    </div>
                    <div className="tm-field">
                      <label>Confirmar Contraseña</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repita la nueva contraseña"
                        disabled={!formData.password}
                      />
                    </div>
                  </div>
                </div>

                {/* Información del Técnico */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Briefcase size={16} />
                    <span>Información del Técnico</span>
                  </div>
                  <div className="tm-form-grid">
                    <div className="tm-field">
                      <label>Bloque de Almuerzo (Opcional)</label>
                      <select name="fk_lunch_block" value={formData.fk_lunch_block} onChange={handleInputChange}>
                        <option value="">Sin bloque de almuerzo</option>
                        {lunchBlocks.map(block => (
                          <option key={block.ID_Lunch_Block} value={block.ID_Lunch_Block}>
                            {block.Block_Name} ({block.Start_Time} - {block.End_Time})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Servicios TI */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Wrench size={16} />
                    <span>Servicios TI</span>
                    <span className="tm-service-count">{selectedServiceIds.length} seleccionados</span>
                  </div>
                  <div className="tm-services-grid">
                    {tiServices.map(service => (
                      <label
                        key={service.ID_TI_Service}
                        className={`tm-service-card ${selectedServiceIds.includes(service.ID_TI_Service) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(service.ID_TI_Service)}
                          onChange={() => handleServiceToggle(service.ID_TI_Service)}
                        />
                        <div className="tm-service-icon">{getServiceIcon(service.Type_Service)}</div>
                        <div className="tm-service-text">
                          <span className="tm-service-name">{service.Type_Service}</span>
                          <span className="tm-service-desc">{service.Details}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horario de Trabajo */}
                <div className="tm-form-section">
                  <div className="tm-section-title">
                    <Calendar size={16} />
                    <span>Horario de Trabajo</span>
                  </div>
                  <div className="tm-schedule-grid">
                    {Object.keys(formData.schedules).map(day => (
                      <div key={day} className="tm-schedule-row">
                        <div className="tm-schedule-day">{day}</div>
                        <div className="tm-schedule-times">
                          <input
                            type="time"
                            value={formData.schedules[day as keyof typeof formData.schedules].start}
                            onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                          />
                          <span className="tm-schedule-sep">-</span>
                          <input
                            type="time"
                            value={formData.schedules[day as keyof typeof formData.schedules].end}
                            onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="tm-form-actions">
                <button type="button" className="tm-btn tm-btn-ghost" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="tm-btn tm-btn-primary">
                  <Edit size={16} />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Detalles ─── */}
      {showDetailModal && selectedTechnician && (
        <div className="tm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}>
          <div className="tm-modal">
            <div className="tm-modal-header">
              <h2>Detalles del Técnico</h2>
              <button className="tm-close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="tm-detail">
              <div className="tm-detail-top">
                <div className="tm-detail-avatar">
                  {selectedTechnician.Avatar}
                </div>
                <div className="tm-detail-summary">
                  <h3>{selectedTechnician.First_Name} {selectedTechnician.Last_Name}</h3>
                  <p>ID Usuario: {selectedTechnician.Fk_Users}</p>
                </div>
              </div>

              <div className="tm-detail-grid">
                <div className="tm-detail-section">
                  <h4>Información Personal</h4>
                  <div className="tm-detail-list">
                    <div className="tm-detail-item">
                      <Mail size={15} />
                      <span>{selectedTechnician.Email}</span>
                    </div>
                    <div className="tm-detail-item">
                      <Calendar size={15} />
                      <span>Creado: {new Date(selectedTechnician.created_at).toLocaleDateString()}</span>
                    </div>
                    {selectedTechnician.Lunch_Block_Hours && (
                      <div className="tm-detail-item">
                        <Coffee size={15} />
                        <span>Bloque de Almuerzo: {selectedTechnician.Lunch_Block_Hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tm-detail-section">
                  <h4>Servicios TI</h4>
                  <div className="tm-detail-services">
                    {selectedTechnician.TI_Services.map(service => (
                      <span key={service.ID_TI_Service} className="tm-detail-badge">
                        {service.Type_Service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="tm-detail-section">
                  <h4>Horario de Trabajo</h4>
                  {selectedTechnician.Schedules && selectedTechnician.Schedules.length > 0 ? (
                    <div className="tm-detail-schedule">
                      {(() => {
                        const scheduleMap = new Map();
                        selectedTechnician.Schedules.forEach(schedule => {
                          const day = schedule.Day_Of_Week;
                          if (!scheduleMap.has(day)) {
                            scheduleMap.set(day, schedule);
                          }
                        });
                        return Array.from(scheduleMap.values()).map(schedule => (
                          <div key={schedule.ID_Schedule} className="tm-detail-day">
                            <span className="tm-day-label">{schedule.Day_Of_Week}:</span>
                            <span className="tm-time-range">
                              {schedule.Work_Start_Time.substring(0, 5)} - {schedule.Work_End_Time.substring(0, 5)}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <p className="tm-no-schedule">Sin horario definido</p>
                  )}
                </div>

                <div className="tm-detail-section">
                  <h4>Rendimiento</h4>
                  <div className="tm-performance">
                    <div className="tm-metric">
                      <span className="tm-metric-value">{selectedTechnician.Tickets_Assigned || 0}</span>
                      <span className="tm-metric-label">Tickets Asignados</span>
                    </div>
                    <div className="tm-metric">
                      <span className="tm-metric-value">{selectedTechnician.Tickets_Resolved || 0}</span>
                      <span className="tm-metric-label">Tickets Resueltos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Eliminar ─── */}
      {showDeleteModal && selectedTechnician && (
        <div className="tm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="tm-modal tm-modal-sm">
            <div className="tm-modal-header">
              <h2>Eliminar Técnico</h2>
              <button className="tm-close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="tm-delete-confirm">
              <div className="tm-warning-icon">
                <UserX size={48} />
              </div>
              <p>¿Estás seguro de que deseas eliminar al técnico <strong>{selectedTechnician.First_Name} {selectedTechnician.Last_Name}</strong>?</p>
              <p className="tm-warning-text">Esta acción no se puede deshacer.</p>
            </div>

            <div className="tm-modal-actions">
              <button className="tm-modal-btn tm-modal-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="tm-modal-btn tm-modal-btn-danger" onClick={handleDelete}>
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianManagement;
