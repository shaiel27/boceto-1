import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  TrendingUp,
  Activity,
  Download,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Clock,
  Star,
  Briefcase,
  GraduationCap,
  Shield,
  ChevronDown,
  X,
  Plus,
  BarChart3,
  Building,
  Wrench,
  Coffee,
  Heart,
  ArrowLeft
} from 'lucide-react';
import './TechnicianManagement.css';

interface Technician {
  ID_Technicians: number;
  Fk_Users: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Status: 'Activo' | 'Inactivo';
  Fk_Lunch_Block?: number;
  Lunch_Block_Hours?: string;
  TI_Services: TI_Service[];
  Schedules?: Technician_Schedule[];
  created_at: string;
  Avatar?: string;
  Tickets_Assigned?: number;
  Tickets_Resolved?: number;
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
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'analytics'>('grid');

  // Cargar datos del API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load technicians
      console.log('Cargando técnicos desde backend...');
      const techResponse = await ApiService.getTechnicians();
      console.log('Respuesta del backend:', techResponse);
      
      if (techResponse.success && techResponse.data) {
        console.log('Datos de técnicos recibidos:', techResponse.data);
        // Map backend data to frontend format
        const mappedTechnicians = techResponse.data.map((tech: any) => {
          // Parse Services string into TI_Services array
          // Map service names to IDs based on TI_Service table
          const serviceMap: { [key: string]: number } = {
            'Redes': 1,
            'Soporte': 2,
            'Programación': 3
          };

          const servicesArray = tech.Services ? tech.Services.split(',').map((s: string) => {
            const serviceName = s.trim();
            return {
              ID_TI_Service: serviceMap[serviceName] || 0,
              Type_Service: serviceName,
              Details: serviceName
            };
          }) : [];

          // Format lunch block hours from backend data
          const lunchBlockHours = tech.Start_Time && tech.End_Time
            ? `${tech.Start_Time.substring(0, 5)} - ${tech.End_Time.substring(0, 5)}`
            : undefined;

          // Map schedules from backend
          const schedulesArray = tech.Schedules && Array.isArray(tech.Schedules)
            ? tech.Schedules.map((s: any) => ({
                ID_Schedule: s.ID_Schedule,
                Fk_Technician: s.Fk_Technician,
                Day_Of_Week: s.Day_Of_Week,
                Work_Start_Time: s.Work_Start_Time.substring(0, 5),
                Work_End_Time: s.Work_End_Time.substring(0, 5)
              }))
            : [];

          return {
            ID_Technicians: parseInt(tech.ID_Technicians),
            Fk_Users: parseInt(tech.Fk_Users),
            First_Name: tech.First_Name,
            Last_Name: tech.Last_Name,
            Email: tech.Email,
            Status: tech.Status,
            Fk_Lunch_Block: tech.Fk_Lunch_Block ? parseInt(tech.Fk_Lunch_Block) : undefined,
            Lunch_Block_Hours: lunchBlockHours,
            TI_Services: servicesArray,
            Schedules: schedulesArray,
            created_at: tech.created_at,
            Avatar: `${tech.First_Name[0]}${tech.Last_Name[0]}`.toUpperCase(),
            Tickets_Assigned: 0,
            Tickets_Resolved: 0
          };
        });

        // Filter technicians based on user role
        if (isTechnician() && user) {
          // If user is technician, find their own profile by matching user ID
          console.log('Usuario logueado ID:', user.id);
          console.log('Técnicos mapeados:', mappedTechnicians.map((t: Technician) => ({ id: t.ID_Technicians, fk_users: t.Fk_Users, name: t.First_Name + ' ' + t.Last_Name })));
          
          const ownProfile = mappedTechnicians.find((t: Technician) => t.Fk_Users === user.id);
          console.log('Perfil encontrado:', ownProfile);
          
          if (ownProfile) {
            setCurrentUserTechnician(ownProfile);
            setTechnicians([ownProfile]);
          } else {
            setError('No se encontró tu perfil de técnico');
            setTechnicians([]);
          }
        } else {
          // Admin sees all technicians
          setTechnicians(mappedTechnicians);
        }
      } else {
        setError(techResponse.message || 'Error al cargar técnicos');
      }

      // Load lunch blocks from backend
      const lunchBlocksResponse = await ApiService.getLunchBlocks();
      if (lunchBlocksResponse.success && lunchBlocksResponse.data) {
        setLunchBlocks(lunchBlocksResponse.data);
      } else {
        // Use default lunch blocks if backend fails
        setLunchBlocks([
          { ID_Lunch_Block: 1, Block_Name: 'Bloque 1', Start_Time: '11:30', End_Time: '12:10' },
          { ID_Lunch_Block: 2, Block_Name: 'Bloque 2', Start_Time: '12:10', End_Time: '12:50' },
          { ID_Lunch_Block: 3, Block_Name: 'Bloque 3', Start_Time: '12:50', End_Time: '13:30' },
          { ID_Lunch_Block: 4, Block_Name: 'Bloque 4', Start_Time: '13:20', End_Time: '14:00' }
        ]);
      }

      // Mock TI Services for now - should come from backend
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
  const filteredTechnicians = technicians.filter(technician => {
    const fullName = `${technician.First_Name} ${technician.Last_Name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         technician.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.TI_Services.some(s => s.Type_Service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || technician.Status === statusFilter;
    const matchesService = serviceFilter === 'all' || 
                         technician.TI_Services.some(s => s.ID_TI_Service.toString() === serviceFilter);
    
    return matchesSearch && matchesStatus && matchesService;
  });

  // Agrupar técnicos por servicio TI
  const techniciansByService = tiServices.map(service => ({
    ...service,
    technicians: filteredTechnicians.filter(t => t.TI_Services.some(s => s.ID_TI_Service === service.ID_TI_Service))
  })).filter(service => service.technicians.length > 0);

  // Estadísticas
  const stats = {
    total: technicians.length,
    active: technicians.filter(t => t.Status === 'Activo').length,
    inactive: technicians.filter(t => t.Status === 'Inactivo').length,
    totalTickets: technicians.reduce((acc, t) => acc + (t.Tickets_Assigned || 0), 0),
    totalResolved: technicians.reduce((acc, t) => acc + (t.Tickets_Resolved || 0), 0)
  };

  // Manejo de formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
    
    // Validar contraseña
    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    const selectedServices = tiServices.filter(s => formData.ti_services.includes(s.ID_TI_Service));

    console.log('Creating technician with data:', {
      username: formData.first_name.toLowerCase() + '.' + formData.last_name.toLowerCase(),
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      lunch_block: formData.fk_lunch_block || null,
      services: formData.ti_services,
      schedules: formData.schedules
    });

    try {
      const response = await ApiService.createTechnician({
        username: formData.first_name.toLowerCase() + '.' + formData.last_name.toLowerCase(),
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        lunch_block: formData.fk_lunch_block || null,
        services: formData.ti_services,
        schedules: formData.schedules
      });

      if (response.success) {
        alert('Técnico creado exitosamente');
        loadData();
        setShowAddModal(false);
        resetForm();
      } else {
        alert(response.message || 'Error al crear técnico');
      }
    } catch (error) {
      alert('Error de conexión al crear técnico');
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
          alert('Técnico eliminado exitosamente');
          loadData();
          setShowDeleteModal(false);
          setSelectedTechnician(null);
        } else {
          alert(response.message || 'Error al eliminar técnico');
        }
      } catch (error) {
        alert('Error de conexión al eliminar técnico');
      }
    }
  };

  const handleEdit = async (technician: Technician) => {
    setSelectedTechnician(technician);

    // Cargar horarios del técnico desde el objeto technician (ya vienen del backend)
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
        schedules[schedule.Day_Of_Week as keyof typeof schedules] = {
          start: schedule.Work_Start_Time,
          end: schedule.Work_End_Time
        };
      });
    }

    setFormData({
      first_name: technician.First_Name,
      last_name: technician.Last_Name,
      email: technician.Email,
      password: '',
      confirmPassword: '',
      status: technician.Status,
      fk_lunch_block: technician.Fk_Lunch_Block ? technician.Fk_Lunch_Block.toString() : '',
      ti_services: technician.TI_Services.map(s => s.ID_TI_Service),
      schedules
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTechnician) return;
    
    // Solo validar contraseña si se está cambiando
    if (formData.password && formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      const response = await ApiService.updateTechnician(selectedTechnician.ID_Technicians, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        status: formData.status,
        lunch_block: formData.fk_lunch_block || null,
        services: formData.ti_services,
        schedules: formData.schedules
      });

      if (response.success) {
        alert('Técnico actualizado exitosamente');
        loadData();
        setShowEditModal(false);
        setSelectedTechnician(null);
        resetForm();
      } else {
        alert(response.message || 'Error al actualizar técnico');
      }
    } catch (error) {
      alert('Error de conexión al actualizar técnico');
    }
  };

  const generatePDFReport = () => {
    // Placeholder para generación de PDF
    alert('Generando reporte PDF... (Función se implementará con el backend)');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'success';
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

  // Función para normalizar texto (eliminar acentos)
  const normalizeText = (text: string): string => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Obtener el nombre del día actual en español (sin acentos para coincidir con BD)
  const getCurrentDayName = (): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return days[new Date().getDay()];
  };

  // Obtener el horario del día actual para un técnico
  const getTodaySchedule = (schedules: Technician_Schedule[] | undefined) => {
    if (!schedules || schedules.length === 0) {
      return null;
    }
    const currentDay = getCurrentDayName();
    const normalizedCurrentDay = normalizeText(currentDay);
    
    // Buscar el horario comparando con y sin normalizar
    const todaySchedule = schedules.find(s => 
      s.Day_Of_Week === currentDay || 
      normalizeText(s.Day_Of_Week) === normalizedCurrentDay
    );
    
    return todaySchedule;
  };

  return (
    <div className="technician-management">
      <div className="page-container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <Users size={28} />
                {isTechnician() ? 'Mi Perfil Técnico' : 'Equipo Técnico Municipal'}
              </h1>
              <p className="page-description">
                {isTechnician() ? 'Gestiona tu información personal y horarios' : 'Conoce y gestiona a los profesionales que mantienen nuestra ciudad funcionando'}
              </p>
            </div>
            
            <div className="header-stats">
              {isTechnician() && currentUserTechnician ? (
                <>
                  <div className="stat-item">
                    <span className="stat-number">{currentUserTechnician.Tickets_Assigned || 0}</span>
                    <span className="stat-label">Tickets Asignados</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{currentUserTechnician.Tickets_Resolved || 0}</span>
                    <span className="stat-label">Tickets Resueltos</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{currentUserTechnician.Schedules?.length || 0}</span>
                    <span className="stat-label">Días Laborales</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-item">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Profesionales</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.active}</span>
                    <span className="stat-label">Activos</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.totalResolved}</span>
                    <span className="stat-label">Tickets Resueltos</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn secondary" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              Volver al Panel
            </button>
            {!isTechnician() && (
              <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
                <UserPlus size={18} />
                Nuevo Profesional
              </button>
            )}
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-label">Total Técnicos</p>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <UserCheck size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.active}</h3>
              <p className="stat-label">Activos</p>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.inactive}</h3>
              <p className="stat-label">Inactivos</p>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalTickets}</h3>
              <p className="stat-label">Tickets Asignados</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <section className="search-filters">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <label>Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Servicio TI</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los servicios</option>
                {tiServices.map(service => (
                  <option key={service.ID_TI_Service} value={service.ID_TI_Service.toString()}>
                    {service.Type_Service}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* View Options */}
        <div className="view-options">
          <div className="view-tabs">
            <button
              className={`tab-btn ${currentView === 'grid' ? 'active' : ''}`}
              onClick={() => setCurrentView('grid')}
            >
              <Users size={16} />
              <span>Tarjetas</span>
            </button>
            <button
              className={`tab-btn ${currentView === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentView('list')}
            >
              <BarChart3 size={16} />
              <span>Lista</span>
            </button>
            <button
              className={`tab-btn ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={() => setCurrentView('analytics')}
            >
              <TrendingUp size={16} />
              <span>Análisis</span>
            </button>
          </div>
          
          <div className="results-info">
            <span className="results-count">{filteredTechnicians.length} profesionales encontrados</span>
          </div>
        </div>

        {/* Content */}
        <div className="technicians-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando técnicos...</p>
            </div>
          ) : currentView === 'grid' ? (
            <div className="technicians-grid">
              {techniciansByService.map(service => (
                <div key={service.ID_TI_Service} className="coordination-section">
                  <div className="coordination-header">
                    <div className="coordination-info">
                      <Wrench size={20} />
                      <div>
                        <h3>{service.Type_Service}</h3>
                        <p>{service.Details}</p>
                      </div>
                    </div>
                    <div className="coordination-stats">
                      <span className="technician-count">{service.technicians.length} profesionales</span>
                      <span className="available-count">
                        {service.technicians.filter(t => t.Status === 'Activo').length} activos
                      </span>
                    </div>
                  </div>
                  
                  {/* Tabla compacta para muchos técnicos */}
                  <div className="technicians-table-container">
                    <table className="technicians-table">
                      <thead>
                        <tr>
                          <th>Profesional</th>
                          <th>Servicios TI</th>
                          <th>Email</th>
                          <th>Bloque Almuerzo</th>
                          <th>Horario</th>
                          <th>Estado</th>
                          <th>Tickets</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.technicians.map(technician => (
                          <tr key={technician.ID_Technicians} className="technician-row">
                            <td className="technician-name-cell">
                              <div className="technician-mini-profile">
                                <div className="technician-avatar-small">
                                  {technician.Avatar || `${technician.First_Name[0]}${technician.Last_Name[0]}`}
                                </div>
                                <div className="technician-name-info">
                                  <div className="technician-name">{technician.First_Name} {technician.Last_Name}</div>
                                  <div className="technician-experience">Creado: {new Date(technician.created_at).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="specialization-cell">
                              <div className="services-tags">
                                {technician.TI_Services.map(s => (
                                  <span key={s.ID_TI_Service} className="service-tag">{s.Type_Service}</span>
                                ))}
                              </div>
                            </td>
                            <td className="contact-cell">
                              <div className="contact-info">
                                <div className="contact-item">
                                  <Mail size={14} />
                                  <span>{technician.Email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="schedule-cell">
                              {technician.Lunch_Block_Hours ? (
                                <span className="lunch-block-tag">{technician.Lunch_Block_Hours}</span>
                              ) : (
                                <span className="no-lunch-block">Sin bloque</span>
                              )}
                            </td>
                            <td className="schedule-cell">
                              {(() => {
                                const todaySchedule = getTodaySchedule(technician.Schedules);
                                if (todaySchedule) {
                                  return (
                                    <span className="schedule-summary">
                                      {todaySchedule.Work_Start_Time} - {todaySchedule.Work_End_Time}
                                    </span>
                                  );
                                } else if (technician.Schedules && technician.Schedules.length > 0) {
                                  return (
                                    <span className="no-schedule-today">
                                      No trabaja hoy
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="no-schedule">Sin horario</span>
                                  );
                                }
                              })()}
                            </td>
                            <td className="status-cell">
                              <span className={`status-badge ${getStatusColor(technician.Status)}`}>
                                {technician.Status}
                              </span>
                            </td>
                            <td className="tickets-cell">
                              <div className="tickets-info">
                                <span className="tickets-assigned">{technician.Tickets_Assigned || 0}</span>
                                <span className="tickets-resolved">{technician.Tickets_Resolved || 0}</span>
                              </div>
                            </td>
                            <td className="actions-cell">
                              <div className="technician-actions">
                                <button
                                  className="action-btn-small"
                                  onClick={() => {
                                    setSelectedTechnician(technician);
                                    setShowDetailModal(true);
                                  }}
                                  title="Ver detalles"
                                >
                                  <Eye size={14} />
                                </button>
                                {!isTechnician() || technician.Fk_Users === user?.id ? (
                                  <button
                                    className="action-btn-small"
                                    onClick={() => handleEdit(technician)}
                                    title="Editar"
                                  >
                                    <Edit size={14} />
                                  </button>
                                ) : null}
                                {!isTechnician() && (
                                  <button
                                    className="action-btn-small danger"
                                    onClick={() => {
                                      setSelectedTechnician(technician);
                                      setShowDeleteModal(true);
                                    }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : currentView === 'list' ? (
            <div className="technicians-list">
              {/* Vista de lista - implementar después */}
              <p>Vista de lista en desarrollo...</p>
            </div>
          ) : (
            <div className="technicians-analytics">
              {/* Vista de análisis - implementar después */}
              <p>Vista de análisis en desarrollo...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Técnico */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agregar Nuevo Técnico</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="technician-form">
              <div className="form-section">
                <h3>Información de Cuenta</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Primer Nombre</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      maxLength={25}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      maxLength={25}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Confirmar Contraseña *</label>
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

              <div className="form-section">
                <h3>Información del Técnico</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Bloque de Almuerzo (Opcional)</label>
                    <select
                      name="fk_lunch_block"
                      value={formData.fk_lunch_block}
                      onChange={handleInputChange}
                    >
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

              <div className="form-section">
                <h3>Servicios TI</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Seleccione los servicios que puede ofrecer:</label>
                    <div className="services-checkbox-group">
                      {tiServices.map(service => (
                        <label key={service.ID_TI_Service} className="service-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.ti_services.includes(service.ID_TI_Service)}
                            onChange={() => handleServiceToggle(service.ID_TI_Service)}
                          />
                          <span>{service.Type_Service} - {service.Details}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Horario de Trabajo</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Horarios por día de la semana:</label>
                    <div className="schedule-grid">
                      {Object.keys(formData.schedules).map(day => (
                        <div key={day} className="schedule-day-row">
                          <span className="day-label">{day}</span>
                          <div className="time-inputs">
                            <input
                              type="time"
                              value={formData.schedules[day as keyof typeof formData.schedules].start}
                              onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                              className="time-input"
                            />
                            <span className="time-separator">-</span>
                            <input
                              type="time"
                              value={formData.schedules[day as keyof typeof formData.schedules].end}
                              onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                              className="time-input"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  Agregar Técnico y Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Técnico */}
      {showEditModal && selectedTechnician && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Técnico</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="technician-form">
              <div className="form-section">
                <h3>Información Personal</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Primer Nombre</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      maxLength={25}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      maxLength={25}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nueva Contraseña (Opcional)</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Dejar vacío para mantener la actual"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Confirmar Contraseña</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Repita la nueva contraseña"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Información del Técnico</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Bloque de Almuerzo (Opcional)</label>
                    <select
                      name="fk_lunch_block"
                      value={formData.fk_lunch_block}
                      onChange={handleInputChange}
                    >
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

              <div className="form-section">
                <h3>Servicios TI</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Seleccione los servicios que puede ofrecer:</label>
                    <div className="services-checkbox-group">
                      {tiServices.map(service => (
                        <label key={service.ID_TI_Service} className="service-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.ti_services.includes(service.ID_TI_Service)}
                            onChange={() => handleServiceToggle(service.ID_TI_Service)}
                          />
                          <span>{service.Type_Service} - {service.Details}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Horario de Trabajo</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Horarios por día de la semana:</label>
                    <div className="schedule-grid">
                      {Object.keys(formData.schedules).map(day => (
                        <div key={day} className="schedule-day-row">
                          <span className="day-label">{day}</span>
                          <div className="time-inputs">
                            <input
                              type="time"
                              value={formData.schedules[day as keyof typeof formData.schedules].start}
                              onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                              className="time-input"
                            />
                            <span className="time-separator">-</span>
                            <input
                              type="time"
                              value={formData.schedules[day as keyof typeof formData.schedules].end}
                              onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                              className="time-input"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Edit size={16} />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {showDetailModal && selectedTechnician && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalles del Técnico</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="technician-detail">
              <div className="detail-header">
                <div className="technician-avatar large">
                  {selectedTechnician.Avatar}
                </div>
                <div className="technician-summary">
                  <h3>{selectedTechnician.First_Name} {selectedTechnician.Last_Name}</h3>
                  <span className={`status-badge ${getStatusColor(selectedTechnician.Status)}`}>
                    {selectedTechnician.Status}
                  </span>
                  <p>ID Usuario: {selectedTechnician.Fk_Users}</p>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Información Personal</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>{selectedTechnician.Email}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Creado: {new Date(selectedTechnician.created_at).toLocaleDateString()}</span>
                    </div>
                    {selectedTechnician.Lunch_Block_Hours && (
                      <div className="detail-item">
                        <Coffee size={16} />
                        <span>Bloque de Almuerzo: {selectedTechnician.Lunch_Block_Hours}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Servicios TI</h4>
                  <div className="services-grid">
                    {selectedTechnician.TI_Services.map(service => (
                      <span key={service.ID_TI_Service} className="service-badge large">
                        {service.Type_Service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Horario de Trabajo</h4>
                  {selectedTechnician.Schedules && selectedTechnician.Schedules.length > 0 ? (
                    <div className="schedule-display">
                      {selectedTechnician.Schedules.map(schedule => (
                        <div key={schedule.ID_Schedule} className="schedule-day-display">
                          <span className="day-label">{schedule.Day_Of_Week}:</span>
                          <span className="time-range">
                            {schedule.Work_Start_Time} - {schedule.Work_End_Time}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-schedule">Sin horario definido</p>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>Rendimiento</h4>
                  <div className="performance-metrics">
                    <div className="metric">
                      <span className="metric-value">{selectedTechnician.Tickets_Assigned || 0}</span>
                      <span className="metric-label">Tickets Asignados</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{selectedTechnician.Tickets_Resolved || 0}</span>
                      <span className="metric-label">Tickets Resueltos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedTechnician && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Eliminar Técnico</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-confirmation">
              <div className="warning-icon">
                <UserX size={48} />
              </div>
              <p>¿Estás seguro de que deseas eliminar al técnico <strong>{selectedTechnician.First_Name} {selectedTechnician.Last_Name}</strong>?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={16} />
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
