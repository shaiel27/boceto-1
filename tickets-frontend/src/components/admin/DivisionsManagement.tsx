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
  Layers
} from 'lucide-react';
import './InstitutionalStructure.css';

interface Division {
  ID_Division: string;
  Fk_Direction: string;
  Name_Division: string;
  Fk_Division_Head: string;
  Division_Head_Name?: string;
  Division_Head_Email?: string;
  Direction_Name?: string;
  created_at: string;
  Coordination_Count: number;
}

interface Direction {
  ID_Direction: string;
  Name_Direction: string;
}

interface User {
  ID_Users: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
}

const DivisionsManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name_division: '',
    fk_direction: '',
    fk_division_head: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockDirections: Direction[] = [
        { ID_Direction: '1', Name_Direction: 'Dirección de Educación' },
        { ID_Direction: '2', Name_Direction: 'Dirección de Vialidad' },
        { ID_Direction: '3', Name_Direction: 'Dirección de Salud' },
        { ID_Direction: '4', Name_Direction: 'Dirección de Obras Públicas' }
      ];

      const mockUsers: User[] = [
        { ID_Users: '1', First_Name: 'Carlos', Last_Name: 'Rodríguez', Email: 'carlos.rodriguez@municipio.gob' },
        { ID_Users: '2', First_Name: 'María', Last_Name: 'González', Email: 'maria.gonzalez@municipio.gob' },
        { ID_Users: '3', First_Name: 'Juan', Last_Name: 'Pérez', Email: 'juan.perez@municipio.gob' },
        { ID_Users: '4', First_Name: 'Ana', Last_Name: 'Martínez', Email: 'ana.martinez@municipio.gob' },
        { ID_Users: '5', First_Name: 'Pedro', Last_Name: 'López', Email: 'pedro.lopez@municipio.gob' },
        { ID_Users: '6', First_Name: 'Laura', Last_Name: 'Sánchez', Email: 'laura.sanchez@municipio.gob' }
      ];

      const mockDivisions: Division[] = [
        {
          ID_Division: '1',
          Fk_Direction: '1',
          Name_Division: 'División de Docencia',
          Fk_Division_Head: '5',
          Division_Head_Name: 'Pedro López',
          Division_Head_Email: 'pedro.lopez@municipio.gob',
          Direction_Name: 'Dirección de Educación',
          created_at: '2024-01-20T10:00:00',
          Coordination_Count: 3
        },
        {
          ID_Division: '2',
          Fk_Direction: '1',
          Name_Division: 'División de Administración',
          Fk_Division_Head: '6',
          Division_Head_Name: 'Laura Sánchez',
          Division_Head_Email: 'laura.sanchez@municipio.gob',
          Direction_Name: 'Dirección de Educación',
          created_at: '2024-01-25T14:30:00',
          Coordination_Count: 2
        },
        {
          ID_Division: '3',
          Fk_Direction: '2',
          Name_Division: 'División de Ingeniería',
          Fk_Division_Head: '3',
          Division_Head_Name: 'Juan Pérez',
          Division_Head_Email: 'juan.perez@municipio.gob',
          Direction_Name: 'Dirección de Vialidad',
          created_at: '2024-02-10T09:15:00',
          Coordination_Count: 2
        },
        {
          ID_Division: '4',
          Fk_Direction: '3',
          Name_Division: 'División de Atención Médica',
          Fk_Division_Head: '4',
          Division_Head_Name: 'Ana Martínez',
          Division_Head_Email: 'ana.martinez@municipio.gob',
          Direction_Name: 'Dirección de Salud',
          created_at: '2024-03-05T16:45:00',
          Coordination_Count: 4
        },
        {
          ID_Division: '5',
          Fk_Direction: '4',
          Name_Division: 'División de Construcción',
          Fk_Division_Head: '1',
          Division_Head_Name: 'Carlos Rodríguez',
          Division_Head_Email: 'carlos.rodriguez@municipio.gob',
          Direction_Name: 'Dirección de Obras Públicas',
          created_at: '2024-04-01T11:00:00',
          Coordination_Count: 3
        }
      ];

      setDirections(mockDirections);
      setUsers(mockUsers);
      setDivisions(mockDivisions);
      setLoading(false);
    }, 1000);
  };

  const filteredDivisions = divisions.filter(division => {
    const matchesSearch = division.Name_Division.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (division.Division_Head_Name && division.Division_Head_Name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDirection = directionFilter === 'all' || division.Fk_Direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const divisionHead = users.find(u => u.ID_Users === formData.fk_division_head);
    const direction = directions.find(d => d.ID_Direction === formData.fk_direction);
    
    const newDivision: Division = {
      ID_Division: Date.now().toString(),
      Fk_Direction: formData.fk_direction,
      Name_Division: formData.name_division,
      Fk_Division_Head: formData.fk_division_head,
      Division_Head_Name: divisionHead ? `${divisionHead.First_Name} ${divisionHead.Last_Name}` : '',
      Division_Head_Email: divisionHead ? divisionHead.Email : '',
      Direction_Name: direction ? direction.Name_Direction : '',
      created_at: new Date().toISOString(),
      Coordination_Count: 0
    };

    setDivisions(prev => [...prev, newDivision]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDivision) {
      const divisionHead = users.find(u => u.ID_Users === formData.fk_division_head);
      const direction = directions.find(d => d.ID_Direction === formData.fk_direction);
      
      const updatedDivision: Division = {
        ...selectedDivision,
        Fk_Direction: formData.fk_direction,
        Name_Division: formData.name_division,
        Fk_Division_Head: formData.fk_division_head,
        Division_Head_Name: divisionHead ? `${divisionHead.First_Name} ${divisionHead.Last_Name}` : '',
        Division_Head_Email: divisionHead ? divisionHead.Email : '',
        Direction_Name: direction ? direction.Name_Direction : ''
      };

      setDivisions(prev => prev.map(d => d.ID_Division === selectedDivision.ID_Division ? updatedDivision : d));
      setShowEditModal(false);
      setSelectedDivision(null);
      resetForm();
    }
  };

  const handleDelete = () => {
    if (selectedDivision) {
      setDivisions(prev => prev.filter(d => d.ID_Division !== selectedDivision.ID_Division));
      setShowDeleteModal(false);
      setSelectedDivision(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name_division: '',
      fk_direction: '',
      fk_division_head: ''
    });
  };

  const openEditModal = (division: Division) => {
    setSelectedDivision(division);
    setFormData({
      name_division: division.Name_Division,
      fk_direction: division.Fk_Direction,
      fk_division_head: division.Fk_Division_Head
    });
    setShowEditModal(true);
  };

  const stats = {
    total: divisions.length,
    totalCoordinations: divisions.reduce((acc, d) => acc + d.Coordination_Count, 0),
    directionsCount: new Set(divisions.map(d => d.Fk_Direction)).size
  };

  return (
    <div className="divisions-management">
      <div className="page-container">
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <Layers size={28} />
                Gestión de Divisiones
              </h1>
              <p className="page-description">Administra las divisiones y sus jefes</p>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Divisiones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.directionsCount}</span>
                <span className="stat-label">Direcciones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalCoordinations}</span>
                <span className="stat-label">Coordinaciones</span>
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
              Nueva División
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Layers size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-label">Total Divisiones</p>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.directionsCount}</h3>
              <p className="stat-label">Direcciones</p>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <Layers size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalCoordinations}</h3>
              <p className="stat-label">Total Coordinaciones</p>
            </div>
          </div>
        </div>

        <section className="search-filters">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar división o jefe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <label>Dirección</label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las direcciones</option>
                {directions.map(direction => (
                  <option key={direction.ID_Direction} value={direction.ID_Direction}>
                    {direction.Name_Direction}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="divisions-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando divisiones...</p>
            </div>
          ) : (
            <div className="divisions-table-container">
              <table className="divisions-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Jefe de División</th>
                    <th>Email Jefe</th>
                    <th>Coordinaciones</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDivisions.map(division => (
                    <tr key={division.ID_Division} className="division-row">
                      <td className="name-cell">
                        <div className="division-name">{division.Name_Division}</div>
                      </td>
                      <td className="direction-cell">
                        <div className="direction-info">
                          <Building2 size={14} />
                          <span>{division.Direction_Name || '-'}</span>
                        </div>
                      </td>
                      <td className="head-cell">
                        <div className="head-info">
                          <User size={14} />
                          <span>{division.Division_Head_Name || 'Sin asignar'}</span>
                        </div>
                      </td>
                      <td className="email-cell">
                        {division.Division_Head_Email || '-'}
                      </td>
                      <td className="count-cell">
                        <span className="count-badge">{division.Coordination_Count}</span>
                      </td>
                      <td className="date-cell">
                        {new Date(division.created_at).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <div className="division-actions">
                          <button
                            className="action-btn-small"
                            onClick={() => {
                              setSelectedDivision(division);
                              setShowDetailModal(true);
                            }}
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="action-btn-small"
                            onClick={() => openEditModal(division)}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="action-btn-small danger"
                            onClick={() => {
                              setSelectedDivision(division);
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
              
              {filteredDivisions.length === 0 && (
                <div className="empty-state">
                  <Layers size={48} className="empty-icon" />
                  <h3>No se encontraron divisiones</h3>
                  <p>No hay divisiones que coincidan con los filtros.</p>
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
              <h2>Agregar Nueva División</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="division-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la División</label>
                  <input
                    type="text"
                    name="name_division"
                    value={formData.name_division}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: División de Docencia"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Dirección</label>
                  <select
                    name="fk_direction"
                    value={formData.fk_direction}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar dirección...</option>
                    {directions.map(direction => (
                      <option key={direction.ID_Direction} value={direction.ID_Direction}>
                        {direction.Name_Direction}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Jefe de División</label>
                  <select
                    name="fk_division_head"
                    value={formData.fk_division_head}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar jefe...</option>
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
                  Agregar División
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedDivision && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar División</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="division-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la División</label>
                  <input
                    type="text"
                    name="name_division"
                    value={formData.name_division}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Dirección</label>
                  <select
                    name="fk_direction"
                    value={formData.fk_direction}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar dirección...</option>
                    {directions.map(direction => (
                      <option key={direction.ID_Direction} value={direction.ID_Direction}>
                        {direction.Name_Direction}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Jefe de División</label>
                  <select
                    name="fk_division_head"
                    value={formData.fk_division_head}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar jefe...</option>
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

      {showDetailModal && selectedDivision && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalles de la División</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="division-detail">
              <div className="detail-header">
                <div className="detail-icon">
                  <Layers size={48} />
                </div>
                <div className="detail-summary">
                  <h3>{selectedDivision.Name_Division}</h3>
                  <p>ID: {selectedDivision.ID_Division}</p>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Información de la División</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <Building2 size={16} />
                      <span>Dirección: {selectedDivision.Direction_Name || '-'}</span>
                    </div>
                    <div className="detail-item">
                      <User size={16} />
                      <span>Jefe: {selectedDivision.Division_Head_Name || 'Sin asignar'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Email Jefe: {selectedDivision.Division_Head_Email || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Estadísticas</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span>Coordinaciones: {selectedDivision.Coordination_Count}</span>
                    </div>
                    <div className="detail-item">
                      <span>Creado: {new Date(selectedDivision.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDivision && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Eliminar División</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-confirmation">
              <Trash2 size={48} className="warning-icon" />
              <p>¿Estás seguro de eliminar la división?</p>
              <p className="warning-text">{selectedDivision.Name_Division}</p>
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

export default DivisionsManagement;
