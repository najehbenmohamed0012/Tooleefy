/**
 * safeStorage.ts
 * Elegant, robust wrapper around browser's localStorage.
 * Catches QuotaExceededError and other storage failures gracefully without crashing the app.
 * Falls back to an in-memory RAM cache if storage is full or disabled.
 */

// In-memory fallback cache for when localStorage is full or unavailable
const memoryFallback = new Map<string, string>();

export const safeStorage = {
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      // Synchronize in-memory fallback
      memoryFallback.set(key, value);
      return true;
    } catch (error: any) {
      console.warn(`[SafeStorage] localStorage write for "${key}" failed, checking quota:`, error.message);

      // Detect Quota Exceeded error types across different browsers
      const isQuotaError = 
        error.name === "QuotaExceededError" || 
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.code === 22 ||
        error.code === 1014;

      if (isQuotaError) {
        console.warn(`[SafeStorage] Quota exceeded. Attempting self-healing recovery...`);
        try {
          // Clear non-essential cached objects
          localStorage.removeItem("admin_stats_cache");
          localStorage.removeItem("registered_users_cache");
          localStorage.removeItem("local_activities");
          
          // Try to set the item again after cleanup
          localStorage.setItem(key, value);
          memoryFallback.set(key, value);
          console.info(`[SafeStorage] Self-healing recovery successful for "${key}".`);
          return true;
        } catch (retryError: any) {
          console.warn(`[SafeStorage] Recovery failed for "${key}". Saving securely to in-memory RAM fallback.`);
        }
      }

      // Save to memory fallback so the app continues working flawlessly
      memoryFallback.set(key, value);
      return true;
    }
  },

  getItem(key: string): string | null {
    // Check in-memory fallback first to get the most updated/live values
    if (memoryFallback.has(key)) {
      return memoryFallback.get(key) || null;
    }

    try {
      const val = localStorage.getItem(key);
      if (val !== null) {
        // Cache in memory for faster subsequent accesses
        memoryFallback.set(key, val);
      }
      return val;
    } catch (error: any) {
      console.warn(`[SafeStorage] Failed to read key "${key}":`, error.message);
      return null;
    }
  },

  removeItem(key: string): boolean {
    memoryFallback.delete(key);
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error: any) {
      console.warn(`[SafeStorage] Failed to remove key "${key}":`, error.message);
      return false;
    }
  },

  clear(): boolean {
    memoryFallback.clear();
    try {
      localStorage.clear();
      return true;
    } catch (error: any) {
      console.warn(`[SafeStorage] Failed to clear localStorage:`, error.message);
      return false;
    }
  }
};

// High-performance asynchronous IndexedDB cache for storing large base64 cover images without size quotas.
export const dbCache = {
  dbPromise: null as Promise<IDBDatabase> | null,

  getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("TooleefyCacheDB", 1);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
    return this.dbPromise;
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction("images", "readonly");
        const store = transaction.objectStore("images");
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction("images", "readwrite");
        const store = transaction.objectStore("images");
        const request = store.put(value, key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }
};

