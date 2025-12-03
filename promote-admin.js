/**
 * Promote User to Admin Script
 * 
 * Usage: node promote-admin.js "user@email.com"
 */

require('dotenv').config();
const { createClient } = require('@libsql/client');

async function promoteToAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('\n❌ Error: Email address required');
        console.log('\n📝 Usage: node promote-admin.js "user@email.com"\n');
        process.exit(1);
    }

    console.log('\n🔧 Promoting User to Admin\n');
    console.log('='.repeat(50));

    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    try {
        // Check if user exists
        console.log(`\n🔍 Looking for user: ${email}`);
        const userCheck = await client.execute({
            sql: 'SELECT id, name, email, role FROM user WHERE email = ?',
            args: [email]
        });

        if (userCheck.rows.length === 0) {
            console.log(`\n❌ User not found: ${email}`);
            console.log('\n💡 Available users:');
            const allUsers = await client.execute('SELECT email FROM user');
            allUsers.rows.forEach((row, i) => {
                console.log(`   ${i + 1}. ${row.email}`);
            });
            return;
        }

        const user = userCheck.rows[0];
        console.log(`\n✅ Found user: ${user.name} (${user.email})`);
        console.log(`   Current role: ${user.role || 'user'}`);

        if (user.role === 'admin') {
            console.log('\n⚠️  User is already an admin!');
            return;
        }

        // Promote to admin
        console.log('\n🚀 Promoting to admin...');
        await client.execute({
            sql: 'UPDATE user SET role = ? WHERE email = ?',
            args: ['admin', email]
        });

        // Verify the change
        const verify = await client.execute({
            sql: 'SELECT id, name, email, role FROM user WHERE email = ?',
            args: [email]
        });

        if (verify.rows[0].role === 'admin') {
            console.log('\n✅ SUCCESS! User promoted to admin');
            console.log('\n📋 Updated User Info:');
            console.log(`   Name: ${verify.rows[0].name}`);
            console.log(`   Email: ${verify.rows[0].email}`);
            console.log(`   Role: ${verify.rows[0].role}`);
            console.log('\n💡 Next Steps:');
            console.log('   1. Log out of your account');
            console.log('   2. Log back in');
            console.log('   3. Navigate to http://localhost:3000/admin');
            console.log('   4. You should see the admin dashboard!\n');
        } else {
            console.log('\n❌ Failed to update user role');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        client.close();
    }
}

promoteToAdmin();
