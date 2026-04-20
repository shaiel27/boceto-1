import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import './OfficeManagement.css';

interface Office {
  ID_Office: number;
  Name_Office: string;
  Office_Type: 'Direction' | 'Coordination' | 'Division';
  Fk_Parent_Office: number | null;
  Fk_Boss_ID: number | null;
  created_at: string;
  Boss_Name?: string;
  Boss_Email?: string;
  Parent_Name?: string | null;
  Children?: Office[];
  expanded?: boolean;
}

interface Boss {
  ID_Boss: number;
  Name_Boss: string;
  pronoun: string;
  Fk_User: number | null;
  User_Email?: string;
}

const OfficeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [offices, setOffices] = useState<Office[]>([]);
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Direction' | 'Coordination' | 'Division'>('all');
  
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name_office: '',
    office_type: 'Direction' as 'Direction' | 'Coordination' | 'Division',
    fk_parent_office: '',
    fk_boss_id: ''
  });

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['Direction', 'Division', 'Coordination'].includes(typeParam)) {
      setTypeFilter(typeParam as 'Direction' | 'Division' | 'Coordination');
    }
    loadMockData();
  }, [searchParams]);

  const loadMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockBosses: Boss[] = [
        { ID_Boss: 1, Name_Boss: 'Carlos Rodríguez', pronoun: 'Sr.', Fk_User: 1, User_Email: 'carlos.rodriguez@municipio.gob' },
        { ID_Boss: 2, Name_Boss: 'María González', pronoun: 'Sra.', Fk_User: 2, User_Email: 'maria.gonzalez@municipio.gob' },
        { ID_Boss: 3, Name_Boss: 'Juan Pérez', pronoun: 'Sr.', Fk_User: 3, User_Email: 'juan.perez@municipio.gob' },
        { ID_Boss: 4, Name_Boss: 'Ana Martínez', pronoun: 'Sra.', Fk_User: 4, User_Email: 'ana.martinez@municipio.gob' },
        { ID_Boss: 5, Name_Boss: 'Pedro López', pronoun: 'Sr.', Fk_User: 5, User_Email: 'pedro.lopez@municipio.gob' },
        { ID_Boss: 6, Name_Boss: 'Laura Sánchez', pronoun: 'Sra.', Fk_User: 6, User_Email: 'laura.sanchez@municipio.gob' },
        { ID_Boss: 7, Name_Boss: 'Roberto Díaz', pronoun: 'Sr.', Fk_User: 7, User_Email: 'roberto.diaz@municipio.gob' },
        { ID_Boss: 8, Name_Boss: 'Carmen Ruiz', pronoun: 'Sra.', Fk_User: 8, User_Email: 'carmen.ruiz@municipio.gob' }
      ];

      const mockOffices: Office[] = [
        {
          ID_Office: 1,
          Name_Office: 'Dirección de Educación',
          Office_Type: 'Direction',
          Fk_Parent_Office: null,
          Fk_Boss_ID: 1,
          created_at: '2024-01-15T10:00:00',
          Boss_Name: 'Carlos Rodríguez',
          Boss_Email: 'carlos.rodriguez@municipio.gob',
          Parent_Name: null
        },
        {
          ID_Office: 2,
          Name_Office: 'Dirección de Vialidad',
          Office_Type: 'Direction',
          Fk_Parent_Office: null,
          Fk_Boss_ID: 2,
          created_at: '2024-02-20T14:30:00',
          Boss_Name: 'María González',
          Boss_Email: 'maria.gonzalez@municipio.gob',
          Parent_Name: null
        },
        {
          ID_Office: 3,
          Name_Office: 'Dirección de Salud',
          Office_Type: 'Direction',
          Fk_Parent_Office: null,
          Fk_Boss_ID: 3,
          created_at: '2024-03-10T09:15:00',
          Boss_Name: 'Juan Pérez',
          Boss_Email: 'juan.perez@municipio.gob',
          Parent_Name: null
        },
        {
          ID_Office: 4,
          Name_Office: 'Dirección de Obras Públicas',
          Office_Type: 'Direction',
          Fk_Parent_Office: null,
          Fk_Boss_ID: 4,
          created_at: '2024-04-05T16:45:00',
          Boss_Name: 'Ana Martínez',
          Boss_Email: 'ana.martinez@municipio.gob',
          Parent_Name: null
        },
        {
          ID_Office: 5,
          Name_Office: 'División de Docencia',
          Office_Type: 'Division',
          Fk_Parent_Office: 1,
          Fk_Boss_ID: 5,
          created_at: '2024-01-20T10:00:00',
          Boss_Name: 'Pedro López',
          Boss_Email: 'pedro.lopez@municipio.gob',
          Parent_Name: 'Dirección de Educación'
        },
        {
          ID_Office: 6,
          Name_Office: 'División de Administración',
          Office_Type: 'Division',
          Fk_Parent_Office: 1,
          Fk_Boss_ID: 6,
          created_at: '2024-01-25T14:30:00',
          Boss_Name: 'Laura Sánchez',
          Boss_Email: 'laura.sanchez@municipio.gob',
          Parent_Name: 'Dirección de Educación'
        },
        {
          ID_Office: 7,
          Name_Office: 'División de Ingeniería',
          Office_Type: 'Division',
          Fk_Parent_Office: 2,
          Fk_Boss_ID: 3,
          created_at: '2024-02-10T09:15:00',
          Boss_Name: 'Juan Pérez',
          Boss_Email: 'juan.perez@municipio.gob',
          Parent_Name: 'Dirección de Vialidad'
        },
        {
          ID_Office: 8,
          Name_Office: 'Coordinación de Servicios Tecnológicos',
          Office_Type: 'Coordination',
          Fk_Parent_Office: 5,
          Fk_Boss_ID: 7,
          created_at: '2024-01-25T10:00:00',
          Boss_Name: 'Roberto Díaz',
          Boss_Email: 'roberto.diaz@municipio.gob',
          Parent_Name: 'División de Docencia'
        },
        {
          ID_Office: 9,
          Name_Office: 'Coordinación de Recursos Educativos',
          Office_Type: 'Coordination',
          Fk_Parent_Office: 5,
          Fk_Boss_ID: 8,
          created_at: '2024-02-01T14:30:00',
          Boss_Name: 'Carmen Ruiz',
          Boss_Email: 'carmen.ruiz@municipio.gob',
          Parent_Name: 'División de Docencia'
        }
      ];

      setBosses(mockBosses);
      setOffices(buildOfficeHierarchy(mockOffices));
      setLoading(false);
    }, 1000);
  };

  const buildOfficeHierarchy = (flatOffices: Office[]): Office[] => {
    const officeMap = new Map<number, Office>();
    const rootOffices: Office[] = [];

    // First pass: create all offices
    flatOffices.forEach(office => {
      officeMap.set(office.ID_Office, { ...office, Children: [] });
    });

    // Second pass: build hierarchy
    flatOffices.forEach(office => {
      const officeNode = officeMap.get(office.ID_Office)!;
      
      if (office.Fk_Parent_Office && officeMap.has(office.Fk_Parent_Office)) {
        const parent = officeMap.get(office.Fk_Parent_Office)!;
        parent.Children!.push(officeNode);
      } else {
        rootOffices.push(officeNode);
      }
    });

    return rootOffices;
  };

  const getPageTitle = () => {
    switch (typeFilter) {
      case 'Direction':
        return 'Direcciones Municipales';
      case 'Division':
        return 'Divisiones Institucionales';
      case 'Coordination':
        return 'Coordinaciones Operativas';
      default:
        return 'Estructura Institucional';
    }
  };

  const getPageDescription = () => {
    switch (typeFilter) {
      case 'Direction':
        return 'Administra las direcciones principales del municipio';
      case 'Division':
        return 'Gestiona las divisiones dependientes de las direcciones';
      case 'Coordination':
        return 'Coordina las unidades operativas especializadas';
      default:
        return 'Administra toda la estructura organizacional: direcciones, divisiones y coordinaciones';
    }
  };

  const getOfficeIcon = (type: string) => {
    switch (type) {
      case 'Direction':
        return <Building2 size={20} />;
      case 'Division':
        return <Layers size={20} />;
      case 'Coordination':
        return <MapPin size={20} />;
      default:
        return <Building size={20} />;
    }
  };

  const getOfficeTypeLabel = (type: string) => {
    switch (type) {
      case 'Direction':
        return 'Dirección';
      case 'Division':
        return 'División';
      case 'Coordination':
        return 'Coordinación';
      default:
        return type;
    }
  };

  const getOfficeTypeColor = (type: string) => {
    switch (type) {
      case 'Direction':
        return '#3b82f6';
      case 'Division':
        return '#10b981';
      case 'Coordination':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const filteredOffices = offices.filter(office => {
    const matchesSearch = office.Name_Office.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (office.Boss_Name && office.Boss_Name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || office.Office_Type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getParentOffices = (currentType: string) => {
    const flatOffices = flattenOffices(offices);
    return flatOffices.filter(office => {
      if (currentType === 'Direction') return false; // Directions have no parent
      if (currentType === 'Division') return office.Office_Type === 'Direction';
      if (currentType === 'Coordination') return office.Office_Type === 'Division';
      return false;
    });
  };

  const flattenOffices = (offices: Office[]): Office[] => {
    const result: Office[] = [];
    offices.forEach(office => {
      result.push(office);
      if (office.Children && office.Children.length > 0) {
        result.push(...flattenOffices(office.Children));
      }
    });
    return result;
  };

  const toggleOffice = (officeId: number) => {
    const toggleRecursive = (offices: Office[]): Office[] => {
      return offices.map(office => {
        if (office.ID_Office === officeId) {
          return { ...office, expanded: !office.expanded };
        }
        if (office.Children) {
          return { ...office, Children: toggleRecursive(office.Children) };
        }
        return office;
      });
    };
    setOffices(toggleRecursive(offices));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'Direction' | 'Coordination' | 'Division';
    setFormData(prev => ({
      ...prev,
      office_type: newType,
      fk_parent_office: '' // Reset parent when type changes
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const boss = bosses.find(b => b.ID_Boss === parseInt(formData.fk_boss_id));
    const parentOffice = formData.fk_parent_office ? 
      flattenOffices(offices).find(o => o.ID_Office === parseInt(formData.fk_parent_office)) : null;
    
    const newOffice: Office = {
      ID_Office: Date.now(),
      Name_Office: formData.name_office,
      Office_Type: formData.office_type,
      Fk_Parent_Office: formData.fk_parent_office ? parseInt(formData.fk_parent_office) : null,
      Fk_Boss_ID: formData.fk_boss_id ? parseInt(formData.fk_boss_id) : null,
      created_at: new Date().toISOString(),
      Boss_Name: boss ? boss.Name_Boss : '',
      Boss_Email: boss ? boss.User_Email : '',
      Parent_Name: parentOffice ? parentOffice.Name_Office : null,
      Children: []
    };

    if (formData.fk_parent_office) {
      // Add as child to parent
      const addToParentRecursive = (offices: Office[]): Office[] => {
        return offices.map(office => {
          if (office.ID_Office === parseInt(formData.fk_parent_office)) {
            return { 
              ...office, 
              Children: [...(office.Children || []), newOffice] 
            };
          }
          if (office.Children) {
            return { ...office, Children: addToParentRecursive(office.Children) };
          }
          return office;
        });
      };
      setOffices(addToParentRecursive(offices));
    } else {
      // Add as root
      setOffices([...offices, newOffice]);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOffice) return;

    const boss = bosses.find(b => b.ID_Boss === parseInt(formData.fk_boss_id));
    const parentOffice = formData.fk_parent_office ? 
      flattenOffices(offices).find(o => o.ID_Office === parseInt(formData.fk_parent_office)) : null;
    
    const updatedOffice: Office = {
      ...selectedOffice,
      Name_Office: formData.name_office,
      Office_Type: formData.office_type,
      Fk_Parent_Office: formData.fk_parent_office ? parseInt(formData.fk_parent_office) : null,
      Fk_Boss_ID: formData.fk_boss_id ? parseInt(formData.fk_boss_id) : null,
      Boss_Name: boss ? boss.Name_Boss : '',
      Boss_Email: boss ? boss.User_Email : '',
      Parent_Name: parentOffice ? parentOffice.Name_Office : null
    };

    const updateRecursive = (offices: Office[]): Office[] => {
      return offices.map(office => {
        if (office.ID_Office === selectedOffice.ID_Office) {
          return updatedOffice;
        }
        if (office.Children) {
          return { ...office, Children: updateRecursive(office.Children) };
        }
        return office;
      });
    };
    setOffices(updateRecursive(offices));
    setShowEditModal(false);
    setSelectedOffice(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedOffice) return;

    const deleteRecursive = (offices: Office[]): Office[] => {
      return offices
        .filter(office => office.ID_Office !== selectedOffice.ID_Office)
        .map(office => {
          if (office.Children) {
            return { ...office, Children: deleteRecursive(office.Children) };
          }
          return office;
        });
    };
    setOffices(deleteRecursive(offices));
    setShowDeleteModal(false);
    setSelectedOffice(null);
  };

  const resetForm = () => {
    setFormData({
      name_office: '',
      office_type: 'Direction',
      fk_parent_office: '',
      fk_boss_id: ''
    });
  };

  const openEditModal = (office: Office) => {
    setSelectedOffice(office);
    setFormData({
      name_office: office.Name_Office,
      office_type: office.Office_Type,
      fk_parent_office: office.Fk_Parent_Office?.toString() || '',
      fk_boss_id: office.Fk_Boss_ID?.toString() || ''
    });
    setShowEditModal(true);
  };

  const stats = {
    total: flattenOffices(offices).length,
    directions: flattenOffices(offices).filter(o => o.Office_Type === 'Direction').length,
    divisions: flattenOffices(offices).filter(o => o.Office_Type === 'Division').length,
    coordinations: flattenOffices(offices).filter(o => o.Office_Type === 'Coordination').length
  };

  const renderOfficeTree = (officeList: Office[], level: number = 0) => {
    return officeList.map(office => (
      <div key={office.ID_Office} className="office-tree-item">
        <div 
          className="office-item" 
          style={{ marginLeft: `${level * 20}px` }}
        >
          {office.Children && office.Children.length > 0 && (
            <button 
              className="expand-btn"
              onClick={() => toggleOffice(office.ID_Office)}
            >
              {office.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          
          <div 
            className="office-icon" 
            style={{ backgroundColor: getOfficeTypeColor(office.Office_Type) }}
          >
            {getOfficeIcon(office.Office_Type)}
          </div>
          
          <div className="office-info">
            <h4>{office.Name_Office}</h4>
            <div className="office-meta">
              <span className="type-badge" style={{ backgroundColor: getOfficeTypeColor(office.Office_Type) }}>
                {getOfficeTypeLabel(office.Office_Type)}
              </span>
              {office.Boss_Name && (
                <span className="boss-info">
                  <User size={12} />
                  {office.Boss_Name}
                </span>
              )}
              {office.Parent_Name && (
                <span className="parent-info">
                  <Building size={12} />
                  {office.Parent_Name}
                </span>
              )}
            </div>
          </div>
          
          <div className="office-actions">
            <button
              className="action-btn-small"
              onClick={() => {
                setSelectedOffice(office);
                setShowDetailModal(true);
              }}
              title="Ver detalles"
            >
              <Eye size={14} />
            </button>
            <button
              className="action-btn-small"
              onClick={() => openEditModal(office)}
              title="Editar"
            >
              <Edit size={14} />
            </button>
            <button
              className="action-btn-small danger"
              onClick={() => {
                setSelectedOffice(office);
                setShowDeleteModal(true);
              }}
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {office.expanded && office.Children && (
          <div className="office-children">
            {renderOfficeTree(office.Children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="office-management">
      <div className="page-container">
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <Building size={28} />
                {getPageTitle()}
              </h1>
              <p className="page-description">{getPageDescription()}</p>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
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
              <ArrowLeft size={18} />
              Volver al Panel
            </button>
            <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Nueva Oficina
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.directions}</h3>
              <p className="stat-label">Direcciones</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
              <Layers size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.divisions}</h3>
              <p className="stat-label">Divisiones</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
              <MapPin size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.coordinations}</h3>
              <p className="stat-label">Coordinaciones</p>
            </div>
          </div>
        </div>

        <section className="search-filters">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar oficina o jefe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <label>Tipo de Oficina</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">Todos los tipos</option>
                <option value="Direction">Direcciones</option>
                <option value="Division">Divisiones</option>
                <option value="Coordination">Coordinaciones</option>
              </select>
            </div>
          </div>
        </section>

        <div className="office-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando oficinas...</p>
            </div>
          ) : (
            <div className="office-tree">
              {renderOfficeTree(filteredOffices)}
              
              {filteredOffices.length === 0 && (
                <div className="empty-state">
                  <Building size={48} className="empty-icon" />
                  <h3>No se encontraron oficinas</h3>
                  <p>No hay oficinas que coincidan con los filtros.</p>
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
              <h2>Agregar Nueva Oficina</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="office-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la Oficina</label>
                  <input
                    type="text"
                    name="name_office"
                    value={formData.name_office}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Dirección de Educación"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Tipo de Oficina</label>
                  <select
                    name="office_type"
                    value={formData.office_type}
                    onChange={handleTypeChange}
                    required
                  >
                    <option value="Direction">Dirección</option>
                    <option value="Division">División</option>
                    <option value="Coordination">Coordinación</option>
                  </select>
                </div>
                
                {formData.office_type !== 'Direction' && (
                  <div className="form-group full-width">
                    <label>Oficina Superior</label>
                    <select
                      name="fk_parent_office"
                      value={formData.fk_parent_office}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar oficina superior...</option>
                      {getParentOffices(formData.office_type).map(office => (
                        <option key={office.ID_Office} value={office.ID_Office}>
                          {office.Name_Office}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="form-group full-width">
                  <label>Jefe de Oficina</label>
                  <select
                    name="fk_boss_id"
                    value={formData.fk_boss_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar jefe...</option>
                    {bosses.map(boss => (
                      <option key={boss.ID_Boss} value={boss.ID_Boss}>
                        {boss.pronoun} {boss.Name_Boss} ({boss.User_Email})
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
                  Agregar Oficina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedOffice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Oficina</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="office-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la Oficina</label>
                  <input
                    type="text"
                    name="name_office"
                    value={formData.name_office}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Tipo de Oficina</label>
                  <select
                    name="office_type"
                    value={formData.office_type}
                    onChange={handleTypeChange}
                    required
                  >
                    <option value="Direction">Dirección</option>
                    <option value="Division">División</option>
                    <option value="Coordination">Coordinación</option>
                  </select>
                </div>
                
                {formData.office_type !== 'Direction' && (
                  <div className="form-group full-width">
                    <label>Oficina Superior</label>
                    <select
                      name="fk_parent_office"
                      value={formData.fk_parent_office}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar oficina superior...</option>
                      {getParentOffices(formData.office_type).map(office => (
                        <option key={office.ID_Office} value={office.ID_Office}>
                          {office.Name_Office}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="form-group full-width">
                  <label>Jefe de Oficina</label>
                  <select
                    name="fk_boss_id"
                    value={formData.fk_boss_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar jefe...</option>
                    {bosses.map(boss => (
                      <option key={boss.ID_Boss} value={boss.ID_Boss}>
                        {boss.pronoun} {boss.Name_Boss} ({boss.User_Email})
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

      {showDetailModal && selectedOffice && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalles de la Oficina</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="office-detail">
              <div className="detail-header">
                <div 
                  className="detail-icon" 
                  style={{ backgroundColor: getOfficeTypeColor(selectedOffice.Office_Type) }}
                >
                  {getOfficeIcon(selectedOffice.Office_Type)}
                </div>
                <div className="detail-summary">
                  <h3>{selectedOffice.Name_Office}</h3>
                  <p>ID: {selectedOffice.ID_Office}</p>
                  <span className="type-badge" style={{ backgroundColor: getOfficeTypeColor(selectedOffice.Office_Type) }}>
                    {getOfficeTypeLabel(selectedOffice.Office_Type)}
                  </span>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Información de la Oficina</h4>
                  <div className="detail-list">
                    {selectedOffice.Parent_Name && (
                      <div className="detail-item">
                        <Building size={16} />
                        <span>Oficina Superior: {selectedOffice.Parent_Name}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <User size={16} />
                      <span>Jefe: {selectedOffice.Boss_Name || 'Sin asignar'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Email Jefe: {selectedOffice.Boss_Email || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Estadísticas</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span>Sub-oficinas: {selectedOffice.Children?.length || 0}</span>
                    </div>
                    <div className="detail-item">
                      <span>Creado: {new Date(selectedOffice.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedOffice && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Eliminar Oficina</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-confirmation">
              <Trash2 size={48} className="warning-icon" />
              <p>¿Estás seguro de eliminar la oficina?</p>
              <p className="warning-text">{selectedOffice.Name_Office}</p>
              <p className="warning-subtext">
                {selectedOffice.Children && selectedOffice.Children.length > 0 
                  ? 'Esta acción también eliminará todas las sub-oficinas asociadas.' 
                  : 'Esta acción no se puede deshacer.'}
              </p>
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

export default OfficeManagement;
