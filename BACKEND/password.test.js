import { encryptPassword, decryptPassword } from './password';  // Import your functions
import crypto from 'crypto';

// Mock secret key for testing
process.env.SECRETKEY = '12345678901234567890123456789012'; // Must be 32 bytes long

describe('Password Encryption and Decryption', () => {
    let password;
    let encryptedPassword;

    beforeAll(() => {
        password = 'testPassword123';
        encryptedPassword = encryptPassword(password);
    });

    it('should encrypt the password correctly', () => {
        expect(encryptedPassword).toHaveProperty('iv');
        expect(encryptedPassword).toHaveProperty('content');
        expect(encryptedPassword.iv).toHaveLength(32); // 16 bytes, hex => 32 chars
        expect(encryptedPassword.content).toMatch(/[a-f0-9]{32,}/); // Encrypted content in hex
    });

    it('should decrypt the password correctly', () => {
        const decryptedPassword = decryptPassword(encryptedPassword);
        expect(decryptedPassword).toBe(password); // The decrypted password should match the original one
    });

    it('should throw an error for incorrect decryption', () => {
        const wrongHash = { iv: 'wrongiv', content: 'wrongcontent' };
        expect(() => decryptPassword(wrongHash)).toThrowError('Decryption failed');
    });

});
