import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (data: any[], columns: { header: string; dataKey: string }[], filename: string, title: string) => {
  const doc = new jsPDF('l', 'pt', 'a4');
  
  // Set Arabic font if possible, or use standard
  doc.text(title, 40, 40);
  
  (doc as any).autoTable({
    startY: 50,
    head: [columns.map(c => c.header)],
    body: data.map(row => columns.map(c => row[c.dataKey])),
    styles: { font: 'helvetica', halign: 'right' },
    headStyles: { fillColor: [79, 70, 229] },
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  const header = Object.keys(data[0]);
  const csvRows = [header.join(',')];
  for (const row of data) {
    const values = header.map(headerKey => {
      const escaped = ('' + (row[headerKey] || '')).replace(/"/g, '\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  a.click();
  URL.revokeObjectURL(url);
};
