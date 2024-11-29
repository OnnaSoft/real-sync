import crypto from 'crypto';

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateApiKey(): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    
    let apiKey = '';
    const combined = timestamp + randomBytes;
    
    for (let i = 0; i < 32; i++) {
        const index = parseInt(combined[i], 16) % charset.length;
        apiKey += charset[index];
    }
    
    return apiKey;
}