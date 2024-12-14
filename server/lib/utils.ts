import crypto from 'crypto';

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateUniqueKey(n: number = 32): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    
    let uniqueKey = '';
    const combined = timestamp + randomBytes;
    
    for (let i = 0; i < n; i++) {
        const index = parseInt(combined[i], 16) % charset.length;
        uniqueKey += charset[index];
    }
    
    return uniqueKey;
}
