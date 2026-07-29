const fs = require('fs');
let content = fs.readFileSync('src/utils/exportUtils.ts', 'utf8');

content = content + `\nexport const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  const header = Object.keys(data[0]);
  const csvRows = [header.join(',')];
  for (const row of data) {
    const values = header.map(headerKey => {
      const escaped = ('' + (row[headerKey] || '')).replace(/"/g, '\\"');
      return \`"\${escaped}"\`;
    });
    csvRows.push(values.join(','));
  }
  const csvString = csvRows.join('\\n');
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', \`\${filename}.csv\`);
  a.click();
  URL.revokeObjectURL(url);
};\n`;

fs.writeFileSync('src/utils/exportUtils.ts', content);
