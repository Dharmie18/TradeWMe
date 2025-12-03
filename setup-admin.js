/**
 * Admin User Setup Script
 * 
 * This script helps you promote a user to admin role in your Turso database.
 * 
 * Usage:
 * 1. Install dependencies: npm install @libsql/client dotenv
 * 2. Run: node setup-admin.js
 */

require('dotenv').config();
const { createClient } = require('@libsql/client');

async function setupAdmin() {
    console.log('\n🔧 Admin User Setup Tool\n');
    console.log('='.repeat(50));

    // Create database client
    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    try {
        // Step 1: List all users
        console.log('\n📋 Current Users in Database:\n');
        const users = await client.execute('SELECT id, name, email, role, createdAt FROM user ORDER BY createdAt DESC');

        if (users.rows.length === 0) {
            console.log('❌ No users found in database.');
            console.log('💡 Please register a user first at: http://localhost:3000/register');
            return;
        }

        console.table(users.rows.map((row, index) => ({
            '#': index + 1,
            ID: row.id,
            Name: row.name,
            Email: row.email,
            Role: row.role || 'user',
            'Created At': new Date(row.createdAt).toLocaleString()
        })));

        // Step 2: Show admin users
        const admins = users.rows.filter(row => row.role === 'admin');
        console.log(`\n✅ Current Admin Users: ${admins.length}`);
        if (admins.length > 0) {
            admins.forEach(admin => {
                console.log(`   - ${admin.name} (${admin.email})`);
            });
        }

        // Step 3: Instructions for manual update
        console.log('\n' + '='.repeat(50));
        console.log('\n📝 To Make a User Admin:\n');
        console.log('Copy and paste one of these commands:\n');

        users.rows.forEach((user, index) => {
            if (user.role !== 'admin') {
                console.log(`${index + 1}. Make "${user.name}" (${user.email}) an admin:`);
                console.log(`   node promote-admin.js "${user.email}"\n`);
            }
        });

        console.log('='.repeat(50));
        console.log('\n💡 Or use the Turso Web Dashboard:');
        console.log('   1. Go to https://turso.tech');
        console.log('   2. Login and select your database');
        console.log('   3. Open SQL console');
        console.log('   4. Run: UPDATE user SET role = \'admin\' WHERE email = \'your@email.com\';');
        console.log('\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Make sure your .env file has:');
        console.error('   - TURSO_CONNECTION_URL');
        console.error('   - TURSO_AUTH_TOKEN');
    } finally {
        client.close();
    }
}

setupAdmin();
