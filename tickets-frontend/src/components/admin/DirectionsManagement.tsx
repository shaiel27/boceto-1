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
  ChevronDown,
  X
} from 'lucide-react';
import './InstitutionalStructure.css';

interface Direction {
  ID_Direction: string;
  Name_Direction: string;
  Fk_Director: string;
  Director_Name?: string;
  Director_Email?: string;
  created_at: string;
  Division_Count: number;
  Coordination_Count: number;
}

interface User {
  ID_Users: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
}

const DirectionsManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const [directions, setDirections] = useState<Direction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name_direction: '',
    fk_director: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockUsers: User[] = [
        { ID_Users: '1', First_Name: 'Carlos', Last_Name: 'Rodríguez', Email: 'carlos.rodriguez@municipio.gob' },
        { ID_Users: '2', First_Name: 'María', Last_Name: 'González', Email: 'maria.gonzalez@municipio.gob' },
        { ID_Users: '3', First_Name: 'Juan', Last_Name: 'Pérez', Email: 'juan.perez@municipio.gob' },
        { ID_Users: '4', First_Name: 'Ana', Last_Name: 'Martínez', Email: 'ana.martinez@municipio.gob' }
      ];

      const mockDirections: Direction[] = [
        {
          ID_Direction: '1',
          Name_Direction: 'Dirección de Educación',
          Fk_Director: '1',
          Director_Name: 'Carlos Rodríguez',
          Director_Email: 'carlos.rodriguez@municipio.gob',
          created_at: '2024-01-15T10:00:00',
          Division_Count: 3,
          Coordination_Count: 8
        },
        {
          ID_Direction: '2',
          Name_Direction: 'Dirección de Vialidad',
          Fk_Director: '2',
          Director_Name: 'María González',
          Director_Email: 'maria.gonzalez@municipio.gob',
          created_at: '2024-02-20T14:30:00',
          Division_Count: 2,
          Coordination_Count: 5
        },
        {
          ID_Direction: '3',
          Name_Direction: 'Dirección de Salud',
          Fk_Director: '3',
          Director_Name: 'Juan Pérez',
          Director_Email: 'juan.perez@municipio.gob',
          created_at: '2024-03-10T09:15:00',
          Division_Count: 4,
          Coordination_Count: 10
        },
        {
          ID_Direction: '4',
          Name_Direction: 'Dirección de Obras Públicas',
          Fk_Director: '4',
          Director_Name: 'Ana Martínez',
          Director_Email: 'ana.martinez@municipio.gob',
          created_at: '2024-04-05T16:45:00',
          Division_Count: 3,
          Coordination_Count: 7
        }
      ];

      setUsers(mockUsers);
      setDirections(mockDirections);
      setLoading(false);
    }, 1000);
  };

  const filteredDirections = directions.filter(direction =>
    direction.Name_Direction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (direction.Director_Name && direction.Director_Name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const director = users.find(u => u.ID_Users === formData.fk_director);
    
    const newDirection: Direction = {
      ID_Direction: Date.now().toString(),
      Name_Direction: formData.name_direction,
      Fk_Director: formData.fk_director,
      Director_Name: director ? `${director.First_Name} ${director.Last_Name}` : '',
      Director_Email: director ? director.Email : '',
      created_at: new Date().toISOString(),
      Division_Count: 0,
      Coordination_Count: 0
    };

    setDirections(prev => [...prev, newDirection]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDirection) {
      const director = users.find(u => u.ID_Users === formData.fk_director);
      
      const updatedDirection: Direction = {
        ...selectedDirection,
        Name_Direction: formData.name_direction,
        Fk_Director: formData.fk_director,
        Director_Name: director ? `${director.First_Name} ${director.Last_Name}` : '',
        Director_Email: director ? director.Email : ''
      };

      setDirections(prev => prev.map(d => d.ID_Direction === selectedDirection.ID_Direction ? updatedDirection : d));
      setShowEditModal(false);
      setSelectedDirection(null);
      resetForm();
    }
  };

  const handleDelete = () => {
    if (selectedDirection) {
      setDirections(prev => prev.filter(d => d.ID_Direction !== selectedDirection.ID_Direction));
      setShowDeleteModal(false);
      setSelectedDirection(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name_direction: '',
      fk_director: ''
    });
  };

  const openEditModal = (direction: Direction) => {
    setSelectedDirection(direction);
    setFormData({
      name_direction: direction.Name_Direction,
      fk_director: direction.Fk_Director
    });
    setShowEditModal(true);
  };

  const stats = {
    total: directions.length,
    totalDivisions: directions.reduce((acc, d) => acc + d.Division_Count, 0),
    totalCoordinations: directions.reduce((acc, d) => acc + d.Coordination_Count, 0)
  };

  return (
    <div className="directions-management">
      <div className="page-container">
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <Building2 size={28} />
                Gestión de Direcciones
              </h1>
              <p className="page-description">Administra las direcciones municipales y sus directores</p>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Direcciones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalDivisions}</span>
                <span className="stat-label">Divisiones</span>
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
              Nueva Dirección
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-label">Total Direcciones</p>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalDivisions}</h3>
              <p className="stat-label">Total Divisiones</p>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <Building2 size={24} />
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
                placeholder="Buscar dirección o director..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </section>

        <div className="directions-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando direcciones...</p>
            </div>
          ) : (
            <div className="directions-table-container">
              <table className="directions-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Director</th>
                    <th>Email Director</th>
                    <th>Divisiones</th>
                    <th>Coordinaciones</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDirections.map(direction => (
                    <tr key={direction.ID_Direction} className="direction-row">
                      <td className="name-cell">
                        <div className="direction-name">{direction.Name_Direction}</div>
                      </td>
                      <td className="director-cell">
                        <div className="director-info">
                          <User size={14} />
                          <span>{direction.Director_Name || 'Sin asignar'}</span>
                        </div>
                      </td>
                      <td className="email-cell">
                        {direction.Director_Email || '-'}
                      </td>
                      <td className="count-cell">
                        <span className="count-badge">{direction.Division_Count}</span>
                      </td>
                      <td className="count-cell">
                        <span className="count-badge">{direction.Coordination_Count}</span>
                      </td>
                      <td className="date-cell">
                        {new Date(direction.created_at).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <div className="direction-actions">
                          <button
                            className="action-btn-small"
                            onClick={() => {
                              setSelectedDirection(direction);
                              setShowDetailModal(true);
                            }}
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="action-btn-small"
                            onClick={() => openEditModal(direction)}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="action-btn-small danger"
                            onClick={() => {
                              setSelectedDirection(direction);
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
              
              {filteredDirections.length === 0 && (
                <div className="empty-state">
                  <Building2 size={48} className="empty-icon" />
                  <h3>No se encontraron direcciones</h3>
                  <p>No hay direcciones que coincidan con la búsqueda.</p>
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
              <h2>Agregar Nueva Dirección</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="direction-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la Dirección</label>
                  <input
                    type="text"
                    name="name_direction"
                    value={formData.name_direction}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Dirección de Educación"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Director</label>
                  <select
                    name="fk_director"
                    value={formData.fk_director}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar director...</option>
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
                  Agregar Dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedDirection && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Dirección</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="direction-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la Dirección</label>
                  <input
                    type="text"
                    name="name_direction"
                    value={formData.name_direction}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Director</label>
                  <select
                    name="fk_director"
                    value={formData.fk_director}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar director...</option>
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

      {showDetailModal && selectedDirection && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalles de la Dirección</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="direction-detail">
              <div className="detail-header">
                <div className="detail-icon">
                  <Building2 size={48} />
                </div>
                <div className="detail-summary">
                  <h3>{selectedDirection.Name_Direction}</h3>
                  <p>ID: {selectedDirection.ID_Direction}</p>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Información del Director</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <User size={16} />
                      <span>{selectedDirection.Director_Name || 'Sin asignar'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Email: {selectedDirection.Director_Email || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Estadísticas</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span>Divisiones: {selectedDirection.Division_Count}</span>
                    </div>
                    <div className="detail-item">
                      <span>Coordinaciones: {selectedDirection.Coordination_Count}</span>
                    </div>
                    <div className="detail-item">
                      <span>Creado: {new Date(selectedDirection.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDirection && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Eliminar Dirección</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-confirmation">
              <Trash2 size={48} className="warning-icon" />
              <p>¿Estás seguro de eliminar la dirección?</p>
              <p className="warning-text">{selectedDirection.Name_Direction}</p>
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

export default DirectionsManagement;
