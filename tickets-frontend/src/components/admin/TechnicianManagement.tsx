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
  ID_Technician: string;
  Name: string;
  Email: string;
  Phone: string;
  Status: 'Disponible' | 'Ocupado' | 'No Disponible';
  Specialization: string;
  Experience_Years: number;
  Hire_Date: string;
  Certifications: string[];
  Fk_Coordination: string;
  Coordination_Name?: string;
  Direction_Name?: string;
  Division_Name?: string;
  Tickets_Assigned: number;
  Tickets_Resolved: number;
  Avg_Resolution_Time: number;
  Performance_Score: number;
  Skills: string[];
  Avatar?: string;
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
  const [coordinations, setCoordinations] = useState<Coordination[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [coordinationFilter, setCoordinationFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  
  // Estados de modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados de formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience_years: '',
    certifications: '',
    fk_coordination: '',
    skills: ''
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
      const mockCoordinations: Coordination[] = [
        {
          ID_Coordination: '1',
          Name: 'Coordinación de Servicio Tecnico',
          Direction_Name: 'Dirección de Educación',
          Division_Name: 'División de Docencia',
          Technician_Count: 3
        },
        {
          ID_Coordination: '2',
          Name: 'Coordinación de Programacion',
          Direction_Name: 'Dirección de Vialidad',
          Division_Name: 'División de Ingeniería',
          Technician_Count: 2
        },
        {
          ID_Coordination: '3',
          Name: 'Coordinación de Redes',
          Direction_Name: 'Dirección de Salud',
          Division_Name: 'División Administrativa',
          Technician_Count: 4
        }
      ];

      const mockTechnicians: Technician[] = [
        {
          ID_Technician: '1',
          Name: 'Carlos Rodríguez',
          Email: 'carlos.rodriguez@municipio.gob',
          Phone: '+58 416-1234567',
          Status: 'Disponible',
          Specialization: 'Redes y Conectividad',
          Experience_Years: 5,
          Hire_Date: '2019-03-15',
          Certifications: ['Cisco CCNA', 'CompTIA Network+', 'AWS Cloud Practitioner'],
          Fk_Coordination: '1',
          Coordination_Name: 'Coordinación de Semáforos',
          Direction_Name: 'Dirección de Educación',
          Division_Name: 'División de Docencia',
          Tickets_Assigned: 45,
          Tickets_Resolved: 42,
          Avg_Resolution_Time: 2.5,
          Performance_Score: 93,
          Skills: ['Redes', 'Cisco', 'AWS', 'Seguridad'],
          Avatar: 'CR'
        },
        {
          ID_Technician: '2',
          Name: 'María González',
          Email: 'maria.gonzalez@municipio.gob',
          Phone: '+58 416-2345678',
          Status: 'Ocupado',
          Specialization: 'Soporte Técnico',
          Experience_Years: 3,
          Hire_Date: '2021-06-20',
          Certifications: ['CompTIA A+', 'Microsoft 365'],
          Fk_Coordination: '2',
          Coordination_Name: 'Coordinación de Catastro Legal',
          Direction_Name: 'Dirección de Vialidad',
          Division_Name: 'División de Ingeniería',
          Tickets_Assigned: 38,
          Tickets_Resolved: 35,
          Avg_Resolution_Time: 1.8,
          Performance_Score: 89,
          Skills: ['Hardware', 'Software', 'Windows', 'Office 365'],
          Avatar: 'MG'
        },
        {
          ID_Technician: '3',
          Name: 'Juan Pérez',
          Email: 'juan.perez@municipio.gob',
          Phone: '+58 416-3456789',
          Status: 'Disponible',
          Specialization: 'Hardware y Mantenimiento',
          Experience_Years: 7,
          Hire_Date: '2017-01-10',
          Certifications: ['CompTIA A+', 'HP Certified', 'Dell Certified'],
          Fk_Coordination: '3',
          Coordination_Name: 'Coordinación de Mantenimiento',
          Direction_Name: 'Dirección de Salud',
          Division_Name: 'División Administrativa',
          Tickets_Assigned: 52,
          Tickets_Resolved: 50,
          Avg_Resolution_Time: 3.2,
          Performance_Score: 96,
          Skills: ['Hardware', 'Impresoras', 'Servidores', 'Redes'],
          Avatar: 'JP'
        },
        {
          ID_Technician: '4',
          Name: 'Ana Martínez',
          Email: 'ana.martinez@municipio.gob',
          Phone: '+58 416-4567890',
          Status: 'No Disponible',
          Specialization: 'Desarrollo Web',
          Experience_Years: 4,
          Hire_Date: '2020-08-12',
          Certifications: ['JavaScript Developer', 'React Developer', 'Node.js'],
          Fk_Coordination: '1',
          Coordination_Name: 'Coordinación de Semáforos',
          Direction_Name: 'Dirección de Educación',
          Division_Name: 'División de Docencia',
          Tickets_Assigned: 28,
          Tickets_Resolved: 27,
          Avg_Resolution_Time: 4.1,
          Performance_Score: 91,
          Skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          Avatar: 'AM'
        }
      ];

      setTechnicians(mockTechnicians);
      setCoordinations(mockCoordinations);
      setLoading(false);
    }, 1000);
  };

  // Filtrar técnicos
  const filteredTechnicians = technicians.filter(technician => {
    const matchesSearch = technician.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.Specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || technician.Status === statusFilter;
    const matchesCoordination = coordinationFilter === 'all' || technician.Fk_Coordination === coordinationFilter;
    const matchesSpecialization = specializationFilter === 'all' || 
                                 technician.Specialization.toLowerCase().includes(specializationFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCoordination && matchesSpecialization;
  });

  // Agrupar técnicos por coordinación
  const techniciansByCoordination = coordinations.map(coordination => ({
    ...coordination,
    technicians: filteredTechnicians.filter(t => t.Fk_Coordination === coordination.ID_Coordination)
  })).filter(coordination => coordination.technicians.length > 0);

  // Estadísticas
  const stats = {
    total: technicians.length,
    available: technicians.filter(t => t.Status === 'Disponible').length,
    busy: technicians.filter(t => t.Status === 'Ocupado').length,
    unavailable: technicians.filter(t => t.Status === 'No Disponible').length,
    avgPerformance: technicians.reduce((acc, t) => acc + t.Performance_Score, 0) / technicians.length || 0,
    totalTickets: technicians.reduce((acc, t) => acc + t.Tickets_Assigned, 0)
  };

  // Manejo de formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTechnician: Technician = {
      ID_Technician: Date.now().toString(),
      Name: formData.name,
      Email: formData.email,
      Phone: formData.phone,
      Status: 'Disponible',
      Specialization: formData.specialization,
      Experience_Years: parseInt(formData.experience_years),
      Hire_Date: new Date().toISOString().split('T')[0],
      Certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
      Fk_Coordination: formData.fk_coordination,
      Tickets_Assigned: 0,
      Tickets_Resolved: 0,
      Avg_Resolution_Time: 0,
      Performance_Score: 85,
      Skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      Avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    setTechnicians(prev => [...prev, newTechnician]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience_years: '',
      certifications: '',
      fk_coordination: '',
      skills: ''
    });
  };

  const handleDelete = () => {
    if (selectedTechnician) {
      setTechnicians(prev => prev.filter(t => t.ID_Technician !== selectedTechnician.ID_Technician));
      setShowDeleteModal(false);
      setSelectedTechnician(null);
    }
  };

  const generatePDFReport = () => {
    // Placeholder para generación de PDF
    alert('Generando reporte PDF... (Función se implementará con el backend)');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'success';
      case 'Ocupado': return 'warning';
      case 'No Disponible': return 'danger';
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
                <span className="stat-number">{stats.available}</span>
                <span className="stat-label">Disponibles</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.avgPerformance.toFixed(0)}%</span>
                <span className="stat-label">Eficiencia</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn secondary" onClick={() => navigate('/admin/dashboard')}>
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
              <h3 className="stat-value">{stats.available}</h3>
              <p className="stat-label">Disponibles</p>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.busy}</h3>
              <p className="stat-label">Ocupados</p>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.avgPerformance.toFixed(1)}%</h3>
              <p className="stat-label">Rendimiento Promedio</p>
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
                <option value="Disponible">Disponibles</option>
                <option value="Ocupado">En Servicio</option>
                <option value="No Disponible">No Disponibles</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Área</label>
              <select
                value={coordinationFilter}
                onChange={(e) => setCoordinationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las áreas</option>
                {coordinations.map(coord => (
                  <option key={coord.ID_Coordination} value={coord.ID_Coordination}>
                    {coord.Name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Especialidad</label>
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas</option>
                <option value="Redes">Redes</option>
                <option value="Soporte Técnico">Soporte Técnico</option>
                <option value="Hardware">Hardware</option>
                <option value="Desarrollo">Desarrollo</option>
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
              {techniciansByCoordination.map(coordination => (
                <div key={coordination.ID_Coordination} className="coordination-section">
                  <div className="coordination-header">
                    <div className="coordination-info">
                      <Building size={20} />
                      <div>
                        <h3>{coordination.Name}</h3>
                        <p>{coordination.Direction_Name} - {coordination.Division_Name}</p>
                      </div>
                    </div>
                    <div className="coordination-stats">
                      <span className="technician-count">{coordination.technicians.length} profesionales</span>
                      <span className="available-count">
                        {coordination.technicians.filter(t => t.Status === 'Disponible').length} disponibles
                      </span>
                    </div>
                  </div>
                  
                  {/* Tabla compacta para muchos técnicos */}
                  <div className="technicians-table-container">
                    <table className="technicians-table">
                      <thead>
                        <tr>
                          <th>Profesional</th>
                          <th>Especialidad</th>
                          <th>Contacto</th>
                          <th>Estado</th>
                          <th>Tickets</th>
                          <th>Rendimiento</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coordination.technicians.map(technician => (
                          <tr key={technician.ID_Technician} className="technician-row">
                            <td className="technician-name-cell">
                              <div className="technician-mini-profile">
                                <div className="technician-avatar-small">
                                  {technician.Avatar || technician.Name.charAt(0)}
                                </div>
                                <div className="technician-name-info">
                                  <div className="technician-name">{technician.Name}</div>
                                  <div className="technician-experience">{technician.Experience_Years} años</div>
                                </div>
                              </div>
                            </td>
                            <td className="specialization-cell">
                              <span className="specialization-tag">{technician.Specialization}</span>
                            </td>
                            <td className="contact-cell">
                              <div className="contact-info">
                                <div className="contact-item">
                                  <Mail size={14} />
                                  <span>{technician.Email}</span>
                                </div>
                                <div className="contact-item">
                                  <Phone size={14} />
                                  <span>{technician.Phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="status-cell">
                              <span className={`status-badge ${getStatusColor(technician.Status)}`}>
                                {technician.Status}
                              </span>
                            </td>
                            <td className="tickets-cell">
                              <div className="tickets-info">
                                <span className="tickets-assigned">{technician.Tickets_Assigned}</span>
                                <span className="tickets-resolved">{technician.Tickets_Resolved}</span>
                              </div>
                            </td>
                            <td className="performance-cell">
                              <div className="performance-indicator">
                                <div className="performance-bar">
                                  <div 
                                    className={`performance-fill ${getPerformanceColor(technician.Performance_Score)}`}
                                    style={{ width: `${technician.Performance_Score}%` }}
                                  ></div>
                                </div>
                                <span className="performance-text">{technician.Performance_Score}%</span>
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
                                  onClick={() => {
                                    setSelectedTechnician(technician);
                                    setShowEditModal(true);
                                  }}
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
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
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
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Especialización</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Años de Experiencia</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Coordinación</label>
                  <select
                    name="fk_coordination"
                    value={formData.fk_coordination}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {coordinations.map(coord => (
                      <option key={coord.ID_Coordination} value={coord.ID_Coordination}>
                        {coord.Name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Certificaciones (separadas por comas)</label>
                  <textarea
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="Ej: Cisco CCNA, CompTIA A+, Microsoft 365"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Habilidades (separadas por comas)</label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Ej: Redes, Hardware, Software, Seguridad"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  Agregar Técnico
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
                  <h3>{selectedTechnician.Name}</h3>
                  <span className={`status-badge ${getStatusColor(selectedTechnician.Status)}`}>
                    {selectedTechnician.Status}
                  </span>
                  <p>{selectedTechnician.Specialization}</p>
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
                      <Phone size={16} />
                      <span>{selectedTechnician.Phone}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{selectedTechnician.Coordination_Name}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Contratado: {new Date(selectedTechnician.Hire_Date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Experiencia y Certificaciones</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <GraduationCap size={16} />
                      <span>{selectedTechnician.Experience_Years} años de experiencia</span>
                    </div>
                    <div className="detail-item">
                      <Award size={16} />
                      <span>{selectedTechnician.Certifications.length} certificaciones</span>
                    </div>
                  </div>
                  <div className="certifications-list">
                    {selectedTechnician.Certifications.map((cert, index) => (
                      <span key={index} className="certification-badge">{cert}</span>
                    ))}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Rendimiento</h4>
                  <div className="performance-metrics">
                    <div className="metric">
                      <span className="metric-value">{selectedTechnician.Tickets_Assigned}</span>
                      <span className="metric-label">Tickets Asignados</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{selectedTechnician.Tickets_Resolved}</span>
                      <span className="metric-label">Tickets Resueltos</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{selectedTechnician.Avg_Resolution_Time}h</span>
                      <span className="metric-label">Tiempo Promedio</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value performance">{selectedTechnician.Performance_Score}%</span>
                      <span className="metric-label">Puntuación</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section full-width">
                  <h4>Habilidades</h4>
                  <div className="skills-grid">
                    {selectedTechnician.Skills.map((skill, index) => (
                      <span key={index} className="skill-badge large">{skill}</span>
                    ))}
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
              <p>¿Estás seguro de que deseas eliminar al técnico <strong>{selectedTechnician.Name}</strong>?</p>
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
