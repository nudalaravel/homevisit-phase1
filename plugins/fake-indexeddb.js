// Fake IndexedDB implementation for development
export default function () {
  // Only use fake IndexedDB in development
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // Check if real IndexedDB is available
  if (
    typeof indexedDB !== "undefined" &&
    indexedDB &&
    typeof indexedDB.open === "function"
  ) {
    return;
  }

  console.log("Using fake IndexedDB for development");

  // Create simple fake IndexedDB implementation
  const fakeIndexedDB = {
    open: function (name, version) {
      const request = {
        result: null,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      };

      // Simulate async operation
      setTimeout(() => {
        if (version > 1) {
          // Simulate upgrade needed
          if (request.onupgradeneeded) {
            const event = {
              target: { result: createFakeDB(name) },
              oldVersion: 0,
              newVersion: version,
            };
            request.onupgradeneeded(event);
          }
        }

        // Simulate success
        request.result = createFakeDB(name);
        if (request.onsuccess) {
          request.onsuccess({ target: request });
        }
      }, 10);

      return request;
    },
  };

  // Create fake database
  function createFakeDB(name) {
    const stores = new Map();

    return {
      name,
      version: 1,
      objectStoreNames: {
        contains: (storeName) => stores.has(storeName),
        length: stores.size,
      },
      createObjectStore: function (name, options) {
        const store = new Map();
        stores.set(name, store);

        return {
          createIndex: function (indexName, keyPath, options) {
            // Fake index creation
            return this;
          },
        };
      },
      transaction: function (storeNames, mode) {
        const stores = new Map();

        return {
          objectStore: function (storeName) {
            if (!stores.has(storeName)) {
              stores.set(storeName, new Map());
            }

            const store = stores.get(storeName);

            return {
              add: function (data) {
                const request = {
                  result: null,
                  error: null,
                  onsuccess: null,
                  onerror: null,
                };

                setTimeout(() => {
                  try {
                    const key = data.id || Date.now();
                    store.set(key, data);
                    request.result = key;
                    if (request.onsuccess) {
                      request.onsuccess({ target: request });
                    }
                  } catch (error) {
                    request.error = error;
                    if (request.onerror) {
                      request.onerror({ target: request });
                    }
                  }
                }, 1);

                return request;
              },
              get: function (key) {
                const request = {
                  result: null,
                  error: null,
                  onsuccess: null,
                  onerror: null,
                };

                setTimeout(() => {
                  try {
                    request.result = store.get(key) || undefined;
                    if (request.onsuccess) {
                      request.onsuccess({ target: request });
                    }
                  } catch (error) {
                    request.error = error;
                    if (request.onerror) {
                      request.onerror({ target: request });
                    }
                  }
                }, 1);

                return request;
              },
              getAll: function () {
                const request = {
                  result: null,
                  error: null,
                  onsuccess: null,
                  onerror: null,
                };

                setTimeout(() => {
                  try {
                    request.result = Array.from(store.values());
                    if (request.onsuccess) {
                      request.onsuccess({ target: request });
                    }
                  } catch (error) {
                    request.error = error;
                    if (request.onerror) {
                      request.onerror({ target: request });
                    }
                  }
                }, 1);

                return request;
              },
              put: function (data) {
                const request = {
                  result: null,
                  error: null,
                  onsuccess: null,
                  onerror: null,
                };

                setTimeout(() => {
                  try {
                    const key = data.id || Date.now();
                    store.set(key, data);
                    request.result = key;
                    if (request.onsuccess) {
                      request.onsuccess({ target: request });
                    }
                  } catch (error) {
                    request.error = error;
                    if (request.onerror) {
                      request.onerror({ target: request });
                    }
                  }
                }, 1);

                return request;
              },
              delete: function (key) {
                const request = {
                  result: null,
                  error: null,
                  onsuccess: null,
                  onerror: null,
                };

                setTimeout(() => {
                  try {
                    store.delete(key);
                    request.result = undefined;
                    if (request.onsuccess) {
                      request.onsuccess({ target: request });
                    }
                  } catch (error) {
                    request.error = error;
                    if (request.onerror) {
                      request.onerror({ target: request });
                    }
                  }
                }, 1);

                return request;
              },
              clear: function () {
                const request = {
                  result: null,
                  error: null,
                  onsuccess: null,
                  onerror: null,
                };

                setTimeout(() => {
                  try {
                    store.clear();
                    request.result = undefined;
                    if (request.onsuccess) {
                      request.onsuccess({ target: request });
                    }
                  } catch (error) {
                    request.error = error;
                    if (request.onerror) {
                      request.onerror({ target: request });
                    }
                  }
                }, 1);

                return request;
              },
            };
          },
        };
      },
      close: function () {
        // Fake close
      },
    };
  }

  // Replace global indexedDB
  if (typeof global !== "undefined") {
    global.indexedDB = fakeIndexedDB;
  }
  if (typeof window !== "undefined") {
    window.indexedDB = fakeIndexedDB;
  }

  // Also set on globalThis for modern environments
  if (typeof globalThis !== "undefined") {
    globalThis.indexedDB = fakeIndexedDB;
  }
}
