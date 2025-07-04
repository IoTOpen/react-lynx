import type { ErrorResponse } from '@iotopen/node-lynx';

/**
 * Type guard to safely identify ErrorResponse objects from unknown caught values.
 * Prevents unsafe type assertions and ensures consistent error handling across the app.
 */
export const isErrorResponse = (e: unknown): e is ErrorResponse => {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        'status' in e
    );
};

/**
 * Type guard to safely identify Error objects from unknown caught values.
 * Used for hooks that expect Error | undefined instead of ErrorResponse.
 */
export const isError = (e: unknown): e is Error => {
    return e instanceof Error;
};

/**
 * Creates a standardized fallback ErrorResponse for unknown errors.
 * Provides consistent error shape and messaging across the application.
 */
export const createFallbackErrorResponse = (message = 'Unknown error'): ErrorResponse => ({
    status: 500,
    message
});

/**
 * Creates a standardized fallback Error for unknown errors.
 * Used for hooks that work with Error objects instead of ErrorResponse.
 */
export const createFallbackError = (message = 'Unknown error'): Error => 
    new Error(message);