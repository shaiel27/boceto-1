import jsPDF from 'jspdf';

export interface PDFReportData {
  title: string;
  subtitle?: string;
  data: any[];
  columns: string[];
  generatedBy: string;
  generatedDate: Date;
}

export class PDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private lineHeight: number = 7;
  private fontSize: number = 12;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    
    this.doc.setFont('helvetica');
    this.doc.setFontSize(this.fontSize);
  }

  private async addHeader(): Promise<void> {
    try {
      const headerImg = new Image();
      headerImg.src = '/pdf-reports/header/cabecera.jpg';
      
      await new Promise((resolve, reject) => {
        headerImg.onload = resolve;
        headerImg.onerror = reject;
      });

      this.doc.addImage(headerImg, 'JPEG', 0, 0, this.pageWidth, 40);
    } catch (error) {
      console.warn('Header image not found, using text header');
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('MUNICIPIO DE SANTA CRUZ', this.pageWidth / 2, 15, { align: 'center' });
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
    }
  }

  private async addFooter(pageNumber: number, totalPages: number): Promise<void> {
    try {
      const footerImg = new Image();
      footerImg.src = '/pdf-reports/footer/pie.jpg';
      
      await new Promise((resolve, reject) => {
        footerImg.onload = resolve;
        footerImg.onerror = reject;
      });

      const footerY = this.pageHeight - 30;
      this.doc.addImage(footerImg, 'JPEG', 0, footerY, this.pageWidth, 30);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Página ${pageNumber} de ${totalPages}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
    } catch (error) {
      console.warn('Footer image not found, using text footer');
      const footerY = this.pageHeight - 15;
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Página ${pageNumber} de ${totalPages}`, this.pageWidth / 2, footerY, { align: 'center' });
    }
  }

  private addTitle(title: string, subtitle?: string): void {
    let yPosition = 50;
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageWidth / 2, yPosition, { align: 'center' });
    
    if (subtitle) {
      yPosition += 10;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.pageWidth / 2, yPosition, { align: 'center' });
    }
  }

  private addTableHeader(columns: string[], startY: number): number {
    let yPosition = startY;
    const tableWidth = this.pageWidth - (this.margin * 2);
    
    // Define column widths based on content type
    const columnWidths: number[] = [];
    const totalColumns = columns.length;
    
    if (totalColumns === 4) {
      // Better distribution for 4 columns
      columnWidths.push(tableWidth * 0.30); // First column gets 30%
      columnWidths.push(tableWidth * 0.20); // Second column gets 20%
      columnWidths.push(tableWidth * 0.25); // Third column gets 25%
      columnWidths.push(tableWidth * 0.25); // Fourth column gets 25%
    } else {
      // Equal distribution for other cases
      const equalWidth = tableWidth / totalColumns;
      for (let i = 0; i < totalColumns; i++) {
        columnWidths.push(equalWidth);
      }
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    
    let currentX = this.margin;
    columns.forEach((column, index) => {
      this.doc.text(column, currentX, yPosition);
      currentX += columnWidths[index];
    });
    
    yPosition += 2;
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, yPosition, this.pageWidth - this.margin, yPosition);
    
    return yPosition + 5;
  }

  private addTableRow(data: any[], columns: string[], startY: number): number {
    let yPosition = startY;
    const tableWidth = this.pageWidth - (this.margin * 2);
    
    // Define column widths based on content type
    const columnWidths: number[] = [];
    const totalColumns = columns.length;
    
    if (totalColumns === 4) {
      columnWidths.push(tableWidth * 0.30);
      columnWidths.push(tableWidth * 0.20);
      columnWidths.push(tableWidth * 0.25);
      columnWidths.push(tableWidth * 0.25);
    } else {
      const equalWidth = tableWidth / totalColumns;
      for (let i = 0; i < totalColumns; i++) {
        columnWidths.push(equalWidth);
      }
    }
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    
    data.forEach((row) => {
      if (yPosition > this.pageHeight - 60) {
        this.doc.addPage();
        yPosition = 50;
        yPosition = this.addTableHeader(columns, yPosition);
      }
      
      let currentX = this.margin;
      columns.forEach((column, index) => {
        const cellData = row[column] || '';
        const text = String(cellData);
        
        // Truncate text to fit column width (approximate)
        const maxChars = Math.floor(columnWidths[index] / 2.5); // Approximate character width
        const truncatedText = text.length > maxChars ? text.substring(0, maxChars - 3) + '...' : text;
        
        this.doc.text(truncatedText, currentX, yPosition);
        currentX += columnWidths[index];
      });
      
      yPosition += this.lineHeight;
    });
    
    return yPosition;
  }

  private addReportInfo(generatedBy: string, generatedDate: Date): void {
    const yPosition = this.pageHeight - 40;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generado por: ${generatedBy}`, this.margin, yPosition);
    this.doc.text(`Fecha: ${generatedDate.toLocaleDateString('es-ES')}`, this.margin, yPosition + 5);
  }

  async generateReport(reportData: PDFReportData): Promise<void> {
    await this.addHeader();
    this.addTitle(reportData.title, reportData.subtitle);
    
    let yPosition = 70;
    yPosition = this.addTableHeader(reportData.columns, yPosition);
    yPosition = this.addTableRow(reportData.data, reportData.columns, yPosition);
    
    this.addReportInfo(reportData.generatedBy, reportData.generatedDate);
    
    const totalPages = this.doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      await this.addFooter(i, totalPages);
    }
  }

  save(filename: string): void {
    this.doc.save(filename);
  }

  getBlob(): Blob {
    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }
}
