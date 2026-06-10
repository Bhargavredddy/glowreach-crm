const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (target !== 'sqlite' && target !== 'postgresql') {
  console.error('Usage: node switch-db.js <sqlite|postgresql>');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '..', '.env');

try {
  // 1. Update schema.prisma provider
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (target === 'sqlite') {
    schemaContent = schemaContent.replace(/provider = "postgresql"/g, 'provider = "sqlite"');
  } else {
    schemaContent = schemaContent.replace(/provider = "sqlite"/g, 'provider = "postgresql"');
  }
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log(`Updated schema.prisma datasource provider to: ${target}`);

  // 2. Update .env DATABASE_URL
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const sqliteUrl = 'DATABASE_URL="file:./dev.db"';
  const postgresUrl = 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/xeno_crm?schema=public"';

  if (envContent.includes('DATABASE_URL=')) {
    if (target === 'sqlite') {
      envContent = envContent.replace(/DATABASE_URL="[^"]*"/g, sqliteUrl);
      envContent = envContent.replace(/DATABASE_URL='[^']*'/g, sqliteUrl);
    } else {
      envContent = envContent.replace(/DATABASE_URL="[^"]*"/g, postgresUrl);
      envContent = envContent.replace(/DATABASE_URL='[^']*'/g, postgresUrl);
    }
  } else {
    envContent += `\n${target === 'sqlite' ? sqliteUrl : postgresUrl}\n`;
  }

  // Ensure other environment variables are in place if the file is new
  if (!envContent.includes('PORT=')) {
    envContent += 'PORT=5000\n';
  }
  if (!envContent.includes('GEMINI_API_KEY=')) {
    envContent += 'GEMINI_API_KEY="YOUR_GEMINI_API_KEY"\n';
  }
  if (!envContent.includes('CHANNEL_SERVICE_URL=')) {
    envContent += 'CHANNEL_SERVICE_URL="http://localhost:5001/send"\n';
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  console.log(`Updated .env with DATABASE_URL for: ${target}`);
  console.log('Database switch completed successfully!');
} catch (error) {
  console.error('Error switching database:', error.message);
  process.exit(1);
}
