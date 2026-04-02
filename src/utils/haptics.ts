import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Haptics only fire in native context (iOS / Android WebView).
// On web the calls are silently ignored so no guard needed — but we catch
// any plugin-not-available errors to keep the web experience clean.

/** Light tap — use for navigation, selections, toggle on */
export const hapticLight = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Not available on web or device without haptic hardware
  }
};

/** Medium tap — use for button presses */
export const hapticMedium = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
};

/** Heavy tap — use for destructive actions (delete confirm) */
export const hapticHeavy = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {}
};

/** Success pattern — use after a save / add succeeds */
export const hapticSuccess = async () => {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
};

/** Error pattern — use when an action fails */
export const hapticError = async () => {
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch {}
};

/** Warning pattern — use for caution actions */
export const hapticWarning = async () => {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {}
};
