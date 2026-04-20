import React from 'react';
import ModernSidebar from './ModernSidebar';
import './ModernSidebar.css';

const ModernSidebarDemo: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <ModernSidebar />
      
      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
            Nuevo Diseño de Barra de Navegación
          </h1>
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#334155', marginBottom: '1rem' }}>
              Características del Nuevo Diseño
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Diseño Moderno
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  Interfaz limpia y profesional con gradientes sutiles y sombras suaves que proporcionan profundidad visual.
                </p>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Colapsable
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  La barra se puede colapsar para maximizar el espacio de trabajo, ideal para pantallas pequeñas.
                </p>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Submenús Expansible
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  Navegación jerárquica con submenús que se expanden para organizar mejor las opciones.
                </p>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Estados Activos
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  Indicadores visuales claros para mostrar la página actual y mejorar la orientación del usuario.
                </p>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Sección de Usuario
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  Información del usuario y opciones de cierre de sesión fácilmente accesibles.
                </p>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Responsive
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  Diseño adaptable que funciona perfectamente en dispositivos móviles y tablets.
                </p>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem', background: '#1a365d', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Paleta de Colores
              </h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#1a365d', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                  <div style={{ fontSize: '0.875rem' }}>#1a365d</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#1e3a8a', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                  <div style={{ fontSize: '0.875rem' }}>#1e3a8a</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#60a5fa', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                  <div style={{ fontSize: '0.875rem' }}>#60a5fa</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#3b82f6', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                  <div style={{ fontSize: '0.875rem' }}>#3b82f6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModernSidebarDemo;
