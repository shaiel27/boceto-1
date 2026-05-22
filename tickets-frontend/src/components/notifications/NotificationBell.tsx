import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock, ExternalLink } from 'lucide-react';
import ApiService from '../../services/api';
import './NotificationBell.css';

interface NotificationItem {
  ID_Notification: number;
  Type: string;
  Title: string;
  Message: string;
  Is_Read: number;
  Created_at: string;
  Fk_Service_Request: number | null;
  ticket_subject?: string;
  ticket_code?: string;
}

const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'ayer';
  return `hace ${diffDays} días`;
};

const getIcon = (type: string) => {
  switch (type) {
    case 'assistance_request':
    case 'assistance_assigned':
    case 'assistance_rejected':
      return <AlertTriangle size={16} />;
    case 'ticket_created_admin':
    case 'ticket_assignment':
      return <Info size={16} />;
    default:
      return <Bell size={16} />;
  }
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    const response = await ApiService.getUnreadCount();
    if (response.success && response.data) {
      setUnreadCount(response.data.unread_count);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const response = await ApiService.getNotifications(20, 0);
    if (response.success && response.data) {
      setNotifications(response.data);
      const unread = response.data.filter((n: NotificationItem) => !n.Is_Read).length;
      setUnreadCount(unread);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (notification: NotificationItem) => {
    if (!notification.Is_Read) {
      await ApiService.markNotificationRead(notification.ID_Notification);
      setNotifications(prev =>
        prev.map(n =>
          n.ID_Notification === notification.ID_Notification ? { ...n, Is_Read: 1 } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    await handleMarkRead(notification);
    setIsOpen(false);
    if (notification.Type === 'assistance_request') {
      const code = notification.ticket_code || `TICK-${notification.Fk_Service_Request}`;
      navigate(`/admin/tickets?search=${encodeURIComponent(code)}`);
    }
  };

  return (
    <div className="ntf-bell-container" ref={containerRef}>
      <button
        className="ntf-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="ntf-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="ntf-dropdown">
          <div className="ntf-dropdown-header">
            <h3>Notificaciones</h3>
            <button className="ntf-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="ntf-dropdown-body">
            {loading ? (
              <div className="ntf-loading">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="ntf-empty">
                <Bell size={32} />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.ID_Notification}
                  className={`ntf-item ${!notif.Is_Read ? 'ntf-unread' : ''} ${
                    notif.Type === 'assistance_request' ? 'ntf-assistance' : ''
                  } ${notif.Type === 'assistance_request' ? 'ntf-assistance-unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={`ntf-item-icon ${notif.Type === 'assistance_request' ? 'ntf-icon-assistance' : ''}`}>
                    {getIcon(notif.Type)}
                  </div>
                  <div className="ntf-item-body">
                    <div className="ntf-item-title">
                      {notif.Title}
                      {notif.Type === 'assistance_request' && (
                        <span className="ntf-assistance-badge">URGENTE</span>
                      )}
                    </div>
                    <div className="ntf-item-msg">{notif.Message.split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</div>
                    <div className="ntf-item-time">
                      <Clock size={11} />
                      {getTimeAgo(notif.Created_at)}
                    </div>
                  </div>
                  <div className="ntf-item-actions">
                    {notif.Type === 'assistance_request' && (
                      <span className="ntf-goto-btn" title="Ir al ticket">
                        <ExternalLink size={14} />
                      </span>
                    )}
                    {!notif.Is_Read && (
                      <div className="ntf-item-dot" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
