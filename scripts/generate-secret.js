// Simple script to generate a secure random string for NEXTAUTH_SECRET
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');
console.log('Generated NEXTAUTH_SECRET:');
console.log(secret);
console.log('\nAdd this to your .env file:');
console.log(`NEXTAUTH_SECRET=${secret}`); 