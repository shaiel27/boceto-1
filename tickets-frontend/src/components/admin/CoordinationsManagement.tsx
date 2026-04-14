import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  User,
  X,
  Layers,
  MapPin
} from 'lucide-react';
import './InstitutionalStructure.css';

interface Coordination {
  ID_Coordination: string;
  Fk_Division: string;
  Name_Coordination: string;
  Fk_Coordinator: string;
  Coordinator_Name?: string;
  Coordinator_Email?: string;
  Division_Name?: string;
  Direction_Name?: string;
  created_at: string;
}

interface Division {
  ID_Division: string;
  Name_Division: string;
  Fk_Direction: string;
  Direction_Name?: string;
}

interface User {
  ID_Users: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
}

const CoordinationsManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const [coordinations, setCoordinations] = useState<Coordination[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCoordination, setSelectedCoordination] = useState<Coordination | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name_coordination: '',
    fk_division: '',
    fk_coordinator: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockDivisions: Division[] = [
        { ID_Division: '1', Name_Division: 'División de Docencia', Fk_Direction: '1', Direction_Name: 'Dirección de Educación' },
        { ID_Division: '2', Name_Division: 'División de Administración', Fk_Direction: '1', Direction_Name: 'Dirección de Educación' },
        { ID_Division: '3', Name_Division: 'División de Ingeniería', Fk_Direction: '2', Direction_Name: 'Dirección de Vialidad' },
        { ID_Division: '4', Name_Division: 'División de Atención Médica', Fk_Direction: '3', Direction_Name: 'Dirección de Salud' },
        { ID_Division: '5', Name_Division: 'División de Construcción', Fk_Direction: '4', Direction_Name: 'Dirección de Obras Públicas' }
      ];

      const mockUsers: User[] = [
        { ID_Users: '1', First_Name: 'Carlos', Last_Name: 'Rodríguez', Email: 'carlos.rodriguez@municipio.gob' },
        { ID_Users: '2', First_Name: 'María', Last_Name: 'González', Email: 'maria.gonzalez@municipio.gob' },
        { ID_Users: '3', First_Name: 'Juan', Last_Name: 'Pérez', Email: 'juan.perez@municipio.gob' },
        { ID_Users: '4', First_Name: 'Ana', Last_Name: 'Martínez', Email: 'ana.martinez@municipio.gob' },
        { ID_Users: '5', First_Name: 'Pedro', Last_Name: 'López', Email: 'pedro.lopez@municipio.gob' },
        { ID_Users: '6', First_Name: 'Laura', Last_Name: 'Sánchez', Email: 'laura.sanchez@municipio.gob' },
        { ID_Users: '7', First_Name: 'Roberto', Last_Name: 'Díaz', Email: 'roberto.diaz@municipio.gob' },
        { ID_Users: '8', First_Name: 'Carmen', Last_Name: 'Ruiz', Email: 'carmen.ruiz@municipio.gob' }
      ];

      const mockCoordinations: Coordination[] = [
        {
          ID_Coordination: '1',
          Fk_Division: '1',
          Name_Coordination: 'Coordinación de Servicios Tecnológicos',
          Fk_Coordinator: '7',
          Coordinator_Name: 'Roberto Díaz',
          Coordinator_Email: 'roberto.diaz@municipio.gob',
          Division_Name: 'División de Docencia',
          Direction_Name: 'Dirección de Educación',
          created_at: '2024-01-25T10:00:00'
        },
        {
          ID_Coordination: '2',
          Fk_Division: '1',
          Name_Coordination: 'Coordinación de Recursos Educativos',
          Fk_Coordinator: '8',
          Coordinator_Name: 'Carmen Ruiz',
          Coordinator_Email: 'carmen.ruiz@municipio.gob',
          Division_Name: 'División de Docencia',
          Direction_Name: 'Dirección de Educación',
          created_at: '2024-02-01T14:30:00'
        },
        {
          ID_Coordination: '3',
          Fk_Division: '2',
          Name_Coordination: 'Coordinación de Finanzas',
          Fk_Coordinator: '5',
          Coordinator_Name: 'Pedro López',
          Coordinator_Email: 'pedro.lopez@municipio.gob',
          Division_Name: 'División de Administración',
          Direction_Name: 'Dirección de Educación',
          created_at: '2024-02-10T09:15:00'
        },
        {
          ID_Coordination: '4',
          Fk_Division: '3',
          Name_Coordination: 'Coordinación de Mantenimiento Vial',
          Fk_Coordinator: '3',
          Coordinator_Name: 'Juan Pérez',
          Coordinator_Email: 'juan.perez@municipio.gob',
          Division_Name: 'División de Ingeniería',
          Direction_Name: 'Dirección de Vialidad',
          created_at: '2024-03-05T16:45:00'
        },
        {
          ID_Coordination: '5',
          Fk_Division: '4',
          Name_Coordination: 'Coordinación de Urgencias',
          Fk_Coordinator: '4',
          Coordinator_Name: 'Ana Martínez',
          Coordinator_Email: 'ana.martinez@municipio.gob',
          Division_Name: 'División de Atención Médica',
          Direction_Name: 'Dirección de Salud',
          created_at: '2024-03-15T11:00:00'
        },
        {
          ID_Coordination: '6',
          Fk_Division: '5',
          Name_Coordination: 'Coordinación de Proyectos',
          Fk_Coordinator: '1',
          Coordinator_Name: 'Carlos Rodríguez',
          Coordinator_Email: 'carlos.rodriguez@municipio.gob',
          Division_Name: 'División de Construcción',
          Direction_Name: 'Dirección de Obras Públicas',
          created_at: '2024-04-01T08:30:00'
        }
      ];

      setDivisions(mockDivisions);
      setUsers(mockUsers);
      setCoordinations(mockCoordinations);
      setLoading(false);
    }, 1000);
  };

  const filteredCoordinations = coordinations.filter(coordination => {
    const matchesSearch = coordination.Name_Coordination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coordination.Coordinator_Name && coordination.Coordinator_Name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDivision = divisionFilter === 'all' || coordination.Fk_Division === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const coordinator = users.find(u => u.ID_Users === formData.fk_coordinator);
    const division = divisions.find(d => d.ID_Division === formData.fk_division);
    
    const newCoordination: Coordination = {
      ID_Coordination: Date.now().toString(),
      Fk_Division: formData.fk_division,
      Name_Coordination: formData.name_coordination,
      Fk_Coordinator: formData.fk_coordinator,
      Coordinator_Name: coordinator ? `${coordinator.First_Name} ${coordinator.Last_Name}` : '',
      Coordinator_Email: coordinator ? coordinator.Email : '',
      Division_Name: division ? division.Name_Division : '',
      Direction_Name: division ? division.Direction_Name : '',
      created_at: new Date().toISOString()
    };

    setCoordinations(prev => [...prev, newCoordination]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCoordination) {
      const coordinator = users.find(u => u.ID_Users === formData.fk_coordinator);
      const division = divisions.find(d => d.ID_Division === formData.fk_division);
      
      const updatedCoordination: Coordination = {
        ...selectedCoordination,
        Fk_Division: formData.fk_division,
        Name_Coordination: formData.name_coordination,
        Fk_Coordinator: formData.fk_coordinator,
        Coordinator_Name: coordinator ? `${coordinator.First_Name} ${coordinator.Last_Name}` : '',
        Coordinator_Email: coordinator ? coordinator.Email : '',
        Division_Name: division ? division.Name_Division : '',
        Direction_Name: division ? division.Direction_Name : ''
      };

      setCoordinations(prev => prev.map(c => c.ID_Coordination === selectedCoordination.ID_Coordination ? updatedCoordination : c));
      setShowEditModal(false);
      setSelectedCoordination(null);
      resetForm();
    }
  };

  const handleDelete = () => {
    if (selectedCoordination) {
      setCoordinations(prev => prev.filter(c => c.ID_Coordination !== selectedCoordination.ID_Coordination));
      setShowDeleteModal(false);
      setSelectedCoordination(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name_coordination: '',
      fk_division: '',
      fk_coordinator: ''
    });
  };

  const openEditModal = (coordination: Coordination) => {
    setSelectedCoordination(coordination);
    setFormData({
      name_coordination: coordination.Name_Coordination,
      fk_division: coordination.Fk_Division,
      fk_coordinator: coordination.Fk_Coordinator
    });
    setShowEditModal(true);
  };

  const stats = {
    total: coordinations.length,
    divisionsCount: new Set(coordinations.map(c => c.Fk_Division)).size,
    directionsCount: new Set(coordinations.map(c => c.Direction_Name)).size
  };

  return (
    <div className="coordinations-management">
      <div className="page-container">
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <MapPin size={28} />
                Gestión de Coordinaciones
              </h1>
              <p className="page-description">Administra las coordinaciones y sus coordinadores</p>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Coordinaciones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.divisionsCount}</span>
                <span className="stat-label">Divisiones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.directionsCount}</span>
                <span className="stat-label">Direcciones</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn secondary" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft size={18} />
              Volver al Panel
            </button>
            <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Nueva Coordinación
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-label">Total Coordinaciones</p>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <Layers size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.divisionsCount}</h3>
              <p className="stat-label">Divisiones</p>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.directionsCount}</h3>
              <p className="stat-label">Direcciones</p>
            </div>
          </div>
        </div>

        <section className="search-filters">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar coordinación o coordinador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <label>División</label>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las divisiones</option>
                {divisions.map(division => (
                  <option key={division.ID_Division} value={division.ID_Division}>
                    {division.Name_Division}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="coordinations-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando coordinaciones...</p>
            </div>
          ) : (
            <div className="coordinations-table-container">
              <table className="coordinations-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>División</th>
                    <th>Coordinador</th>
                    <th>Email Coordinador</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoordinations.map(coordination => (
                    <tr key={coordination.ID_Coordination} className="coordination-row">
                      <td className="name-cell">
                        <div className="coordination-name">{coordination.Name_Coordination}</div>
                      </td>
                      <td className="direction-cell">
                        <div className="direction-info">
                          <Building2 size={14} />
                          <span>{coordination.Direction_Name || '-'}</span>
                        </div>
                      </td>
                      <td className="division-cell">
                        <div className="division-info">
                          <Layers size={14} />
                          <span>{coordination.Division_Name || '-'}</span>
                        </div>
                      </td>
                      <td className="coordinator-cell">
                        <div className="coordinator-info">
                          <User size={14} />
                          <span>{coordination.Coordinator_Name || 'Sin asignar'}</span>
                        </div>
                      </td>
                      <td className="email-cell">
                        {coordination.Coordinator_Email || '-'}
                      </td>
                      <td className="date-cell">
                        {new Date(coordination.created_at).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <div className="coordination-actions">
                          <button
                            className="action-btn-small"
                            onClick={() => {
                              setSelectedCoordination(coordination);
                              setShowDetailModal(true);
                            }}
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="action-btn-small"
                            onClick={() => openEditModal(coordination)}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="action-btn-small danger"
                            onClick={() => {
                              setSelectedCoordination(coordination);
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
              
              {filteredCoordinations.length === 0 && (
                <div className="empty-state">
                  <MapPin size={48} className="empty-icon" />
                  <h3>No se encontraron coordinaciones</h3>
                  <p>No hay coordinaciones que coincidan con los filtros.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agregar Nueva Coordinación</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="coordination-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la Coordinación</label>
                  <input
                    type="text"
                    name="name_coordination"
                    value={formData.name_coordination}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Coordinación de Servicios Tecnológicos"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>División</label>
                  <select
                    name="fk_division"
                    value={formData.fk_division}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar división...</option>
                    {divisions.map(division => (
                      <option key={division.ID_Division} value={division.ID_Division}>
                        {division.Name_Division} ({division.Direction_Name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Coordinador</label>
                  <select
                    name="fk_coordinator"
                    value={formData.fk_coordinator}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar coordinador...</option>
                    {users.map(user => (
                      <option key={user.ID_Users} value={user.ID_Users}>
                        {user.First_Name} {user.Last_Name} ({user.Email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  Agregar Coordinación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedCoordination && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Coordinación</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="coordination-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la Coordinación</label>
                  <input
                    type="text"
                    name="name_coordination"
                    value={formData.name_coordination}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>División</label>
                  <select
                    name="fk_division"
                    value={formData.fk_division}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar división...</option>
                    {divisions.map(division => (
                      <option key={division.ID_Division} value={division.ID_Division}>
                        {division.Name_Division} ({division.Direction_Name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Coordinador</label>
                  <select
                    name="fk_coordinator"
                    value={formData.fk_coordinator}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar coordinador...</option>
                    {users.map(user => (
                      <option key={user.ID_Users} value={user.ID_Users}>
                        {user.First_Name} {user.Last_Name} ({user.Email})
                      </option>
                    ))}
                  </select>
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

      {showDetailModal && selectedCoordination && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalles de la Coordinación</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="coordination-detail">
              <div className="detail-header">
                <div className="detail-icon">
                  <MapPin size={48} />
                </div>
                <div className="detail-summary">
                  <h3>{selectedCoordination.Name_Coordination}</h3>
                  <p>ID: {selectedCoordination.ID_Coordination}</p>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Información de la Coordinación</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <Building2 size={16} />
                      <span>Dirección: {selectedCoordination.Direction_Name || '-'}</span>
                    </div>
                    <div className="detail-item">
                      <Layers size={16} />
                      <span>División: {selectedCoordination.Division_Name || '-'}</span>
                    </div>
                    <div className="detail-item">
                      <User size={16} />
                      <span>Coordinador: {selectedCoordination.Coordinator_Name || 'Sin asignar'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Email Coordinador: {selectedCoordination.Coordinator_Email || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Información de Creación</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span>Creado: {new Date(selectedCoordination.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedCoordination && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Eliminar Coordinación</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-confirmation">
              <Trash2 size={48} className="warning-icon" />
              <p>¿Estás seguro de eliminar la coordinación?</p>
              <p className="warning-text">{selectedCoordination.Name_Coordination}</p>
              <p className="warning-subtext">Esta acción no se puede deshacer.</p>
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

export default CoordinationsManagement;
