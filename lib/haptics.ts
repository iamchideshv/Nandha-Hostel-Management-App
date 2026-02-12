/**
 * Haptic Utility for Web Vibration API
 */

export const Haptics = {
    /**
     * Subtle pulse for secondary actions or toggles
     */
    light: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }
    },

    /**
     * Medium pulse for primary button clicks
     */
    medium: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(30);
        }
    },

    /**
     * Heavy pulse for critical or dangerous actions
     */
    heavy: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(60);
        }
    },

    /**
     * Success pattern (double pulse)
     */
    success: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([20, 50, 40]);
        }
    },

    /**
     * Error pattern (staccato pulses)
     */
    error: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([10, 30, 10, 30, 10]);
        }
    },

    /**
     * Warning pattern (long-short pulses)
     */
    warning: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    },

    /**
     * Custom vibration pattern
     */
    vibrate: (pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
};
