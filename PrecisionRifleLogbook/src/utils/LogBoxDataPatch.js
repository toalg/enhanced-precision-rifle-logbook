/**
 * LogBoxData Patch - Safe error creation utility
 * Fixes the "constructor is not callable" error in React Native LogBox
 */

// Safe error creation that doesn't rely on Error constructor being callable
export const createSafeError = (message = 'Unknown error') => {
  try {
    // Try to create a proper Error object
    return new Error(message);
  } catch (error) {
    // Fallback to a plain object with error properties
    const errorObj = {
      name: 'Error',
      message: message,
      stack: new Error().stack || 'No stack trace available',
      toString: function() {
        return `${this.name}: ${this.message}`;
      }
    };
    
    // Make it look like an Error object
    Object.setPrototypeOf(errorObj, Error.prototype);
    return errorObj;
  }
};

// Safe stack trace extraction
export const getSafeStackTrace = () => {
  try {
    return new Error().stack;
  } catch (error) {
    return 'No stack trace available';
  }
};

// Safe error logging
export const logSafeError = (error, context = '') => {
  try {
    console.error(`[${context}]`, error);
  } catch (logError) {
    // Fallback logging
    console.log(`[${context}] Error occurred but could not be logged properly`);
  }
}; 