/**
 * Password Hash Generator
 * 
 * Utility to generate bcrypt password hashes for admin authentication.
 * Run: npm run generate-password
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🔐 PortalAR Admin Password Generator\n');
console.log('Generate a bcrypt hash for your admin password.');
console.log('Copy the hash to backend/.env as ADMIN_PASSWORD_HASH\n');

rl.question('Enter admin password: ', async (password) => {
  if (!password || password.length < 8) {
    console.error('\n❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    console.log('\n✅ Password hash generated!\n');
    console.log('Add this to your backend/.env file:');
    console.log('─'.repeat(70));
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('─'.repeat(70));
    console.log('\nYou can now login with:');
    console.log(`  Username: admin`);
    console.log(`  Password: ${password}\n`);
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  } finally {
    rl.close();
  }
});
