/**
 * UUID Utility
 * Generates unique identifiers for models
 */

export function generateUUID() {
  // Generate a simple UUID v4-like string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateShortId() {
  // Generate a shorter ID for display purposes
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}