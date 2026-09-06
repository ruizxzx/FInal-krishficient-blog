const fs = require('fs');
const content = fs.readFileSync('src/components/ContactView.tsx', 'utf8');
const newContent = content
  .replace('SECURE COMM CHANNEL', '{siteConfig.contactTitle || "SECURE COMM CHANNEL"}')
  .replace('For architectural consulting, secure protocol design, or technical inquiries. \\n          Use the dispatcher below to route directly to my personal queue.', '{siteConfig.contactSubtitle || "For architectural consulting, secure protocol design, or technical inquiries."}');
fs.writeFileSync('src/components/ContactView.tsx', newContent);
