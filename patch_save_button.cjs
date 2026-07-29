const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const oldSaveButton = `                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("unified_terminal_template", unifiedTemplate);
                    if (addNotification) {
                      addNotification("تم حفظ قالب كود التركيب بنجاح!", "success");
                    }
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >`;

const newSaveButton = `                <button
                  type="button"
                  onClick={() => {
                    let updatedTemplate = unifiedTemplate;
                    if (lastSavedTemplateVars.name && lastSavedTemplateVars.name !== templateVars.name) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.name).join(templateVars.name);
                    }
                    if (lastSavedTemplateVars.ip && lastSavedTemplateVars.ip !== templateVars.ip) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.ip).join(templateVars.ip);
                    }
                    if (lastSavedTemplateVars.vpnIp && lastSavedTemplateVars.vpnIp !== templateVars.vpnIp) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.vpnIp).join(templateVars.vpnIp);
                    }
                    if (lastSavedTemplateVars.secret && lastSavedTemplateVars.secret !== templateVars.secret) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.secret).join(templateVars.secret);
                    }
                    
                    setUnifiedTemplate(updatedTemplate);
                    setLastSavedTemplateVars(templateVars);
                    
                    localStorage.setItem("unified_terminal_template", updatedTemplate);
                    localStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
                    if (addNotification) {
                      addNotification("تم حفظ قالب كود التركيب بنجاح!", "success");
                    }
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >`;

if (content.includes(oldSaveButton)) {
  content = content.replace(oldSaveButton, newSaveButton);
} else {
  console.log("Could not find oldSaveButton");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
