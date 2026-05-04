import React from 'react';
import { PDFReportGenerator } from './PDFReportGenerator';
import { PDFReportData } from '../../services/pdfService';
import './PDFTestReport.css';

export const PDFTestReport: React.FC = () => {
  const sampleData: PDFReportData = {
    title: 'Reporte de Tickets de Soporte',
    subtitle: 'Período: Enero - Diciembre 2024',
    data: [
      {
        id: 'TCK-001',
        titulo: 'Problema con impresora',
        descripcion: 'Impresora no imprime documentos',
        estado: 'En Progreso',
        prioridad: 'Alta',
        oficina: 'Alcaldía',
        tecnico: 'Juan Pérez',
        fecha_creacion: '2024-01-15',
        fecha_cierre: '2024-01-20'
      },
      {
        id: 'TCK-002',
        titulo: 'Actualización de software',
        descripcion: 'Actualizar sistema operativo',
        estado: 'Completado',
        prioridad: 'Media',
        oficina: 'Finanzas',
        tecnico: 'María García',
        fecha_creacion: '2024-01-16',
        fecha_cierre: '2024-01-18'
      },
      {
        id: 'TCK-003',
        titulo: 'Problema de red',
        descripcion: 'Conexión a internet lenta',
        estado: 'Pendiente',
        prioridad: 'Baja',
        oficina: 'Recursos Humanos',
        tecnico: 'Carlos López',
        fecha_creacion: '2024-01-17',
        fecha_cierre: ''
      },
      {
        id: 'TCK-004',
        titulo: 'Instalación de antivirus',
        descripcion: 'Instalar antivirus en nuevos equipos',
        estado: 'En Progreso',
        prioridad: 'Alta',
        oficina: 'Educación',
        tecnico: 'Ana Martínez',
        fecha_creacion: '2024-01-18',
        fecha_cierre: ''
      },
      {
        id: 'TCK-005',
        titulo: 'Mantenimiento de servidor',
        descripcion: 'Mantenimiento preventivo del servidor principal',
        estado: 'Completado',
        prioridad: 'Crítica',
        oficina: 'TI',
        tecnico: 'Roberto Sánchez',
        fecha_creacion: '2024-01-19',
        fecha_cierre: '2024-01-21'
      }
    ],
    columns: ['id', 'titulo', 'estado', 'prioridad', 'oficina', 'tecnico', 'fecha_creacion'],
    generatedBy: 'Administrador del Sistema',
    generatedDate: new Date()
  };

  const handleGenerateComplete = (success: boolean) => {
    if (success) {
      console.log('PDF generado exitosamente');
    } else {
      console.error('Error al generar PDF');
    }
  };

  return (
    <div className="pdf-test-report">
      <div className="test-header">
        <h1>Prueba de Generación de Reportes PDF</h1>
        <p>Esta es una prueba del sistema de generación de reportes PDF con el formato solicitado.</p>
      </div>
      
      <div className="test-content">
        <PDFReportGenerator 
          reportData={sampleData}
          onGenerateComplete={handleGenerateComplete}
        />
      </div>
      
      <div className="test-info">
        <h3>Información de Prueba</h3>
        <ul>
          <li><strong>Formato:</strong> A4 vertical</li>
          <li><strong>Tipografía:</strong> Arial 12pt</li>
          <li><strong>Márgenes:</strong> 20mm estándar</li>
          <li><strong>Encabezado:</strong> Imagen personalizada</li>
          <li><strong>Pie de página:</strong> Imagen personalizada</li>
          <li><strong>Datos de prueba:</strong> 5 tickets de ejemplo</li>
        </ul>
      </div>
    </div>
  );
};
