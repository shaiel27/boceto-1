import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './InstitutionalBar.css';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Building, 
  TrendingUp,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  MapPin,
  Database,
  Shield,
  Bell,
  Flag,
  Archive,
  ClipboardList,
  FileCheck,
  Users2,
  Building2,
  ChevronUp
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  children?: NavItem[];
  department?: string;
}

const InstitutionalBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'GOBIERNO',
      icon: <Flag size={18} />,
      path: '/',
      department: 'executive'
    },
    {
      id: 'tickets',
      label: 'SERVICIOS',
      icon: <ClipboardList size={18} />,
      path: '/admin/tickets',
      badge: 12,
      department: 'services'
    },
    {
      id: 'technical',
      label: 'PERSONAL',
      icon: <Users2 size={18} />,
      path: '/admin/technicians',
      department: 'human-resources'
    },
    {
      id: 'structure',
      label: 'ORGANIZACIÓN',
      icon: <Building2 size={18} />,
      path: '/admin/offices',
      department: 'administrative',
      children: [
        {
          id: 'directions',
          label: 'Direcciones Municipales',
          icon: <MapPin size={16} />,
          path: '/admin/offices?type=Direction'
        },
        {
          id: 'divisions',
          label: 'Divisiones Operativas',
          icon: <Database size={16} />,
          path: '/admin/offices?type=Division'
        },
        {
          id: 'coordinations',
          label: 'Coordinaciones Sectoriales',
          icon: <Activity size={16} />,
          path: '/admin/offices?type=Coordination'
        }
      ]
    },
    {
      id: 'reports',
      label: 'INFORMES',
      icon: <FileCheck size={18} />,
      path: '/admin/reports',
      department: 'oversight'
    },
    {
      id: 'archive',
      label: 'ARCHIVO',
      icon: <Archive size={18} />,
      path: '/admin/archive',
      department: 'records'
    },
    {
      id: 'users',
      label: 'SISTEMA',
      icon: <UserPlus size={18} />,
      path: '/admin/register-user',
      department: 'it'
    }
  ];

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/admin';
    }
    return location.pathname === path;
  };

  return (
    <div className="institutional-bar-container">
      {/* Main Institutional Bar */}
      <header className="institutional-bar">
        <div className="bar-left">
          <div className="institutional-seal">
            <img 
              src="/nombre_alcaldia_izquierda.png" 
              alt="Alcaldía San Cristóbal" 
              className="seal-image"
            />
          </div>
          <div className="institutional-title">
            <h1 className="main-title">MUNICIPIO DE SAN CRISTÓBAL</h1>
            <div className="subtitle-bar">SISTEMA DE GESTIÓN MUNICIPAL</div>
          </div>
        </div>

        <div className="bar-right">
          <div className="user-credentials">
            <div className="credential-badge">
              <Shield size={16} />
              <span>{user?.full_name || user?.email || 'FUNCIONARIO'}</span>
            </div>
            <div className="department-badge">
              <Flag size={14} />
              <span>{user?.role_name || 'ADMINISTRACIÓN'}</span>
            </div>
          </div>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Navigation Departments */}
      <nav className={`department-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-grid">
          {navItems.map((item) => (
            <div key={item.id} className="department-item">
              <button
                className={`department-btn ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.id);
                  } else if (item.path) {
                    handleNavigation(item.path);
                    setMobileMenuOpen(false);
                  }
                }}
              >
                <div className="btn-content">
                  <span className="btn-icon">{item.icon}</span>
                  <span className="btn-label">{item.label}</span>
                  {item.badge && (
                    <span className="btn-badge">{item.badge}</span>
                  )}
                </div>
                {item.children && (
                  <span className={`btn-arrow ${expandedItems.has(item.id) ? 'expanded' : ''}`}>
                    <ChevronDown size={14} />
                  </span>
                )}
              </button>

              {/* Submenu */}
              {item.children && expandedItems.has(item.id) && (
                <div className="submenu-panel">
                  <div className="submenu-header">
                    <Building2 size={16} />
                    <span>{item.label}</span>
                  </div>
                  <div className="submenu-grid">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        className={`submenu-btn ${isActive(child.path) ? 'active' : ''}`}
                        onClick={() => {
                          child.path && handleNavigation(child.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span className="submenu-icon">{child.icon}</span>
                        <span className="submenu-label">{child.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <button className="action-btn primary" onClick={() => navigate('/admin/tickets')}>
            <ClipboardList size={16} />
            <span>NUEVO SERVICIO</span>
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/admin/reports')}>
            <FileCheck size={16} />
            <span>GENERAR INFORME</span>
          </button>
          <button className="action-btn logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default InstitutionalBar;
