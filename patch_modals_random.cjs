const fs = require('fs');

const fixRandom = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Math\.floor\(Math\.random\(\) \* 50\) \+ 20/g, '0');
  content = content.replace(/Math\.floor\(Math\.random\(\) \* 30\) \+ 10/g, '0');
  content = content.replace(/Math\.floor\(100 \+ Math\.random\(\) \* 900\)/g, 'Date.now().toString().slice(-4)');
  content = content.replace(/Math\.floor\(100000 \+ Math\.random\(\) \* 900000\)/g, 'Date.now().toString().slice(-6)');
  content = content.replace(/Math\.random\(\)\.toString\(36\)\.substr\(2, 5\)/g, 'Date.now().toString(36)');
  fs.writeFileSync(file, content);
}

fixRandom('src/components/FinancialReportModal.tsx');
fixRandom('src/components/Subscriber360Modal.tsx');
fixRandom('src/components/SubscriberPortalView.tsx');
fixRandom('src/components/ConsumptionReportPdfModal.tsx');
fixRandom('src/components/DistributorSubscriptionsView.tsx');
fixRandom('src/components/SubscriberImportExportModal.tsx');

