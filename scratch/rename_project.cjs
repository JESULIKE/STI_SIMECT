const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'server/api/health.get.ts',
  'server/api/admin/analytics/export.get.ts',
  'prisma/seed.ts',
  'pages/index.vue',
  'pages/auth/login.vue',
  'pages/auth/register.vue',
  'nuxt.config.ts'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/SIMEP/g, 'SIMECT');
    content = content.replace(/simep/g, 'simect');
    fs.writeFileSync(fullPath, content);
    console.log(`Updated: ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
});
