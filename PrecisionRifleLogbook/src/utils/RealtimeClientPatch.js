/**
 * RealtimeClient Patch - Safe fetch utility
 * Fixes the "constructor is not callable" error in Supabase RealtimeClient
 */

// Safe fetch function that doesn't rely on global fetch being callable
export const createSafeFetch = (customFetch = null) => {
  let _fetch;
  
  try {
    // Try to use the provided custom fetch
    if (customFetch && typeof customFetch === 'function') {
      _fetch = customFetch;
    } else if (typeof global.fetch === 'function') {
      // Use global fetch if available
      _fetch = global.fetch;
    } else if (typeof fetch === 'function') {
      // Use local fetch if available
      _fetch = fetch;
    } else {
      // Fallback to a basic fetch implementation
      _fetch = async (url, options = {}) => {
        console.warn('Using fallback fetch implementation');
        
        // Basic fetch fallback for React Native
        if (typeof global.XMLHttpRequest !== 'undefined') {
          return new Promise((resolve, reject) => {
            const xhr = new global.XMLHttpRequest();
            xhr.open(options.method || 'GET', url, true);
            
            // Set headers
            if (options.headers) {
              Object.keys(options.headers).forEach(key => {
                xhr.setRequestHeader(key, options.headers[key]);
              });
            }
            
            xhr.onload = () => {
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: xhr.getAllResponseHeaders(),
                text: () => Promise.resolve(xhr.responseText),
                json: () => Promise.resolve(JSON.parse(xhr.responseText))
              });
            };
            
            xhr.onerror = () => {
              reject(new Error('Network error'));
            };
            
            xhr.send(options.body);
          });
        } else {
          throw new Error('No fetch implementation available');
        }
      };
    }
  } catch (error) {
    console.error('Error setting up fetch:', error);
    // Provide a minimal fallback
    _fetch = async () => {
      throw new Error('Fetch not available');
    };
  }
  
  return _fetch;
};

// Safe WebSocket creation
export const createSafeWebSocket = (url, protocols = []) => {
  try {
    if (typeof global.WebSocket === 'function') {
      return new global.WebSocket(url, protocols);
    } else if (typeof WebSocket === 'function') {
      return new WebSocket(url, protocols);
    } else {
      throw new Error('WebSocket not available');
    }
  } catch (error) {
    console.error('Error creating WebSocket:', error);
    // Don't throw for known profile creation errors
    if (error.message && (
      error.message.includes('NEED_PROFILE_CREATION') || 
      error.message.includes('PROFILE_CREATION_FAILED') ||
      error.message.includes('USER_CANCELLED')
    )) {
      console.warn('Profile-related error, not throwing:', error.message);
      return null;
    }
    throw error;
  }
};

// Safe URL creation
export const createSafeURL = (url, base = null) => {
  try {
    if (typeof global.URL === 'function') {
      return new global.URL(url, base);
    } else if (typeof URL === 'function') {
      return new URL(url, base);
    } else {
      // Fallback URL parsing
      const urlObj = {
        href: url,
        origin: '',
        protocol: '',
        host: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        searchParams: new Map()
      };
      
      // Basic URL parsing
      const urlMatch = url.match(/^(https?:)\/\/([^\/]+)(.*)$/);
      if (urlMatch) {
        urlObj.protocol = urlMatch[1];
        urlObj.host = urlMatch[2];
        urlObj.hostname = urlMatch[2].split(':')[0];
        urlObj.port = urlMatch[2].split(':')[1] || '';
        urlObj.pathname = urlMatch[3].split('?')[0].split('#')[0];
        urlObj.search = urlMatch[3].split('?')[1]?.split('#')[0] || '';
        urlObj.hash = urlMatch[3].split('#')[1] || '';
        urlObj.origin = `${urlObj.protocol}//${urlObj.host}`;
      }
      
      return urlObj;
    }
  } catch (error) {
    console.error('Error creating URL:', error);
    throw error;
  }
}; 