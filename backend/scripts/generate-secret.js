/**
 * JWT Secret Generator
 * 
 * Generates a secure random string for JWT token signing.
 * Run: npm run generate-secret
 */

const crypto = require('crypto');

console.log('\n🔑 PortalAR JWT Secret Generator\n');

const secret = crypto.randomBytes(32).toString('hex');

console.log('Add this to your backend/.env file:');
console.log('─'.repeat(70));
console.log(`ADMIN_JWT_SECRET=${secret}`);
console.log('─'.repeat(70));
console.log('\n✅ Secret generated! Keep this secure and never commit to Git.\n');
