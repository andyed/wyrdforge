const SCHEMA_VERSION = 1;

interface StorageEnvelope<T> {
  version: number;
  data: T;
  savedAt: string;
}

export function saveToStorage<T>(key: string, data: T): void {
  const envelope: StorageEnvelope<T> = {
    version: SCHEMA_VERSION,
    data,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    console.warn(`Failed to save ${key} to localStorage`);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envelope: StorageEnvelope<T> = JSON.parse(raw);
    if (envelope.version !== SCHEMA_VERSION) {
      console.warn(`Schema version mismatch for ${key}: expected ${SCHEMA_VERSION}, got ${envelope.version}`);
      return null;
    }
    return envelope.data;
  } catch {
    console.warn(`Failed to load ${key} from localStorage`);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(key);
}
