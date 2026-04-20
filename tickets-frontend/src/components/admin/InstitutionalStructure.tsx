import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
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
  MapPin,
  ChevronRight,
  ChevronDown
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
  divisions?: Division[];
  expanded?: boolean;
}

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
  coordinations?: Coordination[];
  expanded?: boolean;
}

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

interface User {
  ID_Users: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
}

const InstitutionalStructure: React.FC = () => {
  const navigate = useNavigate();
  
  const [directions, setDirections] = useState<Direction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'directions' | 'divisions' | 'coordinations'>('directions');
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedCoordination, setSelectedCoordination] = useState<Coordination | null>(null);
  
  // Modals
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [showCoordinationModal, setShowCoordinationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState<'direction' | 'division' | 'coordination'>('direction');
  
  const [formData, setFormData] = useState({
    name: '',
    fk_direction: '',
    fk_division: '',
    fk_director: '',
    fk_division_head: '',
    fk_coordinator: ''
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
          Coordination_Count: 2,
          coordinations: mockCoordinations.filter(c => c.Fk_Division === '1')
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
          Coordination_Count: 1,
          coordinations: mockCoordinations.filter(c => c.Fk_Division === '2')
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
          Coordination_Count: 1,
          coordinations: mockCoordinations.filter(c => c.Fk_Division === '3')
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
          Coordination_Count: 1,
          coordinations: mockCoordinations.filter(c => c.Fk_Division === '4')
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
          Coordination_Count: 1,
          coordinations: mockCoordinations.filter(c => c.Fk_Division === '5')
        }
      ];

      const mockDirections: Direction[] = [
        {
          ID_Direction: '1',
          Name_Direction: 'Dirección de Educación',
          Fk_Director: '1',
          Director_Name: 'Carlos Rodríguez',
          Director_Email: 'carlos.rodriguez@municipio.gob',
          created_at: '2024-01-15T10:00:00',
          Division_Count: 2,
          Coordination_Count: 3,
          divisions: mockDivisions.filter(d => d.Fk_Direction === '1')
        },
        {
          ID_Direction: '2',
          Name_Direction: 'Dirección de Vialidad',
          Fk_Director: '2',
          Director_Name: 'María González',
          Director_Email: 'maria.gonzalez@municipio.gob',
          created_at: '2024-02-20T14:30:00',
          Division_Count: 1,
          Coordination_Count: 1,
          divisions: mockDivisions.filter(d => d.Fk_Direction === '2')
        },
        {
          ID_Direction: '3',
          Name_Direction: 'Dirección de Salud',
          Fk_Director: '3',
          Director_Name: 'Juan Pérez',
          Director_Email: 'juan.perez@municipio.gob',
          created_at: '2024-03-10T09:15:00',
          Division_Count: 1,
          Coordination_Count: 1,
          divisions: mockDivisions.filter(d => d.Fk_Direction === '3')
        },
        {
          ID_Direction: '4',
          Name_Direction: 'Dirección de Obras Públicas',
          Fk_Director: '4',
          Director_Name: 'Ana Martínez',
          Director_Email: 'ana.martinez@municipio.gob',
          created_at: '2024-04-05T16:45:00',
          Division_Count: 1,
          Coordination_Count: 1,
          divisions: mockDivisions.filter(d => d.Fk_Direction === '4')
        }
      ];

      setUsers(mockUsers);
      setDirections(mockDirections);
      setLoading(false);
    }, 1000);
  };

  const toggleDirection = (directionId: string) => {
    setDirections(prev => prev.map(d => 
      d.ID_Direction === directionId 
        ? { ...d, expanded: !d.expanded }
        : d
    ));
  };

  const toggleDivision = (directionId: string, divisionId: string) => {
    setDirections(prev => prev.map(d => {
      if (d.ID_Direction === directionId && d.divisions) {
        return {
          ...d,
          divisions: d.divisions.map(div => 
            div.ID_Division === divisionId 
              ? { ...div, expanded: !div.expanded }
              : div
          )
        };
      }
      return d;
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      fk_direction: '',
      fk_division: '',
      fk_director: '',
      fk_division_head: '',
      fk_coordinator: ''
    });
  };

  const openAddModal = (type: 'direction' | 'division' | 'coordination') => {
    setModalType(type);
    resetForm();
    if (type === 'direction') setShowDirectionModal(true);
    else if (type === 'division') setShowDivisionModal(true);
    else setShowCoordinationModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalType === 'direction') {
      const director = users.find(u => u.ID_Users === formData.fk_director);
      const newDirection: Direction = {
        ID_Direction: Date.now().toString(),
        Name_Direction: formData.name,
        Fk_Director: formData.fk_director,
        Director_Name: director ? `${director.First_Name} ${director.Last_Name}` : '',
        Director_Email: director ? director.Email : '',
        created_at: new Date().toISOString(),
        Division_Count: 0,
        Coordination_Count: 0,
        divisions: []
      };
      setDirections(prev => [...prev, newDirection]);
      setShowDirectionModal(false);
    } else if (modalType === 'division') {
      const divisionHead = users.find(u => u.ID_Users === formData.fk_division_head);
      const direction = directions.find(d => d.ID_Direction === formData.fk_direction);
      const newDivision: Division = {
        ID_Division: Date.now().toString(),
        Fk_Direction: formData.fk_direction,
        Name_Division: formData.name,
        Fk_Division_Head: formData.fk_division_head,
        Division_Head_Name: divisionHead ? `${divisionHead.First_Name} ${divisionHead.Last_Name}` : '',
        Division_Head_Email: divisionHead ? divisionHead.Email : '',
        Direction_Name: direction ? direction.Name_Direction : '',
        created_at: new Date().toISOString(),
        Coordination_Count: 0,
        coordinations: []
      };
      setDirections(prev => prev.map(d => 
        d.ID_Direction === formData.fk_direction 
          ? { ...d, divisions: [...(d.divisions || []), newDivision], Division_Count: d.Division_Count + 1 }
          : d
      ));
      setShowDivisionModal(false);
    } else if (modalType === 'coordination') {
      const coordinator = users.find(u => u.ID_Users === formData.fk_coordinator);
      const division = directions
        .find(d => d.ID_Direction === formData.fk_direction)
        ?.divisions?.find(div => div.ID_Division === formData.fk_division);
      const direction = directions.find(d => d.ID_Direction === formData.fk_direction);
      const newCoordination: Coordination = {
        ID_Coordination: Date.now().toString(),
        Fk_Division: formData.fk_division,
        Name_Coordination: formData.name,
        Fk_Coordinator: formData.fk_coordinator,
        Coordinator_Name: coordinator ? `${coordinator.First_Name} ${coordinator.Last_Name}` : '',
        Coordinator_Email: coordinator ? coordinator.Email : '',
        Division_Name: division ? division.Name_Division : '',
        Direction_Name: direction ? direction.Name_Direction : '',
        created_at: new Date().toISOString()
      };
      setDirections(prev => prev.map(d => 
        d.ID_Direction === formData.fk_direction 
          ? {
              ...d,
              divisions: d.divisions?.map(div => 
                div.ID_Division === formData.fk_division 
                  ? { 
                      ...div, 
                      coordinations: [...(div.coordinations || []), newCoordination],
                      Coordination_Count: div.Coordination_Count + 1
                    }
                  : div
              ),
              Coordination_Count: d.Coordination_Count + 1
            }
          : d
      ));
      setShowCoordinationModal(false);
    }
    
    resetForm();
  };

  const handleDelete = () => {
    if (modalType === 'direction' && selectedDirection) {
      setDirections(prev => prev.filter(d => d.ID_Direction !== selectedDirection.ID_Direction));
    } else if (modalType === 'division' && selectedDivision && selectedDirection) {
      setDirections(prev => prev.map(d => 
        d.ID_Direction === selectedDirection.ID_Direction 
          ? { 
              ...d, 
              divisions: d.divisions?.filter(div => div.ID_Division !== selectedDivision.ID_Division),
              Division_Count: d.Division_Count - 1
            }
          : d
      ));
    } else if (modalType === 'coordination' && selectedCoordination && selectedDivision && selectedDirection) {
      setDirections(prev => prev.map(d => 
        d.ID_Direction === selectedDirection.ID_Direction 
          ? {
              ...d,
              divisions: d.divisions?.map(div => 
                div.ID_Division === selectedDivision.ID_Division 
                  ? {
                      ...div,
                      coordinations: div.coordinations?.filter(c => c.ID_Coordination !== selectedCoordination.ID_Coordination),
                      Coordination_Count: div.Coordination_Count - 1
                    }
                  : div
              ),
              Coordination_Count: d.Coordination_Count - 1
            }
          : d
      ));
    }
    setShowDeleteModal(false);
    setSelectedDirection(null);
    setSelectedDivision(null);
    setSelectedCoordination(null);
  };

  const stats = {
    directions: directions.length,
    divisions: directions.reduce((acc, d) => acc + d.Division_Count, 0),
    coordinations: directions.reduce((acc, d) => acc + d.Coordination_Count, 0)
  };

  return (
    <div className="institutional-structure">
      <div className="page-container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <Building2 size={28} />
                Estructura Institucional
              </h1>
              <p className="page-description">Gestiona direcciones, divisiones y coordinaciones del municipio</p>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.directions}</span>
                <span className="stat-label">Direcciones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.divisions}</span>
                <span className="stat-label">Divisiones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.coordinations}</span>
                <span className="stat-label">Coordinaciones</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn secondary" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft size={20} />
              <span>Volver al Panel</span>
              <div className="btn-tooltip">Regresar al Dashboard Administrativo</div>
            </button>
            <button className="action-btn primary" onClick={() => openAddModal(activeTab === 'directions' ? 'direction' : activeTab === 'divisions' ? 'division' : 'coordination')}>
              <Plus size={20} />
              <span>Agregar {activeTab === 'directions' ? 'Dirección' : activeTab === 'divisions' ? 'División' : 'Coordinación'}</span>
              <div className="btn-tooltip">Crear nueva {activeTab === 'directions' ? 'Dirección' : activeTab === 'divisions' ? 'División' : 'Coordinación'} institucional</div>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="view-options">
          <div className="view-tabs">
            <button
              className={`tab-btn ${activeTab === 'directions' ? 'active' : ''}`}
              onClick={() => setActiveTab('directions')}
            >
              <Building2 size={16} />
              <span>Direcciones</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'divisions' ? 'active' : ''}`}
              onClick={() => setActiveTab('divisions')}
            >
              <Layers size={16} />
              <span>Divisiones</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'coordinations' ? 'active' : ''}`}
              onClick={() => setActiveTab('coordinations')}
            >
              <MapPin size={16} />
              <span>Coordinaciones</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'directions' ? 'dirección' : activeTab === 'divisions' ? 'división' : 'coordinación'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Content */}
        <div className="structure-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando estructura institucional...</p>
            </div>
          ) : activeTab === 'directions' ? (
            <div className="hierarchical-view">
              {directions.map(direction => (
                <div key={direction.ID_Direction} className="hierarchy-item direction-level">
                  <div className="hierarchy-header">
                    <button 
                      className="expand-btn"
                      onClick={() => toggleDirection(direction.ID_Direction)}
                    >
                      {direction.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div className="hierarchy-icon">
                      <Building2 size={24} />
                    </div>
                    <div className="hierarchy-info">
                      <h3>{direction.Name_Direction}</h3>
                      <div className="hierarchy-meta">
                        <span className="meta-item">
                          <User size={14} />
                          {direction.Director_Name || 'Sin director'}
                        </span>
                        <span className="meta-item">
                          <Layers size={14} />
                          {direction.Division_Count} divisiones
                        </span>
                        <span className="meta-item">
                          <MapPin size={14} />
                          {direction.Coordination_Count} coordinaciones
                        </span>
                      </div>
                    </div>
                    <div className="hierarchy-actions">
                      <button 
                        className="action-btn-small"
                        onClick={() => {
                          setSelectedDirection(direction);
                          setModalType('direction');
                          setShowDetailModal(true);
                        }}
                        title="Ver detalles"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="action-btn-small"
                        onClick={() => {
                          setSelectedDirection(direction);
                          setModalType('direction');
                          setShowEditModal(true);
                          setFormData({ name: direction.Name_Direction, fk_direction: '', fk_division: '', fk_director: direction.Fk_Director, fk_division_head: '', fk_coordinator: '' });
                        }}
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="action-btn-small danger"
                        onClick={() => {
                          setSelectedDirection(direction);
                          setModalType('direction');
                          setShowDeleteModal(true);
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {direction.expanded && direction.divisions && (
                    <div className="hierarchy-children">
                      {direction.divisions.map(division => (
                        <div key={division.ID_Division} className="hierarchy-item division-level">
                          <div className="hierarchy-header">
                            <button 
                              className="expand-btn"
                              onClick={() => toggleDivision(direction.ID_Direction, division.ID_Division)}
                            >
                              {division.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                            <div className="hierarchy-icon">
                              <Layers size={20} />
                            </div>
                            <div className="hierarchy-info">
                              <h4>{division.Name_Division}</h4>
                              <div className="hierarchy-meta">
                                <span className="meta-item">
                                  <User size={14} />
                                  {division.Division_Head_Name || 'Sin jefe'}
                                </span>
                                <span className="meta-item">
                                  <MapPin size={14} />
                                  {division.Coordination_Count} coordinaciones
                                </span>
                              </div>
                            </div>
                            <div className="hierarchy-actions">
                              <button 
                                className="action-btn-small"
                                onClick={() => {
                                  setSelectedDirection(direction);
                                  setSelectedDivision(division);
                                  setModalType('division');
                                  setShowDetailModal(true);
                                }}
                                title="Ver detalles"
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                className="action-btn-small"
                                onClick={() => {
                                  setSelectedDirection(direction);
                                  setSelectedDivision(division);
                                  setModalType('division');
                                  setShowEditModal(true);
                                  setFormData({ name: division.Name_Division, fk_direction: division.Fk_Direction, fk_division: '', fk_director: '', fk_division_head: division.Fk_Division_Head, fk_coordinator: '' });
                                }}
                                title="Editar"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="action-btn-small danger"
                                onClick={() => {
                                  setSelectedDirection(direction);
                                  setSelectedDivision(division);
                                  setModalType('division');
                                  setShowDeleteModal(true);
                                }}
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          
                          {division.expanded && division.coordinations && (
                            <div className="hierarchy-children">
                              {division.coordinations.map(coordination => (
                                <div key={coordination.ID_Coordination} className="hierarchy-item coordination-level">
                                  <div className="hierarchy-header">
                                    <div className="hierarchy-icon">
                                      <MapPin size={18} />
                                    </div>
                                    <div className="hierarchy-info">
                                      <h5>{coordination.Name_Coordination}</h5>
                                      <div className="hierarchy-meta">
                                        <span className="meta-item">
                                          <User size={14} />
                                          {coordination.Coordinator_Name || 'Sin coordinador'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="hierarchy-actions">
                                      <button 
                                        className="action-btn-small"
                                        onClick={() => {
                                          setSelectedDirection(direction);
                                          setSelectedDivision(division);
                                          setSelectedCoordination(coordination);
                                          setModalType('coordination');
                                          setShowDetailModal(true);
                                        }}
                                        title="Ver detalles"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      <button 
                                        className="action-btn-small"
                                        onClick={() => {
                                          setSelectedDirection(direction);
                                          setSelectedDivision(division);
                                          setSelectedCoordination(coordination);
                                          setModalType('coordination');
                                          setShowEditModal(true);
                                          setFormData({ name: coordination.Name_Coordination, fk_direction: direction.ID_Direction, fk_division: division.ID_Division, fk_director: '', fk_division_head: '', fk_coordinator: coordination.Fk_Coordinator });
                                        }}
                                        title="Editar"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button 
                                        className="action-btn-small danger"
                                        onClick={() => {
                                          setSelectedDirection(direction);
                                          setSelectedDivision(division);
                                          setSelectedCoordination(coordination);
                                          setModalType('coordination');
                                          setShowDeleteModal(true);
                                        }}
                                        title="Eliminar"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : activeTab === 'divisions' ? (
            <div className="flat-view">
              {directions.flatMap(d => d.divisions || []).map(division => (
                <div key={division.ID_Division} className="card-item">
                  <div className="card-icon">
                    <Layers size={32} />
                  </div>
                  <div className="card-content">
                    <h3>{division.Name_Division}</h3>
                    <p className="card-subtitle">{division.Direction_Name}</p>
                    <div className="card-meta">
                      <span className="meta-tag">
                        <User size={14} />
                        {division.Division_Head_Name || 'Sin jefe'}
                      </span>
                      <span className="meta-tag">
                        <MapPin size={14} />
                        {division.Coordination_Count} coordinaciones
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="action-btn-small"><Eye size={14} /></button>
                    <button className="action-btn-small"><Edit size={14} /></button>
                    <button className="action-btn-small danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flat-view">
              {directions.flatMap(d => d.divisions || []).flatMap(d => d.coordinations || []).map(coordination => (
                <div key={coordination.ID_Coordination} className="card-item">
                  <div className="card-icon">
                    <MapPin size={32} />
                  </div>
                  <div className="card-content">
                    <h3>{coordination.Name_Coordination}</h3>
                    <p className="card-subtitle">{coordination.Division_Name} - {coordination.Direction_Name}</p>
                    <div className="card-meta">
                      <span className="meta-tag">
                        <User size={14} />
                        {coordination.Coordinator_Name || 'Sin coordinador'}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="action-btn-small"><Eye size={14} /></button>
                    <button className="action-btn-small"><Edit size={14} /></button>
                    <button className="action-btn-small danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {(showDirectionModal || showDivisionModal || showCoordinationModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                Agregar {modalType === 'direction' ? 'Dirección' : modalType === 'division' ? 'División' : 'Coordinación'}
              </h2>
              <button className="close-btn" onClick={() => {
                setShowDirectionModal(false);
                setShowDivisionModal(false);
                setShowCoordinationModal(false);
              }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="structure-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    Nombre {modalType === 'direction' ? 'de la Dirección' : modalType === 'division' ? 'de la División' : 'de la Coordinación'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={modalType === 'direction' ? 'Ej: Dirección de Educación' : modalType === 'division' ? 'Ej: División de Docencia' : 'Ej: Coordinación de Servicios'}
                  />
                </div>
                
                {modalType === 'division' && (
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
                )}
                
                {modalType === 'coordination' && (
                  <>
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
                      <label>División</label>
                      <select
                        name="fk_division"
                        value={formData.fk_division}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar división...</option>
                        {directions
                          .find(d => d.ID_Direction === formData.fk_direction)
                          ?.divisions?.map(division => (
                            <option key={division.ID_Division} value={division.ID_Division}>
                              {division.Name_Division}
                            </option>
                          )) || []}
                      </select>
                    </div>
                  </>
                )}
                
                {modalType === 'direction' && (
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
                )}
                
                {modalType === 'division' && (
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
                )}
                
                {modalType === 'coordination' && (
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
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowDirectionModal(false);
                  setShowDivisionModal(false);
                  setShowCoordinationModal(false);
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Eliminar</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-confirmation">
              <Trash2 size={48} className="warning-icon" />
              <p>¿Estás seguro de eliminar este elemento?</p>
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

export default InstitutionalStructure;
