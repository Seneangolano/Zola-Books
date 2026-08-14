/**
 * Haptic Feedback utility leveraging the browser Vibration API (navigator.vibrate)
 * for mobile & touch devices on key interactions.
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function triggerHapticFeedback(pattern: HapticPattern = 'light'): void {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      switch (pattern) {
        case 'light':
          // Subtle click feel for general buttons
          navigator.vibrate(12);
          break;

        case 'medium':
          // Standard tap feedback
          navigator.vibrate(28);
          break;

        case 'heavy':
          // Firm press or major action
          navigator.vibrate(55);
          break;

        case 'success':
          // Rhythm pattern for completion (e.g. Payment successful, item added to cart)
          navigator.vibrate([35, 60, 65]);
          break;

        case 'warning':
          // Quick double buzz
          navigator.vibrate([40, 50, 40]);
          break;

        case 'error':
          // Triple buzz alert
          navigator.vibrate([70, 40, 70, 40, 90]);
          break;

        default:
          navigator.vibrate(15);
          break;
      }
    } catch {
      // Ignore if user preference or browser security context blocks vibration
    }
  }
}
