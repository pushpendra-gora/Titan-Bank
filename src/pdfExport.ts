import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from './types';

const META: Record<string, [string, string]> = {
  in: ['Income', '+'],
  out: ['Expense', '−'],
  diya: ['Money Lent', '↗'],
  liya: ['Money Borrowed', '↙'],
  diya_back: ['Lent Repaid', '↙'],
  liya_back: ['Debt Repaid', '↗']
};

const PLUS = ['in', 'liya', 'diya_back'];

export const exportTransactionsPDF = (transactions: Transaction[]): boolean => {
  if (!transactions.length) {
    return false;
  }

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  const eff = (t: Transaction) => (PLUS.includes(t.type) ? t.amt : -t.amt);
  const totalBal = sorted.reduce((acc, t) => acc + eff(t), 0);
  const totalIn = sorted.filter(t => PLUS.includes(t.type)).reduce((acc, t) => acc + t.amt, 0);
  const totalOut = sorted.filter(t => !PLUS.includes(t.type)).reduce((acc, t) => acc + t.amt, 0);

  const formatInr = (n: number) => 'Rs ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const fdate = (d: string) => {
    try {
      return new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const doc = new jsPDF();

  // Header Title
  doc.setFillColor(79, 70, 229); // #4f46e5 brand
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Titan Bank', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Offline Account Statement', 14, 25);
  doc.text(`Generated: ${fdate(new Date().toISOString().slice(0, 10))}`, 196, 25, { align: 'right' });

  // Summary Cards
  doc.setTextColor(15, 23, 42); // ink
  doc.setFontSize(10);

  const drawCard = (x: number, y: number, w: number, h: number, title: string, amount: string, color: [number, number, number]) => {
    doc.setFillColor(247, 248, 253);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setDrawColor(232, 234, 243);
    doc.roundedRect(x, y, w, h, 3, 3, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(title, x + 5, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(12);
    doc.text(amount, x + 5, y + 17);
  };

  const cardWidth = 58;
  const startY = 38;
  drawCard(14, startY, cardWidth, 22, 'Total Balance', formatInr(totalBal), totalBal >= 0 ? [22, 163, 74] : [239, 68, 68]);
  drawCard(76, startY, cardWidth, 22, 'Total Income', formatInr(totalIn), [22, 163, 74]);
  drawCard(138, startY, cardWidth, 22, 'Total Expenses', formatInr(totalOut), [239, 68, 68]);

  // Table
  const tableData = sorted.map((t, index) => {
    const isPlus = PLUS.includes(t.type);
    const meta = META[t.type] || ['Other', '•'];
    const detail = (t.note || t.person || meta[0]) + (t.person && t.note ? ` (${t.person})` : '');
    const amtStr = (isPlus ? '+ ' : '- ') + formatInr(t.amt);

    return [
      (index + 1).toString(),
      fdate(t.date),
      detail,
      meta[0],
      amtStr
    ];
  });

  autoTable(doc, {
    startY: 66,
    head: [['#', 'Date', 'Detail', 'Type', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 38 },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [250, 251, 255],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    }
  });

  doc.save('Titan_Bank_Statement.pdf');
  return true;
};
