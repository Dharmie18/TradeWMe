// Script to check which environment variables are set
require('dotenv').config();

const requiredEnvVars = {
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID': 'WalletConnect - Required for Connect Wallet button',
    'TURSO_CONNECTION_URL': 'Database connection URL',
    'TURSO_AUTH_TOKEN': 'Database authentication token',
    'BETTER_AUTH_SECRET': 'Authentication secret key',
    'BETTER_AUTH_URL': 'Authentication URL',
    'NEXT_PUBLIC_SITE_URL': 'Site URL for authentication',
};

const optionalEnvVars = {
    'COINGECKO_API_KEY': 'CoinGecko API for crypto prices (optional, has free tier)',
};

console.log('\n=== REQUIRED Environment Variables ===\n');
Object.entries(requiredEnvVars).forEach(([key, description]) => {
    const value = process.env[key];
    const status = value ? '✅ SET' : '❌ MISSING';
    const preview = value ? `(${value.substring(0, 20)}...)` : '';
    console.log(`${status} ${key}`);
    console.log(`   → ${description} ${preview}\n`);
});

console.log('\n=== OPTIONAL Environment Variables ===\n');
Object.entries(optionalEnvVars).forEach(([key, description]) => {
    const value = process.env[key];
    const status = value ? '✅ SET' : '⚠️  NOT SET';
    const preview = value ? `(${value.substring(0, 20)}...)` : '';
    console.log(`${status} ${key}`);
    console.log(`   → ${description} ${preview}\n`);
});

console.log('\n=== Summary ===');
const missingRequired = Object.keys(requiredEnvVars).filter(key => !process.env[key]);
if (missingRequired.length === 0) {
    console.log('✅ All required environment variables are set!');
} else {
    console.log(`❌ Missing ${missingRequired.length} required variable(s):`);
    missingRequired.forEach(key => console.log(`   - ${key}`));
}
console.log('\n');
