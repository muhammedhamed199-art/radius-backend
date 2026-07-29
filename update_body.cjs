const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

const target = `                    >
                      <td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={(e) => handleSelectOne(customer?.id, e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap">`;

const replacement = `                    >
                      <td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={(e) => handleSelectOne(customer?.id, e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 font-mono text-[10px]">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/SubscribersView.tsx', content);
  console.log("Fixed!");
} else {
  console.log("Not found!");
}
