import crypto from 'crypto';
import dotenv from 'dotenv';

const algorithm = 'aes-256-cbc';
dotenv.config({ path: './setup.env' });
const secretKey = process.env.SECRETKEY;
const iv = crypto.randomBytes(16);

// The purpose of this is to encrypt the password before storing it in the database.
// Iv is to ensure that the same password does not have the same hash
// secretKey is the key used to encrypt the password

function encryptPassword(password) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        content: encrypted
    };
}

function decryptPassword(hash) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    let decrypted = decipher.update(hash.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export { encryptPassword, decryptPassword };