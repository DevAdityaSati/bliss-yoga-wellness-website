// Clean client-side CSV / Excel / PDF file generator for Admin Reports

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          if (cell === null || cell === undefined) return '""';
          const str = String(cell).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  // UTF-8 BOM byte marker for Excel compatibility
  const BOM = '\uFEFF';
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          if (cell === null || cell === undefined) return '""';
          const str = String(cell).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printOrExportPDF(reportTitle: string, headers: string[], rows: (string | number | boolean)[][]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableHeaderHtml = headers.map(h => `<th style="border: 1px solid #444; padding: 10px; background: #191c19; color: #c5a059;">${h}</th>`).join('');
  const tableBodyHtml = rows
    .map(
      r => `<tr>${r.map(c => `<td style="border: 1px solid #333; padding: 8px; font-size: 13px;">${c ?? ''}</td>`).join('')}</tr>`
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - Bliss Yoga & Wellness</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #0c0d0c; color: #f4f1ea; padding: 30px; }
          h1 { color: #c5a059; margin-bottom: 5px; font-family: Georgia, serif; }
          p.subtitle { color: #94a388; margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; }
          @media print {
            body { background: white; color: black; }
            th { background: #f0f0f0 !important; color: black !important; }
            td, th { border: 1px solid #ccc !important; }
          }
        </style>
      </head>
      <body>
        <h1>Bliss Yoga & Wellness Sanctuary</h1>
        <p class="subtitle">${reportTitle} — Generated ${new Date().toLocaleDateString()}</p>
        <table>
          <thead><tr>${tableHeaderHtml}</tr></thead>
          <tbody>${tableBodyHtml}</tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
