import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Shield,
  Crown,
  Wrench,
  Building,
  X,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import ModernSidebar from '../layout/ModernSidebar';
import '../layout/ModernSidebar.css';
import './UserManagement.css';

interface User {
  ID_Users: number;
  Fk_Role: number;
  Email: string;
  Password: string;
  created_at: string;
  Role_Name?: string;
  Role_Description?: string;
  Boss_Name?: string;
  Boss_Pronoun?: string;
  Office_Name?: string;
  Office_Type?: string;
}

interface Role {
  ID_Role: number;
  Role: string;
  Description: string;
}

interface Office {
  ID_Office: number;
  Name_Office: string;
  Office_Type: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [officeFilter, setOfficeFilter] = useState<string>('all');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fk_role: '',
    name_boss: '',
    pronoun: 'Sr.',
    fk_office: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockRoles: Role[] = [
        { ID_Role: 1, Role: 'Admin', Description: 'Administrador del sistema' },
        { ID_Role: 2, Role: 'Tecnico', Description: 'Técnico de soporte IT' },
        { ID_Role: 3, Role: 'Jefe', Description: 'Jefe de oficina' }
      ];

      const mockOffices: Office[] = [
        { ID_Office: 1, Name_Office: 'Dirección de Educación', Office_Type: 'Direction' },
        { ID_Office: 2, Name_Office: 'Dirección de Vialidad', Office_Type: 'Direction' },
        { ID_Office: 3, Name_Office: 'Dirección de Salud', Office_Type: 'Direction' },
        { ID_Office: 5, Name_Office: 'División de Docencia', Office_Type: 'Division' },
        { ID_Office: 8, Name_Office: 'Coordinación de Servicios Tecnológicos', Office_Type: 'Coordination' }
      ];

      const mockUsers: User[] = [
        {
          ID_Users: 1,
          Fk_Role: 1,
          Email: 'carlos.rodriguez@municipio.gob',
          Password: '********',
          created_at: '2024-01-15T10:00:00',
          Role_Name: 'Admin',
          Role_Description: 'Administrador del sistema',
          Boss_Name: 'Carlos Rodríguez',
          Boss_Pronoun: 'Sr.',
          Office_Name: 'Dirección de Educación',
          Office_Type: 'Direction'
        },
        {
          ID_Users: 2,
          Fk_Role: 3,
          Email: 'maria.gonzalez@municipio.gob',
          Password: '********',
          created_at: '2024-02-20T14:30:00',
          Role_Name: 'Jefe',
          Role_Description: 'Jefe de oficina',
          Boss_Name: 'María González',
          Boss_Pronoun: 'Sra.',
          Office_Name: 'Dirección de Vialidad',
          Office_Type: 'Direction'
        },
        {
          ID_Users: 3,
          Fk_Role: 2,
          Email: 'juan.perez@municipio.gob',
          Password: '********',
          created_at: '2024-03-10T09:15:00',
          Role_Name: 'Tecnico',
          Role_Description: 'Técnico de soporte IT',
          Boss_Name: 'Juan Pérez',
          Boss_Pronoun: 'Sr.',
          Office_Name: 'Dirección de Salud',
          Office_Type: 'Direction'
        },
        {
          ID_Users: 4,
          Fk_Role: 3,
          Email: 'ana.martinez@municipio.gob',
          Password: '********',
          created_at: '2024-04-05T16:45:00',
          Role_Name: 'Jefe',
          Role_Description: 'Jefe de oficina',
          Boss_Name: 'Ana Martínez',
          Boss_Pronoun: 'Sra.',
          Office_Name: 'División de Docencia',
          Office_Type: 'Division'
        },
        {
          ID_Users: 5,
          Fk_Role: 2,
          Email: 'pedro.lopez@municipio.gob',
          Password: '********',
          created_at: '2024-05-12T11:00:00',
          Role_Name: 'Tecnico',
          Role_Description: 'Técnico de soporte IT',
          Boss_Name: 'Pedro López',
          Boss_Pronoun: 'Sr.',
          Office_Name: 'Coordinación de Servicios Tecnológicos',
          Office_Type: 'Coordination'
        }
      ];

      setRoles(mockRoles);
      setOffices(mockOffices);
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.Boss_Name && user.Boss_Name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.Fk_Role === parseInt(roleFilter);
    const matchesOffice = officeFilter === 'all' || user.Office_Type === officeFilter;
    return matchesSearch && matchesRole && matchesOffice;
  });

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return <Crown size={16} />;
      case 'Tecnico':
        return <Wrench size={16} />;
      case 'Jefe':
        return <Shield size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return '#8b5cf6';
      case 'Tecnico':
        return '#3b82f6';
      case 'Jefe':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getOfficeTypeColor = (officeType: string) => {
    switch (officeType) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const role = roles.find(r => r.ID_Role === parseInt(formData.fk_role));
    const office = offices.find(o => o.ID_Office === parseInt(formData.fk_office));
    
    const newUser: User = {
      ID_Users: Date.now(),
      Fk_Role: parseInt(formData.fk_role),
      Email: formData.email,
      Password: formData.password,
      created_at: new Date().toISOString(),
      Role_Name: role?.Role,
      Role_Description: role?.Description,
      Boss_Name: formData.name_boss,
      Boss_Pronoun: formData.pronoun,
      Office_Name: office?.Name_Office,
      Office_Type: office?.Office_Type
    };

    setUsers(prev => [...prev, newUser]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    const role = roles.find(r => r.ID_Role === parseInt(formData.fk_role));
    const office = offices.find(o => o.ID_Office === parseInt(formData.fk_office));
    
    const updatedUser: User = {
      ...selectedUser,
      Fk_Role: parseInt(formData.fk_role),
      Email: formData.email,
      Password: formData.password || selectedUser.Password,
      Role_Name: role?.Role,
      Role_Description: role?.Description,
      Boss_Name: formData.name_boss,
      Boss_Pronoun: formData.pronoun,
      Office_Name: office?.Name_Office,
      Office_Type: office?.Office_Type
    };

    setUsers(prev => prev.map(u => u.ID_Users === selectedUser.ID_Users ? updatedUser : u));
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers(prev => prev.filter(u => u.ID_Users !== selectedUser.ID_Users));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fk_role: '',
      name_boss: '',
      pronoun: 'Sr.',
      fk_office: ''
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.Email,
      password: '',
      fk_role: user.Fk_Role.toString(),
      name_boss: user.Boss_Name || '',
      pronoun: user.Boss_Pronoun || 'Sr.',
      fk_office: offices.find(o => o.Name_Office === user.Office_Name)?.ID_Office.toString() || ''
    });
    setShowEditModal(true);
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.Role_Name === 'Admin').length,
    technicians: users.filter(u => u.Role_Name === 'Tecnico').length,
    bosses: users.filter(u => u.Role_Name === 'Jefe').length
  };

  return (
    <>
      <ModernSidebar />
      <div className="page-container">
        <header className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <Users size={28} />
                Gestión de Usuarios
              </h1>
              <p className="page-description">Administra usuarios, roles y asignaciones institucionales</p>
            </div>

            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.admins}</span>
                <span className="stat-label">Admins</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.technicians}</span>
                <span className="stat-label">Técnicos</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.bosses}</span>
                <span className="stat-label">Jefes</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn secondary" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              Volver al Panel
            </button>
            <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Nuevo Usuario
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <Crown size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.admins}</h3>
              <p className="stat-label">Administradores</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
              <Wrench size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.technicians}</h3>
              <p className="stat-label">Técnicos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.bosses}</h3>
              <p className="stat-label">Jefes de Oficina</p>
            </div>
          </div>
        </div>

        <section className="search-filters">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar usuario o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <label>Rol</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los roles</option>
                {roles.map(role => (
                  <option key={role.ID_Role} value={role.ID_Role}>
                    {role.Role}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Tipo de Oficina</label>
              <select
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
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

        <div className="users-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Nombre</th>
                    <th>Oficina</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.ID_Users} className="user-row">
                      <td className="user-cell">
                        <div className="user-avatar">
                          <Users size={20} />
                        </div>
                        <span className="user-id">#{user.ID_Users}</span>
                      </td>
                      <td className="email-cell">
                        {user.Email}
                      </td>
                      <td className="role-cell">
                        <div 
                          className="role-badge"
                          style={{ backgroundColor: getRoleColor(user.Role_Name || '') }}
                        >
                          {getRoleIcon(user.Role_Name || '')}
                          <span>{user.Role_Name}</span>
                        </div>
                      </td>
                      <td className="name-cell">
                        <div className="boss-info">
                          <span className="pronoun">{user.Boss_Pronoun}</span>
                          <span className="name">{user.Boss_Name}</span>
                        </div>
                      </td>
                      <td className="office-cell">
                        <div className="office-info">
                          <Building size={14} />
                          <span>{user.Office_Name}</span>
                          <span 
                            className="office-type-badge"
                            style={{ backgroundColor: getOfficeTypeColor(user.Office_Type || '') }}
                          >
                            {user.Office_Type}
                          </span>
                        </div>
                      </td>
                      <td className="date-cell">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <div className="user-actions">
                          <button
                            className="action-btn-small"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailModal(true);
                            }}
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="action-btn-small"
                            onClick={() => openEditModal(user)}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="action-btn-small danger"
                            onClick={() => {
                              setSelectedUser(user);
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
              
              {filteredUsers.length === 0 && (
                <div className="empty-state">
                  <Users size={48} className="empty-icon" />
                  <h3>No se encontraron usuarios</h3>
                  <p>No hay usuarios que coincidan con los filtros.</p>
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
              <h2>Agregar Nuevo Usuario</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="usuario@alcaldia.gob.ve"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Rol</label>
                  <select
                    name="fk_role"
                    value={formData.fk_role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map(role => (
                      <option key={role.ID_Role} value={role.ID_Role}>
                        {role.Role} - {role.Description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tratamiento</label>
                  <select
                    name="pronoun"
                    value={formData.pronoun}
                    onChange={handleInputChange}
                  >
                    <option value="Sr.">Sr.</option>
                    <option value="Sra.">Sra.</option>
                    <option value="Lic.">Lic.</option>
                    <option value="Ing.">Ing.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name_boss"
                    value={formData.name_boss}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Carlos Rodríguez"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Oficina de Asignación</label>
                  <select
                    name="fk_office"
                    value={formData.fk_office}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar oficina...</option>
                    {offices.map(office => (
                      <option key={office.ID_Office} value={office.ID_Office}>
                        {office.Name_Office} ({office.Office_Type})
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
                  Agregar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Usuario</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="user-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Contraseña (dejar vacío para mantener)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nueva contraseña"
                    minLength={6}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Rol</label>
                  <select
                    name="fk_role"
                    value={formData.fk_role}
                    onChange={handleInputChange}
                    required
                  >
                    {roles.map(role => (
                      <option key={role.ID_Role} value={role.ID_Role}>
                        {role.Role} - {role.Description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tratamiento</label>
                  <select
                    name="pronoun"
                    value={formData.pronoun}
                    onChange={handleInputChange}
                  >
                    <option value="Sr.">Sr.</option>
                    <option value="Sra.">Sra.</option>
                    <option value="Lic.">Lic.</option>
                    <option value="Ing.">Ing.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name_boss"
                    value={formData.name_boss}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Oficina de Asignación</label>
                  <select
                    name="fk_office"
                    value={formData.fk_office}
                    onChange={handleInputChange}
                    required
                  >
                    {offices.map(office => (
                      <option key={office.ID_Office} value={office.ID_Office}>
                        {office.Name_Office} ({office.Office_Type})
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

      {showDetailModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalles del Usuario</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="user-detail">
              <div className="detail-header">
                <div className="detail-avatar">
                  <Users size={48} />
                </div>
                <div className="detail-summary">
                  <h3>{selectedUser.Boss_Pronoun} {selectedUser.Boss_Name}</h3>
                  <p>ID: {selectedUser.ID_Users}</p>
                  <p>{selectedUser.Email}</p>
                  <div 
                    className="role-badge-large"
                    style={{ backgroundColor: getRoleColor(selectedUser.Role_Name || '') }}
                  >
                    {getRoleIcon(selectedUser.Role_Name || '')}
                    <span>{selectedUser.Role_Name} - {selectedUser.Role_Description}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Información del Usuario</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span>Email: {selectedUser.Email}</span>
                    </div>
                    <div className="detail-item">
                      <span>Nombre: {selectedUser.Boss_Pronoun} {selectedUser.Boss_Name}</span>
                    </div>
                    <div className="detail-item">
                      <span>Oficina: {selectedUser.Office_Name} ({selectedUser.Office_Type})</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Información del Sistema</h4>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span>Rol: {selectedUser.Role_Name}</span>
                    </div>
                    <div className="detail-item">
                      <span>Creado: {new Date(selectedUser.created_at).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span>ID de Usuario: {selectedUser.ID_Users}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Eliminar Usuario</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="delete-confirmation">
              <Trash2 size={48} className="warning-icon" />
              <p>¿Estás seguro de eliminar este usuario?</p>
              <p className="warning-text">{selectedUser.Email}</p>
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
    </>
  );
};

export default UserManagement;
