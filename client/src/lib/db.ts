/**
 * IndexedDB storage layer for vocabulary entries
 */

export interface VocabularyEntry {
  id: string;
  word: string;
  language: 'en' | 'zh';
  translation: string;
  createdAt: number;
  updatedAt: number;
  audioUrl?: string;
}

const DB_NAME = 'VocabDB';
const DB_VERSION = 1;
const STORE_NAME = 'vocabulary';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('language', 'language', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

function getDB(): IDBDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

export async function addEntry(entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<VocabularyEntry> {
  const database = getDB();
  const now = Date.now();
  const newEntry: VocabularyEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(newEntry);

    request.onerror = () => {
      reject(new Error('Failed to add entry'));
    };

    request.onsuccess = () => {
      resolve(newEntry);
    };
  });
}

export async function updateEntry(id: string, updates: Partial<Omit<VocabularyEntry, 'id' | 'createdAt'>>): Promise<VocabularyEntry> {
  const database = getDB();
  const entry = await getEntry(id);
  
  if (!entry) {
    throw new Error('Entry not found');
  }

  const updatedEntry: VocabularyEntry = {
    ...entry,
    ...updates,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(updatedEntry);

    request.onerror = () => {
      reject(new Error('Failed to update entry'));
    };

    request.onsuccess = () => {
      resolve(updatedEntry);
    };
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const database = getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      reject(new Error('Failed to delete entry'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

export async function getEntry(id: string): Promise<VocabularyEntry | null> {
  const database = getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => {
      reject(new Error('Failed to get entry'));
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

export async function getAllEntries(): Promise<VocabularyEntry[]> {
  const database = getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error('Failed to get all entries'));
    };

    request.onsuccess = () => {
      const entries = request.result as VocabularyEntry[];
      resolve(entries.sort((a, b) => b.createdAt - a.createdAt));
    };
  });
}

export async function getEntriesByLanguage(language: 'en' | 'zh'): Promise<VocabularyEntry[]> {
  const database = getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('language');
    const request = index.getAll(language);

    request.onerror = () => {
      reject(new Error('Failed to get entries by language'));
    };

    request.onsuccess = () => {
      const entries = request.result as VocabularyEntry[];
      resolve(entries.sort((a, b) => b.createdAt - a.createdAt));
    };
  });
}

export async function searchEntries(query: string): Promise<VocabularyEntry[]> {
  const allEntries = await getAllEntries();
  const lowerQuery = query.toLowerCase();
  
  return allEntries.filter(entry =>
    entry.word.toLowerCase().includes(lowerQuery) ||
    entry.translation.toLowerCase().includes(lowerQuery)
  );
}
