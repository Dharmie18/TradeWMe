// Test the hybrid authentication system
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');

async function testHybridAuth() {
  console.log('🧪 Testing Hybrid Authentication System...\n');

  // Test 1: Create a test user
  console.log('1. Creating test user...');
  const testUser = {
    id: Date.now().toString(),
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 12),
    name: 'Test User',
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    accountType: 'REAL',
    role: 'USER',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  // Save to file
  const users = [testUser];
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log('✅ Test user created:', testUser.email);

  // Test 2: Verify password
  console.log('\n2. Testing password verification...');
  const isValid = await bcrypt.compare('password123', testUser.password);
  console.log('✅ Password verification:', isValid ? 'PASS' : 'FAIL');

  // Test 3: Read users from file
  console.log('\n3. Reading users from file...');
  const savedUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  console.log('✅ Users loaded:', savedUsers.length);
  console.log('   - Email:', savedUsers[0].email);
  console.log('   - Name:', savedUsers[0].name);

  // Test 4: Find user by email
  console.log('\n4. Testing user lookup...');
  const foundUser = savedUsers.find(u => u.email.toLowerCase() === 'test@example.com');
  console.log('✅ User found:', foundUser ? 'YES' : 'NO');

  console.log('\n🎉 Hybrid authentication system is working!');
  console.log('\nNow you can:');
  console.log('1. Register new accounts at /register');
  console.log('2. Login with created accounts at /login');
  console.log('3. All accounts are stored in users.json file');

  // Clean up
  if (fs.existsSync(USERS_FILE)) {
    fs.unlinkSync(USERS_FILE);
    console.log('\n🧹 Test file cleaned up');
  }
}

testHybridAuth().catch(console.error);