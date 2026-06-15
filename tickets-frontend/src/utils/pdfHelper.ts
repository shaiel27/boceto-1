const PDF_COLORS = {
  primary: '#1a365d',
  secondary: '#3b82f6',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  purple: '#7c3aed',
  teal: '#0891b2',
  gray: '#64748b',
  grayLight: '#f1f5f9',
  border: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#94a3b8',
} as const;

const FONT_SIZES = {
  title: 16,
  subtitle: 10,
  sectionTitle: 11,
  header: 8,
  body: 8,
  small: 7,
  tiny: 6.5,
} as const;

const MARGINS = {
  left: 20,
  right: 20,
  headerHeight: 36,
  footerHeight: 28,
  contentTop: 50,
  tableStart: 60,
} as const;

const PAGE_BREAK_Y = 248;

export async function initPDF(): Promise<{
  doc: import('jspdf').jsPDF;
  headerImg: string | null;
  footerImg: string | null;
}> {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF();
  const headerImg = await loadImage('/pdf-reports/header/cabecera.jpg');
  const footerImg = await loadImage('/pdf-reports/footer/pie.jpg');
  return { doc, headerImg, footerImg };
}

async function loadImage(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function addHeader(
  doc: import('jspdf').jsPDF,
  title: string,
  subtitle: string,
  img: string | null,
  yStart: number,
): number {
  let y = yStart;
  if (img) {
    doc.addImage(img, 'JPEG', MARGINS.left, 10, 170, 30);
    y += 36;
  }

  doc.setFontSize(FONT_SIZES.title);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.text);
  doc.text(title, 105, y, { align: 'center' });

  doc.setFontSize(FONT_SIZES.subtitle);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_COLORS.gray);
  doc.text(subtitle, 105, y + 8, { align: 'center' });

  return y + 16;
}

export function addFooter(
  doc: import('jspdf').jsPDF,
  footerImg: string | null,
  period: string,
): void {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;

    if (footerImg) {
      doc.addImage(footerImg, 'JPEG', MARGINS.left, pageHeight - 22, 170, 18);
    }

    doc.setDrawColor(PDF_COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(MARGINS.left, pageHeight - 8, 190, pageHeight - 8);

    doc.setFontSize(FONT_SIZES.tiny);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PDF_COLORS.gray);

    doc.text(period, MARGINS.left, pageHeight - 3);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, pageHeight - 3, { align: 'center' });
    doc.text(`Página ${i} de ${totalPages}`, 190, pageHeight - 3, { align: 'right' });
  }
}

export function checkPageBreak(
  doc: import('jspdf').jsPDF,
  yPosition: number,
  headerImg: string | null,
  title: string,
  subtitle: string,
): number {
  if (yPosition > PAGE_BREAK_Y) {
    doc.addPage();
    const y = addHeader(doc, `${title} (cont.)`, subtitle, headerImg, MARGINS.contentTop);
    return y;
  }
  return yPosition;
}

export function drawTableHeader(
  doc: import('jspdf').jsPDF,
  columns: { label: string; x: number; align?: 'left' | 'center' | 'right' }[],
  y: number,
): void {
  doc.setFillColor(PDF_COLORS.primary);
  doc.rect(MARGINS.left, y - 2, 170, 8, 'F');

  doc.setFontSize(FONT_SIZES.header);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#ffffff');

  columns.forEach((col) => {
    doc.text(col.label, col.x, y + 4, { align: col.align || 'left' });
  });
}

export function drawTableRow(
  doc: import('jspdf').jsPDF,
  columns: { value: string; x: number; align?: 'left' | 'center' | 'right'; color?: string }[],
  y: number,
  isEven: boolean,
): void {
  if (isEven) {
    doc.setFillColor(PDF_COLORS.grayLight);
    doc.rect(MARGINS.left, y - 2, 170, 8, 'F');
  }

  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'normal');

  columns.forEach((col) => {
    doc.setTextColor(col.color ? col.color : PDF_COLORS.text);
    doc.text(col.value, col.x, y + 4, { align: col.align || 'left' });
  });

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(MARGINS.left, y + 6, 190, y + 6);
}

export function drawSummaryCards(
  doc: import('jspdf').jsPDF,
  cards: { label: string; value: string; color: string }[],
  y: number,
): number {
  const cols = 3;
  const cardW = 54;
  const cardH = 16;
  const gap = 4;
  let cy = y;

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = MARGINS.left + col * (cardW + gap);
    const rowY = cy + row * (cardH + gap);

    doc.setDrawColor(PDF_COLORS.border);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cx, rowY, cardW, cardH, 2, 2, 'FD');

    doc.setFillColor(card.color);
    doc.rect(cx, rowY, 3, cardH, 'F');

    doc.setFontSize(FONT_SIZES.sectionTitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(card.color);
    doc.text(card.value, cx + 7, rowY + 7);

    doc.setFontSize(FONT_SIZES.tiny);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PDF_COLORS.gray);
    doc.text(card.label, cx + 7, rowY + 13);
  });

  const totalRows = Math.ceil(cards.length / cols);
  return cy + totalRows * (cardH + gap) + 4;
}

export function drawSectionTitle(
  doc: import('jspdf').jsPDF,
  text: string,
  y: number,
): void {
  doc.setFontSize(FONT_SIZES.sectionTitle);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.primary);
  doc.text(text, MARGINS.left, y);

  doc.setDrawColor(PDF_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, y + 2, 190, y + 2);
}

export { PDF_COLORS, FONT_SIZES, MARGINS, PAGE_BREAK_Y };
