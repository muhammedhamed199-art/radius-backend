try {
  localStorage.getItem('test');
} catch (e) {
  const memoryStorage = new Map();
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k) => memoryStorage.get(k) || null,
      setItem: (k, v) => memoryStorage.set(k, String(v)),
      removeItem: (k) => memoryStorage.delete(k),
      clear: () => memoryStorage.clear(),
      length: 0,
      key: () => null
    },
    writable: true,
    configurable: true,
    enumerable: true
  });
}
