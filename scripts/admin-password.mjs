// Usage: npm run admin:password -- "YourPassw0rd"
// Prints the ADMIN_PASSWORD_HASH line to paste into .env.local (the password itself is never stored).
import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run admin:password -- "<password>"');
  process.exit(1);
}
if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
  console.error('Password must be at least 8 characters and include a lowercase letter, an uppercase letter, a number and a symbol.');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`ADMIN_PASSWORD_HASH=${salt.toString('hex')}:${hash.toString('hex')}`);
