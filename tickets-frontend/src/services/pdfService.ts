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
  private fontSize: number = 9;

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
    } catch {
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('ALCALDÍA DE SAN CRISTÓBAL', this.pageWidth / 2, 15, { align: 'center' });
      this.doc.setFont('helvetica', 'normal');
    }
  }

  private async addFooter(pageNumber: number, totalPages: number): Promise<void> {
    const y = this.pageHeight - 18;
    this.doc.setLineWidth(0.3);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, y, this.pageWidth - this.margin, y);

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(120, 120, 120);
    this.doc.text(
      `Sistema de Gestión de Tickets — Alcaldía de San Cristóbal`,
      this.margin,
      y + 6
    );
    this.doc.text(
      `Página ${pageNumber} de ${totalPages}`,
      this.pageWidth - this.margin,
      y + 6,
      { align: 'right' }
    );
    this.doc.setTextColor(0, 0, 0);
  }

  private addTitle(title: string, subtitle?: string): void {
    let y = 50;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageWidth / 2, y, { align: 'center' });

    if (subtitle) {
      y += 10;
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.pageWidth / 2, y, { align: 'center' });
    }
  }

  private getColumnWidths(totalColumns: number): number[] {
    const tableWidth = this.pageWidth - (this.margin * 2);
    if (totalColumns <= 0) return [];

    if (totalColumns === 4) {
      return [tableWidth * 0.20, tableWidth * 0.30, tableWidth * 0.25, tableWidth * 0.25];
    }
    if (totalColumns === 5) {
      return [tableWidth * 0.20, tableWidth * 0.22, tableWidth * 0.22, tableWidth * 0.18, tableWidth * 0.18];
    }
    if (totalColumns === 6) {
      return [tableWidth * 0.18, tableWidth * 0.18, tableWidth * 0.16, tableWidth * 0.16, tableWidth * 0.16, tableWidth * 0.16];
    }
    if (totalColumns === 7) {
      return [tableWidth * 0.16, tableWidth * 0.14, tableWidth * 0.14, tableWidth * 0.14, tableWidth * 0.14, tableWidth * 0.14, tableWidth * 0.14];
    }
    if (totalColumns === 11) {
      return [tableWidth * 0.05, tableWidth * 0.18, tableWidth * 0.08, tableWidth * 0.15, tableWidth * 0.08, tableWidth * 0.08, tableWidth * 0.08, tableWidth * 0.08, tableWidth * 0.10, tableWidth * 0.06, tableWidth * 0.06];
    }

    const equalWidth = tableWidth / totalColumns;
    return Array(totalColumns).fill(equalWidth);
  }

  private addTableHeader(columns: string[], startY: number): number {
    const columnWidths = this.getColumnWidths(columns.length);
    if (columns.length === 0) return startY;

    let y = startY;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);

    let x = this.margin;
    columns.forEach((col, i) => {
      this.doc.text(col, x, y);
      x += columnWidths[i];
    });

    y += 2;
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y, this.pageWidth - this.margin, y);

    return y + 5;
  }

  private addTableRow(data: any[], columns: string[], startY: number): number {
    const columnWidths = this.getColumnWidths(columns.length);
    if (columns.length === 0 || columnWidths.length === 0) return startY;

    let y = startY;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    data.forEach((row) => {
      if (y > this.pageHeight - 35) {
        this.doc.addPage();
        y = 50;
        this.addHeader();
        y = this.addTableHeader(columns, y);
      }

      let x = this.margin;
      columns.forEach((col, i) => {
        const text = String(row[col] ?? '');
        const maxChars = Math.floor(columnWidths[i] / 1.7);
        const display = text.length > maxChars ? text.substring(0, maxChars - 2) + '..' : text;
        this.doc.text(display, x, y);
        x += columnWidths[i];
      });

      y += this.lineHeight;
    });

    return y;
  }

  async generateReport(reportData: PDFReportData): Promise<void> {
    await this.addHeader();
    this.addTitle(reportData.title, reportData.subtitle);

    let y = 70;
    y = this.addTableHeader(reportData.columns, y);
    y = this.addTableRow(reportData.data, reportData.columns, y);

    // Footer info on last page only
    y += 10;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `Generado por: ${reportData.generatedBy}  |  ${reportData.generatedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      this.margin, y
    );

    // Add footer to all pages
    const totalPages = this.doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      await this.addFooter(i, totalPages);
    }
  }

  save(filename: string): void { this.doc.save(filename); }

  getBlob(): Blob { return new Blob([this.doc.output('blob')], { type: 'application/pdf' }); }
}
