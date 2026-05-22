import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './InstitutionalBar.css';
import {
  UserPlus,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Activity,
  MapPin,
  Database,
  Shield,
  Flag,
  Archive,
  ClipboardList,
  FileCheck,
  Users2,
  Building2,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  department?: string;
}

export interface ModernSidebarProps {
  /** Sin header global (p. ej. demo a pantalla completa): la barra va de borde a borde en altura */
  fullViewport?: boolean;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ fullViewport = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
    document.documentElement.style.setProperty(
      '--admin-sidebar-width',
      collapsed ? '72px' : '288px'
    );
  }, [collapsed]);

  useEffect(() => {
    document.body.classList.add('with-admin-sidebar');
    return () => {
      document.body.classList.remove('with-admin-sidebar');
      document.documentElement.style.removeProperty('--admin-sidebar-width');
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Gobierno / Inicio',
      icon: <Flag size={20} strokeWidth={1.75} />,
      path: '/',
      department: 'executive',
    },
    {
      id: 'tickets',
      label: 'Servicios y tickets',
      icon: <ClipboardList size={20} strokeWidth={1.75} />,
      path: '/admin/tickets',
      department: 'services',
    },
    {
      id: 'technical',
      label: 'Personal técnico',
      icon: <Users2 size={20} strokeWidth={1.75} />,
      path: '/admin/technicians',
      department: 'human-resources',
    },
    {
      id: 'structure',
      label: 'Organización municipal',
      icon: <Building2 size={20} strokeWidth={1.75} />,
      path: '/admin/offices',
      department: 'administrative',
      children: [
        {
          id: 'directions',
          label: 'Direcciones',
          icon: <MapPin size={16} strokeWidth={1.75} />,
          path: '/admin/offices?type=Direction',
        },
        {
          id: 'divisions',
          label: 'Divisiones',
          icon: <Database size={16} strokeWidth={1.75} />,
          path: '/admin/offices?type=Division',
        },
        {
          id: 'coordinations',
          label: 'Coordinaciones',
          icon: <Activity size={16} strokeWidth={1.75} />,
          path: '/admin/offices?type=Coordination',
        },
      ],
    },
    {
      id: 'reports',
      label: 'Informes',
      icon: <FileCheck size={20} strokeWidth={1.75} />,
      path: '/admin/reports',
      department: 'oversight',
    },
    {
      id: 'users',
      label: 'Registro de usuarios',
      icon: <UserPlus size={20} strokeWidth={1.75} />,
      path: '/admin/register-user',
      department: 'it',
    },
    {
      id: 'audit',
      label: 'Auditoría',
      icon: <Archive size={20} strokeWidth={1.75} />,
      path: '/admin/audit',
      department: 'oversight',
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pathMatches = useCallback(
    (path?: string) => {
      if (!path) return false;
      if (path === '/') {
        return location.pathname === '/' || location.pathname === '/admin';
      }
      const [pathname, query] = path.split('?');
      if (location.pathname !== pathname) return false;
      if (!query) return true;
      const params = new URLSearchParams(query);
      const current = new URLSearchParams(location.search);
      for (const [key, value] of Array.from(params.entries())) {
        if (current.get(key) !== value) return false;
      }
      return true;
    },
    [location.pathname, location.search]
  );

  const topOffsetClass = fullViewport ? 'admin-institutional-nav--full' : 'admin-institutional-nav--below-header';

  return (
    <>
      <button
        type="button"
        className="admin-nav__mobile-fab"
        aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <div
          className="admin-nav__backdrop"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`admin-institutional-nav ${topOffsetClass} ${collapsed ? 'admin-institutional-nav--collapsed' : ''} ${mobileOpen ? 'admin-institutional-nav--mobile-open' : ''}`}
        aria-label="Navegación administrativa municipal"
      >
        <nav className="admin-nav__scroll" aria-label="Módulos del sistema">
          {collapsed && <p className="admin-nav__section-label">Módulos</p>}
          <ul className="admin-nav__list">
            {navItems.map((item) => (
              <li key={item.id} className="admin-nav__item">
                <button
                  type="button"
                  className={`admin-nav__link ${pathMatches(item.path) && !item.children ? 'is-active' : ''}`}
                  onClick={() => {
                    if (item.children) {
                      if (collapsed) {
                        setCollapsed(false);
                      }
                      toggleExpanded(item.id);
                    } else if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
                  aria-expanded={item.children ? expandedItems.has(item.id) : undefined}
                >
                  <span className="admin-nav__link-icon" aria-hidden>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="admin-nav__link-text">{item.label}</span>
                      {item.children && (
                        <ChevronDown
                          size={16}
                          className={`admin-nav__chevron ${expandedItems.has(item.id) ? 'is-open' : ''}`}
                          aria-hidden
                        />
                      )}
                    </>
                  )}
                </button>

                {item.children && expandedItems.has(item.id) && !collapsed && (
                  <ul className="admin-nav__sublist">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <button
                          type="button"
                          className={`admin-nav__sublink ${pathMatches(child.path) ? 'is-active' : ''}`}
                          onClick={() => child.path && handleNavigation(child.path)}
                        >
                          <span className="admin-nav__sublink-icon" aria-hidden>
                            {child.icon}
                          </span>
                          <span>{child.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-nav__footer">
          <div className="admin-nav__user" title={user?.email ?? ''}>
            <div className="admin-nav__user-avatar" aria-hidden>
              <Shield size={18} />
            </div>
            {!collapsed && (
              <div className="admin-nav__user-meta">
                <span className="admin-nav__user-name">
                  {user?.full_name || user?.email || 'Usuario'}
                </span>
                <span className="admin-nav__user-role">{user?.role_name || 'Administración'}</span>
              </div>
            )}
          </div>
          <div className="admin-nav__actions">
            <button
              type="button"
              className="admin-nav__btn admin-nav__btn--collapse desktop-only"
              onClick={() => setCollapsed((c) => !c)}
              aria-pressed={collapsed}
              title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
              {!collapsed && <span>Contraer</span>}
            </button>
            <button type="button" className="admin-nav__btn admin-nav__btn--danger" onClick={handleLogout}>
              <LogOut size={18} />
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ModernSidebar;
