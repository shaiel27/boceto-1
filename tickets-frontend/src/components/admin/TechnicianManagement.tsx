import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Telephone_Number?: string;
  Email: string;
  Status: 'Activo' | 'Inactivo';
  Fk_Lunch_Block?: string;
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
  const navigate = useNavigate();
  
  // Estados principales
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [tiServices, setTiServices] = useState<TI_Service[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [technicianSchedules, setTechnicianSchedules] = useState<Technician_Schedule[]>([]);
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
    telephone_number: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'Activo',
    fk_lunch_block: '',
    ti_services: [] as number[],
    schedules: {
      Lunes: { start: '08:00', end: '17:00' },
      Martes: { start: '08:00', end: '17:00' },
      Miercoles: { start: '08:00', end: '17:00' },
      Jueves: { start: '08:00', end: '17:00' },
      Viernes: { start: '08:00', end: '17:00' },
      Sabado: { start: '', end: '' },
      Domingo: { start: '', end: '' }
    }
  });
  
  // Vista actual
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'analytics'>('grid');

  // Cargar datos mock
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockTIServices: TI_Service[] = [
        { ID_TI_Service: 1, Type_Service: 'Redes', Details: 'Configuración y mantenimiento de redes' },
        { ID_TI_Service: 2, Type_Service: 'Soporte', Details: 'Soporte técnico general' },
        { ID_TI_Service: 3, Type_Service: 'Programación', Details: 'Desarrollo de software y aplicaciones' }
      ];

      const mockTechnicians: Technician[] = [
        {
          ID_Technicians: 1,
          Fk_Users: 101,
          First_Name: 'Carlos',
          Last_Name: 'Rodríguez',
          Telephone_Number: '555-1234',
          Email: 'carlos.rodriguez@municipio.gob',
          Status: 'Activo',
          Fk_Lunch_Block: '12:10 - 12:50',
          TI_Services: [mockTIServices[0]],
          Schedules: [
            { ID_Schedule: 1, Fk_Technician: 1, Day_Of_Week: 'Lunes', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 2, Fk_Technician: 1, Day_Of_Week: 'Martes', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 3, Fk_Technician: 1, Day_Of_Week: 'Miercoles', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 4, Fk_Technician: 1, Day_Of_Week: 'Jueves', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 5, Fk_Technician: 1, Day_Of_Week: 'Viernes', Work_Start_Time: '08:00', Work_End_Time: '17:00' }
          ],
          created_at: '2024-01-15',
          Avatar: 'CR',
          Tickets_Assigned: 45,
          Tickets_Resolved: 42
        },
        {
          ID_Technicians: 2,
          Fk_Users: 102,
          First_Name: 'María',
          Last_Name: 'González',
          Telephone_Number: '555-5678',
          Email: 'maria.gonzalez@municipio.gob',
          Status: 'Activo',
          Fk_Lunch_Block: '11:30 - 12:10',
          TI_Services: [mockTIServices[1]],
          Schedules: [
            { ID_Schedule: 6, Fk_Technician: 2, Day_Of_Week: 'Lunes', Work_Start_Time: '07:00', Work_End_Time: '16:00' },
            { ID_Schedule: 7, Fk_Technician: 2, Day_Of_Week: 'Martes', Work_Start_Time: '07:00', Work_End_Time: '16:00' },
            { ID_Schedule: 8, Fk_Technician: 2, Day_Of_Week: 'Miercoles', Work_Start_Time: '07:00', Work_End_Time: '16:00' },
            { ID_Schedule: 9, Fk_Technician: 2, Day_Of_Week: 'Jueves', Work_Start_Time: '07:00', Work_End_Time: '16:00' },
            { ID_Schedule: 10, Fk_Technician: 2, Day_Of_Week: 'Viernes', Work_Start_Time: '07:00', Work_End_Time: '16:00' }
          ],
          created_at: '2024-02-20',
          Avatar: 'MG',
          Tickets_Assigned: 38,
          Tickets_Resolved: 35
        },
        {
          ID_Technicians: 3,
          Fk_Users: 103,
          First_Name: 'Juan',
          Last_Name: 'Pérez',
          Telephone_Number: '555-9012',
          Email: 'juan.perez@municipio.gob',
          Status: 'Activo',
          Fk_Lunch_Block: '12:50 - 1:30',
          TI_Services: [mockTIServices[0], mockTIServices[1]],
          Schedules: [
            { ID_Schedule: 11, Fk_Technician: 3, Day_Of_Week: 'Lunes', Work_Start_Time: '09:00', Work_End_Time: '18:00' },
            { ID_Schedule: 12, Fk_Technician: 3, Day_Of_Week: 'Martes', Work_Start_Time: '09:00', Work_End_Time: '18:00' },
            { ID_Schedule: 13, Fk_Technician: 3, Day_Of_Week: 'Miercoles', Work_Start_Time: '09:00', Work_End_Time: '18:00' },
            { ID_Schedule: 14, Fk_Technician: 3, Day_Of_Week: 'Jueves', Work_Start_Time: '09:00', Work_End_Time: '18:00' },
            { ID_Schedule: 15, Fk_Technician: 3, Day_Of_Week: 'Viernes', Work_Start_Time: '09:00', Work_End_Time: '18:00' }
          ],
          created_at: '2024-03-10',
          Avatar: 'JP',
          Tickets_Assigned: 52,
          Tickets_Resolved: 50
        },
        {
          ID_Technicians: 4,
          Fk_Users: 104,
          First_Name: 'Ana',
          Last_Name: 'Martínez',
          Telephone_Number: '555-3456',
          Email: 'ana.martinez@municipio.gob',
          Status: 'Inactivo',
          TI_Services: [mockTIServices[2]],
          Schedules: [
            { ID_Schedule: 16, Fk_Technician: 4, Day_Of_Week: 'Lunes', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 17, Fk_Technician: 4, Day_Of_Week: 'Martes', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 18, Fk_Technician: 4, Day_Of_Week: 'Miercoles', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 19, Fk_Technician: 4, Day_Of_Week: 'Jueves', Work_Start_Time: '08:00', Work_End_Time: '17:00' },
            { ID_Schedule: 20, Fk_Technician: 4, Day_Of_Week: 'Viernes', Work_Start_Time: '08:00', Work_End_Time: '17:00' }
          ],
          created_at: '2024-04-12',
          Avatar: 'AM',
          Tickets_Assigned: 28,
          Tickets_Resolved: 27
        }
      ];

      setTechnicians(mockTechnicians);
      setTiServices(mockTIServices);
      setLoading(false);
    }, 1000);
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

  const handleSubmit = (e: React.FormEvent) => {
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
    const newTechnician: Technician = {
      ID_Technicians: Date.now(),
      Fk_Users: Date.now(),
      First_Name: formData.first_name,
      Last_Name: formData.last_name,
      Telephone_Number: formData.telephone_number,
      Email: formData.email,
      Status: formData.status as 'Activo' | 'Inactivo',
      TI_Services: selectedServices,
      created_at: new Date().toISOString().split('T')[0],
      Avatar: `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase(),
      Tickets_Assigned: 0,
      Tickets_Resolved: 0
    };

    // Crear horarios del técnico
    const newSchedules: Technician_Schedule[] = [];
    Object.entries(formData.schedules).forEach(([day, times]) => {
      if (times.start && times.end) {
        newSchedules.push({
          ID_Schedule: Date.now() + newSchedules.length,
          Fk_Technician: newTechnician.ID_Technicians,
          Day_Of_Week: day,
          Work_Start_Time: times.start,
          Work_End_Time: times.end
        });
      }
    });

    // Aquí se crearía también el usuario con rol de técnico
    console.log('Creando técnico y usuario:', {
      technician: newTechnician,
      schedules: newSchedules,
      user: {
        email: formData.email,
        password: formData.password,
        role: 'Tecnico'
      }
    });

    setTechnicians(prev => [...prev, newTechnician]);
    setTechnicianSchedules(prev => [...prev, ...newSchedules]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      telephone_number: '',
      email: '',
      password: '',
      confirmPassword: '',
      status: 'Activo',
      fk_lunch_block: '',
      ti_services: [] as number[],
      schedules: {
        Lunes: { start: '08:00', end: '17:00' },
        Martes: { start: '08:00', end: '17:00' },
        Miercoles: { start: '08:00', end: '17:00' },
        Jueves: { start: '08:00', end: '17:00' },
        Viernes: { start: '08:00', end: '17:00' },
        Sabado: { start: '', end: '' },
        Domingo: { start: '', end: '' }
      }
    });
  };

  const handleDelete = () => {
    if (selectedTechnician) {
      setTechnicians(prev => prev.filter(t => t.ID_Technicians !== selectedTechnician.ID_Technicians));
      setShowDeleteModal(false);
      setSelectedTechnician(null);
    }
  };

  const handleEdit = (technician: Technician) => {
    setSelectedTechnician(technician);
    
    // Cargar horarios del técnico si existen
    const schedules = {
      Lunes: { start: '', end: '' },
      Martes: { start: '', end: '' },
      Miercoles: { start: '', end: '' },
      Jueves: { start: '', end: '' },
      Viernes: { start: '', end: '' },
      Sabado: { start: '', end: '' },
      Domingo: { start: '', end: '' }
    };
    
    if (technician.Schedules) {
      technician.Schedules.forEach(schedule => {
        schedules[schedule.Day_Of_Week as keyof typeof schedules] = {
          start: schedule.Work_Start_Time,
          end: schedule.Work_End_Time
        };
      });
    }
    
    setFormData({
      first_name: technician.First_Name,
      last_name: technician.Last_Name,
      telephone_number: technician.Telephone_Number || '',
      email: technician.Email,
      password: '',
      confirmPassword: '',
      status: technician.Status,
      fk_lunch_block: technician.Fk_Lunch_Block || '',
      ti_services: technician.TI_Services.map(s => s.ID_TI_Service),
      schedules
    });
    setShowEditModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
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
    
    const selectedServices = tiServices.filter(s => formData.ti_services.includes(s.ID_TI_Service));
    
    const updatedTechnician: Technician = {
      ...selectedTechnician,
      First_Name: formData.first_name,
      Last_Name: formData.last_name,
      Telephone_Number: formData.telephone_number,
      Email: formData.email,
      Status: formData.status as 'Activo' | 'Inactivo',
      Fk_Lunch_Block: formData.fk_lunch_block || undefined,
      TI_Services: selectedServices
    };

    // Actualizar horarios del técnico
    const updatedSchedules: Technician_Schedule[] = [];
    Object.entries(formData.schedules).forEach(([day, times]) => {
      if (times.start && times.end) {
        updatedSchedules.push({
          ID_Schedule: Date.now() + updatedSchedules.length,
          Fk_Technician: selectedTechnician.ID_Technicians,
          Day_Of_Week: day,
          Work_Start_Time: times.start,
          Work_End_Time: times.end
        });
      }
    });

    updatedTechnician.Schedules = updatedSchedules;

    console.log('Actualizando técnico:', {
      technician: updatedTechnician,
      schedules: updatedSchedules,
      password: formData.password || 'Sin cambio de contraseña'
    });

    setTechnicians(prev => prev.map(t => 
      t.ID_Technicians === selectedTechnician.ID_Technicians ? updatedTechnician : t
    ));
    setTechnicianSchedules(prev => [
      ...prev.filter(s => s.Fk_Technician !== selectedTechnician.ID_Technicians),
      ...updatedSchedules
    ]);
    setShowEditModal(false);
    setSelectedTechnician(null);
    resetForm();
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

  return (
    <div className="technician-management">
      <div className="page-container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <Users size={28} />
                Equipo Técnico Municipal
              </h1>
              <p className="page-description">Conoce y gestiona a los profesionales que mantienen nuestra ciudad funcionando</p>
            </div>
            
            <div className="header-stats">
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
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn secondary" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              Volver al Panel
            </button>
            <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
              <UserPlus size={18} />
              Nuevo Profesional
            </button>
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
                              {technician.Fk_Lunch_Block ? (
                                <span className="lunch-block-tag">{technician.Fk_Lunch_Block}</span>
                              ) : (
                                <span className="no-lunch-block">Sin bloque</span>
                              )}
                            </td>
                            <td className="schedule-cell">
                              {technician.Schedules && technician.Schedules.length > 0 ? (
                                <span className="schedule-summary">
                                  {technician.Schedules[0].Work_Start_Time} - {technician.Schedules[0].Work_End_Time}
                                </span>
                              ) : (
                                <span className="no-schedule">Sin horario</span>
                              )}
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
                                <button
                                  className="action-btn-small"
                                  onClick={() => handleEdit(technician)}
                                  title="Editar"
                                >
                                  <Edit size={14} />
                                </button>
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
                    <label>Teléfono (Opcional)</label>
                    <input
                      type="tel"
                      name="telephone_number"
                      value={formData.telephone_number}
                      onChange={handleInputChange}
                      maxLength={20}
                      placeholder="555-1234"
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
                      <option value="11:30 - 12:10">11:30 - 12:10</option>
                      <option value="12:10 - 12:50">12:10 - 12:50</option>
                      <option value="12:50 - 1:30">12:50 - 1:30</option>
                      <option value="1:20 - 2:00">1:20 - 2:00</option>
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
                    <label>Teléfono (Opcional)</label>
                    <input
                      type="tel"
                      name="telephone_number"
                      value={formData.telephone_number}
                      onChange={handleInputChange}
                      maxLength={20}
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
                      <option value="11:30 - 12:10">11:30 - 12:10</option>
                      <option value="12:10 - 12:50">12:10 - 12:50</option>
                      <option value="12:50 - 1:30">12:50 - 1:30</option>
                      <option value="1:20 - 2:00">1:20 - 2:00</option>
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
                    {selectedTechnician.Telephone_Number && (
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>Teléfono: {selectedTechnician.Telephone_Number}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Creado: {new Date(selectedTechnician.created_at).toLocaleDateString()}</span>
                    </div>
                    {selectedTechnician.Fk_Lunch_Block && (
                      <div className="detail-item">
                        <Coffee size={16} />
                        <span>Bloque de Almuerzo: {selectedTechnician.Fk_Lunch_Block}</span>
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
