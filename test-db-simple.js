// Simple database test without Prisma
const { Client } = require('pg');

async function testDatabase() {
  // Use the connection string from .env
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres.hziixvaapxodiegkxmca:sk_fKKtJDcUh4bP8yfFD7VGZ@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
  
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('Testing database connection...');
    await client.connect();
    console.log('✅ Database connected successfully!');
    
    // Test if users table exists
    const result = await client.query("SELECT COUNT(*) FROM \"User\"");
    console.log('✅ Users table accessible, count:', result.rows[0].count);
    
    // List recent users
    const users = await client.query("SELECT email, name, \"emailVerified\", \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 5");
    console.log('✅ Recent users:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Verified: ${user.emailVerified} - Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

testDatabase();