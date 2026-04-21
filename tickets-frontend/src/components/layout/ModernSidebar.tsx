import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

const ModernSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 size={20} />,
      path: '/'
    },
    {
      id: 'tickets',
      label: 'Gestión de Tickets',
      icon: <FileText size={20} />,
      path: '/admin/tickets'
    },
    {
      id: 'technical',
      label: 'Personal Técnico',
      icon: <Users size={20} />,
      path: '/admin/technicians'
    },
    {
      id: 'structure',
      label: 'Estructura Institucional',
      icon: <Building size={20} />,
      path: '/admin/offices',
      children: [
        {
          id: 'directions',
          label: 'Direcciones',
          icon: <Building size={16} />,
          path: '/admin/offices?type=Direction'
        },
        {
          id: 'divisions',
          label: 'Divisiones',
          icon: <Building size={16} />,
          path: '/admin/offices?type=Division'
        },
        {
          id: 'coordinations',
          label: 'Coordinaciones',
          icon: <Building size={16} />,
          path: '/admin/offices?type=Coordination'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <TrendingUp size={20} />,
      path: '/admin/reports'
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: <UserPlus size={20} />,
      path: '/admin/register-user'
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

  const isActive = (path?: string) => {
    return path ? location.pathname === path : false;
  };

  return (
    <aside className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      
        <div className="sidebar-header">
          <button 
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Menú Principal</div>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => {
                    if (item.children) {
                      toggleExpanded(item.id);
                    } else if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
                >
                  <div className="nav-button-content">
                    <span className="nav-icon">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="nav-label">{item.label}</span>
                    )}
                  </div>
                  {item.children && !isCollapsed && (
                    <span className={`nav-arrow ${expandedItems.has(item.id) ? 'expanded' : ''}`}>
                      <ChevronDown size={16} />
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {item.children && expandedItems.has(item.id) && !isCollapsed && (
                  <ul className="submenu">
                    {item.children.map((child) => (
                      <li key={child.id} className="submenu-item">
                        <button
                          className={`submenu-button ${isActive(child.path) ? 'active' : ''}`}
                          onClick={() => child.path && handleNavigation(child.path)}
                        >
                          <span className="submenu-icon">{child.icon}</span>
                          <span className="submenu-label">{child.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* User Section */}
        {!isCollapsed && (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <Users size={20} color="white" />
              </div>
              <div className="user-details">
                <div className="user-name">Administrador</div>
                <div className="user-role">Sistema Municipal</div>
              </div>
            </div>
            <button className="logout-btn">
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="footer-content">
            <div className="version">v2.0.1</div>
            <div className="footer-links">
              <button className="footer-link">Ayuda</button>
              <span className="separator">·</span>
              <button className="footer-link">Configuración</button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ModernSidebar;
