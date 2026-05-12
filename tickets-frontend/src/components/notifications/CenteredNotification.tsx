import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Volume2, VolumeX } from 'lucide-react';
import './CenteredNotification.css';

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showSound?: boolean;
}

interface CenteredNotificationProps {
  notification: NotificationData | null;
  onClose: () => void;
}

const CenteredNotification: React.FC<CenteredNotificationProps> = ({ notification, onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsAnimating(true);
      
      // Play sound if enabled
      if (notification.showSound !== false && soundEnabled) {
        playNotificationSound(notification.type);
      }

      // Auto-close after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, soundEnabled, onClose]);

  const playNotificationSound = (type: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for different types
      switch (type) {
        case 'success':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
          break;
        case 'warning':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.2);
          break;
        case 'info':
        default:
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.1);
          break;
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const getIcon = () => {
    switch (notification?.type) {
      case 'success':
        return <CheckCircle size={32} />;
      case 'error':
        return <AlertTriangle size={32} />;
      case 'warning':
        return <AlertTriangle size={32} />;
      case 'info':
      default:
        return <Info size={32} />;
    }
  };

  const getTypeClass = () => {
    switch (notification?.type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  if (!notification) return null;

  return (
    <div className={`centered-notification-overlay ${isAnimating ? 'visible' : ''}`}>
      <div className={`centered-notification ${getTypeClass()} ${isAnimating ? 'animate-in' : 'animate-out'}`}>
        {/* Sound Toggle */}
        <button
          className="sound-toggle"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Silenciar notificaciones' : 'Activar notificaciones'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Close Button */}
        <button className="close-button" onClick={onClose} title="Cerrar">
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="notification-icon">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="notification-content">
          <h3 className="notification-title">{notification.title}</h3>
          <p className="notification-message">{notification.message}</p>
        </div>

        {/* Bell Icon Animation */}
        <div className="notification-bell">
          <Bell size={48} className="bell-icon" />
        </div>

        {/* Progress Bar */}
        <div className="notification-progress">
          <div 
            className="progress-bar"
            style={{
              animation: `progress ${notification.duration || 5000}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CenteredNotification;
