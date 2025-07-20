/**
 * Global Patches - Fix constructor issues in React Native
 * This file must be imported at the very top of App.tsx
 */

// Patch Error constructor if it's not callable
if (typeof Error !== 'function' || !Error.prototype) {
  console.warn('Patching Error constructor');
  global.Error = function(message = 'Unknown error') {
    const errorObj = {
      name: 'Error',
      message: message,
      stack: 'No stack trace available',
      toString: function() {
        return `${this.name}: ${this.message}`;
      }
    };
    Object.setPrototypeOf(errorObj, Error.prototype);
    return errorObj;
  };
  Error.prototype = {
    name: 'Error',
    message: '',
    stack: '',
    toString: function() {
      return `${this.name}: ${this.message}`;
    }
  };
}

// Patch fetch if it's not available
if (typeof global.fetch !== 'function') {
  console.warn('Patching global.fetch');
  global.fetch = async (url, options = {}) => {
    console.warn('Using fallback fetch implementation');
    
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

// Patch WebSocket if it's not available
if (typeof global.WebSocket !== 'function') {
  console.warn('Patching global.WebSocket');
  global.WebSocket = function(url, protocols = []) {
    console.warn('WebSocket not available, using mock');
    const mockWebSocket = {
      url: url,
      readyState: 3, // CLOSED
      protocol: protocols[0] || '',
      extensions: '',
      bufferedAmount: 0,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      close: function() {
        this.readyState = 3;
        if (this.onclose) this.onclose({ code: 1000, reason: 'Mock close' });
      },
      send: function(data) {
        console.warn('Mock WebSocket send:', data);
      },
      addEventListener: function(type, listener) {
        if (type === 'open') this.onopen = listener;
        if (type === 'close') this.onclose = listener;
        if (type === 'message') this.onmessage = listener;
        if (type === 'error') this.onerror = listener;
      },
      removeEventListener: function(type, listener) {
        // Mock implementation
      }
    };
    return mockWebSocket;
  };
}

// Patch URL if it's not available
if (typeof global.URL !== 'function') {
  console.warn('Patching global.URL');
  global.URL = function(url, base = null) {
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
  };
}

// Patch console.error to prevent LogBox crashes
const originalConsoleError = console.error;
console.error = function(...args) {
  try {
    originalConsoleError.apply(console, args);
  } catch (error) {
    // Fallback logging if console.error fails
    console.log('[ERROR]', ...args);
  }
};

console.log('✅ Global patches applied successfully'); 