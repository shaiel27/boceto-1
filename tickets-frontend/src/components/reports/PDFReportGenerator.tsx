import React, { useState } from 'react';
import { PDFService, PDFReportData } from '../../services/pdfService';
import { Download, FileText, Loader2 } from 'lucide-react';
import './PDFReportGenerator.css';

interface PDFReportGeneratorProps {
  reportData: PDFReportData;
  onGenerateComplete?: (success: boolean) => void;
}

export const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
  reportData,
  onGenerateComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePDF = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const pdfService = new PDFService();
      
      setProgress(25);
      await pdfService.generateReport(reportData);
      
      setProgress(75);
      const cleanTitle = reportData.title
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
      const filename = `${cleanTitle}_${Date.now()}.pdf`;
      pdfService.save(filename);
      
      setProgress(100);
      onGenerateComplete?.(true);
      
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      onGenerateComplete?.(false);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="pdf-generator">
      <div className="pdf-generator-header">
        <h3>Generador de Reportes PDF</h3>
        <p>Configuración: A4 vertical, Arial 12, márgenes estándar</p>
      </div>

      <div className="pdf-generator-preview">
        <div className="preview-info">
          <div className="preview-item">
            <strong>Título:</strong> {reportData.title}
          </div>
          {reportData.subtitle && (
            <div className="preview-item">
              <strong>Subtítulo:</strong> {reportData.subtitle}
            </div>
          )}
          <div className="preview-item">
            <strong>Registros:</strong> {reportData.data.length}
          </div>
          <div className="preview-item">
            <strong>Columnas:</strong> {reportData.columns.join(', ')}
          </div>
          <div className="preview-item">
            <strong>Generado por:</strong> {reportData.generatedBy}
          </div>
          <div className="preview-item">
            <strong>Fecha:</strong> {reportData.generatedDate.toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="pdf-generator-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {progress < 25 && 'Preparando documento...'}
            {progress >= 25 && progress < 75 && 'Generando contenido...'}
            {progress >= 75 && progress < 100 && 'Aplicando formato...'}
            {progress === 100 && '¡PDF generado!'}
          </div>
        </div>
      )}

      <div className="pdf-generator-actions">
        <button
          className="generate-pdf-btn"
          onClick={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Generando PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Generar y Descargar PDF
            </>
          )}
        </button>
      </div>

      <div className="pdf-generator-features">
        <h4>Características del PDF:</h4>
        <ul>
          <li>✓ Encabezado y pie de página personalizados</li>
          <li>✓ Formato A4 vertical</li>
          <li>✓ Tipografía Arial 12pt</li>
          <li>✓ Márgenes estándar (20mm)</li>
          <li>✓ Numeración de páginas</li>
          <li>✓ Tablas con datos del reporte</li>
          <li>✓ Información de generación</li>
        </ul>
      </div>
    </div>
  );
};
