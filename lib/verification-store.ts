// Shared in-memory store for DevOps verification codes
// This ensures both API routes access the same Map instance

interface VerificationData {
    code: string;
    expiresAt: number;
}

const verificationCodes = new Map<string, VerificationData>();

export function storeVerificationCode(email: string, code: string, expirationMs: number) {
    const emailLower = email.toLowerCase();
    verificationCodes.set(emailLower, {
        code,
        expiresAt: Date.now() + expirationMs
    });
    cleanupExpiredCodes();
}

export function getVerificationCode(email: string): VerificationData | undefined {
    const emailLower = email.toLowerCase();
    return verificationCodes.get(emailLower);
}

export function deleteVerificationCode(email: string) {
    const emailLower = email.toLowerCase();
    verificationCodes.delete(emailLower);
}

// Cleanup expired codes periodically
function cleanupExpiredCodes() {
    const now = Date.now();
    for (const [email, data] of verificationCodes.entries()) {
        if (data.expiresAt < now) {
            verificationCodes.delete(email);
        }
    }
}
