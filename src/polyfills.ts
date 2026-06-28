/**
 * Polyfills for browser environment inconsistencies in restricted environments.
 * This must be imported at the very top of the application entry point.
 */

if (typeof window !== 'undefined') {
  // Polyfill for localStorage and sessionStorage under restricted iframe/sandbox environments
  const testStorage = (type: 'localStorage' | 'sessionStorage') => {
    try {
      const storage = window[type];
      if (!storage) return false;
      const testKey = '__storage_test_key__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  const createInMemoryStorage = () => {
    let store: Record<string, string> = {};
    return {
      getItem(key: string): string | null {
        return store[key] !== undefined ? store[key] : null;
      },
      setItem(key: string, value: string): void {
        store[key] = String(value);
      },
      removeItem(key: string): void {
        delete store[key];
      },
      clear(): void {
        store = {};
      },
      key(index: number): string | null {
        const keys = Object.keys(store);
        return keys[index] !== undefined ? keys[index] : null;
      },
      get length(): number {
        return Object.keys(store).length;
      }
    };
  };

  if (!testStorage('localStorage')) {
    console.warn('localStorage is restricted or unavailable, enabling in-memory polyfill fallback');
    try {
      Object.defineProperty(window, 'localStorage', {
        value: createInMemoryStorage(),
        writable: true,
        configurable: true
      });
    } catch (e) {
      console.error('Failed to define localStorage fallback', e);
    }
  }

  if (!testStorage('sessionStorage')) {
    console.warn('sessionStorage is restricted or unavailable, enabling in-memory polyfill fallback');
    try {
      Object.defineProperty(window, 'sessionStorage', {
        value: createInMemoryStorage(),
        writable: true,
        configurable: true
      });
    } catch (e) {
      console.error('Failed to define sessionStorage fallback', e);
    }
  }

  const originalMatchMedia = window.matchMedia;

  window.matchMedia = function(query: string): MediaQueryList {
    let mql: any = null;
    
    try {
      if (typeof originalMatchMedia === 'function') {
        mql = originalMatchMedia(query);
      }
    } catch (e) {
      console.warn('matchMedia failed', e);
    }

    // Ensure we have a robust object to return
    if (!mql || typeof mql !== 'object') {
      mql = {
        matches: false,
        media: query,
        onchange: null,
        addListener: function() {},
        removeListener: function() {},
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function() { return false; },
      };
    }

    // Ensure older addListener/removeListener exist for legacy library support
    // We try to add them if they are missing
    try {
      if (typeof mql.addListener !== 'function') {
        mql.addListener = function(this: any, fn: any) {
          if (typeof this.addEventListener === 'function') {
            this.addEventListener('change', fn);
          } else if (typeof fn === 'function') {
            // Fallback if addEventListener is also missing
            fn({ matches: this.matches, media: this.media });
          }
        };
      }
      if (typeof mql.removeListener !== 'function') {
        mql.removeListener = function(this: any, fn: any) {
          if (typeof this.removeEventListener === 'function') {
            this.removeEventListener('change', fn);
          }
        };
      }
    } catch (e) {
      // Return a wrapped object if the original is frozen/non-extensible
      return {
        get matches() { return mql.matches; },
        get media() { return mql.media; },
        onchange: mql.onchange,
        addListener: function(fn: any) { 
          if (mql.addListener) mql.addListener(fn);
          else if (mql.addEventListener) mql.addEventListener('change', fn);
        },
        removeListener: function(fn: any) {
          if (mql.removeListener) mql.removeListener(fn);
          else if (mql.removeEventListener) mql.removeEventListener('change', fn);
        },
        addEventListener: function(type: any, listener: any, options: any) {
          if (mql.addEventListener) mql.addEventListener(type, listener, options);
        },
        removeEventListener: function(type: any, listener: any, options: any) {
          if (mql.removeEventListener) mql.removeEventListener(type, listener, options);
        },
        dispatchEvent: function(event: any) {
          return mql.dispatchEvent ? mql.dispatchEvent(event) : false;
        }
      } as any;
    }
    
    return mql as MediaQueryList;
  };
}
