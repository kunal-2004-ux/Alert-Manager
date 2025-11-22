import Logger from './logger';

export async function withRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries > 0) {
            Logger.warn(`Operation failed. Retrying in ${delay}ms... (${retries} attempts left). Error: ${error.message}`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return withRetry(operation, retries - 1, delay * 2); // Exponential backoff
        } else {
            Logger.error('Operation failed after max retries.');
            throw error;
        }
    }
}
