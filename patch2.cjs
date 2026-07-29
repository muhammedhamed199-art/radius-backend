const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

const targetRegex = /<td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap">\s*<input\s*type="checkbox"\s*checked=\{isSelected\}\s*onChange=\{\(e\) => handleSelectOne\(customer\?\.id, e\.target\.checked\)\}\s*className="rounded text-indigo-600 focus:ring-indigo-500"\s*\/>\s*<\/td>\s*<td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap">/m;

const replacement = `<td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={(e) => handleSelectOne(customer?.id, e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap">`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync('src/components/SubscribersView.tsx', content);
  console.log("Fixed via regex!");
} else {
  console.log("Still not found!");
}
